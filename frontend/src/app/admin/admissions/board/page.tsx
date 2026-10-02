"use client";
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, Unlock, CheckCircle2 } from "lucide-react";

// Initial state representing the strict Backend Finite State Machine
const INITIAL_DATA = {
    columns: {
        'APPLICANT': { id: 'APPLICANT', title: 'New Applicants', taskIds: ['app-1', 'app-2'] },
        'REGISTERED': { id: 'REGISTERED', title: 'Document Verified', taskIds: ['app-3'] },
        'PROVISIONAL': { id: 'PROVISIONAL', title: 'Fee Pending', taskIds: [] },
        'CONFIRMED': { id: 'CONFIRMED', title: 'Provisioned', taskIds: [] },
    },
    tasks: {
        'app-1': { id: 'app-1', name: 'Arjun Sharma', quota: 'MERIT', score: 94.2 },
        'app-2': { id: 'app-2', name: 'Priya Patel', quota: 'MANAGEMENT', score: 82.5 },
        'app-3': { id: 'app-3', name: 'Rahul Gupta', quota: 'SPORTS', score: 71.0 },
    },
    columnOrder: ['APPLICANT', 'REGISTERED', 'PROVISIONAL', 'CONFIRMED']
};

export default function AdmissionsKanbanBoard() {
    const [data, setData] = useState(INITIAL_DATA);
    const [selectedApp, setSelectedApp] = useState<any>(null);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic UI Update (In production, this triggers TanStack Query to hit FastAPI /transition endpoint)
        const startColumn = data.columns[source.droppableId as keyof typeof data.columns];
        const finishColumn = data.columns[destination.droppableId as keyof typeof data.columns];

        if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);
            setData({ ...data, columns: { ...data.columns, [startColumn.id]: { ...startColumn, taskIds: newTaskIds } } });
            return;
        }

        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);

        setData({
            ...data,
            columns: {
                ...data.columns,
                [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
                [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds }
            }
        });
        
        console.log(`Optimistic UI: Transitioned ${draggableId} to ${destination.droppableId}. Firing background POST /api/v1/admissions/transition...`);
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 overflow-x-hidden">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Admissions Pipeline</h1>
                    <p className="text-slate-400 mt-1">Drag and drop to automatically trigger lifecycle webhooks and provisioning engines.</p>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-6 overflow-x-auto pb-8">
                    {data.columnOrder.map(columnId => {
                        const column = data.columns[columnId as keyof typeof data.columns];
                        const tasks = column.taskIds.map(taskId => data.tasks[taskId as keyof typeof data.tasks]);

                        return (
                            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col bg-white/5 rounded-xl border border-white/10 backdrop-blur-md h-[75vh]">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="font-semibold text-slate-200">{column.title}</h2>
                                    <Badge variant="secondary" className="bg-white/10 text-slate-300">{tasks.length}</Badge>
                                </div>
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className={`flex-1 p-4 overflow-y-auto space-y-4 transition-colors ${snapshot.isDraggingOver ? 'bg-teal-900/20' : ''}`}
                                        >
                                            {tasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <Card 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedApp(task)}
                                                            className={`bg-[#1a1f2e] border-white/10 cursor-pointer hover:border-teal-500/50 transition-all ${snapshot.isDragging ? 'shadow-2xl shadow-teal-500/20 scale-105' : ''}`}
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-medium text-white">{task.name}</span>
                                                                    <Badge className="bg-teal-500/20 text-teal-300 border-0">{task.quota}</Badge>
                                                                </div>
                                                                <div className="flex items-center text-sm text-slate-400">
                                                                    <FileText className="w-4 h-4 mr-2" />
                                                                    Score: {task.score}%
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Slide-out Administrative Drawer (Shadcn Sheet) */}
            <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
                <SheetContent className="bg-[#0a0f1c] border-l-white/10 text-white sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-white">{selectedApp?.name}</SheetTitle>
                        <SheetDescription className="text-slate-400">Application ID: {selectedApp?.id.toUpperCase()}</SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-teal-400 mb-2">Document Verification</h3>
                            <div className="flex items-center justify-between text-sm">
                                <span>12th Grade Marksheet.pdf</span>
                                <Button size="sm" variant="outline" className="h-8 border-white/20 hover:bg-white/10 text-white">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Verify
                                </Button>
                            </div>
                        </div>

                        {/* Integrating the Surgical JSON Unlock functionality from the Backend */}
                        <div className="p-4 bg-rose-900/10 rounded-lg border border-rose-500/20">
                            <h3 className="font-semibold text-rose-400 mb-2">Correction Workflow</h3>
                            <p className="text-sm text-slate-400 mb-4">Surgically unlock specific form fields for the applicant to correct without rejecting the entire application.</p>
                            <Button className="w-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border-0">
                                <Unlock className="w-4 h-4 mr-2" /> Unlock Fields (Dob, Phone)
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
