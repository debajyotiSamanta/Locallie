import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GpsPicker from '../components/GpsPicker';
import { Users, MapPin, PlusCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NGODashboard() {
  const { user, refreshUser, showNotification } = useAuth();
  
  const [subTab, setSubTab] = useState('list');
  const [drives, setDrives] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 12.9756, lng: 77.5976 });
  const [image, setImage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (subTab === 'list') loadDrives();
    if (subTab === 'claims') loadClaims();
  }, [subTab]);

  const loadDrives = async () => {
    setLoading(true);
    try {
      const data = await api.drives.getAll();
      setDrives(data);
    } catch (err) {
      showNotification("Failed to load drives", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async () => {
    setLoading(true);
    try {
      const allIssues = await api.issues.getAll({ status: 'claimed' });
      const myClaims = allIssues.filter(issue => issue.claimedBy && issue.claimedBy.id === user._id);
      setClaims(myClaims);
    } catch (err) {
      showNotification("Failed to load claims", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDrive = async (driveId) => {
    try {
      const updated = await api.drives.join(driveId, user.username);
      setDrives(prev => prev.map(d => d.id === driveId ? updated : d));
      showNotification(
        updated.volunteers.includes(user.username) 
          ? "Joined volunteer drive successfully!" 
          : "Left volunteer drive", 
        "success"
      );
      await refreshUser();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleCreateDriveSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) {
      showNotification("Please fill out all required fields", "info");
      return;
    }

    setFormSubmitting(true);
    try {
      const driveData = {
        title,
        description,
        location,
        coordinates,
        image: image || null,
        organizer: user.username
      };

      await api.drives.create(driveData);
      showNotification("Community drive organized! +50 XP.", "success");
      
      setTitle('');
      setDescription('');
      setLocation('');
      setImage('');
      
      await refreshUser();
      setSubTab('list');
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">NGO & Volunteer Portal</h1>
        <p className="text-xs text-zinc-500">Organize neighborhood cleanup drives and campaign for civic repairs.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 space-x-4 overflow-x-auto">
        <button
          onClick={() => setSubTab('list')}
          className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap ${
            subTab === 'list' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Drives ({drives.length})</span>
        </button>
        {user.role === 'NGO/Volunteer' && (
          <>
            <button
              onClick={() => setSubTab('claims')}
              className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap ${
                subTab === 'claims' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>My Claims ({claims.length})</span>
            </button>
            <button
              onClick={() => setSubTab('create')}
              className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap ${
                subTab === 'create' ? 'border-black text-black dark:text-white dark:border-white' : 'border-transparent text-zinc-600 hover:text-black dark:hover:text-zinc-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Organize Drive</span>
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white mb-2" />
          <span className="text-xs text-zinc-500">Loading...</span>
        </div>
      ) : (
        <div>
          
          {subTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drives.length === 0 ? (
                <div className="col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-12 rounded-lg text-center">
                  <Users className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
                  <h3 className="font-bold text-sm">No Active Drives</h3>
                  <p className="text-xs text-zinc-500 mt-1">NGOs have not organized any drives recently.</p>
                </div>
              ) : (
                drives.map(drive => (
                  <div key={drive.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
                    <div className="relative h-40 bg-zinc-105 dark:bg-zinc-900">
                      <img src={drive.image} alt={drive.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-4 left-4 text-[9px] font-bold px-2 py-0.5 rounded bg-black/75 text-white">
                        Organizer: {drive.organizer}
                      </span>
                    </div>

                    <div className="p-6 text-left space-y-4">
                      <div>
                        <h3 className="font-bold text-sm line-clamp-1">{drive.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{drive.description}</p>
                      </div>

                      <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-500">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="line-clamp-1">{drive.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span>{drive.volunteers.length} Volunteers Registered</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinDrive(drive.id)}
                        className={`w-full py-2 rounded text-xs font-bold transition-all ${
                          drive.volunteers.includes(user.username)
                            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700'
                            : 'bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100'
                        }`}
                      >
                        {drive.volunteers.includes(user.username) ? 'Leave Drive' : 'Join Drive'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {subTab === 'claims' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {claims.length === 0 ? (
                <div className="col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-12 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">No Claims Yet</h3>
                  <p className="text-xs text-zinc-500 mt-1">You haven't claimed any issues yet. Head to the Public Feed to start claiming!</p>
                </div>
              ) : (
                claims.map(claim => (
                  <div key={claim.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
                    <div className="relative h-40 bg-zinc-100 dark:bg-zinc-900">
                      {claim.image && claim.image.startsWith('http') ? (
                        <img src={claim.image} alt={claim.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-zinc-500" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 flex items-center space-x-1 text-[9px] font-bold px-2 py-1 rounded bg-blue-600 text-white">
                        <AlertCircle className="w-3 h-3" />
                        <span>CLAIMED</span>
                      </span>
                    </div>

                    <div className="p-6 text-left space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm line-clamp-1 flex-1">{claim.title}</h3>
                          <span className={`text-[8px] font-bold px-2 py-1 rounded whitespace-nowrap ${
                            claim.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                            claim.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {claim.priority}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{claim.description}</p>
                      </div>

                      <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="line-clamp-1">{claim.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4" />
                          <span>Category: {claim.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4" />
                          <span>Claimed on {new Date(claim.dateClaimed).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => window.location.href = `/public-feed?issue=${claim.id}`}
                        className="w-full py-2 rounded text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-all"
                      >
                        View Issue Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {subTab === 'create' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-sm mb-6">Organize Community Drive</h3>

              <form onSubmit={handleCreateDriveSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold mb-2">Drive Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sector 4 Central Park Cleanup"
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Campaign Description *</label>
                  <textarea
                    required
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tasks, meeting spot, and schedule..."
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold mb-2">Drive Banner Image URL</label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... (optional)"
                      className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">GPS Location Pin *</label>
                    <GpsPicker value={coordinates} onChange={setCoordinates} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Location Address *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gate A Central Park, Sector 4"
                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2 bg-black hover:bg-zinc-900 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded text-xs font-bold transition-all flex items-center space-x-2"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Organize Drive</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
