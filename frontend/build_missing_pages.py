import os

base_dir = r"c:\Users\punit\OneDrive\Desktop\klmce\frontend\src\app\(erp)"

pages = {
    "admin/library": {
        "title": "Central Library",
        "desc": "Manage book catalog and student issues.",
        "icon": "Book",
        "model": "libraryBook",
        "fields": ["title", "author", "totalCopies"]
    },
    "admin/hostel": {
        "title": "Hostel Allocations",
        "desc": "Manage student room allocations.",
        "icon": "Building",
        "model": "hostelAllocation",
        "fields": ["hostelName", "roomNo", "studentId"]
    },
    "admin/transport": {
        "title": "Transport Logistics",
        "desc": "Manage bus routes and student passes.",
        "icon": "Bus",
        "model": "transportAllocation",
        "fields": ["routeName", "stopName", "studentId"]
    },
    "student/courses": {
        "title": "My Courses & LMS",
        "desc": "Access course materials and assignments.",
        "icon": "BookOpen",
        "model": "courseMaterial",
        "fields": ["title", "courseId", "createdAt"]
    },
    "student/fees": {
        "title": "My Fees & Payments",
        "desc": "View pending dues and payment history.",
        "icon": "Banknote",
        "model": "fee",
        "fields": ["type", "amount", "status"]
    },
    "parent/dashboard": {
        "title": "Parent Dashboard",
        "desc": "Overview of your ward's academic standing.",
        "icon": "LayoutDashboard",
        "model": "student",
        "fields": ["name", "rollNo", "batchId"]
    },
    "parent/attendance": {
        "title": "Ward's Attendance",
        "desc": "Detailed attendance history and shortage alerts.",
        "icon": "CalendarCheck",
        "model": "attendance",
        "fields": ["date", "status", "slotId"]
    },
    "parent/fees": {
        "title": "Fee Dues & Payments",
        "desc": "Pay pending fees securely.",
        "icon": "Banknote",
        "model": "fee",
        "fields": ["type", "amount", "status"]
    },
    "faculty/courses": {
        "title": "My Teaching & LMS",
        "desc": "Upload materials and create assignments.",
        "icon": "BookOpen",
        "model": "courseMaterial",
        "fields": ["title", "courseId", "createdAt"]
    }
}

template = """import React from 'react';
import prisma from '@/lib/prisma';
import { {ICON} } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page() {
    // Fetch live data from Prisma
    const items = await prisma.{MODEL}.findMany({
        take: 10,
        orderBy: { id: 'desc' }
    }).catch(() => []); // Fallback for empty DB

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <{ICON} className="w-7 h-7 text-indigo-400"/> {TITLE}
                    </h1>
                    <p className="text-slate-400 text-sm">{DESC}</p>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                            <th className="pb-3 px-4">ID</th>
                            {HEADERS}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item: any) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-xs text-slate-500 font-mono">{String(item.id).substring(0, 8)}</td>
                                {CELLS}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
"""

for route, cfg in pages.items():
    dir_path = os.path.join(base_dir, route.replace('/', os.sep))
    os.makedirs(dir_path, exist_ok=True)
    
    headers = "\n".join([f'<th className="pb-3 px-4">{f}</th>' for f in cfg["fields"]])
    cells = "\n".join([f'<td className="py-4 px-4 text-sm text-slate-200">{{String(item.{f})}}</td>' for f in cfg["fields"]])
    
    content = template.replace("{ICON}", cfg["icon"])\
                      .replace("{TITLE}", cfg["title"])\
                      .replace("{DESC}", cfg["desc"])\
                      .replace("{MODEL}", cfg["model"])\
                      .replace("{HEADERS}", headers)\
                      .replace("{CELLS}", cells)
                      
    if cfg["icon"] == "Building":
        content = content.replace("import { Building } from 'lucide-react';", "import { Building2 as Building } from 'lucide-react';")

    with open(os.path.join(dir_path, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(content)

print("All missing pages generated successfully!")
