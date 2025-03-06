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

# Flask-login variables
SECRET_KEY = os.getenv('SECRET_KEY') or 'dev_default_secret_key'
SESSION_TYPE = 'filesystem'

SQLALCHEMY_TRACK_MODIFICATIONS = False

# Recaptcha keys
REACT_APP_RECAPTCHA_SITE_KEY = os.getenv('REACT_APP_RECAPTCHA_SITE_KEY')
RECAPTCHA_API_KEY = os.getenv('RECAPTCHA_API_KEY')

# .sav file upload config
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')  # Define upload folder for save files
ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS')  # Define allowed file extensions

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") # GitHub Personal Access Token
GITHUB_REPO = os.getenv("GITHUB_REPO") # GitHub Repository

# Table and column whitelist
VALID_TABLES = {'alternate_recipe', 'data_validation', 'machine', 'machine_level', 'miner_supply', 'node_purity', 'part', 'power_shards', 
                'recipe', 'recipe_mapping', 'resource_node', 'tracker', 'user', 'user_save', 'user_selected_recipe', 'conveyor_level' , 'user_save_connections', 'user_save_conveyors'
                }
VALID_COLUMNS = {'id', 'selected', 'column_name', 'description', 'table_name', 'value', 'machine_level_id', 'machine_name', 'save_file_class_name', 
                 'machine_level', 'base_supply_pm', 'node_purity_id', 'node_purity', 'save_file_path_name', 'category', 'level', 'part_name', 
                 'output_increase', 'quantity', 'base_demand_pm', 'base_input', 'base_production_type', 'byproduct', 'byproduct_supply_pm', 
                 'ingredient_count', 'part_id', 'produced_in_automated', 'produced_in_manual', 'recipe_name', 'source_level', 'save_file_recipe',
                 'created_at', 'target_quantity', 'updated_at', 'user_id', 'email', 'is_verified', 'password', 'role', 'username', 'machine_id', 
                 'machine_power_modifier', 'resource_node_id', 'sav_file_name', 'recipe_id',
                 'conveyor_level_id', 'supply_pm', 'connected_component', 'connection_inventory', 'direction', 'conveyor_first_belt', 'conveyor_last_belt',
                 'current_progress', 'input_inventory', 'output_inventory', 'time_since_last_change', 'production_duration', 'productivity_measurement_duration', 
                 'productivity_monitor_enabled', 'is_producing'
                }