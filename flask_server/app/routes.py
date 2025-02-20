"""ROUTES - Define the routes for the Flask app."""
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import text
from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker
from flask import send_from_directory
import os
import uuid
import logging
from logging.handlers import RotatingFileHandler
import math
import json
from .models import User, Tracker, User_Save, Part, Recipe, Machine, Machine_Level, Node_Purity, Resource_Node, UserSettings, User_Save_Pipes
from sqlalchemy.exc import SQLAlchemyError
from . import db
from .build_tree import build_tree
from .build_connection_graph import detect_cycles, format_graph_for_frontend, traverse_factory_graph, build_factory_graph
from flask import request, flash, redirect, url_for
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from flask_mail import Message
from . import mail
import importlib.util
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
import jwt
from datetime import datetime, timedelta, timezone
from .logging_util import setup_logger
# from .read_save_file import process_save_file  # Import the processing function

config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config.py'))

# Load the config module dynamically
spec = importlib.util.spec_from_file_location("config", config_path)
config = importlib.util.module_from_spec(spec)
spec.loader.exec_module(config)

logger = setup_logger("routes")

logger.info(f"Config Path: {config_path}")  

# Use the imported config variables
REACT_BUILD_DIR = config.REACT_BUILD_DIR
REACT_STATIC_DIR = config.REACT_STATIC_DIR
SECRET_KEY = config.SECRET_KEY
# Construct the absolute path to the config file

main = Blueprint(
    'main',
    __name__,
    static_folder=REACT_STATIC_DIR
)

# Load service account credentials
#SERVICE_ACCOUNT_FILE = config.SERVICE_ACCOUNT_KEY_FILE
#PROJECT_ID = config.GOOGLE_PROJECT_ID
SITE_KEY = config.REACT_APP_RECAPTCHA_SITE_KEY
API_KEY = config.RECAPTCHA_API_KEY

UPLOAD_FOLDER = config.UPLOAD_FOLDER
ALLOWED_EXTENSIONS = config.ALLOWED_EXTENSIONS

# Simulated processing tracker
PROCESSING_STATUS = {}

logger.info(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@main.route('/')
def serve_react_app():
    """SERVE REACT APP - Serve the React app's index.html file."""
    react_dir = os.path.join(REACT_BUILD_DIR, 'index.html') #TODO: Customise index.html
    logger.info(f"Serving React app: {react_dir}")
    return send_from_directory(REACT_BUILD_DIR, 'index.html')

@main.route('/static/<path:path>')
def serve_static_files(path):
    """STATIC ROUTE - Serve static files from React's build directory."""
    logger.info(f"Serving static file: {path}")
    return send_from_directory(os.path.join(REACT_BUILD_DIR, 'static'), path)

@main.route('/<path:path>')
def catchall(path):
    logger.info(f"CATCH-ALL route called: {path}")
    """CATCH-ALL route to serve React app or fallback."""
    if path.startswith("static/"):
        logger.info(f"CATCH-ALL - Skipping static route for: {path}")
        return "", 404  # Ensure Flask doesn't interfere with /static
    file_path = os.path.join(REACT_BUILD_DIR, path)
    if os.path.exists(file_path):
        logger.info(f"CATCH-ALL - Serving file: {file_path}")
        return send_from_directory(REACT_BUILD_DIR, path)
    logger.info("CATCH-ALL - Serving React app index.html")
    return send_from_directory(REACT_BUILD_DIR, 'index.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    logger.info(f"Login Request Method: {request.method}")
    if request.method == 'POST':
        logger.info("Login route called: POST METHOD")
        data = request.get_json()  # Handle JSON payload from React
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        logger.info(f"Retrieved User: {user}")
        if user and check_password_hash(user.password, password):
            logger.info(f"User {user.username} has been found.")
            login_user(user) 
            logger.info(f"User {user.username} has been logged in.")
            # Generate a JWT token with user ID and expiry date of 30 days
            # TODO: Store the token in a secure HttpOnly cookie
            token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(days=30)
            }, SECRET_KEY, algorithm='HS256')
            return jsonify({
                "message": "Login successful!",
                "token": token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }), 200
        else:
            return jsonify({"message": "Invalid email or password."}), 401
    elif request.method == 'GET':
        logger.info("Login route called: GET METHOD")
        logger.info(f"Getting User Information: {current_user}")
        logger.info(f"User is authenticated:{current_user.is_authenticated}")        
        
        user_info = {
            "is_authenticated": current_user.is_authenticated,
            "id": current_user.id if current_user.is_authenticated else None,
            "username": current_user.username if current_user.is_authenticated else None,
            "email": current_user.email if current_user.is_authenticated else None,
            "role": current_user.role if current_user.is_authenticated else None
        }
        return jsonify({
            "message": "Please log in via the POST method.",
            "current_user": user_info
        }), 401
        
@main.route('/check_login', methods=['POST'])
@login_required
def check_login():
    data = request.get_json()
    token = data.get('token')

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']
        user = User.query.get(user_id)
        if user:
            login_user(user)
            return jsonify({
                "message": "User logged in automatically.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token."}), 401
            
@main.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()  # Parse JSON payload
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        recaptcha_token = data.get('recaptcha_token')
        
        # Verify reCAPTCHA
        verify_url = 'https://www.google.com/recaptcha/api/siteverify'
        response = requests.post(verify_url, data={
            'secret': API_KEY,
            'response': recaptcha_token
        })
        result = response.json()

        if not result.get('success'):
            return jsonify({"message": "reCAPTCHA validation failed. Please try again."}), 400
        
        # Verify that the username is unique
        user = User.query.filter_by(username=username).first()
        if user:
            return jsonify({"message": "Username is unavailable."}), 400    

        
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            role='user'
        )
        
        db.session.add(new_user)
        db.session.commit()

        flash('Account successfully created!', 'info')        
    return jsonify({"message": "Account created successfully."}), 201

@main.route('/logout')
@login_required
def logout():
    logout_user()    
    flash('Logged out successfully.', 'info')
    return jsonify({"message": "Logged out successfully."}), 201

def generate_verification_token(email):
    #print(f"********************************************Generating verification token for {email} with secret key: {config.SECRET_KEY}")
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    return serializer.dumps(email, salt='email-confirm')

def confirm_verification_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(config.SECRET_KEY)
    try:
        email = serializer.loads(token, salt='email-confirm', max_age=expiration)
    except Exception:
        return None
    return email

@main.route('/verify/<token>')
def verify_email(token):
    try:
        email = confirm_verification_token(token)
    except Exception as e:
        flash('The verification link is invalid or has expired.', 'danger')
        return redirect(url_for('signup'))

    user = User.query.filter_by(email=email).first()
    if user.is_verified:  # Add `is_verified` to your User model
        flash('Account already verified. Please log in.', 'info')
        return redirect(url_for('login'))

    user.is_verified = True
    db.session.commit()
    flash('Your account has been verified! You can now log in.', 'success')
    return redirect(url_for('login'))

@main.route('/api/user_info', methods=['GET'])
#@login_required
def user_info():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    })

@main.route('/api/build_tree', methods=['GET'])
def build_tree_route():
    part_id = request.args.get('part_id')
    recipe_name = request.args.get('recipe_name', '_Standard')
    target_quantity = request.args.get('target_quantity', 1, type=int)
    visited = request.args.get('visited')

    if not part_id:
        logger.error("part_id is required")
        return jsonify({"error": "part_id is required"}), 400
    
    result = build_tree(part_id, recipe_name, target_quantity, visited)
    logger.info(f"Build Tree Result: {result}")
    return jsonify(result)

@main.route('/api/<table_name>', methods=['GET'])
def get_table_entries(table_name):
    """Fetch all rows from the specified table."""
    # Validate table name against a whitelist for security
    if table_name not in config.VALID_TABLES:
        return jsonify({"error": f"Invalid table name: {table_name}"}), 400

    # Fetch data from the specified table
    query = text(f"SELECT * FROM {table_name}")
    try:
        rows = db.session.execute(query).fetchall()
        return jsonify([dict(row._mapping) for row in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@main.route('/api/tables', methods=['GET'])
def get_tables():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()  # Fetch all table names
    print(tables)
    return jsonify({"tables": tables})
    
# Adding a GET route for fetching all rows from a table    
@main.route('/api/tables/<table_name>', methods=['GET'])
def get_table_data(table_name):
    print("Getting table data" + table_name)
    query = text(f"SELECT * FROM {table_name}")
    rows = db.session.execute(query).fetchall()
    return jsonify({"rows": [dict(row._mapping) for row in rows]})

# Adding a PUT route for updating a row
@main.route('/api/tables/<table_name>/<int:row_id>', methods=['PUT'])
def update_row(table_name, row_id):
    data = request.json
    update_query = text(f"UPDATE {table_name} SET {', '.join(f'{key} = :{key}' for key in data.keys())} WHERE id = :id")
    db.session.execute(update_query, {**data, "id": row_id})
    db.session.commit()
    return jsonify({"message": "Row updated successfully"})

# Adding a POST route for creating a new row
@main.route('/api/tables/<table_name>', methods=['POST'])
def create_row(table_name):
    if table_name not in config.VALID_TABLES:
        return jsonify({"error": f"Table '{table_name}' is not valid."}), 400

    data = request.json

    # Validate columns
    invalid_columns = [key for key in data.keys() if key not in config.VALID_COLUMNS]
    if invalid_columns:
        return jsonify({"error": f"Invalid column(s): {', '.join(invalid_columns)}"}), 400

     # Exclude the 'id' column from the data dictionary
    data_without_id = {key: value for key, value in data.items() if key != 'id'}

    # Build the SQL INSERT query
    columns = ", ".join(data_without_id.keys())
    values = ", ".join(f":{key}" for key in data_without_id.keys())
    query = text(f"INSERT INTO {table_name} ({columns}) VALUES ({values})")

    try:
        db.session.execute(query, data)
        db.session.commit()
        return jsonify({"message": "Row created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Adding a DELETE route for deleting a row
@main.route('/api/tables/<table_name>/<int:row_id>', methods=['DELETE'])
def delete_row(table_name, row_id):    
    try:
        print(f"delete_row called with table_name={table_name}, row_id={row_id}")
        if table_name not in config.VALID_TABLES:
            return jsonify({"error": "Invalid table name"}), 400        
        # Construct the DELETE query using a parameterized query to prevent SQL injection
        delete_query = text(f"DELETE FROM {table_name} WHERE id = :id")
        db.session.execute(delete_query, {"id": row_id})
        db.session.commit()
        return jsonify({"message": "Row deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@main.route('/api/part', methods=['GET'])
def get_part():
    """GET ALL PARTS - Retrieve all parts from the database."""
    query = text('SELECT * FROM part')  # Wrap the query in text()
    part = db.session.execute(query).fetchall()  # Execute the query
    return jsonify([dict(row._mapping) for row in part])  # Convert rows to JSON-friendly dictionaries

@main.route('/api/part_names', methods=['GET'])
def get_parts_names():
    """GET PART NAMES Fetch all parts from the database."""
    parts_query = db.session.execute(text("SELECT id, part_name FROM part WHERE category = 'Parts'")).fetchall()
    parts = [{"id": row.id, "name": row.part_name} for row in parts_query]
    return jsonify(parts)

@main.route('/api/recipe', methods=['GET'])
def get_recipe():
    """GET RECIPES - Retrieve all recipes from the database."""
    query = text('SELECT * FROM recipe') # Wrap the query in text()
    recipe = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in recipe])

@main.route('/api/recipe_id/<part_id>', methods=['GET'])
def get_recipe_id(part_id):
    recipe_name = request.args.get('recipe_name', '_Standard')  # Default to '_Standard'
    logger.info(f"Getting recipe ID for part_id: {part_id} and recipe_name: {recipe_name}")

    try:
        # Use parameterized query to fetch the recipe
        query = text("SELECT * FROM recipe WHERE part_id = :part_id AND recipe_name = :recipe_name")
        recipe = db.session.execute(query, {"part_id": part_id, "recipe_name": recipe_name}).fetchall()
        logger.info(f"Query result: {recipe}")
        return jsonify([dict(row._mapping) for row in recipe])
    except Exception as e:
        logger.error(f"Error fetching recipe ID for part_id {part_id} and recipe_name {recipe_name}: {e}")
        return jsonify({"error": "Failed to fetch recipe ID"}), 500

@main.route('/api/alternate_recipe', methods=['GET'])
def get_alternate_recipe():
    """
    Fetch all alternate recipes with part and recipe names.
    """
    query = text('SELECT ar.id, ar.part_id, ar.recipe_id, ar.selected, p.part_name, r.recipe_name FROM alternate_recipe ar JOIN part p ON ar.part_id = p.id JOIN recipe r ON ar.recipe_id = r.id')
    result = db.session.execute(query).fetchall()
    alternate_recipe = [dict(row._mapping) for row in result]
    return jsonify(alternate_recipe)

@main.route('/api/dependencies', methods=['GET'])
def get_dependencies():
    """GET DEPENDENCIES - Retrieve all dependencies from the database."""
    query = text('SELECT * FROM dependencies')
    dependencies = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in dependencies])

@main.route('/tracker', methods=['GET'])
def tracker():
    """TRACKER - Render the tracker page."""
    return render_template('tracker.html') #TODO: Implement tracker.html
    
@main.route('/dashboard')
@login_required
def dashboard():
    """DASHBOARD - Render the dashboard page."""
    return f'Welcome, {current_user.username}!' #TODO: Implement dashboard.html
    

@main.route('/api/validation', methods=['GET'])
def get_data_validation():
    """Fetch all data validation rules."""
    query = text("SELECT * FROM data_validation")
    validation_data = db.session.execute(query).fetchall()
    # print("**************************************", [dict(row._mapping) for row in validation_data])
    return jsonify([dict(row._mapping) for row in validation_data])

@main.route('/api/tracker_reports', methods=['GET'])
def get_tracker_reports():
    user_id = current_user.id

    try:
        # Query the tracker table for the user's tracked parts
        query = """
            SELECT t.part_id, t.recipe_id, t.target_quantity, p.part_name, r.recipe_name
            FROM tracker t
            JOIN part p ON t.part_id = p.id
            JOIN recipe r ON t.recipe_id = r.id
            WHERE t.user_id = :user_id
        """
        # logger.info(f"tracker_reports Query: {query}, User: {user_id}")
        tracked_parts = db.session.execute(text(query), {"user_id": user_id}).fetchall()
        # logger.info(f"User: {user_id}, Tracked parts: {tracked_parts}")
        # Generate dependency trees for each tracked part
        reports = []
        for part in tracked_parts:
            part_id = part.part_id
            recipe_name = part.recipe_name
            target_quantity = part.target_quantity

            # Call build_tree for each tracked part
            tree = build_tree(part_id, recipe_name, target_quantity)
            reports.append({
                "part_id": part_id,
                "part_name": part.part_name,
                "recipe_name": recipe_name,
                "target_quantity": target_quantity,
                "tree": tree
            })

        return jsonify(reports), 200
    except Exception as e:
        logger.error(f"Error generating tracker reports: {e}")
        return jsonify({"error": "Failed to generate tracker reports"}), 500

@main.route('/api/tracker_add', methods=['POST'])
@login_required
def add_to_tracker():
    logger.info("Adding part and recipe to tracker")
    if not current_user.is_authenticated:
        logger.info(f"{current_user}, User is not authenticated")
        return jsonify({"error": "User is not authenticated"}), 401
    
    data = request.json
    part_id = data.get('partId')
    target_quantity = data.get('targetQuantity')
    recipe_id = data.get('recipeId')

    logger.info(f"Part ID: {part_id}, Recipe Name: {recipe_id}, Target Quantity: {target_quantity}")
    if not part_id or not recipe_id:
        return jsonify({"error": "Part ID and Recipe ID are required"}), 400

    logger.info(f"Current user: {current_user}")
    # Check if the part and recipe are already in the user's tracker
    existing_entry = Tracker.query.filter_by(part_id=part_id, recipe_id=recipe_id, user_id=current_user.id).first()
    logger.info(f"Existing entry: {existing_entry}")
    if existing_entry:
        return jsonify({"message": "Part and recipe are already in the tracker"}), 200

    # Get the current time formatted as dd/mm/yy hh:mm:ss
    current_time = datetime.now().strftime('%d/%m/%y %H:%M:%S')

    logger.info(f"Adding new tracker entry for user: {current_user.id}, part: {part_id}, recipe: {recipe_id}, target quantity: {target_quantity}, recipe_id: {recipe_id}")
    # Add new tracker entry
    new_tracker_entry = Tracker(
        part_id=part_id,
        recipe_id=recipe_id,
        user_id=current_user.id,
        target_quantity=target_quantity,
        created_at=current_time,
        updated_at=current_time
    )
    logger.info(f"New tracker entry: {new_tracker_entry}")
    db.session.add(new_tracker_entry)
    db.session.commit()
    logger.info(f"Part and recipe added to tracker successfully, {part_id}, {recipe_id}")
    return jsonify({"message": "Part and recipe added to tracker successfully"}), 200

@main.route('/api/tracker_data', methods=['GET'])
@login_required
def get_tracker_data():
    user_id = current_user.id
    tracker_data_query = """
        SELECT t.id, t.target_quantity, p.part_name, r.recipe_name, t.created_at, t.updated_at
        FROM tracker t
        JOIN part p ON t.part_id = p.id
        JOIN recipe r ON t.recipe_id = r.id
        WHERE t.user_id = :user_id
    """
    try:
        tracker_data = db.session.execute(text(tracker_data_query), {"user_id": user_id}).fetchall()
        return jsonify([dict(row._mapping) for row in tracker_data])
    except Exception as e:
        logger.error(f"Error fetching tracker data: {e}")
        return jsonify({"error": "Failed to fetch tracker data"}), 500
    
@main.route('/api/tracker_data/<int:tracker_id>', methods=['DELETE'])
@login_required
def delete_tracker_item(tracker_id):
    try:
        logger.info(f"Deleting tracker item with ID: {tracker_id}")
        tracker_item = Tracker.query.filter_by(id=tracker_id, user_id=current_user.id).first()
        logger.info(f"Tracker item: {tracker_item}")
        if not tracker_item:
            logger.info("Tracker item not found or you don't have permission to delete it")
            return jsonify({"error": "Tracker item not found or you don't have permission to delete it"}), 404

        db.session.delete(tracker_item)
        db.session.commit()
        return jsonify({"message": "Tracker item deleted successfully"}), 200
    except Exception as e:
        logger.info(f"Error deleting tracker item: {e}")
        return jsonify({"error": "Failed to delete tracker item"}), 500
    
@main.route('/api/tracker_data/<int:tracker_id>', methods=['PUT'])
@login_required
def update_tracker_item(tracker_id):
    try:
        data = request.json
        target_quantity = data.get("target_quantity")
        if target_quantity is None:
            return jsonify({"error": "Target quantity is required"}), 400

        tracker_item = Tracker.query.filter_by(id=tracker_id, user_id=current_user.id).first()
        if not tracker_item:
            return jsonify({"error": "Tracker item not found or you don't have permission to update it"}), 404

        tracker_item.target_quantity = target_quantity
        db.session.commit()
        return jsonify({"message": "Tracker item updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating tracker item: {e}")
        return jsonify({"error": "Failed to update tracker item"}), 500

@main.route('/api/selected_recipes', methods=['GET'])
@login_required
def get_selected_recipes():
    user_id = current_user.id
    query = """
        SELECT usr.id, usr.part_id, usr.recipe_id, p.part_name, r.recipe_name
        FROM user_selected_recipe usr
        JOIN part p ON usr.part_id = p.id
        JOIN recipe r ON usr.recipe_id = r.id
        WHERE usr.user_id = :user_id
    """
    try:
        selected_recipes = db.session.execute(text(query), {"user_id": user_id}).fetchall()
        return jsonify([dict(row._mapping) for row in selected_recipes])
    except Exception as e:
        logger.error(f"Error fetching selected recipes: {e}")
        return jsonify({"error": "Failed to fetch selected recipes"}), 500
    
@main.route('/api/selected_recipes', methods=['POST'])
@login_required
def add_or_update_selected_recipe():
    user_id = current_user.id
    data = request.json
    part_id = data.get('part_id')
    recipe_id = data.get('recipe_id')

    if not part_id or not recipe_id:
        return jsonify({"error": "Part ID and Recipe ID are required"}), 400

    try:
        query = """
            INSERT INTO user_selected_recipe (user_id, part_id, recipe_id, created_at, updated_at)
            VALUES (:user_id, :part_id, :recipe_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                recipe_id = VALUES(recipe_id),
                updated_at = CURRENT_TIMESTAMP
        """
        db.session.execute(text(query), {"user_id": user_id, "part_id": part_id, "recipe_id": recipe_id})
        db.session.commit()
        return jsonify({"message": "Selected recipe updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating selected recipe: {e}")
        return jsonify({"error": "Failed to update selected recipe"}), 500
    
@main.route('/api/selected_recipes/<int:recipe_id>', methods=['DELETE'])
@login_required
def delete_selected_recipe(recipe_id):
    user_id = current_user.id

    try:
        query = """
            DELETE FROM user_selected_recipe
            WHERE user_id = :user_id AND recipe_id = :recipe_id
        """
        logger.info(f"Query: {query}, User: {user_id}, Recipe: {recipe_id}")
        
        db.session.execute(text(query), {"user_id": user_id, "recipe_id": recipe_id})
        db.session.commit()
        
        logger.info(f"Selected recipe deleted successfully: Recipe {recipe_id}, User {user_id}")
        
        return jsonify({"message": "Selected recipe deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting selected recipe: {e}")
        return jsonify({"error": "Failed to delete selected recipe"}), 500

@main.route('/api/log', methods=['POST'])
def log_message():
    data = request.json
    message = data.get('message')
    level = data.get('level', 'INFO')  # Default to INFO level

    if not message:
        return jsonify({"error": "Log message is required"}), 400

    # Map string levels to logging levels
    log_levels = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL,
    }

    log_level = log_levels.get(level.upper(), logging.INFO)

    # Log the message
    logger.log(log_level, f"Frontend: {message}")
    return jsonify({"message": "Log recorded"}), 200

@main.route("/upload_sav", methods=["POST"])
def upload_sav():
    from app.read_save_file import process_save_file  # Move import inside the function to avoid circular import
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

          # Assign processing ID
        processing_id = str(uuid.uuid4())
        PROCESSING_STATUS[processing_id] = "processing"

        # Process file in a background task
        try:
            user_id = current_user.id  
            logger.info(f"BEFORE PROCESS_SAVE_FILE CALL - Processing file: {filename} for user ID: {user_id}")
            process_save_file(filepath, user_id)
            PROCESSING_STATUS[processing_id] = "completed"
        except Exception as e:
            PROCESSING_STATUS[processing_id] = "failed"
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500

    return jsonify({"message": f"File '{filename}' uploaded successfully!", "processing_id": processing_id}), 200

@main.route("/processing_status/<processing_id>", methods=["GET"])
def get_processing_status(processing_id):
    status = PROCESSING_STATUS.get(processing_id, "unknown")
    return jsonify({"status": status})

@main.route("/user_save", methods=["GET"])
def get_user_save():
    user_id = current_user.id
    user_saves = (
        db.session.query(
            User_Save.id,
            Part.part_name,
            Recipe.recipe_name,
            Recipe.base_supply_pm,
            User_Save.machine_id,
            Machine.machine_name,
            Machine_Level.machine_level,
            Node_Purity.node_purity,
            User_Save.machine_power_modifier,
            User_Save.created_at,
            User_Save.sav_file_name,
        )
        .join(Recipe, User_Save.recipe_id == Recipe.id, isouter=True)
        .join(Part, Recipe.part_id == Part.id, isouter=True)
        .join(Machine, User_Save.machine_id == Machine.id, isouter=True)
        .join(Machine_Level, Machine.machine_level_id == Machine_Level.id, isouter=True)
        .join(Resource_Node, User_Save.resource_node_id == Resource_Node.id, isouter=True)
        .join(Node_Purity, Resource_Node.node_purity_id == Node_Purity.id, isouter=True)
        .filter(User_Save.user_id == user_id)
        #.filter(User_Save.sav_file_name == sav_file_name)  # ✅ Only return records for the relevant save file
        .all()
    )

    #logger.info(f"User Saves: {user_saves}")
    return jsonify([
        {
            "id": us.id,
            "part_name": us.part_name,
            "recipe_name": us.recipe_name,
            "machine_id": us.machine_id,
            "machine_name": us.machine_name,
            "machine_level": us.machine_level,
            "node_purity": us.node_purity,
            "machine_power_modifier": us.machine_power_modifier or 1,
            "base_supply_pm": us.base_supply_pm or 0,
            "actual_ppm": (us.base_supply_pm or 0) * (us.machine_power_modifier or 1), 
            "created_at": us.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "sav_file_name": us.sav_file_name,
        } for us in user_saves
        
    ])
    
# API: Get user settings
@main.route('/api/user_settings', methods=['GET'])
@login_required
def get_user_settings():
    category = request.args.get('category')
    query = UserSettings.query.filter_by(user_id=current_user.id)
    
    if category:
        query = query.filter_by(category=category)
    
    settings = query.all()
    return jsonify([{ "key": s.key, "value": s.value } for s in settings]), 200

# API: Update user settings
@main.route('/api/user_settings', methods=['POST'])
@login_required
def update_user_settings():
    data = request.json
    category = data.get('category')
    key = data.get('key')
    value = data.get('value')
    
    if not category or not key or value is None:
        return jsonify({"error": "Category, key, and value are required"}), 400
    
    setting = UserSettings.query.filter_by(user_id=current_user.id, category=category, key=key).first()
    if setting:
        setting.value = value
    else:
        setting = UserSettings(user_id=current_user.id, category=category, key=key, value=value)
        db.session.add(setting)
    
    try:
        db.session.commit()
        return jsonify({"message": "Setting updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@main.route('/api/production_report', methods=['POST'])
@login_required
def get_production_report():
    try:
        #logger.info("Generating production report")
        data = request.json
        tracker_data = data.get("trackerData", [])
        save_data = data.get("saveData", [])
        
        #logger.info(f"Tracker Data: {tracker_data}, Save Data: {save_data}")

        if not tracker_data or not save_data:
            return jsonify({"error": "trackerData and saveData are required"}), 400
        
        part_production = {}
        
        def extract_required_quantities(tree, part_production):
            """Recursively extract required quantities from the dependency tree."""
            for part_name, details in tree.items():
                if part_name not in part_production:
                    part_production[part_name] = {"target": 0, "actual": 0}
                
                # Add required quantity
                part_production[part_name]["target"] += details.get("Required Quantity", 0)

                # Recursively process the subtree
                if "Subtree" in details and isinstance(details["Subtree"], dict):
                    extract_required_quantities(details["Subtree"], part_production)

        #logger.info("Processing trackerData for target production")
        # Process trackerData for target production
        for report in tracker_data:
            if not report.get("tree"):
                continue
               # ✅ Process trackerData for ALL dependencies, not just root parts
        for report in tracker_data:
            if not report.get("tree"):
                continue
            extract_required_quantities(report["tree"], part_production)
        
        #logger.info("Processing saveData for actual production")
        # Process saveData for actual production using base_supply_pm
        for save in save_data:
            base_supply_pm = save["base_supply_pm"] if save["base_supply_pm"] is not None else 0.0
            machine_power_modifier = save["machine_power_modifier"] if save["machine_power_modifier"] is not None else 1.0
            
            actual_ppm = base_supply_pm * machine_power_modifier

            save_part_name = save["part_name"] if save["part_name"] else "UNKNOWN_PART"
            
            if save_part_name == "UNKNOWN_PART":
                #logger.warning(f"Missing part name detected in user save data: {save}")
                continue

            if save_part_name not in part_production:
                part_production[save["part_name"]] = {"target": 0, "actual": 0}
            
            part_production[save["part_name"]]["actual"] += actual_ppm
            #logger.info(f"Save File Actual: {part_production[save_part_name]['actual']}")
        return jsonify(part_production), 200
    except Exception as e:
        logger.error(f"Error generating production report: {e}")
        return jsonify({"error": "Failed to generate production report"}), 500
    
@main.route('/api/machine_usage_report', methods=['POST'])
@login_required
def get_machine_usage_report():
    try:
        #logger.info("Generating machine usage report")
        data = request.json
        tracker_data = data.get("trackerData", [])
        save_data = data.get("saveData", [])

        if not tracker_data or not save_data:
            return jsonify({"error": "trackerData and saveData are required"}), 400

        machine_usage = {}

        # 📌 Step 1: Process trackerData for target machines
        def extract_machines(tree):
            # Debugging
            #logger.debug(f"Extracting machines from tree")
            for part, details in tree.items():
                if "Produced In" in details and "No. of Machines" in details:
                    machine_name = details["Produced In"]
                    num_machines = details["No. of Machines"]

                    if machine_name not in machine_usage:
                        machine_usage[machine_name] = {"target": 0, "actual": 0}

                    machine_usage[machine_name]["target"] += num_machines

                # Recursively extract from subtrees
                if "Subtree" in details and details["Subtree"]:
                    extract_machines(details["Subtree"])

        for report in tracker_data:
            if "tree" in report and report["tree"]:
                extract_machines(report["tree"])
        # Debugging
        #logger.debug("Processing saveData for actual machine usage")
        query = """
            SELECT id, machine_name FROM machine
        """
        # Debugging
        #logger.info(f"Mapping machines - Machine Query: {query}")
        machine_map = {row.id: row.machine_name for row in db.session.execute(text(query))}
        
        # Debugging
        #logger.info(f"Machine Map: {machine_map}")

        for save in save_data:
            # Debugging
            #logger.debug(f"Processing save data record, getting machine_id ")            
            machine_id = save["machine_id"]
           
            # Debugging
            #logger.debug(f"Got Machine ID, {machine_id} Getting power_modifier")           
            power_modifier = save["machine_power_modifier"] if save["machine_power_modifier"] is not None else 1.0
            
            # Debugging
            #logger.debug(f"Got Power Modifier, {power_modifier} Getting machine_name")
            machine_name = machine_map.get(machine_id, "Unknown Machine")
            
            # Debugging
            #logger.debug(f"Got Machine Name: {machine_name}")
            if machine_name == "Unknown Machine":
                #logger.warning(f"Unidentified Machine detected in user save data: {save}")
                continue
            
            # Check if machine_name is in machine_usage and initialize if not
            if machine_name not in machine_usage:
                #logger.info(f"Machine Name not in machine_usage, adding to machine_usage")
                machine_usage[machine_name] = {"target": 0, "actual": 0}

            # Debugging
            #logger.debug(f"Multiplying Machine Name: {machine_name}, Power Modifier: {power_modifier}")
            machine_usage[machine_name]["actual"] += 1 * power_modifier
        # Debugging
        #logger.debug(f"Detailed Machine Usage: {machine_usage}")
                
        # Remove None keys before returning
        cleaned_machine_usage = {str(k): v for k, v in machine_usage.items() if k is not None}

        #logger.debug(f"Returning cleaned machine usage report {cleaned_machine_usage}")
        return jsonify(cleaned_machine_usage), 200

    except Exception as e:
        logger.error(f"Error generating machine usage report: {e}")
        return jsonify({"error": "Failed to generate machine usage report"}), 500
    
@main.route('/api/conveyor_levels', methods=['GET'])
def get_conveyor_levels():
    """Fetch conveyor belt levels."""
    query = text("SELECT * FROM conveyor_level")
    conveyor_levels = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in conveyor_levels])

@main.route('/api/conveyor_supply_rate', methods=['GET'])
def get_conveyor_supplies():
    """Fetch conveyor belt supply rates."""
    query = text("""
        SELECT cs.id, cl.conveyor_level, cs.supply_pm
        FROM conveyor_supply cs
        JOIN conveyor_level cl ON cs.conveyor_level_id = cl.id
    """)
    conveyor_supplies = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in conveyor_supplies])

@main.route('/api/user_save_connections', methods=['GET'])
def get_user_save_connections():
    """Fetch all user save connections."""
    query = text("SELECT * FROM user_save_connections")
    connections = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in connections])

@main.route('/api/user_save_conveyors', methods=['GET'])
def get_user_save_conveyors():
    """Fetch all user save conveyor chains."""
    query = text("SELECT * FROM user_save_conveyors")
    conveyors = db.session.execute(query).fetchall()
    return jsonify([dict(row._mapping) for row in conveyors])

@main.route('/api/machine_connections', methods=['GET'])
def get_machine_connections():
    """Fetch machine connections with production details."""
    try:
        query = text("""
            WITH conveyor_data AS (
                SELECT 
                    usc.connected_component, 
                    usc.connection_inventory, 
                    usc.direction, 
                    usc.outer_path_name, 
                    us.output_inventory, 
                    m.machine_name, 
                    p.part_name, 
                    r.base_supply_pm, 
                    usc.conveyor_speed
                FROM user_save_connections usc
                LEFT JOIN user_save us ON usc.connection_inventory = us.output_inventory
                LEFT JOIN machine m ON us.machine_id = m.id
                LEFT JOIN recipe r ON us.recipe_id = r.id
                LEFT JOIN part p ON r.part_id = p.id
            ),
            deduplicated_conveyors AS (
                SELECT 
                    connected_component, 
                    connection_inventory, 
                    direction, 
                    outer_path_name, 
                    output_inventory, 
                    MAX(machine_name) AS machine_name,  -- ✅ Keep machine data if available
                    MAX(part_name) AS part_name, 
                    MAX(base_supply_pm) AS base_supply_pm, 
                    MAX(conveyor_speed) AS conveyor_speed
                FROM conveyor_data
                GROUP BY connected_component, connection_inventory, direction, outer_path_name, output_inventory
            )
            SELECT * FROM deduplicated_conveyors;
        """)
        
        connections = db.session.execute(query).fetchall()
        return jsonify([dict(row._mapping) for row in connections])
    except Exception as e:
        logger.error(f"Error fetching machine connections: {e}")
        return jsonify({"error": "Failed to fetch machine connections"}), 500

@main.route('/api/connection_graph', methods=['GET'])
def get_connection_graph():
    """Fetches the machine connection graph based on actual item flow."""
    try:
        user_id = current_user.id,
        #logger.info(f"Generating machine connections for user ID: {user_id}")
        graph, metadata = build_factory_graph(user_id)
        formatted_graph = format_graph_for_frontend(graph, metadata)
        #logger.debug(f"Formatted Graph {formatted_graph}")
        return jsonify(formatted_graph)
    
    except Exception as e:
        logger.error(f"Error generating factory graph: {e}")
        return jsonify({"error": "Failed to generate connection graph"}), 500
    
@main.route('/api/machine_metadata', methods=['GET'])
def get_machine_metadata():
    """Fetch machine metadata including the produced item, base supply, and conveyor speed."""
    try:
        query = text("""
            SELECT us.output_inventory, m.machine_name, p.part_name AS produced_item, 
                     r.base_supply_pm, cs.supply_pm AS conveyor_speed, i.icon_path AS icon_path
            FROM user_save us
            JOIN machine m ON us.machine_id = m.id
            JOIN recipe r ON us.recipe_id = r.id
            JOIN part p ON r.part_id = p.id
            LEFT JOIN user_save_connections usc ON us.output_inventory = usc.connection_inventory
            LEFT JOIN conveyor_supply cs ON usc.conveyor_speed = cs.supply_pm
            LEFT JOIN icon i ON m.icon_id = i.id
        """)

        # logger.debug(f"Machine Metadata Query: {query}")
        metadata = db.session.execute(query).fetchall()
        return jsonify([dict(row._mapping) for row in metadata])

    except Exception as e:
        logger.error(f"Error fetching machine metadata: {e}")
        return jsonify({"error": "Failed to fetch machine metadata"}), 500


@main.route('/api/pipe_network', methods=['GET'])
@login_required
def get_pipe_network():
    """
    API route to fetch pipe networks for the logged-in user.
    """
    try:
        user_id = current_user.id  # Ensure we filter by user
        pipes = User_Save_Pipes.query.filter_by(user_id=user_id).all()

        pipe_data = [
            {
                "instance_name": pipe.instance_name,
                "fluid_type": pipe.fluid_type,
                "connections": json.loads(pipe.connection_points)
            }
            for pipe in pipes
        ]
        logger.info(f"✅ Succesfully fetched pipe network data for user {user_id}")
        return jsonify(pipe_data), 200

    except Exception as e:
        logger.error(f"❌ Error fetching pipe network data for user {user_id}: {e}")
        return jsonify({"error": "Failed to retrieve pipe network data"}), 500

