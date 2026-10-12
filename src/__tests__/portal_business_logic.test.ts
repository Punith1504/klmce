import { describe, it, expect } from 'vitest';

describe('KLMCE Enterprise Portal Business Logic & Autonomous Regulations', () => {

  describe('Autonomous R20 SGPA & CGPA Calculation', () => {
    const GRADE_POINTS: Record<string, number> = {
      'O': 10,
      'A+': 9,
      'A': 8,
      'B+': 7,
      'B': 6,
      'C': 5,
      'F': 0,
    };

    function calculateSGPA(courses: { credits: number; grade: string }[]): number {
      const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
      if (totalCredits === 0) return 0;
      const totalPoints = courses.reduce((acc, c) => acc + (c.credits * (GRADE_POINTS[c.grade] ?? 0)), 0);
      return Number((totalPoints / totalCredits).toFixed(2));
    }

    it('accurately computes Semester Grade Point Average (SGPA)', () => {
      const semesterCourses = [
        { credits: 3, grade: 'O' },  // 3 * 10 = 30
        { credits: 3, grade: 'A+' }, // 3 * 9 = 27
        { credits: 4, grade: 'A' },  // 4 * 8 = 32
        { credits: 2, grade: 'A+' }, // 2 * 9 = 18
        { credits: 3, grade: 'O' },  // 3 * 10 = 30
      ]; // Total credits: 15, Total points: 137 -> 137 / 15 = 9.133... -> 9.13

      const sgpa = calculateSGPA(semesterCourses);
      expect(sgpa).toBe(9.13);
    });

    it('assigns 0 points to failed subjects (Grade F)', () => {
      const semesterCourses = [
        { credits: 4, grade: 'O' }, // 40
        { credits: 4, grade: 'F' }, // 0
      ]; // Total credits: 8, points: 40 -> 40 / 8 = 5.00
      expect(calculateSGPA(semesterCourses)).toBe(5.00);
    });
  });

  describe('Autonomous Attendance Regulations & Condonation Rules', () => {
    function getAttendanceEligibility(percentage: number) {
      if (percentage >= 75) {
        return { status: 'ELIGIBLE', message: 'Eligible for Regular Hall Ticket' };
      }
      if (percentage >= 65) {
        return { status: 'CONDONATION', message: 'Eligible on Medical Grounds with Condonation Fee' };
      }
      return { status: 'DETAINED', message: 'Detained due to Shortage of Attendance (<65%)' };
    }

    it('marks attendance >= 75% as ELIGIBLE', () => {
      expect(getAttendanceEligibility(88.5).status).toBe('ELIGIBLE');
      expect(getAttendanceEligibility(75.0).status).toBe('ELIGIBLE');
    });

    it('flags attendance between 65% and 75% for Condonation', () => {
      const result = getAttendanceEligibility(68.2);
      expect(result.status).toBe('CONDONATION');
      expect(result.message).toContain('Condonation Fee');
    });

    it('detains student when attendance falls below 65%', () => {
      const result = getAttendanceEligibility(62.0);
      expect(result.status).toBe('DETAINED');
      expect(result.message).toContain('Detained');
    });
  });

  describe('Faculty Internal Continuous Evaluation (CIE) Formulas', () => {
    function computeScaledInternalScore(descriptive: number, quiz: number, assignment: number): number {
      // Descriptive (out of 30) scaled to 15, Quiz (10) scaled to 5, Assignment (10) scaled to 10 -> Total 30
      const scaledDescriptive = (descriptive / 30) * 15;
      const scaledQuiz = (quiz / 10) * 5;
      const scaledAssignment = (assignment / 10) * 10;
      return Math.round(scaledDescriptive + scaledQuiz + scaledAssignment);
    }

    it('correctly scales maximum internal marks to 30', () => {
      const perfectScore = computeScaledInternalScore(30, 10, 10);
      expect(perfectScore).toBe(30);
    });

    it('correctly calculates partial marks', () => {
      // descriptive 24 -> 12, quiz 8 -> 4, assignment 9 -> 9 = 25
      const partialScore = computeScaledInternalScore(24, 8, 9);
      expect(partialScore).toBe(25);
    });
  });

  describe('Fee Ledger & Jagananna Vidya Deevena (JVD) Accounting', () => {
    interface FeeLedgerItem {
      totalDue: number;
      paidAmount: number;
      scholarshipCredit: number; // JVD / RTF
    }

    function calculateOutstandingDues(ledger: FeeLedgerItem[]): { totalDue: number; totalPaid: number; pending: number } {
      const totalDue = ledger.reduce((sum, item) => sum + item.totalDue, 0);
      const totalPaid = ledger.reduce((sum, item) => sum + item.paidAmount + item.scholarshipCredit, 0);
      return {
        totalDue,
        totalPaid,
        pending: Math.max(0, totalDue - totalPaid)
      };
    }

    it('correctly computes pending tuition fee accounting for JVD credits', () => {
      const ledger: FeeLedgerItem[] = [
        { totalDue: 45000, paidAmount: 0, scholarshipCredit: 45000 }, // Full JVD reimbursement
        { totalDue: 8500, paidAmount: 8500, scholarshipCredit: 0 },    // Exam & Library fee paid
        { totalDue: 22000, paidAmount: 10000, scholarshipCredit: 0 },  // College Bus Transport fee partial
      ];

      const balance = calculateOutstandingDues(ledger);
      expect(balance.totalDue).toBe(75500);
      expect(balance.totalPaid).toBe(63500);
      expect(balance.pending).toBe(12000);
    });
  });

  describe('Rayalaseema Regional Transport Routes & Logistics', () => {
    const KADAPA_BUS_ROUTES = [
      { routeNo: 'RT-01', origin: 'Proddatur Old Bus Stand', stops: 8, distanceKm: 52 },
      { routeNo: 'RT-02', origin: 'Pulivendula RTC Complex', stops: 6, distanceKm: 68 },
      { routeNo: 'RT-03', origin: 'Rayachoty Circle', stops: 7, distanceKm: 54 },
      { routeNo: 'RT-04', origin: 'Badvel Bypass', stops: 5, distanceKm: 60 },
      { routeNo: 'RT-05', origin: 'Kadapa Seven Roads', stops: 12, distanceKm: 14 },
    ];

    it('contains verified regional stops for KLMCE Kadapa', () => {
      expect(KADAPA_BUS_ROUTES.length).toBe(5);
      const proddaturRoute = KADAPA_BUS_ROUTES.find(r => r.origin.includes('Proddatur'));
      expect(proddaturRoute).toBeDefined();
      expect(proddaturRoute?.distanceKm).toBe(52);
    });
  });
});
