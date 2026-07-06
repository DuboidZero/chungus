"""phase5: share token + is_public flags for portfolio

Revision ID: 1da9e1bd080f
Revises: 7f0a2d1fee44
Create Date: 2026-07-06 12:55:42.006252

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1da9e1bd080f'
down_revision: Union[str, Sequence[str], None] = '7f0a2d1fee44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # is_public defaults to TRUE for existing portfolio items (they were already visible)
    op.add_column('achievements', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column('experiences', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column('projects', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.true()))
    # share_token nullable (fine); share_enabled defaults to FALSE for existing users
    op.add_column('users', sa.Column('share_token', sa.String(length=64), nullable=True))
    op.add_column('users', sa.Column('share_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(op.f('ix_users_share_token'), 'users', ['share_token'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_share_token'), table_name='users')
    op.drop_column('users', 'share_enabled')
    op.drop_column('users', 'share_token')
    op.drop_column('projects', 'is_public')
    op.drop_column('experiences', 'is_public')
    op.drop_column('achievements', 'is_public')