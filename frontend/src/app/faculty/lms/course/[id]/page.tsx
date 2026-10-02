"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Save, GripVertical, Code2, Sigma } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FacultyLMSDashboard() {
    const [questions, setQuestions] = useState([
        { id: 'q1', type: 'mcq', text: 'Calculate the asymptotic time complexity of Merge Sort.', co: 'CO2', bt: 'L3_APPLY' }
    ]);

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">CS401: Advanced Data Structures</h1>
                        <p className="text-slate-400 mt-2">Outcome-Based Education (OBE) & Assessment Architect</p>
                    </div>
                    <Button className="bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/25 border-0">
                        <Save className="w-4 h-4 mr-2" /> Save Syllabus Mapping
                    </Button>
                </div>

                <Tabs defaultValue="assessments" className="w-full">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="obe_mapping" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">OBE Mapping Matrix</TabsTrigger>
                        <TabsTrigger value="assessments" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">e-Assessment Builder</TabsTrigger>
                    </TabsList>

                    {/* OBE Mapping Matrix Tab */}
                    <TabsContent value="obe_mapping" className="mt-6">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-purple-300">Course Outcome (CO) to Program Outcome (PO) Matrix</CardTitle>
                                <CardDescription className="text-slate-400">Map the intensity (1=Low, 2=Medium, 3=High) of how COs fulfill departmental POs.</CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs text-slate-400 uppercase bg-black/40">
                                        <tr>
                                            <th className="px-6 py-3 border-b border-white/10">Course Outcome</th>
                                            {Array.from({length: 12}).map((_, i) => (
                                                <th key={i} className="px-4 py-3 border-b border-white/10 text-center">PO{i+1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['CO1: Analyze Algorithms', 'CO2: Implement Trees', 'CO3: Dynamic Programming'].map((co, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{co}</td>
                                                {Array.from({length: 12}).map((_, j) => (
                                                    <td key={j} className="px-4 py-2">
                                                        <Input type="number" min="0" max="3" defaultValue={Math.floor(Math.random() * 4)} className="w-16 h-8 bg-black/20 border-white/10 text-center focus:ring-purple-500" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Assessment Builder Tab */}
                    <TabsContent value="assessments" className="mt-6 space-y-6">
                        {questions.map((q, i) => (
                            <Card key={q.id} className="bg-[#1a1f2e] border-white/10 hover:border-purple-500/30 transition-all group">
                                <div className="flex">
                                    <div className="w-8 flex flex-col items-center justify-center bg-black/20 border-r border-white/10 cursor-grab text-slate-500 group-hover:text-purple-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <CardContent className="p-6 flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-3">
                                                <Badge className="bg-purple-500/20 text-purple-300 border-0">Q{i+1}</Badge>
                                                <Badge variant="outline" className="border-white/20">{q.type.toUpperCase()}</Badge>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Select defaultValue={q.co}>
                                                    <SelectTrigger className="w-24 h-8 bg-black/40 border-white/10"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="CO1">CO1</SelectItem><SelectItem value="CO2">CO2</SelectItem></SelectContent>
                                                </Select>
                                                <Select defaultValue={q.bt}>
                                                    <SelectTrigger className="w-32 h-8 bg-black/40 border-white/10"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="L1_REMEMBER">L1 Remember</SelectItem><SelectItem value="L3_APPLY">L3 Apply</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        {/* Rich Text Editor Simulation (MathJax/LaTeX support) */}
                                        <div className="rounded-md border border-white/10 overflow-hidden focus-within:ring-1 focus-within:ring-purple-500">
                                            <div className="bg-black/40 p-2 flex space-x-2 border-b border-white/10">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-white"><Code2 className="w-4 h-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-white"><Sigma className="w-4 h-4" /></Button>
                                            </div>
                                            <Textarea 
                                                defaultValue={q.text} 
                                                className="bg-transparent border-0 focus-visible:ring-0 resize-none rounded-none font-mono text-sm"
                                            />
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}

                        <Button variant="outline" className="w-full border-dashed border-white/20 text-slate-300 hover:bg-white/5 hover:text-white h-14">
                            <PlusCircle className="w-5 h-5 mr-2 text-purple-400" /> Add Question Block (MCQ, LaTeX, Code)
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
