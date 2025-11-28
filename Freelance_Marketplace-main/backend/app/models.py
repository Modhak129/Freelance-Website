from datetime import datetime
from app import db 
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_freelancer = db.Column(db.Boolean, default=False, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    skills = db.Column(db.Text, nullable=True)

    # --- Ratings & Stats ---
    avg_rating = db.Column(db.Float, default=0.0)
    completion_rate = db.Column(db.Float, default=0.0)
    on_time_rate = db.Column(db.Float, default=0.0)
    portfolio_score = db.Column(db.Float, default=0.0)

    # --- Performance Counters (NEW) ---
    projects_accepted = db.Column(db.Integer, default=0, nullable=False)
    projects_completed = db.Column(db.Integer, default=0, nullable=False)
    on_time_count = db.Column(db.Integer, default=0)
    delayed_count = db.Column(db.Integer, default=0)

    # Relationships
    projects_as_client = db.relationship('Project', foreign_keys='Project.client_id', back_populates='client', lazy='dynamic')
    projects_as_freelancer = db.relationship('Project', foreign_keys='Project.freelancer_id', back_populates='freelancer', lazy='dynamic')
    bids = db.relationship('Bid', back_populates='freelancer', lazy='dynamic', cascade="all, delete-orphan", foreign_keys='Bid.freelancer_id')
    reviews_given = db.relationship('Review', foreign_keys='Review.reviewer_id', back_populates='reviewer', lazy='dynamic')
    reviews_received = db.relationship('Review', foreign_keys='Review.reviewee_id', back_populates='reviewee', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='open', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    required_skills = db.Column(db.Text, nullable=True)

    # --- Timeline Fields (NEW) ---
    deadline_days = db.Column(db.Integer, default=7) # Set by client
    started_at = db.Column(db.DateTime, nullable=True) # Set when bid accepted
    completed_at = db.Column(db.DateTime, nullable=True) # Set when completed

    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    accepted_bid_id = db.Column(db.Integer, db.ForeignKey('bid.id', use_alter=True), nullable=True)

    client = db.relationship('User', foreign_keys=[client_id], back_populates='projects_as_client')
    freelancer = db.relationship('User', foreign_keys=[freelancer_id], back_populates='projects_as_freelancer')
    bids = db.relationship('Bid', back_populates='project', lazy='dynamic', cascade="all, delete-orphan", foreign_keys='Bid.project_id')
    reviews = db.relationship('Review', back_populates='project', lazy='dynamic', cascade="all, delete-orphan")
    accepted_bid = db.relationship('Bid', foreign_keys=[accepted_bid_id], uselist=False, post_update=True)

    def __repr__(self):
        return f'<Project {self.title}>'


class Bid(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    proposal = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    proposed_timeline_days = db.Column(db.Integer, nullable=True)

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    project = db.relationship('Project', back_populates='bids', foreign_keys=[project_id])
    freelancer = db.relationship('User', back_populates='bids', foreign_keys=[freelancer_id])

    def __repr__(self):
        return f'<Bid {self.amount} on Project {self.project_id}>'


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    project = db.relationship('Project', back_populates='reviews')
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], back_populates='reviews_given')
    reviewee = db.relationship('User', foreign_keys=[reviewee_id], back_populates='reviews_received')

    def __repr__(self):
        return f'<Review {self.rating}/5 for Project {self.project_id}>'

class ExternalProfile(db.Model):
    __tablename__ = "external_profile"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    provider = db.Column(db.String(50), nullable=False)
    external_username = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Float)
    reviews = db.Column(db.Integer)
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)
    raw_data = db.Column(db.Text)
    user = db.relationship("User", backref=db.backref("external_profiles", lazy=True))