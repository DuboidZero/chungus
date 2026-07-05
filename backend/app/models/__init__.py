"""
Import all models here so SQLAlchemy's metadata is fully populated
whenever `app.models` is imported. This ensures every table + foreign
key relationship is registered (prevents NoReferencedTableError).
"""
from app.models.user import User
from app.models.academic_structure import (
    Branch, Division, Domain, Course, CourseDomain, SkillsMaster,
)
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.models.profile import Profile
from app.models.project import Project
from app.models.achievement import Achievement
from app.models.experience import Experience
from app.models.academic import Semester, Subject
from app.models.cohort import Cohort
from app.models.mentor import MentorAssignment