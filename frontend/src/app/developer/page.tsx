"use client";

import { useState } from "react";
import { Copy, Plus, Activity, Zap, CheckCircle2 } from "lucide-react";

export default function DeveloperPortal() {
  const [showNewApp, setShowNewApp] = useState(false);
  const [credentials, setCredentials] = useState<{client_id: string, client_secret: string} | null>(null);

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to backend/oauth/server.py
    setCredentials({
      client_id: "klmce_a94fB2kLxP9qRm2T",
      client_secret: "sec_920fNlKqwPzxCv190mN4xQ9lB2pL6rYt"
    });
    setShowNewApp(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-gray-400">Manage your OAuth2 applications and monitor API rate limits.</p>
        </div>
        <button 
          onClick={() => setShowNewApp(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Create New App
        </button>
      </div>

      {/* New App Credentials Modal */}
      {credentials && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center text-emerald-400 font-bold mb-4">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Application Registered Successfully!
          </div>
          <p className="text-sm text-gray-300 mb-6">
            Please copy your Client Secret now. For security reasons, it will never be shown again.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Client ID</label>
              <div className="mt-1 flex items-center bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
                <code className="text-blue-300 font-mono text-sm flex-1">{credentials.client_id}</code>
                <button className="text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Client Secret</label>
              <div className="mt-1 flex items-center bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
                <code className="text-pink-400 font-mono text-sm flex-1">{credentials.client_secret}</code>
                <button className="text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <button onClick={() => setCredentials(null)} className="mt-6 bg-[#1f2937] hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            I have saved my secret securely
          </button>
        </div>
      )}

      {/* Create App Form inline */}
      {showNewApp && !credentials && (
        <form onSubmit={handleCreateApp} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-xl animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Register OAuth Application</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Application Name</label>
              <input type="text" required placeholder="e.g., Quizlet Sync" className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Authorized Redirect URIs</label>
              <input type="text" required placeholder="https://yourapp.com/oauth/callback" className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="pt-2 flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Generate Keys</button>
              <button type="button" onClick={() => setShowNewApp(false)} className="bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Apps List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* App Card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-3xl p-6 shadow-xl hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">Flashcard Sync Pro</h3>
                <p className="text-xs text-gray-400 mt-0.5">client_id: klmce_8xH2...kP1</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
              FREE TIER
            </span>
          </div>

          <div className="bg-[#0b0f19] rounded-xl p-4 border border-[#1f2937] mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">API Gateway Usage (Today)</span>
              <span className="text-white font-medium">842 / 1,000</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-yellow-400 h-1.5 w-[84%]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Requests will hit HTTP 429 once limit is reached.</p>
          </div>

          <button className="w-full bg-gradient-to-r from-[#1f2937] to-[#111827] border border-gray-700 hover:border-gray-500 text-gray-300 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Upgrade to Stripe Metered Billing
          </button>
        </div>

      </div>
    </div>
  );
}
