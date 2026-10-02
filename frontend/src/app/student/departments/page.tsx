import { Users, Mail, User, MessageSquare, Search, BookOpen } from "lucide-react";

export default function DepartmentsPage() {
  
  const facultyList = [
    {
      id: "vlr",
      initial: "V",
      name: "Dr. V. Lokeswara Reddy",
      title: "Professor & HOD",
      edu: "Ph.D in Computer Science",
      tags: ["Discrete Mathematics", "Machine Learning"],
      email: "hod.cse@ksrmce.ac.in",
      color: "bg-indigo-500"
    },
    {
      id: "ms",
      initial: "M",
      name: "Dr. M. Sreenivasulu",
      title: "Professor",
      edu: "Ph.D in Data Mining",
      tags: ["Database Management Systems", "Data Science"],
      email: "sreenivasulu.m@ksrmce.ac.in",
      color: "bg-purple-500"
    },
    {
      id: "nrr",
      initial: "N",
      name: "Dr. N. Ramanjaneya Reddy",
      title: "Associate Professor",
      edu: "Ph.D in IoT",
      tags: ["Digital Logic Design", "Computer Networks"],
      email: "ramanjaneya.n@ksrmce.ac.in",
      color: "bg-[#7a5af8]"
    },
    {
      id: "smf",
      initial: "S",
      name: "Dr. S. M. Farooq",
      title: "Associate Professor",
      edu: "Ph.D in Software Engg",
      tags: ["Software Engineering", "Cloud Computing"],
      email: "farooq.sm@ksrmce.ac.in",
      color: "bg-[#7a5af8]"
    },
    {
      id: "ksr",
      initial: "K",
      name: "Dr. K. Srinivasa Rao",
      title: "Professor",
      edu: "Ph.D in Algorithms",
      tags: ["Design & Analysis of Algorithms"],
      email: "srinivasarao.k@ksrmce.ac.in",
      color: "bg-indigo-500"
    },
    {
      id: "snr",
      initial: "N",
      name: "Sri. Nagaraju Rayapati",
      title: "Assistant Professor",
      edu: "M.Tech (CSE)",
      tags: ["Object Oriented Programming through Java"],
      email: "nagaraju.r@ksrmce.ac.in",
      color: "bg-purple-600"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center mb-2">
            <Users className="w-6 h-6 mr-3 text-[#7a5af8]" /> Departments & Faculty
          </h1>
          <p className="text-gray-400 text-sm">Connect with your professors and explore department directories.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search faculty or subject..." 
            className="bg-[#1a1b2e] border border-[#34354a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7a5af8] w-full md:w-72 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button className="bg-[#4d3fff] text-white px-5 py-2 rounded-xl text-sm font-medium border border-[#5b4eff] shadow-lg shadow-indigo-500/20">
          Computer Science
        </button>
        <button className="bg-[#1a1b2e] hover:bg-[#2a2b3d] text-gray-300 px-5 py-2 rounded-xl text-sm font-medium border border-[#34354a] transition-colors">
          Electronics & Comm.
        </button>
        <button className="bg-[#1a1b2e] hover:bg-[#2a2b3d] text-gray-300 px-5 py-2 rounded-xl text-sm font-medium border border-[#34354a] transition-colors">
          Electrical
        </button>
        <button className="bg-[#1a1b2e] hover:bg-[#2a2b3d] text-gray-300 px-5 py-2 rounded-xl text-sm font-medium border border-[#34354a] transition-colors">
          Mechanical
        </button>
        <button className="bg-[#1a1b2e] hover:bg-[#2a2b3d] text-gray-300 px-5 py-2 rounded-xl text-sm font-medium border border-[#34354a] transition-colors">
          Civil
        </button>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {facultyList.map((faculty) => (
          <div key={faculty.id} className="bg-[#24263a] rounded-3xl p-6 border border-[#34354a] shadow-xl flex flex-col hover:border-[#4d3fff]/50 transition-colors group">
            
            <div className="flex items-center gap-4 mb-6">
              <div className={\`w-14 h-14 rounded-2xl \${faculty.color} flex items-center justify-center font-bold text-xl text-white shadow-lg\`}>
                {faculty.initial}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-[#9b8aff] transition-colors">{faculty.name}</h3>
                <p className="text-sm text-indigo-300 font-medium">{faculty.title}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-5 flex justify-center mr-2"><User className="w-4 h-4 text-gray-500" /></div>
                {faculty.edu}
              </div>
              <div className="flex items-start text-sm text-gray-300">
                <div className="w-5 flex justify-center mr-2 mt-0.5"><BookOpen className="w-4 h-4 text-gray-500" /></div>
                <div className="flex flex-wrap gap-2">
                  {faculty.tags.map((tag, i) => (
                    <span key={i} className="bg-[#1a1b2e] border border-[#34354a] text-xs px-2 py-1 rounded-md text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-5 flex justify-center mr-2"><Mail className="w-4 h-4 text-gray-500" /></div>
                <a href={\`mailto:\${faculty.email}\`} className="hover:text-white transition-colors">{faculty.email}</a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="flex items-center justify-center py-2.5 rounded-xl border border-[#34354a] bg-[#1a1b2e] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium transition-colors">
                <User className="w-4 h-4 mr-2" /> Profile
              </button>
              <button className="flex items-center justify-center py-2.5 rounded-xl bg-[#4d3fff] hover:bg-[#5b4eff] text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </button>
            </div>
            
          </div>
        ))}

      </div>
    </div>
  );
}
