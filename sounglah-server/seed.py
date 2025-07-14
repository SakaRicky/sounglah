# seed_translations.py

import pandas as pd
from my_app import create_app, db
from my_app.models import Language, TranslationPair, User, AudioRecording, Role
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
    roles = {r.name: r for r in Role.query.all()}
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
        role_obj = roles.get(user_data["role"])
        if not role_obj:
            continue  # skip if role not found
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=user_data["password_hash"],
            role_id=role_obj.id
        )
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
    reviewer_role = Role.query.filter_by(name='reviewer').first()
    reviewers = User.query.filter_by(role_id=reviewer_role.id).all() if reviewer_role else []
    reviewer_ids = [user.id for user in reviewers]

    # All statuses are 'approved' for CSV upload
    status = 'approved'

    # Prepare all records in memory first
    translation_pairs = []
    for _, row in df.iterrows():
        reviewer_id = random.choice(reviewer_ids) if reviewer_ids else None
        pair = TranslationPair(
            source_text=row['source_text'],
            target_text=row['target_text'],
            source_lang_id=source_lang_id,
            target_lang_id=target_lang_id,
            domain=None,
            status=status,
            reviewer_id=reviewer_id
        )
        translation_pairs.append(pair)

    # Batch insert all records at once
    print(f"📦 Adding {len(translation_pairs)} translation pairs...")
    db.session.bulk_save_objects(translation_pairs)
    db.session.commit()
    print("✅ Translations seeded.")

def seed_from_csv_fast(file_path):
    """Ultra-fast seeding using raw SQL for maximum performance."""
    import pandas as pd
    from sqlalchemy import text
    
    df = pd.read_csv(file_path)
    df.columns = ['source_text', 'target_text']

    source_lang_id = get_or_create_language('English')
    target_lang_id = get_or_create_language('Medumba')

    # Get reviewer user ids
    reviewer_role = Role.query.filter_by(name='reviewer').first()
    reviewers = User.query.filter_by(role_id=reviewer_role.id).all() if reviewer_role else []
    reviewer_ids = [user.id for user in reviewers]

    status = 'approved'
    
    print(f"🚀 Ultra-fast seeding of {len(df)} translation pairs...")
    
    # Prepare data for bulk insert
    values = []
    for _, row in df.iterrows():
        reviewer_id = random.choice(reviewer_ids) if reviewer_ids else None
        values.append(f"('{row['source_text'].replace("'", "''")}', '{row['target_text'].replace("'", "''")}', {source_lang_id}, {target_lang_id}, NULL, '{status}', {reviewer_id if reviewer_id else 'NULL'})")
    
    # Use raw SQL for maximum speed
    sql = f"""
    INSERT INTO translation_pair (source_text, target_text, source_lang_id, target_lang_id, domain, status, reviewer_id)
    VALUES {','.join(values)}
    """
    
    db.session.execute(text(sql))
    db.session.commit()
    print("✅ Ultra-fast translations seeding completed!")

if __name__ == '__main__':
    with app.app_context():
        # drop_all_tables()
        create_all_tables()  # Create tables directly
        clear_database()
        create_users()
        seed_languages()
        # Use the ultra-fast method for large datasets
        seed_from_csv_fast('files/Sample_Translation.csv')
        print("🎉 Seeding completed successfully!")
