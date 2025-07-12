# Testing Guide

This directory contains comprehensive tests for the Sounglah API using **pytest**, the modern Python testing framework.

## Why pytest instead of manual scripts?

### ✅ **Advantages of pytest:**

1. **Isolated Tests**: Each test runs in isolation with fresh database state
2. **Fixtures**: Reusable test data and setup (no code duplication)
3. **Better Assertions**: More descriptive error messages
4. **Test Discovery**: Automatically finds and runs all tests
5. **Parallel Execution**: Can run tests in parallel for speed
6. **Coverage Reports**: Built-in code coverage analysis
7. **Markers**: Categorize tests (unit, integration, slow, etc.)
8. **Parametrized Tests**: Run same test with different data
9. **Better Debugging**: Interactive debugging with `pdb`
10. **CI/CD Integration**: Works seamlessly with GitHub Actions, Jenkins, etc.

### ❌ **Problems with manual scripts:**

1. **No Isolation**: Tests can interfere with each other
2. **Code Duplication**: Same setup code repeated everywhere
3. **Poor Error Messages**: Hard to debug failures
4. **Manual Execution**: Must run each test manually
5. **No Coverage**: Don't know what code is tested
6. **Hard to Maintain**: Changes require updating multiple files

## Quick Start

### Install dependencies:
```bash
pip install pytest pytest-flask pytest-cov factory-boy
```

### Run all tests:
```bash
pytest
```

### Run specific test file:
```bash
pytest tests/test_basic.py
```

### Run with coverage:
```bash
pytest --cov=my_app --cov-report=html
```

### Run only fast tests:
```bash
pytest -m "not slow"
```

## Test Structure

```
tests/
├── conftest.py          # Shared fixtures and configuration
├── test_basic.py        # Basic endpoint tests
├── test_translations.py # Translation-specific tests
└── README.md           # This file
```

## Key Features

### 1. **Fixtures** (reusable test data)
```python
@pytest.fixture
def sample_languages(app):
    """Create sample languages for testing."""
    with app.app_context():
        languages = [
            Language(name='English', iso_code='en'),
            Language(name='French', iso_code='fr')
        ]
        for lang in languages:
            db.session.add(lang)
        db.session.commit()
        return languages
```

### 2. **Isolated Database**
- Each test gets a fresh in-memory SQLite database
- No interference between tests
- Automatic cleanup after each test

### 3. **Authentication Handling**
```python
@pytest.fixture
def auth_headers():
    """Create authentication headers with a test token."""
    def _auth_headers(user_id=1):
        token = create_access_token(user_id)
        return {'Authorization': f'Bearer {token}'}
    return _auth_headers
```

### 4. **Comprehensive Assertions**
```python
def test_create_translation_pair(self, client, auth_headers, sample_languages):
    response = client.post('/api/translations', json=translation_data, headers=auth_headers())
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'id' in data
    assert data['source_text'] == translation_data['source_text']
    assert data['status'] == 'pending'
```

## Example Test Output

```
============================= test session starts ==============================
platform win32 -- Python 3.9.0, pytest-7.4.3, pluggy-1.3.0
rootdir: C:\path\to\sounglah-server
plugins: cov-4.1.0, flask-1.3.0
collected 10 items

tests/test_basic.py::TestBasicEndpoints::test_health_check PASSED     [ 10%]
tests/test_basic.py::TestBasicEndpoints::test_languages_unauthorized PASSED [ 20%]
tests/test_basic.py::TestBasicEndpoints::test_translations_unauthorized PASSED [ 30%]
tests/test_basic.py::TestBasicEndpoints::test_invalid_endpoint PASSED [ 40%]
tests/test_basic.py::TestAuthentication::test_login_missing_credentials PASSED [ 50%]
tests/test_basic.py::TestAuthentication::test_login_invalid_credentials PASSED [ 60%]
tests/test_basic.py::TestAuthentication::test_login_success PASSED    [ 70%]
tests/test_translations.py::TestTranslationEndpoints::test_get_languages PASSED [ 80%]
tests/test_translations.py::TestTranslationEndpoints::test_create_translation_pair PASSED [ 90%]
tests/test_translations.py::TestTranslationEndpoints::test_translation_workflow PASSED [100%]

============================== 10 passed in 2.34s ==============================
```

## Migration from Manual Scripts

To migrate from your current `test_translation_endpoints.py`:

1. **Install pytest**: `pip install pytest pytest-flask`
2. **Create test structure**: Use the files in this directory
3. **Convert tests**: Transform manual functions into pytest test methods
4. **Add fixtures**: Extract common setup into fixtures
5. **Run tests**: Use `pytest` instead of `python test_*.py`

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what's being tested
2. **Arrange-Act-Assert**: Structure tests in three clear sections
3. **One Assertion**: Each test should verify one specific behavior
4. **Use Fixtures**: Avoid code duplication with reusable fixtures
5. **Test Edge Cases**: Include error conditions and boundary cases
6. **Keep Tests Fast**: Use in-memory databases and minimal setup
7. **Documentation**: Add docstrings to explain test purpose

## Next Steps

1. Add more comprehensive tests for all endpoints
2. Add integration tests for complex workflows
3. Set up CI/CD pipeline with GitHub Actions
4. Add performance tests for slow operations
5. Implement test data factories for complex scenarios 