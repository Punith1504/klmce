import os

components = {
    "button.tsx": """import * as React from "react"
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
Button.displayName = "Button"
""",
    "input.tsx": """import * as React from "react"
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={className} {...props} />
))
Input.displayName = "Input"
""",
    "label.tsx": """import * as React from "react"
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={className} {...props} />
))
Label.displayName = "Label"
""",
    "badge.tsx": """import * as React from "react"
export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props} />
)
""",
    "avatar.tsx": """import * as React from "react"
export const Avatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...props} />
export const AvatarImage = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img className={className} {...props} />
export const AvatarFallback = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...props} />
""",
    "input-otp.tsx": """import * as React from "react"
export const InputOTP = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const InputOTPGroup = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const InputOTPSlot = ({ className, ...props }: any) => <div className={className} {...props} />
export const InputOTPSeparator = ({ className, ...props }: any) => <div className={className} {...props}>-</div>
""",
    "dialog.tsx": """import * as React from "react"
export const Dialog = ({ children }: any) => <div>{children}</div>
export const DialogTrigger = ({ children }: any) => <div>{children}</div>
export const DialogContent = ({ children, className }: any) => <div className={className}>{children}</div>
export const DialogHeader = ({ children, className }: any) => <div className={className}>{children}</div>
export const DialogTitle = ({ children, className }: any) => <h2 className={className}>{children}</h2>
export const DialogDescription = ({ children, className }: any) => <p className={className}>{children}</p>
export const DialogFooter = ({ children, className }: any) => <div className={className}>{children}</div>
""",
    "table.tsx": """import * as React from "react"
export const Table = ({ className, ...props }: any) => <table className={className} {...props} />
export const TableHeader = ({ className, ...props }: any) => <thead className={className} {...props} />
export const TableBody = ({ className, ...props }: any) => <tbody className={className} {...props} />
export const TableRow = ({ className, ...props }: any) => <tr className={className} {...props} />
export const TableHead = ({ className, ...props }: any) => <th className={className} {...props} />
export const TableCell = ({ className, ...props }: any) => <td className={className} {...props} />
""",
    "tabs.tsx": """import * as React from "react"
export const Tabs = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const TabsList = ({ children, className }: any) => <div className={className}>{children}</div>
export const TabsTrigger = ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>
export const TabsContent = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
""",
    "sheet.tsx": """import * as React from "react"
export const Sheet = ({ children }: any) => <div>{children}</div>
export const SheetTrigger = ({ children }: any) => <div>{children}</div>
export const SheetContent = ({ children, className }: any) => <div className={className}>{children}</div>
export const SheetHeader = ({ children, className }: any) => <div className={className}>{children}</div>
export const SheetTitle = ({ children, className }: any) => <h2 className={className}>{children}</h2>
export const SheetDescription = ({ children, className }: any) => <p className={className}>{children}</p>
""",
    "toast.tsx": """import * as React from "react"
export const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const ToastProvider = ({ children }: any) => <div>{children}</div>
export const ToastViewport = () => <div />
export const ToastTitle = ({ children }: any) => <div>{children}</div>
export const ToastDescription = ({ children }: any) => <div>{children}</div>
export const ToastClose = () => <button>X</button>
export const ToastAction = ({ children, ...props }: any) => <button {...props}>{children}</button>
""",
    "toaster.tsx": """import * as React from "react"
export const Toaster = () => <div />
""",
    "use-toast.ts": """export const useToast = () => ({ toast: () => {} })
""",
    "select.tsx": """import * as React from "react"
export const Select = ({ children, ...props }: any) => <select {...props}>{children}</select>
export const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const SelectValue = ({ children, ...props }: any) => <span {...props}>{children}</span>
export const SelectContent = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const SelectItem = ({ children, ...props }: any) => <option {...props}>{children}</option>
""",
    "scroll-area.tsx": """import * as React from "react"
export const ScrollArea = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
"""
}

os.makedirs("src/components/ui", exist_ok=True)
for filename, content in components.items():
    with open(f"src/components/ui/{filename}", "w") as f:
        f.write(content)

admin_dashboard = """import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ADMINS, STUDENTS, FACULTY } from "@/lib/syntheticData";

export default function AdminDashboard() {
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014]">
            <h1 className="text-3xl font-bold tracking-tight">Admin Workspace</h1>
            <p className="text-violet-200">Welcome back, {ADMINS[0].name} - {ADMINS[0].role}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-violet-300">Total Students</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-white">{STUDENTS.length}</CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-fuchsia-300">Active Faculty</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-white">{FACULTY.length}</CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Recent Student Enrollments</h2>
                <div className="space-y-4">
                    {STUDENTS.slice(0, 5).map(s => (
                        <div key={s.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">{s.name}</p>
                                <p className="text-sm text-violet-300">{s.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 rounded-full text-xs font-semibold">{s.department}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
"""

student_dashboard = """import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { STUDENTS } from "@/lib/syntheticData";

export default function StudentDashboard() {
    const me = STUDENTS[0];
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
                <p className="text-violet-200">Welcome back, {me.name} ({me.id})</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-fuchsia-300">Current CGPA</CardTitle></CardHeader>
                        <CardContent className="text-5xl font-bold text-white">{me.cgpa}</CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-violet-300">Department</CardTitle></CardHeader>
                        <CardContent className="text-xl font-bold text-white">{me.department}</CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-blue-300">Attendance</CardTitle></CardHeader>
                        <CardContent className="text-5xl font-bold text-white">{me.attendance_pct}%</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
"""

os.makedirs("src/app/admin/dashboard", exist_ok=True)
os.makedirs("src/app/student/dashboard", exist_ok=True)
with open("src/app/admin/dashboard/page.tsx", "w") as f: f.write(admin_dashboard)
with open("src/app/student/dashboard/page.tsx", "w") as f: f.write(student_dashboard)

print("Generated all UI component stubs and dashboard routes!")
