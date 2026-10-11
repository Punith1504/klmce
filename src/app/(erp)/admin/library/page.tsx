"use client";

import React, { useState } from 'react';
import { Book, Search, BookOpen, CheckCircle2, Clock, Users, ArrowUpRight } from 'lucide-react';

export default function AdminLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const libraryCatalog = [
    { id: "LIB-CS-001", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", isbn: "978-0073523323", dept: "CSE", totalCopies: 18, availableCopies: 5, semester: "Sem 5" },
    { id: "LIB-CS-002", title: "Operating System Concepts (10th Ed)", author: "Abraham Silberschatz, Peter Galvin", isbn: "978-1118063330", dept: "CSE", totalCopies: 22, availableCopies: 8, semester: "Sem 5" },
    { id: "LIB-CS-003", title: "Introduction to Algorithms (CLRS)", author: "Thomas H. Cormen, Charles Leiserson", isbn: "978-0262033848", dept: "CSE", totalCopies: 15, availableCopies: 3, semester: "Sem 4" },
    { id: "LIB-EC-004", title: "Electronic Devices and Circuit Theory", author: "Robert L. Boylestad, Louis Nashelsky", isbn: "978-0132622264", dept: "ECE", totalCopies: 20, availableCopies: 11, semester: "Sem 3" },
    { id: "LIB-AI-005", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", isbn: "978-0134610993", dept: "AI&DS", totalCopies: 12, availableCopies: 4, semester: "Sem 5" },
    { id: "LIB-EE-006", title: "Electric Machinery Fundamentals", author: "Stephen J. Chapman", isbn: "978-0071086172", dept: "EEE", totalCopies: 16, availableCopies: 7, semester: "Sem 4" }
  ];

  const recentIssues = [
    { student: "C. Lakshmi Priya", rollNo: "219Y1A0501", book: "Database System Concepts", issuedOn: "01-Oct-2026", dueDate: "16-Oct-2026", status: "Active" },
    { student: "K. Bhavani", rollNo: "219Y1A0514", book: "Introduction to Algorithms", issuedOn: "28-Sep-2026", dueDate: "13-Oct-2026", status: "Active" },
    { student: "V. Sai Teja", rollNo: "219Y1A0423", book: "Electronic Devices and Circuit Theory", issuedOn: "22-Sep-2026", dueDate: "07-Oct-2026", status: "Overdue" }
  ];

  const filtered = libraryCatalog.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-1">
            <Book className="w-8 h-8 text-indigo-400" /> Central Digital Library & OPAC
          </h1>
          <p className="text-slate-400 text-sm">
            K.S.R.M. / KLMCE Central Library • Automated Book Issues, Delnet & IEEE e-Journals
          </p>
        </div>

        <button
          onClick={() => alert("Issue book transaction portal ready for barcode / RFID scanning.")}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition"
        >
          + Issue New Book to Student
        </button>
      </div>

      {/* Library KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Volumes</p>
          <h3 className="text-2xl font-bold text-white mt-1">42,500+</h3>
          <p className="text-xs text-indigo-400 mt-1">AICTE & JNTUA Compliant</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Currently Borrowed</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">1,840 Books</h3>
          <p className="text-xs text-slate-400 mt-1">Active student issues</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">IEEE & ScienceDirect</p>
          <h3 className="text-2xl font-bold text-sky-400 mt-1">14 e-Databases</h3>
          <p className="text-xs text-slate-400 mt-1">Full-text digital access</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Overdue Books</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">14 Volumes</h3>
          <p className="text-xs text-rose-300 mt-1">SMS notice generated</p>
        </div>
      </div>

      {/* Search & Catalog */}
      <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">OPAC Online Public Access Catalog</h2>
            <p className="text-xs text-slate-400">Search textbooks, reference volumes, and conference proceedings</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, dept..."
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                <th className="pb-3 px-4">Book Title & Authors</th>
                <th className="pb-3 px-4">Catalog Code</th>
                <th className="pb-3 px-4">Department</th>
                <th className="pb-3 px-4">Available Copies</th>
                <th className="pb-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filtered.map((book) => (
                <tr key={book.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{book.title}</p>
                    <p className="text-xs text-slate-400">{book.author}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-indigo-300">{book.id}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                      {book.dept}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-emerald-400">{book.availableCopies}</span>
                    <span className="text-slate-500 text-xs"> / {book.totalCopies}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => alert(`Issuing ${book.title}...`)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                    >
                      Issue Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Borrowers */}
      <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">
          Current Borrower Circulation Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                <th className="pb-3 px-4">Student</th>
                <th className="pb-3 px-4">Roll Number</th>
                <th className="pb-3 px-4">Borrowed Title</th>
                <th className="pb-3 px-4">Issued On</th>
                <th className="pb-3 px-4">Due Date</th>
                <th className="pb-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {recentIssues.map((iss, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">{iss.student}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">{iss.rollNo}</td>
                  <td className="py-3.5 px-4 text-slate-200">{iss.book}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">{iss.issuedOn}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-300">{iss.dueDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    {iss.status === 'Active' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                        OVERDUE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
