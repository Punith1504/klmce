"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { STUDENTS } from '@/lib/syntheticData';

type StudentTask = {
  id: string;
  name: string;
  program: string;
};

type ColumnData = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: Record<string, StudentTask>;
  columns: Record<string, ColumnData>;
  columnOrder: string[];
};

export default function AdmissionsKanbanBoard() {
  const [data, setData] = useState<BoardData | null>(null);

  useEffect(() => {
    // Initialize mock data client-side to avoid hydration mismatches
    const initialTasks: Record<string, StudentTask> = {};
    const applicantTaskIds: string[] = [];

    // Take top 12 students from synthetic data
    STUDENTS.slice(0, 12).forEach((s, idx) => {
      const taskId = `task-${idx}`;
      initialTasks[taskId] = {
        id: taskId,
        name: s.name,
        program: s.department || "B.Tech",
      };
      applicantTaskIds.push(taskId);
    });

    setData({
      tasks: initialTasks,
      columns: {
        'col-1': { id: 'col-1', title: 'Applicant', taskIds: applicantTaskIds },
        'col-2': { id: 'col-2', title: 'Document Verification', taskIds: [] },
        'col-3': { id: 'col-3', title: 'Provisional', taskIds: [] },
        'col-4': { id: 'col-4', title: 'Confirmed', taskIds: [] },
      },
      columnOrder: ['col-1', 'col-2', 'col-3', 'col-4'],
    });
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable area
    if (!destination) return;

    // Dropped in the exact same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!data) return;

    const startCol = data.columns[source.droppableId];
    const finishCol = data.columns[destination.droppableId];

    // Moving within the same column
    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startCol, taskIds: newTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartCol = { ...startCol, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishCol = { ...finishCol, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStartCol.id]: newStartCol,
        [newFinishCol.id]: newFinishCol,
      },
    });
  };

  if (!data) return <div className="p-8 text-slate-400">Loading board...</div>;

  return (
    <div className="p-8 min-h-screen bg-background font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admissions Tracking</h1>
        <p className="text-muted-foreground mt-2">Manage the admission pipeline via drag-and-drop.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="flex flex-col w-80 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                  <h3 className="font-semibold tracking-wide text-sm">{column.title}</h3>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs font-medium">{tasks.length}</span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-4 space-y-4 overflow-y-auto transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800/80' : 'bg-transparent'
                      }`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 rounded-lg border shadow-sm flex items-start gap-4 transition-transform ${
                                snapshot.isDragging 
                                  ? 'bg-[#1a1625] border-indigo-500/50 scale-105 shadow-xl z-50' 
                                  : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                              }`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <Avatar className="h-10 w-10 shrink-0 bg-indigo-500/20 border border-indigo-500/30">
                                <AvatarFallback className="text-indigo-300 bg-transparent"><User className="w-5 h-5"/></AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate text-slate-200">{task.name}</h4>
                                <p className="text-xs text-slate-500 truncate mt-1">{task.program}</p>
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
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
