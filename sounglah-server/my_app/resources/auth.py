from flask import Blueprint
from flask_restx import Api, Resource
from ..models import User
from ..jwt_utils import generate_token, verify_password, token_required, get_current_user
from ..parsers import login_args

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
api = Api(auth_bp)

@api.route('/login')
class LoginResource(Resource):
    def post(self):
        args = login_args.parse_args()
        username = args.get('username')
        password = args.get('password')
        
        # Check for missing credentials first
        if not username or not password:
            return {'error': 'Username and password are required'}, 400
            
        user = User.query.filter_by(username=username).first()
        if not user:
            return {'error': 'Invalid username or password'}, 401
        if not verify_password(user.password_hash, password):
            return {'error': 'Invalid username or password'}, 401
        token = generate_token(user.id, user.username, user.role)
        return {
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }

@api.route('/validate')
class ValidateTokenResource(Resource):
    @token_required
    def get(self):
        """Validate the current token and return user info"""
        current_user = get_current_user()
        if not current_user:
            return {'error': 'User not found'}, 401
        
        return {
            'valid': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'role': current_user.role
            }
        } 