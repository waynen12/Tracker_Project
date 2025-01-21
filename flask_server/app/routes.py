"""ROUTES - Define the routes for the Flask app."""
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import text
from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker
from flask import send_from_directory
import os
import logging
from logging.handlers import RotatingFileHandler
import math
from .models import User, Tracker
from . import db
from .build_tree import build_tree
from flask import request, flash, redirect, url_for
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from flask_mail import Message
from . import mail
import importlib.util
import requests
from flask import request, jsonify
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
import jwt
from datetime import datetime, timedelta, timezone
from .logging_util import setup_logger

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
        return jsonify({"error": "part_id is required"}), 400

    result = build_tree(part_id, recipe_name, target_quantity, visited)

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

@main.route('/api/tracker/reports', methods=['POST'])
def generate_reports():
    tracker_data = request.json  # User's tracker data
    total_parts = sum(part['base_demand'] for part in tracker_data)
    total_parts_pm = sum(part['base_demand_pm'] for part in tracker_data)
    total_machines = sum(math.ceil(part['base_demand'] / part['base_supply']) for part in tracker_data)
    byproducts = sum(part.get('byproduct_supply', 0) for part in tracker_data)

    return jsonify({
        'totalParts': total_parts,
        'totalPartsPerMinute': total_parts_pm,
        'totalMachines': total_machines,
        'byproducts': byproducts
    })

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