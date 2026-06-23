import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import LandingPage from './views/LandingPage';
import PublicFeed from './views/PublicFeed';
import ResidentDashboard from './views/ResidentDashboard';
import HeroDashboard from './views/HeroDashboard';
import NGODashboard from './views/NGODashboard';
import AdminDashboard from './views/AdminDashboard';
import Settings from './views/Settings';
import AnalyticsDashboard from './views/AnalyticsDashboard';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

function MainAppContent() {
  const { user, activeTab, globalNotification } = useAuth();

  // Dynanically Route Dashboard based on User Role
  const renderDashboard = () => {
    if (!user) return <ResidentDashboard />; // Redirects to Login Form

    switch (user.role) {
      case 'Government/Admin':
        return <AdminDashboard />;
      case 'Community Hero':
        return <HeroDashboard />;
      case 'NGO/Volunteer':
        return <NGODashboard />;
      default:
        return <ResidentDashboard />;
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'feed':
        return <PublicFeed />;
      case 'dashboard':
        return renderDashboard();
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      
      {/* Navigation Menu */}
      <Navbar />
      
      {/* Main Viewport Content */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Sitewide Footer */}
      <Footer />

      {/* Floating AI Agent Assistant */}
      <Chatbot />

      {/* Dynamic Toast Alert Popups */}
      {globalNotification && (
        <div className="fixed top-20 right-6 z-50 transition-all duration-300">
          <div className="flex items-center space-x-3 px-5 py-3.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white">
            {globalNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-white shrink-0" />}
            {globalNotification.type === 'error' && <AlertCircle className="w-5 h-5 text-zinc-900 dark:text-white shrink-0" />}
            {globalNotification.type !== 'success' && globalNotification.type !== 'error' && <Info className="w-5 h-5 text-zinc-900 dark:text-white shrink-0" />}
            <span>{globalNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
