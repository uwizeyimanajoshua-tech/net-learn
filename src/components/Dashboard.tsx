import React, { useState } from 'react';
import { 
  BookOpen, Award, Zap, ArrowRight, Bookmark, Compass, 
  BarChart, RefreshCw, FileText, Search, MessageSquare, 
  GraduationCap, Layers, Sparkles, Check, ChevronRight, MessageCircle, HelpCircle, Flame, Star, Shield,
  Terminal, Code2, Cpu, Activity
} from 'lucide-react';
import { StudentProgress, Document, CategoryName, CATEGORIES } from '../types.js';
import ImageCarousel from './ImageCarousel.js';
import netLearnLogo from '../assets/images/net_learn_logo_1784436382187.jpg';

interface DashboardProps {
  progress: StudentProgress | null;
  documents: Document[];
  onNavigateToSection: (section: string, filterCategory?: CategoryName, filterDocId?: string, searchQuery?: string) => void;
  onRefresh: () => void;
  darkMode: boolean;
  username: string;
  onOpenAuth?: () => void;
}

export default function Dashboard({ progress, documents, onNavigateToSection, onRefresh, darkMode, username, onOpenAuth }: DashboardProps) {
  const [localSearch, setLocalSearch] = useState('');
  
  const completedCount = progress?.studiedModules?.length || 0;
  const totalDocs = documents.length;
  const quizScores = progress?.quizScores || [];
  
  // Calculate Average score
  const avgQuizScore = quizScores.length > 0 
    ? Math.round((quizScores.reduce((acc, q) => acc + (q.score / q.maxScore), 0) / quizScores.length) * 100)
    : 0;

  // Find bookmarked documents
  const bookmarks = documents.filter(doc => progress?.userId && doc.bookmarks?.includes(progress.userId));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onNavigateToSection('documents', undefined, undefined, localSearch.trim());
    }
  };

  const popularCourses = [
    { name: 'Networking', count: documents.filter(d => d.category === 'Networking').length, color: 'from-teal-700 to-teal-500', desc: 'Router, Switched VLANs, OSI layers, IPv4/IPv6, & OSPF routing guides.' },
    { name: 'Linux', count: documents.filter(d => d.category === 'Linux').length, color: 'from-slate-700 to-slate-900', desc: 'GNU filesystems, bash scripting commands, permissions, & cron utilities.' },
    { name: 'Window Server', count: documents.filter(d => d.category === 'Window Server' || d.category === 'Windows Server').length, color: 'from-blue-700 to-indigo-600', desc: 'Active Directory, Domain Controllers, GPOs, & Windows Server 2022 administration.' },
    { name: 'Cyber Security', count: documents.filter(d => d.category === 'Cyber Security').length, color: 'from-blue-600 to-teal-600', desc: 'Stateful firewalls, packet filters, cryptography protocols, & penetration logs.' },
    { name: 'Database', count: documents.filter(d => d.category === 'Database' || d.category === 'Databases').length, color: 'from-blue-500 to-cyan-600', desc: 'Relational schema designs, SQL queries, B-Tree indexes, and normalizations.' },
    { name: 'Cloud Computing', count: documents.filter(d => d.category === 'Cloud Computing').length, color: 'from-amber-600 to-orange-600', desc: 'AWS VPC subnets, Docker virtual containers, and Kubernetes pods.' },
    { name: 'AI', count: documents.filter(d => d.category === 'AI' || d.category === 'Artificial Intelligence').length, color: 'from-purple-600 to-indigo-600', desc: 'Deep learning neural networks, Transformer LLM architectures, and RAG systems.' },
    { name: 'C Programming', count: documents.filter(d => d.category === 'C Programming').length, color: 'from-emerald-700 to-teal-600', desc: 'Pointers, memory management (malloc/free), structs, and embedded microcontroller systems.' },
    { name: 'Wireless Indoor', count: documents.filter(d => d.category === 'Wireless Indoor' || d.category === 'Wireless Networking').length, color: 'from-cyan-600 to-blue-600', desc: 'Wi-Fi 6 OFDMA, high-density indoor AP planning, 1024-QAM, and WPA3 security.' },
    { name: 'Wireless Outdoor', count: documents.filter(d => d.category === 'Wireless Outdoor').length, color: 'from-teal-600 to-emerald-700', desc: 'Point-to-Point (PtP) & PtMP links, Fresnel zone clearances, and outdoor tower grounding.' },
    { name: 'IoT System Development', count: documents.filter(d => d.category === 'IoT System Development' || d.category === 'IoT').length, color: 'from-green-600 to-teal-600', desc: 'ESP32 microcontrollers, MQTT pub/sub brokers, sensor buses, and FreeRTOS firmware.' },
    { name: 'IoT System Installation', count: documents.filter(d => d.category === 'IoT System Installation').length, color: 'from-amber-700 to-yellow-600', desc: 'Industrial 4-20mA current loops, DIN rail mounting, IP67 enclosures, and sensor calibration.' },
    { name: 'VoIP', count: documents.filter(d => d.category === 'VoIP').length, color: 'from-indigo-600 to-blue-500', desc: 'SIP session initiation, RTP audio codec transport, and voice QoS traffic marking.' },
    { name: 'Zero Client with NComputing', count: documents.filter(d => d.category === 'Zero Client with NComputing').length, color: 'from-slate-600 to-gray-800', desc: 'Multi-user virtual desktop deployment, vSpace Pro server setup, and UXP protocol.' },
    { name: 'Technical Drawing', count: documents.filter(d => d.category === 'Technical Drawing').length, color: 'from-orange-600 to-amber-600', desc: 'Orthographic projections, sectional isometric views, and GD&T tolerancing.' },
    { name: 'Mathematics', count: documents.filter(d => d.category === 'Mathematics').length, color: 'from-violet-600 to-purple-700', desc: 'Calculus derivatives, linear algebra matrices, eigenvalues, and Boolean logic.' },
    { name: 'Physics', count: documents.filter(d => d.category === 'Physics').length, color: 'from-sky-600 to-indigo-700', desc: 'Newtonian mechanics, electromagnetism, Maxwell equations, and wave optics.' },
    { name: 'Electronics', count: documents.filter(d => d.category === 'Electronics').length, color: 'from-red-600 to-rose-700', desc: 'PN junction diodes, BJT and MOSFET switching transistors, and Op-Amps.' },
    { name: 'Electricity', count: documents.filter(d => d.category === 'Electricity').length, color: 'from-yellow-600 to-amber-700', desc: 'Ohm & Kirchhoff laws, AC complex impedance, power factor, and three-phase safety.' }
  ];

  const testimonials = [
    { name: 'Joshua K.', role: 'IT Support Engineer Student (Kigali)', text: 'NETECH changed how I prepare for my CCNA exams! The NIT AI Packet Tracer labs and interactive flashcards helped me pass my syllabus modules.', rating: 5 },
    { name: 'Amina U.', role: 'Junior Linux Administrator (Gisenyi)', text: 'W3Schools has always been my go-to for reference, but NETECH gives us personalized NIT AI mentorship sessions grounded in our exact syllabus! The sandbox console simulations are incredible.', rating: 5 },
    { name: 'Damien N.', role: 'Computer Science Major (Butare)', text: 'Being able to take quick practice quizzes generated on demand for our technical drawings and databases is a complete game-changer.', rating: 5 }
  ];

  const featuredDocs = documents.slice(0, 3);

  return (
    <div className={`space-y-12 animate-fade-in text-left ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
      
      {/* 1. HERO SECTION */}
      <div className={`relative rounded-[2.5rem] overflow-hidden p-8 sm:p-16 border transition-all ${
        darkMode ? 'bg-gradient-to-br from-teal-950/20 via-slate-900 to-slate-950 border-white/[0.03]' : 'bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border-teal-100 text-teal-950'
      }`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
            darkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-teal-100 text-teal-900 border border-teal-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-teal-500" />
            Interactive Tech & IT Labs
          </span>
          
          <h1 className={`font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] ${
            darkMode ? 'text-white' : 'text-teal-950'
          }`}>
            Learn Tech & Skills with NETECH
          </h1>
          
          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium ${
            darkMode ? 'text-gray-300' : 'text-teal-900/90'
          }`}>
            Free syllabus textbooks, interactive Packet Tracer configurations, Bash sandbox runtimes, and RAG search. Pick a topic and start studying instantly—no signup needed!
          </p>

          {/* 2. SEARCH EVERYTHING */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-stretch gap-2.5 pt-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search our syllabus library, e.g. Linux commands, routing..."
                className={`w-full text-sm rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 transition-all font-semibold shadow-inner ${
                  darkMode 
                    ? 'bg-slate-950/90 text-white border border-slate-800/60 focus:ring-teal-500/50' 
                    : 'bg-white text-gray-900 border border-gray-300 focus:ring-teal-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold px-8 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
            >
              Search
            </button>
          </form>

          {/* Search suggestions chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold">
            <span className={darkMode ? 'text-gray-500' : 'text-teal-900/60'}>Try searching:</span>
            {['OSPF', 'VLAN', 'chmod', 'Active Directory', 'SQL Joins'].map(term => (
              <button
                key={term}
                onClick={() => { setLocalSearch(term); onNavigateToSection('documents', undefined, undefined, term); }}
                className={`px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-900/50 border-white/5 text-gray-400 hover:text-white hover:border-teal-500/30' 
                    : 'bg-white border-teal-200 text-teal-800 hover:bg-teal-50'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Student Google Sign-In Callout */}
          {username === 'Guest Student' && onOpenAuth && (
            <div className="pt-3 flex justify-center">
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md text-xs font-bold transition-all cursor-pointer hover:scale-102 active:scale-98"
                id="btn-dashboard-signin"
              >
                <Shield className="w-4 h-4 text-emerald-200" />
                <span>Save your lab scores & certifications — Sign In</span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-extrabold">Free</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. STUDENT STATISTICS - COMPACT KPI GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-gray-200/10 dark:border-gray-800/40">
          <h3 className={`font-display font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Study Progress Indicators
          </h3>
          <button
            onClick={onRefresh}
            className={`p-1.5 px-3 rounded-lg border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              darkMode 
                ? 'bg-slate-900 border-white/5 text-gray-400 hover:text-white' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <RefreshCw className="w-3 h-3 animate-spin-hover" /> Sync My Stats
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Studied Modules</p>
                <h4 className={`text-xl font-black font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {completedCount} <span className="text-xs text-gray-400 font-normal">of {totalDocs || 5}</span>
                </h4>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quiz Mastery</p>
                <h4 className={`text-xl font-black font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {avgQuizScore}% <span className="text-xs text-gray-400 font-normal">average</span>
                </h4>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">NIT AI Sessions</p>
                <h4 className={`text-xl font-black font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {progress?.aiUsageCount || 12} <span className="text-xs text-gray-400 font-normal">consultations</span>
                </h4>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Study Streak</p>
                <h4 className={`text-xl font-black font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {completedCount > 0 ? completedCount * 2 + 1 : 4} <span className="text-xs text-gray-400 font-normal">days active</span>
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3.5 INTERACTIVE OS & CODE SIMULATORS */}
      <div className="space-y-4">
        <div className="border-b pb-3 border-gray-200/10 dark:border-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className={`font-display font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Virtual System Simulators & Interactive Labs
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Practice hands-on Linux system administration and execute Python & Machine Learning models right in your browser.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            ● Ready to Run
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Linux Simulator Feature Card */}
          <div 
            onClick={() => onNavigateToSection('linux_sim')}
            className={`p-6 rounded-3xl border transition-all text-left group hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden ${
              darkMode ? 'bg-elegant-card border-white/5 hover:border-emerald-500/40' : 'bg-white border-gray-200 shadow-sm hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Ubuntu 24.04 LTS
              </span>
              <span className="text-[10px] font-mono text-gray-500">GNU/Linux 6.8</span>
            </div>

            <h4 className={`font-display font-black text-base sm:text-lg mb-2 group-hover:text-emerald-400 transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Linux OS Terminal Simulator
            </h4>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Full Unix command-line shell with virtual filesystem hierarchy (<code className="text-emerald-400">/etc</code>, <code className="text-emerald-400">/var/log</code>), essential bash commands (<code className="text-gray-300">ls -la</code>, <code className="text-gray-300">cat</code>, <code className="text-gray-300">grep</code>, <code className="text-gray-300">chmod</code>), pipe redirections, system telemetry (<code className="text-gray-300">ps aux</code>, <code className="text-gray-300">top</code>), and guided lab missions.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <span>• Shell prompt</span>
                <span>• nano editor</span>
                <span>• systemctl</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Launch Linux OS &rarr;
              </span>
            </div>
          </div>

          {/* Python & ML Simulator Feature Card */}
          <div 
            onClick={() => onNavigateToSection('python_sim')}
            className={`p-6 rounded-3xl border transition-all text-left group hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden ${
              darkMode ? 'bg-elegant-card border-white/5 hover:border-cyan-500/40' : 'bg-white border-gray-200 shadow-sm hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Python 3.12 & ML Engine
              </span>
              <span className="text-[10px] font-mono text-gray-500">Interactive Runtime</span>
            </div>

            <h4 className={`font-display font-black text-base sm:text-lg mb-2 group-hover:text-cyan-400 transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Python & Machine Learning Code Simulator
            </h4>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Write, edit, and RUN Python code in your browser with live stdout logs. Train least-squares Linear Regressions with interactive scatter plots, run 2-layer Neural Network forward passes with loss convergence curves, and evaluate Decision Tree intrusion classifiers.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <span>• Live stdout</span>
                <span>• ML plots</span>
                <span>• Memory inspector</span>
              </div>
              <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Run Python & ML &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. POPULAR COURSES / SUBJECT TILES */}
      <div className="space-y-4">
        <div className="border-b pb-3 border-gray-200/10 dark:border-gray-800/40">
          <h3 className={`font-display font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Study Pathways
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Pick a learning channel to access textbook notes, interactive sandboxes, and quiz modules instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularCourses.map(course => (
            <div
              key={course.name}
              onClick={() => onNavigateToSection('documents', course.name as any)}
              className={`group p-6 rounded-3xl border text-left transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                darkMode 
                  ? 'bg-elegant-card border-white/5 hover:border-teal-500/30' 
                  : 'bg-white border-gray-200 shadow-sm hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${course.color}`}>
                  {course.name}
                </span>
                <span className={`text-[11px] font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {course.count === 0 ? 'Upload Pending' : `${course.count} ${course.count === 1 ? 'Note' : 'Notes'}`}
                </span>
              </div>
              
              <h4 className={`font-display font-bold text-base mb-2 group-hover:text-brand-primary transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {course.name === 'Networking' ? 'Cisco CCNA Prep Guide' : course.name === 'Linux' ? 'Linux System Engineer' : `${course.name} Handbook`}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
                {course.desc}
              </p>

              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-primary group-hover:gap-2 transition-all">
                <span>Start Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AI ASSISTANT SECTION - THE INTEL TUNNEL */}
      <div className={`p-8 rounded-[2rem] border overflow-hidden relative ${
        darkMode ? 'bg-gradient-to-r from-teal-950/20 via-slate-900/40 to-teal-950/20 border-teal-500/10' : 'bg-teal-50/50 border-teal-100 text-teal-950'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
              darkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-teal-100 text-teal-900 border border-teal-200'
            }`}>
              Google Grounded Technical Mentor
            </span>
            <h3 className={`font-display font-black text-2xl ${darkMode ? 'text-white' : 'text-teal-950'}`}>
              Interactive NIT AI & Cisco Lab Mentor
            </h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Ask questions on complex IT materials or paste networking parameters. NETECH's NIT AI provides detailed code breakdowns, orthographic explanations, and even provides responses in <strong>Kinyarwanda or super-simple analogies</strong>.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: 'Explain VLAN Trunking in simple terms', prompt: 'Explain VLAN Trunking in simple English with real analogies.' },
                { label: 'Configure Cisco static routing commands', prompt: 'Show Cisco router CLI commands to configure static default routing.' },
                { label: 'What is orthographic projection?', prompt: 'Explain orthographic projection standard views in Technical Drawing.' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToSection('ai_chat', undefined, undefined, chip.prompt)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border text-left flex items-center gap-1.5 cursor-pointer max-w-full ${
                    darkMode 
                      ? 'bg-slate-950 border-white/5 text-gray-300 hover:text-white hover:border-teal-500/30' 
                      : 'bg-white border-teal-200 text-teal-900 hover:bg-teal-50'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className={`p-5 rounded-2xl border text-left space-y-4 ${
              darkMode ? 'bg-slate-950/80 border-white/5' : 'bg-white border-teal-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-gray-500 font-mono">
                <span>net-learn-cognitive-terminal</span>
                <span className="text-teal-400 font-bold">● ACTIVE</span>
              </div>
              <p className={`font-mono text-xs leading-relaxed ${darkMode ? 'text-teal-300' : 'text-teal-900'}`}>
                <span className="text-teal-500">guest@netlearn:~$</span> explain OSPF cost metrics<br />
                <span className="text-gray-400">&gt; OSPF uses "Cost" as routing metric based on link bandwidth. Cost = Reference Bandwidth (100 Mbps) / Link Bandwidth. A higher speed port has lower cost!</span>
              </p>
              
              <button
                onClick={() => onNavigateToSection('ai_chat')}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs shadow-md"
              >
                Launch RAG Chat Desk <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LATEST MODULES & FEATURED DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Featured textbooks / uploads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b pb-3 border-gray-200/10 dark:border-gray-800/40">
            <h3 className={`font-display font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Study Modules
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Browse textbook notes and technical files uploaded in this workspace or pre-seeded to get you certified.
            </p>
          </div>

          {featuredDocs.length > 0 ? (
            <div className="space-y-3">
              {featuredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => onNavigateToSection('documents', undefined, doc.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-1 ${
                    darkMode 
                      ? 'bg-elegant-card border-white/5 hover:border-teal-500/30' 
                      : 'bg-white border-gray-100 shadow-sm hover:border-teal-500'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-3 bg-emerald-500/10 text-brand-primary rounded-xl shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate text-left">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {doc.category}
                      </span>
                      <h4 className={`font-display font-bold text-sm mt-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {doc.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.summary && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[8px] font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 uppercase tracking-wider">
                        AI Summarized
                      </span>
                    )}
                    <div className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-900 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border text-center space-y-3 ${
              darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-gray-50 border-gray-200'
            }`}>
              <BookOpen className="w-8 h-8 text-teal-500 mx-auto opacity-75" />
              <p className="text-xs text-gray-500 font-medium">All course notes will be uploaded by the Institution Administrator.</p>
              <button
                onClick={() => onNavigateToSection('documents')}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Open Course Notes Hub
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Bookmarks & active recommendations */}
        <div className="space-y-4">
          <div className="border-b pb-3 border-gray-200/10 dark:border-gray-800/40">
            <h3 className={`font-display font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bookmarked Materials
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Your quick study lists bookmarked for rapid review.
            </p>
          </div>

          {bookmarks.length > 0 ? (
            <div className="space-y-2.5">
              {bookmarks.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => onNavigateToSection('documents', undefined, doc.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                    darkMode ? 'bg-slate-950 border-white/5 hover:bg-slate-900' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate text-left">
                    <Bookmark className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className={`font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{doc.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border text-center ${
              darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-xs text-gray-400 italic">No bookmarks saved yet.</p>
              <p className="text-[10px] text-gray-500 mt-1">Click the bookmark ribbon when reading a textbook to save.</p>
              <button
                onClick={() => onNavigateToSection('documents')}
                className="text-xs font-bold text-brand-primary hover:underline mt-2.5 cursor-pointer block"
              >
                Browse Syllabus Chapters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 7. TESTIMONIALS SECTION */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className={`font-display font-black text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            What Students & Educators Say
          </h3>
          <p className="text-xs text-gray-400">
            Real feedback from tech scholars who upgraded their study methods with NETECH.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border text-left space-y-4 ${
                darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "{test.text}"
              </p>
              <div>
                <h5 className={`font-display font-bold text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {test.name}
                </h5>
                <p className="text-[10px] text-gray-500">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. CALL TO ACTION */}
      <div className="bg-brand-primary rounded-[2rem] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
        
        <div className="max-w-2xl mx-auto space-y-5 relative z-10">
          <h3 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-tight">
            Ready to Ace Your Certification Exams?
          </h3>
          <p className="text-sm font-medium text-teal-50">
            Upload your study notes, textbooks, homework, or practice questions. Our advanced AI indexing maps every outcome to standard reference manuals.
          </p>
          <div className="pt-3">
            <button
              onClick={() => onNavigateToSection('documents')}
              className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Open Textbook Library Now &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* 9. FOOTER */}
      <footer className="border-t border-gray-200/10 dark:border-gray-800/40 pt-10 pb-6 text-center space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto text-left">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <img 
                src={netLearnLogo} 
                alt="NETECH Logo" 
                className="w-8 h-8 object-contain rounded-lg shadow-sm border border-emerald-500/20"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
              />
              <span className={`font-display font-black text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                NETECH
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Interactive Learning Platform. Professional IT, Linux & Python Study Suite.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold">
            {['Home', 'Learn', 'Practice', 'NIT AI', 'Community', 'Certificates', 'About'].map(link => (
              <button
                key={link}
                onClick={() => onNavigateToSection(link === 'Home' ? 'dashboard' : link === 'Learn' ? 'documents' : link === 'Practice' ? 'exams' : link === 'NIT AI' ? 'ai_chat' : link.toLowerCase() as any)}
                className={`transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-950'}`}
              >
                {link}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto border-t border-gray-200/5 dark:border-white/5 pt-4">
          <p>© {new Date().getFullYear()} NETECH. Inspired by W3Schools visual and ergonomic layouts. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono font-bold">v2.5_ACTIVE</span>
            <span className="text-gray-400 font-semibold">Security Shield Enabled</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
