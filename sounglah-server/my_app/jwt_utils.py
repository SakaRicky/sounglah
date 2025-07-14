import jwt
import os
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app, g

# JWT configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def generate_token(user_id, username, role_name):
    """Generate a JWT token for a user. Expects role_name as a string."""
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role_name,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token):
    """Verify a JWT token and return the payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require JWT token for protected endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return {'error': 'Invalid token format'}, 401
        
        if not token:
            return {'error': 'Token is missing'}, 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return {'error': 'Invalid or expired token'}, 401
        
        # Get user from database
        from my_app.models import User
        user = User.query.get(payload['user_id'])
        if not user:
            return {'error': 'User not found'}, 401
        
        # Add user to Flask's g object
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated

def get_current_user():
    """Get current user from Flask's g object"""
    return getattr(g, 'current_user', None)

def verify_password(password_hash, password):
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception:
        return False 