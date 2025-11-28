from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Project, Bid, Review, ExternalProfile
from app.schemas import UserSchema, ProjectSchema, BidSchema, ReviewSchema
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import or_
from app.ranking_logic import calculate_ranked_bids
from app.external.freelancer import fetch_freelancer_rating
from datetime import datetime, timedelta

# Initialize Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)
bid_schema = BidSchema()
bids_schema = BidSchema(many=True)
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

api_bp = Blueprint('api', __name__)

def get_user_from_jwt():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

def update_user_ranking(user_id):
    user = User.query.get(user_id)
    if not user: return
    reviews = user.reviews_received.all()
    if reviews:
        total_rating = sum(r.rating for r in reviews)
        user.avg_rating = round(total_rating / len(reviews), 2)
    db.session.commit()

# --- AUTH ---
@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first() or User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Email or username already exists"}), 400
    new_user = User(username=data['username'], email=data['email'], is_freelancer=data.get('is_freelancer', False))
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return user_schema.dump(new_user), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user=user_schema.dump(user)), 200
    return jsonify({"msg": "Bad username or password"}), 401

# --- USER ---
@api_bp.route('/user/<int:id>', methods=['GET'])
def get_user_profile(id):
    user = User.query.get_or_404(id)
    user_data = user_schema.dump(user)
    
    # Inject External Profile
    ext = ExternalProfile.query.filter_by(user_id=user.id, provider='freelancer').first()
    if ext:
        user_data['freelancer_username'] = ext.external_username
        user_data['external_rating'] = ext.rating
        user_data['external_reviews_count'] = ext.reviews
    
    if user.is_freelancer:
        accepted_projects = Project.query.join(Bid, Project.accepted_bid_id == Bid.id).filter(Bid.freelancer_id == user.id).order_by(Project.created_at.desc()).all()
        user_data['accepted_projects'] = projects_schema.dump(accepted_projects)
    else:
        posted_projects = user.projects_as_client.order_by(Project.created_at.desc()).all()
        user_data['posted_projects'] = projects_schema.dump(posted_projects)
        
    user_data['reviews_received'] = reviews_schema.dump(user.reviews_received.order_by(Review.created_at.desc()).all())
    return jsonify(user_data), 200

@api_bp.route('/user/profile', methods=['GET', 'PUT'])
@jwt_required()
def my_profile():
    user = get_user_from_jwt()
    if request.method == 'GET':
        # Re-use logic from get_user_profile but for current user
        return get_user_profile(user.id)

    if request.method == 'PUT':
        data = request.get_json()
        user.bio = data.get('bio', user.bio)
        user.skills = data.get('skills', user.skills)
        if 'password' in data: user.set_password(data['password'])
        db.session.commit()
        return user_schema.dump(user), 200

@api_bp.route("/user/import_freelancer_rating", methods=["POST"])
@jwt_required()
def import_freelancer_rating():
    user = get_user_from_jwt()
    data = request.get_json() or {}
    freelancer_name = data.get("username")
    if not freelancer_name: return jsonify({"error": "username is required"}), 400

    existing = ExternalProfile.query.filter_by(user_id=user.id, provider="freelancer").first()
    if existing: return jsonify({"ok": False, "error": "Already imported."}), 400

    result = fetch_freelancer_rating(freelancer_name)
    if not result: return jsonify({"error": "Unable to fetch profile"}), 404

    new_ext = ExternalProfile(user_id=user.id, provider="freelancer", external_username=freelancer_name, rating=result["rating"], reviews=result["reviews"], raw_data=result.get("raw", ""))
    db.session.add(new_ext)
    if result["rating"] and (not user.avg_rating or user.avg_rating == 0.0):
        user.avg_rating = float(result["rating"])
    db.session.commit()
    return jsonify({"ok": True, "rating": result["rating"]}), 200

# --- PROJECTS ---
@api_bp.route('/projects', methods=['GET'])
def get_projects():
    try:
        skill_query = request.args.get('skill')
        query = Project.query.filter_by(status='open')
        if skill_query:
            query = query.filter(Project.required_skills.like(f"%{skill_query}%"))
        return projects_schema.dump(query.order_by(Project.created_at.desc()).all()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user = get_user_from_jwt()
    if user.is_freelancer: return jsonify({"msg": "Only clients can post"}), 403
    data = request.get_json()
    
    # Validate Deadline
    deadline = int(data.get('deadline_days', 7))
    if deadline < 2: return jsonify({"msg": "Minimum 2 days required"}), 400

    new_project = Project(
        title=data['title'], 
        description=data['description'], 
        budget=data['budget'], 
        client_id=user.id, 
        required_skills=data.get('required_skills'),
        deadline_days=deadline
    )
    db.session.add(new_project)
    db.session.commit()
    return project_schema.dump(new_project), 201

# --- REPLACE THE OLD 'project_handler' WITH THESE TWO FUNCTIONS ---

@api_bp.route('/project/<int:id>', methods=['GET'])
@jwt_required(optional=True)  # Allows guests to view projects
def get_project_details(id):
    project = Project.query.get_or_404(id)
    return project_schema.dump(project), 200

@api_bp.route('/project/<int:id>', methods=['PUT'])
@jwt_required()  # <--- STRICT: Only logged-in users can edit
def update_project_details(id):
    project = Project.query.get_or_404(id)
    user = get_user_from_jwt()

    if project.client_id != user.id:
        return jsonify({"msg": "Not authorized"}), 403

    data = request.get_json()
    
    # Update fields
    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    project.budget = data.get('budget', project.budget)
    project.status = data.get('status', project.status)
    project.required_skills = data.get('required_skills', project.required_skills)
    
    if 'deadline_days' in data:
        project.deadline_days = int(data['deadline_days'])

    db.session.commit()
    return project_schema.dump(project), 200

# --- BIDS & ACTIONS ---
@api_bp.route('/project/<int:id>/bid', methods=['POST'])
@jwt_required()
def place_bid(id):
    user = get_user_from_jwt()
    project = Project.query.get_or_404(id)
    if not user.is_freelancer: return jsonify({"msg": "Only freelancers can bid"}), 403
    if project.status != 'open': return jsonify({"msg": "Project not open"}), 400
    
    existing = Bid.query.filter_by(project_id=id, freelancer_id=user.id).first()
    if existing: return jsonify({"msg": "Already bid"}), 400

    data = request.get_json()
    new_bid = Bid(amount=data['amount'], proposal=data['proposal'], project_id=id, freelancer_id=user.id, proposed_timeline_days=data.get('proposed_timeline_days'))
    db.session.add(new_bid)
    db.session.commit()
    return bid_schema.dump(new_bid), 201

@api_bp.route('/project/<int:id>/accept_bid', methods=['POST'])
@jwt_required()
def accept_bid(id):
    project = Project.query.get_or_404(id)
    user = get_user_from_jwt()
    if project.client_id != user.id: return jsonify({"msg": "Not authorized"}), 403
    
    data = request.get_json()
    bid = Bid.query.get_or_404(data.get('bid_id'))
    
    freelancer = User.query.get(bid.freelancer_id)
    if freelancer: freelancer.projects_accepted += 1
    
    project.freelancer_id = bid.freelancer_id
    project.status = 'in_progress'
    project.accepted_bid_id = bid.id
    project.started_at = datetime.utcnow() # START TIMER
    
    db.session.commit() 
    return project_schema.dump(project), 200

@api_bp.route('/project/<int:id>/complete', methods=['POST'])
@jwt_required()
def freelancer_complete_project(id):
    project = Project.query.get_or_404(id)
    user = get_user_from_jwt()
    if project.freelancer_id != user.id: return jsonify({"msg": "Not authorized"}), 403
    
    project.completed_at = datetime.utcnow()
    
    # Calculate On-Time vs Delayed
    if project.started_at and project.deadline_days:
        expected = project.started_at + timedelta(days=project.deadline_days)
        if project.completed_at <= expected:
            user.on_time_count += 1
        else:
            user.delayed_count += 1
        
        total = user.on_time_count + user.delayed_count
        if total > 0:
            user.on_time_rate = round((user.on_time_count / total) * 100, 1)

    project.status = 'pending_review'
    db.session.commit()
    return project_schema.dump(project), 200

@api_bp.route('/rank_bids', methods=['POST'])
def rank_bids():
    data = request.get_json()
    project = Project.query.get(data.get('project_id'))
    if not project: return jsonify({"error": "Project not found"}), 404
    bids = Bid.query.filter_by(project_id=project.id).all()
    
    ranking_data = calculate_ranked_bids(project, bids, data.get('priority', 'balanced'))
    if "error" in ranking_data: return jsonify(ranking_data), 404
    return jsonify(ranking_data), 200

# --- REVIEWS (POST ONLY AFTER COMPLETION) ---
@api_bp.route('/project/<int:id>/review', methods=['POST'])
@jwt_required()
def post_review(id):
    project = Project.query.get_or_404(id)
    user = get_user_from_jwt()
    data = request.get_json()
    
    # Check if project is truly completed by client (or pending review if allowing early reviews)
    # Usually reviews happen after client accepts work
    # if project.status != 'completed': return jsonify({"msg": "Project not completed"}), 400

    # Determine roles
    if user.id == project.client_id:
        reviewee_id = project.freelancer_id
    elif user.id == project.freelancer_id:
        reviewee_id = project.client_id
    else:
        return jsonify({"msg": "Not authorized"}), 403

    if Review.query.filter_by(project_id=id, reviewer_id=user.id).first():
        return jsonify({"msg": "Already reviewed"}), 400

    review = Review(rating=data['rating'], comment=data.get('comment'), project_id=id, reviewer_id=user.id, reviewee_id=reviewee_id)
    db.session.add(review)
    db.session.commit()
    update_user_ranking(reviewee_id)
    return review_schema.dump(review), 201