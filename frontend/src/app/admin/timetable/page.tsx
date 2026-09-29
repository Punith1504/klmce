"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

// ==========================================
// Query Client Setup
// ==========================================
const queryClient = new QueryClient();

// ==========================================
// TypeScript Interfaces
// ==========================================
interface Course {
  course_id: string;
  code: string;
  name: string;
}

interface Faculty {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface TimetableSlotCreate {
  course_id: string;
  section_id: string; // Hardcoded or selected in UI
  faculty_id: string;
  room_number: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface DraggableBlock {
  id: string; // unique drag ID
  course_id: string;
  course_code: string;
  faculty_id: string;
  faculty_name: string;
}

// Matrix Constants
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  { label: "09:00 - 10:00", start: "09:00:00", end: "10:00:00" },
  { label: "10:00 - 11:00", start: "10:00:00", end: "11:00:00" },
  { label: "11:00 - 12:00", start: "11:00:00", end: "12:00:00" },
  { label: "13:00 - 14:00", start: "13:00:00", end: "14:00:00" },
  { label: "14:00 - 15:00", start: "14:00:00", end: "15:00:00" }
];

function TimetableMatrix() {
  const [mounted, setMounted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("Room 101");
  const [activeToast, setActiveToast] = useState<{ title: string, detail: string, type: 'error' | 'success' } | null>(null);

  // State representing what's placed in the matrix cells vs sidebar
  // Key: droppableId -> Array of blocks
  const [columns, setColumns] = useState<Record<string, DraggableBlock[]>>({
    sidebar: []
  });

  // ==========================================
  // Data Fetching (Palette Loading)
  // ==========================================
  // In a real scenario, these endpoints provide lists. We'll simulate fetching them.
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => Promise.resolve([
      { course_id: "c1", code: "CS101", name: "Intro to Computer Science" },
      { course_id: "c2", code: "MTH202", name: "Linear Algebra" },
      { course_id: "c3", code: "PHY301", name: "Quantum Mechanics" }
    ])
  });

  const { data: faculties } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => Promise.resolve([
      { user_id: "f1", first_name: "Alan", last_name: "Turing" },
      { user_id: "f2", first_name: "Ada", last_name: "Lovelace" }
    ])
  });

  // Hydrate the sidebar palette when data loads
  useEffect(() => {
    if (courses && faculties && columns.sidebar.length === 0) {
      // Mock generating valid pairs for the palette
      const palette: DraggableBlock[] = [
        { id: "drag-1", course_id: "c1", course_code: "CS101", faculty_id: "f1", faculty_name: "Alan Turing" },
        { id: "drag-2", course_id: "c2", course_code: "MTH202", faculty_id: "f2", faculty_name: "Ada Lovelace" },
        { id: "drag-3", course_id: "c3", course_code: "PHY301", faculty_id: "f1", faculty_name: "Alan Turing" },
      ];
      setColumns(prev => ({ ...prev, sidebar: palette }));
    }
  }, [courses, faculties]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================
  // Mutations & Collision Handling
  // ==========================================
  const scheduleMutation = useMutation({
    mutationFn: (payload: TimetableSlotCreate) => fetchClient("/timetable/slots", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      showToast("Success", "Schedule block permanently locked into database.", "success");
    }
  });

  const showToast = (title: string, detail: string, type: 'error' | 'success') => {
    setActiveToast({ title, detail, type });
    setTimeout(() => setActiveToast(null), 5000);
  };

  // ==========================================
  // Drag and Drop Logic
  // ==========================================
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Moving within the same column (or sidebar)
    if (source.droppableId === destination.droppableId) {
      const col = [...(columns[source.droppableId] || [])];
      const [removed] = col.splice(source.index, 1);
      col.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: col });
      return;
    }

    // Moving between columns (e.g. from Sidebar to Matrix Cell)
    const sourceCol = [...(columns[source.droppableId] || [])];
    const destCol = [...(columns[destination.droppableId] || [])];
    
    // Check if destination cell already has a block (max 1 per cell for UI simplicity)
    if (destination.droppableId !== "sidebar" && destCol.length >= 1) {
      showToast("UI Constraint", "This physical UI cell already contains a block.", "error");
      return;
    }

    const [draggedBlock] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, draggedBlock);

    // Optimistic UI Update
    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    // If dropped into the matrix (not returning to sidebar), trigger Backend DB constraint
    if (destination.droppableId !== "sidebar") {
      const [day, startTime, endTime] = destination.droppableId.split("|");
      
      try {
        await scheduleMutation.mutateAsync({
          course_id: draggedBlock.course_id,
          section_id: "00000000-0000-0000-0000-000000000001", // Mock generic section for demo
          faculty_id: draggedBlock.faculty_id,
          room_number: selectedRoom,
          day_of_week: day,
          start_time: startTime,
          end_time: endTime
        });
      } catch (error: any) {
        // Backend PostgreSQL GiST Constraint Caught a Collision!
        // Revert Optimistic UI Update
        const revertSourceCol = [...(columns[source.droppableId] || [])];
        const revertDestCol = [...(columns[destination.droppableId] || [])];
        
        // Remove from destination where it was optimistically placed
        const [revertBlock] = revertDestCol.splice(destination.index, 1);
        // Put back in source
        revertSourceCol.splice(source.index, 0, revertBlock);
        
        setColumns(prev => ({
          ...prev,
          [source.droppableId]: revertSourceCol,
          [destination.droppableId]: revertDestCol
        }));

        // Render standard RFC 7807 error directly from GiST exception layer
        showToast(
          error.title || "Scheduling Conflict", 
          error.detail || "Database physical constraint violated.", 
          "error"
        );
      }
    }
  };

  if (!mounted) return null; // Prevent hydration mismatch on dnd context

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${activeToast.type === 'error' ? 'bg-red-950/90 border-red-900/50 text-red-300' : 'bg-emerald-950/90 border-emerald-900/50 text-emerald-300'} backdrop-blur-md`}>
            {activeToast.type === 'error' ? (
              <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <h4 className={`font-bold text-sm ${activeToast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{activeToast.title}</h4>
              <p className="text-sm mt-0.5">{activeToast.detail}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Timetable Matrix
            </h1>
            <p className="text-gray-400 mt-1">Drag and drop blocks to assign scheduling. Protected by backend collision checks.</p>
          </div>
          <div>
            <select 
              className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="Room 101">Room 101</option>
              <option value="Room 205">Room 205</option>
              <option value="Lab A">Lab A</option>
            </select>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8">
            
            {/* LEFT: Master Grid Matrix */}
            <div className="flex-1 overflow-x-auto bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-950/50 border-b border-gray-800 text-gray-400 uppercase font-bold text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-32 border-r border-gray-800">Time</th>
                    {DAYS.map(day => (
                      <th key={day} className="px-6 py-4 min-w-[200px] border-r border-gray-800 last:border-0">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot.label}>
                      <td className="px-6 py-4 font-mono text-gray-400 border-r border-gray-800 bg-gray-950/20">{slot.label}</td>
                      
                      {DAYS.map((day) => {
                        const cellId = `${day}|${slot.start}|${slot.end}`;
                        const cellBlocks = columns[cellId] || [];

                        return (
                          <Droppable key={cellId} droppableId={cellId}>
                            {(provided, snapshot) => (
                              <td 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-2 border-r border-gray-800 last:border-0 relative min-h-[100px] align-top transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-950/20' : 'hover:bg-gray-800/10'}`}
                              >
                                {cellBlocks.map((block, index) => (
                                  <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`bg-indigo-600 border border-indigo-500 text-white p-3 rounded-xl shadow-lg mb-2 select-none ${snapshot.isDragging ? 'opacity-90 scale-105 shadow-indigo-500/50 ring-2 ring-white' : ''}`}
                                      >
                                        <div className="font-bold text-sm tracking-tight">{block.course_code}</div>
                                        <div className="text-xs text-indigo-200 mt-1 flex items-center gap-1.5">
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          {block.faculty_name}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {cellBlocks.length === 0 && !snapshot.isDraggingOver && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                     <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">+ Assign</span>
                                  </div>
                                )}
                              </td>
                            )}
                          </Droppable>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT: Draggable Palette */}
            <div className="w-[350px] shrink-0 flex flex-col">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">Unassigned Blocks</h3>
                <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">Drag blocks into the matrix to provision.</p>
                
                <Droppable droppableId="sidebar">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[300px] rounded-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800/30 ring-1 ring-gray-700' : ''}`}
                    >
                      {(columns.sidebar || []).map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-200 p-4 rounded-xl shadow-md mb-3 select-none transition-all ${snapshot.isDragging ? 'shadow-xl shadow-gray-900 scale-105 z-50 ring-2 ring-indigo-500' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-sm">{block.course_code}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-950 px-2 py-0.5 rounded-full">Lecture</div>
                              </div>
                              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {block.faculty_name}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

// ==========================================
// Expose Component wrapped with QueryClient
// ==========================================
export default function TimetableSchedulingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimetableMatrix />
    </QueryClientProvider>
  );
}
