import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import LocallieMap from '../components/LocallieMap';
import { Search, Grid, Map, Clock, Filter, ThumbsUp, MessageCircle, Share2, MapPin, X, Send, ShieldAlert, Award } from 'lucide-react';

const CATEGORY_FALLBACKS = {
  'Road Damage': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800',
  'Sanitation': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
  'Electrical': 'https://images.unsplash.com/photo-1509023467866-9099f4401b56?w=800',
  'Water Leakage': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
  'Fallen Trees': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800',
  'Public Safety': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
  'default': 'https://images.unsplash.com/photo-1599740831119-070df34b00cf?w=800'
};

const getIssueImage = (img, category) => {
  if (!img || typeof img !== 'string') return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['default'];
  const trimmed = img.trim();
  if (!trimmed) return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['default'];
  // data: URLs are base64 images stored directly in MongoDB — display them as-is
  return trimmed;
};

export default function PublicFeed() {
  const { user, showNotification } = useAuth();
  
  const [viewMode, setViewMode] = useState('grid');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState(() => localStorage.getItem('locallie_search_query') || '');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [radius, setRadius] = useState(5000);
  const [useGps, setUseGps] = useState(false);
  const [userGps, setUserGps] = useState({ lat: 12.9716, lng: 77.5946 });

  // Detail Modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Responsive Sidebar Toggle (Mobile)
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchIssues = async (customSearch = null, customGps = null) => {
    setLoading(true);
    try {
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      
      const activeSearch = customSearch !== null ? customSearch : search;
      if (activeSearch) filters.search = activeSearch;
      
      if (useGps) {
        const activeGps = customGps !== null ? customGps : userGps;
        if (activeGps) {
          filters.lat = activeGps.lat;
          filters.lng = activeGps.lng;
          filters.radius = radius;
        }
      }

      const data = await api.issues.getAll(filters);
      // Defensive check: Verify backend returns an array
      if (Array.isArray(data)) {
        setIssues(data);
      } else {
        setIssues([]);
        console.error("Issues API did not return an array:", data);
      }
    } catch (err) {
      showNotification("Failed to load issues", "error");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activeSearch = search;
    const savedSearch = localStorage.getItem('locallie_search_query');
    if (savedSearch) {
      activeSearch = savedSearch;
      setSearch(savedSearch);
      localStorage.removeItem('locallie_search_query');
    }

    let activeGps = userGps;
    const savedGps = localStorage.getItem('locallie_user_gps');
    if (savedGps) {
      try {
        const parsed = JSON.parse(savedGps);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          activeGps = parsed;
          setUserGps(parsed);
        }
      } catch (e) {
        console.error("Failed to parse user GPS:", e);
      }
    }

    fetchIssues(activeSearch, activeGps);
  }, [category, status, useGps, radius, search]);

  const handleVote = async (e, issueId) => {
    e.stopPropagation();
    if (!user) {
      showNotification("Please login to upvote reports", "info");
      return;
    }
    try {
      const res = await api.issues.vote(issueId, user.id);
      
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            upvotes: res.voted 
              ? [...issue.upvotes, user.id] 
              : issue.upvotes.filter(id => id !== user.id),
            priorityScore: res.priorityScore
          };
        }
        return issue;
      }));

      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => ({
          ...prev,
          upvotes: res.voted 
            ? [...prev.upvotes, user.id] 
            : prev.upvotes.filter(id => id !== user.id),
          priorityScore: res.priorityScore
        }));
      }

      showNotification(res.voted ? "Upvoted report" : "Removed upvote", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please login to comment", "info");
      return;
    }
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.issues.comment(selectedIssue.id, user.username, newComment);
      setSelectedIssue(prev => ({ ...prev, comments: res.comments }));
      setNewComment('');
      showNotification("Comment posted", "success");
    } catch (err) {
      showNotification("Failed to post comment", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleClaim = async (issueId) => {
    if (!user) {
      showNotification("Please login to claim issues", "info");
      return;
    }
    try {
      const res = await api.issues.claim(issueId, user.id);
      setSelectedIssue(res.issue);
      setIssues(prev => prev.map(i => i.id === issueId ? res.issue : i));
      showNotification("Issue claimed successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const shareIssue = (issue) => {
    const shareText = `Check out this hyperlocal report: ${issue.title} located at ${issue.address}. Category: ${issue.category}`;
    navigator.clipboard.writeText(shareText);
    showNotification("Share info copied to clipboard", "success");
  };

  const getStatusStyle = (state) => {
    switch (state) {
      case 'resolved': return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800';
      case 'claimed': return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800';
      default: return 'bg-black text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Public Feed</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Explore reported concerns and coordinates pins.</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded border border-zinc-300 dark:border-zinc-800 w-full sm:w-auto justify-between">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' : 'text-zinc-500'}`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 text-xs font-semibold transition-all ${viewMode === 'map' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' : 'text-zinc-500'}`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 text-xs font-semibold transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' : 'text-zinc-500'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive sidebar positioning */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full flex justify-end">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold rounded"
          >
            <Filter className="w-4 h-4 text-black dark:text-white" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Filters Sidebar */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-5 shadow-sm h-fit space-y-6 text-left`}>
          <div className="flex items-center space-x-2 text-zinc-950 dark:text-zinc-100 font-bold text-xs pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Filter className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
            <span>Filters</span>
          </div>

          {/* Search */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
              <option value="">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Electrical">Electrical</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Fallen Trees">Fallen Trees</option>
              <option value="Public Safety">Public Safety</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Radius Selector */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Geofence</label>
              <input
                type="checkbox"
                checked={useGps}
                onChange={(e) => setUseGps(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-black dark:text-white border-zinc-300 focus:ring-black dark:focus:ring-white"
              />
            </div>
            {useGps && (
              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 border border-zinc-100 dark:border-zinc-900 rounded">
                <div className="flex justify-between text-[9px] text-zinc-400">
                  <span>Range</span>
                  <span className="font-bold">{(radius / 1000).toFixed(1)} km</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Feed Contents */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-2">
              <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[11px] text-zinc-600">Loading feed...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-16 text-center shadow-sm">
              <span className="block text-2xl mb-2">🔍</span>
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-200">No Reports Logged</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Try widening your filters to see nearby reports.</p>
            </div>
          ) : viewMode === 'map' ? (
            <div className="h-[500px] w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <LocallieMap 
                issues={issues} 
                center={[userGps.lat, userGps.lng]} 
                radius={useGps ? radius : 0} 
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 pl-5 ml-3 space-y-6 text-left">
              {issues.map(issue => (
                <div key={issue.id} className="relative group cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <div className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border border-black dark:border-white flex items-center justify-center transition-all">
                    <span className="w-1 h-1 rounded-full bg-black dark:bg-white"></span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400">
                          {new Date(issue.dateReported).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-xs mt-0.5">{issue.title}</h3>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{issue.description}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getStatusStyle(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map(issue => (
                <div 
                  key={issue.id} 
                  onClick={() => setSelectedIssue(issue)}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-500 dark:hover:border-zinc-700 duration-200 cursor-pointer flex flex-col justify-between text-left"
                >
                  <div className="relative h-40 bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={getIssueImage(issue.image, issue.category)}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = CATEGORY_FALLBACKS[issue.category] || CATEGORY_FALLBACKS['default']; }}
                    />
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusStyle(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[9px] font-semibold px-2 py-0.5 rounded bg-black text-white">
                      {issue.category}
                    </span>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs line-clamp-1 mb-1">{issue.title}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">{issue.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 text-zinc-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="line-clamp-1 text-[10px]">{issue.address}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[11px] font-semibold">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => handleVote(e, issue.id)}
                            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded transition-all ${
                              user && issue.upvotes.includes(user.id)
                                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                                : 'hover:bg-zinc-50 text-zinc-500 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{issue.upvotes.length}</span>
                          </button>

                          <div className="flex items-center space-x-1.5 text-zinc-400">
                            <MessageCircle className="w-3 h-3" />
                            <span>{issue.comments.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); shareIssue(issue); }}
                            className="p-1 text-zinc-500 hover:text-black dark:hover:text-white"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-bold bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 px-1.5 py-0.5 rounded">
                            Score: {issue.priorityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded shadow-lg flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-left">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Issue ticket</span>
              <button onClick={() => setSelectedIssue(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-5 text-left">
              {selectedIssue.status === 'resolved' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">Before</span>
                    <div className="h-28 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={getIssueImage(selectedIssue.beforeImage || selectedIssue.image, selectedIssue.category)}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = CATEGORY_FALLBACKS[selectedIssue.category] || CATEGORY_FALLBACKS['default']; }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-900 dark:text-white uppercase mb-1">After</span>
                    <div className="h-28 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={getIssueImage(selectedIssue.afterImage, selectedIssue.category)}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = CATEGORY_FALLBACKS[selectedIssue.category] || CATEGORY_FALLBACKS['default']; }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={getIssueImage(selectedIssue.image, selectedIssue.category)}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = CATEGORY_FALLBACKS[selectedIssue.category] || CATEGORY_FALLBACKS['default']; }}
                  />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusStyle(selectedIssue.status)}`}>
                    {selectedIssue.status}
                  </span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800">
                    {selectedIssue.category}
                  </span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                    {selectedIssue.severity}
                  </span>
                </div>
                
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">{selectedIssue.title}</h2>
                <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{selectedIssue.address}</span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded border border-zinc-100 dark:border-zinc-800/80">
                <p className="text-xs text-zinc-655 dark:text-zinc-300 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs py-2.5 border-y border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Routing: <b className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedIssue.department}</b></span>
                </div>
                <div className="flex items-center space-x-1 text-zinc-900 dark:text-white">
                  <Award className="w-3.5 h-3.5" />
                  <span className="font-bold">Priority: {selectedIssue.priorityScore}</span>
                </div>
              </div>

              {selectedIssue.status === 'reported' && user && (user.role === 'Community Hero' || user.role === 'NGO/Volunteer') && (
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Claim reported concern?</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Assigned heroes resolve this issue via evidence photos.</p>
                  </div>
                  <button
                    onClick={() => handleClaim(selectedIssue.id)}
                    className="px-4 py-2 bg-black hover:bg-zinc-900 text-white rounded text-xs font-bold transition-all shrink-0 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                  >
                    Claim Task
                  </button>
                </div>
              )}

              {selectedIssue.status !== 'reported' && selectedIssue.claimedBy && (
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center">
                      {selectedIssue.claimedBy.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs">
                      <span className="block font-semibold">Assigned: {selectedIssue.claimedBy.username}</span>
                      <span className="block text-[10px] text-zinc-500 capitalize">{selectedIssue.claimedBy.role}</span>
                    </div>
                  </div>
                  {selectedIssue.dateResolved && (
                    <span className="text-[9px] font-bold text-zinc-900 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      Resolved
                    </span>
                  )}
                </div>
              )}

              {/* Comments */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-zinc-400 uppercase">Comments ({selectedIssue.comments.length})</span>
                
                <div className="space-y-3 max-h-36 overflow-y-auto pr-2">
                  {selectedIssue.comments.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 italic">No comments posted yet.</p>
                  ) : (
                    selectedIssue.comments.map(c => (
                      <div key={c.id} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-100 dark:border-zinc-800 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{c.username}</span>
                          <span className="text-[9px] text-zinc-500">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment..."
                      className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900 rounded text-xs"
                    />
                    <button
                      type="submit"
                      disabled={commentLoading}
                      className="px-3 py-2 rounded bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 disabled:opacity-50 transition-all text-xs font-semibold"
                    >
                      Post
                    </button>
                  </form>
                ) : (
                  <p className="text-[9px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded text-center">
                    Sign in to participate in the civic feed discussion.
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
              <button
                onClick={(e) => handleVote(e, selectedIssue.id)}
                className={`flex items-center space-x-1 px-4 py-2 rounded text-xs font-bold transition-all ${
                  user && selectedIssue.upvotes.includes(user.id)
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                <span>{selectedIssue.upvotes.includes(user?.id) ? 'Upvoted' : 'Upvote'} ({selectedIssue.upvotes.length})</span>
              </button>

              <button
                onClick={() => shareIssue(selectedIssue)}
                className="p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white"
                title="Copy share details"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
