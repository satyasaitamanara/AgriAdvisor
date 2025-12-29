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
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"  # Use FLASK_DEBUG instead of FLASK_ENV
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
    MARKET_API_KEY = os.getenv("MARKET_API_KEY")
    ML_MODEL_PATH = os.getenv("ML_MODEL_PATH", "./ml_models/crop_model.pkl")
    PEST_MODEL_PATH = os.getenv("PEST_MODEL_PATH", "./ml_models/pest_model.h5")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size