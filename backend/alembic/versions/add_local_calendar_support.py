"""Add local calendar support

Revision ID: add_local_calendar_support
Revises: update_field_lengths
Create Date: 2025-08-12 14:38:50.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_local column
    op.add_column('calendars', sa.Column('is_local', sa.Boolean(), nullable=False, server_default='false'))
    
    # Make url column nullable
    op.alter_column('calendars', 'url', nullable=True)


def downgrade():
    # Make url column non-nullable again
    op.alter_column('calendars', 'url', nullable=False)
    
    # Remove is_local column
    op.drop_column('calendars', 'is_local')
