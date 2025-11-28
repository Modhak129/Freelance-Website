from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from sqlalchemy import MetaData

# --- FIX: Define Naming Convention ---
# This ensures all constraints (Foreign Keys, etc.) have explicit names,
# preventing the "ValueError: Constraint must have a name" error.
convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)
# -------------------------------------

# Initialize extensions with the metadata
db = SQLAlchemy(metadata=metadata)
ma = Marshmallow()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    """
    Application factory pattern.
    Initializes the Flask app, extensions, and blueprints.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS for the React frontend
    # Allow any origin during development
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Import and register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # --- AUTO-INITIALIZE DATABASE ---
    with app.app_context():
        from app import models
        db.create_all()
        print("Database tables checked/created.")

    # Add a CLI command
    @app.cli.command("init-db")
    def init_db_command():
        with app.app_context():
            from app import models
            db.create_all()
        print("Initialized the database.")

    return app