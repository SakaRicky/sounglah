# app/models.py
from . import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import ENUM

translation_status_enum = ENUM('pending', 'rejected', 'approved', name='translation_status', create_type=True)

class Language(db.Model):
    __tablename__ = 'languages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    iso_code = db.Column(db.Text, index=True)
    region = db.Column(db.Text)
    description = db.Column(db.Text)

class TranslationPair(db.Model):
    __tablename__ = 'translation_pairs'
    id = db.Column(db.Integer, primary_key=True)
    source_text = db.Column(db.Text, nullable=False)
    target_text = db.Column(db.Text)
    source_lang_id = db.Column(db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), index=True)
    target_lang_id = db.Column(db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), index=True)
    status = db.Column(translation_status_enum, nullable=False, default='pending', index=True)
    domain = db.Column(db.Text, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        db.Index('ix_translationpair_lang_status', 'source_lang_id', 'status'),
        db.Index('ix_translationpair_domain_status', 'domain', 'status'),
        db.Index('ix_translationpair_created_status', 'created_at', 'status'),
    )

class AudioRecording(db.Model):
    __tablename__ = 'audio_recordings'
    id = db.Column(db.Integer, primary_key=True)
    translation_id = db.Column(db.Integer, db.ForeignKey('translation_pairs.id', ondelete='CASCADE'), index=True)
    language_id = db.Column(db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), index=True)
    file_url = db.Column(db.Text, nullable=False)
    speaker = db.Column(db.Text)
    duration_seconds = db.Column(db.Float)
    quality = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, default='editor', index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
