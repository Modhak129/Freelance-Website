import os
from dotenv import load_dotenv

# Flask app secrets
SECRET_KEY="dev_secret_key_1234567890!@#$"
JWT_SECRET_KEY="dev_jwt_secret_key_0987654321!@#$"


load_dotenv()

class Config:
    """Base configuration."""
      # Get the database URL from the environment
    uri = os.environ.get('DATABASE_URL')
    
    # Fix the URL if it starts with 'postgres://' (common on cloud hosts)
    if uri and uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
        
    # Fallback to SQLite if no URL is found (for local testing)
    SQLALCHEMY_DATABASE_URI = uri or 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or "dev_secret_key_1234567890!@#$"
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or "dev_jwt_secret_key_0987654321!@#$"
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False