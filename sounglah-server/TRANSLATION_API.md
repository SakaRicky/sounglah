# Translation API Endpoints

This document describes the new translation endpoints that allow you to query the database for existing translations.

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. **Login** using the `/api/login` endpoint to get a JWT token
2. **Include the token** in the `Authorization` header for subsequent requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Base URL
All endpoints are prefixed with `/api/`

## Endpoints

### 1. Login
**POST** `/api/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@sounglah.com",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

### 2. Get All Languages
**GET** `/api/languages`

**Authentication Required:** Yes

Returns all available languages in the database.

**Response:**
```json
{
  "languages": [
    {
      "id": 1,
      "name": "English",
      "iso_code": "en",
      "region": "Global",
      "description": "English language"
    }
  ]
}
```

### 3. Get Translations
**GET** `/api/translations`

**Authentication Required:** Yes

Returns translations with optional filtering and pagination.

**Query Parameters:**
- `source_lang` (optional): Filter by source language name or ISO code
- `target_lang` (optional): Filter by target language name or ISO code
- `status` (optional): Filter by translation status (`pending`, `needs_review`, `verified`)
- `domain` (optional): Filter by translation domain
- `search` (optional): Search term for source or target text
- `limit` (optional): Number of translations to return (default: 50)
- `offset` (optional): Number of translations to skip (default: 0)

**Example Requests:**
```bash
# Get all translations
GET /api/translations

# Get translations from English to Medumba
GET /api/translations?source_lang=English&target_lang=Medumba

# Search for translations containing "hello"
GET /api/translations?search=hello

# Get verified translations only
GET /api/translations?status=verified

# Pagination
GET /api/translations?limit=10&offset=20
```

**Response:**
```json
{
  "translations": [
    {
      "id": 1,
      "source_text": "Hello",
      "target_text": "Bonjour",
      "source_language": {
        "id": 1,
        "name": "English",
        "iso_code": "en"
      },
      "target_language": {
        "id": 2,
        "name": "Medumba",
        "iso_code": "med"
      },
      "status": "verified",
      "domain": "greetings",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total_count": 100,
  "limit": 50,
  "offset": 0
}
```

### 4. Get Translation by ID
**GET** `/api/translations/{id}`

**Authentication Required:** Yes

Returns a specific translation by its ID.

**Path Parameters:**
- `id` (required): The translation ID

**Example Request:**
```bash
GET /api/translations/1
```

**Response:**
```json
{
  "id": 1,
  "source_text": "Hello",
  "target_text": "Bonjour",
  "source_language": {
    "id": 1,
    "name": "English",
    "iso_code": "en"
  },
  "target_language": {
    "id": 2,
    "name": "Medumba",
    "iso_code": "med"
  },
  "status": "verified",
  "domain": "greetings",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Error Response (404):**
```json
{
  "error": "Translation not found"
}
```

## Database Schema

The endpoints query the following database tables:

### Languages Table
- `id`: Primary key
- `name`: Language name
- `iso_code`: ISO language code
- `region`: Geographic region
- `description`: Language description

### Translation Pairs Table
- `id`: Primary key
- `source_text`: Original text
- `target_text`: Translated text
- `source_lang_id`: Foreign key to languages table
- `target_lang_id`: Foreign key to languages table
- `status`: Translation status (pending, needs_review, verified)
- `domain`: Translation domain/category
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Testing

You can test the endpoints using the provided test scripts:

```bash
# Test authentication and protected endpoints
cd sounglah-server
python test_auth_endpoints.py

# Test translation endpoints (requires authentication)
python test_translation_endpoints.py
```

Make sure the Flask application is running on `localhost:5000` before running the tests.

**Note:** For the authentication test, you'll need to know the correct password for the admin user.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `401`: Unauthorized (invalid or missing token, invalid credentials)
- `404`: Resource not found
- `500`: Internal server error

Error responses include a JSON object with an `error` field describing the issue.

## JWT Token Configuration

The JWT tokens are configured with:
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Secret Key**: Set via `JWT_SECRET_KEY` environment variable (defaults to a development key)

**Important**: Change the `JWT_SECRET_KEY` in production for security. 