"""MIT WPU 10-point grading system + SGPA/CGPA calculation."""

# Letter grade -> grade points (from the official MIT WPU scale)
GRADE_POINTS = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "P": 4,
    "F": 0,
}


def marks_to_grade(percentage: float) -> str:
    """Convert a marks percentage to a letter grade (MIT WPU scale)."""
    if percentage >= 90: return "O"
    if percentage >= 80: return "A+"
    if percentage >= 70: return "A"
    if percentage >= 60: return "B+"
    if percentage >= 50: return "B"
    if percentage >= 45: return "C"
    if percentage >= 40: return "P"
    return "F"


def subject_grade_points(grade: str | None, marks_obtained: float | None, max_marks: float | None) -> int:
    """Get grade points for a subject. Use the letter grade if present;
    otherwise derive it from marks percentage."""
    if grade and grade in GRADE_POINTS:
        return GRADE_POINTS[grade]
    if marks_obtained is not None and max_marks:
        pct = (marks_obtained / max_marks) * 100
        return GRADE_POINTS[marks_to_grade(pct)]
    return 0


def calculate_sgpa(subjects: list) -> float:
    """SGPA = Σ(credits × grade_points) / Σ(credits)  — for one semester."""
    total_credits = sum(s.credits for s in subjects)
    if total_credits == 0:
        return 0.0
    weighted = sum(s.credits * subject_grade_points(s.grade, s.marks_obtained, s.max_marks) for s in subjects)
    return round(weighted / total_credits, 2)


def calculate_cgpa(all_subjects: list) -> float:
    """CGPA = Σ(all credit-points) / Σ(all credits)  — across all semesters."""
    total_credits = sum(s.credits for s in all_subjects)
    if total_credits == 0:
        return 0.0
    weighted = sum(s.credits * subject_grade_points(s.grade, s.marks_obtained, s.max_marks) for s in all_subjects)
    return round(weighted / total_credits, 2)