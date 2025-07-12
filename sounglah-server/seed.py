# seed_translations.py

import pandas as pd
from my_app import create_app, db
from my_app.models import Language, TranslationPair, User, AudioRecording
import random


app = create_app()

def create_all_tables():
    """Create all tables in the database."""
    print("🏗️ Creating all tables...")
    db.create_all()
    db.session.commit()
    print("✅ All tables created.")

def drop_all_tables():
    """Drop all tables in the database."""
    print("🗑️ Dropping all tables...")
    db.drop_all()
    db.session.commit()
    print("✅ All tables dropped.")

def get_or_create_language(name):
    lang = Language.query.filter_by(name=name).first()
    if not lang:
        lang = Language(name=name)
        db.session.add(lang)
        db.session.commit()
    return lang.id

def clear_database():
    """Delete all data from the database"""
    print("🗑️  Clearing database...")
    
    # Delete in reverse order of dependencies to avoid foreign key constraints
    User.query.delete()
    AudioRecording.query.delete()
    TranslationPair.query.delete()
    Language.query.delete()
    
    db.session.commit()
    print("✅ Database cleared.")

def create_users():
    """Create admin, reviewers, editor, and viewer users."""
    users = [
        {
            "username": "admin",
            "email": "admin@sounglah.com",
            "password_hash": "$2a$12$LxWh8EphesNVPe08etDLrOV3munKxygcerhGvmz77VM5C4X/BQyJC",  # password: admin123
            "role": "admin"
        },
        {
            "username": "reviewer1",
            "email": "reviewer1@sounglah.com",
            "password_hash": "$2a$12$LxWh8EphesNVPe08etDLrOV3munKxygcerhGvmz77VM5C4X/BQyJC",
            "role": "reviewer"
        },
        {
            "username": "reviewer2",
            "email": "reviewer2@sounglah.com",
            "password_hash": "$2a$12$LxWh8EphesNVPe08etDLrOV3munKxygcerhGvmz77VM5C4X/BQyJC",
            "role": "reviewer"
        },
        {
            "username": "editor",
            "email": "editor@sounglah.com",
            "password_hash": "$2a$12$LxWh8EphesNVPe08etDLrOV3munKxygcerhGvmz77VM5C4X/BQyJC",
            "role": "editor"
        },
        {
            "username": "viewer",
            "email": "viewer@sounglah.com",
            "password_hash": "$2a$12$LxWh8EphesNVPe08etDLrOV3munKxygcerhGvmz77VM5C4X/BQyJC",
            "role": "viewer"
        }
    ]
    for user_data in users:
        user = User(**user_data)
        db.session.add(user)
    db.session.commit()
    print("✅ Users created.")

def seed_languages():
    """Seed the Medumba language if it doesn't exist."""
    if not Language.query.filter_by(name='Medumba').first():
        lang = Language(
            name='Medumba',
            iso_code=None,
            region='West - Cameroon',
            description="Language of the Bangante people."
        )
        db.session.add(lang)
        db.session.commit()
        print("✅ Medumba language seeded.")
    else:
        print("ℹ️ Medumba language already exists.")

def seed_from_csv(file_path):
    df = pd.read_csv(file_path)
    df.columns = ['source_text', 'target_text']

    source_lang_id = get_or_create_language('English')
    target_lang_id = get_or_create_language('Medumba')

    # Get reviewer user ids
    reviewers = User.query.filter_by(role='reviewer').all()
    reviewer_ids = [user.id for user in reviewers]

    statuses = ['approved', 'pending', 'rejected']

    for _, row in df.iterrows():
        status = random.choice(statuses)
        reviewer_id = None
        if status == 'approved' and reviewer_ids:
            reviewer_id = random.choice(reviewer_ids)
        pair = TranslationPair(
            source_text=row['source_text'],
            target_text=row['target_text'],
            source_lang_id=source_lang_id,
            target_lang_id=target_lang_id,
            domain=None,
            status=status,
            reviewer_id=reviewer_id
        )
        db.session.add(pair)

    db.session.commit()
    print("✅ Translations seeded.")

if __name__ == '__main__':
    with app.app_context():
        # drop_all_tables()
        create_all_tables()  # Create tables directly
        clear_database()
        create_users()
        seed_languages()
        seed_from_csv('files/Sample_Translation.csv')
        print("🎉 Seeding completed successfully!")
