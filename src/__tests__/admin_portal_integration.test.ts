import { describe, it, expect } from 'vitest';

describe('Admin Portal Complete Integration Workflows', () => {
  interface StudentRecord {
    rollNo: string;
    name: string;
    branch: string;
    year: number;
    hostelResident: boolean;
    busRoute: string;
  }

  const SAMPLE_STUDENTS: StudentRecord[] = [
    { rollNo: '219Y1A0501', name: 'C. Lakshmi Priya', branch: 'CSE', year: 4, hostelResident: false, busRoute: 'RT-01 (Proddatur)' },
    { rollNo: '219Y1A0502', name: 'B. Venkata Sai', branch: 'CSE', year: 4, hostelResident: true, busRoute: 'NONE' },
    { rollNo: '229Y1A0401', name: 'M. Haritha', branch: 'ECE', year: 3, hostelResident: false, busRoute: 'RT-02 (Pulivendula)' },
    { rollNo: '239Y1A0101', name: 'P. Rajesh', branch: 'CIVIL', year: 2, hostelResident: true, busRoute: 'NONE' },
  ];

  it('filters students by branch, year, and search keywords', () => {
    function filterStudents(roster: StudentRecord[], query: { branch?: string; search?: string }) {
      return roster.filter(s => {
        const matchesBranch = !query.branch || s.branch === query.branch;
        const matchesSearch = !query.search || 
          s.rollNo.toLowerCase().includes(query.search.toLowerCase()) || 
          s.name.toLowerCase().includes(query.search.toLowerCase());
        return matchesBranch && matchesSearch;
      });
    }

    const cseStudents = filterStudents(SAMPLE_STUDENTS, { branch: 'CSE' });
    expect(cseStudents.length).toBe(2);

    const searched = filterStudents(SAMPLE_STUDENTS, { search: 'Lakshmi' });
    expect(searched.length).toBe(1);
    expect(searched[0].rollNo).toBe('219Y1A0501');

    const rollSearch = filterStudents(SAMPLE_STUDENTS, { search: '229Y1A' });
    expect(rollSearch.length).toBe(1);
    expect(rollSearch[0].branch).toBe('ECE');
  });

  it('calculates transport fleet capacity and seat occupancy across routes', () => {
    interface TransportRoute {
      routeNo: string;
      busNumber: string;
      capacity: number;
      assignedStudents: number;
    }

    const fleet: TransportRoute[] = [
      { routeNo: 'RT-01', busNumber: 'AP 04 TU 1234', capacity: 50, assignedStudents: 48 },
      { routeNo: 'RT-02', busNumber: 'AP 04 TU 5678', capacity: 50, assignedStudents: 50 },
      { routeNo: 'RT-03', busNumber: 'AP 04 TU 9012', capacity: 40, assignedStudents: 28 },
    ];

    function calculateFleetUtilization(routes: TransportRoute[]) {
      const totalCapacity = routes.reduce((sum, r) => sum + r.capacity, 0);
      const totalAssigned = routes.reduce((sum, r) => sum + r.assignedStudents, 0);
      const utilizationPct = Number(((totalAssigned / totalCapacity) * 100).toFixed(1));
      return { totalCapacity, totalAssigned, utilizationPct };
    }

    const stats = calculateFleetUtilization(fleet);
    expect(stats.totalCapacity).toBe(140);
    expect(stats.totalAssigned).toBe(126);
    expect(stats.utilizationPct).toBe(90.0);
  });

  it('validates examination cell scheduling with conflict detection', () => {
    interface ExamSlot {
      courseCode: string;
      date: string;
      session: 'FN' | 'AN'; // Forenoon 10:00-1:00, Afternoon 2:00-5:00
      hall: string;
    }

    function detectExamClash(exams: ExamSlot[]): { hasConflict: boolean; conflicts: string[] } {
      const seen = new Set<string>();
      const conflicts: string[] = [];

      for (const exam of exams) {
        const key = `${exam.date}_${exam.session}_${exam.hall}`;
        if (seen.has(key)) {
          conflicts.push(`Room clash in ${exam.hall} on ${exam.date} (${exam.session})`);
        }
        seen.add(key);
      }

      return { hasConflict: conflicts.length > 0, conflicts };
    }

    const validSchedule: ExamSlot[] = [
      { courseCode: '20A05401T', date: '2026-10-20', session: 'FN', hall: 'Exam Hall 101' },
      { courseCode: '20A05402T', date: '2026-10-20', session: 'FN', hall: 'Exam Hall 102' },
      { courseCode: '20A05403T', date: '2026-10-22', session: 'FN', hall: 'Exam Hall 101' },
    ];
    expect(detectExamClash(validSchedule).hasConflict).toBe(false);

    const clashingSchedule: ExamSlot[] = [
      { courseCode: '20A05401T', date: '2026-10-20', session: 'FN', hall: 'Exam Hall 101' },
      { courseCode: '20A05402T', date: '2026-10-20', session: 'FN', hall: 'Exam Hall 101' }, // Clashing in Hall 101!
    ];
    const clashResult = detectExamClash(clashingSchedule);
    expect(clashResult.hasConflict).toBe(true);
    expect(clashResult.conflicts[0]).toContain('Exam Hall 101');
  });
});
