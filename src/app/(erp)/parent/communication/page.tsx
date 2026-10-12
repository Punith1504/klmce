"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Send, 
  UserCheck, 
  Phone, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';
import { FACULTY } from '@/lib/syntheticData';

interface ChatMessage {
  id: string;
  sender: "mentor" | "parent";
  text: string;
  time: string;
}

export default function ParentCommunication() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "mentor",
      text: "Namaskaram Sri Narayana Reddy garu. Lakshmi Priya is performing exceptionally well in DBMS and has secured 9.42 CGPA. Her attendance is healthy at 92%.",
      time: "Yesterday, 04:15 PM"
    },
    {
      id: "msg-2",
      sender: "parent",
      text: "Dhanyavadalu Sir. We received her mid marks report. She is preparing for the TCS Digital campus recruitment drive next week.",
      time: "Yesterday, 06:30 PM"
    },
    {
      id: "msg-3",
      sender: "mentor",
      text: "Very good. We have arranged special mock technical interviews this Saturday at 10 AM. Please advise her to attend without fail.",
      time: "Today, 10:20 AM"
    }
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState("2026-10-18");
  const [meetingTime, setMeetingTime] = useState("10:30 AM");
  const [meetingTopic, setMeetingTopic] = useState("Campus Placement Preparation");
  const [scheduledMeeting, setScheduledMeeting] = useState<{ date: string; time: string; topic: string } | null>({
    date: "Oct 18, 2026",
    time: "10:30 AM",
    topic: "Campus Placement Preparation & Higher Studies"
  });
  const [bookedToast, setBookedToast] = useState("");

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "parent",
      text: inputMsg.trim(),
      time: "Just now"
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg("");
  };

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduledMeeting({
      date: meetingDate,
      time: meetingTime,
      topic: meetingTopic
    });
    setShowMeetingModal(false);
    setBookedToast("Meeting request confirmed! Mentor notified via SMS.");
    setTimeout(() => setBookedToast(""), 4000);
  };

  const mentor = (FACULTY && FACULTY.length > 0) ? FACULTY[0] : {
    name: "Dr. V. Lokeswara Reddy",
    phone: "+91 94402 12345",
    department: "Computer Science and Engineering"
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2.5 sm:gap-3 mb-1 sm:mb-2">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 shrink-0"/> Parent Communication & Mentorship
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Direct channel with Ward Mentor (Dr. V. Lokeswara Reddy), College notices, and appointment scheduler.
          </p>
        </div>
        <button 
          onClick={() => setShowMeetingModal(true)}
          className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] min-h-[44px]">
          <Calendar className="w-4 h-4" /> Schedule Mentor Meeting
        </button>
      </div>

      {bookedToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{bookedToast}</p>
        </div>
      )}

      {/* Main Grid: Chat on Left, Notices & Appointments on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Direct Chat with Faculty Mentor (7 cols) */}
        <div className="lg:col-span-7 bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg flex flex-col h-[480px] sm:h-[580px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-xs sm:text-sm shrink-0">
                LR
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-100 text-xs sm:text-sm truncate">{mentor.name}</h3>
                <p className="text-[10px] sm:text-xs text-indigo-300 truncate">Ward Mentor • {mentor.department}</p>
              </div>
            </div>
            <a 
              href={`tel:${mentor.phone}`}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> <span className="hidden xs:inline">{mentor.phone}</span>
            </a>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-black/10">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm ${
                    m.sender === 'parent' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(79,70,229,0.3)]' 
                      : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-none'
                  }`}>
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 sm:p-3 border-t border-white/10 bg-black/30 flex items-center gap-2">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message Dr. Lokeswara Reddy..."
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 sm:p-3 rounded-xl transition shrink-0 min-w-[42px] min-h-[42px] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Scheduled Meetings & College Notices (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Active / Scheduled Meeting Card */}
          <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/10 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> Scheduled Appointment
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                CONFIRMED
              </span>
            </div>

            {scheduledMeeting ? (
              <div className="space-y-3 bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Date & Time</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-200">{scheduledMeeting.date} at {scheduledMeeting.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Venue</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">Principal Chamber / Google Meet</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[11px] sm:text-xs text-slate-400">Topic: <span className="text-slate-200 font-medium">{scheduledMeeting.topic}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs sm:text-sm">
                No active appointments. Click schedule to meet the mentor.
              </div>
            )}
          </div>

          {/* Official College Circulars */}
          <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/10 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> College Notices & Circulars
              </h2>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="bg-white/5 p-3 sm:p-3.5 rounded-xl border border-white/10 flex justify-between items-start gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">CIRCULAR</span>
                    <p className="text-xs font-bold text-slate-200">Dussehra Vacation Schedule</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    College closed Oct 10th to 14th. Regular class work resumes Oct 15th.
                  </p>
                </div>
                <button 
                  onClick={() => alert("Downloading Dussehra Holidays Circular (PDF)")}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/5 p-3 sm:p-3.5 rounded-xl border border-white/10 flex justify-between items-start gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">EXAMS</span>
                    <p className="text-xs font-bold text-slate-200">B.Tech Regular Exam Fee</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Semester Examination fee portal live. Last date without fine: Oct 15th.
                  </p>
                </div>
                <button 
                  onClick={() => alert("Downloading Semester Exam Fee Circular (PDF)")}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/5 p-3 sm:p-3.5 rounded-xl border border-white/10 flex justify-between items-start gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">CAREER</span>
                    <p className="text-xs font-bold text-slate-200">TCS Digital & Infosys Drive</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Eligible IV B.Tech students must verify resumes before Oct 16th.
                  </p>
                </div>
                <button 
                  onClick={() => alert("Downloading Placement Drive Schedule (PDF)")}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Meeting Request Modal (Mobile Bottom Sheet / Desktop Centered) */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1C182A] border border-white/20 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowMeetingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">Schedule Mentor Meeting</h3>
            <p className="text-xs text-slate-400 mb-4 sm:mb-5">
              Request a 1-on-1 counseling slot with Dr. V. Lokeswara Reddy (Ward Mentor).
            </p>

            <form onSubmit={handleBookMeeting} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Preferred Date
                </label>
                <input 
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Preferred Time Slot
                </label>
                <select 
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500">
                  <option value="10:00 AM">10:00 AM - 10:30 AM (In-person)</option>
                  <option value="11:30 AM">11:30 AM - 12:00 PM (In-person)</option>
                  <option value="03:00 PM">03:00 PM - 03:30 PM (Google Meet)</option>
                  <option value="04:30 PM">04:30 PM - 05:00 PM (Phone Call)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Meeting Topic / Query
                </label>
                <input 
                  type="text"
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  placeholder="e.g. Placement Guidance, Hostel Accommodation"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 pb-2 sm:pb-0">
                <button 
                  type="button" 
                  onClick={() => setShowMeetingModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border border-white/10 min-h-[42px]">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] min-h-[42px]">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
