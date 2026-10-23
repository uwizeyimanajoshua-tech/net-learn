import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Cpu, GraduationCap, LayoutGrid, Server, Terminal, Shield, ArrowRight, Layers, MessageSquare, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../types.js';
import ImageCarousel from './ImageCarousel.js';

interface LandingPageProps {
  onEnterApp: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAuth?: () => void;
}

export default function LandingPage({ onEnterApp, darkMode, setDarkMode, onOpenAuth }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'chat' | 'summary' | 'lab'>('chat');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-elegant-bg text-slate-200' : 'bg-gray-50 text-gray-900'} relative overflow-hidden transition-colors duration-300`}>
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 border-gray-200/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-xl text-white shadow-lg">
              <Sparkles className="w-5 h-5" id="brand-logo" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              NET LEARN Academy
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                id="landing-google-login-btn"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Google Login</span>
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300/20 dark:border-gray-700/30 text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              title="Toggle Theme"
              id="theme-toggler-btn"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2 rounded-xl font-display font-medium text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
              id="start-button-landing"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 mb-6 font-display">
            <Sparkles className="w-3.5 h-3.5" /> Comprehensive Technical Curriculum & Certification Platform
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.1] tracking-tight mb-6">
            Master Computer Science & Networking <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              With Interactive Engineering Labs
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Upload your technical syllabus, textbooks, or network diagrams. Learn dynamically with custom summaries, interactive Packet Tracer labs, and NIT AI mentorship that knows your course content inside out.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-8 py-3.5 rounded-2xl font-display font-semibold text-base bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/25 active:scale-98 transition-all flex items-center gap-2.5"
              id="cta-primary-btn"
            >
              Get Started for Free <Sparkles className="w-5 h-5 text-indigo-200" />
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features-anchor');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-2xl font-display font-semibold text-base bg-gray-200/30 dark:bg-gray-800/40 hover:bg-gray-200/50 dark:hover:bg-gray-800/60 border border-gray-300/10 dark:border-gray-700/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
              id="cta-secondary-btn"
            >
              Learn More <Layers className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </motion.div>

        {/* Sliding Hero Image Carousel Showcase */}
        <div className="mb-24">
          <ImageCarousel darkMode={darkMode} />
        </div>

        {/* Live Interactive Demo Preview Panel */}
        <motion.div
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-gray-200/10 dark:border-white/10 shadow-2xl bg-elegant-card backdrop-blur-md p-2 mb-24"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          id="demo-interactive-preview"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/10 dark:border-gray-800/40">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 font-mono text-xs text-gray-500">nexalearn-live-interface_v1.0.sh</span>
            </div>
            <div className="flex bg-gray-800/40 p-1 rounded-xl border border-gray-700/25">
              <button
                onClick={() => setActivePreviewTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${activePreviewTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                id="tab-live-chat"
              >
                ChatGPT-like Chat
              </button>
              <button
                onClick={() => setActivePreviewTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${activePreviewTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                id="tab-live-summary"
              >
                Intelligent RAG Summary
              </button>
              <button
                onClick={() => setActivePreviewTab('lab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${activePreviewTab === 'lab' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                id="tab-live-lab"
              >
                Cisco Lab Engine
              </button>
            </div>
          </div>

          <div className="p-6 min-h-[320px] flex flex-col justify-between bg-elegant-bg/80 font-sans">
            {activePreviewTab === 'chat' && (
              <div className="flex flex-col gap-4 animate-fade-in text-sm text-left">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gray-700/40 flex items-center justify-center shrink-0 text-gray-300 font-mono text-xs">U</div>
                  <div className="bg-gray-800/60 p-3.5 rounded-2xl rounded-tl-none border border-gray-700/20 text-gray-300">
                    What is the main difference between OSPF and BGP routing protocols?
                  </div>
                </div>
                <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse text-right">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shrink-0 text-white text-xs">NL</div>
                  <div className="bg-indigo-950/40 p-4 rounded-2xl rounded-tr-none border border-indigo-800/30 text-gray-200 text-left">
                    <p className="font-semibold text-emerald-400 mb-1 text-xs uppercase tracking-wider font-display">NIT AI</p>
                    <p className="mb-2"><strong>OSPF (Open Shortest Path First)</strong> is an Link-State Interior Gateway Protocol (IGP) used to route packets <em>within</em> an autonomous system (like a single company campus). It calculates routes based on SPF metrics.</p>
                    <p><strong>BGP (Border Gateway Protocol)</strong> is a Path-Vector Exterior Gateway Protocol (EGP) used to route traffic <em>between</em> different autonomous systems across the public Internet. It makes routing choices based on paths, policies, and rules.</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'summary' && (
              <div className="flex flex-col gap-3 text-left">
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/25 text-[10px] text-emerald-400 font-mono font-semibold">LEARNING OUTCOME 2</span>
                    <span className="font-display text-sm font-semibold text-gray-200">Understand Virtual LANs (VLANs)</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">VLANs partition a physical switch into distinct logical segments, preventing massive broadcast domain noise and isolating departments.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-800/40 rounded-xl">
                      <p className="font-medium text-indigo-400 mb-1">Key Terms Defined</p>
                      <p className="text-gray-400"><strong>Trunk Port:</strong> An 802.1Q port connecting switches to carry packets tagged with their VLAN IDs.</p>
                    </div>
                    <div className="p-3 bg-gray-800/40 rounded-xl">
                      <p className="font-medium text-amber-400 mb-1">Exam Pro-Tip</p>
                      <p className="text-gray-400">Ensure native VLAN allocations match on both ends of switches, or frames will leak or drop.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'lab' && (
              <div className="text-left font-mono text-xs">
                <p className="text-gray-500 mb-2"># Generated Cisco Router-on-a-Stick CLI Script</p>
                <div className="p-4 bg-slate-950 rounded-xl border border-gray-800 text-emerald-400 leading-relaxed overflow-x-auto">
                  <p>Router(config)# <span className="text-gray-300">interface gigabitEthernet 0/0.10</span></p>
                  <p>Router(config-subif)# <span className="text-emerald-300">encapsulation dot1Q 10</span></p>
                  <p>Router(config-subif)# <span className="text-emerald-300">ip address 192.168.10.1 255.255.255.0</span></p>
                  <p>Router(config-subif)# <span className="text-gray-300">interface gigabitEthernet 0/0.20</span></p>
                  <p>Router(config-subif)# <span className="text-emerald-300">encapsulation dot1Q 20</span></p>
                  <p>Router(config-subif)# <span className="text-emerald-300">ip address 192.168.20.1 255.255.255.0</span></p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200/10 dark:border-gray-800/40 flex items-center justify-between text-xs text-gray-500">
              <span>Interactive Simulator Panel</span>
              <button onClick={onEnterApp} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
                Try full workspace <Play className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories Carousel / Display */}
        <div className="mb-24 text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-4">PRE-CONFIGURED TECHNICAL SUBJECTS</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {CATEGORIES.map((cat, idx) => (
              <div
                key={cat}
                className="px-4 py-2 rounded-2xl text-xs font-medium bg-gray-200/20 dark:bg-gray-800/30 border border-gray-300/10 dark:border-gray-700/20 text-gray-600 dark:text-gray-300 shadow-sm"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid Section */}
        <div id="features-anchor" className="scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">What makes NexaLearn different?</h2>
            <p className="text-gray-400 text-sm sm:text-base">An educational hub loaded with specialized tools to streamline exam revisions, system operations, and practical setups.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl glow-indigo hover-scale-up">
              <Brain className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Cognitive RAG Search</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Retrieval Augmented Generation reads your textbooks and syllabus sections first. Ask questions and review explicit citations.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl glow-emerald hover-scale-up">
              <Layers className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Complete Course summaries</h3>
              <p className="text-xs text-gray-400 leading-relaxed">No shortcuts. Generate structure-by-structure breakdowns containing learning objectives, important terminology, examples, and exam warnings.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl glow-indigo hover-scale-up">
              <Cpu className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Automated Packet Tracer Labs</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Generate complete command line layouts, topology definitions, and router interface tables for Cisco switches and routers.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl hover-scale-up">
              <GraduationCap className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Exam & MCQ Simulator</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Take quizzes generated dynamically from course materials. Track grades, identify gaps, and monitor weak subjects.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl hover-scale-up">
              <MessageSquare className="w-10 h-10 text-sky-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Bilingual Explanations</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Toggle lessons into beautiful simple English, or translate concepts directly into clear, structured Kinyarwanda tech terms.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-elegant-card border border-white/5 rounded-2xl hover-scale-up">
              <LayoutGrid className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Interactive Mastery Flashcards</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Instantly generate revision cards. Flip to study, toggle mastered flags, and review your progress metrics before the exam.</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-indigo-950/40 via-slate-950/40 to-emerald-950/30 border border-gray-200/10 dark:border-gray-800/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[20vw] h-[20vw] bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
          <h2 className="font-display font-bold text-2xl sm:text-4xl mb-4">Ready to elevate your learning experience?</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto mb-8">Access pre-loaded CCNA and Linux guides, study curriculum summaries, generate customized labs, and ace your assessments.</p>
          <button
            onClick={onEnterApp}
            className="px-8 py-3.5 rounded-2xl font-display font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:shadow-indigo-500/20 hover:scale-103 active:scale-97 transition-all flex items-center gap-2.5 mx-auto"
            id="bottom-cta-enter"
          >
            Enter NET LEARN Workspace <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/10 dark:border-gray-800/50 py-12 relative z-10 transition-colors duration-300 bg-gray-100/40 dark:bg-[#060910]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-display font-semibold text-sm text-gray-400">NET LEARN Academy Platform</span>
          </div>
          <span className="text-xs text-gray-500">
            &copy; 2026 NET LEARN. Crafted as a high-fidelity educational companion. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
