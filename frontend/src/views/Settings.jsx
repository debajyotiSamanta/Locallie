import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Sliders, Lock, Trash2, Save, Check } from 'lucide-react';

export default function Settings() {
  const { user, showNotification, darkMode } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Form states
  const [profileForm, setProfileForm] = useState({
    username: user?.username || 'jane_doe',
    email: user?.email || 'jane@example.com',
    fullName: 'Jane Doe',
    phone: '+1 (555) 019-2834',
    bio: 'Civic minded citizen looking to improve my local neighborhood environment.'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    whatsappAlerts: true,
    emergencyBroadcasts: true
  });

  const [privacy, setPrivacy] = useState({
    defaultAnonymous: false,
    publicProfile: true,
    shareStats: true
  });

  const [preferences, setPreferences] = useState({
    defaultRadius: '5',
    primaryCategory: 'Road Damage',
    mapProvider: 'OpenStreetMap'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    mfaEnabled: false
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    showNotification('Profile updated successfully!', 'success');
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    showNotification('Notification preferences saved!', 'success');
  };

  const handlePrivacySave = (e) => {
    e.preventDefault();
    showNotification('Privacy settings updated!', 'success');
  };

  const handlePreferencesSave = (e) => {
    e.preventDefault();
    showNotification('App preferences saved!', 'success');
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmNewPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    showNotification('Security credentials updated!', 'success');
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      mfaEnabled: securityForm.mfaEnabled
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action is permanent and all XP/Points will be lost.')) {
      showNotification('Account deletion request queued.', 'info');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-left">
        <Lock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-zinc-500 mt-2">Please log in to manage your account settings.</p>
      </div>
    );
  }

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy Control', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'security', label: 'Security & Active Sessions', icon: Lock }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Account & App Settings</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure profile data, notification channels, privacy defaults, and account credentials.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSubTab(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
                  activeSubTab === section.id
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                    : 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
          
          {/* PROFILE SETTINGS */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Public Profile Info</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Contact Phone (OTP Login)</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Bio / City Notes</label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeSubTab === 'notifications' && (
            <form onSubmit={handleNotificationSave} className="space-y-6">
              <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Notification Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Email Alerts</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Receive digests, clean up drives, and weekly challenges.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">SMS notifications</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Receive critical infrastructure emergency updates on your phone.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Browser Push notifications</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Real-time alerts when issues are claimed, upvoted, or closed.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.pushAlerts}
                    onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">WhatsApp Updates</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Mock verification details and local social news bulletins.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsappAlerts}
                    onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Nearby Emergency Broadcasts</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Urgent municipal safety hazards within 500 meters of your coordinates.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emergencyBroadcasts}
                    onChange={(e) => setNotifications({ ...notifications, emergencyBroadcasts: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Notifications</span>
                </button>
              </div>
            </form>
          )}

          {/* PRIVACY SETTINGS */}
          {activeSubTab === 'privacy' && (
            <form onSubmit={handlePrivacySave} className="space-y-6">
              <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Privacy Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Default to Anonymous Reporting</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Always mask your username when submitting new issue reports.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.defaultAnonymous}
                    onChange={(e) => setPrivacy({ ...privacy, defaultAnonymous: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Public Profile Visibility</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Allow other residents to click your username and see your XP level / unlocked badges.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.publicProfile}
                    onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold">Share Performance Telemetry</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Include anonymous contribution count on municipal analytics reports.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.shareStats}
                    onChange={(e) => setPrivacy({ ...privacy, shareStats: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Privacy Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* APP PREFERENCES */}
          {activeSubTab === 'preferences' && (
            <form onSubmit={handlePreferencesSave} className="space-y-6">
              <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Platform Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold mb-2">Default Geofence Search Radius (km)</label>
                  <select
                    value={preferences.defaultRadius}
                    onChange={(e) => setPreferences({ ...preferences, defaultRadius: e.target.value })}
                    className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="1">1 km</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">Primary Civic Category Filter</label>
                  <select
                    value={preferences.primaryCategory}
                    onChange={(e) => setPreferences({ ...preferences, primaryCategory: e.target.value })}
                    className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="Road Damage">Road Damage</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Fallen Trees">Fallen Trees</option>
                    <option value="Public Safety">Public Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">Default Map Provider</label>
                  <select
                    value={preferences.mapProvider}
                    onChange={(e) => setPreferences({ ...preferences, mapProvider: e.target.value })}
                    className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="OpenStreetMap">OpenStreetMap (Default)</option>
                    <option value="GoogleMaps">Google Maps API</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* ACCOUNT SECURITY */}
          {activeSubTab === 'security' && (
            <div className="space-y-8">
              <form onSubmit={handleSecuritySave} className="space-y-6">
                <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Update Password</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2">New Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.confirmNewPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmNewPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                  <div>
                    <span className="block text-xs font-bold font-sans">Multi-Factor Authentication (MFA)</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Toggle phone OTP multi-factor checks during system login.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityForm.mfaEnabled}
                    onChange={(e) => setSecurityForm({ ...securityForm, mfaEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-black bg-zinc-100 border-zinc-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Security</span>
                  </button>
                </div>
              </form>

              {/* Active Sessions */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Active Browser Sessions</h3>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="block font-bold">Chrome on Windows (Current Session)</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">Metro City • IP: 192.168.1.104</span>
                  </div>
                  <span className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Active</span>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200/60 dark:border-red-950 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-red-650 dark:text-red-500 uppercase tracking-wide">Danger Zone</h4>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-xs">
                    <span className="block font-bold text-zinc-800 dark:text-zinc-200">Delete Civic Profile</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">This removes all contributions, resolves logs, and XP gamification statistics.</span>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 border border-red-250 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
