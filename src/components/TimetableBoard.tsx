"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Slot = {
  id: string;
  course: string;
  faculty_id: string;
};

type ColumnData = {
  id: string;
  title: string;
  items: Slot[];
};

export default function TimetableBoard() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>({
    'unassigned': { id: 'unassigned', title: 'Unassigned Load', items: [{ id: 's1', course: 'Machine Learning CS401', faculty_id: 'Prof. Davis' }, { id: 's2', course: 'Quantum Physics PH302', faculty_id: 'Dr. Evans' }] },
    'monday_9am': { id: 'monday_9am', title: 'Mon 09:00 AM', items: [] },
    'monday_10am': { id: 'monday_10am', title: 'Mon 10:00 AM', items: [] },
  });
  
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    setConflictWarning(null);

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    
    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];
    
    const [movedItem] = sourceItems.splice(source.index, 1);

    // Collision Detection Logic
    if (destination.droppableId !== 'unassigned') {
      const facultyConflict = destItems.find(item => item.faculty_id === movedItem.faculty_id);
      if (facultyConflict) {
         setConflictWarning(`Allocation Conflict! ${movedItem.faculty_id} is already allocated to teach ${facultyConflict.course} simultaneously in this exact slot.`);
      }
    }

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems }
      });
    } else {
      destItems.splice(destination.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Interactive Timetable Scheduler</h2>
      
      {conflictWarning && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg shadow-sm flex items-center">
          <svg className="w-6 h-6 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span className="font-semibold text-lg">{conflictWarning}</span>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {Object.values(columns).map(column => (
            <div key={column.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl w-[22rem] flex-shrink-0 flex flex-col max-h-[75vh]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl font-bold text-slate-700 flex justify-between items-center">
                {column.title}
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full shadow-sm">{column.items.length}</span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-5 overflow-y-auto transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-indigo-50/40' : 'bg-transparent'}`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 p-5 rounded-xl shadow-sm border ${snapshot.isDragging ? 'bg-white border-indigo-400 shadow-xl ring-4 ring-indigo-500/10 scale-105 z-50' : 'bg-white border-slate-200 hover:border-slate-300'} transition-all duration-200`}
                          >
                            <div className="font-extrabold text-slate-800 text-lg mb-1">{item.course}</div>
                            <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              {item.faculty_id}
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
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
