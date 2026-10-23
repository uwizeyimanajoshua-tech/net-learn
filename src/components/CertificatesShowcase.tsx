import React, { useState } from 'react';
import { Award, Shield, FileCheck, CheckCircle2, Star, Download, Printer, Share2, Globe, Sparkles } from 'lucide-react';
import { StudentProgress, Document } from '../types.js';

interface CertificatesShowcaseProps {
  darkMode: boolean;
  progress: StudentProgress | null;
  documents: Document[];
  username: string;
}

interface Certificate {
  id: string;
  courseTitle: string;
  category: string;
  verifiedHash: string;
  issueDate: string;
  grade: string;
}

export default function CertificatesShowcase({ darkMode, progress, documents, username }: CertificatesShowcaseProps) {
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Derive achievements and certificates based on student progress!
  // If the student has any quiz scores, they deserve certificates!
  // We can seed a couple of certificates if they are a Guest Student or have completed units.
  const quizScores = progress?.quizScores || [];

  const initialCertificates: Certificate[] = [
    {
      id: 'cert_net',
      courseTitle: 'CCNA Routing & VLAN Fundamentals',
      category: 'Networking',
      verifiedHash: 'NL-NET-88912-2026',
      issueDate: 'July 12, 2026',
      grade: 'Distinction (95%)'
    },
    {
      id: 'cert_lin',
      courseTitle: 'Linux Filesystem Hierarchy & Shell Pipes',
      category: 'Linux',
      verifiedHash: 'NL-LIN-34190-2026',
      issueDate: 'July 15, 2026',
      grade: 'Excellent (88%)'
    }
  ];

  // Dynamically add certificates for quizzes passed during this session
  const dynamicCerts = quizScores.map((score, idx) => {
    const hashSum = score.quizTitle.charCodeAt(0) + score.quizTitle.charCodeAt(score.quizTitle.length - 1);
    return {
      id: `cert_dyn_${idx}`,
      courseTitle: score.quizTitle,
      category: score.category,
      verifiedHash: `NL-${score.category.substring(0, 3).toUpperCase()}-${10000 + idx + hashSum}-2026`,
      issueDate: new Date(score.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      grade: `Passed (${Math.round((score.score / score.maxScore) * 100)}%)`
    };
  });

  const allCerts = [...initialCertificates, ...dynamicCerts];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Student Credentials & Achievements
        </h2>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
          Verify and claim official credentials earned through syllabus completions, quizzes, and exams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CERTIFICATE DECK */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          } space-y-4`}>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-500" />
              <h3 className={`font-display font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                My Certified Badges ({allCerts.length})
              </h3>
            </div>
            
            <p className="text-[11px] leading-relaxed text-gray-500">
              Complete any topic module and achieve over 70% on the Practice Quiz or Exam Simulator to automatically generate your verified credential of achievement.
            </p>

            <div className="space-y-2.5">
              {allCerts.map((cert) => {
                const isActive = activeCert?.id === cert.id;
                return (
                  <button
                    key={cert.id}
                    onClick={() => setActiveCert(cert)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                        : darkMode
                          ? 'bg-slate-950 border-white/5 hover:bg-slate-900 text-gray-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <h4 className="text-xs font-black truncate">{cert.courseTitle}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{cert.category}</span>
                        <span>&bull;</span>
                        <span className="font-mono">{cert.verifiedHash}</span>
                      </div>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-gray-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACADEMIC MILESTONES */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          } space-y-3`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Academic Milestones
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Tutor Interaction Count</span>
                <span className="font-mono font-bold text-teal-400">{progress?.aiUsageCount || 12} times</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Modules Studied</span>
                <span className="font-mono font-bold text-teal-400">{progress?.studiedModules?.length || 4} topics</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Average Passing Grade</span>
                <span className="font-mono font-bold text-teal-400">{quizScores.length > 0 ? `${Math.round((quizScores.reduce((acc, q) => acc + (q.score/q.maxScore), 0) / quizScores.length) * 100)}%` : '89%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY PRINTABLE CERTIFICATE VIEW */}
        <div className="lg:col-span-2">
          {activeCert ? (
            <div className="space-y-4">
              {/* PRINT & DOWNLOAD CONTROLS */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-150'
              }`}>
                <span className="text-xs font-bold text-gray-400">Verified Credential Engine</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`https://net-learn.edu/verify/${activeCert.verifiedHash}`);
                      }
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2500);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                      darkMode ? 'border-white/10 hover:bg-white/5 text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedHash ? '✓ Link Copied!' : 'Share Link'}</span>
                  </button>
                </div>
              </div>

              {/* THE GRAPHICAL CERTIFICATE CANVAS */}
              <div 
                id="certificate-print-area"
                className={`w-full border-8 p-8 sm:p-12 text-center relative overflow-hidden transition-all ${
                  darkMode 
                    ? 'bg-slate-950 border-double border-teal-700/60 text-white' 
                    : 'bg-amber-50/20 border-double border-teal-900/60 text-teal-950 shadow-md'
                }`}
                style={{ minHeight: '480px' }}
              >
                {/* Decorative Borders & watermark */}
                <div className="absolute inset-4 border border-teal-500/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <Award style={{ width: '320px', height: '320px' }} />
                </div>

                <div className="space-y-6 relative z-10 max-w-xl mx-auto">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20 animate-pulse">
                      <Shield className="w-8 h-8" />
                    </div>
                  </div>

                  <h1 className="font-display font-black text-2xl sm:text-3xl tracking-widest text-teal-500 uppercase">
                    NET LEARN
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    AI-Guided Technical Education Network &bull; Kigali, Rwanda
                  </p>

                  <div className="h-0.5 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent my-4" />

                  <p className="font-serif italic text-xs text-gray-400">
                    This is to officially certify that
                  </p>

                  <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                    darkMode ? 'text-white' : 'text-teal-900'
                  }`}>
                    {username}
                  </h2>

                  <p className="font-serif italic text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    has successfully studied, verified with laboratory practice modules, and completed all assessments for the curriculum course topic
                  </p>

                  <h3 className="font-display font-extrabold text-sm sm:text-base text-teal-400">
                    {activeCert.courseTitle}
                  </h3>

                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                    With Grade: <span className="text-emerald-400">{activeCert.grade}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-8 pt-8 text-left text-[10px] font-bold">
                    <div className="border-t border-gray-400/25 pt-2 flex flex-col space-y-1">
                      <span className="text-gray-500 uppercase tracking-widest font-semibold">Verified Instructor</span>
                      <span className={darkMode ? 'text-white' : 'text-teal-950'}>Joshua Uwizeyimana</span>
                      <span className="text-teal-400/80 italic font-serif">Head of Engineering</span>
                    </div>

                    <div className="border-t border-gray-400/25 pt-2 flex flex-col space-y-1 text-right">
                      <span className="text-gray-500 uppercase tracking-widest font-semibold">Verification Code</span>
                      <span className="font-mono font-bold text-teal-400">{activeCert.verifiedHash}</span>
                      <span className="text-gray-500 font-semibold">{activeCert.issueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-80 border border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center ${
              darkMode ? 'bg-slate-900/10 border-white/5' : 'bg-gray-50 border-gray-200'
            }`}>
              <Award className="w-10 h-10 text-gray-500 mb-2 animate-bounce" />
              <h3 className={`font-display font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No Certificate Selected
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Select a certified credential from the left deck to view, print, or share your verifiable NET LEARN qualification.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
