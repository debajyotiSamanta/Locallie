import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, ChevronDown, ChevronUp, Mail, ExternalLink, Shield, Users, Award, BarChart3, Heart, Phone, Globe } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const faqs = [
  {
    q: 'How does the AI process reported issues?',
    a: 'When a resident files a report, our AI scans the description to auto-categorize, parses uploaded image metadata to verify tags, checks GPS coordinates for duplicate records within 100m radius, and predicts priority routing to the right department.'
  },
  {
    q: 'Who are Community Heroes?',
    a: 'Community Heroes are registered volunteers, contractors, or active residents who claim reported issues, resolve them on the ground, and upload before/after photos to log verified resolutions. They earn XP points and badges as they contribute.'
  },
  {
    q: 'How does the duplicate detection work?',
    a: 'Our AI runs a geo-radius search (100m by default) on every new submission, comparing GPS coordinates with existing open issues in the same category. If a near-duplicate is found, users are alerted before submitting to avoid redundant reports.'
  },
  {
    q: 'What types of issues can I report?',
    a: 'You can report potholes, broken streetlights, garbage accumulation, water leakage, road damage, illegal dumping, public safety concerns, and more. Our AI will auto-categorize your report based on description and images.'
  },
  {
    q: 'How are issues routed to authorities?',
    a: 'After AI classification, issues are dispatched to the relevant municipal departments or NGO volunteers based on category, severity, and location. Community Heroes can also independently claim and resolve issues for faster action.'
  },
  {
    q: 'Is my location data private?',
    a: 'Your GPS coordinates are only used for localizing reports on the map and for the community feed. You can also submit anonymously — your personal details are never shared publicly. Full data privacy controls are in your Settings panel.'
  },
  {
    q: 'How do I earn XP and badges?',
    a: 'XP is earned by submitting verified reports, upvoting confirmed issues, claiming problems as a Community Hero, and successfully resolving tickets with photo evidence. Badges are awarded based on milestone achievements.'
  },
  {
    q: 'Can NGOs and organizations join?',
    a: 'Yes! NGOs and volunteer organizations can register under the NGO/Volunteer role to organize cleanup drives, coordinate volunteer teams, claim civic issues, and log resolution progress in their dedicated dashboard.'
  }
];

export default function Footer() {
  const { setActiveTab } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to know about LocalFix and how it works.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/60 dark:bg-zinc-900/40 transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none group"
                aria-expanded={openFaq === idx}
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors pr-4">
                  {faq.q}
                </span>
                <span className="shrink-0 ml-2 text-zinc-400 dark:text-zinc-500">
                  {openFaq === idx
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />
                  }
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Strip */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-base font-bold">Get Civic Updates in Your Inbox</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Weekly digest of resolved issues, hero spotlights, and city stats.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-5 py-3 rounded-xl">
                <Heart className="w-4 h-4" fill="currentColor" />
                <span>Subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-xl text-xs font-bold shrink-0 transition-all"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand Column */}
            <div className="space-y-4 lg:col-span-1">
              <div
                className="flex items-center space-x-2.5 cursor-pointer"
                onClick={() => setActiveTab('landing')}
              >
                <img src={logoImg} alt="LocalFix Logo" className="w-6 h-6 rounded object-cover" />
                <span className="text-base font-bold tracking-tight">LocalFix</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                AI-Powered Hyperlocal Community Problem Solving Platform. Empowering residents to report, track, and resolve neighborhood issues collaboratively.
              </p>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500">
                <Globe className="w-3.5 h-3.5" />
                <span>Available across India</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500">
                <Phone className="w-3.5 h-3.5" />
                <span>Support: +91 1800-000-CIVIC</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500">
                <Mail className="w-3.5 h-3.5" />
                <span>civic@localfix.in</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-2 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all text-[10px] font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all text-[10px] font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Twitter</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all text-[10px] font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5">Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', tab: 'landing' },
                  { label: 'Public Feed & Map', tab: 'feed' },
                  { label: 'Analytics Dashboard', tab: 'analytics' },
                  { label: 'My Dashboard', tab: 'dashboard' },
                  { label: 'Settings', tab: 'settings' },
                ].map(({ label, tab }) => (
                  <li key={tab}>
                    <button
                      onClick={() => setActiveTab(tab)}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Roles Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5">For Every Role</h4>
              <ul className="space-y-3">
                {[
                  { icon: Users, label: 'Residents — Report Issues' },
                  { icon: Award, label: 'Community Heroes — Resolve' },
                  { icon: Heart, label: 'NGOs — Organize Drives' },
                  { icon: Shield, label: 'Government — Admin Panel' },
                  { icon: BarChart3, label: 'Analysts — View Analytics' },
                ].map(({ icon: Icon, label }, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Icon className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Info Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5">Legal & Info</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', tab: 'privacy' },
                  { label: 'Terms of Service', tab: 'terms' },
                  { label: 'Cookie Policy', tab: 'cookie' },
                  { label: 'Data Retention', tab: 'retention' },
                  { label: 'Report Abuse', tab: 'abuse' },
                  { label: 'Accessibility', tab: 'accessibility' },
                  { label: 'Open Source', tab: 'opensource' },
                  { label: 'API Documentation', tab: 'api' },
                ].map((item) => (
                  <li key={item.tab}>
                    <button
                      onClick={() => setActiveTab(item.tab)}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center sm:text-left">
            © 2026 LocalFix Inc. · AI-Powered Hyperlocal Problem Solving · All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>Made with</span>
            <Heart className="w-3 h-3 inline" fill="currentColor" />
            <span>for civic communities</span>
            <span className="ml-2 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">
              v2.0 Beta
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}
