import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, BookOpen, Check, Play, HelpCircle, Terminal, Code2, Eye, Download, 
  Copy, Volume2, VolumeX, Printer, Lightbulb, AlertTriangle, Info, ChevronRight, 
  ChevronLeft, ChevronDown, ChevronUp, RefreshCw, Sparkles, CheckCheck, Bookmark, 
  ArrowRight, ArrowLeft, Layers, Sliders, Sun, Moon, Maximize2, Minimize2, 
  FileText, Split, Share2, Award, CornerDownLeft, RotateCcw, X, CheckCircle2, Hash,
  Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, ExternalLink, Camera, Edit
} from 'lucide-react';
import { Document, CategoryName } from '../types.js';

interface W3SchoolsNoteViewerProps {
  document: Document;
  darkMode: boolean;
  onNavigateHome: () => void;
  onPrevDoc?: () => void;
  onNextDoc?: () => void;
  hasPrevDoc?: boolean;
  hasNextDoc?: boolean;
  onDeleteDoc?: () => void;
  onEditDoc?: () => void;
  userRole?: string;
  onLaunchLinuxSimulator?: () => void;
  onLaunchPythonSimulator?: () => void;
}

export type W3Theme = 'w3-light' | 'w3-dark' | 'w3-sepia';

interface ExerciseState {
  question: string;
  type: 'multiple-choice' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
  hint?: string;
  codeSnippet?: string;
  explanation?: string;
}

export default function W3SchoolsNoteViewer({
  document: doc,
  darkMode,
  onNavigateHome,
  onPrevDoc,
  onNextDoc,
  hasPrevDoc,
  hasNextDoc,
  onDeleteDoc,
  onEditDoc,
  userRole,
  onLaunchLinuxSimulator,
  onLaunchPythonSimulator
}: W3SchoolsNoteViewerProps) {
  // Theme & Appearance State
  const [theme, setTheme] = useState<W3Theme>(darkMode ? 'w3-dark' : 'w3-light');
  const [fontSize, setFontSize] = useState<number>(15); // Default 15px reading font
  const [readingWidth, setReadingWidth] = useState<'comfortable' | 'wide'>('comfortable');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inPageSearch, setInPageSearch] = useState<string>('');
  const [showInPageSearch, setShowInPageSearch] = useState<boolean>(false);

  // Synchronize with external darkMode toggle if changed
  useEffect(() => {
    setTheme(darkMode ? 'w3-dark' : 'w3-light');
  }, [darkMode]);

  // Document Sections & Active Section
  const rawSections = useMemo(() => {
    if (doc.splitContent && doc.splitContent.length > 0) {
      return doc.splitContent;
    }
    return [{
      id: 'sec_1',
      title: doc.name.replace(/\.[^/.]+$/, ''),
      content: doc.textContent || 'No text content available in this note.',
      learningOutcome: `Understand core concepts of ${doc.name}.`
    }];
  }, [doc]);

  // Clean and enrich sections for optimal W3Schools structure
  const sections = useMemo(() => {
    return rawSections.map((sec, idx) => {
      let cleanTitle = sec.title;
      // If title is generic like "Section 2 of TeM_NITCS501_ Cyber Security.pdf"
      // extract actual meaningful header from content if available!
      if (/^section \d+ of/i.test(cleanTitle) || /^overview of/i.test(cleanTitle)) {
        const firstLine = sec.content.trim().split('\n')[0];
        if (firstLine && firstLine.length < 90 && (
          /chapter/i.test(firstLine) ||
          /module/i.test(firstLine) ||
          /tutorial/i.test(firstLine) ||
          /^[0-9]+\./.test(firstLine) ||
          /overview/i.test(firstLine) ||
          /introduction/i.test(firstLine)
        )) {
          cleanTitle = firstLine.replace(/^[#\s*]+/, '').trim();
        } else {
          cleanTitle = `Topic ${idx + 1}: ${doc.category || 'Fundamentals'}`;
        }
      }
      return {
        ...sec,
        title: cleanTitle
      };
    });
  }, [rawSections, doc]);

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const activeSection = sections[activeSectionIndex] || sections[0];

  // Completed chapters tracking (saved in localStorage for learner persistence)
  const [completedSections, setCompletedSections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`w3_completed_${doc.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSectionCompletion = (id: string) => {
    setCompletedSections(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem(`w3_completed_${doc.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filtered sidebar topics
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
  }, [sections, searchQuery]);

  // Navigation handlers
  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopSpeech();
    }
  };

  const handleNextSection = () => {
    if (activeSectionIndex < sections.length - 1) {
      setActiveSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopSpeech();
    }
  };

  // Table of Contents Interactive Navigation & Drawer State
  const [tocDrawerOpen, setTocDrawerOpen] = useState<boolean>(false);
  const [tocFilterQuery, setTocFilterQuery] = useState<string>('');
  const [jumpToast, setJumpToast] = useState<{ message: string; sub?: string; visible: boolean } | null>(null);

  const handleJumpToTocTarget = (title: string, page?: string) => {
    const cleanTarget = title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // 1. Look for section matching in sections list
    let matchedIndex = -1;

    // 1a. Indicative content number e.g. "1.1", "2.3", "8.5"
    const indMatch = title.match(/(\d+\.\d+)/);
    if (indMatch) {
      const num = indMatch[1];
      matchedIndex = sections.findIndex(s => s.title.includes(num));
    }

    // 1b. Assessment e.g. "Learning outcome 1 end assessment"
    if (matchedIndex === -1) {
      const assessMatch = title.match(/outcome\s+(\d+)\s+end\s+assessment/i);
      if (assessMatch) {
        const outcomeNum = assessMatch[1];
        matchedIndex = sections.findIndex(s => {
          const lower = s.title.toLowerCase();
          return lower.includes(`outcome ${outcomeNum}`) && lower.includes('assessment');
        });
      }
    }

    // 1c. Learning Outcome e.g. "Learning Outcome 1" or "Outcome 1"
    if (matchedIndex === -1) {
      const outcomeMatch = title.match(/outcome\s+(\d+)/i);
      if (outcomeMatch) {
        const outcomeNum = outcomeMatch[1];
        matchedIndex = sections.findIndex(s => {
          const lower = s.title.toLowerCase();
          return lower.includes(`outcome ${outcomeNum}`) && !lower.includes('indicative') && !lower.includes('assessment');
        });
      }
    }

    // 1c2. Chapter e.g. "Chapter 1", "Chapter 2", "Unit 1"
    if (matchedIndex === -1) {
      const chapMatch = title.match(/(?:chapter|unit|module)\s+(\d+)/i);
      if (chapMatch) {
        const chapNum = chapMatch[1];
        matchedIndex = sections.findIndex(s => {
          const lower = s.title.toLowerCase();
          return lower.includes(`chapter ${chapNum}`) || lower.includes(`unit ${chapNum}`) || lower.includes(`module ${chapNum}`);
        });
      }
    }

    // 1d. Module overview or introduction across any course
    if (matchedIndex === -1) {
      if (cleanTarget.includes('module code') || cleanTarget.includes('overview') || cleanTarget.includes('introduction') || cleanTarget.includes('principles')) {
        matchedIndex = sections.length > 1 ? 1 : 0;
      } else if (cleanTarget.includes('table of content') || cleanTarget.includes('author') || cleanTarget.includes('acknowledgement') || cleanTarget.includes('acronym')) {
        matchedIndex = 0;
      }
    }

    // 1e. General title substring matching
    if (matchedIndex === -1) {
      matchedIndex = sections.findIndex(s => {
        const cleanSec = s.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        return cleanSec.includes(cleanTarget) || cleanTarget.includes(cleanSec);
      });
    }

    // 1f. Word intersection matching for multi-word topic titles
    if (matchedIndex === -1) {
      const targetWords = cleanTarget.split(' ').filter(w => w.length > 3 && !['indicative', 'content', 'outcome', 'learning'].includes(w));
      if (targetWords.length > 0) {
        let bestScore = 0;
        let bestIdx = -1;
        sections.forEach((s, idx) => {
          const secTitleLower = s.title.toLowerCase();
          const matchCount = targetWords.filter(w => secTitleLower.includes(w)).length;
          if (matchCount > bestScore) {
            bestScore = matchCount;
            bestIdx = idx;
          }
        });
        if (bestScore >= 2 || (targetWords.length === 1 && bestScore === 1)) {
          matchedIndex = bestIdx;
        }
      }
    }

    // 1g. Fallback content search
    if (matchedIndex === -1 && cleanTarget.length > 5) {
      const snippet = cleanTarget.substring(0, 25);
      matchedIndex = sections.findIndex(s => s.content.toLowerCase().includes(snippet));
    }

    if (matchedIndex !== -1) {
      setActiveSectionIndex(matchedIndex);
      setTocDrawerOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopSpeech();

      setJumpToast({
        message: `Navigated to: ${title}`,
        sub: page ? `Trainee Manual Page: ${page}` : undefined,
        visible: true
      });
      setTimeout(() => {
        setJumpToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);

      // Scroll and highlight matching heading in the newly active section
      setTimeout(() => {
        const query = cleanTarget.substring(0, 20);
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, strong'));
        const found = elements.find(el => el.textContent?.toLowerCase().includes(query) || (page && el.textContent?.includes(`-- ${page} of`)));
        if (found) {
          found.scrollIntoView({ behavior: 'smooth', block: 'center' });
          found.classList.add('ring-4', 'ring-[#04aa6d]', 'bg-[#04aa6d]/20', 'rounded-xl', 'p-2', 'transition-all', 'duration-500');
          setTimeout(() => {
            found.classList.remove('ring-4', 'ring-[#04aa6d]', 'bg-[#04aa6d]/20', 'rounded-xl', 'p-2');
          }, 3000);
        }
      }, 350);
      return;
    }

    // If single page or target within same section:
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, strong'));
    const found = elements.find(el => el.textContent?.toLowerCase().includes(cleanTarget.substring(0, 20)) || (page && el.textContent?.includes(`-- ${page} of`)));
    if (found) {
      setTocDrawerOpen(false);
      found.scrollIntoView({ behavior: 'smooth', block: 'center' });
      found.classList.add('ring-4', 'ring-[#04aa6d]', 'bg-[#04aa6d]/20', 'rounded-xl', 'p-2', 'transition-all', 'duration-500');
      setTimeout(() => {
        found.classList.remove('ring-4', 'ring-[#04aa6d]', 'bg-[#04aa6d]/20', 'rounded-xl', 'p-2');
      }, 3000);

      setJumpToast({
        message: `Jumped to: ${title}`,
        sub: page ? `Manual Page ${page}` : undefined,
        visible: true
      });
      setTimeout(() => {
        setJumpToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
    }
  };

  // Text-To-Speech (Read Aloud)
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    }
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isReadingAloud) {
      stopSpeech();
      return;
    }

    const textToRead = `${activeSection.title}. ${activeSection.content.replace(/```[\s\S]*?```/g, 'Code example omitted.')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Image & Photo Viewing, Lightbox and Figures Gallery States
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string; alt?: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(100);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);
  const [showFiguresDrawer, setShowFiguresDrawer] = useState<boolean>(false);
  const [figuresFilterQuery, setFiguresFilterQuery] = useState<string>('');
  const [copiedImageUrl, setCopiedImageUrl] = useState<boolean>(false);
  const [showDocImageHero, setShowDocImageHero] = useState<boolean>(true);

  // Check if current document is an image or photo note
  const isImageDoc = useMemo(() => {
    const type = (doc.type || '').toLowerCase();
    const mime = (doc.originalMimeType || '').toLowerCase();
    return ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp'].includes(type) ||
      mime.startsWith('image/') ||
      !!(doc.fileData && doc.fileData.startsWith('data:image/')) ||
      /\.(png|jpe?g|svg|webp|gif|bmp)$/i.test(doc.name);
  }, [doc]);

  // Aggregate all photos and diagrammatic illustrations across the document & sections
  const allDocumentImages = useMemo(() => {
    const list: Array<{ url: string; caption: string; sectionTitle?: string; sectionIndex?: number }> = [];

    // 1. If document itself is an image
    if (isImageDoc) {
      const url = doc.fileData || doc.fileUrl || `/api/documents/${doc.id}/file`;
      list.push({
        url,
        caption: doc.name,
        sectionTitle: 'Original Document Photograph / Blueprint',
        sectionIndex: 0
      });
    }

    // 2. Document-level images array
    if (doc.images && Array.isArray(doc.images)) {
      doc.images.forEach(img => {
        if (img && img.url) {
          list.push({ url: img.url, caption: img.caption || img.alt || doc.name, sectionTitle: 'Document Attachment' });
        }
      });
    }

    // 3. Section-level images and markdown embedded images
    sections.forEach((sec, sIdx) => {
      // Attached section images
      if (sec.images && Array.isArray(sec.images)) {
        sec.images.forEach(img => {
          if (img && img.url) {
            list.push({ url: img.url, caption: img.caption || img.alt || sec.title, sectionTitle: sec.title, sectionIndex: sIdx });
          }
        });
      }

      // Markdown image tags ![alt](url)
      const mdMatches = [...sec.content.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
      for (const m of mdMatches) {
        if (m[2]) {
          list.push({ url: m[2], caption: m[1] || 'Figure Illustration', sectionTitle: sec.title, sectionIndex: sIdx });
        }
      }

      // HTML <img> tags
      const htmlMatches = [...sec.content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"']*)["']?[^>]*>/gi)];
      for (const m of htmlMatches) {
        if (m[1]) {
          list.push({ url: m[1], caption: m[2] || 'Document Photograph', sectionTitle: sec.title, sectionIndex: sIdx });
        }
      }
    });

    // Deduplicate by URL
    const seen = new Set<string>();
    return list.filter(item => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }, [doc, isImageDoc, sections]);

  // Keyboard navigation for Lightbox (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) setLightboxImage(null);
        if (showFiguresDrawer) setShowFiguresDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, showFiguresDrawer]);

  const handleZoomInLightbox = () => setLightboxZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOutLightbox = () => setLightboxZoom(prev => Math.max(prev - 25, 25));
  const handleResetZoomLightbox = () => { setLightboxZoom(100); setLightboxRotation(0); };
  const handleRotateLightbox = () => setLightboxRotation(prev => (prev + 90) % 360);
  const handleDownloadLightbox = () => {
    if (!lightboxImage) return;
    const a = document.createElement('a');
    a.href = lightboxImage.url;
    a.download = (lightboxImage.caption || 'document_image').replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleCopyImageLink = () => {
    if (!lightboxImage) return;
    navigator.clipboard.writeText(lightboxImage.url);
    setCopiedImageUrl(true);
    setTimeout(() => setCopiedImageUrl(false), 2000);
  };

  // In-line "Try It Yourself" Sandbox States
  // Maps code block ID -> { open: boolean, code: string, output: string, mode: 'preview' | 'console', running: boolean }
  const [inlineRunners, setInlineRunners] = useState<Record<string, {
    open: boolean;
    code: string;
    output: string;
    running: boolean;
    language: string;
  }>>({});

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleTryIt = (blockId: string, initialCode: string, lang: string) => {
    setInlineRunners(prev => {
      const current = prev[blockId];
      if (current && current.open) {
        return {
          ...prev,
          [blockId]: { ...current, open: false }
        };
      }
      return {
        ...prev,
        [blockId]: {
          open: true,
          code: current?.code || initialCode,
          output: current?.output || 'Click "Run Code »" to execute this example and see the result.',
          running: false,
          language: lang
        }
      };
    });
  };

  const handleExecuteInlineCode = async (blockId: string) => {
    const runner = inlineRunners[blockId];
    if (!runner) return;

    setInlineRunners(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], running: true, output: 'Executing snippet...' }
    }));

    const lang = runner.language.toLowerCase();
    const code = runner.code;

    // 1. JavaScript Execution (Fast client sandbox)
    if (lang === 'javascript' || lang === 'js') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push(`[Error]: ${args.join(' ')}`),
          warn: (...args: any[]) => logs.push(`[Warning]: ${args.join(' ')}`),
          info: (...args: any[]) => logs.push(`[Info]: ${args.join(' ')}`)
        };

        const fn = new Function('console', code);
        fn(customConsole);

        const out = logs.length > 0 ? logs.join('\n') : '(Script executed successfully with no console output)';
        setInlineRunners(prev => ({
          ...prev,
          [blockId]: { ...prev[blockId], running: false, output: out }
        }));
      } catch (err: any) {
        setInlineRunners(prev => ({
          ...prev,
          [blockId]: { ...prev[blockId], running: false, output: `Runtime Error: ${err.message}` }
        }));
      }
      return;
    }

    // 2. Python Execution via server API or intelligent simulation
    if (lang === 'python' || lang === 'py') {
      try {
        const res = await fetch('/api/ai/code/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language: 'python' })
        });
        if (res.ok) {
          const data = await res.json();
          setInlineRunners(prev => ({
            ...prev,
            [blockId]: { ...prev[blockId], running: false, output: data.output || '>>> Process finished with exit code 0' }
          }));
          return;
        }
      } catch {}

      // Fallback local python simulation
      setTimeout(() => {
        let simulated = '';
        if (code.includes('print(')) {
          const matches = code.match(/print\((['"])(.*?)\1\)/g);
          if (matches) {
            simulated = matches.map(m => m.replace(/print\((['"])/, '').replace(/(['"])\)/, '')).join('\n');
          }
        }
        if (!simulated) {
          simulated = `>>> python3 script.py\n[Python 3.11.8 Runtime]:\nOutput:\nHello from W3Schools Python Example!\nExecution completed in 0.04s.`;
        }
        setInlineRunners(prev => ({
          ...prev,
          [blockId]: { ...prev[blockId], running: false, output: simulated }
        }));
      }, 400);
      return;
    }

    // 3. Bash / Linux Commands
    if (['bash', 'sh', 'shell', 'linux', 'cisco'].includes(lang)) {
      setTimeout(() => {
        let simulatedOut = '';
        if (code.includes('ls')) {
          simulatedOut = 'bin   dev  home  lib64       mnt  proc  run   srv  tmp  var\nboot  etc  lib   lost+found  opt  root  sbin  sys  usr';
        } else if (code.includes('pwd')) {
          simulatedOut = '/var/www/html/tutorials';
        } else if (code.includes('whoami')) {
          simulatedOut = 'student';
        } else if (code.includes('ifconfig') || code.includes('ip a')) {
          simulatedOut = 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500\n        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255';
        } else if (code.includes('show ip route')) {
          simulatedOut = 'Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP\nGateway of last resort is 192.168.1.1 to network 0.0.0.0\nC    192.168.1.0/24 is directly connected, GigabitEthernet0/0';
        } else {
          simulatedOut = `$ ${code.trim().split('\n')[0]}\nCommand executed successfully with return code 0.`;
        }
        setInlineRunners(prev => ({
          ...prev,
          [blockId]: { ...prev[blockId], running: false, output: simulatedOut }
        }));
      }, 350);
      return;
    }

    // 4. SQL Execution
    if (lang === 'sql') {
      setTimeout(() => {
        const simulated = `+----+----------------------+-------------------+------------+\n| ID | CustomerName         | ContactName       | Country    |\n+----+----------------------+-------------------+------------+\n| 1  | Alfreds Futterkiste  | Maria Anders      | Germany    |\n| 2  | Ana Trujillo Empared | Ana Trujillo      | Mexico     |\n| 3  | Antonio Moreno Taqu  | Antonio Moreno    | Mexico     |\n+----+----------------------+-------------------+------------+\n3 rows in set (0.01 sec)`;
        setInlineRunners(prev => ({
          ...prev,
          [blockId]: { ...prev[blockId], running: false, output: simulated }
        }));
      }, 300);
      return;
    }

    // Default HTML or Generic
    setTimeout(() => {
      setInlineRunners(prev => ({
        ...prev,
        [blockId]: { ...prev[blockId], running: false, output: `[W3Schools Sandbox]: Result rendered for ${lang.toUpperCase()}.\nSnippet ready for interactive modifications.` }
      }));
    }, 250);
  };

  // Interactive Exercises System
  const [exerciseAnswer, setExerciseAnswer] = useState<string>('');
  const [exerciseSubmitted, setExerciseSubmitted] = useState<boolean>(false);
  const [exerciseIsCorrect, setExerciseIsCorrect] = useState<boolean>(false);
  const [showExerciseAnswer, setShowExerciseAnswer] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Reset exercise when changing chapter
  useEffect(() => {
    setExerciseAnswer('');
    setExerciseSubmitted(false);
    setExerciseIsCorrect(false);
    setShowExerciseAnswer(false);
    setShowHint(false);
  }, [activeSectionIndex]);

  // Generate dynamic, context-aware exercise for active section
  const currentExercise = useMemo<ExerciseState>(() => {
    const t = activeSection.title.toLowerCase();
    const c = activeSection.content.toLowerCase();
    const categoryLower = (doc.category || '').toLowerCase();

    // 1. Python Exercises
    if (categoryLower.includes('python') || categoryLower.includes('programming') || t.includes('python') || c.includes('python')) {
      if (t.includes('variable') || c.includes('variable')) {
        return {
          question: 'Insert the correct syntax to assign the value 50 to a variable named carname:',
          type: 'fill-blank',
          codeSnippet: '_____ = 50',
          correctAnswer: 'carname',
          hint: 'Variable names in Python are followed by the assignment operator (=).',
          explanation: 'In Python, variables are created when you assign a value to it: carname = 50.'
        };
      }
      if (t.includes('syntax') || t.includes('print') || c.includes('print')) {
        return {
          question: 'What is the correct syntax to output "Hello World" in Python?',
          type: 'multiple-choice',
          options: ['echo "Hello World"', 'print("Hello World")', 'p("Hello World")', 'Console.WriteLine("Hello World")'],
          correctAnswer: 'print("Hello World")',
          hint: 'Python uses the built-in print() function to output messages.',
          explanation: 'The print() function prints the specified message to the screen.'
        };
      }
      return {
        question: 'Which method can be used to remove any whitespace from both the beginning and the end of a string?',
        type: 'multiple-choice',
        options: ['strip()', 'trim()', 'len()', 'ptrim()'],
        correctAnswer: 'strip()',
        hint: 'It strips away extra spaces.',
        explanation: 'The strip() method removes any leading (spaces at the beginning) and trailing (spaces at the end) characters.'
      };
    }

    // 2. Networking / CCNA Exercises
    if (categoryLower.includes('network') || t.includes('routing') || t.includes('vlan') || c.includes('ip') || c.includes('switch')) {
      if (t.includes('vlan') || c.includes('vlan')) {
        return {
          question: 'What is the IEEE open standard protocol used for VLAN tagging on trunk links?',
          type: 'multiple-choice',
          options: ['ISL', 'IEEE 802.1Q', 'VTP', '802.11ax'],
          correctAnswer: 'IEEE 802.1Q',
          hint: 'It inserts a 4-byte tag into the Ethernet frame header.',
          explanation: 'IEEE 802.1Q (often referred to as dot1q) is the universal industry standard for frame tagging on switch trunk ports.'
        };
      }
      if (t.includes('route') || t.includes('router') || c.includes('osi')) {
        return {
          question: 'At which layer of the OSI 7-Layer Reference Model do IP routers operate?',
          type: 'multiple-choice',
          options: ['Layer 1 (Physical)', 'Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)'],
          correctAnswer: 'Layer 3 (Network)',
          hint: 'Routers make forwarding decisions based on logical IP network addresses.',
          explanation: 'Layer 3 is the Network layer, responsible for packet routing, logical addressing (IPv4/IPv6), and path determination.'
        };
      }
      return {
        question: 'Which Cisco command displays the active routing table on a router?',
        type: 'fill-blank',
        codeSnippet: 'Router# show ip _____',
        correctAnswer: 'route',
        hint: 'It displays connected, static, and dynamic routing paths.',
        explanation: '"show ip route" is the primary command used by network engineers to inspect the routing table.'
      };
    }

    // 3. Cyber Security Exercises
    if (categoryLower.includes('cyber') || categoryLower.includes('security') || t.includes('security') || c.includes('cipher')) {
      return {
        question: 'Which principle of the CIA Triad ensures that information is accessible only to authorized individuals?',
        type: 'multiple-choice',
        options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
        correctAnswer: 'Confidentiality',
        hint: 'It keeps secrets secret through encryption and access controls.',
        explanation: 'Confidentiality guarantees that sensitive data is shielded from unauthorized access and disclosure.'
      };
    }

    // 4. Linux Exercises
    if (categoryLower.includes('linux') || t.includes('linux') || c.includes('chmod') || c.includes('directory')) {
      return {
        question: 'Which octal permission value gives read, write, and execute permissions to the Owner, and read and execute to Group and Others?',
        type: 'multiple-choice',
        options: ['777', '755', '644', '700'],
        correctAnswer: '755',
        hint: 'Owner gets 4+2+1=7; Group gets 4+1=5; Others get 4+1=5.',
        explanation: '755 sets rwxr-xr-x, standard for executable scripts and directories in Linux.'
      };
    }

    // 5. HTML / Web Exercises
    if (categoryLower.includes('html') || t.includes('html') || c.includes('html')) {
      return {
        question: 'What is the correct HTML element for inserting a line break?',
        type: 'multiple-choice',
        options: ['<lb>', '<br>', '<break>', '<newline>'],
        correctAnswer: '<br>',
        hint: 'It is a self-closing void tag.',
        explanation: 'The <br> tag inserts a single line break in HTML documents.'
      };
    }

    // 6. Generic High-Yield Exercise
    return {
      question: `Which statement represents the core educational takeaway for: "${activeSection.title}"?`,
      type: 'multiple-choice',
      options: [
        'To memorize terminology without understanding practical deployment steps.',
        'To acquire foundational theoretical concepts combined with hands-on technical proficiency.',
        'To avoid reviewing standard specifications and reference documentation.',
        'To assume configurations work without testing or diagnostic verification.'
      ],
      correctAnswer: 'To acquire foundational theoretical concepts combined with hands-on technical proficiency.',
      explanation: 'Technical mastery requires solid understanding of core principles tested through hands-on practice.'
    };
  }, [activeSection, doc]);

  const handleSubmitExercise = () => {
    if (!exerciseAnswer.trim()) return;
    const isCorrect = exerciseAnswer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();
    setExerciseSubmitted(true);
    setExerciseIsCorrect(isCorrect);
    if (isCorrect) {
      toggleSectionCompletion(activeSection.id);
    }
  };

  // Dynamic Theme Class Variables (W3Schools authentic styling)
  const themeClasses = useMemo(() => {
    if (theme === 'w3-dark') {
      return {
        bg: 'bg-[#15202b]',
        canvasBg: 'bg-[#0f1720]',
        cardBg: 'bg-[#1d2731]',
        headerBg: 'bg-[#111923]',
        border: 'border-slate-800',
        text: 'text-slate-100',
        textMuted: 'text-slate-400',
        heading: 'text-white',
        codeBg: 'bg-[#0a0f14]',
        exampleHeader: 'bg-[#1e2a38]',
        calloutNote: 'bg-amber-950/25 border-amber-500/40 text-amber-200',
        calloutTip: 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200',
        calloutWarning: 'bg-red-950/25 border-red-500/40 text-red-200',
        tableHeader: 'bg-slate-800/80 text-white',
        tableRowEven: 'bg-slate-900/40',
        tableRowOdd: 'bg-[#15202b]',
        activeSidebarItem: 'bg-[#04aa6d] text-white font-bold',
        sidebarHover: 'hover:bg-slate-800/80 text-slate-300'
      };
    } else if (theme === 'w3-sepia') {
      return {
        bg: 'bg-[#f4eccf]',
        canvasBg: 'bg-[#fbf0db]',
        cardBg: 'bg-[#ebdca8]',
        headerBg: 'bg-[#eee4c5]',
        border: 'border-[#dfd3ae]',
        text: 'text-[#433422]',
        textMuted: 'text-[#75624e]',
        heading: 'text-[#2e2215]',
        codeBg: 'bg-[#2b2118]',
        exampleHeader: 'bg-[#dfd3ae]',
        calloutNote: 'bg-amber-100 border-amber-600/40 text-amber-900',
        calloutTip: 'bg-emerald-100 border-emerald-600/40 text-emerald-900',
        calloutWarning: 'bg-red-100 border-red-600/40 text-red-900',
        tableHeader: 'bg-[#dfd3ae] text-[#2e2215]',
        tableRowEven: 'bg-[#f7f0dc]',
        tableRowOdd: 'bg-[#fbf0db]',
        activeSidebarItem: 'bg-[#04aa6d] text-white font-bold',
        sidebarHover: 'hover:bg-[#dfd3ae] text-[#433422]'
      };
    } else {
      // Default W3Schools Light
      return {
        bg: 'bg-[#f1f1f1]',
        canvasBg: 'bg-white',
        cardBg: 'bg-[#e7e9eb]',
        headerBg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-[#282a35]',
        textMuted: 'text-gray-600',
        heading: 'text-[#111827]',
        codeBg: 'bg-[#f5f6f7]',
        exampleHeader: 'bg-[#e7e9eb]',
        calloutNote: 'bg-[#ffffcc] border-[#ffeb3b] text-[#554b00]',
        calloutTip: 'bg-[#e8f5e9] border-[#04aa6d] text-[#1b5e20]',
        calloutWarning: 'bg-[#ffebee] border-[#f44336] text-[#b71c1c]',
        tableHeader: 'bg-[#04aa6d] text-white',
        tableRowEven: 'bg-white',
        tableRowOdd: 'bg-[#f1f1f1]',
        activeSidebarItem: 'bg-[#04aa6d] text-white font-bold',
        sidebarHover: 'hover:bg-gray-200 text-gray-800'
      };
    }
  }, [theme]);

  // Overall syllabus completion percentage
  const completionPercentage = useMemo(() => {
    if (!sections.length) return 0;
    const count = sections.filter(s => completedSections.includes(s.id)).length;
    return Math.round((count / sections.length) * 100);
  }, [sections, completedSections]);

  // Print Functionality
  const handlePrint = () => {
    window.print();
  };

  /**
   * High-Fidelity W3Schools Markdown & Content Parser
   * Renders:
   * 1. H1, H2 (with W3Schools green underline bar), H3, H4
   * 2. Iconic W3Schools "Example" boxes with live "Try it Yourself »"
   * 3. W3Schools Callout Note / Tip / Warning banners
   * 4. Zebra-striped reference tables
   * 5. Clean lists & bold definitions
   */
  const renderW3SchoolsContent = (rawText: string) => {
    if (!rawText) return null;

    // Normalize Windows line endings and double line spacing
    const normalized = rawText.replace(/\r\n/g, '\n');

    // Split on triple backticks to isolate code blocks
    const parts = normalized.split('```');

    return (
      <div className="space-y-6 text-left">
        {parts.map((segment, partIdx) => {
          const isCodeBlock = partIdx % 2 === 1;

          if (isCodeBlock) {
            // CODE BLOCK: Render W3Schools signature "Example" Box with "Try It Yourself »"
            const lines = segment.split('\n');
            let detectedLang = 'code';
            let codeContent = segment;

            if (lines.length > 0) {
              const firstLine = lines[0].trim().toLowerCase();
              if (['python', 'py', 'javascript', 'js', 'html', 'css', 'sql', 'bash', 'sh', 'cisco', 'ios', 'json', 'c', 'cpp', 'php'].includes(firstLine)) {
                detectedLang = firstLine;
                codeContent = lines.slice(1).join('\n');
              }
            }

            const blockId = `code_block_${activeSection.id}_${partIdx}`;
            const trimmedCode = codeContent.trim();
            const runnerState = inlineRunners[blockId];

            return (
              <div 
                key={partIdx} 
                className={`rounded-2xl border shadow-sm my-6 overflow-hidden ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f5f6f7]' : themeClasses.cardBg}`}
              >
                {/* W3Schools Example Header */}
                <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${themeClasses.exampleHeader} ${themeClasses.border}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-xs uppercase tracking-wider text-[#04aa6d]">
                      Example
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-300">
                      {detectedLang}
                    </span>
                  </div>

                  {/* Actions: Try it Yourself, Copy, Simulators */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopyCode(blockId, trimmedCode)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-gray-400/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      title="Copy code to clipboard"
                    >
                      {copiedId === blockId ? (
                        <>
                          <Check className="w-3 h-3 text-[#04aa6d]" />
                          <span className="text-[#04aa6d]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Green W3Schools Signature Try it Yourself Button */}
                    <button
                      onClick={() => handleToggleTryIt(blockId, trimmedCode, detectedLang)}
                      className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#04aa6d] hover:bg-[#059862] text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      id={`btn-try-it-${blockId}`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{runnerState?.open ? 'Close Editor' : 'Try it Yourself »'}</span>
                    </button>

                    {/* Shortcut for full external simulator if user prefers */}
                    {(detectedLang.includes('python') || detectedLang.includes('py')) && onLaunchPythonSimulator && (
                      <button
                        onClick={onLaunchPythonSimulator}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                        title="Open in Full Python & ML IDE"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>Full IDE</span>
                      </button>
                    )}

                    {(detectedLang.includes('bash') || detectedLang.includes('sh') || detectedLang.includes('cisco')) && onLaunchLinuxSimulator && (
                      <button
                        onClick={onLaunchLinuxSimulator}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                        title="Open in Linux OS Terminal Simulator"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Linux OS</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Code Preview Area (Clean monospace with syntax styling) */}
                <div className="relative">
                  <pre 
                    className={`p-5 overflow-x-auto font-mono leading-relaxed text-left text-xs ${
                      theme === 'w3-light' ? 'bg-[#fdfdfd] text-[#1f2937]' : 'bg-[#0b1016] text-emerald-400'
                    }`}
                  >
                    <code>{trimmedCode}</code>
                  </pre>
                </div>

                {/* IN-LINE INTERACTIVE W3SCHOOLS "TRY IT YOURSELF" RUNNER */}
                {runnerState?.open && (
                  <div className="border-t border-gray-400/20 p-4 bg-slate-950 text-white animate-fade-in space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Terminal className="w-3.5 h-3.5" />
                        Live Interactive Code Sandbox
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setInlineRunners(prev => ({
                              ...prev,
                              [blockId]: { ...prev[blockId], code: trimmedCode, output: 'Reset to original code.' }
                            }));
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleExecuteInlineCode(blockId)}
                          disabled={runnerState.running}
                          className="px-3.5 py-1 rounded bg-[#04aa6d] hover:bg-[#059862] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {runnerState.running ? 'Running...' : 'Run Code »'}
                        </button>
                      </div>
                    </div>

                    {/* Editable Textarea */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Editor:</div>
                        <textarea
                          value={runnerState.code}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            setInlineRunners(prev => ({
                              ...prev,
                              [blockId]: { ...prev[blockId], code: newCode }
                            }));
                          }}
                          className="w-full h-44 p-3 font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl text-emerald-300 focus:outline-none focus:border-[#04aa6d] resize-none"
                          spellCheck={false}
                        />
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Live Result / Terminal Output:</div>
                        <div className="w-full h-44 p-3 font-mono text-xs bg-black/80 border border-slate-800 rounded-xl text-gray-200 overflow-y-auto whitespace-pre-wrap">
                          {runnerState.output}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            // PROSE / TEXT SEGMENT: Parse Markdown headings, Note boxes, Tip boxes, Warning boxes, and Lists!
            return (
              <div key={partIdx} className="space-y-4">
                {renderProseBlocks(segment)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  /**
   * Helper that parses paragraphs, W3Schools Callouts (Note/Tip/Warning), Headings, Lists, and Tables
   */
  const renderProseBlocks = (text: string) => {
    // Break into logical paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();

      // 0. Check for Table of Contents Block
      const tocLineRegex = /^(.+?)\s*[-_.\u2013\u2014\s]{3,}\s*([0-9ivxlcIVXLC]+)\s*$/;
      const tocLines = trimmed.split('\n');
      const matchedTocLines = tocLines.filter(l => tocLineRegex.test(l.trim()));
      const isTocBlock = matchedTocLines.length >= 2 || (trimmed.toLowerCase().includes('table of content') && matchedTocLines.length >= 1);

      if (isTocBlock) {
        // Parse all items in this Table of Contents
        const tocItems = tocLines.map((l, lIdx) => {
          const raw = l.trim();
          if (!raw) return null;
          const match = raw.match(tocLineRegex);
          if (match) {
            return {
              id: `toc_item_${pIdx}_${lIdx}`,
              title: match[1].trim(),
              page: match[2].trim(),
              isLink: true
            };
          }
          if (raw.toLowerCase().includes('table of content') || raw.toLowerCase().includes('contents:')) {
            return null; // Shown on container header
          }
          return {
            id: `toc_item_${pIdx}_${lIdx}`,
            title: raw,
            page: '',
            isLink: true
          };
        }).filter(Boolean);

        return (
          <div 
            key={pIdx} 
            className={`my-8 rounded-3xl border shadow-lg overflow-hidden ${themeClasses.border} ${theme === 'w3-light' ? 'bg-white' : themeClasses.cardBg}`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0e1721]'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider bg-[#04aa6d] text-white">
                    Interactive Index
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {tocItems.length} Topics & Learning Outcomes
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#04aa6d] flex items-center gap-2">
                  <BookOpen className="w-6 h-6 shrink-0" />
                  Table of Contents
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Click on any topic below to be directed immediately to that content in the manual.
                </p>
              </div>

              {/* In-TOC Filter Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter topics (e.g. Active Directory, DHCP, WSUS)..."
                  value={tocFilterQuery}
                  onChange={(e) => setTocFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 rounded-xl text-xs border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#04aa6d]"
                />
                {tocFilterQuery && (
                  <button
                    onClick={() => setTocFilterQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* List of Clickable Content Items */}
            <div className="p-3 sm:p-5 divide-y divide-gray-200/50 dark:divide-slate-800/60 max-h-[750px] overflow-y-auto">
              {tocItems
                .filter(item => !tocFilterQuery || item!.title.toLowerCase().includes(tocFilterQuery.toLowerCase()) || item!.page.includes(tocFilterQuery))
                .map((item) => {
                  if (!item) return null;
                  const isLearningOutcome = item.title.toLowerCase().includes('learning outcome');
                  const isIndicative = item.title.toLowerCase().includes('indicative content');
                  const isAssessment = item.title.toLowerCase().includes('assessment');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleJumpToTocTarget(item.title, item.page)}
                      className={`w-full text-left py-3 px-3.5 sm:px-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isLearningOutcome 
                          ? 'bg-[#04aa6d]/5 hover:bg-[#04aa6d]/15 my-1 font-bold' 
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Icon Indicator */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          isLearningOutcome
                            ? 'bg-[#04aa6d] text-white shadow-xs'
                            : isAssessment
                            ? 'bg-amber-500/15 text-amber-500'
                            : isIndicative
                            ? 'bg-blue-500/15 text-blue-500'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {isLearningOutcome ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : isAssessment ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isIndicative ? (
                            <Terminal className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Title with W3Schools Green Hover */}
                        <span className={`text-xs sm:text-sm truncate group-hover:text-[#04aa6d] transition-colors ${
                          isLearningOutcome ? 'font-extrabold text-[#04aa6d]' : isAssessment ? 'font-bold text-amber-600 dark:text-amber-400' : 'font-medium'
                        }`}>
                          {item.title}
                        </span>
                      </div>

                      {/* Right: Page Badge & Arrow Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.page && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-gray-200/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300/40">
                            p. {item.page}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-[#04aa6d] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          <span className="hidden sm:inline">Go to topic</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Bottom Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs text-gray-500 ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0e1721]'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[#04aa6d]" />
                All topics are direct clickable links
              </span>
              <span className="text-[11px] font-mono text-[#04aa6d] font-bold">
                W3Schools Interactive Syllabus
              </span>
            </div>
          </div>
        );
      }

      // 1. Check for W3Schools Callout Box: Note, Tip, Warning, Remember
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('note:') || lower.startsWith('> note:') || lower.startsWith('important:')) {
        const cleanContent = trimmed.replace(/^>?\s*(note:|important:)\s*/i, '');
        return (
          <div 
            key={pIdx} 
            className={`p-4 rounded-xl border-l-4 my-4 flex items-start gap-3 shadow-sm ${themeClasses.calloutNote}`}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong className="block text-xs uppercase tracking-wider font-extrabold mb-1">Note:</strong>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {renderInlineFormatted(cleanContent)}
              </div>
            </div>
          </div>
        );
      }

      if (lower.startsWith('tip:') || lower.startsWith('> tip:')) {
        const cleanContent = trimmed.replace(/^>?\s*tip:\s*/i, '');
        return (
          <div 
            key={pIdx} 
            className={`p-4 rounded-xl border-l-4 my-4 flex items-start gap-3 shadow-sm ${themeClasses.calloutTip}`}
          >
            <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <strong className="block text-xs uppercase tracking-wider font-extrabold mb-1">Tip:</strong>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {renderInlineFormatted(cleanContent)}
              </div>
            </div>
          </div>
        );
      }

      if (lower.startsWith('warning:') || lower.startsWith('> warning:') || lower.startsWith('danger:')) {
        const cleanContent = trimmed.replace(/^>?\s*(warning:|danger:)\s*/i, '');
        return (
          <div 
            key={pIdx} 
            className={`p-4 rounded-xl border-l-4 my-4 flex items-start gap-3 shadow-sm ${themeClasses.calloutWarning}`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <strong className="block text-xs uppercase tracking-wider font-extrabold mb-1">Warning:</strong>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {renderInlineFormatted(cleanContent)}
              </div>
            </div>
          </div>
        );
      }

      // 2. Check for Markdown Headings (# H1, ## H2, ### H3, #### H4) or Plain Chapter Headers
      if (trimmed.startsWith('# ') || /^chapter \d+:/i.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^#\s*/, '');
        return (
          <h1 
            key={pIdx}
            className={`font-display font-extrabold text-2xl sm:text-3xl tracking-tight mt-6 mb-2 ${themeClasses.heading}`}
          >
            {cleanHeader}
          </h1>
        );
      }

      if (trimmed.startsWith('## ') || /^section \d+:/i.test(trimmed) || /^[0-9]+\.\s+[A-Z]/.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^##\s*/, '');
        return (
          <div key={pIdx} className="pt-4 pb-2">
            <h2 
              className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight border-b-2 border-[#04aa6d]/40 pb-2 flex items-center justify-between ${themeClasses.heading}`}
            >
              <span>{cleanHeader}</span>
            </h2>
          </div>
        );
      }

      if (trimmed.startsWith('### ')) {
        const cleanHeader = trimmed.replace(/^###\s*/, '');
        return (
          <h3 
            key={pIdx}
            className={`font-display font-bold text-lg sm:text-xl tracking-tight mt-4 mb-1 text-[#04aa6d]`}
          >
            {cleanHeader}
          </h3>
        );
      }

      // 3. Markdown Tables (| col | col |)
      if (trimmed.includes('|') && trimmed.includes('\n')) {
        const tableLines = trimmed.split('\n').filter(l => l.trim().startsWith('|'));
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
          // skip divider line if present (|---|---|)
          const bodyLines = tableLines.slice(tableLines[1].includes('---') ? 2 : 1);

          return (
            <div key={pIdx} className="my-6 overflow-x-auto rounded-2xl border shadow-sm border-gray-300/30">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className={themeClasses.tableHeader}>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 font-bold border-b border-gray-300/20">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyLines.map((row, rIdx) => {
                    const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                    const isEven = rIdx % 2 === 0;
                    return (
                      <tr 
                        key={rIdx} 
                        className={`border-b border-gray-300/10 ${isEven ? themeClasses.tableRowEven : themeClasses.tableRowOdd} hover:bg-[#04aa6d]/5 transition-colors`}
                      >
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3.5 leading-relaxed">
                            {renderInlineFormatted(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // 4. Bullet & Numbered Lists
      const lines = trimmed.split('\n');
      const isList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()));

      if (isList) {
        const isOrdered = /^\d+\.\s/.test(lines[0].trim());
        if (isOrdered) {
          return (
            <ol key={pIdx} className="list-decimal list-inside space-y-2 my-3 pl-2 leading-relaxed">
              {lines.map((l, lIdx) => {
                const clean = l.replace(/^\d+\.\s*/, '');
                return (
                  <li key={lIdx} className="text-xs sm:text-sm">
                    {renderInlineFormatted(clean)}
                  </li>
                );
              })}
            </ol>
          );
        } else {
          return (
            <ul key={pIdx} className="space-y-2 my-3 pl-2 leading-relaxed">
              {lines.map((l, lIdx) => {
                const clean = l.replace(/^[-*]\s*/, '');
                return (
                  <li key={lIdx} className="text-xs sm:text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#04aa6d] mt-2 shrink-0" />
                    <span>{renderInlineFormatted(clean)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
      }

      // 4b. Check for Markdown Image ![Alt text](url) or HTML <img ...>
      const hasMarkdownImg = trimmed.includes('![') && trimmed.includes('](');
      const hasHtmlImg = /<img\s+[^>]*src=/i.test(trimmed);

      if (hasMarkdownImg || hasHtmlImg) {
        // Parse segments of text and images
        const imageRegex = /(!\[.*?\]\(.*?\)|<img\s+[^>]*>)/g;
        const chunks = trimmed.split(imageRegex).filter(Boolean);

        return (
          <div key={pIdx} className="space-y-4 my-6">
            {chunks.map((chunk, cIdx) => {
              const mdMatch = chunk.match(/^!\[(.*?)\]\((.*?)\)$/);
              let imgUrl = '';
              let imgAlt = '';

              if (mdMatch) {
                imgAlt = mdMatch[1];
                imgUrl = mdMatch[2];
              } else {
                const htmlMatch = chunk.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']?([^"']*)["']?[^>]*>/i) ||
                                  chunk.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
                if (htmlMatch) {
                  imgUrl = htmlMatch[1];
                  imgAlt = htmlMatch[2] || '';
                }
              }

              if (imgUrl) {
                return (
                  <figure 
                    key={cIdx} 
                    className={`my-6 rounded-2xl overflow-hidden border shadow-lg transition-all ${
                      themeClasses.border
                    } ${
                      theme === 'w3-light' ? 'bg-[#f8fafc] border-gray-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="relative group p-3 sm:p-6 flex flex-col items-center justify-center bg-black/5 dark:bg-black/50 overflow-hidden">
                      <img 
                        src={imgUrl} 
                        alt={imgAlt || 'Course Note Illustration'} 
                        className="max-h-[550px] w-auto max-w-full rounded-xl object-contain shadow-md cursor-pointer hover:scale-[1.01] transition-transform duration-200 select-none"
                        onClick={() => {
                          setLightboxImage({ url: imgUrl, caption: imgAlt || 'Course Note Illustration', alt: imgAlt });
                          setLightboxZoom(100);
                          setLightboxRotation(0);
                        }}
                        loading="lazy"
                      />
                      
                      {/* Top Action Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setLightboxImage({ url: imgUrl, caption: imgAlt || 'Course Note Illustration', alt: imgAlt });
                            setLightboxZoom(100);
                            setLightboxRotation(0);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 cursor-pointer border border-white/20 active:scale-95 transition-all"
                          title="Click to inspect photo in high resolution Lightbox"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-[#04aa6d]" />
                          <span>View Full Photo</span>
                        </button>
                      </div>

                      {/* Zoom hint badge */}
                      <div className="mt-3 text-[11px] text-gray-500 font-medium flex items-center gap-1.5 opacity-75">
                        <Eye className="w-3.5 h-3.5 text-[#04aa6d]" />
                        <span>Click photo to zoom, pan, and inspect in full resolution</span>
                      </div>
                    </div>

                    {imgAlt && (
                      <figcaption className={`px-4 py-2.5 text-center text-xs font-medium border-t flex items-center justify-center gap-2 ${
                        themeClasses.border
                      } ${
                        theme === 'w3-light' ? 'bg-white text-gray-700' : 'bg-slate-950 text-gray-300'
                      }`}>
                        <span className="font-extrabold text-[#04aa6d] uppercase tracking-wider text-[11px]">Figure:</span>
                        <span>{renderInlineFormatted(imgAlt)}</span>
                      </figcaption>
                    )}
                  </figure>
                );
              }

              // Text part of the paragraph
              if (chunk.trim()) {
                return (
                  <p 
                    key={cIdx} 
                    className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-normal text-left"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                  >
                    {renderInlineFormatted(chunk.trim())}
                  </p>
                );
              }

              return null;
            })}
          </div>
        );
      }

      // 5. Standard Paragraph with High-Contrast Typography
      return (
        <p 
          key={pIdx} 
          className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-normal text-left"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
        >
          {renderInlineFormatted(trimmed)}
        </p>
      );
    });
  };

  /**
   * Inline text parser for **bold**, *italic*, `code` pills, and links
   */
  const renderInlineFormatted = (str: string) => {
    if (!str) return '';

    // Split on inline code `...`
    const codeParts = str.split('`');
    if (codeParts.length > 1) {
      return codeParts.map((sub, i) => {
        if (i % 2 === 1) {
          return (
            <code 
              key={i} 
              className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-bold bg-[#04aa6d]/15 text-[#04aa6d] border border-[#04aa6d]/30"
            >
              {sub}
            </code>
          );
        }
        return renderBoldItalic(sub);
      });
    }

    return renderBoldItalic(str);
  };

  const renderBoldItalic = (text: string) => {
    // Replace **bold**
    const parts = text.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return parts.map((chunk, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-extrabold text-[#04aa6d] dark:text-emerald-300">{chunk}</strong>;
        }
        return chunk;
      });
    }
    return text;
  };

  return (
    <div className={`w-full min-h-screen text-left transition-colors duration-200 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* 1. TOP W3SCHOOLS TUTORIAL BREADCRUMB & UTILITY HEADER */}
      <header className={`sticky top-0 z-30 border-b shadow-sm px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 ${themeClasses.headerBg} ${themeClasses.border}`}>
        {/* Left: Breadcrumbs & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${themeClasses.border} hover:bg-[#04aa6d]/10 hover:text-[#04aa6d]`}
            title={sidebarOpen ? "Hide Course Index" : "Show Course Index"}
            id="btn-w3-toggle-sidebar"
          >
            <Layers className="w-4 h-4 text-[#04aa6d]" />
            <span className="hidden sm:inline">{sidebarOpen ? 'Menu' : 'Show Menu'}</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="text-xs font-bold hover:text-[#04aa6d] transition-all flex items-center gap-1 cursor-pointer"
          >
            &larr; <span className="hidden sm:inline">Course Hub</span>
          </button>

          <span className="text-gray-400">/</span>

          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#04aa6d]/15 text-[#04aa6d]">
            {doc.category || 'Tutorial'}
          </span>

          <span className="text-gray-400 hidden md:inline">/</span>

          <span className="font-display font-black text-xs sm:text-sm truncate max-w-[160px] sm:max-w-xs hidden md:inline">
            {doc.name}
          </span>
        </div>

        {/* Right: Accessibility Controls & TOC Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Table of Contents Quick Jump Drawer Button */}
          <button
            onClick={() => setTocDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#04aa6d]/10 text-[#04aa6d] border border-[#04aa6d]/30 hover:bg-[#04aa6d] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Open Table of Contents (Browse all topics)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table of Contents</span>
          </button>

          {/* Photos & Figures Gallery Button */}
          <button
            onClick={() => setShowFiguresDrawer(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              showFiguresDrawer
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-white'
            }`}
            title="Browse all photos, illustrations and diagrams in this syllabus document"
            id="btn-w3-photos-figures"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Photos & Figures</span>
            {allDocumentImages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black">
                {allDocumentImages.length}
              </span>
            )}
          </button>

          {/* Edit Note Button (if admin / callback provided) */}
          {onEditDoc && (
            <button
              onClick={onEditDoc}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Edit Note Details and insert photos (Admin)"
              id="btn-w3-edit-note"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Edit</span>
            </button>
          )}
          {/* Font Size A- / A / A+ */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-0.5 border border-gray-400/20 text-xs font-bold">
            <button
              onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
              className="px-2 py-1 hover:text-[#04aa6d] transition-all cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(15)}
              className="px-2 py-1 text-gray-400 hover:text-[#04aa6d] transition-all cursor-pointer text-[10px]"
              title="Reset Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              className="px-2 py-1 hover:text-[#04aa6d] transition-all cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher (Light / Sepia / Dark) */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-gray-400/20">
            <button
              onClick={() => setTheme('w3-light')}
              className={`w-5 h-5 rounded-full border shadow-xs transition-all cursor-pointer ${
                theme === 'w3-light' ? 'ring-2 ring-[#04aa6d] border-[#04aa6d] scale-110' : 'border-gray-300'
              } bg-white`}
              title="W3Schools Clean Light Theme"
            />
            <button
              onClick={() => setTheme('w3-sepia')}
              className={`w-5 h-5 rounded-full border shadow-xs transition-all cursor-pointer ${
                theme === 'w3-sepia' ? 'ring-2 ring-[#04aa6d] border-[#04aa6d] scale-110' : 'border-amber-900/40'
              } bg-[#fbf0db]`}
              title="W3Schools Cozy Sepia Theme"
            />
            <button
              onClick={() => setTheme('w3-dark')}
              className={`w-5 h-5 rounded-full border shadow-xs transition-all cursor-pointer ${
                theme === 'w3-dark' ? 'ring-2 ring-[#04aa6d] border-[#04aa6d] scale-110' : 'border-slate-700'
              } bg-[#15202b]`}
              title="W3Schools Charcoal Dark Theme"
            />
          </div>

          {/* Read Aloud TTS */}
          <button
            onClick={handleToggleSpeech}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isReadingAloud
                ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
                : 'border-gray-400/20 hover:bg-[#04aa6d]/10 hover:text-[#04aa6d]'
            }`}
            title="Read Aloud with Voice"
          >
            {isReadingAloud ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#04aa6d]" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-gray-400/20 hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-all cursor-pointer hidden md:flex items-center"
            title="Print Notes / Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN W3SCHOOLS LAYOUT: SIDEBAR + MAIN CONTENT CANVAS */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)]">
        {/* LEFT SIDEBAR: Topic & Chapter Navigation Menu */}
        {sidebarOpen && (
          <aside className={`w-full md:w-72 shrink-0 border-r md:sticky md:top-[60px] md:self-start md:h-[calc(100vh-60px)] flex flex-col justify-between ${themeClasses.border} ${themeClasses.headerBg} animate-fade-in`}>
            {/* Sidebar Top: Search & Category Header */}
            <div className="p-4 border-b border-gray-400/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-[#04aa6d] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {doc.category || 'Course'} Tutorial
                </h4>
                <span className="text-[10px] font-bold text-gray-400">
                  {sections.length} Topics
                </span>
              </div>

              {/* Topic search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#04aa6d] transition-all ${
                    theme === 'w3-light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Sidebar Scrollable Chapter List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {filteredSections.map((sec, idx) => {
                const isSelected = sections.findIndex(s => s.id === sec.id) === activeSectionIndex;
                const isCompleted = completedSections.includes(sec.id);

                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      const realIdx = sections.findIndex(s => s.id === sec.id);
                      setActiveSectionIndex(realIdx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      stopSpeech();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? themeClasses.activeSidebarItem
                        : themeClasses.sidebarHover
                    }`}
                  >
                    <span className="truncate flex-1">
                      {idx + 1}. {sec.title}
                    </span>
                    {isCompleted && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                        isSelected ? 'bg-white text-emerald-800' : 'bg-[#04aa6d]/20 text-[#04aa6d]'
                      }`}>
                        DONE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer: Course Completion Progress */}
            <div className="p-4 border-t border-gray-400/15 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                <span>Progress:</span>
                <span className="text-[#04aa6d] font-extrabold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#04aa6d] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT MAIN READING CANVAS */}
        <main className={`flex-1 flex flex-col justify-between ${themeClasses.canvasBg}`}>
          <div className="p-6 sm:p-10 lg:p-12 w-full max-w-5xl mx-auto flex-1">
            {/* W3SCHOOLS TOP NAVIGATION BAR (< Previous / Next >) */}
            <div className="flex items-center justify-between border-b border-gray-400/15 pb-4 mb-6">
              <button
                onClick={handlePrevSection}
                disabled={activeSectionIndex === 0}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  activeSectionIndex === 0
                    ? 'opacity-25 cursor-not-allowed bg-gray-400/20 text-gray-500'
                    : 'bg-[#04aa6d] hover:bg-[#059862] text-white active:scale-95'
                }`}
                id="btn-w3-prev-top"
              >
                &larr; Previous
              </button>

              {/* Middle Section Indicator & TOC Navigation */}
              <div className="flex items-center gap-2.5 text-center">
                <span className="text-[11px] font-mono font-bold uppercase text-gray-400 hidden sm:inline">
                  Topic {activeSectionIndex + 1} of {sections.length}
                </span>
                {activeSectionIndex !== 0 && (
                  <button
                    onClick={() => {
                      setActiveSectionIndex(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#04aa6d] bg-[#04aa6d]/10 hover:bg-[#04aa6d] hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Jump to Table of Contents"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Table of Contents</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleNextSection}
                disabled={activeSectionIndex === sections.length - 1}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  activeSectionIndex === sections.length - 1
                    ? 'opacity-25 cursor-not-allowed bg-gray-400/20 text-gray-500'
                    : 'bg-[#04aa6d] hover:bg-[#059862] text-white active:scale-95'
                }`}
                id="btn-w3-next-top"
              >
                Next &raquo;
              </button>
            </div>

            {/* CHAPTER TITLE & LEARNING OBJECTIVE */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-[#04aa6d]/15 text-[#04aa6d] border border-[#04aa6d]/30">
                  {doc.category || 'Tutorial'} Chapter {activeSectionIndex + 1}
                </span>
                {activeSection.learningOutcome && (
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    Target: {activeSection.learningOutcome}
                  </span>
                )}
                <button
                  onClick={() => toggleSectionCompletion(activeSection.id)}
                  className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    completedSections.includes(activeSection.id)
                      ? 'bg-[#04aa6d] border-[#04aa6d] text-white'
                      : 'border-gray-400/20 hover:bg-[#04aa6d]/10 text-gray-400 hover:text-[#04aa6d]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{completedSections.includes(activeSection.id) ? 'Completed' : 'Mark Completed'}</span>
                </button>
              </div>

              <h1 
                className={`font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-snug ${themeClasses.heading}`}
              >
                {activeSection.title}
              </h1>
            </div>

            {/* DOCUMENT-LEVEL PHOTOGRAPH / BLUEPRINT HERO CARD (If file is an image) */}
            {isImageDoc && (
              <div className={`mb-8 rounded-3xl border shadow-xl overflow-hidden transition-all ${
                themeClasses.border
              } ${
                theme === 'w3-light' ? 'bg-[#f8fafc] border-gray-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className={`p-4 border-b flex items-center justify-between gap-3 text-xs ${
                  themeClasses.border
                } ${
                  theme === 'w3-light' ? 'bg-white' : 'bg-slate-950'
                }`}>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#04aa6d]" />
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-[#04aa6d]">
                      Original Document Photograph / Graphic
                    </span>
                    <span className="opacity-75 hidden sm:inline">&bull; {doc.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const url = doc.fileData || doc.fileUrl || `/api/documents/${doc.id}/file`;
                        setLightboxImage({ url, caption: doc.name, alt: doc.name });
                        setLightboxZoom(100);
                        setLightboxRotation(0);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#04aa6d] text-white hover:bg-[#059862] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Inspect Full Size</span>
                    </button>
                  </div>
                </div>

                <div className="relative group p-4 sm:p-8 flex items-center justify-center bg-black/5 dark:bg-black/50 overflow-hidden min-h-[300px]">
                  <img
                    src={doc.fileData || doc.fileUrl || `/api/documents/${doc.id}/file`}
                    alt={doc.name}
                    className="max-h-[600px] w-auto max-w-full rounded-2xl object-contain shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform duration-200 select-none"
                    onClick={() => {
                      const url = doc.fileData || doc.fileUrl || `/api/documents/${doc.id}/file`;
                      setLightboxImage({ url, caption: doc.name, alt: doc.name });
                      setLightboxZoom(100);
                      setLightboxRotation(0);
                    }}
                    loading="eager"
                  />
                </div>

                <div className={`p-3 text-center text-xs text-gray-500 border-t ${
                  themeClasses.border
                } ${
                  theme === 'w3-light' ? 'bg-gray-50' : 'bg-slate-950'
                }`}>
                  <span className="font-semibold">Click photo to zoom, pan, rotate, or download at full native resolution</span>
                </div>
              </div>
            )}

            {/* SECTION ATTACHED FIGURES & DIAGRAMS */}
            {activeSection.images && activeSection.images.length > 0 && (
              <div className="my-6 space-y-4">
                {activeSection.images.map((secImg, sImgIdx) => (
                  <figure
                    key={sImgIdx}
                    className={`rounded-2xl overflow-hidden border shadow-lg transition-all ${
                      themeClasses.border
                    } ${
                      theme === 'w3-light' ? 'bg-[#f8fafc] border-gray-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="relative group p-4 sm:p-6 flex flex-col items-center justify-center bg-black/5 dark:bg-black/50">
                      <img
                        src={secImg.url}
                        alt={secImg.alt || secImg.caption || 'Topic Diagram'}
                        className="max-h-[520px] w-auto max-w-full rounded-xl object-contain shadow-md cursor-pointer hover:scale-[1.01] transition-transform duration-200 select-none"
                        onClick={() => {
                          setLightboxImage({ url: secImg.url, caption: secImg.caption || secImg.alt || 'Topic Diagram', alt: secImg.alt });
                          setLightboxZoom(100);
                          setLightboxRotation(0);
                        }}
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setLightboxImage({ url: secImg.url, caption: secImg.caption || secImg.alt || 'Topic Diagram', alt: secImg.alt });
                            setLightboxZoom(100);
                            setLightboxRotation(0);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 cursor-pointer border border-white/20 active:scale-95 transition-all"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-[#04aa6d]" />
                          <span>Inspect Photo</span>
                        </button>
                      </div>
                    </div>
                    {secImg.caption && (
                      <figcaption className={`px-4 py-2.5 text-center text-xs font-medium border-t flex items-center justify-center gap-2 ${
                        themeClasses.border
                      } ${
                        theme === 'w3-light' ? 'bg-white text-gray-700' : 'bg-slate-950 text-gray-300'
                      }`}>
                        <span className="font-extrabold text-[#04aa6d] uppercase tracking-wider text-[11px]">Figure:</span>
                        <span>{secImg.caption}</span>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* CHAPTER BODY: PARSED W3SCHOOLS RICH FORMATTING */}
            <div className={`space-y-6 ${readingWidth === 'comfortable' ? 'max-w-4xl' : 'max-w-full'}`}>
              {renderW3SchoolsContent(activeSection.content)}
            </div>

            {/* 3. W3SCHOOLS SIGNATURE "TEST YOURSELF WITH EXERCISES" BOX */}
            <div className="mt-12 pt-6">
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm text-left ${
                theme === 'w3-light'
                  ? 'bg-[#282a35] border-[#282a35] text-white'
                  : themeClasses.cardBg
              }`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#04aa6d] text-white text-[10px] font-black uppercase tracking-wider">
                      Exercise
                    </span>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                      Test Yourself With Exercises
                    </h3>
                  </div>
                  <HelpCircle className="w-5 h-5 text-[#04aa6d]" />
                </div>

                <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-4 leading-relaxed">
                  {currentExercise.question}
                </p>

                {/* Fill-in-the-blank code exercise */}
                {currentExercise.type === 'fill-blank' && currentExercise.codeSnippet && (
                  <div className="bg-[#15202b] p-4 rounded-2xl border border-slate-700 font-mono text-xs text-emerald-400 mb-4 leading-loose">
                    {currentExercise.codeSnippet.split('_____').map((chunk, i, arr) => (
                      <React.Fragment key={i}>
                        {chunk}
                        {i < arr.length - 1 && (
                          <input
                            type="text"
                            value={exerciseAnswer}
                            onChange={(e) => {
                              setExerciseAnswer(e.target.value);
                              setExerciseSubmitted(false);
                            }}
                            placeholder="???"
                            className="w-28 px-2 py-0.5 mx-1.5 rounded bg-slate-900 border-2 border-emerald-500 text-white font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#04aa6d]"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Multiple choice options */}
                {currentExercise.type === 'multiple-choice' && currentExercise.options && (
                  <div className="space-y-2 mb-4">
                    {currentExercise.options.map((option, optIdx) => {
                      const isChecked = exerciseAnswer === option;
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#04aa6d] bg-[#04aa6d]/20 text-white font-bold'
                              : 'border-white/10 hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`exercise_radio_${activeSection.id}`}
                            value={option}
                            checked={isChecked}
                            onChange={() => {
                              setExerciseAnswer(option);
                              setExerciseSubmitted(false);
                            }}
                            className="accent-[#04aa6d] w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons: Submit, Hint, Show Answer */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleSubmitExercise}
                    disabled={!exerciseAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#04aa6d] hover:bg-[#059862] text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm active:scale-95"
                    id="btn-submit-exercise"
                  >
                    Submit Answer &raquo;
                  </button>

                  {currentExercise.hint && (
                    <button
                      onClick={() => setShowHint(prev => !prev)}
                      className="px-3.5 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowExerciseAnswer(prev => !prev)}
                    className="px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white bg-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    {showExerciseAnswer ? 'Hide Answer' : 'Show Answer'}
                  </button>
                </div>

                {/* Hint banner */}
                {showHint && currentExercise.hint && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-fade-in">
                    <span className="font-extrabold shrink-0">💡 Hint:</span>
                    <span>{currentExercise.hint}</span>
                  </div>
                )}

                {/* Answer reveal banner */}
                {showExerciseAnswer && (
                  <div className="mt-3 p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs space-y-1 animate-fade-in">
                    <div>
                      <strong className="text-white">Correct Answer:</strong>{' '}
                      <span className="font-mono text-emerald-300">{currentExercise.correctAnswer}</span>
                    </div>
                    {currentExercise.explanation && (
                      <p className="text-gray-300 text-[11px]">{currentExercise.explanation}</p>
                    )}
                  </div>
                )}

                {/* Submission Feedback */}
                {exerciseSubmitted && (
                  <div className={`mt-4 p-4 rounded-xl border text-xs font-bold animate-fade-in flex items-center justify-between gap-3 ${
                    exerciseIsCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/20 border-red-500/40 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4" />
                      <span>{exerciseIsCorrect ? 'Correct! High score awarded.' : 'Not quite right. Review the topic or use a hint!'}</span>
                    </div>

                    {exerciseIsCorrect && activeSectionIndex < sections.length - 1 && (
                      <button
                        onClick={handleNextSection}
                        className="px-3 py-1 rounded bg-[#04aa6d] text-white text-[11px] font-bold hover:bg-[#059862] transition-all cursor-pointer"
                      >
                        Next Chapter &raquo;
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* W3SCHOOLS BOTTOM NAVIGATION (< Previous / Next >) */}
            <div className="flex items-center justify-between border-t border-gray-400/15 pt-6 mt-12">
              <button
                onClick={handlePrevSection}
                disabled={activeSectionIndex === 0}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  activeSectionIndex === 0
                    ? 'opacity-25 cursor-not-allowed bg-gray-400/20 text-gray-500'
                    : 'bg-[#04aa6d] hover:bg-[#059862] text-white active:scale-95'
                }`}
                id="btn-w3-prev-bottom"
              >
                &larr; Previous
              </button>

              {/* Back to Table of Contents button in bottom nav */}
              {activeSectionIndex !== 0 && (
                <button
                  onClick={() => {
                    setActiveSectionIndex(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-400/20 hover:bg-[#04aa6d]/10 text-gray-500 hover:text-[#04aa6d] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#04aa6d]" />
                  <span>Table of Contents</span>
                </button>
              )}

              <button
                onClick={handleNextSection}
                disabled={activeSectionIndex === sections.length - 1}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  activeSectionIndex === sections.length - 1
                    ? 'opacity-25 cursor-not-allowed bg-gray-400/20 text-gray-500'
                    : 'bg-[#04aa6d] hover:bg-[#059862] text-white active:scale-95'
                }`}
                id="btn-w3-next-bottom"
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 3. SLIDE-OVER TABLE OF CONTENTS MODAL / DRAWER */}
      {tocDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className={`w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
              theme === 'w3-light' ? 'bg-white border-gray-300' : `${themeClasses.cardBg} ${themeClasses.border}`
            }`}
          >
            {/* Drawer Header */}
            <div className={`p-5 border-b flex items-center justify-between gap-3 ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0f1722]'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#04aa6d] text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#04aa6d]">
                    Full Manual Table of Contents
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {sections.length} Chapters & Topics • Click any topic to navigate instantly
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTocDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search */}
            <div className="p-4 border-b border-gray-400/15">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter manual topics (e.g. Active Directory, DHCP, WSUS, IIS, DNS, Backup)..."
                  value={tocFilterQuery}
                  onChange={(e) => setTocFilterQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#04aa6d]"
                />
                {tocFilterQuery && (
                  <button
                    onClick={() => setTocFilterQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Topics List */}
            <div className="p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-gray-200/40 dark:divide-slate-800/40">
              {sections
                .filter(sec => !tocFilterQuery || sec.title.toLowerCase().includes(tocFilterQuery.toLowerCase()) || sec.content.toLowerCase().includes(tocFilterQuery.toLowerCase()))
                .map((sec, sIdx) => {
                  const isLearningOutcome = sec.title.toLowerCase().includes('learning outcome');
                  const isIndicative = sec.title.toLowerCase().includes('indicative content');
                  const isAssessment = sec.title.toLowerCase().includes('assessment');
                  const isCurrent = sections[activeSectionIndex]?.id === sec.id;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        const actualIdx = sections.findIndex(s => s.id === sec.id);
                        if (actualIdx !== -1) {
                          setActiveSectionIndex(actualIdx);
                        }
                        setTocDrawerOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        stopSpeech();
                        setJumpToast({
                          message: `Navigated to: ${sec.title}`,
                          visible: true
                        });
                        setTimeout(() => setJumpToast(null), 3000);
                      }}
                      className={`w-full text-left py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-[#04aa6d] text-white font-bold'
                          : isLearningOutcome
                          ? 'bg-[#04aa6d]/10 hover:bg-[#04aa6d]/20 font-bold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`text-[11px] font-mono shrink-0 w-6 text-center ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                          {sIdx + 1}
                        </span>
                        <span className={`text-xs truncate ${
                          isCurrent 
                            ? 'text-white font-black' 
                            : isLearningOutcome 
                            ? 'text-[#04aa6d] font-extrabold' 
                            : isAssessment 
                            ? 'text-amber-500 font-bold' 
                            : 'font-medium'
                        }`}>
                          {sec.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {completedSections.includes(sec.id) && (
                          <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-[#04aa6d]'}`} />
                        )}
                        <ArrowRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-[#04aa6d] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'} transition-all`} />
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs text-gray-500 ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0f1722]'}`}>
              <span>Showing {sections.length} topics</span>
              <button
                onClick={() => setTocDrawerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#04aa6d] hover:bg-[#059862] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. JUMP NOTIFICATION TOAST */}
      {jumpToast && jumpToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-[#04aa6d] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-1 shrink-0" />
          <div>
            <div className="text-xs font-black tracking-wide">{jumpToast.message}</div>
            {jumpToast.sub && <div className="text-[11px] opacity-90">{jumpToast.sub}</div>}
          </div>
          <button
            onClick={() => setJumpToast(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 5. HIGH-RESOLUTION FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none"
          onClick={() => setLightboxImage(null)}
        >
          {/* Lightbox Top Header Toolbar */}
          <div 
            className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 max-w-lg truncate">
              <Camera className="w-5 h-5 text-[#04aa6d] shrink-0" />
              <div>
                <span className="font-bold text-sm block truncate">
                  {lightboxImage.caption || 'Document Image / Photo'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  Original Resolution • Zoom: {lightboxZoom}% • Rotation: {lightboxRotation}°
                </span>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleZoomOutLightbox}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetZoomLightbox}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all cursor-pointer"
                title="Reset Zoom to 100%"
              >
                100%
              </button>

              <button
                onClick={handleZoomInLightbox}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={handleRotateLightbox}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Rotate 90 Degrees"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyImageLink}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                title="Copy Image Link / Data"
              >
                {copiedImageUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadLightbox}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-all cursor-pointer ml-2"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage with Zoom and Drag */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt || lightboxImage.caption || 'Inspection'}
              style={{
                transform: `scale(${lightboxZoom / 100}) rotate(${lightboxRotation}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Lightbox Footer Caption */}
          <div 
            className="text-center pt-3 border-t border-white/10 text-xs text-gray-400 font-sans z-10 flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Click outside or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-gray-200">ESC</kbd> to close</span>
            {lightboxImage.caption && (
              <span className="font-semibold text-gray-200 truncate max-w-xl">
                {lightboxImage.caption}
              </span>
            )}
            <span className="text-[11px] text-[#04aa6d] font-bold">W3Schools Authentic Photo Viewer</span>
          </div>
        </div>
      )}

      {/* 6. PHOTOS & FIGURES DRAWER / GALLERY MODAL */}
      {showFiguresDrawer && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setShowFiguresDrawer(false)}
        >
          <div 
            className={`w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l transition-all ${
              themeClasses.border
            } ${
              theme === 'w3-light' ? 'bg-white text-gray-900' : 'bg-[#111927] text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className={`p-5 border-b flex items-center justify-between ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0f1722]'}`}>
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-display font-extrabold text-base">
                    Document Photos & Figures
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {allDocumentImages.length} visual illustrations & photos indexed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFiguresDrawer(false)}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="p-4 border-b border-gray-400/20">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter photos by topic, caption, or figure name..."
                  value={figuresFilterQuery}
                  onChange={(e) => setFiguresFilterQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-[#04aa6d] transition-all ${
                    theme === 'w3-light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Gallery Grid List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allDocumentImages.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto opacity-50" />
                  <p className="text-sm font-semibold text-gray-500">No embedded images found in this note.</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    You can insert photos using the Edit button or upload an image note to study diagrams here.
                  </p>
                </div>
              ) : (
                allDocumentImages
                  .filter(img => !figuresFilterQuery.trim() || 
                    (img.caption || '').toLowerCase().includes(figuresFilterQuery.toLowerCase()) || 
                    (img.sectionTitle || '').toLowerCase().includes(figuresFilterQuery.toLowerCase()))
                  .map((img, idx) => (
                    <div 
                      key={idx}
                      className={`rounded-2xl border p-3 transition-all hover:shadow-lg cursor-pointer group ${
                        themeClasses.border
                      } ${
                        theme === 'w3-light' ? 'bg-gray-50/70 hover:bg-white' : 'bg-slate-900/40 hover:bg-slate-900/80'
                      }`}
                      onClick={() => {
                        setLightboxImage({ url: img.url, caption: img.caption, alt: img.caption });
                        setLightboxZoom(100);
                        setLightboxRotation(0);
                        if (img.sectionIndex !== undefined) {
                          setActiveSectionIndex(img.sectionIndex);
                        }
                      }}
                    >
                      <div className="relative rounded-xl overflow-hidden bg-black/10 dark:bg-black/60 mb-2.5 flex items-center justify-center max-h-48">
                        <img 
                          src={img.url} 
                          alt={img.caption} 
                          className="max-h-48 w-full object-contain group-hover:scale-102 transition-transform duration-200"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5 text-[#04aa6d]" />
                            Inspect Photo
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="font-extrabold text-[#04aa6d] text-[10px] uppercase block tracking-wider">
                            Figure {idx + 1} • {img.sectionTitle || 'Syllabus Visual'}
                          </span>
                          <span className="font-semibold block truncate">
                            {img.caption}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (img.sectionIndex !== undefined) {
                              setActiveSectionIndex(img.sectionIndex);
                              setShowFiguresDrawer(false);
                            }
                          }}
                          className="px-2 py-1 rounded bg-[#04aa6d]/15 text-[#04aa6d] hover:bg-[#04aa6d] hover:text-white transition-colors text-[10px] font-bold shrink-0"
                          title="Jump to this topic"
                        >
                          Go to Topic &rarr;
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs text-gray-500 ${themeClasses.border} ${theme === 'w3-light' ? 'bg-[#f7fdf9]' : 'bg-[#0f1722]'}`}>
              <span>Click any image to view in Lightbox</span>
              <button
                onClick={() => setShowFiguresDrawer(false)}
                className="px-4 py-1.5 rounded-lg bg-[#04aa6d] hover:bg-[#059862] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
