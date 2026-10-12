import React from 'react';
import prisma from '@/lib/prisma';
import StudentPlacementsClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentPlacementsPage() {
    let student: any = null;
    let documents: any[] = [];

    try {
        student = await prisma.student.findFirst({
            include: {
                documents: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (student?.documents) {
            documents = student.documents;
        }
    } catch {
        student = null;
        documents = [];
    }

    // Normalize document objects so all fields are bulletproof
    const normalizedDocs = (documents.length > 0 ? documents : [
        {
            id: "doc-1",
            fileName: "LakshmiPriya_Resume_TCS_Digital.pdf",
            fileUrl: "#",
            fileSize: 245000,
            status: "PARSED",
            parsedData: JSON.stringify({
                skills: ["Python", "Machine Learning", "DBMS", "Java", "Data Structures", "Next.js", "SQL"],
                cgpa: 8.92,
                atsScore: 94
            }),
            createdAt: new Date().toISOString()
        },
        {
            id: "doc-2",
            fileName: "KLMCE_Standard_Format_CV.pdf",
            fileUrl: "#",
            fileSize: 184000,
            status: "PARSED",
            parsedData: JSON.stringify({
                skills: ["C++", "Algorithms", "System Design", "Cloud Computing"],
                cgpa: 8.92,
                atsScore: 88
            }),
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
    ]).map(doc => {
        let skills: string[] = ["Python", "SQL", "React", "DBMS"];
        let atsScore = 92;
        try {
            if (doc.parsedData) {
                const parsed = typeof doc.parsedData === 'string' ? JSON.parse(doc.parsedData) : doc.parsedData;
                if (Array.isArray(parsed?.skills)) skills = parsed.skills;
                if (parsed?.atsScore) atsScore = parsed.atsScore;
            } else if (Array.isArray(doc.extractedSkills)) {
                skills = doc.extractedSkills;
            }
        } catch {
            // Keep default skills
        }

        return {
            id: doc.id || `doc-${Math.random()}`,
            fileName: doc.fileName || doc.name || 'Resume_Document.pdf',
            fileUrl: doc.fileUrl || doc.url || '#',
            fileSize: typeof doc.fileSize === 'number' ? doc.fileSize : (doc.size || 240000),
            status: (doc.status === 'PARSED' || doc.ocrStatus === 'COMPLETED') ? 'PARSED' : 'PENDING',
            skills,
            atsScore,
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()
        };
    });

    const activeDrives = [
        {
            id: "drv-01",
            company: "Tata Consultancy Services (TCS)",
            badge: "TCS Digital",
            tier: "Marquee (Tier-1)",
            role: "Systems Engineer & Digital Cadre",
            ctc: "₹ 7.0 - 9.0 LPA",
            location: "Hyderabad / Bengaluru",
            driveDate: "Oct 24, 2026",
            deadline: "Oct 20, 2026",
            status: "Shortlisted",
            stage: "Technical Interview Scheduled",
            eligibilityMinCgpa: 7.0,
            backlogsAllowed: 0,
            branches: ["CSE", "ECE", "AI&DS"],
            rounds: ["Aptitude Test (Passed)", "Coding Round (Passed)", "Technical Interview (Pending)", "HR Round"],
            currentRound: 3
        },
        {
            id: "drv-02",
            company: "Infosys",
            badge: "Specialist Programmer",
            tier: "Dream (Tier-1)",
            role: "Specialist Programmer / Power Programmer",
            ctc: "₹ 9.5 LPA",
            location: "Bengaluru / Pune / Hyderabad",
            driveDate: "Nov 02, 2026",
            deadline: "Oct 26, 2026",
            status: "Eligible",
            stage: "Registrations Open • Apply Before Deadline",
            eligibilityMinCgpa: 7.5,
            backlogsAllowed: 0,
            branches: ["All B.Tech Branches"],
            rounds: ["HackWithInfy Coding", "Tech Interview", "HR Discussion"],
            currentRound: 1
        },
        {
            id: "drv-03",
            company: "Accenture",
            badge: "Advanced ASE",
            tier: "Prime (Tier-2)",
            role: "Advanced Application Software Engineer",
            ctc: "₹ 6.5 LPA",
            location: "Hyderabad / Chennai",
            driveDate: "Nov 15, 2026",
            deadline: "Nov 05, 2026",
            status: "Shortlisted",
            stage: "Round 1 Coding Slot Confirmed",
            eligibilityMinCgpa: 6.5,
            backlogsAllowed: 0,
            branches: ["CSE", "ECE", "EEE"],
            rounds: ["Cognitive Assessment", "Coding Assessment", "Communication Test", "Interview"],
            currentRound: 2
        },
        {
            id: "drv-04",
            company: "Cognizant",
            badge: "GenC Next",
            tier: "Prime (Tier-2)",
            role: "Data & AI Cloud Specialist",
            ctc: "₹ 6.75 LPA",
            location: "Hyderabad / Bengaluru",
            driveDate: "Nov 22, 2026",
            deadline: "Nov 12, 2026",
            status: "Eligible",
            stage: "Upcoming On-Campus Assessment",
            eligibilityMinCgpa: 7.0,
            backlogsAllowed: 0,
            branches: ["CSE", "AI&DS", "ECE"],
            rounds: ["GenC Next Coding Challenge", "Technical Interview", "HR Round"],
            currentRound: 1
        },
        {
            id: "drv-05",
            company: "Wipro",
            badge: "Turbo Cadre",
            tier: "Prime (Tier-2)",
            role: "DevOps & Cloud Engineer",
            ctc: "₹ 6.5 LPA",
            location: "Hyderabad / Bengaluru",
            driveDate: "Dec 01, 2026",
            deadline: "Nov 20, 2026",
            status: "Applied",
            stage: "Application Verified by Placement Cell",
            eligibilityMinCgpa: 6.5,
            backlogsAllowed: 0,
            branches: ["CSE", "ECE"],
            rounds: ["National Talent Hunt Test", "Coding Round", "Technical & HR Interview"],
            currentRound: 2
        }
    ];

    const studentProfile = {
        name: student?.name || "Lakshmi Priya Reddy",
        rollNo: student?.rollNo || "24C01A0501",
        cgpa: 8.92,
        branch: "Computer Science and Engineering",
        batch: "2024 - 2028",
        attendancePct: 89.1,
        activeBacklogs: 0,
        atsScore: 94,
        readinessGrade: "A+ (Tier-1 Dream Eligible)",
        placementOfficer: "Dr. M. V. Narayana, Ph.D. (Dean - Placements & Corporate Relations)"
    };

    return <StudentPlacementsClient documents={normalizedDocs} drives={activeDrives} profile={studentProfile} />;
}
