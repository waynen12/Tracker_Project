from app import create_app, db
from flask_migrate import Migrate
from waitress import serve
import sys
import os

# Add the project root directory to the Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    # Use Waitress to serve the Flask app
    serve(app, host="0.0.0.0", port=5000)

