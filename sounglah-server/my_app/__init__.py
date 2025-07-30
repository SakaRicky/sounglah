from flask import Flask, send_from_directory, request, abort
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
    # This path calculation is correct for your structure.
    app_root = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(app_root)
    static_folder = os.path.join(project_root, 'frontend_build')

    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder=static_folder,
        static_url_path=''
    )
    
    load_dotenv()
    # ... Your Database and other config is fine ...
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    if app.config['SQLALCHEMY_DATABASE_URI'] is None:
        raise ValueError("DATABASE_URL environment variable is not set!")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # ... Database connection test is fine ...
    with app.app_context():
        try:
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful!")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise

    CORS(app)
    
    # ... Model loading is fine ...
    global tokenizer_instance, model_instance, models_loaded_successfully
    tokenizer_instance, model_instance = model_loader.load_models()
    models_loaded_successfully = tokenizer_instance is not None and model_instance is not None
    if models_loaded_successfully:
        app.extensions["ml_tokenizer"] = tokenizer_instance
        app.extensions["ml_model"] = model_instance
        logger.info("Models are available")
    else:
        logger.warning("Models were not loaded successfully; translation endpoint will fail.")

    # ... Shell context is fine ...
    from my_app.models import Language, TranslationPair, AudioRecording, User
    @app.shell_context_processor
    def make_shell_context():
        return {'db': db, 'Language': Language, 'TranslationPair': TranslationPair, 'AudioRecording': AudioRecording, 'User': User}

    # --- Blueprint registration is correct ---
    from .resources.translations import translations_bp
    from .resources.users import users_bp, roles_bp
    from .resources.auth import auth_bp
    from .resources.languages import languages_bp
    from .resources.detectlang import detectlang_bp
    from .resources.translate import translate_bp
    app.register_blueprint(translations_bp, url_prefix='/api/translations')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(roles_bp, url_prefix='/api/roles')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(languages_bp, url_prefix='/api/languages')
    app.register_blueprint(detectlang_bp, url_prefix='/api/detectlang')
    app.register_blueprint(translate_bp, url_prefix='/api/translate')

    # --- Serve React App (SPA Routing) ---
    @app.route('/')
    def serve_home():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/translate')
    def serve_translate():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/login')
    def serve_login():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/dashboard')
    def serve_dashboard():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/users')
    def serve_users():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/translations')
    def serve_translations():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    @app.route('/languages')
    def serve_languages():
        return send_from_directory(app.static_folder or "../frontend_build", 'index.html')
    
    # Catch-all for any other routes (but not API routes)


    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # If the requested path is a real file (like manifest.json), serve it
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        # Otherwise, it's a client-side route (like /translate), so serve index.html
        else:
            return send_from_directory(app.static_folder, 'index.html')
        
    return app