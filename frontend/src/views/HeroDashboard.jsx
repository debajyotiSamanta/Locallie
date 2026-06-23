import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Heart, CheckCircle2, ClipboardList, MapPin, Sparkles, Upload, Loader2, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HeroDashboard() {
  const { user, refreshUser, showNotification } = useAuth();
  
  const [subTab, setSubTab] = useState('claims');

  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [claimedIssues, setClaimedIssues] = useState([]);
  const [completedIssues, setCompletedIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // Resolution Form
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadIssues();
    }
  }, [user, subTab]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const all = await api.issues.getAll();
      
      setNearbyIssues(all.filter(i => i.status === 'reported'));
      setClaimedIssues(all.filter(i => i.status === 'claimed' && i.claimedBy?.id === user.id));
      setCompletedIssues(all.filter(i => i.status === 'resolved' && i.claimedBy?.id === user.id));
    } catch (err) {
      showNotification("Failed to load issues", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (issueId) => {
    try {
      const res = await api.issues.claim(issueId, user.id);
      showNotification("Issue claimed successfully!", "success");
      
      setNearbyIssues(prev => prev.filter(i => i.id !== issueId));
      setClaimedIssues(prev => [...prev, res.issue]);
      
      await refreshUser();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!afterImagePreview) {
      showNotification("Please upload resolution photo evidence", "info");
      return;
    }

    setResolvingLoading(true);
    try {
      const res = await api.issues.resolve(resolvingIssue.id, user.id, afterImagePreview);
      showNotification("Issue resolved successfully! +100 XP.", "success");
      confetti({ particleCount: 150, spread: 80 });

      setResolvingIssue(null);
      setAfterImagePreview('');
      
      setClaimedIssues(prev => prev.filter(i => i.id !== resolvingIssue.id));
      setCompletedIssues(prev => [...prev, res.issue]);

      await refreshUser();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setResolvingLoading(false);
    }
  };

  const getAiRecommendations = () => {
    const categoriesSolved = completedIssues.map(i => i.category);
    let topCategory = 'Road Damage';
    if (categoriesSolved.length > 0) {
      const counts = {};
      categoriesSolved.forEach(c => counts[c] = (counts[c] || 0) + 1);
      topCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }
    return nearbyIssues.filter(i => i.category === topCategory).slice(0, 2);
  };

  const recommendedTasks = getAiRecommendations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Community Hero Portal</h1>
        <p className="text-xs text-zinc-500">Claim reported concerns and upload resolution evidence.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 space-x-4">
        <button
          onClick={() => setSubTab('claims')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'claims' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-550 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <ClipboardList className="w-4.5 h-4.5" />
          <span>My Claims ({claimedIssues.length})</span>
        </button>
        <button
          onClick={() => setSubTab('completed')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'completed' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-550 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>Resolved Tasks ({completedIssues.length})</span>
        </button>
      </div>

      {isClaimedLoadingOrOtherStatus ? (
        // Note: we can just check if loading
        null
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white mb-2" />
          <span className="text-xs text-zinc-500">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            
            {subTab === 'claims' && (
              <div className="space-y-6">
                {claimedIssues.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-12 rounded-lg text-center shadow-sm">
                    <ClipboardList className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
                    <h3 className="font-bold text-sm">No Active Claims</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Claim reported tasks from the feed to begin work.</p>
                  </div>
                ) : (
                  claimedIssues.map(issue => (
                    <div key={issue.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                      <div className="flex-grow flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-24 h-16 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden shrink-0">
                          <img src={issue.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-205 border border-zinc-200 dark:border-zinc-800">
                            {issue.category}
                          </span>
                          <h3 className="font-bold text-sm mt-2">{issue.title}</h3>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>{issue.address}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setResolvingIssue(issue)}
                        className="px-4 py-2 bg-black hover:bg-zinc-900 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center space-x-1 shrink-0 dark:bg-white dark:text-black dark:hover:bg-zinc-105"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {subTab === 'completed' && (
              <div className="space-y-6">
                {completedIssues.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-12 rounded-lg text-center shadow-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
                    <h3 className="font-bold text-sm">No Resolved Issues</h3>
                    <p className="text-xs text-zinc-505 mt-1">Complete claimed tasks to start building your portfolio.</p>
                  </div>
                ) : (
                  completedIssues.map(issue => (
                    <div key={issue.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400">Resolved on {new Date(issue.dateResolved).toLocaleDateString()}</span>
                          <h3 className="font-bold text-sm mt-1">{issue.title}</h3>
                        </div>
                        <span className="text-[9px] font-bold bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-200 px-2 py-0.5 rounded border border-zinc-250 dark:border-zinc-800">
                          RESOLVED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-450 uppercase mb-1">Before</span>
                          <div className="h-24 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img src={issue.beforeImage || issue.image} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-950 dark:text-white uppercase mb-1">After</span>
                          <div className="h-24 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img src={issue.afterImage} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black text-white rounded-lg p-6 shadow-sm border border-zinc-800">
              <div className="flex items-center space-x-2 text-white mb-4">
                <Sparkles className="w-4.5 h-4.5" />
                <h3 className="font-bold text-xs uppercase tracking-wide">AI Recommended</h3>
              </div>
              <p className="text-[9px] text-zinc-455 mb-4">Tasks based on your resolution history:</p>

              {recommendedTasks.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic text-center py-4">No recommendations available.</p>
              ) : (
                <div className="space-y-4">
                  {recommendedTasks.map(task => (
                    <div key={task.id} className="bg-zinc-900 p-3 rounded border border-zinc-800 text-xs">
                      <h4 className="font-bold text-xs line-clamp-1 text-white">{task.title}</h4>
                      <p className="text-[10px] text-zinc-450 mt-1 line-clamp-1">{task.address}</p>
                      
                      <div className="flex justify-between items-center mt-3 border-t border-zinc-800 pt-2">
                        <span className="text-[9px] font-bold text-zinc-350 uppercase">{task.category}</span>
                        <button
                          onClick={() => handleClaim(task.id)}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-black rounded text-[9px] font-bold transition-all"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm text-xs">
              <h3 className="font-bold text-xs mb-4 flex items-center space-x-2">
                <Award className="w-4.5 h-4.5 text-zinc-950 dark:text-white" />
                <span>My Achievements</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Current Tier</span>
                  <span className="text-zinc-950 dark:text-white font-bold capitalize">{user.reputation}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2 text-zinc-505">
                  <span>Tasks Solved</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{completedIssues.length}</span>
                </div>
                <div className="flex justify-between text-zinc-505">
                  <span>Total XP</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded overflow-hidden shadow-xl flex flex-col">
            
            <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-850 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
              <h3 className="font-bold text-xs">Submit Resolution Evidence</h3>
              <button onClick={() => { setResolvingIssue(null); setAfterImagePreview(''); }} className="p-1 hover:bg-zinc-200 rounded">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Issue Title</label>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200/40 text-xs text-zinc-800 dark:text-zinc-200">
                  {resolvingIssue.title}
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Upload After-Fix Image Evidence *</label>
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 relative cursor-pointer hover:bg-zinc-100">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleAfterImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {afterImagePreview ? (
                    <img src={afterImagePreview} alt="Resolution" className="h-28 rounded object-cover" />
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <span className="block text-[9px] text-zinc-405 font-semibold">Select Evidence Photo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-zinc-150 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => { setResolvingIssue(null); setAfterImagePreview(''); }}
                  className="flex-1 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingLoading}
                  className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white rounded text-xs font-bold shadow flex items-center justify-center space-x-2 dark:bg-white dark:text-black dark:hover:bg-zinc-105"
                >
                  {resolvingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Close Issue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
