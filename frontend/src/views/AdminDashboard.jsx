import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ShieldAlert, BarChart3, ListFilter, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, showNotification, darkMode } = useAuth();
  
  const [subTab, setSubTab] = useState('analytics');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [subTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const all = await api.issues.getAll();
      setIssues(all);

      const data = await api.analytics.getSummary();
      setAnalyticsData(data);
    } catch (err) {
      showNotification("Failed to load admin metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryChartData = () => {
    if (!analyticsData || !analyticsData.categoryCounts) return [];
    return Object.keys(analyticsData.categoryCounts).map(cat => ({
      name: cat,
      count: analyticsData.categoryCounts[cat]
    }));
  };

  if (user.role !== 'Government/Admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-left">
        <AlertTriangle className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Restrained</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Only registered Government Administrators and city supervisors can access the Admin Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Monitor city telemetry, audit reports anomalies, and dispatch departments.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 space-x-4">
        <button
          onClick={() => setSubTab('analytics')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'analytics' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>City Analytics</span>
        </button>
        <button
          onClick={() => setSubTab('moderation')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'moderation' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ListFilter className="w-4.5 h-4.5" />
          <span>Dispatch Management</span>
        </button>
        <button
          onClick={() => setSubTab('logs')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'logs' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>AI Audit Logs</span>
        </button>
      </div>

      {loading || !analyticsData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white mb-2" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading audit records...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {subTab === 'analytics' && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Reports</span>
                  <span className="block text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{analyticsData.summary.totalReports}</span>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Concerns</span>
                  <span className="block text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{analyticsData.summary.activeReports}</span>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Resolved Concerns</span>
                  <span className="block text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{analyticsData.summary.resolvedReports}</span>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Accounts</span>
                  <span className="block text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{analyticsData.summary.usersCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-xs mb-6 uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Category breakdown</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCategoryChartData()}>
                        <XAxis dataKey="name" stroke={darkMode ? "#a1a1aa" : "#71717a"} fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke={darkMode ? "#a1a1aa" : "#71717a"} fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: darkMode ? '#000000' : '#ffffff', border: darkMode ? '1px solid #27272a' : '1px solid #e4e4e7', borderRadius: '8px', color: darkMode ? '#ffffff' : '#09090b', fontSize: '11px' }} />
                        <Bar dataKey="count" fill={darkMode ? "#ffffff" : "#000000"} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-xs mb-6 uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tickets trend</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#27272a" : "#e4e4e7"} />
                        <XAxis dataKey="name" stroke={darkMode ? "#a1a1aa" : "#71717a"} fontSize={9} tickLine={false} />
                        <YAxis stroke={darkMode ? "#a1a1aa" : "#71717a"} fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ background: darkMode ? '#000000' : '#ffffff', border: darkMode ? '1px solid #27272a' : '1px solid #e4e4e7', borderRadius: '8px', color: darkMode ? '#ffffff' : '#09090b', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="reported" stroke={darkMode ? "#ffffff" : "#000000"} strokeWidth={2.5} activeDot={{ r: 5, stroke: darkMode ? "#000000" : "#ffffff", strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="resolved" stroke={darkMode ? "#71717a" : "#a1a1aa"} strokeDasharray="5 5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === 'moderation' && (
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-bold text-sm mb-6">Dispatch Router Control</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                      <th className="pb-3 pr-4">Ticket details</th>
                      <th className="pb-3 px-4">Address</th>
                      <th className="pb-3 px-4">Responsible Department</th>
                      <th className="pb-3 px-4">AI Score</th>
                      <th className="pb-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {issues.map(issue => (
                      <tr key={issue.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <td className="py-4 pr-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-10 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden shrink-0">
                              <img src={issue.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold block">{issue.title}</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase">{issue.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">{issue.address}</td>
                        <td className="py-4 px-4 font-semibold text-zinc-750 dark:text-zinc-300">{issue.department}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-250 dark:border-zinc-800 font-bold">
                            {issue.priorityScore}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            issue.status === 'resolved' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800' :
                            issue.status === 'claimed' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800' :
                            'bg-black text-white dark:bg-white dark:text-black border-zinc-800 dark:border-zinc-250'
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subTab === 'logs' && (
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-bold text-sm mb-6">AI Moderation Records</h3>

              <div className="space-y-4">
                {analyticsData.logs.map(log => (
                  <div key={log.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/40 text-xs flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-150 border border-zinc-250 dark:border-zinc-800 font-bold uppercase text-[9px]">
                          {log.action}
                        </span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">by {log.user}</span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400">{log.details}</p>
                    </div>
                    
                    <span className="text-[9px] text-zinc-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
