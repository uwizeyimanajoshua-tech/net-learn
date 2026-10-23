import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, FileText, Bookmark, BookOpen, Trash2, ArrowRight, Sparkles, Check, Play, FileQuestion, Layers, MessageSquare, AlertCircle, Shield, RefreshCw, HelpCircle, Terminal, Code2, Split, Monitor, Eye, Download, Box, X, AlertTriangle, Camera, Image as ImageIcon, Lock } from 'lucide-react';
import { Document, CategoryName, CATEGORIES, AISummary } from '../types.js';
import LinuxSimulator from './LinuxSimulator.js';
import PythonSimulator from './PythonSimulator.js';
import OriginalDocumentRenderer from './OriginalDocumentRenderer.js';
import W3SchoolsNoteViewer from './W3SchoolsNoteViewer.js';

interface SectionExercise {
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: string;
}

const getExerciseForSection = (secId: string, title: string, content: string): SectionExercise => {
  const t = title.toLowerCase();
  const c = content.toLowerCase();

  // 1. PHP Exercises (matching video perfectly!)
  if (t.includes('php') && t.includes('intro')) {
    return {
      question: "What does PHP stand for?",
      options: [
        "Private Home Page",
        "Personal Hypertext Processor",
        "PHP: Hypertext Preprocessor",
        "Pre-engineered Hypertext Processor"
      ],
      correctAnswer: "PHP: Hypertext Preprocessor",
      hint: "It is a recursive acronym."
    };
  }
  if (t.includes('php') && t.includes('syntax')) {
    return {
      question: "A PHP script starts with which tag?",
      options: [
        "<script>",
        "<?php",
        "<php>",
        "<&"
      ],
      correctAnswer: "<?php",
      hint: "All PHP code blocks must begin with this exact sequence."
    };
  }
  if (t.includes('php') && t.includes('comment')) {
    return {
      question: "Which of the following is NOT a legal PHP comment style?",
      options: [
        "// this is a comment",
        "# this is a comment",
        "/* this is a comment */",
        "//* this is a comment */"
      ],
      correctAnswer: "//* this is a comment */",
      hint: "Single-line comments start with // or #, multi-line start with /* and end with */."
    };
  }
  if (t.includes('php')) {
    return {
      question: "Which character is used to declare a variable in PHP?",
      options: ["$", "&", "var", "let"],
      correctAnswer: "$",
      hint: "All PHP variables must begin with this symbol."
    };
  }

  // 2. HTML Exercises
  if (t.includes('html')) {
    if (t.includes('intro') || t.includes('basic')) {
      return {
        question: "What is the correct HTML element for the largest heading?",
        options: ["<h6>", "<heading>", "<h1>", "<head>"],
        correctAnswer: "<h1>"
      };
    }
    return {
      question: "What is the correct HTML element for inserting a line break?",
      options: ["<lb>", "<br>", "<break>", "<hr>"],
      correctAnswer: "<br>"
    };
  }

  // 3. CSS Exercises
  if (t.includes('css')) {
    return {
      question: "Which CSS property is used to change the background color of an element?",
      options: ["color", "bgcolor", "background-color", "cell-color"],
      correctAnswer: "background-color"
    };
  }

  // 4. JavaScript Exercises
  if (t.includes('javascript') || t.includes('js')) {
    return {
      question: "How do you write 'Hello World' in an alert box?",
      options: [
        "alertBox('Hello World');",
        "msg('Hello World');",
        "alert('Hello World');",
        "console.log('Hello World');"
      ],
      correctAnswer: "alert('Hello World');"
    };
  }

  // 5. SQL Exercises
  if (t.includes('sql')) {
    return {
      question: "Which SQL statement is used to extract data from a database?",
      options: ["EXTRACT", "SELECT", "GET", "OPEN"],
      correctAnswer: "SELECT"
    };
  }

  // 6. Networking & CCNA Exercises
  if (t.includes('routing') || t.includes('router') || t.includes('ip')) {
    return {
      question: "At which layer of the OSI model do routers primarily operate?",
      options: [
        "Layer 1 (Physical)",
        "Layer 2 (Data Link)",
        "Layer 3 (Network)",
        "Layer 4 (Transport)"
      ],
      correctAnswer: "Layer 3 (Network)",
      hint: "Routers forward packets based on logical IP addresses."
    };
  }
  if (t.includes('vlan') || t.includes('trunk') || t.includes('802.1q')) {
    return {
      question: "What is the standard IEEE protocol used for tagging frames on a trunk port?",
      options: [
        "802.1x",
        "802.3",
        "802.1Q",
        "802.11"
      ],
      correctAnswer: "802.1Q",
      hint: "It inserts a 4-byte VLAN identifier into the Ethernet frame header."
    };
  }

  // 7. Linux Exercises
  if (t.includes('linux') || t.includes('command') || t.includes('filesystem')) {
    return {
      question: "Which command is used to display your current directory path in Linux?",
      options: [
        "ls",
        "pwd",
        "cd",
        "whereami"
      ],
      correctAnswer: "pwd",
      hint: "It stands for 'Print Working Directory'."
    };
  }

  // Generic Dynamic Fallback based on content text or keywords
  if (c.includes('port') || c.includes('socket')) {
    return {
      question: "Which protocol provides reliable, connection-oriented data transfer?",
      options: ["UDP", "IP", "TCP", "ICMP"],
      correctAnswer: "TCP"
    };
  }

  // General fallback
  return {
    question: `Which of the following best summarizes the core educational objective of: "${title}"?`,
    options: [
      "To memorize syntax definitions without understanding execution rules.",
      "To acquire practical hands-on proficiency and troubleshooting capability.",
      "To rely exclusively on automatic AI systems to write code.",
      "To avoid learning underlying standard guidelines and RFCs."
    ],
    correctAnswer: "To acquire practical hands-on proficiency and troubleshooting capability."
  };
};

interface DocumentViewerProps {
  documents: Document[];
  onUpload: (file: File, category: CategoryName) => void;
  onDelete: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onNavigateToSection: (section: string, filterCategory?: CategoryName, filterDocId?: string, searchQuery?: string) => void;
  userId: string;
  activeCategoryFilter?: CategoryName;
  activeDocFilter?: string;
  initialSearchQuery?: string;
  darkMode: boolean;
  userRole?: string;
  sidebarOpen?: boolean;
  onViewingDocChange?: (isViewing: boolean) => void;
}

export default function DocumentViewer({
  documents,
  onUpload,
  onDelete,
  onToggleBookmark,
  onNavigateToSection,
  userId,
  activeCategoryFilter,
  activeDocFilter,
  initialSearchQuery,
  darkMode,
  userRole,
  sidebarOpen,
  onViewingDocChange
}: DocumentViewerProps) {
  // Access control
  const isAdmin = userRole === 'admin';

  // Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'All'>(activeCategoryFilter || 'All');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');

  useEffect(() => {
    if (activeCategoryFilter) {
      setSelectedCategory(activeCategoryFilter);
      setUploadCategory(activeCategoryFilter);
      setManualCategory(activeCategoryFilter);
      if (viewingDoc && viewingDoc.category !== activeCategoryFilter && !activeDocFilter) {
        setViewingDoc(null);
      }
    } else if (activeCategoryFilter === undefined) {
      setSelectedCategory('All');
    }
  }, [activeCategoryFilter]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // File Uploader states
  const [dragActive, setDragActive] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<CategoryName>('Networking');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active document being viewed
  const [viewingDoc, setViewingDoc] = useState<Document | null>(
    activeDocFilter ? documents.find(d => d.id === activeDocFilter) || null : null
  );

  // Notify parent of reading status so app expands to full width
  useEffect(() => {
    onViewingDocChange?.(!!viewingDoc);
  }, [!!viewingDoc]);

  // Delete Confirmation Modal State
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showIndex, setShowIndex] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // In-app notifications & Section practice states
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [revealedSectionHints, setRevealedSectionHints] = useState<Record<string, boolean>>({});
  const [aiPracticeQuestions, setAiPracticeQuestions] = useState<Record<string, { loading: boolean; error?: string; questions?: any[] }>>({});

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateSectionPractice = async (secId: string, title: string, content: string) => {
    setAiPracticeQuestions(prev => ({
      ...prev,
      [secId]: { loading: true }
    }));

    try {
      const res = await fetch('/api/ai/questions/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category: viewingDoc?.category || 'General Technology',
          docId: viewingDoc?.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate practice questions');

      setAiPracticeQuestions(prev => ({
        ...prev,
        [secId]: { loading: false, questions: data.questions || [] }
      }));
      showToast('Fresh AI practice questions generated!', 'success');
    } catch (err: any) {
      setAiPracticeQuestions(prev => ({
        ...prev,
        [secId]: { loading: false, error: err.message || 'Generation failed' }
      }));
      showToast('Could not generate AI questions. Standard exercises remain available.', 'info');
    }
  };

  const handleDownloadSnippet = (codeContent: string, lang: string, name: string) => {
    const norm = (lang || 'python').toLowerCase();
    let ext = 'py';
    if (norm.includes('js') || norm.includes('javascript')) ext = 'js';
    else if (norm.includes('sh') || norm.includes('bash')) ext = 'sh';
    else if (norm.includes('sql')) ext = 'sql';
    else if (norm.includes('html')) ext = 'html';
    else if (norm.includes('css')) ext = 'css';

    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Code downloaded as ${name}.${ext}`, 'success');
  };

  // Summarizer state
  const [activeSummary, setActiveSummary] = useState<AISummary | null>(
    activeDocFilter ? (documents.find(d => d.id === activeDocFilter)?.summary || null) : null
  );
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (activeDocFilter) {
      const doc = documents.find(d => d.id === activeDocFilter);
      if (doc) {
        setViewingDoc(doc);
        setActiveSummary(doc.summary || null);
      }
    } else if (viewingDoc) {
      const doc = documents.find(d => d.id === viewingDoc.id);
      if (doc) {
        setViewingDoc(doc);
        setActiveSummary(doc.summary || null);
      }
    }
  }, [activeDocFilter, documents, viewingDoc?.id]);

  // Manual Module Creation states (CRUD: Create)
  const [uploaderTab, setUploaderTab] = useState<'upload' | 'manual'>('upload');
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<CategoryName>('Networking');
  const [manualContent, setManualContent] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualStatus, setManualStatus] = useState('');

  // Module Editing states (CRUD: Update)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryName>('Networking');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  const [resetLoading, setResetLoading] = useState(false);

  const handleResetCurriculum = () => {
    setShowResetConfirm(true);
  };

  const executeResetCurriculum = async () => {
    setResetLoading(true);
    try {
      const res = await fetch('/api/documents/reset', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to refresh curriculum');
      // trigger parent reload
      await onUpload(null as any, 'Networking');
      showToast('Curriculum material refreshed to default successfully!', 'success');
    } catch (err: any) {
      showToast(`Error refreshing curriculum: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setResetLoading(false);
      setShowResetConfirm(false);
    }
  };

  const renderDeleteModal = () => {
    if (!docToDelete) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
        <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
          darkMode ? 'bg-[#0f171e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <button
            onClick={() => !deleteInProgress && setDocToDelete(null)}
            disabled={deleteInProgress}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold">Delete Course Note</h3>
              <span className="text-[11px] text-slate-400">Confirmation Required</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border mb-5 ${
            darkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              {docToDelete.category}
            </span>
            <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {docToDelete.name}
            </p>
          </div>

          <p className={`text-xs mb-6 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Are you sure you want to delete this course note? This action cannot be undone and will permanently remove this material from the system.
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDocToDelete(null)}
              disabled={deleteInProgress}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setDeleteInProgress(true);
                try {
                  await onDelete(docToDelete.id);
                  showToast(`Course note "${docToDelete.name}" deleted successfully`, 'success');
                  if (viewingDoc?.id === docToDelete.id) {
                    setViewingDoc(null);
                    setActiveSummary(null);
                    setIsEditing(false);
                    onNavigateToSection('documents', undefined, undefined);
                  }
                } catch (err: any) {
                  showToast('Error deleting note. Please try again.', 'error');
                } finally {
                  setDeleteInProgress(false);
                  setDocToDelete(null);
                }
              }}
              disabled={deleteInProgress}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              id="btn-confirm-delete-dialog"
            >
              {deleteInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResetModal = () => {
    if (!showResetConfirm) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
        <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
          darkMode ? 'bg-[#0f171e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold">Reset Curriculum</h3>
              <span className="text-[11px] text-slate-400">Restore Default State</span>
            </div>
          </div>
          <p className={`text-xs mb-6 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Are you sure you want to refresh/restore the curriculum library? This will clear any manual uploads.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              disabled={resetLoading}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={executeResetCurriculum}
              disabled={resetLoading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
            >
              {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Yes, Reset</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setManualStatus('Permission Denied: Only administrators can create course documents.');
      return;
    }
    if (!manualName.trim() || !manualContent.trim()) {
      setManualStatus('Please fill out all fields.');
      return;
    }
    setManualLoading(true);
    setManualStatus('Creating manual module...');
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole || '',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({
          name: manualName,
          category: manualCategory,
          textContent: manualContent,
          userId: userId || 'usr_student'
        })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        throw new Error('Could not parse response from server');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to create module');

      setManualStatus('Success! Manual module created.');
      setManualName('');
      setManualContent('');
      
      // Refresh documents
      await onUpload(null as any, manualCategory);
      if (data.document) {
        setViewingDoc(data.document);
        setActiveSummary(null);
        setActiveTabType('reader');
      }
    } catch (err: any) {
      setManualStatus(`Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setManualLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!viewingDoc) return;
    setEditName(viewingDoc.name);
    setEditCategory(viewingDoc.category as CategoryName);
    setEditContent(viewingDoc.textContent || '');
    setEditStatus('');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!viewingDoc) return;
    if (!editName.trim() || !editContent.trim()) {
      setEditStatus('Please fill out all fields.');
      return;
    }
    setEditLoading(true);
    setEditStatus('Saving changes...');
    try {
      const res = await fetch(`/api/documents/${viewingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          textContent: editContent
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update module');

      setEditStatus('Changes saved successfully!');
      setIsEditing(false);
      
      // Update local state
      const updatedDoc = data.document;
      setViewingDoc(updatedDoc);
      // Trigger parent update
      await onUpload(null as any, editCategory);
    } catch (err: any) {
      setEditStatus(`Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setEditLoading(false);
    }
  };

  const notePhotoInputRef = useRef<HTMLInputElement>(null);
  const [insertPhotoLoading, setInsertPhotoLoading] = useState(false);

  const handleInsertPhotoToNote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
      
      const caption = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const markdownTag = `\n\n![${caption}](${data.url || data.dataUri})\n\n`;
      setEditContent(prev => prev + markdownTag);
      setEditStatus(`Photo "${file.name}" inserted successfully into note!`);
    } catch (err: any) {
      setEditStatus(`Error uploading photo: ${err.message}`);
    } finally {
      setInsertPhotoLoading(false);
      if (notePhotoInputRef.current) notePhotoInputRef.current.value = '';
    }
  };

  // Tab and layout states for viewing a document
  const [activeTabType, setActiveTabType] = useState<'reader' | 'original' | 'summary' | 'sandbox' | 'linux_sim' | 'python_sim'>('reader');
  const [layoutMode, setLayoutMode] = useState<'standard' | 'split' | 'full'>('standard');
  const [splitSide, setSplitSide] = useState<'left' | 'right'>('left');

  // W3Schools-like Reading Controls State
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [readerFontSizeLevel, setReaderFontSizeLevel] = useState<number>(0);
  const [readerTheme, setReaderTheme] = useState<'w3-light' | 'w3-dark' | 'w3-sepia'>('w3-light');
  const [readingMode, setReadingMode] = useState<'chapters' | 'full'>('full');
  const [completedSectionIds, setCompletedSectionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`nexalearn_completed_sections_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<{ correct: boolean } | null>(null);

  // Reset exercise choices when active chapter or document changes
  useEffect(() => {
    setSelectedAnswer('');
    setSubmissionResult(null);
  }, [selectedSectionIndex, viewingDoc?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`nexalearn_completed_sections_${userId}`, JSON.stringify(completedSectionIds));
    } catch (e) {
      console.error(e);
    }
  }, [completedSectionIds, userId]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getFontSizeStyle = (offset: number = 0) => {
    const level = readerFontSizeLevel + offset;
    if (level <= -1) return '13px';
    if (level === 0) return '15px';
    if (level === 1) return '17px';
    if (level === 2) return '20px';
    return '24px';
  };

  const handleFontSizeAdjust = (dir: number) => {
    if (dir === 0) {
      setReaderFontSizeLevel(0);
    } else {
      setReaderFontSizeLevel(prev => Math.max(-1, Math.min(3, prev + dir)));
    }
  };

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) {
      showToast("Text-to-speech is not supported in this browser environment.", "info");
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    } else {
      if (!viewingDoc) return;
      const sections = (viewingDoc.splitContent && viewingDoc.splitContent.length > 0)
        ? viewingDoc.splitContent
        : [{
            id: 'default',
            title: viewingDoc.name,
            content: viewingDoc.textContent || 'No text content available.'
          }];
      
      const activeSection = sections[selectedSectionIndex] || sections[0];
      if (!activeSection) return;

      const textToRead = `${activeSection.title}. ${activeSection.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      utterance.onend = () => {
        setIsReadingAloud(false);
      };
      
      utterance.onerror = () => {
        setIsReadingAloud(false);
      };

      utterance.rate = 1.0;
      setIsReadingAloud(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleSectionCompletion = (id: string) => {
    setCompletedSectionIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    const parts = text.split("```");
    if (parts.length === 1) {
      return <p className="leading-relaxed whitespace-pre-line">{text}</p>;
    }

    return (
      <div className="space-y-4">
        {parts.map((part, partIdx) => {
          const isCode = partIdx % 2 === 1;
          if (isCode) {
            const lines = part.split("\n");
            let lang = 'code';
            let codeContent = part;
            
            if (lines.length > 0) {
              const firstLine = lines[0].trim().toLowerCase();
              if (['python', 'javascript', 'js', 'html', 'css', 'sql', 'bash', 'sh', 'cisco', 'ios', 'json'].includes(firstLine)) {
                lang = firstLine;
                codeContent = lines.slice(1).join("\n");
              }
            }

            return (
              <div key={partIdx} className="border border-gray-300/20 rounded-2xl overflow-hidden shadow-sm my-4 font-mono text-xs">
                <div className={`px-4 py-2 flex items-center justify-between text-[11px] ${
                  readerTheme === 'w3-dark' ? 'bg-[#1e2a38] text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <span className="font-bold tracking-wider uppercase text-[#04aa6d]">
                    Example ({lang})
                  </span>
                  <div className="flex items-center gap-2">
                    {(lang.toLowerCase().includes('bash') || lang.toLowerCase().includes('sh') || viewingDoc.category.toLowerCase().includes('linux')) && (
                      <button
                        onClick={() => {
                          setActiveTabType('linux_sim');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Terminal className="w-2.5 h-2.5" />
                        Simulate in Linux OS &raquo;
                      </button>
                    )}

                    {(lang.toLowerCase().includes('python') || viewingDoc.category.toLowerCase().includes('programming') || viewingDoc.category.toLowerCase().includes('machine learning')) && (
                      <button
                        onClick={() => {
                          setActiveTabType('python_sim');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Code2 className="w-2.5 h-2.5" />
                        Run in Python &raquo;
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSandboxCode(codeContent.trim());
                        setActiveTabType('sandbox');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-[#04aa6d] hover:bg-[#059862] text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Try it Yourself &raquo;
                    </button>
                    <button
                      onClick={() => handleDownloadSnippet(codeContent.trim(), lang, `code_example_${partIdx}`)}
                      className="px-2.5 py-1 bg-teal-800/60 hover:bg-teal-700 text-teal-200 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border border-teal-500/20 active:scale-95"
                      title="Download this code snippet"
                    >
                      <Download className="w-2.5 h-2.5" />
                      Download
                    </button>
                  </div>
                </div>
                <pre className={`p-4 overflow-x-auto text-[11px] font-semibold leading-relaxed ${
                  readerTheme === 'w3-dark' ? 'bg-slate-950 text-emerald-400' : 'bg-[#f5f6f7] text-[#111]'
                }`}>
                  <code>{codeContent.trim()}</code>
                </pre>
              </div>
            );
          } else {
            return (
              <p key={partIdx} className="leading-relaxed whitespace-pre-line">
                {part}
              </p>
            );
          }
        })}
      </div>
    );
  };

  // Interactive Sandbox states
  const [sandboxCode, setSandboxCode] = useState('');
  const [sandboxTerminal, setSandboxTerminal] = useState('');
  const [sandboxExplanation, setSandboxExplanation] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [lastLoadedDocId, setLastLoadedDocId] = useState<string | null>(null);

  useEffect(() => {
    if (viewingDoc) {
      if (viewingDoc.id !== lastLoadedDocId) {
        setLastLoadedDocId(viewingDoc.id);
        setSandboxTerminal('');
        setSandboxExplanation('');
        setIsEditing(false);
        setSelectedSectionIndex(0);
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsReadingAloud(false);
        
        // Template generator based on category and name
        let defaultTemplate = '';
        const nameLower = viewingDoc.name.toLowerCase();
        const catLower = viewingDoc.category.toLowerCase();
        
        if (catLower.includes('python') || nameLower.includes('python')) {
          defaultTemplate = `# Python Interactive Sandbox\n# Test variables, functions, and loops!\n\ndef greet_student(name):\n    print(f"Hello, {name}! Welcome to NexaLearn AI.")\n\ngreet_student("Joshua")\n\n# Try writing your own Python code below and press Run:\n`;
        } else if (catLower.includes('linux') || nameLower.includes('linux') || catLower.includes('unix')) {
          defaultTemplate = `# Linux Terminal Sandbox\n# Test bash commands and scripting workflows\n\necho "Current user: guest_student"\nls -la /var/log/nginx/\n\n# Try adding bash commands or shell scripts here:\n`;
        } else if (catLower.includes('cisco') || nameLower.includes('router') || nameLower.includes('switch') || catLower.includes('networking')) {
          defaultTemplate = `! Cisco IOS Command Simulator\nenable\nconfigure terminal\ninterface GigabitEthernet0/1\n ip address 192.168.1.1 255.255.255.0\n no shutdown\nshow ip interface brief\n`;
        } else if (catLower.includes('sql') || nameLower.includes('database') || nameLower.includes('query')) {
          defaultTemplate = `-- SQL Query Sandbox\nSELECT student_id, name, course_score\nFROM nexalearn_syllabus_progress\nWHERE completed = true\nORDER BY course_score DESC;\n`;
        } else {
          defaultTemplate = `// NexaLearn Interactive Concept Sandbox\n// Edit this summary, type a query, or paste code to analyze:\n\nmodule_concept = "${viewingDoc.name}"\n\nconsole.log("Analyzing syllabus outcomes for: " + module_concept);\n`;
        }
        setSandboxCode(defaultTemplate);
        
        if (viewingDoc.summary) {
          setActiveSummary(viewingDoc.summary);
          setActiveTabType('summary');
        } else {
          setActiveSummary(null);
          setActiveTabType('reader');
        }
      }
    }
  }, [viewingDoc, lastLoadedDocId]);

  const handleRunSandbox = async () => {
    if (!sandboxCode.trim() || !viewingDoc) return;
    setSandboxLoading(true);
    setSandboxTerminal('[SIMULATOR]: Initializing sandbox environment...\n[SIMULATOR]: Running script parsing engine...');
    try {
      const res = await fetch('/api/ai/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sandboxCode,
          category: viewingDoc.category,
          moduleName: viewingDoc.name,
          userId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      
      setSandboxTerminal(data.terminalOutput || 'Snippet executed.');
      setSandboxExplanation(data.aiExplanation || 'Concept parsed successfully.');
    } catch (err: any) {
      setSandboxTerminal(`[ERROR]: Execution halted.\nDetails: ${err.message || 'Something went wrong.'}`);
      setSandboxExplanation(`Unable to process script via AI. Please verify internet connection or set active GEMINI_API_KEY.`);
    } finally {
      setSandboxLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setUploadStatus('Permission Denied: Only administrators can upload course documents.');
      return;
    }
    if (!uploadFile) return;

    // Client-side file size safety check (Cloud Run payload limit is 32MB, safe limit 30MB)
    if (uploadFile.size > 30 * 1024 * 1024) {
      setUploadStatus(`Error: File is too large (${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB). The maximum allowed upload size is 30MB. Please choose a smaller document or upload as text/markdown.`);
      return;
    }

    setUploadLoading(true);
    setUploadStatus(`Uploading ${uploadFile.name} (${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB) & structuring like Windows Server notes...`);

    const performUpload = async (attempt: number = 1): Promise<any> => {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);
      formData.append('userId', userId || 'usr_student');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'x-user-role': userRole || '',
            'x-user-id': userId || ''
          },
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const responseText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(responseText);
        } catch {
          if (!res.ok) {
            if (res.status === 413) {
              throw new Error(`The uploaded file exceeds the server size limit (${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB). Please select a document under 30MB.`);
            }
            if (res.status === 504 || res.status === 502) {
              throw new Error('Server connection timed out while analyzing the document. Please retry with a text or smaller PDF file.');
            }
            throw new Error(`Server returned HTTP ${res.status} (${res.statusText || 'Error'}).`);
          }
          throw new Error('Server response could not be parsed as valid JSON.');
        }

        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (attempt < 2 && (err?.name === 'AbortError' || err?.message === 'Failed to fetch' || err?.message?.includes('network'))) {
          setUploadStatus('Network interrupted. Retrying upload automatically...');
          await new Promise(r => setTimeout(r, 1500));
          return performUpload(attempt + 1);
        }
        throw err;
      }
    };

    try {
      const data = await performUpload();

      setUploadStatus('Success! File uploaded, indexed, and formatted like Windows Server notes with interactive TOC and diagrams.');
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Auto-load and view the newly uploaded document immediately
      if (data.document) {
        setViewingDoc(data.document);
        if (data.document.summary) {
          setActiveSummary(data.document.summary);
        } else {
          setActiveSummary(null);
        }
        setLayoutMode('split');
        setActiveTabType('original');
      }

      // Safely notify parent to refresh documents list in background
      try {
        await onUpload(uploadFile, uploadCategory);
      } catch (refreshErr) {
        console.warn('Background documents refresh warning:', refreshErr);
      }
    } catch (err: any) {
      const errMsg = err?.message === 'Failed to fetch' 
        ? 'Network request failed. Server connection may have been interrupted or the file is very large. Please retry.'
        : (err?.message || 'Something went wrong.');
      setUploadStatus(`Error: ${errMsg}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Trigger Summary Generator
  const handleTriggerSummary = async (docId: string) => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local view state with calculated summary
      setActiveSummary(data.summary);
      if (viewingDoc) {
        viewingDoc.summary = data.summary;
      }
    } catch (err: any) {
      showToast(`Summarizer issue: ${err.message || 'Unable to compile summary'}`, 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Filter documents based on Category and Search
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.textContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (viewingDoc) {
    const siblingDocs = documents.filter(doc => doc.category === viewingDoc.category);
    const currentDocIndex = siblingDocs.findIndex(doc => doc.id === viewingDoc.id);
    const prevDoc = currentDocIndex > 0 ? siblingDocs[currentDocIndex - 1] : null;
    const nextDoc = currentDocIndex < siblingDocs.length - 1 ? siblingDocs[currentDocIndex + 1] : null;

    const handlePrev = () => {
      if (prevDoc) {
        setViewingDoc(prevDoc);
        if (prevDoc.summary) {
          setActiveSummary(prevDoc.summary);
        } else {
          setActiveSummary(null);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleNext = () => {
      if (nextDoc) {
        setViewingDoc(nextDoc);
        if (nextDoc.summary) {
          setActiveSummary(nextDoc.summary);
        } else {
          setActiveSummary(null);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    return (
      <div className="w-full max-w-full space-y-6 animate-fade-in text-left relative">
        {toastMessage && (
          <div className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold animate-fade-in flex items-center gap-2 max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : toastMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-300'
                : 'bg-slate-900/90 border-indigo-500/30 text-indigo-300'
          }`}>
            <span>{toastMessage.text}</span>
          </div>
        )}
        {/* FULL NOTES LEARNING AREA - EXPANDED TO FULL APP WIDTH */}
        <div className="w-full space-y-6">
          {/* TOP LEVEL STREAMLINED TOOLBAR - Clean & Pro */}
        <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-150'
        } shadow-sm`}>
          {/* Back to syllabus index button & note details */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                onNavigateToSection('documents', undefined, undefined);
                setViewingDoc(null);
                setActiveSummary(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                darkMode 
                  ? 'border-white/10 hover:bg-white/5 text-gray-300' 
                  : 'border-gray-200 hover:bg-gray-150 text-gray-700 bg-gray-50'
              }`}
              id="btn-back-home"
            >
              &larr; Exit to Course Hub
            </button>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-[#04aa6d]">
                {viewingDoc.category}
              </span>
              <h2 className={`font-display font-black text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-md mt-0.5 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {viewingDoc.name}
              </h2>
            </div>
          </div>

          {/* Action, navigation & tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Table of Contents Index */}
            <button
              onClick={() => setShowIndex(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showIndex 
                  ? (darkMode ? 'bg-[#04aa6d]/15 border-[#04aa6d]/30 text-[#04aa6d]' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                  : (darkMode ? 'border-white/10 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900')
              }`}
              title={showIndex ? "Hide Course Index to maximize reading width" : "Show Course Index"}
              id="btn-toggle-index"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showIndex ? 'Index: On' : 'Index: Off'}</span>
            </button>

            {/* Prev / Next Document in Category */}
            <div className="flex items-center gap-1 border-r pr-3 border-gray-200/10 dark:border-white/5">
              <button
                onClick={handlePrev}
                disabled={!prevDoc}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !prevDoc 
                    ? 'opacity-30 cursor-not-allowed text-gray-400' 
                    : darkMode 
                      ? 'hover:bg-white/5 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="Previous Module in this course"
              >
                &larr; Prev Note
              </button>
              <button
                onClick={handleNext}
                disabled={!nextDoc}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !nextDoc 
                    ? 'opacity-30 cursor-not-allowed text-gray-400' 
                    : darkMode 
                      ? 'hover:bg-white/5 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="Next Module in this course"
              >
                Next Note &rarr;
              </button>
            </div>

            {/* Admin Edit button */}
            {userRole === 'admin' && (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center gap-1"
                id="btn-edit-module"
              >
                Edit
              </button>
            )}

            {/* Delete button: only accessible by administrators */}
            {isAdmin && (
              <button
                onClick={() => setDocToDelete(viewingDoc)}
                className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                id="btn-delete-module"
                title="Delete this course note"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE CRITICAL EDITING OVERLAY FOR ADMINS */}
        {isEditing ? (
          <div className="space-y-4 text-left p-6 rounded-3xl border border-dashed border-indigo-500/20 bg-indigo-500/5 animate-fade-in">
            <h4 className="font-display font-black text-sm text-indigo-400">Edit Module Details (CRUD: Update)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500">Module Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 transition-all ${
                    darkMode ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as CategoryName)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 transition-all ${
                    darkMode ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-1">
                <label className="block text-xs font-bold text-gray-500">Syllabus Text Content (Split sections by blank lines)</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={notePhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInsertPhotoToNote}
                  />
                  <button
                    type="button"
                    onClick={() => notePhotoInputRef.current?.click()}
                    disabled={insertPhotoLoading}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Upload and insert a photo/diagram into this note"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{insertPhotoLoading ? 'Uploading Photo...' : '+ Insert Photo / Diagram'}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={12}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 font-mono resize-none transition-all ${
                  darkMode ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {editStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${
                editStatus.startsWith('Error') 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}>
                {editStatus}
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                id="btn-save-edit"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  darkMode ? 'border-slate-800 text-gray-300 hover:bg-white/[0.02]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Split tabs for Reader vs Simulators vs Original Document vs AI Summary vs Sandbox */}
            <div className={`flex border rounded-2xl p-1 overflow-x-auto scrollbar-none whitespace-nowrap gap-1 ${
              darkMode ? 'bg-slate-950/60 border-white/5' : 'bg-gray-100 border-gray-200'
            }`}>
              <button
                onClick={() => { setActiveSummary(null); setActiveTabType('reader'); }}
                className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTabType === 'reader' && layoutMode !== 'full'
                    ? 'bg-[#04aa6d] text-white shadow' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Module Textbook
              </button>

              <button
                onClick={() => { setActiveSummary(null); setActiveTabType('original'); }}
                className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTabType === 'original' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-blue-400 hover:text-blue-300 bg-blue-500/10'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-300" /> Original Document & Drawings
                {viewingDoc.hasDrawings && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-0.5" title="Contains technical drawings/objects" />
                )}
              </button>

              {(viewingDoc.category.toLowerCase().includes('linux') || viewingDoc.name.toLowerCase().includes('linux')) && (
                <button
                  onClick={() => setActiveTabType('linux_sim')}
                  className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTabType === 'linux_sim' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-300" /> Linux OS Simulator
                </button>
              )}

              {(viewingDoc.category.toLowerCase().includes('programming') || 
                viewingDoc.category.toLowerCase().includes('machine learning') || 
                viewingDoc.category.toLowerCase().includes('artificial intelligence') || 
                viewingDoc.name.toLowerCase().includes('python') || 
                viewingDoc.name.toLowerCase().includes('learning')) && (
                <button
                  onClick={() => setActiveTabType('python_sim')}
                  className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTabType === 'python_sim' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-300" /> Python & ML Runner
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTabType('summary');
                  if (viewingDoc.summary) {
                    setActiveSummary(viewingDoc.summary);
                  } else {
                    handleTriggerSummary(viewingDoc.id);
                  }
                }}
                className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTabType === 'summary' 
                    ? 'bg-[#04aa6d] text-white shadow' 
                    : 'text-gray-400 hover:text-gray-350'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" /> Syllabus Summary
              </button>
              
              <button
                onClick={() => setActiveTabType('sandbox')}
                className={`px-4 py-2.5 text-xs font-display font-black rounded-xl transition-all flex-1 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTabType === 'sandbox' 
                    ? 'bg-brand-primary text-white shadow' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-105" /> Concept Sandbox
              </button>
            </div>

            {/* Layout Mode Control Bar: Full Screen vs Side-by-Side vs Standard */}
            <div className={`p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm ${
              darkMode ? 'bg-slate-900/80 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-gray-400 font-semibold text-[11px] flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Screen & Layout View:
                </span>
                <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setLayoutMode('split');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'split'
                        ? 'bg-brand-primary text-white font-bold shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="View original document side-by-side with notes and chapters"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Side-by-Side</span>
                  </button>

                  <button
                    onClick={() => {
                      setLayoutMode('full');
                      setActiveTabType('original');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'full' && activeTabType === 'original'
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Expand original document full width on screen"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Full on Screen</span>
                  </button>

                  <button
                    onClick={() => {
                      setLayoutMode('standard');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'standard' && activeTabType !== 'original'
                        ? 'bg-[#04aa6d] text-white font-bold shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Standard single column view"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Standard View</span>
                  </button>
                </div>
              </div>

              {layoutMode === 'split' ? (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-400">Original Doc Side:</span>
                  <button
                    onClick={() => setSplitSide(prev => prev === 'left' ? 'right' : 'left')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-cyan-300 font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/10"
                    title="Swap whether original document is on the left or right side"
                  >
                    ↔ Swap Sides (Now {splitSide === 'left' ? 'Left' : 'Right'})
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  {viewingDoc.hasDrawings && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[10px]">
                      📐 Technical Drawings & Objects Ready
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Document Content Display Tab Router */}
            {activeTabType === 'reader' && layoutMode !== 'split' && (
              <W3SchoolsNoteViewer
                document={viewingDoc}
                darkMode={darkMode}
                onNavigateHome={() => {
                  onNavigateToSection('documents', undefined, undefined);
                  setViewingDoc(null);
                  setActiveSummary(null);
                }}
                onPrevDoc={prevDoc ? handlePrev : undefined}
                onNextDoc={nextDoc ? handleNext : undefined}
                hasPrevDoc={!!prevDoc}
                hasNextDoc={!!nextDoc}
                onDeleteDoc={() => setDocToDelete(viewingDoc)}
                onEditDoc={userRole === 'admin' ? handleStartEdit : undefined}
                userRole={userRole}
                onLaunchLinuxSimulator={() => setActiveTabType('linux_sim')}
                onLaunchPythonSimulator={() => setActiveTabType('python_sim')}
              />
            )}

            {/* Original Document & Drawings View (when original tab is active OR in split layout mode) */}
            {(activeTabType === 'original' || layoutMode === 'split') && (() => {
              const renderCurriculumCompanion = () => {
                const sections = (viewingDoc.splitContent && viewingDoc.splitContent.length > 0)
                  ? viewingDoc.splitContent
                  : [{
                      id: 'default',
                      title: 'Core Study Module',
                      content: viewingDoc.textContent || 'No text content available in this module.',
                      learningOutcome: 'Understand core syllabus concepts for this course block.'
                    }];

                const activeSec = sections[selectedSectionIndex] || sections[0];
                const exercise = getExerciseForSection(activeSec.id, activeSec.title, activeSec.content);

                return (
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between min-h-[640px] shadow-2xl ${
                    darkMode ? 'bg-[#0f1722] border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    {/* Header */}
                    <div>
                      <div className="pb-3 mb-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#04aa6d]" />
                          <h4 className="font-bold text-sm text-gray-100">Study Notes Companion</h4>
                        </div>
                        <button 
                          onClick={() => { setLayoutMode('standard'); setActiveTabType('reader'); }} 
                          className="text-xs text-[#04aa6d] hover:underline font-bold cursor-pointer"
                        >
                          Open Full Notes &rarr;
                        </button>
                      </div>

                      {/* Chapter Tabs */}
                      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
                        {sections.map((sec, idx) => (
                          <button
                            key={sec.id || idx}
                            onClick={() => setSelectedSectionIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              selectedSectionIndex === idx
                                ? 'bg-[#04aa6d] text-white shadow font-bold'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                            }`}
                          >
                            {idx + 1}. {sec.title.length > 18 ? sec.title.slice(0, 18) + '...' : sec.title}
                          </button>
                        ))}
                      </div>

                      {/* Chapter Meta */}
                      <div className="space-y-1 mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#04aa6d] font-bold">
                          Chapter {selectedSectionIndex + 1} of {sections.length}
                        </span>
                        <h5 className="font-bold text-lg text-gray-100">{activeSec.title}</h5>
                      </div>

                      {activeSec.learningOutcome && (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mb-4">
                          <strong className="font-bold block mb-0.5">Key Learning Outcome:</strong>
                          {activeSec.learningOutcome}
                        </div>
                      )}
                    </div>

                    {/* Scrollable Chapter Content */}
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin text-xs leading-relaxed text-gray-300">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 whitespace-pre-wrap font-sans leading-relaxed">
                        {activeSec.content}
                      </div>

                      {/* Exercise Self-Test */}
                      {exercise && (
                        <div className={`p-4 rounded-2xl border text-left space-y-3 ${
                          darkMode ? 'bg-[#15202b] border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#04aa6d]">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Chapter Mastery Check</span>
                          </div>
                          <p className="font-bold text-xs text-gray-200">{exercise.question}</p>
                          <div className="space-y-1.5">
                            {exercise.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setSelectedAnswer(opt);
                                  setSubmissionResult({ correct: opt === exercise.correctAnswer });
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                                  selectedAnswer === opt
                                    ? 'border-[#04aa6d] bg-[#04aa6d]/15 text-[#04aa6d] font-bold'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-300'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {submissionResult && (
                            <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                              submissionResult.correct
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/20 border-red-500/30 text-red-300'
                            }`}>
                              {submissionResult.correct ? '✓ Correct! Concept verified.' : `✗ Incorrect. Try again!`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Navigation */}
                    <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedSectionIndex(prev => Math.max(0, prev - 1))}
                        disabled={selectedSectionIndex === 0}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 text-gray-300 font-bold cursor-pointer transition-all"
                      >
                        &larr; Prev Chapter
                      </button>
                      <span className="font-mono text-gray-400 text-[11px]">
                        {selectedSectionIndex + 1} / {sections.length}
                      </span>
                      <button
                        onClick={() => setSelectedSectionIndex(prev => Math.min(sections.length - 1, prev + 1))}
                        disabled={selectedSectionIndex >= sections.length - 1}
                        className="px-3.5 py-1.5 rounded-xl bg-[#04aa6d] hover:bg-[#059862] disabled:opacity-30 text-white font-bold cursor-pointer transition-all"
                      >
                        Next Chapter &rarr;
                      </button>
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-4 animate-fade-in text-left">
                  {layoutMode === 'split' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                      {splitSide === 'left' ? (
                        <>
                          <div className="w-full">
                            <OriginalDocumentRenderer 
                              document={viewingDoc} 
                              darkMode={darkMode} 
                              layoutMode="split"
                              onLayoutModeChange={(mode) => setLayoutMode(mode)}
                              onCloseFullscreen={() => setLayoutMode('standard')}
                              splitSide={splitSide}
                              onToggleSplitSide={() => setSplitSide(prev => prev === 'left' ? 'right' : 'left')}
                            />
                          </div>
                          <div className="w-full">
                            {renderCurriculumCompanion()}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-full">
                            {renderCurriculumCompanion()}
                          </div>
                          <div className="w-full">
                            <OriginalDocumentRenderer 
                              document={viewingDoc} 
                              darkMode={darkMode} 
                              layoutMode="split"
                              onLayoutModeChange={(mode) => setLayoutMode(mode)}
                              onCloseFullscreen={() => setLayoutMode('standard')}
                              splitSide={splitSide}
                              onToggleSplitSide={() => setSplitSide(prev => prev === 'left' ? 'right' : 'left')}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <OriginalDocumentRenderer 
                      document={viewingDoc} 
                      darkMode={darkMode} 
                      layoutMode={layoutMode}
                      onLayoutModeChange={(mode) => setLayoutMode(mode)}
                      onCloseFullscreen={() => setLayoutMode('standard')}
                      splitSide={splitSide}
                      onToggleSplitSide={() => setSplitSide(prev => prev === 'left' ? 'right' : 'left')}
                    />
                  )}
                </div>
              );
            })()}

            {activeTabType === 'linux_sim' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-gray-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div>
                    <strong className="text-brand-primary font-display text-sm block mb-0.5">Interactive Linux OS Terminal Simulation</strong>
                    <p className="text-gray-400 text-xs">Simulate Ubuntu 24.04 command-line execution, virtual filesystem hierarchy, bash scripts, and system telemetry.</p>
                  </div>
                  <button
                    onClick={() => setActiveTabType('reader')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-200 font-bold transition-all cursor-pointer shrink-0"
                  >
                    &larr; Back to Textbook
                  </button>
                </div>
                <LinuxSimulator darkMode={darkMode} />
              </div>
            )}

            {activeTabType === 'python_sim' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-gray-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div>
                    <strong className="text-brand-primary font-display text-sm block mb-0.5">Python & Machine Learning Execution Engine</strong>
                    <p className="text-gray-400 text-xs">Write and run Python 3.12 scripts, evaluate least-squares linear regressions, plot scatter graphs, and inspect memory variables.</p>
                  </div>
                  <button
                    onClick={() => setActiveTabType('reader')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-200 font-bold transition-all cursor-pointer shrink-0"
                  >
                    &larr; Back to Textbook
                  </button>
                </div>
                <PythonSimulator 
                  darkMode={darkMode} 
                  initialTemplateId={viewingDoc.category.toLowerCase().includes('machine learning') ? 'ml_regression' : 'py_basics'} 
                />
              </div>
            )}

            {activeTabType === 'sandbox' && (
              <div className="space-y-6 animate-fade-in text-left">
                {(viewingDoc.category.toLowerCase().includes('linux') || viewingDoc.name.toLowerCase().includes('linux')) ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-200 font-bold">Linux Module Active: Running full Ubuntu 24.04 Terminal Simulator</span>
                      </div>
                      <button
                        onClick={() => setActiveTabType('linux_sim')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Open Fullscreen Terminal &gt;
                      </button>
                    </div>
                    <LinuxSimulator darkMode={darkMode} />
                  </div>
                ) : (viewingDoc.category.toLowerCase().includes('programming') || 
                     viewingDoc.category.toLowerCase().includes('machine learning') || 
                     viewingDoc.category.toLowerCase().includes('artificial intelligence') || 
                     viewingDoc.name.toLowerCase().includes('python') || 
                     viewingDoc.name.toLowerCase().includes('learning')) ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-200 font-bold">Python & Machine Learning Simulator Active</span>
                      </div>
                      <button
                        onClick={() => setActiveTabType('python_sim')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Open Fullscreen Runner &gt;
                      </button>
                    </div>
                    <PythonSimulator 
                      darkMode={darkMode} 
                      initialTemplateId={viewingDoc.category.toLowerCase().includes('machine learning') ? 'ml_regression' : 'py_basics'} 
                    />
                  </div>
                ) : (
                  <>
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      darkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-gray-300' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}>
                      <strong className="text-brand-primary block mb-1">NET LEARN Code & Concept Sandbox</strong>
                      Write or modify code, scripts, database queries, or general syllabus concepts below. Hit <strong className="text-brand-primary">Run & Analyze</strong> to simulate live compilation alongside real-time diagnostic insights!
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Textarea Editor Box */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border border-white/5 rounded-t-xl text-[10px] text-gray-400 font-mono">
                          <span>Source Editor ({viewingDoc.category})</span>
                          <span className="text-emerald-400 font-bold">● EDITABLE</span>
                        </div>
                        <textarea
                          value={sandboxCode}
                          onChange={(e) => setSandboxCode(e.target.value)}
                          rows={14}
                          className="w-full p-4 rounded-b-xl font-mono text-xs bg-slate-950 text-gray-100 border border-t-0 border-white/5 focus:outline-none focus:border-emerald-500/30 resize-none scrollbar-thin"
                          placeholder="Type your code or concept notes here..."
                        />
                        
                        <button
                          onClick={handleRunSandbox}
                          disabled={sandboxLoading}
                          className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-white ${
                            sandboxLoading 
                              ? 'bg-emerald-600/40 cursor-not-allowed' 
                              : 'bg-brand-primary hover:bg-brand-primary-hover active:scale-95'
                          }`}
                        >
                          {sandboxLoading ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>AI COMPILES SNIPPET...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>RUN SNIPPET & ANALYZE &gt;</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Outputs: Terminal Console + Explanation */}
                      <div className="space-y-4 flex flex-col justify-between">
                        {/* Simulated terminal console output */}
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block font-bold">Terminal Console Output</span>
                          <div className="bg-black text-emerald-400 font-mono text-[11px] p-4 rounded-xl border border-white/10 shadow-inner flex-1 min-h-[160px] whitespace-pre-wrap overflow-y-auto max-h-[220px]">
                            {sandboxTerminal || `[READY]: Sandbox idle. Modify the code and press the green run button to evaluate outputs.`}
                          </div>
                        </div>

                        {/* Gemini AI explanation block */}
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block font-bold">Code Analysis & Syllabus Insights</span>
                          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-[160px] flex-1">
                            {sandboxExplanation ? (
                              <p className="whitespace-pre-line">{sandboxExplanation}</p>
                            ) : (
                              <div className="text-gray-500 italic py-6 text-center">
                                Awaiting code evaluation... live diagnostics will appear here once executed.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTabType === 'summary' && (
              // AI Summary Viewer
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {summaryLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">Gemini AI is parsing the modules... Generating complete syllabus summaries.</p>
                  </div>
                ) : activeSummary ? (
                  <div className="space-y-6 text-left">
                    <div className={`p-4 rounded-2xl border text-xs ${
                      darkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100 text-indigo-950'
                    }`}>
                      <strong className={`font-display ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Overview Synopsis:</strong>
                      <p className={`mt-1 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-indigo-900'}`}>{activeSummary.overview}</p>
                    </div>

                    {activeSummary.learningOutcomes?.map((outcome, index) => (
                      <div key={index} className={`p-5 rounded-2xl border space-y-4 text-xs ${
                        darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                            darkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                          }`}>outcome {index+1}</span>
                          <h4 className={`font-display font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{outcome.title}</h4>
                        </div>

                        <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="leading-relaxed"><strong>Syllabus Explanation:</strong> {outcome.explanation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Key Points */}
                          <div className={`p-3.5 rounded-xl border ${
                            darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200/60'
                          }`}>
                            <p className={`font-semibold mb-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Key Core Points</p>
                            <ul className={`list-disc pl-4 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {outcome.keyPoints?.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>

                          {/* Important Definitions */}
                          <div className={`p-3.5 rounded-xl border ${
                            darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200/60'
                          }`}>
                            <p className={`font-semibold mb-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Vocabulary Definitions</p>
                            <ul className="space-y-1.5">
                              {outcome.importantDefinitions?.map((d, i) => (
                                <li key={i} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  <strong className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{d.term}:</strong> {d.definition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Metaphors & Examples */}
                        <div className={`p-3.5 rounded-xl border ${
                          darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200/60'
                        }`}>
                          <p className={`font-semibold mb-1.5 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Practical Metaphors & Labs</p>
                          <ul className={`list-disc pl-4 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {outcome.examples?.map((ex, i) => <li key={i}>{ex}</li>)}
                          </ul>
                        </div>

                        {/* Exam tips and common mistakes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-3.5 border rounded-xl ${
                            darkMode ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-50 border-amber-200/80'
                          }`}>
                            <p className={`font-semibold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>National Exam Tip</p>
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{outcome.examTips?.join(', ')}</p>
                          </div>
                          <div className={`p-3.5 border rounded-xl ${
                            darkMode ? 'bg-red-500/5 border-red-500/15' : 'bg-red-50 border-red-200/80'
                          }`}>
                            <p className={`font-semibold mb-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Common Pitfall Faults</p>
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{outcome.commonMistakes?.join(', ')}</p>
                          </div>
                        </div>

                        {/* National Exam Questions */}
                        {outcome.nationalExamQuestions && outcome.nationalExamQuestions.length > 0 && (
                          <div className={`p-3.5 border rounded-xl ${
                            darkMode ? 'bg-indigo-500/5 border-indigo-500/15' : 'bg-indigo-50 border-indigo-200/80'
                          }`}>
                            <p className={`font-semibold mb-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Past National Exam Sample</p>
                            {outcome.nationalExamQuestions.map((q, i) => (
                              <div key={i} className="space-y-1">
                                <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}><strong>Q:</strong> {q.question}</p>
                                <p className={darkMode ? 'text-emerald-400' : 'text-emerald-700 font-semibold'}><strong>A:</strong> {q.answer}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Revision Notes Summary */}
                        <div className={`p-3.5 border rounded-xl ${
                          darkMode ? 'bg-teal-500/5 border-teal-500/15' : 'bg-teal-50 border-teal-200/80'
                        }`}>
                          <p className={`font-semibold mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-700'}`}>Quick Revision Notes</p>
                          <p className={`italic leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{outcome.shortRevisionSummary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                    <p className="text-xs text-gray-400 font-semibold">No syllabus summary is currently available for this module.</p>
                    <button
                      onClick={() => handleTriggerSummary(viewingDoc.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate AI Summary
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick action buttons linked to other panels & simulators */}
            <div className="pt-4 border-t border-gray-200/10 dark:border-gray-800/40 flex flex-wrap gap-3">
              {(viewingDoc.category.toLowerCase().includes('linux') || viewingDoc.name.toLowerCase().includes('linux')) && (
                <button
                  onClick={() => setActiveTabType('linux_sim')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" /> Launch Linux OS Simulator
                </button>
              )}

              {(viewingDoc.category.toLowerCase().includes('programming') || 
                viewingDoc.category.toLowerCase().includes('machine learning') || 
                viewingDoc.category.toLowerCase().includes('artificial intelligence') || 
                viewingDoc.name.toLowerCase().includes('python') || 
                viewingDoc.name.toLowerCase().includes('learning')) && (
                <button
                  onClick={() => setActiveTabType('python_sim')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Code2 className="w-3.5 h-3.5" /> Launch Python & ML Runner
                </button>
              )}

              <button
                onClick={() => onNavigateToSection('ai_chat', undefined, viewingDoc.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-brand-primary text-white flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Ask AI Companion about this chapter
              </button>
              <button
                onClick={() => onNavigateToSection('teacher', undefined, viewingDoc.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Open Step-by-Step AI Teacher
              </button>
              <button
                onClick={() => onNavigateToSection('flashcards', undefined, viewingDoc.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" /> Practice Flashcards
              </button>
              <button
                onClick={() => onNavigateToSection('exams', viewingDoc.category as any, viewingDoc.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Take Exam / Practice Assessment
              </button>
            </div>
          </div>
        )}

      {/* LOWER PAGINATION BUTTONS FOR CONVENIENT STUDYFLOW */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'
          } shadow-sm`}>
            <button
              onClick={handlePrev}
              disabled={!prevDoc}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                !prevDoc 
                  ? 'opacity-30 cursor-not-allowed text-gray-500 bg-gray-500/10' 
                  : darkMode 
                    ? 'bg-slate-900 border border-slate-800 hover:border-white/20 text-gray-200' 
                    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-800'
              }`}
            >
              &larr; Previous Chapter
            </button>
            <button
              onClick={handleNext}
              disabled={!nextDoc}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 text-slate-100 ${
                !nextDoc 
                  ? 'opacity-30 cursor-not-allowed bg-brand-primary/30 text-emerald-950/40' 
                  : 'bg-brand-primary hover:bg-brand-primary-hover'
              }`}
            >
              Next Chapter &rarr;
            </button>
          </div>
        </div>

        {/* SIBLING MODULES IN COURSE (Horizontal bar if multiple notes exist) */}
        {siblingDocs.length > 1 && (
          <div className={`p-4 rounded-2xl border ${
            darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-150'
          } shadow-sm space-y-2`}>
            <span className="text-[10px] font-mono font-bold text-[#04aa6d] uppercase tracking-widest">
              More {viewingDoc.category} Notes ({siblingDocs.length})
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {siblingDocs.map(doc => {
                const isActive = doc.id === viewingDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setViewingDoc(doc);
                      if (doc.summary) setActiveSummary(doc.summary);
                      else setActiveSummary(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? (darkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                        : (darkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white border border-white/5' : 'hover:bg-gray-100 text-gray-600 border border-gray-200')
                    }`}
                  >
                    <span>{doc.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {renderDeleteModal()}
        {renderResetModal()}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
      {/* LEFT & CENTER PANEL: Document List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Main File List Explorer */}
        <div className="space-y-6">
          {/* Search, Filter headers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search technical syllabus, concepts, or documents..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-950/60 border-slate-800/80 text-white focus:border-indigo-500/60' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-500'
                }`}
                id="doc-list-search-input"
              />
            </div>

            {/* Category Dropdown filters */}
            <div className="flex gap-2.5">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as any)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-950/60 border-slate-800/80 text-white focus:border-indigo-500/60' 
                    : 'bg-white border-gray-200 text-gray-950 focus:border-indigo-500'
                }`}
                id="doc-category-selector"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {isAdmin && (
                <button
                  onClick={() => {
                    const el = document.getElementById('uploader-card-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm"
                  id="btn-scroll-to-uploader"
                  title="Upload new course notes"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Notes
                </button>
              )}
            </div>
          </div>

          {/* Grid of existing Documents */}
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocuments.map(doc => {
                const isBookmarked = doc.bookmarks?.includes(userId);
                return (
                  <div
                    key={doc.id}
                    className={`p-5 rounded-2xl border hover-scale-up text-left flex flex-col justify-between ${
                      darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-[9px] font-semibold text-indigo-400 truncate">
                          {doc.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onToggleBookmark(doc.id)}
                            className={`text-gray-500 hover:text-white transition-all ${isBookmarked ? 'text-emerald-400' : ''}`}
                            id={`bookmark-icon-btn-${doc.id}`}
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDocToDelete(doc)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                              id={`btn-delete-module-grid-${doc.id}`}
                              title="Delete this course note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className={`font-display font-bold text-sm line-clamp-2 leading-snug ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{doc.name}</h4>
                      <p className="text-[10px] text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()} &bull; {Math.round(doc.size / 1024)} KB</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-200/10 dark:border-gray-800/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">{doc.type} module</span>
                      <button
                        onClick={() => { setViewingDoc(doc); setActiveSummary(null); }}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        id={`btn-read-online-${doc.id}`}
                      >
                        Read & Study <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-10 text-center border-2 border-dashed rounded-3xl ${
              darkMode ? 'border-gray-800 bg-slate-900/30' : 'border-gray-200 bg-gray-50/70'
            } space-y-4`}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className={`font-display font-black text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCategory !== 'All' 
                    ? `No Notes Uploaded Yet for ${selectedCategory}` 
                    : 'No Course Notes in Library'}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  All official syllabus notes, textbook materials, and revision summaries are uploaded by the Institution Administrator. Once uploaded, they will be accessible here, in NIT AI mentorship, and in exam simulators.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      const el = document.getElementById('uploader-card-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Notes for {selectedCategory !== 'All' ? selectedCategory : 'This Course'}</span>
                  </button>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    Course syllabus notes and study materials are uploaded by institution administrators.
                  </div>
                )}
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    View All Courses
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Intelligent Drag & Drop Document Uploader / Manual Notes */}
      <div className="space-y-6" id="uploader-card-section">
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm text-center space-y-6`}>
          <div className="text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Admin Notes Upload
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Curriculum Portal
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-emerald-600">Upload Course Notes</h3>
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin 
                ? 'Upload syllabus files (PDF, DOCX, TXT, images/blueprints) or write manual notes. Uploaded notes are saved and immediately readable by students.'
                : 'Curriculum document uploading is restricted to accredited institution administrators.'}
            </p>
          </div>

          {!isAdmin ? (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-400">Admin-Only Upload Zone</h4>
                  <p className="text-[11px] text-amber-500/80 font-medium">Instructor Document Management</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Only authenticated administrators can upload new syllabus notes, documents, and technical diagrams to the curriculum library. Other users cannot upload documents.
              </p>
              <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Your Role: <strong className="text-gray-200 capitalize">{userRole || 'Student'}</strong>
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded font-mono font-bold">
                  Upload Restricted
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Tab selectors */}
              <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-950/60 border dark:border-white/5">
                <button
                  onClick={() => setUploaderTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    uploaderTab === 'upload' 
                      ? 'bg-white dark:bg-[#111] text-emerald-400 shadow-sm border dark:border-white/5' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Upload File (PDF/TXT)
                </button>
                <button
                  onClick={() => setUploaderTab('manual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    uploaderTab === 'manual' 
                      ? 'bg-white dark:bg-[#111] text-emerald-400 shadow-sm border dark:border-white/5' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Manual Notes (CRUD: Create)
                </button>
              </div>

              {uploaderTab === 'upload' ? (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* Category selection */}
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assign Category</label>
                    <select
                      value={uploadCategory}
                      onChange={e => setUploadCategory(e.target.value as CategoryName)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-slate-950/60 border-slate-800/80 text-white focus:border-indigo-500/60' 
                          : 'bg-white border-gray-200 text-gray-950 focus:border-indigo-500'
                      }`}
                      id="upload-category-field"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Drag & Drop Box */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-gray-300/30 hover:border-indigo-500/50 bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.svg,.webp,.docx,.pptx,.txt,.md"
                      className="hidden"
                      id="doc-file-upload-input"
                    />
                    <Upload className="w-8 h-8 text-gray-400" />
                    {uploadFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-600 truncate max-w-[200px] mx-auto">{uploadFile.name}</p>
                        <p className="text-[10px] text-gray-500">{Math.round(uploadFile.size / 1024)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-gray-405">Supports PDF, Images (PNG, JPG, SVG), Blueprints, Drawings, DOCX, TXT</p>
                      </div>
                    )}
                  </div>

                  {/* Status alerts */}
                  {uploadStatus && (
                    <div className="p-3 rounded-xl text-xs font-medium bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-start gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{uploadStatus}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!uploadFile || uploadLoading}
                    className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-sm shadow-lg hover:shadow-brand-primary/10 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    id="btn-upload-submit"
                  >
                    {uploadLoading ? 'Uploading...' : 'Index Document Intel'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Module Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Subnetting & IP addressing guide"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 transition-all ${
                        darkMode 
                          ? 'bg-slate-950/60 border-slate-800/80 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      id="manual-module-title"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Assign Category</label>
                    <select
                      value={manualCategory}
                      onChange={e => setManualCategory(e.target.value as CategoryName)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-slate-950/60 border-slate-800/80 text-white' 
                          : 'bg-white border-gray-200 text-gray-950'
                      }`}
                      id="manual-category-field"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Syllabus Text Content</label>
                    <textarea
                      rows={8}
                      placeholder="Type or paste your syllabus chapter, revision notes, or text content here. Put empty lines between paragraphs to auto-generate syllabus textbook reader sections!"
                      value={manualContent}
                      onChange={e => setManualContent(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 font-mono resize-none transition-all ${
                        darkMode 
                          ? 'bg-slate-950/60 border-slate-800/80 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      id="manual-content-field"
                    />
                  </div>

                  {manualStatus && (
                    <div className={`p-3 rounded-xl text-xs font-semibold border ${
                      manualStatus.startsWith('Error') 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {manualStatus}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={manualLoading}
                    className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-sm shadow-lg hover:shadow-brand-primary/10 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    id="btn-manual-submit"
                  >
                    {manualLoading ? 'Creating Syllabus...' : 'Create Study Module'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {renderDeleteModal()}
      {renderResetModal()}
    </div>
  );
}
