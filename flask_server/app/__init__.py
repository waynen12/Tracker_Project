import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_mail import Mail
from flask_cors import CORS


db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()
mail = Mail()

def create_app():
    # Construct the absolute path to the config file
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config.py'))
    # print(f"Loading config from: {config_path}")
    
    app = Flask(__name__, static_folder=None) # Explicity set static_folder to None to disable static file serving from default location
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True) # Enable CORS for all domains on all routes with credentials support
    app.config.from_pyfile(config_path)   
    SECRET_KEY = app.config['SECRET_KEY']

    print("Initializing Flask Application...")
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    login_manager.login_view = 'main.login'  # Redirect to login page if not authenticated
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    with app.app_context():
        # Import models to ensure they are registered
        #TODO: None of the imported tables are being used. Should they be included in the db.create_all() call?
        from .models import User, Part, Recipe, Alternate_Recipe, Miner_Type, Node_Purity, Power_Shards, Miner_Supply, Data_Validation, Tracker
        #db.create_all()  # Ensure tables are created

    # Register blueprints
    from .routes import main
    app.register_blueprint(main)

    # print("Registered Routes:")
    # for rule in app.url_map.iter_rules():
    #     print(f"Endpoint: {rule.endpoint}, URL: {rule.rule}")
    
    print("App successfully created")
    return app 