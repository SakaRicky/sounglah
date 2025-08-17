"""Make approved_at nullable and clear it for non-approved rows

Revision ID: d7f3a6a4a8c2
Revises: ba3a2c9f3a10
Create Date: 2025-08-17 00:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd7f3a6a4a8c2'
down_revision = 'ba3a2c9f3a10'
branch_labels = None
depends_on = None


def upgrade():
    # Relax NOT NULL on approved_at
    with op.batch_alter_table('translation_pairs', schema=None) as batch_op:
        batch_op.alter_column('approved_at', existing_type=sa.DateTime(), nullable=True)

    # Ensure only approved rows retain approved_at
    op.execute("""
        UPDATE translation_pairs
        SET approved_at = NULL
        WHERE status <> 'approved'
    """)


def downgrade():
    # Reapply NOT NULL (best-effort: set missing values to created_at to satisfy constraint)
    op.execute("""
        UPDATE translation_pairs
        SET approved_at = COALESCE(approved_at, created_at)
    """)
    with op.batch_alter_table('translation_pairs', schema=None) as batch_op:
        batch_op.alter_column('approved_at', existing_type=sa.DateTime(), nullable=False)


