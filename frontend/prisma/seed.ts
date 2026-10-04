import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log("Seeding database for production demo...")
    
    // Clear existing for idempotency (optional, skipped here to prevent accidental data loss in prod)

    // 1. Create Programmes
    const btech = await prisma.programme.upsert({
        where: { name: 'B.Tech' },
        update: {},
        create: { name: 'B.Tech' }
    });

    // 2. Create Branches
    const cse = await prisma.branch.upsert({
        where: { id: 'seed-cse' },
        update: {},
        create: { id: 'seed-cse', name: 'Computer Science and Engineering', code: 'CSE', programmeId: btech.id }
    });
    
    const ece = await prisma.branch.upsert({
        where: { id: 'seed-ece' },
        update: {},
        create: { id: 'seed-ece', name: 'Electronics and Communication Engineering', code: 'ECE', programmeId: btech.id }
    });

    // 3. Create Batches
    const batch2024 = await prisma.batch.upsert({
        where: { id: 'seed-batch-2024' },
        update: {},
        create: { id: 'seed-batch-2024', name: '2024-2028', startingYear: 2024, branchId: cse.id }
    });

    // 4. Create Sections
    const sectionA = await prisma.section.upsert({
        where: { id: 'seed-section-a' },
        update: {},
        create: { id: 'seed-section-a', name: 'CSE-A', batchId: batch2024.id }
    });

    // 5. Create Students
    const student1 = await prisma.student.upsert({
        where: { rollNo: '24CSE001' },
        update: {},
        create: { rollNo: '24CSE001', name: 'Aarav Sharma', email: '24cse001@student.klmce.edu', mobile: '9876543210', batchId: batch2024.id, sectionId: sectionA.id }
    });
    const student2 = await prisma.student.upsert({
        where: { rollNo: '24CSE002' },
        update: {},
        create: { rollNo: '24CSE002', name: 'Diya Patel', email: '24cse002@student.klmce.edu', mobile: '9876543211', batchId: batch2024.id, sectionId: sectionA.id }
    });

    // 6. Create Faculty
    const faculty1 = await prisma.faculty.upsert({
        where: { empId: 'EMP1001' },
        update: {},
        create: { empId: 'EMP1001', name: 'Dr. Venkat Rao', email: 'venkat.rao@klmce.edu', department: 'CSE' }
    });

    // 7. Create Courses
    const course1 = await prisma.course.upsert({
        where: { code: 'CS201' },
        update: {},
        create: { code: 'CS201', title: 'Data Structures', credits: 4, type: 'Theory' }
    });

    // 8. Create Exams
    const exam1 = await prisma.exam.upsert({
        where: { id: 'seed-exam-1' },
        update: {},
        create: { id: 'seed-exam-1', name: 'Mid Term 1', type: 'INTERNAL', batchId: batch2024.id }
    });

    // 9. Finance Data
    const fee1 = await prisma.fee.upsert({
        where: { id: 'seed-fee-1' },
        update: {},
        create: { id: 'seed-fee-1', studentId: student1.id, amount: 65000, type: 'TUITION', dueDate: new Date(), status: 'PENDING' }
    });

    console.log("Database seeded successfully with core requirements!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
