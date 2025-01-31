import os
import logging
from dotenv import load_dotenv

# # Logging config
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# Base directory of the project
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
#print(basedir)

# Load environment variables from .env file
dotenv_path = os.path.join(basedir, ".env")
load_dotenv()

class Config:
    RUN_MODE = os.getenv('RUN_MODE_LOCATION')
    #print(f'RUN_MODE_LOCATION: {RUN_MODE_LOCATION}')
    
    

# Set DB config values based on RUN_MODE_LOCATION
if Config.RUN_MODE == 'local':
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI_LOCAL')
    REACT_BUILD_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build")}'
    REACT_STATIC_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build", "static")}'
elif Config.RUN_MODE == 'docker':
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI_DOCKER')
    REACT_BUILD_DIR = f'{os.path.join(basedir, "app", "build")}'
    REACT_STATIC_DIR = f'{os.path.join(basedir, "app", "build", "static")}'
elif Config.RUN_MODE == 'prod':
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI_PROD')
    REACT_BUILD_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build")}'
    REACT_STATIC_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build", "static")}'
elif Config.RUN_MODE == 'prod_local':
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI_PROD_LOCAL')
    REACT_BUILD_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build")}'
    REACT_STATIC_DIR = f'{os.path.join(basedir, "satisfactory_tracker", "build", "static")}'
else:
    # Throw an error if the RUN_MODE_LOCATION is not set
    raise ValueError('RUN_MODE_LOCATION environment variable not set. Please set RUN_MODE_LOCATION to "local", "docker", "prod", or "prod_local"')

#print(f'SQLALCHEMY_DATABASE_URI: {SQLALCHEMY_DATABASE_URI}')

SECRET_KEY = os.getenv('SECRET_KEY') or 'dev_default_secret_key'
SESSION_TYPE = 'filesystem'

SQLALCHEMY_TRACK_MODIFICATIONS = False

# Recaptcha keys
REACT_APP_RECAPTCHA_SITE_KEY = os.getenv('REACT_APP_RECAPTCHA_SITE_KEY')
RECAPTCHA_API_KEY = os.getenv('RECAPTCHA_API_KEY')

# .sav file upload config
UPLOAD_FOLDER = "uploads"  # Define where files will be stored
ALLOWED_EXTENSIONS = {"sav"}  # Define allowed file extensions

# Table and column whitelist
VALID_TABLES = os.getenv('VALID_TABLES')
VALID_COLUMNS = os.getenv('VALID_COLUMNS')