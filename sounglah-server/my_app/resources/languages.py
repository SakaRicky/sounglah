from flask import Blueprint
from flask_restx import Api, Resource
from ..models import Language
from ..jwt_utils import token_required

languages_bp = Blueprint('languages', __name__, url_prefix='/api/languages')
api = Api(languages_bp)

@api.route('/list')
class ListLanguagesResource(Resource):
    @token_required
    def get(self):
        languages = Language.query.all()
        return {
            'languages': [
                {
                    'id': lang.id,
                    'name': lang.name,
                    'iso_code': lang.iso_code,
                    'region': lang.region,
                    'description': lang.description
                }
                for lang in languages
            ]
        } 