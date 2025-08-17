"""Add approved_at to translation_pairs and pipeline_cursor table

Revision ID: ba3a2c9f3a10
Revises: 713d29c7b4d6
Create Date: 2025-08-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'ba3a2c9f3a10'
down_revision = '713d29c7b4d6'
branch_labels = None
depends_on = None


def upgrade():
    # 1) Add approved_at column (temporarily nullable with default), backfill, then set NOT NULL
    with op.batch_alter_table('translation_pairs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('approved_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))

    # Backfill deterministically: use created_at when we don't have historical approved times
    op.execute("""
        UPDATE translation_pairs
        SET approved_at = COALESCE(approved_at, created_at)
    """)

    # Create composite index for idempotent incremental reads
    op.create_index('ix_translationpair_approved_id', 'translation_pairs', ['approved_at', 'id'], unique=False)

    # Drop server default and enforce NOT NULL
    with op.batch_alter_table('translation_pairs', schema=None) as batch_op:
        batch_op.alter_column('approved_at', server_default=None, existing_type=sa.DateTime(), nullable=False)

    # 2) Create pipeline_cursor table
    op.create_table(
        'pipeline_cursor',
        sa.Column('job_name', sa.Text(), primary_key=True, nullable=False),
        sa.Column('last_approved_at', sa.DateTime(), nullable=True),
        sa.Column('last_id', sa.BigInteger(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Seed initial cursor row for pipeline_clean
    op.execute("""
        INSERT INTO pipeline_cursor (job_name, last_approved_at, last_id, updated_at)
        VALUES ('pipeline_clean', NULL, NULL, CURRENT_TIMESTAMP)
        ON CONFLICT (job_name) DO NOTHING
    """)


def downgrade():
    # Drop pipeline_cursor
    op.drop_table('pipeline_cursor')

    # Drop index and approved_at column
    op.drop_index('ix_translationpair_approved_id', table_name='translation_pairs')
    with op.batch_alter_table('translation_pairs', schema=None) as batch_op:
        batch_op.drop_column('approved_at')


