import pytest
import json

class TestBasicEndpoints:
    """Basic test cases to demonstrate pytest benefits."""
    
    def test_health_check(self, client):
        """Test that the server is running."""
        response = client.get('/')
        assert response.status_code in [200, 404]  # Either serves app or 404 for API routes
    
    def test_languages_unauthorized(self, client):
        """Test that languages endpoint requires authentication."""
        response = client.get('/api/languages/list')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_translations_unauthorized(self, client):
        """Test that translations endpoint requires authentication."""
        response = client.get('/api/translations/list')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_invalid_endpoint(self, client):
        """Test that invalid endpoints return 404."""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404

class TestAuthentication:
    """Test authentication functionality."""
    
    def test_login_missing_credentials(self, client):
        """Test login with missing credentials."""
        response = client.post('/api/login/', json={})
        assert response.status_code == 400
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        response = client.post('/api/login/', json={
            'username': 'invalid',
            'password': 'invalid'
        })
        assert response.status_code == 401
    
    def test_login_success(self, client, sample_user):
        """Test successful login."""
        response = client.post('/api/login/', json={
            'username': 'admin',
            'password': '12345678'
        })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
        assert 'user' in data
        assert data['user']['username'] == 'admin'