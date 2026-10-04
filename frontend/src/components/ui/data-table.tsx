"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumns, setShowColumns] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        {/* Global Fuzzy Search */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-72">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
        </div>

        {/* Column Visibility Toggle */}
        <div className="relative">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => setShowColumns(!showColumns)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Columns
          </Button>
          
          {showColumns && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1625] border border-white/10 rounded-lg shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-semibold text-slate-400 mb-2 px-2 uppercase tracking-wider">Toggle Columns</div>
              {table.getAllColumns().filter(c => c.getCanHide()).map(column => (
                <label key={column.id} className="flex items-center px-2 py-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="mr-3 accent-indigo-500"
                  />
                  <span className="text-sm text-white capitalize">{column.id}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-black/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-400 font-semibold tracking-wider text-xs uppercase h-14">
                      {header.isPlaceholder ? null : (
                        <div 
                          className={header.column.getCanSort() ? "cursor-pointer hover:text-white transition-colors flex items-center select-none" : "flex items-center"}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="ml-2 text-indigo-400">
                            {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-b border-white/5 transition-all ${onRowClick ? 'cursor-pointer hover:bg-indigo-500/10' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-sm text-slate-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  No matching records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-white/5 text-white border-white/10 hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-white/5 text-white border-white/10 hover:bg-white/10"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
