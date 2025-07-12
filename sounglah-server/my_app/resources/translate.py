from flask import Blueprint, request, jsonify, current_app
from flask_restx import Api, Resource

translate_bp = Blueprint('translate', __name__, url_prefix='/api/translate')
api = Api(translate_bp)

@api.route('/')
class TranslateResource(Resource):
    def post(self):
        data = request.get_json()
        text_to_translate = data.get('text')
        src_language = data.get('srcLanguage')
        target_language = data.get('targetLanguage')

        if not text_to_translate:
            return {'error': 'Text to translate is missing'}, 400
        if not src_language or not target_language:
            return {'error': 'Source or target language is missing'}, 400

        # Get model and tokenizer from app context
        tokenizer_instance = current_app.extensions.get('ml_tokenizer')
        model_instance = current_app.extensions.get('ml_model')
        if not tokenizer_instance or not model_instance:
            return {'error': 'Translation model is not available'}, 500

        # Run translation
        translated_ids = model_instance.generate(**tokenizer_instance(text_to_translate, return_tensors="pt", padding=True, truncation=True))
        with tokenizer_instance.as_target_tokenizer():
            results = [tokenizer_instance.decode(t_id, skip_special_tokens=True) for t_id in translated_ids]

        return jsonify({
            'translate': {
                'srcLanguage': src_language,
                'targetLanguage': target_language,
                'fullTranslation': results
            }
        }) 