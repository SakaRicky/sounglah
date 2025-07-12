from flask import Blueprint, request, Response, stream_with_context
from flask_restx import Api, Resource
from ..models import TranslationPair, Language
from ..jwt_utils import token_required
from ..parsers import get_translations_args
from flask import request
from datetime import datetime
from .. import db
import csv
from io import StringIO

translations_bp = Blueprint('translations', __name__, url_prefix='/api/translations')
api = Api(translations_bp)

@api.route('/list')
class ListTranslationsResource(Resource):
    @token_required
    def get(self):
        args = get_translations_args.parse_args()
        query = TranslationPair.query
        if args.get('source_lang'):
            source_lang = Language.query.filter(
                (Language.name.ilike(f"%{args['source_lang']}%")) |
                (Language.iso_code.ilike(f"%{args['source_lang']}%"))
            ).first()
            if source_lang:
                query = query.filter(TranslationPair.source_lang_id == source_lang.id)
        if args.get('target_lang'):
            target_lang = Language.query.filter(
                (Language.name.ilike(f"%{args['target_lang']}%")) |
                (Language.iso_code.ilike(f"%{args['target_lang']}%"))
            ).first()
            if target_lang:
                query = query.filter(TranslationPair.target_lang_id == target_lang.id)
        if args.get('status'):
            query = query.filter(TranslationPair.status == args['status'])
        if args.get('domain'):
            query = query.filter(TranslationPair.domain.ilike(f"%{args['domain']}%"))
        if args.get('search'):
            search_term = f"%{args['search']}%"
            query = query.filter(
                (TranslationPair.source_text.ilike(search_term)) |
                (TranslationPair.target_text.ilike(search_term))
            )
        # Date range filtering
        created_at_start = args.get('created_at_start')
        created_at_end = args.get('created_at_end')
        from datetime import datetime
        if created_at_start:
            try:
                start_dt = datetime.fromisoformat(created_at_start)
                query = query.filter(TranslationPair.created_at >= start_dt)
            except Exception:
                pass
        if created_at_end:
            try:
                end_dt = datetime.fromisoformat(created_at_end)
                query = query.filter(TranslationPair.created_at <= end_dt)
            except Exception:
                pass
        total_count = query.count()

        # Offset-based pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        query = query.order_by(TranslationPair.id.asc())
        translations = query.offset(offset).limit(limit).all()

        result = []
        for translation in translations:
            source_lang = Language.query.get(translation.source_lang_id)
            target_lang = Language.query.get(translation.target_lang_id)
            result.append({
                'id': translation.id,
                'source_text': translation.source_text,
                'target_text': translation.target_text,
                'source_language': {
                    'id': source_lang.id,
                    'name': source_lang.name,
                    'iso_code': source_lang.iso_code
                } if source_lang else None,
                'target_language': {
                    'id': target_lang.id,
                    'name': target_lang.name,
                    'iso_code': target_lang.iso_code
                } if target_lang else None,
                'status': translation.status,
                'domain': translation.domain,
                'created_at': translation.created_at.isoformat() if translation.created_at else None,
                'updated_at': translation.updated_at.isoformat() if translation.updated_at else None
            })

        return {
            'translations': result,
            'total': total_count,
            'limit': limit,
            'page': page
        }

    @token_required
    def post(self):
        data = request.get_json()
        required_fields = ['source_text', 'target_text', 'source_lang_id', 'target_lang_id']
        for field in required_fields:
            if field not in data or not data[field]:
                return {'error': f'Missing required field: {field}'}, 400
        source_lang = Language.query.get(data['source_lang_id'])
        target_lang = Language.query.get(data['target_lang_id'])
        if not source_lang or not target_lang:
            return {'error': 'Invalid source or target language ID'}, 400
        pair = TranslationPair(
            source_text=data['source_text'],
            target_text=data['target_text'],
            source_lang_id=data['source_lang_id'],
            target_lang_id=data['target_lang_id'],
            status='pending',
            domain=data.get('domain')
        )
        from .. import db
        db.session.add(pair)
        db.session.commit()
        return {
            'id': pair.id,
            'source_text': pair.source_text,
            'target_text': pair.target_text,
            'source_lang_id': pair.source_lang_id,
            'target_lang_id': pair.target_lang_id,
            'status': pair.status,
            'domain': pair.domain,
            'created_at': pair.created_at.isoformat() if pair.created_at else None,
            'updated_at': pair.updated_at.isoformat() if pair.updated_at else None
        }, 201

@api.route('/<int:id>')
class GetTranslationByIdResource(Resource):
    @token_required
    def get(self, id):
        translation = TranslationPair.query.get(id)
        if not translation:
            return {'error': 'Translation not found'}, 404
        source_lang = Language.query.get(translation.source_lang_id)
        target_lang = Language.query.get(translation.target_lang_id)
        return {
            'id': translation.id,
            'source_text': translation.source_text,
            'target_text': translation.target_text,
            'source_language': {
                'id': source_lang.id,
                'name': source_lang.name,
                'iso_code': source_lang.iso_code
            } if source_lang else None,
            'target_language': {
                'id': target_lang.id,
                'name': target_lang.name,
                'iso_code': target_lang.iso_code
            } if target_lang else None,
            'status': translation.status,
            'domain': translation.domain,
            'created_at': translation.created_at.isoformat() if translation.created_at else None,
            'updated_at': translation.updated_at.isoformat() if translation.updated_at else None
        }

    @token_required
    def put(self, id):
        translation = TranslationPair.query.get(id)
        if not translation:
            return {'error': 'Translation not found'}, 404
        data = request.get_json()
        # Update fields if present in request
        if 'source_text' in data:
            translation.source_text = data['source_text']
        if 'target_text' in data:
            translation.target_text = data['target_text']
        if 'source_lang_id' in data:
            translation.source_lang_id = data['source_lang_id']
        if 'target_lang_id' in data:
            translation.target_lang_id = data['target_lang_id']
        if 'status' in data:
            translation.status = data['status']
        if 'domain' in data:
            translation.domain = data['domain']
        translation.updated_at = datetime.utcnow()
        db.session.commit()
        source_lang = Language.query.get(translation.source_lang_id)
        target_lang = Language.query.get(translation.target_lang_id)
        return {
            'id': translation.id,
            'source_text': translation.source_text,
            'target_text': translation.target_text,
            'source_language': {
                'id': source_lang.id,
                'name': source_lang.name,
                'iso_code': source_lang.iso_code
            } if source_lang else None,
            'target_language': {
                'id': target_lang.id,
                'name': target_lang.name,
                'iso_code': target_lang.iso_code
            } if target_lang else None,
            'status': translation.status,
            'domain': translation.domain,
            'created_at': translation.created_at.isoformat() if translation.created_at else None,
            'updated_at': translation.updated_at.isoformat() if translation.updated_at else None
        }

@api.route('/upload_csv', methods=['POST'])
class UploadCSVTranslationsResource(Resource):
    @token_required
    def post(self):
        data = request.get_json()
        if not isinstance(data, list):
            return {'error': 'Expected a list of translation pairs.'}, 400
        results = []
        added = 0
        for idx, row in enumerate(data):
            src_lang_name = row.get('source_language')
            tgt_lang_name = row.get('target_language')
            source_lang = Language.query.filter(Language.name.ilike(src_lang_name)).first()
            target_lang = Language.query.filter(Language.name.ilike(tgt_lang_name)).first()
            if not source_lang or not target_lang:
                results.append({
                    'row': idx + 1,
                    'source_text': row.get('source_text', ''),
                    'target_text': row.get('target_text', ''),
                    'source_language': src_lang_name,
                    'target_language': tgt_lang_name,
                    'status': 'error',
                    'error': 'Source or target language not found.'
                })
                continue
            pair = TranslationPair(
                source_text=row.get('source_text', ''),
                target_text=row.get('target_text', ''),
                source_lang_id=source_lang.id,
                target_lang_id=target_lang.id,
                status='pending',
                domain=row.get('domain')
            )
            db.session.add(pair)
            added += 1
            results.append({
                'row': idx + 1,
                'source_text': pair.source_text,
                'target_text': pair.target_text,
                'source_language': src_lang_name,
                'target_language': tgt_lang_name,
                'status': 'added'
            })
        db.session.commit()
        return {
            'added': added,
            'total': len(data),
            'results': results
        }

@api.route('/bulk_update', methods=['POST'])
class BulkUpdateTranslationsResource(Resource):
    @token_required
    def post(self):
        data = request.get_json()
        ids = data.get('ids')
        status = data.get('status')
        if not isinstance(ids, list) or not status:
            return {'error': 'Missing ids or status'}, 400
        success = []
        failed = []
        for id in ids:
            translation = TranslationPair.query.get(id)
            if not translation:
                failed.append(id)
                continue
            translation.status = status
            translation.updated_at = datetime.utcnow()
            try:
                db.session.add(translation)
                success.append(id)
            except Exception:
                failed.append(id)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Database error during bulk update.'}, 500
        return {
            'success': success,
            'failed': failed,
            'updated_status': status
        }

@api.route('/export', methods=['GET'])
class ExportTranslationsResource(Resource):
    @token_required
    def get(self):
        # Parse filters
        ids = request.args.get('ids')
        status = request.args.get('status')
        source_lang = request.args.get('source_lang')
        target_lang = request.args.get('target_lang')
        domain = request.args.get('domain')
        created_at_start = request.args.get('created_at_start')
        created_at_end = request.args.get('created_at_end')

        query = TranslationPair.query
        if ids:
            id_list = [int(i) for i in ids.split(',') if i.strip().isdigit()]
            query = query.filter(TranslationPair.id.in_(id_list))
        if status:
            query = query.filter(TranslationPair.status == status)
        if source_lang:
            lang = Language.query.filter(
                (Language.name.ilike(f"%{source_lang}%")) |
                (Language.iso_code.ilike(f"%{source_lang}%"))
            ).first()
            if lang:
                query = query.filter(TranslationPair.source_lang_id == lang.id)
        if target_lang:
            lang = Language.query.filter(
                (Language.name.ilike(f"%{target_lang}%")) |
                (Language.iso_code.ilike(f"%{target_lang}%"))
            ).first()
            if lang:
                query = query.filter(TranslationPair.target_lang_id == lang.id)
        if domain:
            query = query.filter(TranslationPair.domain.ilike(f"%{domain}%"))
        # Date range filtering
        if created_at_start:
            try:
                start_dt = datetime.fromisoformat(created_at_start)
                query = query.filter(TranslationPair.created_at >= start_dt)
            except Exception:
                pass
        if created_at_end:
            try:
                end_dt = datetime.fromisoformat(created_at_end)
                query = query.filter(TranslationPair.created_at <= end_dt)
            except Exception:
                pass
        query = query.order_by(TranslationPair.id.asc())

        @stream_with_context
        def generate():
            output = StringIO()
            writer = csv.writer(output)
            # Write header
            writer.writerow([
                'id', 'source_text', 'target_text', 'source_language', 'target_language',
                'status', 'domain', 'created_at', 'updated_at', 'reviewer_id'
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)
            # Stream rows
            for row in query.yield_per(1000):
                source_lang = Language.query.get(row.source_lang_id)
                target_lang = Language.query.get(row.target_lang_id)
                writer.writerow([
                    row.id,
                    row.source_text,
                    row.target_text,
                    source_lang.name if source_lang else '',
                    target_lang.name if target_lang else '',
                    row.status,
                    row.domain,
                    row.created_at.isoformat() if row.created_at else '',
                    row.updated_at.isoformat() if row.updated_at else '',
                    row.reviewer_id or ''
                ])
                yield output.getvalue()
                output.seek(0)
                output.truncate(0)

        headers = {
            'Content-Disposition': 'attachment; filename=translations_export.csv',
            'Content-Type': 'text/csv; charset=utf-8'
        }
        return Response(generate(), headers=headers)