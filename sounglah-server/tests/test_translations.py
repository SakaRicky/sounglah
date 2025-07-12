import pytest
import json
from my_app.models import TranslationPair, Language

class TestTranslationEndpoints:
    """Test cases for translation endpoints."""
    
    def test_get_languages(self, client, auth_headers, sample_languages):
        """Test getting all languages."""
        response = client.get('/api/languages/list', headers=auth_headers())
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'languages' in data
        assert len(data['languages']) == 3
        assert data['languages'][0]['name'] == 'English'
        assert data['languages'][0]['iso_code'] == 'en'
    
    def test_get_languages_unauthorized(self, client):
        """Test getting languages without authentication."""
        response = client.get('/api/languages/list')
        assert response.status_code == 401
    
    def test_get_translations(self, client, auth_headers, sample_translation):
        """Test getting all translations."""
        response = client.get('/api/translations/list', headers=auth_headers())
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'translations' in data
        assert 'total_count' in data
        assert data['total_count'] == 1
        assert len(data['translations']) == 1
        assert data['translations'][0]['source_text'] == 'Hello world'
        assert data['translations'][0]['target_text'] == 'Bonjour le monde'
    
    def test_get_translations_with_filters(self, client, auth_headers, sample_languages):
        """Test getting translations with filters."""
        # Create multiple translations for filtering
        with client.application.app_context():
            from my_app import db
            translations = [
                TranslationPair(
                    source_text='Hello world',
                    target_text='Bonjour le monde',
                    source_lang_id=sample_languages[0],  # English ID
                    target_lang_id=sample_languages[1],  # French ID
                    status='pending'
                ),
                TranslationPair(
                    source_text='Goodbye',
                    target_text='Au revoir',
                    source_lang_id=sample_languages[0],  # English ID
                    target_lang_id=sample_languages[1],  # French ID
                    status='approved'
                )
            ]
            for trans in translations:
                db.session.add(trans)
            db.session.commit()
        
        # Test filter by status
        response = client.get(
            '/api/translations/list?status=pending',
            headers=auth_headers()
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['total_count'] == 1
        assert data['translations'][0]['status'] == 'pending'
    
    def test_get_translation_by_id(self, client, auth_headers, sample_translation):
        """Test getting a specific translation by ID."""
        response = client.get(
            f'/api/translations/{sample_translation["id"]}',
            headers=auth_headers()
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_translation['id']
        assert data['source_text'] == 'Hello world'
        assert data['target_text'] == 'Bonjour le monde'
        assert data['status'] == 'pending'
    
    def test_get_translation_not_found(self, client, auth_headers):
        """Test getting a non-existent translation."""
        response = client.get('/api/translations/999', headers=auth_headers())
        assert response.status_code == 404
    
    def test_create_translation_pair(self, client, auth_headers, sample_languages):
        """Test creating a new translation pair."""
        translation_data = {
            'source_text': 'Hello, this is a test translation',
            'target_text': 'Bonjour, ceci est une traduction de test',
            'source_lang_id': sample_languages[0],  # English ID
            'target_lang_id': sample_languages[1],  # French ID
            'domain': 'test'
        }

        response = client.post(
            '/api/translations/list',
            data=json.dumps(translation_data),
            content_type='application/json',
            headers=auth_headers()
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'id' in data
        assert data['source_text'] == translation_data['source_text']
        assert data['target_text'] == translation_data['target_text']
        assert data['status'] == 'pending'
        assert data['domain'] == 'test'
        
        # Verify it's actually saved in the database
        with client.application.app_context():
            saved_translation = TranslationPair.query.get(data['id'])
            assert saved_translation is not None
            assert saved_translation.source_text == translation_data['source_text']
            assert saved_translation.target_text == translation_data['target_text']
    
    def test_create_translation_missing_fields(self, client, auth_headers):
        """Test creating translation with missing required fields."""
        incomplete_data = {
            'source_text': 'Hello world'
            # Missing target_text, source_lang_id, target_lang_id
        }
        
        response = client.post(
            '/api/translations/list',
            data=json.dumps(incomplete_data),
            content_type='application/json',
            headers=auth_headers()
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_translation_invalid_language_ids(self, client, auth_headers):
        """Test creating translation with invalid language IDs."""
        translation_data = {
            'source_text': 'Hello world',
            'target_text': 'Bonjour le monde',
            'source_lang_id': 999,  # Non-existent language
            'target_lang_id': 998   # Non-existent language
        }
        
        response = client.post(
            '/api/translations/list',
            data=json.dumps(translation_data),
            content_type='application/json',
            headers=auth_headers()
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_translation_workflow(self, client, auth_headers, sample_languages):
        """Test complete translation workflow: create, retrieve, verify."""
        # Step 1: Create translation
        translation_data = {
            'source_text': 'Test workflow translation',
            'target_text': 'Traduction de test du workflow',
            'source_lang_id': sample_languages[0],
            'target_lang_id': sample_languages[1],
            'domain': 'workflow_test'
        }
        
        create_response = client.post(
            '/api/translations/list',
            data=json.dumps(translation_data),
            content_type='application/json',
            headers=auth_headers()
        )
        
        assert create_response.status_code == 201
        created_data = json.loads(create_response.data)
        translation_id = created_data['id']
        
        # Step 2: Retrieve the created translation
        retrieve_response = client.get(
            f'/api/translations/{translation_id}',
            headers=auth_headers()
        )
        
        assert retrieve_response.status_code == 200
        retrieved_data = json.loads(retrieve_response.data)
        
        # Step 3: Verify data integrity
        assert retrieved_data['id'] == translation_id
        assert retrieved_data['source_text'] == translation_data['source_text']
        assert retrieved_data['target_text'] == translation_data['target_text']
        assert retrieved_data['source_language']['id'] == translation_data['source_lang_id']
        assert retrieved_data['target_language']['id'] == translation_data['target_lang_id']
        assert retrieved_data['domain'] == translation_data['domain']
        assert retrieved_data['status'] == 'pending'
        
        # Step 4: Verify in database directly
        with client.application.app_context():
            db_translation = TranslationPair.query.get(translation_id)
            assert db_translation is not None
            assert db_translation.source_text == translation_data['source_text']
            assert db_translation.target_text == translation_data['target_text']
            assert db_translation.source_lang_id == translation_data['source_lang_id']
            assert db_translation.target_lang_id == translation_data['target_lang_id']
            assert db_translation.domain == translation_data['domain'] 