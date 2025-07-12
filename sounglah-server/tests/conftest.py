import pytest
import os
import bcrypt
from my_app import create_app, db
from my_app.models import User, Language, TranslationPair
from my_app.jwt_utils import generate_token

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Use test database
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers(sample_user):
    """Create authentication headers with a test token."""
    def _auth_headers(user_id=None, username=None, role=None):
        if user_id is None:
            user_id = sample_user['id']
        if username is None:
            username = sample_user['username']
        if role is None:
            role = sample_user['role']
        token = generate_token(user_id, username, role)
        return {'Authorization': f'Bearer {token}'}
    return _auth_headers

@pytest.fixture
def sample_user(app):
    """Create a sample user for testing."""
    with app.app_context():
        password = '12345678'
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = User(
            username='admin',
            email='admin@example.com',
            password_hash=password_hash,
            role='admin'
        )
        db.session.add(user)
        db.session.commit()
        # Return the user ID and other data to avoid detached instance issues
        return {
            'id': user.id,
            'username': user.username,
            'role': user.role
        }

@pytest.fixture
def sample_languages(app):
    """Create sample languages for testing."""
    with app.app_context():
        languages = [
            Language(name='English', iso_code='en'),
            Language(name='French', iso_code='fr'),
            Language(name='Spanish', iso_code='es')
        ]
        for lang in languages:
            db.session.add(lang)
        db.session.commit()
        # Return the IDs instead of the objects to avoid detached instance issues
        return [lang.id for lang in languages]

@pytest.fixture
def sample_translation(app, sample_languages):
    """Create a sample translation for testing."""
    with app.app_context():
        translation = TranslationPair(
            source_text='Hello world',
            target_text='Bonjour le monde',
            source_lang_id=sample_languages[0],  # English ID
            target_lang_id=sample_languages[1],  # French ID
            status='pending',
            domain='test'
        )
        db.session.add(translation)
        db.session.commit()
        # Return the translation ID to avoid detached instance issues
        return {'id': translation.id} 