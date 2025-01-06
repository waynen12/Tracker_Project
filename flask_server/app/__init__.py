import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_mail import Mail
from flask_cors import CORS

print("Initializing Flask Application...")
login_manager = LoginManager()
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app():
    # Construct the absolute path to the config file
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config.py'))
    # print(f"Loading config from: {config_path}")
    
    app = Flask(__name__, static_folder=None) # Explicity set static_folder to None to disable static file serving from default location
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config.from_pyfile(config_path)   
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    mail.init_app(app)

    with app.app_context():
        # Import models to ensure they are registered
        #TODO: None of the imported tables are being used. Should they be included in the db.create_all() call?
        from .models import User, Part, Recipe, Alternate_Recipe, Miner_Type, Node_Purity, Power_Shards, Miner_Supply, Data_Validation
        db.create_all()  # Ensure tables are created

    # Register blueprints
    from .routes import main
    app.register_blueprint(main)

    # print("Registered Routes:")
    # for rule in app.url_map.iter_rules():
    #     print(f"Endpoint: {rule.endpoint}, URL: {rule.rule}")
    
    print("App successfully created")
    return app 