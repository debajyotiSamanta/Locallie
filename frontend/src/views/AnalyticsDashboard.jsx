import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Compass, Award, Shield, Loader2, RefreshCw } from 'lucide-react';
import L from 'leaflet';

export default function AnalyticsDashboard() {
  const { darkMode, showNotification } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await api.analytics.getSummary();
      setData(stats);
    } catch (err) {
      showNotification('Failed to fetch analytics statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white mb-2" />
        <span className="text-xs text-zinc-500">Loading civic telemetry...</span>
      </div>
    );
  }

  // Format reports by category
  const categoryData = Object.keys(data.categoryCounts).map(cat => ({
    name: cat,
    value: data.categoryCounts[cat]
  }));

  // Format reports by area
  const areaData = Object.keys(data.areaCounts).map(area => ({
    name: area,
    count: data.areaCounts[area]
  })).sort((a, b) => b.count - a.count);

  // Dynamic theme colors for rich analytics aesthetics (vibrant light colors adapted to theme)
  const colors = {
    primary: darkMode ? '#60a5fa' : '#3b82f6',     // Sky Blue vs Royal Blue
    secondary: darkMode ? '#c084fc' : '#8b5cf6',   // Soft Purple vs Deep Purple
    tertiary: darkMode ? '#34d399' : '#10b981',    // Emerald vs Mint
    warning: darkMode ? '#fbbf24' : '#f59e0b',     // Amber vs Orange
    info: darkMode ? '#22d3ee' : '#06b6d4',        // Cyan vs Teal
    danger: darkMode ? '#f87171' : '#ef4444',      // Light Red vs Red
    
    // UI layout classes
    cardBg: darkMode ? 'bg-zinc-900/40 backdrop-blur-sm' : 'bg-slate-50/70 backdrop-blur-sm',
    cardBorder: darkMode ? 'border-zinc-800/85' : 'border-slate-200/80',
    grid: darkMode ? '#27272a' : '#e2e8f0',
    axisText: darkMode ? '#a1a1aa' : '#64748b'
  };

  const COLORS = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.warning,
    colors.info,
    colors.danger,
    darkMode ? '#cbd5e1' : '#475569'
  ];

  // AI-Powered Civic Insights sentences
  const generateAIInsights = () => {
    const categories = Object.keys(data.categoryCounts);
    const topCategory = categories.reduce((a, b) => data.categoryCounts[a] > data.categoryCounts[b] ? a : b, 'General');
    const topArea = areaData[0]?.name || 'Central District';
    
    return [
      `Infrastructure priority is currently led by ${topCategory} reports, making up ${Math.round((data.categoryCounts[topCategory] || 0) / data.summary.totalReports * 100)}% of reported tickets.`,
      `Civic reports cluster densest in the ${topArea} neighborhood, calling for localized municipal inspections.`,
      `The current average resolution speed stands at ${data.summary.avgResolutionTimeDays} Days with a ${data.summary.resolutionRate}% closure rate, driven largely by Community Heroes.`
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time civic data, resolution time tracking, hero contributions, and density charts.</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 border border-zinc-200/80 dark:border-zinc-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-600 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div 
          className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl transition-all shadow-sm`}
          style={{ borderLeft: `4px solid ${colors.primary}` }}
        >
          <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Reports</span>
          <span className="block text-2xl font-black mt-1" style={{ color: colors.primary }}>{data.summary.totalReports}</span>
        </div>
        <div 
          className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl transition-all shadow-sm`}
          style={{ borderLeft: `4px solid ${colors.warning}` }}
        >
          <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Open Concerns</span>
          <span className="block text-2xl font-black mt-1" style={{ color: colors.warning }}>{data.summary.activeReports}</span>
        </div>
        <div 
          className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl transition-all shadow-sm`}
          style={{ borderLeft: `4px solid ${colors.tertiary}` }}
        >
          <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Resolved Issues</span>
          <span className="block text-2xl font-black mt-1" style={{ color: colors.tertiary }}>{data.summary.resolvedReports}</span>
        </div>
        <div 
          className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl transition-all shadow-sm`}
          style={{ borderLeft: `4px solid ${colors.secondary}` }}
        >
          <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Resolution Time</span>
          <span className="block text-2xl font-black mt-1" style={{ color: colors.secondary }}>{data.summary.avgResolutionTimeDays} Days</span>
        </div>
        <div 
          className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl transition-all shadow-sm`}
          style={{ borderLeft: `4px solid ${colors.info}` }}
        >
          <span className="block text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Resolution Rate</span>
          <span className="block text-2xl font-black mt-1" style={{ color: colors.info }}>{data.summary.resolutionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Reports by Category */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl lg:col-span-1 shadow-sm`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Reports by Category</span>
          </h3>
          <div className="h-[240px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#09090b' : '#ffffff', 
                    border: darkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontSize: '11px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-zinc-500 font-semibold">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="truncate">{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Area */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl lg:col-span-1 shadow-sm`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
            <Compass className="w-4 h-4" />
            <span>Reports by Area</span>
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={areaData}>
                <XAxis type="number" stroke={colors.axisText} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke={colors.axisText} fontSize={9} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    background: darkMode ? '#09090b' : '#ffffff',
                    border: darkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="count" fill={colors.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hero Performance */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl lg:col-span-1 shadow-sm`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Hero Performance</span>
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.heroPerformance}>
                <XAxis dataKey="name" stroke={colors.axisText} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.axisText} fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: darkMode ? '#09090b' : '#ffffff',
                    border: darkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="resolved" fill={colors.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Trend Analysis Graph */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl lg:col-span-2 shadow-sm`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Monthly Statistics & Trend Analysis</span>
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="name" stroke={colors.axisText} fontSize={9} tickLine={false} />
                <YAxis stroke={colors.axisText} fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: darkMode ? '#09090b' : '#ffffff',
                    border: darkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="reported" stroke={colors.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="resolved" stroke={colors.tertiary} strokeDasharray="5 5" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Text Card */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between shadow-sm`}>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>AI Trend Insights</span>
            </h3>
            
            <div className="space-y-4">
              {generateAIInsights().map((insight, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-black rounded-xl border border-zinc-200/60 dark:border-zinc-900 text-xs">
                  <p className="leading-relaxed text-zinc-600 dark:text-zinc-300 font-semibold">{insight}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 font-medium leading-relaxed">
            AI telemetry parses issue logs daily to extract qualitative trends.
          </div>
        </div>

      </div>

      {/* Geolocation Density Heatmap */}
      <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-2xl shadow-sm`}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-6 flex items-center space-x-2">
          <Compass className="w-4 h-4" />
          <span>City Issues Density Heatmap</span>
        </h3>
        
        <div className="h-[380px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 z-10">
          <MapContainer center={[12.9716, 77.5946]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url={darkMode 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            {data.heatmap.map((pin, index) => (
              <Circle
                key={index}
                center={[pin.lat, pin.lng]}
                radius={pin.weight * 120} // Radius scaled by priority weight
                pathOptions={{
                  fillColor: colors.primary,
                  fillOpacity: Math.max(0.15, pin.weight * 0.45),
                  color: colors.primary,
                  weight: 1,
                  opacity: 0.3
                }}
              >
                <Popup>
                  <div className="text-xs text-left p-1">
                    <span className="font-bold block text-zinc-900">{pin.title}</span>
                    <span className="text-[10px] text-zinc-500 block uppercase mt-0.5">{pin.category}</span>
                    <span className="text-[10px] text-zinc-600 block mt-1">Priority Weight: <b>{Math.round(pin.weight * 100)}%</b></span>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

    </div>
  );
}
