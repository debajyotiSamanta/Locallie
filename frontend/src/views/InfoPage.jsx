import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, FileText, CheckCircle, AlertTriangle, HelpCircle, Terminal, Cpu, Info, Heart, ArrowLeft, Eye, ShieldAlert, Award } from 'lucide-react';

const TABS = [
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'cookie', label: 'Cookie Policy', icon: Info },
  { id: 'retention', label: 'Data Retention', icon: HelpCircle },
  { id: 'abuse', label: 'Report Abuse', icon: ShieldAlert },
  { id: 'accessibility', label: 'Accessibility', icon: Heart },
  { id: 'opensource', label: 'Open Source', icon: Cpu },
  { id: 'api', label: 'API Documentation', icon: Terminal }
];

export default function InfoPage({ initialTab = 'privacy' }) {
  const { setActiveTab } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSubTab]);

  const renderContent = () => {
    switch (activeSubTab) {
      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Last updated: June 23, 2026</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />
            
            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">1. Introduction</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Welcome to LocalFix ("we," "our," or "us"). We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, store, and process your information when you use our AI-powered hyperlocal problem-solving platform.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">2. Data We Collect</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><strong>Account Data:</strong> Username, email address, password hash, and selected user role.</li>
                <li><strong>Report Data:</strong> Issue titles, descriptions, categories, uploaded images (stored directly in MongoDB as base64 data URLs), and GPS coordinates.</li>
                <li><strong>Reputation Data:</strong> Level, Experience Points (XP), and badges earned through community activities.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">3. How We Use Your Data</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your data is processed to route civic reports to the correct departments, display issues on the public feed and map, prevent spam and duplicate reports using our AI diagnostics, and coordinate volunteers (Community Heroes) to resolve issues.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">4. Anonymous Reporting</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                When you toggle "Report Anonymously", your username and email will not be displayed on public feeds or the map. However, your GPS coordinates and report details will be shared publicly to allow verification and resolution.
              </p>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Terms of Service</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Last updated: June 23, 2026</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">1. Agreement to Terms</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                By accessing or using LocalFix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">2. User Conduct</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Users are solely responsible for all content they submit, including images and text. You agree not to upload false reports, spam, or abusive content. LocalFix reserves the right to suspend accounts violating these conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">3. Gamification and Rewards</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Experience Points (XP) and badges are simulated reputation markers to encourage constructive civic participation. They do not hold any monetary or cash value. Abuse of the gamification engine (e.g. submitting fake resolutions) will lead to immediate account termination.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">4. Limitation of Liability</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                LocalFix is a collaborative platform connecting citizens, volunteers, and municipal departments. We do not guarantee immediate resolution of reported problems and are not liable for physical damages or safety incidents on resolved sites.
              </p>
            </section>
          </div>
        );

      case 'cookie':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Cookie Policy</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Last updated: June 23, 2026</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">1. What Are Cookies?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Cookies are small text files stored on your device when you load websites. We use cookies and browser local storage to maintain session states and user preferences.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">2. Cookies/Storage We Use</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><strong>Authentication State:</strong> `localfix_user` is stored to keep you logged in between visits.</li>
                <li><strong>Visual Settings:</strong> `localfix_theme` records your preference for Dark or Light mode.</li>
                <li><strong>Search History:</strong> Temporary storage keeps your active search query in the feed.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">3. Managing Preferences</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                You can block or delete cookies through your browser settings. Please note that disabling essential local storage keys will prevent you from signing in or maintaining theme choices.
              </p>
            </section>
          </div>
        );

      case 'retention':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Data Retention</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Last updated: June 23, 2026</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">1. Retention Periods</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                We store your account credentials and personal profile as long as your account remains active. Potholes and general community issues remain on the platform as public historical records to assist city planning.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">2. Base64 Image Optimization</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                To maintain database speed and minimize resource foot-printing, uploaded images are compressed and stored directly inside MongoDB as base64 string records. Old or resolved reports might have their image files archived or compressed further after 24 months.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">3. Deleting Your Account</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                You can request profile deletion through Settings. Doing so permanently removes your email and name. Your reported issues will be anonymized to preserve public map integrity.
              </p>
            </section>
          </div>
        );

      case 'abuse':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Report Abuse</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Civic Integrity & Safety</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Flagging Inappropriate Reports</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                LocalFix uses an automated spam moderation filter to detect fake reports. However, if you spot a public report containing inappropriate photos, offensive comments, or false coordinates, please contact our community safety moderators immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Reporting Contact Info</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Email detailed flags containing the Issue ID and proof to <strong>abuse@localfix.org</strong>. All flags are kept strictly confidential.
              </p>
            </section>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Accessibility</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Inclusive Web Interface</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Our Standards</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                LocalFix is designed to be accessible to everyone, following the Web Content Accessibility Guidelines (WCAG 2.1 AA). We include high contrast toggle options, keyboard navigation support, and semantic HTML elements suitable for modern screen readers.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li>Dynamic theme settings allowing immediate contrast switching.</li>
                <li>Clear ARIA labels for buttons and map features.</li>
                <li>Readable typography scales optimized for desktop and mobile displays.</li>
              </ul>
            </section>
          </div>
        );

      case 'opensource':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Open Source</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Community Built Software</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Open Source License</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                LocalFix is open source under the MIT License. Anyone is free to fork, customize, or contribute back to the civic software repositories.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Framework Stack</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This project is built using: Vite, React, Tailwind CSS, Leaflet Maps, Node.js, Express, and MongoDB.
              </p>
            </section>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">API Documentation</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Integrations and Developer Endpoints</p>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-4" />

            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Base URL</h3>
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded text-[11px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto">
                http://localhost:5000/api
              </pre>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">1. Auth Endpoints</h3>
              
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-mono">POST /auth/register</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Register citizen/volunteer accounts.</p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-mono">POST /auth/login</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Login and retrieve local session keys.</p>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">2. Issues Endpoints</h3>
              
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">GET /issues</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Retrieve all registered issues on map and feeds.</p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">POST /issues</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Create a new problem report with coordinate markers and base64 imagery.</p>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Back Button */}
      <button 
        onClick={() => setActiveTab('landing')}
        className="flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-black dark:hover:text-white font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 h-fit space-y-1">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-3">Legal & Info</h3>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
