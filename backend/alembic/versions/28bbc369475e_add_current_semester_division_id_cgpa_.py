"""add current_semester, division_id, cgpa to users

Revision ID: 28bbc369475e
Revises: 5d85aab02740
Create Date: 2026-07-05 16:26:59.798847

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28bbc369475e'
down_revision: Union[str, Sequence[str], None] = '5d85aab02740'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('current_semester', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('division_id', sa.String(length=36), nullable=True))
    op.add_column('users', sa.Column('cgpa', sa.Float(), nullable=True))
    op.create_index(op.f('ix_users_division_id'), 'users', ['division_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_division_id'), table_name='users')
    op.drop_column('users', 'cgpa')
    op.drop_column('users', 'division_id')
    op.drop_column('users', 'current_semester')
    # ### end Alembic commands ###
