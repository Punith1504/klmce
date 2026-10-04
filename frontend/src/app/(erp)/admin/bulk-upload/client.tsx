"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import { processBulkStudents } from './actions';
import * as XLSX from 'xlsx';

export default function AdminBulkUploadClient({ batches, sections }: { batches: any[], sections: any[] }) {
    const [file, setFile] = useState<File | null>(null);
    const [batchId, setBatchId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    
    const [results, setResults] = useState<{success?: string, errors?: string[]} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !batchId || !sectionId) {
            alert("Please select a file, batch, and section.");
            return;
        }

        setIsUploading(true);
        setResults(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                // Parse Excel or CSV
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON array
                const jsonRecords = XLSX.utils.sheet_to_json(worksheet);
                
                if (jsonRecords.length === 0) {
                    setResults({ errors: ["File is empty or invalid format."] });
                    setIsUploading(false);
                    return;
                }

                // Send to server action
                const response = await processBulkStudents(jsonRecords, batchId, sectionId);
                
                if (response.success) {
                    setResults({ success: response.message, errors: response.errors });
                    setFile(null); // Reset file after success
                    if (fileInputRef.current) fileInputRef.current.value = '';
                } else {
                    setResults({ errors: [response.error || "Unknown server error"] });
                }
            } catch (error: any) {
                setResults({ errors: ["Failed to parse file: " + error.message] });
            } finally {
                setIsUploading(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <FileSpreadsheet className="w-8 h-8 text-sky-400"/> Bulk Data Imports
                </h1>
                <p className="text-slate-400 text-sm">Drag and drop Excel (.xlsx) or CSV files to batch update the database.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-50 mb-6">Target Configuration</h2>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign to Batch</label>
                            <select 
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500 transition">
                                <option value="">Select Batch...</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.branch.name})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign to Section</label>
                            <select 
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500 transition">
                                <option value="">Select Section...</option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Batch: {s.batch.name})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div 
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                            file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-sky-500/50 bg-black/20 hover:border-sky-400'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-emerald-400' : 'text-sky-400'}`} />
                        <h3 className="font-semibold text-slate-200 mb-1">
                            {file ? file.name : "Click to select or drag & drop"}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "Excel or CSV (max 10MB)"}
                        </p>
                    </div>

                    <button 
                        onClick={handleUpload}
                        disabled={isUploading || !file || !batchId || !sectionId}
                        className="w-full mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(2,132,199,0.4)] disabled:opacity-50 flex items-center justify-center gap-2">
                        {isUploading ? 'Parsing & Uploading...' : 'Start Bulk Import'}
                    </button>
                </div>

                {/* Results Section */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-50 mb-6">Import Guidelines & Results</h2>
                    
                    {!results ? (
                        <div className="bg-black/30 rounded-xl p-5 border border-white/5 text-sm text-slate-300 space-y-3">
                            <p>To successfully upload students, your Excel/CSV must contain the following headers:</p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-xs">
                                <li>Roll No (Required)</li>
                                <li>Name (Required)</li>
                                <li>Email (Optional)</li>
                            </ul>
                            <p className="text-xs text-sky-400 mt-4 font-semibold">Note: If a student with the same Roll No exists, their record will be updated (Upsert operation).</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.success && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-emerald-400">Import Successful</h3>
                                        <p className="text-sm text-emerald-300/80">{results.success}</p>
                                    </div>
                                </div>
                            )}

                            {results.errors && results.errors.length > 0 && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                                        <h3 className="font-semibold text-rose-400">Errors encountered ({results.errors.length})</h3>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                        {results.errors.map((err, idx) => (
                                            <div key={idx} className="text-xs font-mono text-rose-300 bg-black/40 p-2 rounded">
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
