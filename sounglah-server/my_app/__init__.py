from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
import logging
from . import model_loader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = SQLAlchemy()

def create_app(config_object=None):
    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="../frontend_build",
        static_url_path=''
    )
    load_dotenv()
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    if app.config['SQLALCHEMY_DATABASE_URI'] is None:
        raise ValueError("DATABASE_URL environment variable is not set!")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate = Migrate(app, db)
    CORS(app, origins="*")

    # Model loading
    global tokenizer_instance, model_instance, models_loaded_successfully
    tokenizer_instance, model_instance = model_loader.load_models()
    models_loaded_successfully = tokenizer_instance is not None and model_instance is not None
    if models_loaded_successfully:
        app.extensions["ml_tokenizer"] = tokenizer_instance
        app.extensions["ml_model"] = model_instance
        logger.info("Models are available")
    else:
        logger.warning("Models were not loaded successfully; translation endpoint will fail.")

    from my_app.models import Language, TranslationPair, AudioRecording, User
    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'Language': Language,
            'TranslationPair': TranslationPair,
            'AudioRecording': AudioRecording,
            'User': User
        }

    # Register Blueprints
    from .resources.translations import translations_bp
    from .resources.users import users_bp
    from .resources.auth import auth_bp
    from .resources.languages import languages_bp
    from .resources.detectlang import detectlang_bp
    from .resources.translate import translate_bp
    app.register_blueprint(translations_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(languages_bp)
    app.register_blueprint(detectlang_bp)
    app.register_blueprint(translate_bp)

    # --- Serve React App ---
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        static_folder = app.static_folder or "../frontend_build"
        full_path_to_file = os.path.join(static_folder, path)
        if path != "" and os.path.exists(full_path_to_file) and os.path.isfile(full_path_to_file):
            return send_from_directory(static_folder, path)
        else:
            return send_from_directory(static_folder, 'index.html')
        
    return app