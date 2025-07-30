from flask import Blueprint, jsonify, request
from flask_restx import Api, Resource
from ..parsers import detect_lang_args
import langid

detectlang_bp = Blueprint('detectlang', __name__)
api = Api(detectlang_bp)

@api.route('/')
@api.route('')  # Handle both with and without trailing slash
class DetectLangResource(Resource):
    def post(self):
        data = request.get_json()

        text = data.get('text_to_detect_lang', '')
        lang, confidence = langid.classify(text)

        print(f"lang: {lang}")
        print(f"confidence: {confidence}")
        print(f"Text: {text} lang: {lang} Confidence {confidence:.2f})")

        return jsonify({
            'language': lang,
            'confidence': confidence
        })