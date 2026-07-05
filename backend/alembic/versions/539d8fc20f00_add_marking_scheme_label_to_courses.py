"""add marking_scheme label to courses

Revision ID: 539d8fc20f00
Revises: bea409c46ed5
Create Date: 2026-07-05 20:13:15.524709

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '539d8fc20f00'
down_revision: Union[str, Sequence[str], None] = 'bea409c46ed5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses', sa.Column('marking_scheme', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('courses', 'marking_scheme')
    # ### end Alembic commands ###
