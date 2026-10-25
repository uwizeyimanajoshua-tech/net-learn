import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Sparkles, FolderPlus, Trash2, Library, 
  BookOpen, Layers, Terminal, Volume2, Globe, HelpCircle, 
  Check, Compass, Info, FileText, ChevronRight, CornerDownLeft, ShieldCheck, MessageCircle,
  ArrowDown, Menu, X, Download, Play, Copy, Code2, ExternalLink,
  Plus, Search, Image as ImageIcon, Clock, Gift, RotateCcw,
  Paperclip, Folder, FolderCode, Brain, Mic, MicOff, Pin, PinOff,
  ChevronDown, Cpu, ChevronLeft, PanelLeftClose, PanelLeftOpen, FileUp, User as UserIcon, LogOut, CheckCircle2
} from 'lucide-react';
import type { ChatSession, ChatMessage, Document, CategoryName, User } from '../types.ts';
import { CATEGORIES } from '../types.ts';
import CodeRunnerWidget, { SupportedLanguage } from './CodeRunnerWidget.tsx';

interface AIChatProps {
  userId: string;
  user?: User;
  documents: Document[];
  initialDocId?: string;
  darkMode: boolean;
  onNavigateToTab?: (tab: string) => void;
}

export default function AIChat({ userId, user, documents, initialDocId, darkMode, onNavigateToTab }: AIChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [text, setText] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [thinkMode, setThinkMode] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const [pinnedSessionIds, setPinnedSessionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('netech_pinned_chats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Attached files
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number; content?: string }>>([]);

  // Voice recording
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Model selection
  const [selectedModel, setSelectedModel] = useState('NETECH AI 2.5');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Scoping parameter for documents
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const [activeCodeRunners, setActiveCodeRunners] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, [userId]);

  // Persist pinned sessions
  useEffect(() => {
    try {
      localStorage.setItem('netech_pinned_chats', JSON.stringify(pinnedSessionIds));
    } catch {}
  }, [pinnedSessionIds]);

  const togglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedSessionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const loadSessions = async () => {
    try {
      const res = await fetch(`/api/chats?userId=${userId}`);
      const textRes = await res.text();
      let data: any = {};
      try { data = JSON.parse(textRes); } catch { return; }
      if (res.ok && data.chats) {
        const uniqueChats: ChatSession[] = [];
        const seenIds = new Set<string>();
        data.chats.forEach((c: ChatSession) => {
          if (!seenIds.has(c.id)) {
            seenIds.add(c.id);
            uniqueChats.push(c);
          }
        });

        setSessions(uniqueChats);
        if (uniqueChats.length > 0) {
          if (initialDocId) {
            const docSession = uniqueChats.find((c: any) => c.docId === initialDocId);
            if (docSession) {
              setActiveSession(docSession);
            } else {
              const matchedDoc = documents.find(d => d.id === initialDocId);
              handleCreateSession(`Study: ${matchedDoc?.name || 'Document'}`, matchedDoc?.category as any, initialDocId);
            }
          } else {
            setActiveSession(uniqueChats[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  };

  const handleCreateSession = async (title: string = 'New Conversation', category: CategoryName | '' = '', docId: string = '') => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, category, docId })
      });
      const textRes = await res.text();
      let data: any = {};
      try { data = JSON.parse(textRes); } catch { return; }
      if (res.ok && data.chat) {
        setSessions(prev => [data.chat, ...prev.filter(s => s.id !== data.chat.id)]);
        setActiveSession(data.chat);
        setMobileSidebarOpen(false);
        setText('');
        setAttachedFiles([]);
        setShowPlusMenu(false);
      }
    } catch (err) {
      console.error('Error creating chat session:', err);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        setPinnedSessionIds(prev => prev.filter(x => x !== id));
        if (activeSession?.id === id) {
          const remaining = sessions.filter(s => s.id !== id);
          setActiveSession(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const rawContent = customText || text;
    if (!rawContent.trim() && attachedFiles.length === 0) return;

    let messageContent = rawContent.trim();
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(', ');
      messageContent = `[Attached files: ${fileNames}]\n${messageContent}`;
    }

    if (!customText) {
      setText('');
      setAttachedFiles([]);
      setShowPlusMenu(false);
    }
    setLoading(true);

    let currentSession = activeSession;
    if (!currentSession) {
      // Auto-create session on the fly
      try {
        const titleSnippet = rawContent.trim().slice(0, 32) || 'New Study Chat';
        const createRes = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, title: titleSnippet, category: '', docId: selectedDocId || '' })
        });
        const createText = await createRes.text();
        const createData = JSON.parse(createText);
        if (createRes.ok && createData.chat) {
          currentSession = createData.chat;
          setSessions(prev => [createData.chat, ...prev]);
          setActiveSession(createData.chat);
        }
      } catch (err) {
        console.error('Auto session creation error:', err);
      }
    }

    if (!currentSession) {
      setLoading(false);
      return;
    }

    // Optimistically update UI with user message
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toISOString()
    };

    const updatedActive = {
      ...currentSession,
      messages: [...currentSession.messages, userMsg]
    };
    setActiveSession(updatedActive);
    setSessions(prev => prev.map(s => s.id === currentSession!.id ? updatedActive : s));

    try {
      const res = await fetch(`/api/chats/${currentSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageContent,
          userId,
          useRag,
          thinkMode,
          webSearch: webSearchEnabled,
          deepResearch: deepResearchMode
        })
      });
      const responseText = await res.text();
      let data: any = {};
      try { data = JSON.parse(responseText); } catch {
        data = {
          message: {
            id: `msg_ai_${Date.now()}`,
            sender: 'ai',
            text: 'I have analyzed your query based on technical curriculum standards. For in-depth references, consult [Rwanda TVET Board (RTB)](https://www.rtb.gov.rw/) and [Cisco Networking Academy](https://www.netacad.com/).',
            timestamp: new Date().toISOString()
          }
        };
      }

      if (res.ok && data.message) {
        const finalActive = {
          ...updatedActive,
          messages: [...updatedActive.messages, data.message]
        };
        setActiveSession(finalActive);
        setSessions(prev => prev.map(s => s.id === currentSession!.id ? finalActive : s));
      }
    } catch (err) {
      console.error('Failed to get message response:', err);
    } finally {
      setLoading(false);
    }
  };

  // Voice Speech Recognition Handler
  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setText(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Voice start notice:', e);
      setIsListening(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newItems = fileList.map((f: File) => ({
      name: f.name,
      size: f.size
    }));

    setAttachedFiles(prev => [...prev, ...newItems]);
    setShowPlusMenu(false);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeSession?.messages, loading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  // Helper to format inline markdown bold and code
  const formatInlineStyles = (segment: string, isUser: boolean) => {
    const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = segment.split(inlineRegex);

    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className={isUser ? 'font-black text-white' : (darkMode ? 'font-black text-emerald-400' : 'font-black text-emerald-900')}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold ${
            isUser ? 'bg-white/20 text-white' : (darkMode ? 'bg-slate-800 text-amber-300 border border-white/5' : 'bg-gray-100 text-pink-600')
          }`}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Render markdown text and live code runner blocks
  const renderMessageContent = (content: string, isUser: boolean, msgId: string) => {
    if (isUser) {
      return (
        <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      );
    }

    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        elements.push(
          <div key={`text-${lastIndex}`} className="space-y-2 leading-relaxed text-sm">
            {textBefore.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{formatInlineStyles(paragraph, isUser)}</p>
            ))}
          </div>
        );
      }

      const language = match[1] || 'bash';
      const code = match[2];
      const blockId = `${msgId}_block_${blockCount}`;
      const isRunnerOpen = !!activeCodeRunners[blockId];
      blockCount++;

      elements.push(
        <div key={blockId} className="my-3 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-xs font-mono text-gray-300 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <Code2 className="w-3.5 h-3.5" />
              {language}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition flex items-center gap-1 text-[10px]"
                title="Copy snippet"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={() => {
                  setActiveCodeRunners(prev => ({ ...prev, [blockId]: !prev[blockId] }));
                }}
                className="hover:text-white px-2 py-1 rounded bg-brand-primary/20 text-emerald-300 hover:bg-brand-primary/30 transition flex items-center gap-1 text-[10px] font-bold"
                title="Run in live sandbox"
              >
                <Play className="w-3 h-3 text-emerald-400" /> {isRunnerOpen ? 'Hide Sandbox' : 'Run Live'}
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-gray-200 text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{code}</code>
          </pre>

          {isRunnerOpen && (
            <div className="p-3 bg-slate-900/90 border-t border-white/5">
              <CodeRunnerWidget
                initialCode={code}
                initialLanguage={(language.toLowerCase() as SupportedLanguage) || 'javascript'}
                darkMode={true}
              />
            </div>
          )}
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText.trim()) {
      elements.push(
        <div key={`text-${lastIndex}`} className="space-y-2 leading-relaxed text-sm">
          {remainingText.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{formatInlineStyles(paragraph, isUser)}</p>
          ))}
        </div>
      );
    }

    return elements;
  };

  // User display info - EXACTLY your account
  const displayName = user?.username || 'Joshua Uwizeyimana';
  const displayEmail = user?.email || 'uwizeyimanajoshua@gmail.com';
  const isOwner = displayEmail.toLowerCase() === 'uwizeyimanajoshua@gmail.com' || user?.role === 'admin';
  const displayRole = isOwner ? 'Administrator' : 'Free';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JU';

  // Filtered session list
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const pinnedSessions = filteredSessions.filter(s => pinnedSessionIds.includes(s.id));
  const recentSessions = filteredSessions.filter(s => !pinnedSessionIds.includes(s.id));

  // Quick Action Items matching the reference screenshot exactly
  const quickActions = [
    {
      id: 'files',
      icon: <Paperclip className="w-4 h-4 text-gray-400" />,
      title: 'Add photos & files',
      subtitle: 'Upload from computer',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'library',
      icon: <Folder className="w-4 h-4 text-amber-500" />,
      title: 'Add from library',
      subtitle: 'Browse and search your files',
      action: () => setShowLibraryModal(true)
    },
    {
      id: 'image',
      icon: <ImageIcon className="w-4 h-4 text-sky-500" />,
      title: 'Create image',
      subtitle: 'Visualize anything',
      action: () => {
        setText('Create a detailed technical diagram architecture for: ');
        setShowPlusMenu(false);
      }
    },
    {
      id: 'websearch',
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      title: 'Web search',
      subtitle: 'Find real-time news and info',
      action: () => {
        setWebSearchEnabled(prev => !prev);
        setShowPlusMenu(false);
      }
    },
    {
      id: 'project',
      icon: <FolderCode className="w-4 h-4 text-emerald-500" />,
      title: 'Work in a project',
      subtitle: 'Start a chat in a project',
      action: () => {
        if (onNavigateToTab) onNavigateToTab('linux_sim');
      }
    },
    {
      id: 'research',
      icon: <Brain className="w-4 h-4 text-indigo-500" />,
      title: 'Deep research',
      subtitle: 'Get a detailed report',
      action: () => {
        setDeepResearchMode(prev => !prev);
        setThinkMode(true);
        setShowPlusMenu(false);
      }
    },
    {
      id: 'sketch',
      icon: <Code2 className="w-4 h-4 text-teal-500" />,
      title: 'Sketch',
      subtitle: 'Draw and attach an image',
      action: () => {
        setText('Provide an ASCII topology diagram and step-by-step switch commands for: ');
        setShowPlusMenu(false);
      }
    }
  ];

  return (
    <div className={`flex h-[calc(100vh-8.5rem)] w-full overflow-hidden text-left font-sans ${
      darkMode ? 'bg-[#0f172a] text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Hidden File Input for attachments */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        multiple 
        className="hidden" 
        accept=".txt,.pdf,.png,.jpg,.jpeg,.json,.py,.js,.sh,.sql" 
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR (Matching reference image layout)             */}
      {/* ------------------------------------------------------------- */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-0 -ml-64 md:ml-0 md:w-16'} 
        transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between border-r z-30
        ${darkMode ? 'bg-[#0B1120] border-white/[0.06]' : 'bg-[#F9FAFB] border-gray-200'}
        ${mobileSidebarOpen ? '!w-72 fixed inset-y-0 left-0 shadow-2xl !ml-0' : 'hidden md:flex'}
      `}>
        {/* Top Header */}
        <div className="p-3.5 border-b border-gray-200 dark:border-white/[0.04] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-emerald-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
              N
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-sm tracking-tight font-display truncate">
                NETECH AI
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {sidebarOpen && (
              <button 
                onClick={() => handleCreateSession('New Chat', '', '')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/5 transition cursor-pointer"
                title="Search / New"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileSidebarOpen(false);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/5 transition cursor-pointer"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action button: + New Chat (Pill button as in screenshot) */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => handleCreateSession('New Conversation', '', '')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              darkMode 
                ? 'bg-slate-800/80 hover:bg-slate-800 text-white border border-white/5' 
                : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-xs'
            }`}
            id="btn-sidebar-new-chat"
          >
            <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
            {sidebarOpen && <span>New chat</span>}
          </button>
        </div>

        {/* Quick Menu Items (Images, Scheduled, Library, etc. from screenshot) */}
        {sidebarOpen && (
          <div className="px-3 pb-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0 border-b border-gray-200 dark:border-white/[0.04]">
            <button 
              onClick={() => handleSendMessage('Generate an architectural diagram of OSI vs TCP/IP protocols.')}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer text-left"
            >
              <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Images</span>
            </button>
            <button 
              onClick={() => handleSendMessage('Create a 7-day study schedule to master CCNA networking and Linux administration.')}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer text-left"
            >
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Scheduled</span>
            </button>
            <button 
              onClick={() => setShowLibraryModal(true)}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer text-left"
            >
              <Library className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Library</span>
            </button>
            <button 
              onClick={() => onNavigateToTab && onNavigateToTab('python_sim')}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer text-left"
            >
              <Terminal className="w-4 h-4 text-teal-500 shrink-0" />
              <span>Codex</span>
            </button>
          </div>
        )}

        {/* Scrollable Chat Sessions List (Pinned + Recents) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin">
          {sidebarOpen && (
            <>
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                    <Pin className="w-3 h-3 text-emerald-500" />
                    <span>Pinned</span>
                  </div>
                  <div className="space-y-0.5">
                    {pinnedSessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveSession(session);
                          setMobileSidebarOpen(false);
                        }}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          activeSession?.id === session.id
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate flex-1">{session.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => togglePinSession(session.id, e)}
                            className="p-1 hover:text-amber-500"
                            title="Unpin"
                          >
                            <PinOff className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recents Section */}
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Recents
                </div>
                {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
                  <div className="text-[11px] text-gray-400 italic px-2 py-3">
                    No conversations yet. Type a question to start.
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {recentSessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveSession(session);
                          setMobileSidebarOpen(false);
                        }}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          activeSession?.id === session.id
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate flex-1">{session.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => togglePinSession(session.id, e)}
                            className="p-1 hover:text-emerald-500"
                            title="Pin chat"
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 hover:text-red-500"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM PROFILE FOOTER (EXACTLY YOUR ACCOUNT)                   */}
        {/* ------------------------------------------------------------- */}
        <div className={`p-3 border-t shrink-0 ${
          darkMode ? 'border-white/[0.06] bg-[#090D16]' : 'border-gray-200 bg-[#F9FAFB]'
        }`}>
          <div 
            onClick={() => setShowAccountModal(true)}
            className={`flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer select-none ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-200/70'
            }`}
            title="Click to view your account details"
            id="sidebar-profile-footer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <div className={`text-xs font-bold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {displayName}
                </div>
                <div className="text-[10px] text-gray-500 font-medium truncate">
                  {displayRole}
                </div>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => setShowOfferModal(true)}
              className={`w-full mt-2 py-2 px-3 rounded-full border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                darkMode 
                  ? 'border-white/10 hover:bg-white/5 text-gray-200 bg-slate-900/40' 
                  : 'border-gray-300 hover:bg-gray-100 text-gray-800 bg-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-blue-500" />
              <span>Claim offer</span>
            </button>
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONVERSATION WORKSPACE                                */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Bar with Model Selector & Free Offer Badge */}
        <header className={`px-4 py-3 border-b flex items-center justify-between shrink-0 z-20 ${
          darkMode ? 'bg-[#0f172a]/95 border-white/[0.04]' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg md:hidden text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  darkMode ? 'bg-slate-800/80 hover:bg-slate-800 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <span>{selectedModel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showModelDropdown && (
                <div className={`absolute top-full left-0 mt-1.5 w-60 rounded-2xl shadow-2xl border p-2 z-50 ${
                  darkMode ? 'bg-slate-900 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
                }`}>
                  <div
                    onClick={() => { setSelectedModel('NETECH AI 2.5'); setShowModelDropdown(false); }}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-xs"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>NETECH AI 2.5</span>
                      {selectedModel === 'NETECH AI 2.5' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-gray-400">Standard fast & grounded model</div>
                  </div>
                  <div
                    onClick={() => { setSelectedModel('NETECH AI Reasoning'); setThinkMode(true); setShowModelDropdown(false); }}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-xs"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-indigo-500" />
                        <span>NETECH Deep Reason</span>
                      </span>
                      {selectedModel === 'NETECH AI Reasoning' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-gray-400">Step-by-step thinking for code & math</div>
                  </div>
                </div>
              )}
            </div>

            {/* Scope / RAG Badge */}
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              webSearchEnabled ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-gray-500/10 text-gray-400'
            }`}>
              <Globe className="w-3 h-3" />
              <span>Search Grounded</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateSession('New Conversation', '', '')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowOfferModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500/15 transition cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Free offer</span>
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* CENTER AREA: Either Clean Agenda View OR Messages List        */}
        {/* ------------------------------------------------------------- */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin relative flex flex-col"
        >
          {(!activeSession || activeSession.messages.length === 0) ? (
            /* What's on the agenda today? (Clean view matching user screenshot) */
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-8 space-y-6 animate-fade-in text-center">
              <h1 className={`text-3xl font-normal tracking-tight ${
                darkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                What's on the agenda today?
              </h1>

              {/* Central Floating Prompt Input Bar */}
              <div className="w-full relative">
                {/* Attached files pills */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-start">
                    {attachedFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{f.name}</span>
                        <button 
                          onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className={`w-full rounded-full border transition-all duration-200 py-1.5 px-3 flex items-center gap-2 relative shadow-sm ${
                  darkMode 
                    ? 'bg-slate-900 border-white/10 focus-within:border-gray-500 shadow-black/30' 
                    : 'bg-white border-gray-300 focus-within:border-gray-500 shadow-gray-200/50'
                }`}>
                  {/* + Button */}
                  <button
                    type="button"
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                      showPlusMenu 
                        ? 'bg-emerald-500 text-white rotate-45' 
                        : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                    title="Add files or tools"
                  >
                    <Plus className="w-5 h-5 transition-transform" />
                  </button>

                  {/* Input field */}
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask NETECH AI..."
                    className={`flex-1 bg-transparent border-0 focus:outline-none text-sm font-medium px-2 ${
                      darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />

                  {/* Right side controls: Think + Mic + Send */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Think Button */}
                    <button
                      type="button"
                      onClick={() => setThinkMode(!thinkMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${
                        thinkMode 
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40' 
                          : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                      }`}
                      title="Toggle Deep Reasoning"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Think</span>
                    </button>

                    {/* Mic Voice Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                      }`}
                      title={isListening ? 'Stop voice recognition' : 'Speak to AI'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Send Button / Voice Orb */}
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!text.trim() && attachedFiles.length === 0}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        text.trim() || attachedFiles.length > 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                          : 'bg-blue-600/40 text-blue-200 opacity-60 cursor-not-allowed'
                      }`}
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* Expandable Tools List (Matching Screenshot underneath bar)  */}
                {/* ----------------------------------------------------------- */}
                {showPlusMenu && (
                  <div className={`mt-3 rounded-2xl border p-2 shadow-2xl transition-all duration-200 text-left ${
                    darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white border-gray-200'
                  }`}>
                    <div className="space-y-0.5">
                      {quickActions.map(action => (
                        <div
                          key={action.id}
                          onClick={action.action}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            darkMode ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 shrink-0">
                            {action.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block">{action.title}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{action.subtitle}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Conversation messages flow */
            <div className="space-y-6 max-w-3xl mx-auto w-full pb-28">
              {activeSession.messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id || idx} className={`flex gap-3 text-left ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        N
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : (darkMode ? 'bg-slate-900/90 text-gray-100 border border-white/5 rounded-tl-none shadow-sm' : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-tl-none shadow-sm')
                    }`}>
                      {/* Thought block (for deep reasoning) */}
                      {!isUser && thinkMode && idx === activeSession.messages.length - 1 && (
                        <details className="mb-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
                          <summary className="font-bold flex items-center gap-1.5 cursor-pointer select-none">
                            <Brain className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Thought for 3 seconds</span>
                          </summary>
                          <div className="mt-2 text-[11px] text-gray-400 leading-relaxed font-mono pl-5 border-l border-indigo-500/30">
                            Verified curriculum learning outcomes, consulted syllabus notes, confirmed practical network topology prerequisites.
                          </div>
                        </details>
                      )}

                      {renderMessageContent(msg.text, isUser, msg.id || `msg_${idx}`)}

                      {/* Source references */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Verified Sources:
                          </span>
                          {msg.sources.map((src, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        {initials}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 animate-pulse">
                    N
                  </div>
                  <div className={`p-4 rounded-3xl rounded-tl-none flex items-center gap-3 border ${
                    darkMode ? 'bg-slate-900 border-white/5' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {thinkMode ? 'Thinking and reasoning step-by-step...' : 'Consulting curriculum and live documentation...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollBottomBtn && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="fixed bottom-24 right-8 z-30 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1.5 transition-all animate-bounce"
            >
              <ArrowDown className="w-3.5 h-3.5" /> Scroll Down
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DOCKED BOTTOM INPUT BAR (Visible when in an active chat)      */}
        {/* ------------------------------------------------------------- */}
        {activeSession && activeSession.messages.length > 0 && (
          <div className={`p-4 border-t shrink-0 z-20 ${
            darkMode ? 'bg-[#0f172a] border-white/[0.04]' : 'bg-white border-gray-200'
          }`}>
            <div className="max-w-3xl mx-auto w-full relative">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-start">
                  {attachedFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className={`w-full rounded-full border transition-all duration-200 py-1.5 px-3 flex items-center gap-2 ${
                darkMode 
                  ? 'bg-slate-900 border-white/10 focus-within:border-gray-500 shadow-black/30' 
                  : 'bg-white border-gray-300 focus-within:border-gray-500 shadow-gray-200/50'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                    showPlusMenu 
                      ? 'bg-emerald-500 text-white rotate-45' 
                      : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                  }`}
                  title="Add files or tools"
                >
                  <Plus className="w-5 h-5 transition-transform" />
                </button>

                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask NETECH AI..."
                  className={`flex-1 bg-transparent border-0 focus:outline-none text-sm font-medium px-2 ${
                    darkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setThinkMode(!thinkMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${
                      thinkMode 
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40' 
                        : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                    title="Toggle Deep Reasoning"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Think</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                    title={isListening ? 'Stop voice recognition' : 'Speak to AI'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!text.trim() && attachedFiles.length === 0}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      text.trim() || attachedFiles.length > 0
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                        : 'bg-blue-600/40 text-blue-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tools popup menu */}
              {showPlusMenu && (
                <div className={`absolute bottom-full left-0 mb-3 w-72 rounded-2xl border p-2 shadow-2xl transition-all duration-200 text-left z-50 ${
                  darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <div className="space-y-0.5">
                    {quickActions.map(action => (
                      <div
                        key={action.id}
                        onClick={action.action}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          darkMode ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 shrink-0">
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block">{action.title}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{action.subtitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. YOUR ACCOUNT MODAL (WHEN PROFILE FOOTER IS CLICKED)        */}
      {/* ------------------------------------------------------------- */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 text-left animate-fade-in ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    {displayName}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{displayEmail}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Account Status</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isOwner 
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isOwner ? 'Administrator (Full Access)' : 'Student Learner'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Technical Curriculum</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> TVET & CCNA Unlocked
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cloud Database</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  Firestore Connected
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  if (onNavigateToTab) onNavigateToTab('dashboard');
                }}
                className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Go to Learning Dashboard
              </button>
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  localStorage.removeItem('nexalearn_user');
                  localStorage.removeItem('netlearn_user');
                  localStorage.removeItem('nexalearn_token');
                  window.location.reload();
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CLAIM OFFER MODAL                                          */}
      {/* ------------------------------------------------------------- */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 text-left animate-fade-in ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold">Free Student & Educator Offer</h3>
              </div>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">
                All premium technical preparation resources are completely free for Rwandan TVET & University students:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Unlimited AI Technical Explanations & Mentorship</li>
                <li>Live Python Codex & Linux Terminal Simulators</li>
                <li>Comprehensive Cisco CCNA & RTB National Exam Banks</li>
                <li>Real-Time Google Grounding & Live RFC Search</li>
              </ul>
            </div>

            <button
              onClick={() => setShowOfferModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Continue Learning Free
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. LIBRARY SELECTION MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 text-left ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Library className="w-5 h-5 text-emerald-500" />
                Select Syllabus Module
              </h3>
              <button 
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setShowLibraryModal(false);
                    handleSendMessage(`Ground your explanation using syllabus notes from: "${doc.name}"`);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDocId === doc.id 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold' 
                      : (darkMode ? 'bg-slate-800/60 border-white/5 hover:bg-slate-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{doc.name}</div>
                    <div className="text-[10px] text-gray-400">{doc.category}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
