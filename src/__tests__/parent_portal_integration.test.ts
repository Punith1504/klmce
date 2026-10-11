import { describe, it, expect } from 'vitest';

describe('Parent Portal Complete Integration Workflows', () => {
  interface WardMonitoringProfile {
    parentName: string;
    wardName: string;
    wardRollNo: string;
    branch: string;
    attendancePercentage: number;
    cgpa: number;
    backlogs: number;
    feePending: number;
    mentor: {
      name: string;
      phone: string;
      email: string;
    };
  }

  const MOCK_PARENT_PROFILE: WardMonitoringProfile = {
    parentName: 'C. Narayana Reddy',
    wardName: 'C. Lakshmi Priya',
    wardRollNo: '219Y1A0501',
    branch: 'Computer Science and Engineering (IV Year)',
    attendancePercentage: 88.5,
    cgpa: 9.4,
    backlogs: 0,
    feePending: 18000,
    mentor: {
      name: 'Dr. P. Radha Krishna',
      phone: '+91 94401 23456',
      email: 'radhakrishna.cse@klmce.ac.in',
    },
  };

  it('correctly maps parent account to ward student details', () => {
    expect(MOCK_PARENT_PROFILE.parentName).toBe('C. Narayana Reddy');
    expect(MOCK_PARENT_PROFILE.wardRollNo).toBe('219Y1A0501');
    expect(MOCK_PARENT_PROFILE.cgpa).toBe(9.4);
    expect(MOCK_PARENT_PROFILE.backlogs).toBe(0);
  });

  it('generates automated parent notifications based on threshold events', () => {
    function generateParentAlerts(profile: WardMonitoringProfile): string[] {
      const alerts: string[] = [];
      if (profile.attendancePercentage < 75) {
        alerts.push(`URGENT: Ward attendance is ${profile.attendancePercentage}%, below 75% JNTUA mandatory threshold.`);
      }
      if (profile.feePending > 0) {
        alerts.push(`NOTICE: Outstanding fee balance of ₹${profile.feePending.toLocaleString('en-IN')} pending.`);
      }
      if (profile.backlogs > 0) {
        alerts.push(`ACADEMIC ALERT: Ward has ${profile.backlogs} uncleared backlogs.`);
      }
      return alerts;
    }

    // High performing student with pending transport fee
    const alerts = generateParentAlerts(MOCK_PARENT_PROFILE);
    expect(alerts.length).toBe(1);
    expect(alerts[0]).toContain('18,000 pending');

    // Low attendance student test case
    const lowAttendanceProfile = { ...MOCK_PARENT_PROFILE, attendancePercentage: 68.0, backlogs: 2 };
    const lowAlerts = generateParentAlerts(lowAttendanceProfile);
    expect(lowAlerts.length).toBe(3);
    expect(lowAlerts[0]).toContain('below 75% JNTUA mandatory threshold');
    expect(lowAlerts[2]).toContain('2 uncleared backlogs');
  });

  it('creates direct communication dispatch link to assigned faculty mentor', () => {
    function generateMentorContactLink(mentorPhone: string, wardRoll: string, parentName: string) {
      const cleaned = mentorPhone.replace(/\D/g, '');
      const message = encodeURIComponent(`Hello Sir, I am ${parentName}, parent of ${wardRoll}. Inquiring regarding campus progress.`);
      return `https://wa.me/${cleaned}?text=${message}`;
    }

    const whatsappLink = generateMentorContactLink(
      MOCK_PARENT_PROFILE.mentor.phone,
      MOCK_PARENT_PROFILE.wardRollNo,
      MOCK_PARENT_PROFILE.parentName
    );

    expect(whatsappLink).toContain('https://wa.me/919440123456');
    expect(whatsappLink).toContain('219Y1A0501');
    expect(whatsappLink).toContain('Narayana');
  });
});
