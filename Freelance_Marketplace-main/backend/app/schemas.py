from app import ma
from app.models import User, Project, Bid, Review
from marshmallow import fields

class UserPublicSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "is_freelancer", "bio", "skills",
            "avg_rating", "completion_rate", "on_time_rate", "portfolio_score",
            # NEW STATS
            "on_time_count", "delayed_count", "projects_completed"
        )

class BidSchema(ma.SQLAlchemyAutoSchema):
    freelancer = fields.Nested(UserPublicSchema)
    class Meta:
        model = Bid
        include_fk = True
        load_instance = True
        fields = ("id", "amount", "proposal", "created_at", "proposed_timeline_days", "project_id", "freelancer", "freelancer_id")

class ReviewSchema(ma.SQLAlchemyAutoSchema):
    reviewer = fields.Nested(UserPublicSchema)
    reviewee = fields.Nested(UserPublicSchema)
    class Meta:
        model = Review
        include_fk = True
        load_instance = True
        fields = ("id", "rating", "comment", "created_at", "project_id", "reviewer", "reviewee", "reviewer_id", "reviewee_id")

class ProjectSchema(ma.SQLAlchemyAutoSchema):
    client = fields.Nested(UserPublicSchema)
    freelancer = fields.Nested(UserPublicSchema, allow_none=True)
    bids = fields.Nested(BidSchema, many=True)
    reviews = fields.Nested(ReviewSchema, many=True)
    class Meta:
        model = Project
        include_fk = True
        load_instance = True
        fields = (
            "id", "title", "description", "budget", "status", "created_at",
            "required_skills", "client", "freelancer", "bids", "reviews", "accepted_bid_id",
            # NEW TIMELINE FIELDS
            "deadline_days", "started_at", "completed_at"
        )

class UserSchema(ma.SQLAlchemyAutoSchema):
    reviews_received = fields.Nested(ReviewSchema, many=True)
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",)
    password = fields.String(load_only=True)