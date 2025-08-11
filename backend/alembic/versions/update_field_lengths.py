"""Update field lengths for events

Revision ID: 002
Revises: 001
Create Date: 2025-08-11 16:29:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Update title field to allow longer titles
    op.alter_column('events', 'title',
                    existing_type=sa.String(length=255),
                    type_=sa.String(length=500),
                    existing_nullable=False)
    
    # Update location field to Text to allow longer locations
    op.alter_column('events', 'location',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=True)
    
    # Update uid field to allow longer UIDs
    op.alter_column('events', 'uid',
                    existing_type=sa.String(length=255),
                    type_=sa.String(length=500),
                    existing_nullable=True)


def downgrade():
    # Revert uid field
    op.alter_column('events', 'uid',
                    existing_type=sa.String(length=500),
                    type_=sa.String(length=255),
                    existing_nullable=True)
    
    # Revert location field
    op.alter_column('events', 'location',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=True)
    
    # Revert title field
    op.alter_column('events', 'title',
                    existing_type=sa.String(length=500),
                    type_=sa.String(length=255),
                    existing_nullable=False)
