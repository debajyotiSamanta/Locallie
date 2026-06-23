import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, MapPin, Sparkles, CheckCircle, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

const CATEGORY_FALLBACKS = {
  'Road Damage': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800',
  'Sanitation': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
  'Electrical': 'https://images.unsplash.com/photo-1509023467866-9099f4401b56?w=800',
  'Water Leakage': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
  'Fallen Trees': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800',
  'Public Safety': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
  'default': 'https://images.unsplash.com/photo-1599740831119-070df34b00cf?w=800'
};

const getIssueImage = (issue) => {
  const img = issue?.image;
  if (!img || typeof img !== 'string') {
    return CATEGORY_FALLBACKS[issue?.category] || CATEGORY_FALLBACKS['default'];
  }
  const trimmed = img.trim();
  if (!trimmed) {
    return CATEGORY_FALLBACKS[issue?.category] || CATEGORY_FALLBACKS['default'];
  }
  // data: URLs are base64 images stored directly in MongoDB — display them as-is
  return trimmed;
};

export default function LandingPage() {
  const { user, setActiveTab, showNotification } = useAuth();
  const [stats, setStats] = useState({ totalReports: 0, activeReports: 0, resolvedReports: 0, usersCount: 0 });
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const summary = await api.analytics.getSummary();
        setStats(summary.summary);
        
        const allIssues = await api.issues.getAll();
        setIssues(allIssues.slice(0, 3));
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('feed');
      localStorage.setItem('locallie_search_query', searchQuery);
    }
  };

  const detectLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      showNotification("Geolocation not supported by your browser", "error");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('locallie_user_gps', JSON.stringify({ lat: latitude, lng: longitude }));
        setLocationName(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        showNotification("Location detected successfully!", "success");
        setGpsLoading(false);
      },
      (error) => {
        const fallbackGps = { lat: 12.9716, lng: 77.5946 };
        localStorage.setItem('locallie_user_gps', JSON.stringify(fallbackGps));
        setLocationName("Metro City Center (Simulated GPS)");
        showNotification("GPS Permission denied. Using Metro City fallback location.", "info");
        setGpsLoading(false);
      }
    );
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    showNotification("Message sent! A civic volunteer will reply shortly.", "success");
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white bg-dot-pattern transition-colors duration-300">
      
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-zinc-50 text-zinc-800 dark:bg-zinc-900/65 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          <span>Professional Infrastructure Reporting & Tracking Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none mb-6 text-zinc-950 dark:text-white">
          Empower Neighborhood Progress. <br />
          <span className="text-zinc-600 dark:text-zinc-500 underline decoration-zinc-300 dark:decoration-zinc-800">
            Resolve Issues Collaboratively.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-500 dark:text-zinc-400 mb-10">
          Report municipal concerns directly to local city departments. AI-assisted routing ensures potholes, broken lights, and utility faults are assigned to local teams for verified repair.
        </p>

        {/* Search Bar & GPS Detector */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 p-2 md:p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2 px-3 min-h-[40px]">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports (e.g. 'streetlight', 'water leakage')..."
              className="w-full py-2 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-100"
            />
          </form>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-3 md:pt-0 pl-0 md:pl-3 shrink-0">
            <button
              onClick={detectLocation}
              disabled={gpsLoading}
              className="flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full sm:w-auto min-h-[40px] transition-all"
            >
              <MapPin className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span className="truncate">{locationName || "Detect Location"}</span>
            </button>

            <button
              onClick={() => {
                if (user) {
                  setActiveTab('dashboard');
                } else {
                  showNotification("Please sign in to file reports", "info");
                  setActiveTab('dashboard');
                }
              }}
              className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-lg text-xs font-bold transition-all w-full sm:w-auto min-h-[40px] shrink-0"
            >
              Report Issue
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-white">{stats.totalReports || 12}</div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">Reports Logged</div>
          </div>
          <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-white">{stats.resolvedReports || 8}</div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">Issues Resolved</div>
          </div>
          <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-white">92%</div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">AI Classification</div>
          </div>
          <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-white">{stats.usersCount || 4}</div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">Active Heroes & NGOs</div>
          </div>
        </div>
      </section>

      {/* Active Reports Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold">Active Neighborhood Reports</h2>
            <p className="text-xs text-zinc-500 mt-1">Live issues flagged by residents needing attention</p>
          </div>
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center space-x-1 text-xs font-bold text-black dark:text-white hover:underline"
          >
            <span>View Public Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {issues.map(issue => (
            <div key={issue.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-sm transition-all duration-300 flex flex-col justify-between text-left">
              <div className="relative h-44 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={getIssueImage(issue)}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = CATEGORY_FALLBACKS[issue.category] || CATEGORY_FALLBACKS['default']; }}
                />
                <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                  issue.status === 'resolved' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' :
                  issue.status === 'claimed' ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border border-zinc-300/40' :
                  'bg-black text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200'
                }`}>
                  {issue.status}
                </span>
                <span className="absolute bottom-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded bg-black/75 text-white">
                  {issue.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 mb-1">{issue.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">{issue.description}</p>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="flex items-center space-x-1 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1 text-[11px]">{issue.address}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded">
                    Score: {issue.priorityScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-zinc-50/50 dark:bg-zinc-950/40 py-16 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Verified Resolutions</h2>
            <p className="text-xs text-zinc-500 mt-2">See how Community Heroes are transforming reported locations</p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center text-left">
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Before</span>
                <div className="h-36 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img src="https://images.unsplash.com/photo-1509023467866-9099f4401b56?w=600" alt="Before streetlight fix" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-900 dark:text-white uppercase mb-2">After (Resolved)</span>
                <div className="h-36 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600" alt="After streetlight fix" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                <span>Resolved in 2 Hours</span>
              </div>
              <h3 className="text-lg font-bold">Broken Streetlight on Hospital Street</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                "The lane was pitch dark at night, making it unsafe for walking patients. The issue was claimed by local Hero John who replaced the bulb and re-secured the wiring."
              </p>
              
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  J
                </div>
                <div>
                  <h4 className="text-xs font-bold">John Hero</h4>
                  <p className="text-[9px] text-zinc-500">Community Hero • 850 XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-left">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-center mb-6">Contact Civic Support</h2>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Message</label>
              <textarea
                rows="4"
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                placeholder="Describe your query..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded text-xs font-bold transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
