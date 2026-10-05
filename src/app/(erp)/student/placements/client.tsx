"use client";

import React, { useState } from 'react';
import { UploadDropzone } from "@/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { saveDocumentRecord, processDocumentOCR } from './actions';
import { FileText, CheckCircle, Clock, Search, Briefcase } from 'lucide-react';

export default function StudentPlacementsClient({ documents }: { documents: any[] }) {
    const [isProcessing, setIsProcessing] = useState(false);
    
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <Briefcase className="w-8 h-8 text-violet-400"/> Placements & Resume Parser
                </h1>
                <p className="text-slate-400 text-sm">Upload your resume. Our AI will extract your skills and match you with corporate recruiters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Uploader Section */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <UploadDropzone
                            endpoint="pdfUploader"
                            onClientUploadComplete={async (res) => {
                                if (res && res.length > 0) {
                                    setIsProcessing(true);
                                    const file = res[0];
                                    
                                    // 1. Save record
                                    const dbRes = await saveDocumentRecord(file.name, file.url, file.size);
                                    
                                    // 2. Trigger OCR Parse
                                    if (dbRes.success && dbRes.docId) {
                                        await processDocumentOCR(dbRes.docId);
                                    }
                                    
                                    setIsProcessing(false);
                                    alert("Resume uploaded and parsed successfully!");
                                }
                            }}
                            onUploadError={(error: Error) => {
                                alert(`ERROR! ${error.message}`);
                            }}
                            appearance={{
                                container: "border-2 border-dashed border-violet-500/50 bg-black/20 rounded-2xl p-8 hover:border-violet-400 transition-colors cursor-pointer w-full flex items-center justify-center min-h-[250px]",
                                label: "text-violet-300 font-semibold mb-2",
                                allowedContent: "text-slate-400 text-xs",
                                button: "bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-6 rounded-xl mt-4 w-auto h-auto transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)]",
                                uploadIcon: "text-violet-400 w-12 h-12 mb-4 mx-auto"
                            }}
                        />
                        {isProcessing && (
                            <div className="mt-4 flex items-center gap-2 text-violet-300 text-sm font-semibold animate-pulse">
                                <Search className="w-4 h-4" /> AI is extracting data from your resume...
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents List */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" /> My Documents
                    </h2>
                    
                    <div className="space-y-4">
                        {documents.length > 0 ? documents.map(doc => (
                            <div key={doc.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-[300px]" title={doc.fileName}>{doc.fileName}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {doc.status === 'PARSED' ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                                                <CheckCircle className="w-3.5 h-3.5" /> PARSED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                                                <Clock className="w-3.5 h-3.5" /> PENDING
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {doc.status === 'PARSED' && doc.parsedData && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Extracted Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(doc.parsedData).skills.map((skill: string, idx: number) => (
                                                <span key={idx} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500">
                                No documents uploaded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
