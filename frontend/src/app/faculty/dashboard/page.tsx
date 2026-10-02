import { Clock, Users, BookOpen, AlertCircle } from "lucide-react";

export default function FacultyDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#203a43] to-[#0f2027] rounded-2xl p-8 relative overflow-hidden shadow-lg border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2 flex items-center">
            Good Morning, Professor! <span className="ml-2 text-2xl">☕</span>
          </h1>
          <p className="text-teal-100">You have 3 lectures scheduled today and 42 assignments to grade.</p>
        </div>
        
        <div className="bg-[#24263a] rounded-2xl p-6 border border-[#34354a] flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 rounded-full border-4 border-[#00c6a9] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,198,169,0.4)]">
            <span className="text-xl font-bold text-white">42</span>
          </div>
          <h3 className="font-semibold text-white">Pending</h3>
          <p className="text-xs text-gray-400">Assignments to Grade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#00c6a9]" /> Today's Lectures
              </h2>
            </div>
            
            <div className="bg-[#24263a] rounded-2xl p-2 border border-[#34354a] shadow-lg">
              <div className="p-4 flex items-center gap-6 hover:bg-[#2a2b3d] rounded-xl transition-colors border-b border-[#34354a]/50">
                <div className="bg-[#21353f] text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0">
                  09:00 AM
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Advanced Database Systems</h4>
                  <p className="text-xs text-gray-400 mt-1">CSE - Year 3 • Block C - 201</p>
                </div>
                <button className="bg-[#00c6a9] hover:bg-[#00a896] text-white text-[10px] px-3 py-1.5 rounded-lg shrink-0 shadow-lg shadow-teal-500/20 transition-colors">
                  Take Attendance
                </button>
              </div>

              <div className="p-4 flex items-center gap-6 hover:bg-[#2a2b3d] rounded-xl transition-colors">
                <div className="bg-[#21353f] text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0">
                  11:00 AM
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Data Structures Lab</h4>
                  <p className="text-xs text-gray-400 mt-1">CSE - Year 2 • Lab 4</p>
                </div>
                <button className="bg-gray-800 border border-gray-700 text-white text-[10px] px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#24263a] rounded-2xl p-6 border border-[#34354a] shadow-lg">
            <h3 className="font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-[#34354a] hover:bg-[#2a2b3d] hover:border-[#00c6a9]/50 transition-all group">
                <span className="text-sm text-gray-300 group-hover:text-white flex items-center">
                  <Users className="w-4 h-4 mr-3 text-gray-500 group-hover:text-[#00c6a9]" />
                  Student Directory
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-[#34354a] hover:bg-[#2a2b3d] hover:border-[#00c6a9]/50 transition-all group">
                <span className="text-sm text-gray-300 group-hover:text-white flex items-center">
                  <BookOpen className="w-4 h-4 mr-3 text-gray-500 group-hover:text-[#00c6a9]" />
                  Course Material
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-[#34354a] hover:bg-[#2a2b3d] hover:border-[#00c6a9]/50 transition-all group">
                <span className="text-sm text-gray-300 group-hover:text-white flex items-center">
                  <AlertCircle className="w-4 h-4 mr-3 text-gray-500 group-hover:text-[#00c6a9]" />
                  Raise Incident
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
