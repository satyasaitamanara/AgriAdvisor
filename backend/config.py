from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}:{os.getenv('MYSQL_PORT')}/{os.getenv('MYSQL_DB')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    WEATHER_API_KEY = os.getenv("OPENWEATHER_KEY")
    MARKET_API_KEY = os.getenv("MARKET_API_KEY")
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_KEY')

    ML_MODEL_PATH = os.getenv("ML_MODEL_PATH", "./ml_models/crop_model.pkl")
    PEST_MODEL_PATH = os.getenv("PEST_MODEL_PATH", "./ml_models/pest_model.h5")

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # ================================
    # EMAIL CONFIG (Password Reset)
    # ================================
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    # ================================
    # FRONTEND RESET URL
    # ================================
    FRONTEND_RESET_URL = os.getenv("FRONTEND_RESET_URL", "http://localhost:3000")
    # SHAP configuration
    SHAP_SAMPLES = 100 
    # NEW: SHAP configuration
    SHAP_BACKGROUND_SAMPLES = 100    