import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Brain, GraduationCap, Layers, MessageSquare, 
  Shield, LogOut, LayoutGrid, Sun, Moon, AlertCircle, FileText, 
  Menu, X, Landmark, RefreshCw, ChevronDown, ChevronRight, Bookmark, Play, HelpCircle,
  Terminal, Code2
} from 'lucide-react';
import AuthModal, { GoogleIcon } from './components/AuthModal.js';
import Dashboard from './components/Dashboard.js';
import DocumentViewer from './components/DocumentViewer.js';
import AIChat from './components/AIChat.js';
import TeacherPanel from './components/TeacherPanel.js';
import ExamSimulator from './components/ExamSimulator.js';
import FlashcardsViewer from './components/FlashcardsViewer.js';
import AdminAnalytics from './components/AdminAnalytics.js';
import CommunityForum from './components/CommunityForum.js';
import CertificatesShowcase from './components/CertificatesShowcase.js';
import AboutUs from './components/AboutUs.js';
import LinuxSimulator from './components/LinuxSimulator.js';
import PythonSimulator from './components/PythonSimulator.js';
import { Document, StudentProgress, CategoryName, CATEGORIES } from './types.js';
import { SIDEBAR_CATEGORIES } from './data/chapters.js';
import netLearnLogo from './assets/images/net_learn_logo_1784436382187.jpg';

export default function App() {
  const darkMode = false;
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nexalearn_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed parsing saved user', e);
    }
    // Default guest profile is student joshua so everything works instantly
    return {
      id: 'usr_student',
      email: 'student@netlearn.ai',
      username: 'Guest Student',
      role: 'student',
      isVerified: true
    };
  });
  
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('nexalearn_token') || 'mock_jwt_usr_student';
  });
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'google' | 'standard'>('google');
  
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Scoping triggers
  const [navFilterCategory, setNavFilterCategory] = useState<CategoryName | undefined>(undefined);
  const [navFilterDocId, setNavFilterDocId] = useState<string | undefined>(undefined);
  const [navSearchQuery, setNavSearchQuery] = useState<string | undefined>(undefined);

  // Collapsible left sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Networking': true,
    'Linux': false
  });

  // Core Datasets synced from DB
  const [documents, setDocuments] = useState<Document[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReadingDocument, setIsReadingDocument] = useState(false);

  // Sync effect for light/dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Ensure that when app is opened or refreshed, it always shows the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // When active tab changes, scroll back to the top smoothly and reset reading state
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (activeTab !== 'documents') {
      setIsReadingDocument(false);
    }
  }, [activeTab]);

  // Load documents and progress when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Fetch documents
      const docRes = await fetch('/api/documents');
      if (docRes.ok) {
        const docText = await docRes.text();
        try {
          const docData = JSON.parse(docText);
          if (docData && Array.isArray(docData.documents)) {
            setDocuments(docData.documents);
          }
        } catch (jsonErr) {
          console.warn('Could not parse documents JSON:', jsonErr);
        }
      }

      // Fetch student progress
      if (user?.id) {
        const progressRes = await fetch(`/api/student/progress?userId=${user.id}`);
        if (progressRes.ok) {
          const progressText = await progressRes.text();
          try {
            const progressData = JSON.parse(progressText);
            if (progressData && progressData.progress) {
              setProgress(progressData.progress);
            }
          } catch (jsonErr) {
            console.warn('Could not parse student progress JSON:', jsonErr);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user core datasets:', err);
    }
  };

  const handleAuthSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('nexalearn_user', JSON.stringify(userData));
    localStorage.setItem('nexalearn_token', userToken);
    setShowAuthOverlay(false);
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    const guestUser = {
      id: 'usr_student',
      email: 'student@netlearn.ai',
      username: 'Guest Student',
      role: 'student',
      isVerified: true
    };
    setUser(guestUser);
    setToken('mock_jwt_usr_student');
    localStorage.removeItem('nexalearn_user');
    localStorage.removeItem('nexalearn_token');
    setProgress(null);
    setActiveTab('dashboard');
  };

  const handleToggleBookmark = async (docId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/documents/${docId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, bookmarks: data.document?.bookmarks || data.bookmarks || [] } : d));
      }
    } catch (err) {
      console.error('Bookmark toggle issue:', err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        loadUserData();
      }
    } catch (err) {
      console.error('Delete document issue:', err);
    }
  };

  const handleNavigateToSection = (section: string, filterCategory?: CategoryName, filterDocId?: string, searchQuery?: string) => {
    setNavFilterCategory(filterCategory);
    setNavFilterDocId(filterDocId);
    setNavSearchQuery(searchQuery);
    setActiveTab(section);
    setMobileMenuOpen(false);
  };



  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Map of active tab indicators for primary header items (NET LEARN layout)
  const mainNavItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'documents', label: 'Learn' },
    { id: 'exams', label: 'Practice' },
    { id: 'ai_chat', label: 'NIT AI' },
    { id: 'community', label: 'Community' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'about', label: 'About' }
  ];

  const handleTopMenuNavigate = (id: string) => {
    handleNavigateToSection(id);
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-[#0b1116] text-slate-200' : 'bg-gray-50 text-gray-900'} flex flex-col transition-colors duration-300`}>

      {/* 1. STICKY TOP NAVIGATION BAR (W3Schools visual layout alignment) */}
      <header className={`sticky top-0 z-50 h-16 border-b flex items-center justify-between px-6 backdrop-blur-xl transition-all ${
        darkMode ? 'bg-[#0f171e]/90 border-white/[0.04]' : 'bg-white/90 border-gray-200 shadow-sm'
      }`}>
        
        {/* Brand identity (Left) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all" onClick={() => handleNavigateToSection('dashboard')}>
            <img 
              src={netLearnLogo} 
              alt="NETECH Logo" 
              className="w-10 h-10 object-contain rounded-xl shadow-sm border border-emerald-500/20"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
            />
            <div className="flex flex-col text-left">
              <span className={`font-display font-black text-lg tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                NETECH
              </span>
            </div>
          </div>

          <span className="text-gray-500/30">|</span>
          
          {/* Collapsible Left Sidebar Trigger Button (Desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer hidden lg:flex items-center gap-1 ${
              sidebarOpen 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-white/[0.02] dark:bg-black/15 text-gray-400 border-white/5'
            }`}
            title="Toggle Sidebar Curriculum"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{sidebarOpen ? 'Hide Syllabus Index' : 'Show Syllabus Index'}</span>
          </button>
        </div>

        {/* 3. STICKY TOP NAVIGATION LIST (W3Schools center routing bar) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#121b22]/30 p-1 rounded-xl border border-white/[0.03]">
          {mainNavItems.map(item => {
            let isActive = activeTab === item.id;
            if (item.id === 'courses' && activeTab === 'documents' && !navFilterDocId) isActive = true;
            if (item.id === 'documents' && activeTab === 'documents' && navFilterDocId) isActive = true;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTopMenuNavigate(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {user.role === 'admin' && (
            <button
              onClick={() => handleNavigateToSection('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-dashed ml-1 ${
                activeTab === 'admin'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-sm'
                  : 'border-purple-500/15 text-purple-400 hover:text-white hover:bg-purple-500/5'
              }`}
            >
              Admin Controls
            </button>
          )}
        </nav>

        {/* Global Controls & Theme options (Right) */}
        <div className="flex items-center gap-3">
          {/* Sync Button */}
          <button
            onClick={loadUserData}
            className="p-2 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-white/5 text-gray-400 cursor-pointer transition-all active:scale-95"
            title="Refresh Curriculum Materials"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Sign in / Access Badge */}
          {user.id !== 'usr_student' ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <span className="hidden md:inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold bg-purple-500/10 border border-purple-500/25 text-purple-300 uppercase tracking-wider font-mono">
                  Admin: {user.username}
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user.username}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 flex items-center gap-1 cursor-pointer transition-colors"
                title="Sign out of session"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthInitialTab('google');
                  setShowAuthOverlay(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Sign in or create account with Google (Gmail)"
                id="btn-nav-google-auth"
              >
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold text-xs">Google Login</span>
              </button>
              <button
                onClick={() => {
                  setAuthInitialTab('standard');
                  setShowAuthOverlay(true);
                }}
                className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                id="btn-nav-standard-auth"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-100" /> Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden rounded-xl border border-white/10 text-gray-400 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER HORIZONTAL NAV (W3Schools Subject List) */}
      <div className="bg-[#1D2A35] text-white overflow-x-auto whitespace-nowrap border-b border-white/[0.04] py-1.5 px-6 text-xs font-semibold flex items-center justify-start gap-4 scrollbar-thin no-scrollbar">
        {[
          { name: 'HTML', category: 'Programming', docId: 'prog_1' },
          { name: 'CSS', category: 'Programming', docId: 'prog_1' },
          { name: 'JAVASCRIPT', category: 'Programming', docId: 'prog_1' },
          { name: 'C PROGRAMMING', category: 'C Programming', docId: 'c_prog_1' },
          { name: 'PYTHON', category: 'Programming', docId: 'prog_1', action: () => handleNavigateToSection('python_sim') },
          { name: 'DATABASE', category: 'Database', docId: 'db_1' },
          { name: 'LINUX', category: 'Linux', docId: 'lin_1', action: () => handleNavigateToSection('linux_sim') },
          { name: 'NETWORKING', category: 'Networking', docId: 'net_1' },
          { name: 'CYBER SECURITY', category: 'Cyber Security', docId: 'sec_1' },
          { name: 'WINDOW SERVER', category: 'Window Server', docId: 'win_1' },
          { name: 'CLOUD COMPUTING', category: 'Cloud Computing', docId: 'cloud_1' },
          { name: 'AI', category: 'AI', docId: 'ai_1' },
          { name: 'MACHINE LEARNING', category: 'Machine Learning', docId: 'ml_1', action: () => handleNavigateToSection('python_sim') },
          { name: 'FIBER OPTICS', category: 'Fiber Optics', docId: 'fib_1' },
          { name: 'WIRELESS INDOOR', category: 'Wireless Indoor', docId: 'win_indoor_1' },
          { name: 'WIRELESS OUTDOOR', category: 'Wireless Outdoor', docId: 'w_out_1' },
          { name: 'IOT SYSTEM DEVELOPMENT', category: 'IoT System Development', docId: 'iot_dev_1' },
          { name: 'IOT SYSTEM INSTALLATION', category: 'IoT System Installation', docId: 'iot_inst_1' },
          { name: 'VOIP', category: 'VoIP', docId: 'voip_1' },
          { name: 'ZERO CLIENT WITH N COMPUTING', category: 'Zero Client with NComputing', docId: 'zc_1' },
          { name: 'TECHNICAL DRAWING', category: 'Technical Drawing', docId: 'td_1' },
          { name: 'MATHEMATICS', category: 'Mathematics', docId: 'math_1' },
          { name: 'PHYSICS', category: 'Physics', docId: 'phys_1' },
          { name: 'ELECTRONICS', category: 'Electronics', docId: 'elec_1' },
          { name: 'ELECTRICITY', category: 'Electricity', docId: 'elct_1' },
        ].map((sub) => (
          <button
            key={sub.name}
            onClick={() => {
              if (sub.action) {
                sub.action();
              } else {
                handleNavigateToSection('documents', sub.category as any);
              }
            }}
            className="px-3 py-1 hover:bg-emerald-600/30 hover:text-emerald-400 rounded text-[11px] font-bold tracking-wide uppercase transition-colors duration-150 cursor-pointer"
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md lg:hidden pt-20 px-6 space-y-4 animate-fade-in text-left">
          <div className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest border-b border-white/5 pb-2">NETECH Sections</div>
          {mainNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTopMenuNavigate(item.id)}
              className={`w-full p-3.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === item.id ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          
          {user.role === 'admin' && (
            <button
              onClick={() => handleNavigateToSection('admin')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold text-purple-400 ${
                activeTab === 'admin' ? 'bg-purple-600 text-white' : 'border border-dashed border-purple-500/20'
              }`}
            >
              Admin Analytics
            </button>
          )}

          <div className="border-t border-white/5 pt-4">
            {user.role === 'admin' ? (
              <button
                onClick={handleLogout}
                className="w-full p-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 flex items-center gap-2 justify-center cursor-pointer"
              >
                Logout Administrator
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthInitialTab('google');
                  setShowAuthOverlay(true);
                }}
                className="w-full p-3 rounded-xl text-xs font-bold bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 flex items-center gap-2 justify-center cursor-pointer shadow-lg"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Login or Sign Up with Google (Gmail)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. SIGN IN / REGISTRATION MODAL OVERLAY */}
      {showAuthOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthOverlay(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-900 transition-all z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <AuthModal 
              darkMode={darkMode} 
              onSuccess={handleAuthSuccess} 
              onClose={() => setShowAuthOverlay(false)} 
              initialTab={authInitialTab}
            />
          </div>
        </div>
      )}

      {/* 6. COMPREHENSIVE SPLIT-VIEW (Sidebar + Content Workspace) */}
      <div className="flex-1 flex items-stretch w-full overflow-hidden relative">
        
        {/* 6A. COLLAPSIBLE LEFT SIDEBAR (The 10 key categories + Syllabus domains) */}
        <aside className={`shrink-0 transition-all duration-300 border-r text-left overflow-y-auto relative z-30 ${
          sidebarOpen && !(activeTab === 'documents' && isReadingDocument)
            ? 'w-64 border-gray-200/50 dark:border-white/[0.04]' 
            : 'w-0 border-transparent overflow-hidden'
        } ${
          darkMode ? 'bg-[#0f171e]' : 'bg-white'
        } scrollbar-thin ${(activeTab === 'documents' && isReadingDocument) ? 'hidden' : 'hidden lg:block'}`}>
          <div className="p-4 flex flex-col space-y-4 h-full">
            
            {/* Part 1: The 10 Key Educational Resources (Collapsible/Reactive List) */}
            <div className="space-y-1">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest pl-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Educational Resources
              </span>
              <div className="space-y-1 pt-1.5">
                {[
                  { id: 'dashboard', label: 'Study Hub', action: () => handleNavigateToSection('dashboard') },
                  { id: 'linux_sim', label: '🖥️ Linux OS Simulator', action: () => handleNavigateToSection('linux_sim') },
                  { id: 'python_sim', label: '🐍 Python & ML Runner', action: () => handleNavigateToSection('python_sim') },
                  { id: 'notes', label: 'Notes and Highlights', action: () => handleNavigateToSection('documents') },
                  { id: 'modules', label: 'Modules and Lessons', action: () => handleNavigateToSection('documents') },
                  { id: 'practice', label: 'Practice Questions', action: () => handleNavigateToSection('flashcards') },
                  { id: 'quizzes', label: 'Quizzes Mode', action: () => handleNavigateToSection('exams') },
                  { id: 'exams_sim', label: 'Exams Simulator', action: () => handleNavigateToSection('exams') },
                  { id: 'resources', label: 'Resources Library', action: () => handleNavigateToSection('documents') },
                  { id: 'videos_view', label: 'Video Lectures', action: () => handleNavigateToSection('videos') },
                  { id: 'discussions', label: 'Peer Discussions', action: () => handleNavigateToSection('community') },
                  { id: 'ai_tutor_chat', label: 'NIT AI', action: () => handleNavigateToSection('ai_chat') },
                ].map((item) => {
                  let isCurrent = false;
                  if (item.id === 'dashboard' && activeTab === 'dashboard') isCurrent = true;
                  if (item.id === 'linux_sim' && activeTab === 'linux_sim') isCurrent = true;
                  if (item.id === 'python_sim' && activeTab === 'python_sim') isCurrent = true;
                  if (item.id === 'modules' && activeTab === 'documents') isCurrent = true;
                  if (item.id === 'practice' && activeTab === 'flashcards') isCurrent = true;
                  if (item.id === 'quizzes' && activeTab === 'exams') isCurrent = true;
                  if (item.id === 'videos_view' && activeTab === 'videos') isCurrent = true;
                  if (item.id === 'discussions' && activeTab === 'community') isCurrent = true;
                  if (item.id === 'ai_tutor_chat' && activeTab === 'ai_chat') isCurrent = true;

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? (darkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm' : 'bg-teal-50 text-teal-750 border border-teal-200')
                          : (darkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-slate-700 hover:text-slate-900')
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper Widget Removed */}
          </div>
        </aside>

        {/* 6B. MAIN WORKSPACE / CONTENT COLUMN */}
        <main className={`flex-1 overflow-y-auto relative w-full ${
          (activeTab === 'documents' && isReadingDocument)
            ? 'max-w-full p-2 sm:p-4 lg:p-6'
            : 'max-w-7xl mx-auto p-5 sm:p-8'
        }`}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              progress={progress} 
              documents={documents} 
              onNavigateToSection={handleNavigateToSection} 
              onRefresh={loadUserData} 
              darkMode={darkMode} 
              username={user.username} 
              onOpenAuth={() => {
                setAuthInitialTab('google');
                setShowAuthOverlay(true);
              }}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentViewer 
              documents={documents} 
              onUpload={loadUserData} 
              onDelete={handleDeleteDocument} 
              onToggleBookmark={handleToggleBookmark} 
              onNavigateToSection={handleNavigateToSection} 
              userId={user.id} 
              activeCategoryFilter={navFilterCategory}
              activeDocFilter={navFilterDocId}
              initialSearchQuery={navSearchQuery}
              darkMode={darkMode} 
              userRole={user.role}
              sidebarOpen={sidebarOpen}
              onViewingDocChange={setIsReadingDocument}
            />
          )}

          {activeTab === 'ai_chat' && (
            <AIChat 
              userId={user.id} 
              documents={documents} 
              initialDocId={navFilterDocId}
              darkMode={darkMode} 
            />
          )}

          {activeTab === 'teacher' && (
            <TeacherPanel 
              userId={user.id} 
              darkMode={darkMode} 
            />
          )}

          {activeTab === 'exams' && (
            <ExamSimulator 
              userId={user.id} 
              documents={documents} 
              initialDocId={navFilterDocId}
              onQuizSubmit={loadUserData} 
              darkMode={darkMode} 
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsViewer 
              userId={user.id} 
              documents={documents} 
              initialDocId={navFilterDocId}
              darkMode={darkMode} 
            />
          )}

          {activeTab === 'community' && (
            <CommunityForum 
              darkMode={darkMode} 
              userId={user.id} 
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesShowcase 
              darkMode={darkMode} 
              progress={progress} 
              documents={documents} 
              username={user.username} 
            />
          )}

          {activeTab === 'about' && (
            <AboutUs 
              darkMode={darkMode} 
            />
          )}

          {activeTab === 'linux_sim' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Linux OS Terminal Simulator
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                    Ubuntu 24.04 LTS environment with interactive bash commands, filesystem navigation, nginx log auditing, and system telemetry
                  </p>
                </div>
                <button
                  onClick={() => handleNavigateToSection('documents', 'Linux')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-all cursor-pointer shadow-sm shrink-0"
                >
                  View Linux Curriculum &gt;
                </button>
              </div>
              <LinuxSimulator darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'python_sim' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Python & Machine Learning Execution Simulator
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                    Write and execute Python 3.12, train linear regressions, plot scatter charts, inspect confusion matrices, and evaluate neural net convergence
                  </p>
                </div>
                <button
                  onClick={() => handleNavigateToSection('documents', 'Machine Learning')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-all cursor-pointer shadow-sm shrink-0"
                >
                  View ML Curriculum &gt;
                </button>
              </div>
              <PythonSimulator darkMode={darkMode} initialTemplateId="ml_regression" />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Academic Video Lectures
                </h2>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                  Stream high-quality recorded sessions covering core networking and server administration domains
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'vid_1', title: 'OSI 7-Layer Model Architecture Explained', duration: '14:20', instructor: 'Instructor Joshua', views: '2.4K views', category: 'Networking' },
                  { id: 'vid_2', title: 'Cisco Router Configuration & VLAN Subnetting', duration: '22:15', instructor: 'Instructor Joshua', views: '1.9K views', category: 'Networking' },
                  { id: 'vid_3', title: 'Linux Filesystem Hierarchy & Basic Pipes', duration: '18:40', instructor: 'Eric S.', views: '1.2K views', category: 'Linux' },
                  { id: 'vid_4', title: 'Active Directory Domain Setup in Windows Server', duration: '28:50', instructor: 'Kevin M.', views: '840 views', category: 'Window Server' },
                  { id: 'vid_5', title: 'WPA3 Wireless Handshakes & Security Key Exchanges', duration: '16:10', instructor: 'Eng. Neza Mugabo', views: '3.1K views', category: 'Cyber Security' }
                ].map((vid) => (
                  <div key={vid.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-150 shadow-sm'} space-y-3`}>
                    <div className="aspect-video w-full rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      <div className="p-3 bg-teal-500 rounded-full text-white shadow-md z-20 group-hover:scale-110 transition-all cursor-pointer">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-[10px] font-mono font-bold text-white rounded z-20">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400">
                        {vid.category}
                      </span>
                      <h3 className={`font-display font-black text-xs sm:text-sm tracking-tight leading-snug ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {vid.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                        <span>{vid.instructor}</span>
                        <span>{vid.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <AdminAnalytics 
              userId={user.id} 
              documents={documents} 
              onRefreshDocs={loadUserData} 
              darkMode={darkMode} 
            />
          )}
        </main>

      </div>
    </div>
  );
}
