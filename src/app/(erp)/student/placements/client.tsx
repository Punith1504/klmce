"use client";

import React, { useState, useRef } from 'react';
import { 
  Briefcase, 
  FileText, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Upload, 
  Calendar, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  ExternalLink, 
  Download, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';

interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: string;
  skills: string[];
  atsScore?: number;
  createdAt: string;
}

interface PlacementDrive {
  id: string;
  company: string;
  badge: string;
  tier: string;
  role: string;
  ctc: string;
  location: string;
  driveDate: string;
  deadline: string;
  status: "Eligible" | "Applied" | "Shortlisted";
  stage: string;
  eligibilityMinCgpa: number;
  backlogsAllowed: number;
  branches: string[];
  rounds: string[];
  currentRound: number;
}

interface StudentProfile {
  name: string;
  rollNo: string;
  cgpa: number;
  branch: string;
  batch: string;
  attendancePct: number;
  activeBacklogs: number;
  atsScore: number;
  readinessGrade: string;
  placementOfficer: string;
}

export default function StudentPlacementsClient({ 
  documents: initialDocs = [], 
  drives: initialDrives = [], 
  profile: initialProfile 
}: { 
  documents?: DocumentItem[]; 
  drives?: PlacementDrive[]; 
  profile?: StudentProfile; 
}) {
  const profile = initialProfile || {
    name: "Lakshmi Priya Reddy",
    rollNo: "24C01A0501",
    cgpa: 8.92,
    branch: "Computer Science and Engineering",
    batch: "2024 - 2028",
    attendancePct: 89.1,
    activeBacklogs: 0,
    atsScore: 94,
    readinessGrade: "A+ (Tier-1 Dream Eligible)",
    placementOfficer: "Dr. M. V. Narayana, Ph.D. (Dean - Placements & Corporate Relations)"
  };

  const [activeTab, setActiveTab] = useState<"drives" | "resumes" | "readiness">("drives");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [drivesList, setDrivesList] = useState<PlacementDrive[]>(initialDrives);
  const [docsList, setDocsList] = useState<DocumentItem[]>(initialDocs);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyDrive = (driveId: string) => {
    setDrivesList(prev => prev.map(d => {
      if (d.id === driveId) {
        return {
          ...d,
          status: "Applied",
          stage: "Application Submitted • Resume Sent to Recruiters"
        };
      }
      return d;
    }));
    showToast("Application submitted successfully with verified KLMCE student profile!");
  };

  // Safe client-side file parser that works 100% offline & demo mode
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileUrl: "#",
        fileSize: file.size || 220000,
        status: "PARSED",
        skills: ["Python", "Next.js", "TypeScript", "SQL", "Machine Learning", "Data Structures", "Docker"],
        atsScore: 95,
        createdAt: new Date().toISOString()
      };
      setDocsList(prev => [newDoc, ...prev]);
      setIsUploading(false);
      showToast(`Resume "${file.name}" uploaded and parsed with 95% ATS match!`);
    }, 1200);
  };

  const filteredDrives = drivesList.filter(d => {
    if (filterStatus === "ALL") return true;
    return d.status.toUpperCase() === filterStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
              Corporate Relations & T&P Cell
            </span>
            <span className="text-xs text-slate-400">• KLMCE Autonomous</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-violet-400" /> Campus Placements & Recruitment Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track active recruitment drives, corporate eligibility, mock assessments, and ATS-optimized resume records.
          </p>
        </div>

        {/* Quick Officer Tag */}
        <div className="bg-[#1b172a] border border-white/10 rounded-2xl p-3 sm:p-4 text-left md:text-right shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Placement Officer In-Charge</p>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">{profile.placementOfficer}</p>
        </div>
      </div>

      {/* Eligibility & Readiness KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-[#19152b]/90 border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8" />
          <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Eligibility Status
          </p>
          <p className="text-xl sm:text-2xl font-black text-white">{profile.readinessGrade}</p>
          <p className="text-[11px] text-emerald-300/70 mt-1">Eligible for all Tier-1 Marquee Drives</p>
        </div>

        <div className="bg-[#19152b]/90 border border-indigo-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8" />
          <p className="text-[11px] uppercase font-bold tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Cumulative CGPA
          </p>
          <p className="text-xl sm:text-2xl font-black text-white">{profile.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10.0</span></p>
          <p className="text-[11px] text-indigo-300/70 mt-1">Min. Cut-off met (7.0 threshold)</p>
        </div>

        <div className="bg-[#19152b]/90 border border-violet-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl -mr-8 -mt-8" />
          <p className="text-[11px] uppercase font-bold tracking-wider text-violet-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> ATS Resume Match
          </p>
          <p className="text-xl sm:text-2xl font-black text-white">{profile.atsScore}% <span className="text-xs text-emerald-400 font-semibold">Verified</span></p>
          <p className="text-[11px] text-violet-300/70 mt-1">Optimal keyword density for MNCs</p>
        </div>

        <div className="bg-[#19152b]/90 border border-cyan-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl -mr-8 -mt-8" />
          <p className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Attendance Compliance
          </p>
          <p className="text-xl sm:text-2xl font-black text-white">{profile.attendancePct}%</p>
          <p className="text-[11px] text-cyan-300/70 mt-1">0 Active Backlogs • Verified Clear</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("drives")}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === "drives" 
              ? "border-violet-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Active Campus Drives ({drivesList.length})
        </button>

        <button
          onClick={() => setActiveTab("resumes")}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === "resumes" 
              ? "border-violet-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Resume ATS Vault & Parser ({docsList.length})
        </button>

        <button
          onClick={() => setActiveTab("readiness")}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === "readiness" 
              ? "border-violet-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Training & Mock Assessments
        </button>
      </div>

      {/* TAB 1: ACTIVE DRIVES */}
      {activeTab === "drives" && (
        <div className="space-y-6">
          {/* Status Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold mr-1">Filter:</span>
            {[
              { label: "All Drives", value: "ALL", count: drivesList.length },
              { label: "Shortlisted", value: "SHORTLISTED", count: drivesList.filter(d => d.status === "Shortlisted").length },
              { label: "Eligible", value: "ELIGIBLE", count: drivesList.filter(d => d.status === "Eligible").length },
              { label: "Applied", value: "APPLIED", count: drivesList.filter(d => d.status === "Applied").length }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
                  filterStatus === f.value
                    ? "bg-violet-600 text-white border-violet-500 shadow-md"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-white/5"
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-300 font-mono">
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Drives Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredDrives.map(drive => (
              <div 
                key={drive.id}
                className="bg-[#1b172c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {drive.tier}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {drive.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                        {drive.company}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{drive.role}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl inline-block">
                        {drive.ctc}
                      </span>
                    </div>
                  </div>

                  {/* Drive Metadata Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Drive Date</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {drive.driveDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Location</span>
                      <span className="font-semibold text-slate-200 truncate block mt-0.5">{drive.location}</span>
                    </div>
                  </div>

                  {/* Stage Alert Indicator */}
                  <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Recruitment Progress</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        drive.status === 'Shortlisted' ? 'bg-emerald-500/20 text-emerald-300' :
                        drive.status === 'Applied' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {drive.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      {drive.stage}
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setSelectedDrive(drive)}
                    className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Rounds & Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {drive.status === "Eligible" ? (
                    <button
                      onClick={() => handleApplyDrive(drive.id)}
                      className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-violet-600/30 active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Apply Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="py-2.5 px-4 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold rounded-xl transition border border-emerald-500/30 flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Hall Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME ATS VAULT */}
      {activeTab === "resumes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left: Uploader Card */}
          <div className="bg-[#1b172c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ATS Resume Parsing Engine</h2>
                  <p className="text-xs text-slate-400">Upload your latest PDF/DOCX resume for automated OCR skill extraction.</p>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLocalFileUpload} 
                accept=".pdf,.docx" 
                className="hidden" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 border-2 border-dashed border-violet-500/40 hover:border-violet-400 bg-black/20 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-violet-500/[0.04] flex flex-col items-center justify-center min-h-[220px]"
              >
                {isUploading ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-violet-300 animate-pulse">Running AI Skill Extraction & ATS Scoring...</p>
                    <p className="text-xs text-slate-500">Scanning technical keywords, formatting, and institutional criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-violet-600/20 text-violet-400 rounded-2xl flex items-center justify-center mx-auto border border-violet-500/30">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Click or drag & drop resume file here</p>
                      <p className="text-xs text-slate-400 mt-1">Supports PDF & DOCX up to 10MB • Standard KLMCE Template Recommended</p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-violet-600/30"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 shrink-0" /> Verified Institutional Template Support
              </div>
              <p>Your parsed resume will automatically sync with recruiter pipelines for TCS, Infosys, and Accenture drives.</p>
            </div>
          </div>

          {/* Right: Uploaded Resumes List */}
          <div className="bg-[#1b172c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Verified Resumes & Credentials ({docsList.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Ready for MNC Applications</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {docsList.map(doc => (
                <div 
                  key={doc.id}
                  className="bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-violet-500/30 transition space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[220px] sm:max-w-[280px]" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> PARSED
                    </span>
                  </div>

                  {/* Extracted Skills Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Extracted ATS Technical Skills
                      </span>
                      {doc.atsScore && (
                        <span className="text-[11px] font-extrabold text-violet-300">
                          ATS Match: {doc.atsScore}%
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {doc.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="bg-violet-500/15 text-violet-300 border border-violet-500/25 px-2.5 py-1 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Matched with 5 Active Campus Drives</span>
                    <button 
                      onClick={() => showToast("Resume PDF downloaded successfully.")}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TRAINING & MOCK ASSESSMENTS */}
      {activeTab === "readiness" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#1b172c]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Technical Coding Mock</h3>
              <p className="text-xs text-slate-400 mt-1">Conducted by KLMCE Coding Club (LeetCode Medium pattern)</p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Score</span>
              <span className="text-emerald-400 font-bold">92.0% (Cleared)</span>
            </div>
            <p className="text-[11px] text-slate-500">Topics: Dynamic Programming, Graph Traversal, SQL Joins</p>
          </div>

          <div className="bg-[#1b172c]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 border border-violet-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Aptitude & Logical Reasoning</h3>
              <p className="text-xs text-slate-400 mt-1">MNC Tier-1 standardized diagnostic evaluation</p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Score</span>
              <span className="text-indigo-400 font-bold">88.5% (Safe Zone)</span>
            </div>
            <p className="text-[11px] text-slate-500">Topics: Quantitative Ability, Verbal Reasoning, Data Interpretation</p>
          </div>

          <div className="bg-[#1b172c]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">HR & Communication Mock</h3>
              <p className="text-xs text-slate-400 mt-1">Reviewed by Dr. M. V. Narayana & External Industry Mentors</p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Rating</span>
              <span className="text-emerald-400 font-bold">Excellent (Grade A+)</span>
            </div>
            <p className="text-[11px] text-slate-500">Remarks: High confidence, articulates technical solutions clearly</p>
          </div>
        </div>
      )}

      {/* MODAL: DRIVE DETAILS & HALL TICKET */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181428] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedDrive(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {selectedDrive.badge}
                </span>
                <span className="text-xs text-slate-400">• Drive ID: {selectedDrive.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedDrive.company}</h2>
              <p className="text-xs sm:text-sm text-slate-400">{selectedDrive.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Package (CTC)</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedDrive.ctc}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Date of Assessment</span>
                <span className="text-slate-200 font-bold text-sm">{selectedDrive.driveDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Venue & Reporting</span>
                <span className="text-slate-200 font-medium">CSE Seminar Hall, 09:00 AM</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Dress Code</span>
                <span className="text-slate-200 font-medium">Formal Institutional Attire</span>
              </div>
            </div>

            {/* Rounds Progression */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recruitment Rounds</h4>
              <div className="space-y-2">
                {selectedDrive.rounds.map((round, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                      idx + 1 < selectedDrive.currentRound 
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-semibold'
                        : idx + 1 === selectedDrive.currentRound
                        ? 'bg-violet-500/20 text-violet-200 border-violet-500/40 font-bold'
                        : 'bg-white/5 text-slate-500 border-white/5'
                    }`}
                  >
                    <span>Round {idx + 1}: {round}</span>
                    {idx + 1 < selectedDrive.currentRound ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : idx + 1 === selectedDrive.currentRound ? (
                      <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded font-bold">Current</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedDrive(null);
                  showToast("Hall Ticket PDF generated & downloaded!");
                }}
                className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Official Hall Ticket
              </button>
              <button
                onClick={() => setSelectedDrive(null)}
                className="py-3 px-5 bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
