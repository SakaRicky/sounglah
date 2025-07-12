from flask import Blueprint, request
from flask_restx import Api, Resource
from ..models import User

users_bp = Blueprint('users', __name__, url_prefix='/api/users')
api = Api(users_bp)

@api.route('/list')
class ListUsersResource(Resource):
    def get(self):
        role = request.args.get('role')
        query = User.query
        if role:
            query = query.filter_by(role=role)
        users = query.all()
        return {
            'users': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
                for user in users
            ]
        } 