"""Make ix_translationpair_approved_id partial on status='approved'

Revision ID: 2c1e5c77a5f4
Revises: d7f3a6a4a8c2
Create Date: 2025-08-17 00:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2c1e5c77a5f4'
down_revision = 'd7f3a6a4a8c2'
branch_labels = None
depends_on = None


def upgrade():
    # Drop existing non-partial index if present
    try:
        op.drop_index('ix_translationpair_approved_id', table_name='translation_pairs')
    except Exception:
        # Index might not exist in some environments; ignore
        pass

    # Create partial index
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_translationpair_approved_id
        ON translation_pairs (approved_at, id)
        WHERE status = 'approved'
        """
    )


def downgrade():
    # Drop partial index
    op.execute("DROP INDEX IF EXISTS ix_translationpair_approved_id")
    # Recreate non-partial index for downgrade parity
    op.create_index('ix_translationpair_approved_id', 'translation_pairs', ['approved_at', 'id'], unique=False)


