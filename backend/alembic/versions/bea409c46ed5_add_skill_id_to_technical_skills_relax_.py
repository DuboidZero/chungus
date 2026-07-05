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
    # BUG FIX: the original migration created the index without first adding the column.
    # Add skill_id column + FK to skills_master, then the index.
    op.add_column('technical_skills', sa.Column('skill_id', sa.String(length=36), nullable=True))
    op.create_foreign_key(
        'fk_technical_skills_skill_id',
        'technical_skills', 'skills_master',
        ['skill_id'], ['id']
    )
    op.create_index(op.f('ix_technical_skills_skill_id'), 'technical_skills', ['skill_id'], unique=False)
    # Relax legacy columns to nullable (as the migration title promises)
    op.alter_column('technical_skills', 'domain', existing_type=sa.String(), nullable=True)
    op.alter_column('technical_skills', 'name', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column('technical_skills', 'name', existing_type=sa.String(), nullable=False)
    op.alter_column('technical_skills', 'domain', existing_type=sa.String(), nullable=False)
    op.drop_index(op.f('ix_technical_skills_skill_id'), table_name='technical_skills')
    op.drop_constraint('fk_technical_skills_skill_id', 'technical_skills', type_='foreignkey')
    op.drop_column('technical_skills', 'skill_id')