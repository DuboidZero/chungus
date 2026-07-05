"""add skill_id to technical_skills, relax legacy domain/name to nullable

Revision ID: bea409c46ed5
Revises: dff2105e3d3a
Create Date: 2026-07-05 18:13:36.460382

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'bea409c46ed5'
down_revision: Union[str, Sequence[str], None] = 'dff2105e3d3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(op.f('ix_technical_skills_skill_id'), 'technical_skills', ['skill_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_technical_skills_skill_id'), table_name='technical_skills')