from openpyxl import Workbook

wb = Workbook()
ws = wb.active

# Header: PRN | Semester | Subject | Obtained | Max | Credits
ws.append(["PRN", "Semester", "Subject", "Obtained", "Max", "Credits"])

# Real subjects from the ERP marksheet — Semester 1 for student 1032210010 (Rahul)
ws.append(["1032210010", 1, "Applied Mathematics", 95, 100, 2])
ws.append(["1032210010", 1, "Basic Electrical & Electronics Engineering", 91, 100, 4])
ws.append(["1032210010", 1, "Communicative Competence", 79, 100, 3])
ws.append(["1032210010", 1, "Data Communication and Computer Networks", 90, 100, 4])
ws.append(["1032210010", 1, "Environmental Education and Sustainability", 96, 100, 2])
ws.append(["1032210010", 1, "Programming in C", 96, 100, 4])
ws.append(["1032210010", 1, "Social and Life Skills", 48, 50, 1])
ws.append(["1032210010", 1, "Sports", 42, 50, 1])

wb.save("test_marks.xlsx")
print("Created test_marks.xlsx")