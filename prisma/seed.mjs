import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up
  await prisma.result.deleteMany()
  await prisma.examSchedule.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.timetableSlot.deleteMany()
  await prisma.student.deleteMany()
  await prisma.section.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.programme.deleteMany()
  await prisma.regulation.deleteMany()
  await prisma.course.deleteMany()
  await prisma.faculty.deleteMany()



  // Academic Hierarchy
  const r20 = await prisma.regulation.create({ data: { name: 'R20' } })
  const r23 = await prisma.regulation.create({ data: { name: 'R23' } })
  
  const btech = await prisma.programme.create({ data: { name: 'B.Tech' } })
  const mtech = await prisma.programme.create({ data: { name: 'M.Tech' } })

  const cse = await prisma.branch.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      programmeId: btech.id
    }
  })

  const batch2024 = await prisma.batch.create({
    data: {
      name: '2024-2028',
      startingYear: 2024,
      branchId: cse.id
    }
  })

  const secA = await prisma.section.create({
    data: {
      name: 'CSE-A',
      batchId: batch2024.id
    }
  })

  // Courses
  const dbms = await prisma.course.create({ data: { code: '20A05301T', title: 'Database Management Systems', credits: 3, type: 'Theory' } })
  const os = await prisma.course.create({ data: { code: '20A05302T', title: 'Operating Systems', credits: 3, type: 'Theory' } })
  const oslab = await prisma.course.create({ data: { code: '20A05303P', title: 'OS Lab', credits: 1.5, type: 'Lab' } })

  // Faculty
  const fac1 = await prisma.faculty.create({
    data: { empId: 'FAC001', name: 'Dr. Arjun Kumar', email: 'arjun@klmce.edu.in', department: 'CSE' }
  })
  
  const fac2 = await prisma.faculty.create({
    data: { empId: 'FAC002', name: 'Prof. Sneha Rao', email: 'sneha@klmce.edu.in', department: 'CSE' }
  })
  
  // Students
  const s1 = await prisma.student.create({
    data: {
      rollNo: '24C01A0501',
      name: 'Aarav Sharma',
      email: 'aarav@student.klmce.edu.in',
      mobile: '9876543210',
      batchId: batch2024.id,
      sectionId: secA.id
    }
  })

  const s2 = await prisma.student.create({
    data: {
      rollNo: '24C01A0502',
      name: 'Priya Patel',
      email: 'priya@student.klmce.edu.in',
      mobile: '9876543211',
      batchId: batch2024.id,
      sectionId: secA.id
    }
  })

  // Timetable Slots
  const t1 = await prisma.timetableSlot.create({
    data: {
      courseId: dbms.id,
      sectionId: secA.id,
      facultyId: fac1.id,
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Room 304'
    }
  })

  const t2 = await prisma.timetableSlot.create({
    data: {
      courseId: os.id,
      sectionId: secA.id,
      facultyId: fac2.id,
      dayOfWeek: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      room: 'Room 304'
    }
  })

  // Attendance
  const today = new Date()
  await prisma.attendance.create({
    data: { studentId: s1.id, slotId: t1.id, status: 'PRESENT', date: today }
  })
  await prisma.attendance.create({
    data: { studentId: s1.id, slotId: t2.id, status: 'ABSENT', date: today }
  })
  await prisma.attendance.create({
    data: { studentId: s2.id, slotId: t1.id, status: 'PRESENT', date: today }
  })
  await prisma.attendance.create({
    data: { studentId: s2.id, slotId: t2.id, status: 'PRESENT', date: today }
  })

  // Exams & Results
  const mid1 = await prisma.exam.create({
    data: {
      name: 'Mid Term 1',
      type: 'INTERNAL',
      batchId: batch2024.id
    }
  })

  const sch1 = await prisma.examSchedule.create({
    data: {
      examId: mid1.id,
      courseId: dbms.id,
      date: new Date('2024-10-15T00:00:00Z'),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      room: 'Exam Hall A',
      invigilatorId: fac2.id
    }
  })

  const sch2 = await prisma.examSchedule.create({
    data: {
      examId: mid1.id,
      courseId: os.id,
      date: new Date('2024-10-16T00:00:00Z'),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      room: 'Exam Hall B',
      invigilatorId: fac1.id
    }
  })

  // Results for Aarav (s1)
  await prisma.result.create({
    data: {
      studentId: s1.id,
      examScheduleId: sch1.id,
      marksObtained: 24,
      maxMarks: 30,
      weightage: 20, // 20% weightage for Mid Term 1
      passed: true
    }
  })
  await prisma.result.create({
    data: {
      studentId: s1.id,
      examScheduleId: sch2.id,
      marksObtained: 15,
      maxMarks: 30,
      weightage: 20,
      passed: true
    }
  })

  // Results for Priya (s2)
  await prisma.result.create({
    data: {
      studentId: s2.id,
      examScheduleId: sch1.id,
      marksObtained: 28,
      maxMarks: 30,
      weightage: 20,
      passed: true
    }
  })
  await prisma.result.create({
    data: {
      studentId: s2.id,
      examScheduleId: sch2.id,
      marksObtained: 27,
      maxMarks: 30,
      weightage: 20,
      passed: true
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
