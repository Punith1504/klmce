import os
import re

# 1. Update layout.tsx
layout_path = "src/app/admin/layout.tsx"
with open(layout_path, "r") as f:
    content = f.read()

nav_items = [
    ('Admissions', '/admin/admissions'),
    ('Academics & LMS', '/admin/academics'),
    ('Student Finance', '/admin/finance'),
    ('HR & Members', '/admin/hr'),
    ('Examinations', '/admin/examinations'),
    ('Placements', '/admin/placements'),
    ('Hostel & Facilities', '/admin/hostels'),
    ('Canteen', '/admin/canteen'),
    ('Transport', '/admin/transport'),
    ('Settings', '/admin/settings'),
]

for name, url in nav_items:
    # replace { name: "Admissions", href: "#", icon: GraduationCap }
    # with { name: "Admissions", href: "/admin/admissions", icon: GraduationCap }
    pattern = r'\{ name: "' + re.escape(name) + r'", href: "[^"]+", icon: ([^ ]+) \}'
    replacement = f'{{ name: "{name}", href: "{url}", icon: \\1 }}'
    content = re.sub(pattern, replacement, content)

with open(layout_path, "w") as f:
    f.write(content)

# 2. Create the pages
pages = {
    "admissions": ("Admissions Pipeline", "Manage new student applications and onboarding.", "STUDENTS"),
    "academics": ("Academics & LMS", "Course management and learning metrics.", "FACULTY"),
    "finance": ("Student Finance", "Fee collection and scholarship management.", "STUDENTS"),
    "hr": ("HR & Members", "Faculty and staff directory.", "FACULTY"),
    "examinations": ("Examinations", "Scheduling and grading.", "STUDENTS"),
    "placements": ("Placements CRM", "Corporate recruiter tracking and student matching.", "STUDENTS"),
    "hostels": ("Hostel Allocation", "Room and boarding management.", "STUDENTS"),
    "canteen": ("Canteen POS", "Cafeteria sales and inventory.", "FACULTY"),
    "transport": ("Transport Logistics", "Bus routing and student pass management.", "STUDENTS"),
    "settings": ("System Settings", "ERP configurations and role management.", "ADMINS"),
}

template = """import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { {DATA_IMPORT} } from "@/lib/syntheticData";

export default function Page() {
    const data = {DATA_IMPORT};
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{TITLE}</h1>
                    <p className="text-violet-200/60 mt-2">{DESC}</p>
                </div>
                
                <div className="mt-8">
                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                            <CardTitle className="text-violet-300 font-medium tracking-wide text-sm uppercase">Active Directory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-xs uppercase text-white/40 tracking-wider bg-black/20">
                                            <th className="px-6 py-4 font-semibold">ID</th>
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Classification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.slice(0, 15).map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 text-white/50 font-mono text-sm group-hover:text-white transition-colors">{row.id}</td>
                                                <td className="px-6 py-4 text-white font-medium">{row.name}</td>
                                                <td className="px-6 py-4 text-violet-300/70 text-sm group-hover:text-violet-300 transition-colors">{row.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-white/5 text-fuchsia-300/80 rounded-full border border-white/5 text-xs font-medium tracking-wide">
                                                        {row.department || row.role || row.designation}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
"""

for route, (title, desc, data_import) in pages.items():
    os.makedirs(f"src/app/admin/{route}", exist_ok=True)
    page_content = template.replace("{TITLE}", title).replace("{DESC}", desc).replace("{DATA_IMPORT}", data_import)
    with open(f"src/app/admin/{route}/page.tsx", "w") as f:
        f.write(page_content)

print("Modules built and linked successfully.")
