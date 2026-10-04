"use client";

import React from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const queryClient = new QueryClient();

// In a physical environment, this would call `fetchClient` from `@/lib/api-client`
// Mocking the async response payload to guarantee beautiful Next.js hydration
const fetchAnalytics = async (endpoint: string) => {
  if (endpoint === '/api/v1/analytics/kpis') {
    return { outstanding_dues: 125400.50, active_faculty: 84, todays_absentee_count: 12 };
  }
  if (endpoint === '/api/v1/analytics/attendance-trends') {
    return [
      { attendance_date: '2026-09-24', current_percentage: 95, historical_percentage: 92 },
      { attendance_date: '2026-09-25', current_percentage: 94, historical_percentage: 92.5 },
      { attendance_date: '2026-09-26', current_percentage: 88, historical_percentage: 92.2 },
      { attendance_date: '2026-09-27', current_percentage: 96, historical_percentage: 91.8 },
      { attendance_date: '2026-09-28', current_percentage: 97, historical_percentage: 92.0 },
      { attendance_date: '2026-09-29', current_percentage: 93, historical_percentage: 92.4 },
      { attendance_date: '2026-09-30', current_percentage: 95, historical_percentage: 92.6 },
    ];
  }
  if (endpoint === '/api/v1/analytics/revenue') {
    return [
      { month: '2026-06', collected_revenue: 45000 },
      { month: '2026-07', collected_revenue: 55000 },
      { month: '2026-08', collected_revenue: 120000 },
      { month: '2026-09', collected_revenue: 95000 },
    ];
  }
};

function AnalyticsDashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => fetchAnalytics('/api/v1/analytics/kpis')
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => fetchAnalytics('/api/v1/analytics/attendance-trends')
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue'],
    queryFn: () => fetchAnalytics('/api/v1/analytics/revenue')
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Institutional Analytics
          </h1>
          <p className="text-gray-400 text-lg">Real-time telemetry and financial aggregates powered by PostgreSQL.</p>
        </div>

        {/* Dynamic KPI Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl transition-all hover:border-gray-700 hover:-translate-y-1">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Outstanding Dues</h3>
            <div className="text-5xl font-black text-red-500 tracking-tighter">
              {kpisLoading ? '...' : `$${kpis?.outstanding_dues.toLocaleString()}`}
            </div>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl transition-all hover:border-gray-700 hover:-translate-y-1">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Active Faculty</h3>
            <div className="text-5xl font-black text-indigo-400 tracking-tighter">
              {kpisLoading ? '...' : kpis?.active_faculty}
            </div>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl transition-all hover:border-gray-700 hover:-translate-y-1">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Today's Absentees</h3>
            <div className="text-5xl font-black text-amber-400 tracking-tighter">
              {kpisLoading ? '...' : kpis?.todays_absentee_count}
            </div>
          </div>
        </div>

        {/* Massive Chart Dashboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Multi-Line Attendance Chart */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold mb-8 tracking-tight">Attendance Variance</h3>
            <div className="h-[350px] w-full">
              {attendanceLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                  Aggregating Data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="attendance_date" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#030712', borderColor: '#1F2937', borderRadius: '12px', padding: '12px' }}
                      itemStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>
                    <Line type="monotone" name="Current %" dataKey="current_percentage" stroke="#6366F1" strokeWidth={4} dot={{ r: 4, fill: '#6366F1', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" name="30-Day Moving Avg %" dataKey="historical_percentage" stroke="#10B981" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart Revenue Collection */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold mb-8 tracking-tight">Monthly Ledger Reconciliation</h3>
            <div className="h-[350px] w-full">
              {revenueLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                  Calculating Aggregates...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#030712', borderColor: '#1F2937', borderRadius: '12px', padding: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Collected Revenue']}
                      cursor={{ fill: '#1F2937', opacity: 0.4 }}
                    />
                    <Bar dataKey="collected_revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Wrap the highly dynamic dashboard inside the TanStack Query boundary
export default function SuperAdminAnalyticsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsDashboard />
    </QueryClientProvider>
  );
}
