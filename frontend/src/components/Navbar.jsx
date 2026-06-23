import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, MapPin, Award, LogOut, ShieldAlert, Users, Heart, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Navbar() {
  const { user, darkMode, activeTab, setActiveTab, toggleDarkMode, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Government/Admin': return <ShieldAlert className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />;
      case 'NGO/Volunteer': return <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />;
      case 'Community Hero': return <Heart className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="currentColor" />;
      default: return <Award className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />;
    }
  };

  const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <img src={logoImg} alt="LocalFix Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-700 dark:from-white dark:to-zinc-300 font-sans tracking-tight">
              LocalFix
            </span>
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/50">
              AI Civic
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'landing'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'feed'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
              }`}
            >
              Public Feed & Map
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
              }`}
            >
              Analytics
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'settings'
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center space-x-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-900 transition-all border border-zinc-200/60 dark:border-zinc-800/80"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-zinc-400" /> : <Moon className="w-4.5 h-4.5 text-zinc-600" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-950 p-1.5 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-900">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="hidden lg:block text-left text-[11px] leading-tight">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1">
                      <span>{user.username}</span>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[9px] px-1 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-bold rounded">
                        Lvl {calculateLevel(user.xp)}
                      </span>
                      <span className="text-zinc-500 text-[9px]">{user.xp % 100}/100 XP</span>
                    </div>
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block"></div>

                <button
                  onClick={logout}
                  className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 transition-all duration-200"
              >
                Sign In / Join
              </button>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-900 transition-all border border-zinc-200/60 dark:border-zinc-800/80"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 py-4 space-y-2 flex flex-col transition-all duration-300 animate-in slide-in-from-top-4">
          <button
            onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'landing'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'feed'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
            }`}
          >
            Public Feed & Map
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'analytics'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
            }`}
          >
            Analytics
          </button>
          {user && (
            <>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
                  activeTab === 'settings'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                }`}
              >
                Settings
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
