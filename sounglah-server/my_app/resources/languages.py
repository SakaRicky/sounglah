from flask import Blueprint, request
from flask_restx import Api, Resource
from ..models import Language
from ..jwt_utils import token_required
from .. import db

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

@api.route('/<int:language_id>')
class LanguageResource(Resource):
    @token_required
    def get(self, language_id):
        language = Language.query.get(language_id)
        if not language:
            return {'error': 'Language not found'}, 404
        return {
            'id': language.id,
            'name': language.name,
            'iso_code': language.iso_code,
            'region': language.region,
            'description': language.description
        }

    @token_required
    def put(self, language_id):
        language = Language.query.get(language_id)
        if not language:
            return {'error': 'Language not found'}, 404
        
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        # Update fields if provided
        if 'name' in data:
            # Check if name is unique (excluding current language)
            existing = Language.query.filter(Language.name == data['name'], Language.id != language_id).first()
            if existing:
                return {'error': 'Language name already exists'}, 400
            language.name = data['name']
        
        if 'iso_code' in data:
            language.iso_code = data['iso_code']
        
        if 'region' in data:
            language.region = data['region']
        
        if 'description' in data:
            language.description = data['description']
        
        db.session.commit()
        return {
            'id': language.id,
            'name': language.name,
            'iso_code': language.iso_code,
            'region': language.region,
            'description': language.description
        }

    @token_required
    def delete(self, language_id):
        language = Language.query.get(language_id)
        if not language:
            return {'error': 'Language not found'}, 404
        
        # Check if language is being used in translations
        from ..models import TranslationPair
        source_usage = TranslationPair.query.filter_by(source_lang_id=language_id).first()
        target_usage = TranslationPair.query.filter_by(target_lang_id=language_id).first()
        
        if source_usage or target_usage:
            return {'error': 'Cannot delete language that is being used in translations'}, 400
        
        db.session.delete(language)
        db.session.commit()
        return {'message': 'Language deleted successfully'}

@api.route('')
class CreateLanguageResource(Resource):
    @token_required
    def post(self):
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        required_fields = ['name']
        for field in required_fields:
            if field not in data or not data[field]:
                return {'error': f'Missing required field: {field}'}, 400
        
        # Check if language name already exists
        existing = Language.query.filter_by(name=data['name']).first()
        if existing:
            return {'error': 'Language name already exists'}, 400
        
        language = Language(
            name=data['name'],
            iso_code=data.get('iso_code'),
            region=data.get('region'),
            description=data.get('description')
        )
        
        db.session.add(language)
        db.session.commit()
        
        return {
            'id': language.id,
            'name': language.name,
            'iso_code': language.iso_code,
            'region': language.region,
            'description': language.description
        }, 201 