from flask import Blueprint, request
from flask_restx import Api, Resource
from ..models import User, Role
from .. import db
from ..jwt_utils import token_required
import bcrypt

users_bp = Blueprint('users', __name__, url_prefix='/api/users')
api = Api(users_bp)

@api.route('/list')
class ListUsersResource(Resource):
    @token_required
    def get(self):
        role = request.args.get('role')
        query = User.query
        if role:
            role_obj = Role.query.filter_by(name=role).first()
            if role_obj:
                query = query.filter_by(role_id=role_obj.id)
        users = query.all()
        return {
            'users': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role.name if user.role else None,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
                for user in users
            ]
        }

@api.route('/')
@api.route('')  # Handle both /api/users and /api/users/
class CreateUserResource(Resource):
    @token_required
    def post(self):
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return {'error': f'Missing required field: {field}'}, 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Handle role assignment - support both 'role' (string) and 'role_id' (number)
        role_obj = None
        if 'role_id' in data and data['role_id']:
            # Frontend sends role_id as number
            role_obj = Role.query.get(data['role_id'])
            if not role_obj:
                return {'error': f'Role with ID {data["role_id"]} does not exist'}, 400
        elif 'role' in data and data['role']:
            # Backend expects role as string
            role_name = data['role']
            role_obj = Role.query.filter_by(name=role_name).first()
            if not role_obj:
                return {'error': f'Role {role_name} does not exist'}, 400
        else:
            # Default to 'editor' role if no role specified
            role_obj = Role.query.filter_by(name='editor').first()
            if not role_obj:
                return {'error': 'Default editor role does not exist'}, 400
        
        # Validate username and email uniqueness
        if User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 409
        
        if User.query.filter_by(email=email).first():
            return {'error': 'Email already exists'}, 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        try:
            user = User(
                username=username,
                email=email,
                password_hash=password_hash,
                role_id=role_obj.id
            )
            db.session.add(user)
            db.session.commit()
            
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else None,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create user'}, 500

@api.route('/<int:user_id>')
class UpdateDeleteUserResource(Resource):
    @token_required
    def put(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        
        try:
            # Update username if provided
            if 'username' in data:
                username = data['username'].strip()
                if not username:
                    return {'error': 'Username cannot be empty'}, 400
                # Check if username already exists (excluding current user)
                existing_user = User.query.filter_by(username=username).first()
                if existing_user and existing_user.id != user_id:
                    return {'error': 'Username already exists'}, 409
                user.username = username
            
            # Update email if provided
            if 'email' in data:
                email = data['email'].strip().lower()
                if not email:
                    return {'error': 'Email cannot be empty'}, 400
                # Check if email already exists (excluding current user)
                existing_user = User.query.filter_by(email=email).first()
                if existing_user and existing_user.id != user_id:
                    return {'error': 'Email already exists'}, 409
                user.email = email
            
            # Update password if provided
            if 'password' in data and data['password']:
                password = data['password']
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user.password_hash = password_hash
            
            # Update role if provided
            if 'role_id' in data:
                role_id = data['role_id']
                role_obj = Role.query.get(role_id)
                if not role_obj:
                    return {'error': 'Role not found'}, 400
                user.role_id = role_id
            
            db.session.commit()
            
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else None,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update user'}, 500

    @token_required
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        try:
            # Prevent deletion of the last admin user
            if user.role and user.role.name == 'admin':
                admin_count = User.query.join(Role).filter(Role.name == 'admin').count()
                if admin_count <= 1:
                    return {'error': 'Cannot delete the last admin user'}, 400
            
            # Store user info for response
            username = user.username
            
            db.session.delete(user)
            db.session.commit()
            
            return {
                'message': 'User deleted successfully',
                'deleted_user': {
                    'id': user_id,
                    'username': username
                }
            }
            
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete user'}, 500

roles_bp = Blueprint('roles', __name__, url_prefix='/api/roles')
roles_api = Api(roles_bp)

@roles_api.route('/list')
class ListRolesResource(Resource):
    @token_required
    def get(self):
        roles = Role.query.all()
        return {
            'roles': [
                {
                    'id': role.id,
                    'name': role.name,
                    'description': role.description
                }
                for role in roles
            ]
        }

@roles_api.route('/')
class CreateRoleResource(Resource):
    @token_required
    def post(self):
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        if not name:
            return {'error': 'Role name is required'}, 400
        if Role.query.filter_by(name=name).first():
            return {'error': 'Role already exists'}, 409
        role = Role(name=name, description=description)
        db.session.add(role)
        db.session.commit()
        return {
            'id': role.id,
            'name': role.name,
            'description': role.description
        }, 201

@roles_api.route('/<int:role_id>')
class UpdateDeleteRoleResource(Resource):
    @token_required
    def put(self, role_id):
        role = Role.query.get(role_id)
        if not role:
            return {'error': 'Role not found'}, 404
        data = request.get_json()
        if 'name' in data:
            if Role.query.filter(Role.name == data['name'], Role.id != role_id).first():
                return {'error': 'Role name already exists'}, 409
            role.name = data['name']
        if 'description' in data:
            role.description = data['description']
        db.session.commit()
        return {
            'id': role.id,
            'name': role.name,
            'description': role.description
        }

    @token_required
    def delete(self, role_id):
        role = Role.query.get(role_id)
        if not role:
            return {'error': 'Role not found'}, 404
        db.session.delete(role)
        db.session.commit()
        return {'message': 'Role deleted'}