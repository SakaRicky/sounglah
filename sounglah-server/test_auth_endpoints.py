#!/usr/bin/env python3
"""
Test script for authentication endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_login():
    """Test login endpoint"""
    print("Testing POST /api/login...")
    
    # Test with correct credentials
    login_data = {
        'username': 'admin',
        'password': '12345678'
    }
    
    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"Token: {data['token'][:50]}...")
        print(f"User: {data['user']['username']} ({data['user']['role']})")
        return data['token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_protected_endpoint_without_token():
    """Test protected endpoint without token"""
    print("\nTesting GET /api/translations without token...")
    response = requests.get(f"{BASE_URL}/api/translations")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 401:
        print("✅ Correctly rejected request without token")
    else:
        print(f"❌ Unexpected response: {response.text}")

def test_protected_endpoint_with_token(token):
    """Test protected endpoint with token"""
    if not token:
        print("❌ No token available, skipping test")
        return
    
    print("\nTesting GET /api/translations with token...")
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/api/translations", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Successfully accessed protected endpoint!")
        print(f"Found {data['total_count']} translations")
    else:
        print(f"❌ Failed to access protected endpoint: {response.text}")

def test_languages_with_token(token):
    """Test languages endpoint with token"""
    if not token:
        print("❌ No token available, skipping test")
        return
    
    print("\nTesting GET /api/languages with token...")
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/api/languages", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Successfully accessed languages endpoint!")
        print(f"Found {len(data['languages'])} languages")
    else:
        print(f"❌ Failed to access languages endpoint: {response.text}")

def test_invalid_token():
    """Test with invalid token"""
    print("\nTesting GET /api/translations with invalid token...")
    headers = {'Authorization': 'Bearer invalid_token_here'}
    response = requests.get(f"{BASE_URL}/api/translations", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 401:
        print("✅ Correctly rejected invalid token")
    else:
        print(f"❌ Unexpected response: {response.text}")

if __name__ == "__main__":
    print("Testing Authentication Endpoints")
    print("=" * 40)
    
    try:
        # Test login
        token = test_login()
        
        # Test protected endpoints without token
        test_protected_endpoint_without_token()
        
        # Test with invalid token
        test_invalid_token()
        
        # Test protected endpoints with valid token
        if token:
            test_protected_endpoint_with_token(token)
            test_languages_with_token(token)
        
        print("\n🎉 All authentication tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Make sure the Flask app is running on localhost:5000")
    except Exception as e:
        print(f"Error: {e}") 