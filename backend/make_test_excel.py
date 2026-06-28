from openpyxl import Workbook

wb = Workbook()
ws = wb.active

# Header row
ws.append(["PRN", "Full Name", "Year of Birth", "Batch", "Branch"])

# Test students
ws.append(["1032210010", "Rahul Sharma", 2004, "2022-2026", "Computer Engineering"])
ws.append(["1032210011", "Priya Patel", 2005, "2022-2026", "Computer Engineering"])
ws.append(["1032210012", "Amit Kumar", 2004, "2022-2026", "IT Engineering"])

wb.save("test_students.xlsx")
print("Created test_students.xlsx")