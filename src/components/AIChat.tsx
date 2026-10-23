import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Sparkles, FolderPlus, Trash2, Library, 
  BookOpen, Layers, Terminal, Volume2, Globe, HelpCircle, 
  Check, Compass, Info, FileText, ChevronRight, CornerDownLeft, ShieldCheck, MessageCircle,
  ArrowDown, Menu, X, Download, Play, Copy, Code2, ExternalLink
} from 'lucide-react';
import { ChatSession, ChatMessage, Document, CategoryName, CATEGORIES } from '../types.js';
import CodeRunnerWidget, { SupportedLanguage } from './CodeRunnerWidget.js';

interface AIChatProps {
  userId: string;
  documents: Document[];
  initialDocId?: string;
  darkMode: boolean;
}

export default function AIChat({ userId, documents, initialDocId, darkMode }: AIChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [text, setText] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeCodeRunners, setActiveCodeRunners] = useState<Record<string, boolean>>({});
  
  // Custom Scoping parameters for RAG
  const [sessionCategory, setSessionCategory] = useState<CategoryName | ''>('');
  const [sessionDocId, setSessionDocId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadChatCode = (codeContent: string, lang: string, blockId: string) => {
    const normLang = (lang || 'python').toLowerCase();
    let ext = 'py';
    if (normLang.includes('js') || normLang.includes('javascript')) ext = 'js';
    else if (normLang.includes('sh') || normLang.includes('bash')) ext = 'sh';
    else if (normLang.includes('sql')) ext = 'sql';
    else if (normLang.includes('html')) ext = 'html';
    else if (normLang.includes('css')) ext = 'css';
    else if (normLang.includes('json')) ext = 'json';

    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code_${blockId.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`/api/chats?userId=${userId}`);
      const data = await res.json();
      if (res.ok && data.chats) {
        // Filter out any duplicate session IDs that might arise
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
          // If initialDocId passed, search for or create a session for it
          if (initialDocId) {
            const matchedDoc = documents.find(d => d.id === initialDocId);
            const docSession = uniqueChats.find((c: any) => c.docId === initialDocId);
            if (docSession) {
              setActiveSession(docSession);
            } else {
              handleCreateSession(`Study: ${matchedDoc?.name || 'Document'}`, matchedDoc?.category as any, initialDocId);
            }
          } else {
            setActiveSession(uniqueChats[0]);
          }
        } else {
          // Create default initial session if none exist
          handleCreateSession('General Study Chat', '', '');
        }
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  };

  const handleCreateSession = async (title: string, category: CategoryName | '', docId: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, category, docId })
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        setSessions(prev => {
          if (prev.some(s => s.id === data.chat.id)) return prev;
          return [data.chat, ...prev];
        });
        setActiveSession(data.chat);
        setShowMobileSidebar(false);
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
        if (activeSession?.id === id) {
          setActiveSession(null);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const messageContent = customText || text;
    if (!messageContent.trim() || !activeSession) return;

    if (!customText) setText('');
    setLoading(true);

    // Optimistically update UI with user message
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toISOString()
    };

    const updatedActive = {
      ...activeSession,
      messages: [...activeSession.messages, userMsg]
    };
    setActiveSession(updatedActive);
    setSessions(prev => prev.map(s => s.id === activeSession.id ? updatedActive : s));

    try {
      const res = await fetch(`/api/chats/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageContent,
          userId,
          useRag
        })
      });
      const data = await res.json();

      if (res.ok && data.message) {
        const finalActive = {
          ...updatedActive,
          messages: [...updatedActive.messages, data.message]
        };
        setActiveSession(finalActive);
        setSessions(prev => prev.map(s => s.id === activeSession.id ? finalActive : s));
      }
    } catch (err) {
      console.error('Failed to get message response:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom on messages change
  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeSession?.messages, loading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  const promptPresets = [
    { label: 'Teach me Routing', prompt: 'Teach me routing step-by-step with practical topologies.' },
    { label: 'Explain VLANs', prompt: 'Explain the core principles of VLAN segmentations.' },
    { label: 'Create OSPF Lab', prompt: 'Create a Cisco Packet Tracer setup for a single-area OSPF network.' },
    { label: 'Explain in Kinyarwanda', prompt: 'Explain virtual switch trunking modes in simple Kinyarwanda.' },
  ];

  // Helper to format inline markdown bold and code
  const formatInlineStyles = (segment: string, isUser: boolean) => {
    const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = segment.split(inlineRegex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            isUser ? 'bg-black/25 text-white' : 'bg-black/40 text-emerald-300 border border-emerald-500/20'
          }`}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Helper to parse markdown links [Text](url) and bare URLs https://... into live clickable links
  const renderTextWithClickableLinks = (textContent: string, isUser: boolean) => {
    const linkRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<>)"]+)/g;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(textContent)) !== null) {
      if (match.index > lastIdx) {
        elements.push(
          <span key={`txt_${lastIdx}`}>
            {formatInlineStyles(textContent.substring(lastIdx, match.index), isUser)}
          </span>
        );
      }

      if (match[2] && match[3]) {
        // Markdown Link: [Title](url)
        const title = match[2];
        const url = match[3];
        elements.push(
          <a
            key={`link_${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-bold inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md underline underline-offset-4 transition-all duration-150 cursor-pointer shadow-xs ${
              isUser
                ? 'bg-white/20 text-white hover:bg-white/30 decoration-white'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 decoration-emerald-400'
            }`}
            title={`Direct Link to: ${url}`}
          >
            <span>{title}</span>
            <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
          </a>
        );
      } else {
        // Plain URL: https://...
        const rawUrl = match[0];
        let cleanUrl = rawUrl;
        let suffix = '';
        if (/[.,;:)!]$/.test(cleanUrl)) {
          suffix = cleanUrl.slice(-1);
          cleanUrl = cleanUrl.slice(0, -1);
        }

        elements.push(
          <React.Fragment key={`rawlink_${match.index}`}>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md underline underline-offset-4 transition-all duration-150 cursor-pointer shadow-xs ${
                isUser
                  ? 'bg-white/20 text-white hover:bg-white/30 decoration-white'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 decoration-emerald-400'
              }`}
              title={`Direct Link to: ${cleanUrl}`}
            >
              <span className="break-all">{cleanUrl}</span>
              <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
            </a>
            {suffix}
          </React.Fragment>
        );
      }

      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < textContent.length) {
      elements.push(
        <span key={`txt_${lastIdx}`}>
          {formatInlineStyles(textContent.substring(lastIdx), isUser)}
        </span>
      );
    }

    return elements;
  };

  const renderMessageContent = (msgText: string, msgId: string, isUser: boolean) => {
    if (!msgText.includes('```')) {
      return (
        <div className="whitespace-pre-wrap font-medium space-y-2">
          {renderTextWithClickableLinks(msgText, isUser)}
        </div>
      );
    }

    const parts = msgText.split('```');
    return (
      <div className="space-y-3 font-medium">
        {parts.map((part, pIdx) => {
          const isCodeBlock = pIdx % 2 === 1;
          if (!isCodeBlock) {
            if (!part.trim()) return null;
            return (
              <div key={pIdx} className="whitespace-pre-wrap">
                {renderTextWithClickableLinks(part, isUser)}
              </div>
            );
          }

          const lines = part.split('\n');
          let lang = 'code';
          let codeContent = part;
          if (lines.length > 0) {
            const firstLine = lines[0].trim().toLowerCase();
            if (/^[a-zA-Z0-9_#-]+$/.test(firstLine) && firstLine.length < 15) {
              lang = firstLine;
              codeContent = lines.slice(1).join('\n');
            }
          }

          const blockId = `${msgId}_blk_${pIdx}`;
          const isRunnerOpen = activeCodeRunners[blockId];
          let supportedLang: SupportedLanguage = 'python';
          if (lang.includes('js') || lang.includes('javascript')) supportedLang = 'javascript';
          else if (lang.includes('bash') || lang.includes('sh')) supportedLang = 'bash';
          else if (lang.includes('sql')) supportedLang = 'sql';

          return (
            <div key={pIdx} className="my-2.5 rounded-2xl border border-white/10 overflow-hidden shadow-md bg-[#080d16] text-left">
              <div className="px-3.5 py-2 flex items-center justify-between text-xs bg-black/40 border-b border-white/5 font-mono">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> {lang}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(codeContent.trim());
                      }
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadChatCode(codeContent.trim(), lang, blockId)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 transition-all cursor-pointer flex items-center gap-1"
                    title="Download code file"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeRunners(prev => ({ ...prev, [blockId]: !prev[blockId] }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isRunnerOpen
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRunnerOpen ? 'Hide Runner' : 'Run Code'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto text-emerald-400">
                <code>{codeContent.trim()}</code>
              </pre>

              {isRunnerOpen && (
                <div className="p-3 border-t border-white/10 bg-black/70 animate-fade-in">
                  <CodeRunnerWidget
                    initialCode={codeContent.trim()}
                    initialLanguage={supportedLang}
                    title={`${lang.toUpperCase()} Sandbox`}
                    category={activeSession?.category || 'Programming'}
                    darkMode={darkMode}
                    onClose={() => setActiveCodeRunners(prev => ({ ...prev, [blockId]: false }))}
                    isCollapsible={true}
                    defaultExpanded={true}
                    compact={true}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-[580px] h-[calc(100vh-130px)] max-h-[850px] flex flex-col md:grid md:grid-cols-4 border rounded-[2rem] overflow-hidden transition-all text-left shadow-lg ${
      darkMode ? 'bg-elegant-card border-white/[0.04]' : 'bg-white border-gray-200'
    }`}>
      
      {/* LEFT SIDEBAR: Session Lists */}
      <div className={`md:col-span-1 border-r flex flex-col justify-between h-full min-h-0 ${
        showMobileSidebar ? 'block absolute inset-0 z-30' : 'hidden md:flex'
      } ${
        darkMode ? 'bg-elegant-sidebar border-white/[0.04]' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200/15 dark:border-white/[0.04] flex items-center justify-between shrink-0">
            <h3 className={`font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <MessageSquare className="w-4 h-4 text-brand-primary" /> Chats & Queries
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCreateSession(`Study Session ${sessions.length + 1}`, '', '')}
                className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer border border-emerald-500/10"
                title="Create New Chat"
                id="btn-create-chat-session"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              {showMobileSidebar && (
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1.5 rounded-xl bg-gray-500/10 text-gray-400 hover:text-white md:hidden"
                  title="Close Sessions Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin min-h-0">
            {sessions.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center pt-8">No chats active. Click + above.</p>
            ) : (
              sessions.map(s => {
                const isActive = activeSession?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSession(s);
                      setShowMobileSidebar(false);
                    }}
                    className={`group p-3 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                      isActive 
                        ? 'bg-brand-primary text-white shadow-md shadow-emerald-500/10' 
                        : darkMode 
                          ? 'bg-slate-900/50 border border-white/[0.03] hover:bg-slate-900 hover:border-white/10 text-gray-300' 
                          : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className={`p-1 rounded-lg hover:bg-red-500 hover:text-white shrink-0 transition-all ${
                        isActive ? 'text-emerald-100 hover:text-white' : 'opacity-0 group-hover:opacity-100 text-gray-500'
                      }`}
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar footer branding */}
          <div className="p-4 border-t border-gray-200/15 dark:border-white/[0.04] bg-slate-900/20 text-[10px] text-gray-500 flex items-center gap-1.5 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NET LEARN ChatGPT Copilot</span>
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE: The Interactive ChatGPT Area */}
      <div className="md:col-span-3 flex flex-col justify-between bg-elegant-bg/20 relative h-full min-h-0">
        {activeSession ? (
          <div className="flex flex-col h-full min-h-0">
            
            {/* Session Header Controls */}
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
              darkMode ? 'bg-slate-950/80 border-white/[0.04]' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2.5 text-left">
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="p-1.5 rounded-xl bg-slate-800 text-gray-300 md:hidden hover:bg-slate-700"
                  title="Toggle Sessions Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
                <div>
                  <h4 className={`font-display font-black text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activeSession.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    NIT AI &bull; Google Grounded
                  </span>
                </div>
              </div>

              {/* RAG contextual retrieval toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useRag}
                    onChange={e => setUseRag(e.target.checked)}
                    className="sr-only peer"
                    id="checkbox-use-rag"
                  />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                  <span className={`ml-2 text-[11px] font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    RAG Grounding
                  </span>
                </label>
                
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  useRag 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {useRag ? 'Document Grounded' : 'General Model'}
                </span>
              </div>
            </div>

            {/* Conversation Flow Area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className={`flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-6 ${
                darkMode ? 'bg-slate-950/30' : 'bg-gray-50/50'
              } scrollbar-thin relative`}
            >
              
              {activeSession.messages.length === 0 ? (
                <div className="text-center py-12 max-w-lg mx-auto space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-brand-primary flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md">
                    <Compass className="w-6 h-6 animate-spin-hover" />
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className={`font-display font-black text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Welcome to NIT AI — Your Technical Mentor
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                      Ask technical inquiries, request complex analogies, draft router scripts, or get explanations grounded in syllabus notes & real-time Google search.
                    </p>
                  </div>

                  {/* Preset Pills */}
                  <div className="space-y-3 pt-3">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      SUGGESTED STUDY SHORTCUTS
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {promptPresets.map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => handleSendMessage(preset.prompt)}
                          className={`p-3.5 rounded-2xl border text-left hover:scale-101 active:scale-99 transition-all cursor-pointer hover:border-emerald-500/30 group ${
                            darkMode 
                              ? 'bg-slate-900 border-white/[0.03]' 
                              : 'bg-white border-gray-200 shadow-sm hover:bg-emerald-50/10'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-emerald-400 block group-hover:text-brand-primary transition-colors">
                            {preset.label}
                          </span>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5 font-medium">{preset.prompt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 min-h-0">
                  {activeSession.messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] animate-fade-in ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md border ${
                          isUser 
                            ? 'bg-slate-950 border-indigo-500/30 text-white font-black' 
                            : 'bg-gradient-to-tr from-brand-primary to-emerald-600 border-white/10 text-white font-bold'
                        }`}>
                          {isUser ? 'You' : 'NIT'}
                        </div>

                        {/* Speech Bubble */}
                        <div className="space-y-2 w-full text-left">
                          <div className={`p-4 rounded-3xl text-xs leading-relaxed shadow-sm ${
                            isUser 
                              ? 'bg-brand-primary text-white rounded-tr-none' 
                              : darkMode 
                                ? 'bg-slate-900/90 border border-white/[0.04] text-slate-200 rounded-tl-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                          }`}>
                            {renderMessageContent(msg.text, msg.id, isUser)}
                          </div>

                          {/* Citations / Sources (Syllabus & Real-Time Google Grounding) */}
                          {!isUser && msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pl-2 text-[10px] text-gray-500">
                              <span className="font-bold text-emerald-500 font-mono flex items-center gap-1 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED SOURCES & GROUNDING:
                              </span>
                              {msg.sources.map((src, i) => {
                                const urlMatch = src.match(/(https?:\/\/[^\s)]+)/);
                                if (urlMatch) {
                                  const url = urlMatch[1];
                                  const cleanLabel = src.replace(/\s*\(https?:\/\/[^\s)]+\)\s*/, '').replace(/^Google Search Grounding:\s*"?|"?$/g, '');
                                  return (
                                    <a 
                                      key={i} 
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-bold text-[10px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95" 
                                      title={`Visit external link: ${url}`}
                                    >
                                      <span className="truncate max-w-[220px]">{cleanLabel || url}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  );
                                }
                                return (
                                  <span 
                                    key={i} 
                                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium text-[9px] truncate max-w-[200px] hover:max-w-none transition-all cursor-help" 
                                    title={src}
                                  >
                                    {src}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="flex gap-3 max-w-[80%] animate-fade-in text-left">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse shadow-md">
                    NIT
                  </div>
                  <div className={`p-4 rounded-3xl rounded-tl-none flex items-center gap-3 border ${
                    darkMode ? 'bg-slate-900/90 border-white/[0.04]' : 'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[11px] text-gray-500 font-bold font-mono">
                      NIT AI is consulting live Google documentation & curriculum...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Scroll to Bottom Floating Action Button */}
            {showScrollBottomBtn && (
              <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-20 right-6 z-20 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-extrabold rounded-full shadow-xl flex items-center gap-1.5 transition-all animate-bounce cursor-pointer border border-white/20"
                id="btn-scroll-to-bottom"
              >
                <ArrowDown className="w-3.5 h-3.5" /> Scroll Down
              </button>
            )}

            {/* Input Box Controls */}
            <div className={`p-4 border-t shrink-0 ${
              darkMode ? 'bg-slate-950/80 border-white/[0.04]' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-stretch gap-2">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Ask a technical question (Shift + Enter for new lines)..."
                  className={`flex-1 px-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none transition-all resize-none shadow-inner ${
                    darkMode 
                      ? 'bg-slate-900 border border-white/5 text-white focus:border-emerald-500/40' 
                      : 'bg-white border border-gray-300 text-gray-900 focus:border-emerald-500'
                  }`}
                  id="chat-console-message-input"
                />
                
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!text.trim() || loading}
                  className={`px-5 rounded-2xl text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    !text.trim() || loading
                      ? 'bg-emerald-600/30 cursor-not-allowed opacity-55'
                      : 'bg-brand-primary hover:bg-brand-primary-hover active:scale-95 shadow-emerald-500/5'
                  }`}
                  id="btn-chat-send"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500 font-medium pl-1 pr-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Press Enter to send queries. Responses verified with curriculum notes and Google search.
                </span>
                <span className="hidden sm:inline font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Real-Time Google Grounded
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center py-36 space-y-4 max-w-sm mx-auto">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto animate-bounce" />
            <p className="text-xs text-gray-500 italic font-semibold">
              Select or create a study session from the left index panel to start chat diagnostics.
            </p>
            <button
              onClick={() => handleCreateSession('General Study Chat', '', '')}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow"
            >
              Start General Chat
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
