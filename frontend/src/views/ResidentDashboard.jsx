import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GpsPicker from '../components/GpsPicker';
import { AlertCircle, PlusCircle, LayoutDashboard, Award, Sparkles, MapPin, Eye, EyeOff, FileText, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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

export default function ResidentDashboard() {
  const { user, login, register, refreshUser, showNotification } = useAuth();
  
  const [subTab, setSubTab] = useState('report');

  // Auth
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', role: 'Resident' });
  const [authLoading, setAuthLoading] = useState(false);

  // Simulated OTP & Recovery authentication modes
  const [otpMode, setOtpMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState({ lat: 12.9716, lng: 77.5946 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // AI Scanner States
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [myIssues, setMyIssues] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, subTab]);

  const loadUserData = async () => {
    try {
      const all = await api.issues.getAll();
      setMyIssues(all.filter(i => i.reporter.email === user.email));
      
      const leaders = await api.analytics.getLeaderboard();
      setLeaderboard(leaders.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    let res;
    if (otpMode) {
      if (!otpSent) {
        // Send OTP
        setTimeout(() => {
          setOtpSent(true);
          setAuthLoading(false);
          showNotification("Verification code '123456' sent to mobile.", "success");
        }, 1200);
        return;
      } else {
        // Verify OTP
        if (otpCode === '123456') {
          res = await login('jane@example.com', 'password123'); // Log in as preloaded resident
        } else {
          setAuthLoading(false);
          showNotification("Invalid code. Please enter '123456' to log in.", "error");
          return;
        }
      }
    } else {
      if (isRegister) {
        res = await register(authForm.username, authForm.email, authForm.password, authForm.role);
      } else {
        res = await login(authForm.email, authForm.password);
      }
    }
    setAuthLoading(false);
    if (res && res.success) {
      refreshUser();
    }
  };


  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!authForm.email) {
      showNotification("Please provide your email address first.", "info");
      return;
    }
    showNotification(`Password recovery link dispatched to ${authForm.email}`, "success");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerAIScan = async () => {
    if (!title || !description) {
      showNotification("Please fill Title and Description before scanning", "info");
      return;
    }
    setAiScanning(true);
    setAiResults(null);

    try {
      const checkData = {
        title,
        description,
        address,
        gps,
        image: imagePreview || null,
        isAnonymous
      };

      const res = await api.issues.checkAI(checkData);
      setAiResults(res);
      
      if (res.ocrData && (res.ocrData.houseNumber || res.ocrData.roadName)) {
        const isDefaultFallback = res.ocrData.houseNumber === "10-B" && res.ocrData.roadName === "Main Ring Road";
        if (!isDefaultFallback) {
          setAddress(`${res.ocrData.houseNumber}, ${res.ocrData.roadName}, Metro City`);
        } else if (!address.trim()) {
          setAddress(`Pinned Location (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})`);
        }
      }
      
      showNotification("AI diagnostics completed!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setAiScanning(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !address) {
      showNotification("Please fill out all required fields", "info");
      return;
    }

    setFormSubmitting(true);
    try {
      // imagePreview is already a proper base64 data URL created by FileReader
      // (e.g. data:image/jpeg;base64,...) — correct MIME type, renderable by browsers.
      // We send it directly to avoid a double-roundtrip through /api/upload.
      const imageUrl = imagePreview || null;

      const issueData = {
        title,
        description,
        address,
        gps,
        image: imageUrl,
        isAnonymous,
        reporterName: user.username,
        reporterEmail: user.email
      };

      const res = await api.issues.create(issueData);
      if (res.success) {
        showNotification("Issue reported successfully!", "success");
        confetti({ particleCount: 80, spread: 60 });
        
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview('');
        setAiResults(null);
        
        await refreshUser();
        setSubTab('history');
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
  const getLevelProgress = (xp) => xp % 100;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-left">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded mb-3 border border-zinc-200 dark:border-zinc-800">
              <Lock className="w-5 h-5 text-zinc-950 dark:text-white" />
            </div>
            <h2 className="text-xl font-bold">
              {otpMode ? 'Sign In with Phone' : isRegister ? 'Create Citizen Account' : 'Sign In'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 text-center">Access reports logging, diagnostics, and rewards.</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {otpMode ? (
              // --- Phone OTP Input Form ---
              <>
                <div>
                  <label className="block text-xs font-semibold mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                {otpSent && (
                  <div>
                    <label className="block text-xs font-semibold mb-2">Enter Verification Code (OTP)</label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                      placeholder="Enter 123456"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded text-xs font-bold transition-all flex items-center justify-center space-x-2"
                >
                  {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{otpSent ? 'Verify OTP Code' : 'Send Verification OTP'}</span>
                </button>
              </>
            ) : (
              // --- Standard Email/Password Form ---
              <>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold mb-2">Username</label>
                    <input
                      type="text"
                      required
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                      placeholder="username"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold">Password</label>
                    {!isRegister && (
                      <button
                        onClick={handleForgotPassword}
                        className="text-[10px] text-zinc-600 hover:text-black dark:hover:text-white hover:underline"
                        type="button"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="••••••••"
                  />
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold mb-2">Platform Role</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    >
                      <option value="Resident">Resident (Reporter)</option>
                      <option value="Community Hero">Community Hero (Contractor/Volunteer)</option>
                      <option value="NGO/Volunteer">NGO / Drive Organizer</option>
                      <option value="Government/Admin">Government Auditor / Admin</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded text-xs font-bold transition-all flex items-center justify-center space-x-2"
                >
                  {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                </button>
              </>
            )}
          </form>


          <div className="mt-6 text-center text-xs space-y-2">
            <div>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setOtpMode(false);
                  setOtpSent(false);
                }}
                className="text-zinc-950 dark:text-white font-bold hover:underline"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  setOtpMode(!otpMode);
                  setOtpSent(false);
                  setIsRegister(false);
                }}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px] hover:underline"
              >
                {otpMode ? 'Back to Email Login' : 'Login using Mobile OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Welcome Area */}
      <div className="bg-black text-white rounded-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Active Session • Role: <b className="capitalize">{user.role}</b></span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Citizen Dashboard</h2>
          <p className="text-xs text-zinc-400 mt-1">Hello, {user.username}. Log neighborhood issues and check diagnostics.</p>
        </div>

        {/* Level and XP */}
        <div className="flex items-center space-x-4 bg-zinc-900 p-4 rounded border border-zinc-800 w-full md:w-auto">
          <div className="w-10 h-10 bg-white text-black dark:bg-zinc-800 dark:text-white rounded flex flex-col items-center justify-center font-bold text-base border border-zinc-200 dark:border-zinc-700">
            <span>L{calculateLevel(user.xp)}</span>
          </div>
          <div className="flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">XP Progress</span>
            <div className="w-32 md:w-40 h-1.5 bg-zinc-950 rounded-full overflow-hidden mt-1 border border-zinc-800">
              <div className="h-full bg-white rounded-full" style={{ width: `${getLevelProgress(user.xp)}%` }}></div>
            </div>
            <span className="block text-[8px] text-zinc-500 mt-1">{user.xp} Total XP • {user.points} Points</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 space-x-4">
        <button
          onClick={() => setSubTab('report')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'report' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Report Issue</span>
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'history' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>My Reports ({myIssues.length})</span>
        </button>
        <button
          onClick={() => setSubTab('rewards')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
            subTab === 'rewards' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-4.5 h-4.5" />
          <span>Rewards & Badges</span>
        </button>
      </div>

      {/* Panel Body */}
      <div>
        
        {/* Report Form */}
        {subTab === 'report' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-sm mb-6 flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-zinc-950 dark:text-white" />
                <span>Issue Report Form</span>
              </h3>

              <form onSubmit={handleReportSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary (e.g. Broken water pipeline on School Lane)"
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Description *</label>
                  <textarea
                    required
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe landmarks, hazard level, when it started..."
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold mb-2">Upload Image Evidence</label>
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 relative cursor-pointer hover:bg-zinc-100">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-28 rounded object-cover" />
                      ) : (
                        <div className="text-center py-4">
                          <PlusCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                          <span className="block text-[10px] text-zinc-400 font-semibold">Select Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">Pin Location *</label>
                    <GpsPicker value={gps} onChange={setGps} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, Sector, Area"
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className="p-1 text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      {isAnonymous ? <EyeOff className="w-4.5 h-4.5 text-black dark:text-white" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                    <div>
                      <span className="block text-xs font-semibold">Report Anonymously</span>
                      <span className="block text-[9px] text-zinc-500">Hide your user profile on public feeds</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={triggerAIScan}
                      disabled={aiScanning}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-semibold transition-all flex items-center space-x-2"
                    >
                      {aiScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />}
                      <span>AI Scan Details</span>
                    </button>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2 bg-black hover:bg-zinc-900 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded text-xs font-bold transition-all"
                    >
                      {formSubmitting ? 'Reporting...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* AI Real-time Diagnostics */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-black text-white border border-zinc-800 rounded-lg p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center space-x-2 text-white mb-4">
                  <Sparkles className="w-4.5 h-4.5" />
                  <h3 className="font-bold text-xs uppercase tracking-wide">AI Diagnostics</h3>
                </div>

                {!aiResults ? (
                  <div className="space-y-3 py-6 text-center text-zinc-400 text-xs">
                    <AlertCircle className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
                    <p>Enter details and click **AI Scan Details** to trigger diagnostics.</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <span className="block text-[8px] text-zinc-500 font-bold uppercase">Predicted Category</span>
                      <span className="block text-xs font-bold text-white mt-0.5">{aiResults.category}</span>
                    </div>

                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <span className="block text-[8px] text-zinc-500 font-bold uppercase">Estimated Severity</span>
                      <span className="block text-xs font-bold text-white mt-0.5">{aiResults.severity}</span>
                    </div>

                    {aiResults.imgVerification && (
                      <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="block text-[8px] text-zinc-500 font-bold uppercase">Image Scan</span>
                        <span className="block text-[10px] text-zinc-300 mt-0.5">{aiResults.imgVerification.message}</span>
                      </div>
                    )}

                    <div className={`p-3 rounded border ${aiResults.duplicates.length > 0 ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
                      <span className="block text-[8px] font-bold uppercase">Duplicate Detection</span>
                      <span className="block text-[10px] mt-0.5">
                        {aiResults.duplicates.length > 0 
                          ? `Warning: Potential Duplicate report found nearby.` 
                          : "Cleared: No similar reports found nearby."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {subTab === 'history' && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-sm mb-6">My Filed Reports</h3>

            {myIssues.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                <p className="text-xs">No reports filed yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {myIssues.map(issue => (
                  <div key={issue.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-11 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden shrink-0">
                        <img
                          src={getIssueImage(issue.image, issue.category)}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = CATEGORY_FALLBACKS[issue.category] || CATEGORY_FALLBACKS['default']; }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{issue.title}</h4>
                        <span className="text-[10px] text-zinc-500">{issue.category} • reported on {new Date(issue.dateReported).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        issue.status === 'resolved' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800' :
                        issue.status === 'claimed' ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700' :
                        'bg-black text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200'
                      }`}>
                        {issue.status}
                      </span>
                      <span className="text-[9px] font-bold bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 px-2 py-0.5 rounded">
                        Score: {issue.priorityScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {subTab === 'rewards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-sm mb-6 font-sans">Achievement Badges</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                
                <div className={`p-4 rounded border text-center flex flex-col items-center ${user.badges.includes("First Report") ? 'bg-zinc-50 border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800' : 'opacity-40 border-zinc-100'}`}>
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white rounded flex items-center justify-center font-bold mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs">First Report</h4>
                  <p className="text-[9px] text-zinc-500 mt-1">Logged your first neighborhood concern</p>
                </div>

                <div className={`p-4 rounded border text-center flex flex-col items-center ${user.badges.includes("Active Voice") ? 'bg-zinc-50 border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800' : 'opacity-40 border-zinc-100'}`}>
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white rounded flex items-center justify-center font-bold mb-3">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs">Active Voice</h4>
                  <p className="text-[9px] text-zinc-500 mt-1">Reported 5 or more verified concerns</p>
                </div>

                <div className={`p-4 rounded border text-center flex flex-col items-center ${user.badges.includes("Community Saver") ? 'bg-zinc-50 border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800' : 'opacity-40 border-zinc-100'}`}>
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white rounded flex items-center justify-center font-bold mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs">Community Saver</h4>
                  <p className="text-[9px] text-zinc-500 mt-1">Resolved 3 reported issues</p>
                </div>
              </div>

              <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <h4 className="font-bold text-xs mb-4">Weekly Challenges</h4>
                <div className="space-y-3 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold block">Report 1 local road pothole</span>
                      <span className="text-[9px] text-zinc-500">Award: +30 XP</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* City Leaderboard */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-xs mb-6 flex items-center space-x-2">
                <Award className="w-4 h-4 text-zinc-950 dark:text-white" />
                <span>City Hero Leaderboard</span>
              </h3>

              <div className="space-y-4">
                {leaderboard.map((lead, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-black text-white dark:bg-white dark:text-black shadow' :
                        idx === 1 ? 'bg-zinc-205 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' :
                        idx === 2 ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400' : 'text-zinc-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold block">{lead.username}</span>
                        <span className="text-[9px] text-zinc-500 capitalize">{lead.role}</span>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-950 dark:text-white">{lead.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
