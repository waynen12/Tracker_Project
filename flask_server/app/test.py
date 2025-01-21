import os
from logging_util import setup_logger

logger = setup_logger(__name__)

logger.info("This is an info message.")
logger.error("This is an error message.")
logger.warning("This is a warning message.")

# # config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config.py'))
# # print(f"Config path: {config_path}")

# Test logging to file directly
# import logging
# from logging.handlers import RotatingFileHandler

# log_file = "C:\\repos\\Tracker_Project\\logs\\test.log"

# logger = logging.getLogger("test_logger")
# logger.setLevel(logging.DEBUG)

# file_handler = RotatingFileHandler(log_file, maxBytes=10000, backupCount=5)
# file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
# logger.addHandler(file_handler)

# logger.debug("Debug message to file.")
# logger.info("Info message to file.")
# logger.error("Error message to file.")