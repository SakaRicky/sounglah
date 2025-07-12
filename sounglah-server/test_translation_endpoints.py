#!/usr/bin/env python3
"""
Test script for translation endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def get_auth_token():
    """Get authentication token for testing"""
    login_data = {
        'username': 'admin',
        'password': '12345678'
    }
    
    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    if response.status_code == 200:
        return response.json()['token']
    else:
        print(f"Failed to get auth token: {response.text}")
        return None

def test_get_languages():
    """Test getting all languages"""
    print("Testing GET /api/languages/list...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token, skipping test")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/api/languages/list", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data['languages'])} languages")
        for lang in data['languages'][:3]:  # Show first 3
            print(f"  - {lang['name']} ({lang['iso_code']})")
    else:
        print(f"Error: {response.text}")
    print()

def test_get_translations():
    """Test getting translations with filters"""
    print("Testing GET /api/translations/list...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token, skipping test")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test basic query
    response = requests.get(f"{BASE_URL}/api/translations/list", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {data['total_count']} translations")
        if data['translations']:
            print("Sample translation:")
            trans = data['translations'][0]
            print(f"  ID: {trans['id']}")
            print(f"  Source: {trans['source_text'][:50]}...")
            print(f"  Target: {trans['target_text'][:50]}...")
            print(f"  Status: {trans['status']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_get_translations_with_filters():
    """Test getting translations with filters"""
    print("Testing GET /api/translations/list with filters...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token, skipping test")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test with source language filter
    params = {
        'source_lang': 'English',
        'limit': 5
    }
    response = requests.get(f"{BASE_URL}/api/translations/list", params=params, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {data['total_count']} translations with source_lang=English")
    else:
        print(f"Error: {response.text}")
    print()

def test_get_translation_by_id():
    """Test getting a specific translation by ID"""
    print("Testing GET /api/translations/1...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token, skipping test")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/api/translations/list/1", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Translation ID: {data['id']}")
        print(f"Source: {data['source_text']}")
        print(f"Target: {data['target_text']}")
        print(f"Status: {data['status']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_create_and_verify_translation_pair():
    """Test creating a translation pair and verifying it's saved in the database"""
    print("Testing POST /api/translations - Create and verify translation pair...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token, skipping test")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # First, get available languages to use valid language IDs
    languages_response = requests.get(f"{BASE_URL}/api/languages/list", headers=headers)
    if languages_response.status_code != 200:
        print(f"❌ Failed to get languages: {languages_response.text}")
        return
    
    languages = languages_response.json()['languages']
    if len(languages) < 2:
        print("❌ Need at least 2 languages for testing")
        return
    
    # Use first two languages for the test
    source_lang = languages[0]
    target_lang = languages[1]
    
    # Create test translation data
    test_translation = {
        'source_text': 'Hello, this is a test translation',
        'target_text': 'Bonjour, ceci est une traduction de test',
        'source_lang_id': source_lang['id'],
        'target_lang_id': target_lang['id'],
        'domain': 'test'
    }
    
    print(f"Creating translation pair:")
    print(f"  Source: {test_translation['source_text']}")
    print(f"  Target: {test_translation['target_text']}")
    print(f"  Source Language: {source_lang['name']} ({source_lang['iso_code']})")
    print(f"  Target Language: {target_lang['name']} ({target_lang['iso_code']})")
    
    # Create the translation pair - use the correct endpoint
    create_response = requests.post(
        f"{BASE_URL}/api/translations/list", 
        json=test_translation,
        headers=headers,
        allow_redirects=False  # Prevent redirect issues
    )
    
    print(f"Create Status: {create_response.status_code}")
    
    if create_response.status_code == 201:
        created_data = create_response.json()
        translation_id = created_data['id']
        print(f"✅ Translation pair created successfully!")
        print(f"  Created ID: {translation_id}")
        print(f"  Status: {created_data['status']}")
        
        # Verify the translation is saved by retrieving it
        print(f"\nVerifying translation is saved in database...")
        verify_response = requests.get(
            f"{BASE_URL}/api/translations/list/{translation_id}",
            headers=headers
        )
        
        print(f"Verify Status: {verify_response.status_code}")
        
        if verify_response.status_code == 200:
            retrieved_data = verify_response.json()
            print(f"✅ Translation successfully retrieved from database!")
            print(f"  Retrieved ID: {retrieved_data['id']}")
            print(f"  Source Text: {retrieved_data['source_text']}")
            print(f"  Target Text: {retrieved_data['target_text']}")
            print(f"  Status: {retrieved_data['status']}")
            print(f"  Domain: {retrieved_data['domain']}")
            
            # Verify the data matches what we created
            if (retrieved_data['source_text'] == test_translation['source_text'] and
                retrieved_data['target_text'] == test_translation['target_text'] and
                retrieved_data['source_language']['id'] == test_translation['source_lang_id'] and
                retrieved_data['target_language']['id'] == test_translation['target_lang_id']):
                print("✅ All data matches - translation pair successfully saved!")
            else:
                print("❌ Data mismatch - translation may not be saved correctly")
        else:
            print(f"❌ Failed to retrieve translation: {verify_response.text}")
    else:
        print(f"❌ Failed to create translation pair: {create_response.text}")
        if create_response.status_code == 308:  # Redirect
            print("  This might be a redirect issue. Trying with trailing slash...")
            # Try with trailing slash
            create_response = requests.post(
                f"{BASE_URL}/api/translations/", 
                json=test_translation,
                headers=headers
            )
            print(f"Retry Status: {create_response.status_code}")
            if create_response.status_code == 201:
                print("✅ Success with trailing slash!")
            else:
                print(f"❌ Still failed: {create_response.text}")
    
    print()

if __name__ == "__main__":
    print("Testing Translation Endpoints")
    print("=" * 40)
    
    try:
        test_get_languages()
        test_get_translations()
        test_get_translations_with_filters()
        test_get_translation_by_id()
        test_create_and_verify_translation_pair()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Make sure the Flask app is running on localhost:5000")
    except Exception as e:
        print(f"Error: {e}") 