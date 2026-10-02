import json
import random
import os

# Regional Names (India / South India focus for KLMCE)
first_names_m = ["Arjun", "Karthik", "Rahul", "Aditya", "Vignesh", "Siddharth", "Sanjay", "Rohit", "Vijay", "Ashwin", "Hari", "Praveen", "Gautam", "Manoj", "Surya", "Vishal", "Dinesh", "Naveen", "Prashant"]
first_names_f = ["Kavya", "Priya", "Sneha", "Neha", "Swathi", "Anjali", "Divya", "Shruti", "Aishwarya", "Meera", "Deepa", "Nandini", "Pooja", "Lakshmi", "Ananya", "Preeti", "Sruthi"]
last_names = ["Kumar", "Iyer", "Nair", "Rao", "Reddy", "Menon", "Pillai", "Krishnan", "Sharma", "Singh", "Patel", "Das", "Rajan", "Murthy", "Gounder", "Deshmukh", "Verma", "Rao", "Naidu"]

departments = ["Computer Science", "Mechanical", "Electrical", "Civil", "Information Technology", "Electronics"]
roles_faculty = ["Assistant Professor", "Associate Professor", "HOD", "Professor"]
roles_admin = ["Registrar", "Admissions Officer", "Finance Head", "Dean", "System Admin"]
cities = ["Chennai", "Madurai", "Coimbatore", "Trichy", "Salem", "Bangalore", "Hyderabad", "Kochi"]

def generate_email(first, last, domain="klmce.edu.in"):
    return f"{first.lower()}.{last.lower()}@{domain}"

random.seed(42) # For reproducible data

students = []
for i in range(1, 51):
    gender = random.choice(["M", "F"])
    f = random.choice(first_names_m) if gender == "M" else random.choice(first_names_f)
    l = random.choice(last_names)
    students.append({
        "id": f"STU2024{i:03d}",
        "name": f"{f} {l}",
        "email": generate_email(f, l, "student.klmce.edu.in"),
        "phone": f"+91 {random.randint(90000, 99999)} {random.randint(10000, 99999)}",
        "gender": gender,
        "dob": f"{random.randint(1999, 2005)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
        "region": random.choice(cities),
        "department": random.choice(departments),
        "cgpa": round(random.uniform(6.5, 9.8), 2),
        "year": random.choice([1, 2, 3, 4]),
        "attendance_pct": random.randint(75, 100),
        "fee_status": random.choice(["Paid", "Paid", "Pending", "Overdue"]),
        "status": random.choice(["Active", "Active", "Active", "Warning"])
    })

faculty = []
for i in range(1, 21):
    gender = random.choice(["M", "F"])
    f = random.choice(first_names_m) if gender == "M" else random.choice(first_names_f)
    l = random.choice(last_names)
    title = random.choice(["Dr.", "Prof."])
    faculty.append({
        "id": f"FAC{i:03d}",
        "name": f"{title} {f} {l}",
        "email": generate_email(f, l),
        "phone": f"+91 {random.randint(80000, 99999)} {random.randint(10000, 99999)}",
        "department": random.choice(departments),
        "designation": random.choice(roles_faculty),
        "joining_date": f"{random.randint(2010, 2023)}-{random.randint(1,12):02d}-01",
        "publications": random.randint(0, 15),
        "courses_taught": random.randint(2, 4)
    })

admins = []
for i in range(1, 6):
    gender = random.choice(["M", "F"])
    f = random.choice(first_names_m) if gender == "M" else random.choice(first_names_f)
    l = random.choice(last_names)
    admins.append({
        "id": f"ADM{i:03d}",
        "name": f"{f} {l}",
        "email": generate_email(f, l),
        "phone": f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
        "role": roles_admin[i-1],
        "access_level": "Superuser" if i == 1 else "Editor",
        "office_location": f"Admin Block - Room {100 + i}"
    })

# Ensure the lib directory exists
os.makedirs("frontend/src/lib", exist_ok=True)

with open("frontend/src/lib/syntheticData.ts", "w") as f:
    f.write("// AUTO-GENERATED SYNTHETIC DATA FOR KLMCE ERP\n")
    f.write(f"export const STUDENTS = {json.dumps(students, indent=4)};\n\n")
    f.write(f"export const FACULTY = {json.dumps(faculty, indent=4)};\n\n")
    f.write(f"export const ADMINS = {json.dumps(admins, indent=4)};\n")

print("Successfully generated syntheticData.ts with 50 students, 20 faculty, and 5 admins.")
