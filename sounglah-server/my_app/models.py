# app/models.py
from . import db
from datetime import datetime
from uuid import uuid4
from sqlalchemy.dialects.postgresql import ENUM, UUID, JSONB

translation_status_enum = ENUM('pending', 'rejected', 'approved', name='translation_status', create_type=True)
augmentation_status_enum = ENUM('queued', 'running', 'succeeded', 'failed', name='augmentation_status', create_type=True)

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
    # Timestamp when a pair became approved; NULL for non-approved statuses
    approved_at = db.Column(db.DateTime, nullable=True, index=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        db.Index('ix_translationpair_lang_status', 'source_lang_id', 'status'),
        db.Index('ix_translationpair_domain_status', 'domain', 'status'),
        db.Index('ix_translationpair_created_status', 'created_at', 'status'),
        # For idempotent incremental reads by (approved_at, id) on approved only
        db.Index(
            'ix_translationpair_approved_id',
            'approved_at',
            'id',
            postgresql_where=(status == 'approved'),
        ),
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

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    users = db.relationship('User', back_populates='role')

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False, index=True)
    role = db.relationship('Role', back_populates='users')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)


class AugmentationRun(db.Model):
    __tablename__ = 'augmentation_runs'

    # Primary key as UUID
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Status constrained to allowed values
    status = db.Column(augmentation_status_enum, nullable=False, index=True)

    # User who triggered the run (optional)
    triggered_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, index=True)
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    finished_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # Runtime and metrics
    runtime_seconds = db.Column(db.Numeric, nullable=True)
    metrics = db.Column(JSONB, nullable=True)  # {"exported":50,"clean":49,"augmented":49}

    # Artifacts and error details
    artifact_path = db.Column(db.Text, nullable=True)  # e.g., data/processed/<id>/sample.jsonl
    error = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.Index('ix_augmentation_runs_status_created', 'status', 'created_at'),
    )


class PipelineCursor(db.Model):
    __tablename__ = 'pipeline_cursor'

    # Job name acts as primary key (e.g., 'pipeline_clean')
    job_name = db.Column(db.Text, primary_key=True)

    # Last processed approval watermark
    last_approved_at = db.Column(db.DateTime, nullable=True)
    last_id = db.Column(db.BigInteger, nullable=True)

    # Updated each time the cursor is advanced
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
