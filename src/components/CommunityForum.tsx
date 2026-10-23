import React, { useState } from 'react';
import { 
  MessageSquare, ThumbsUp, MessageCircle, Share2, Search, PlusCircle, 
  Sparkles, Shield, Send, Globe, Check, CornerDownRight, User 
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  role: 'student' | 'instructor' | 'admin';
  category: string;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: Array<{
    id: string;
    author: string;
    role: string;
    content: string;
    timestamp: string;
    translatedContent?: string;
  }>;
  timestamp: string;
  translatedContent?: string;
  translatedTitle?: string;
}

interface CommunityForumProps {
  darkMode: boolean;
  userId: string;
}

export default function CommunityForum({ darkMode, userId }: CommunityForumProps) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post_1',
      title: 'How to calculate OSPF Cost Metric for CCNA exam?',
      content: 'I am preparing for my Networking finals. If I have a 1 Gbps fiber uplink, is the OSPF cost metric calculated as 100 Mbps / Bandwidth, or do we use a reference bandwidth of 1000 Mbps? What is the standard Cisco configuration command?',
      author: 'Jean de Dieu N.',
      role: 'student',
      category: 'Networking',
      upvotes: 14,
      hasUpvoted: false,
      timestamp: '2 hours ago',
      replies: [
        {
          id: 'rep_1_1',
          author: 'Instructor Joshua',
          role: 'instructor',
          content: 'Excellent question, Jean! By default, Cisco OSPF uses a reference bandwidth of 100 Mbps (10^8 bps). So, Cost = 100 Mbps / Interface Bandwidth. For a 1 Gbps (1000 Mbps) link, the raw calculation yields 100/1000 = 0.1, which Cisco rounds up to 1. To make OSPF differentiate between 100M, 1G, and 10G links, you should modify the reference bandwidth using: "auto-cost reference-bandwidth 1000" under the router ospf process configuration.',
          timestamp: '1 hour ago'
        }
      ]
    },
    {
      id: 'post_2',
      title: 'Piping multiple commands in Linux Bash',
      content: 'I need to extract all unique IP addresses from an apache web access log and count their total hits. Can someone share a clean command line sequence with pipes? I tried grep and sort but it outputted scrambled lines.',
      author: 'Clarisse U.',
      role: 'student',
      category: 'Linux',
      upvotes: 8,
      hasUpvoted: true,
      timestamp: '5 hours ago',
      replies: [
        {
          id: 'rep_2_1',
          author: 'Eric S.',
          role: 'student',
          content: 'You can do this using the following chain: "cat access.log | awk \'{print $1}\' | sort | uniq -c | sort -nr". The awk extracts the first column (IP), sort groups them, uniq -c counts duplicates, and sort -nr sorts them numerically in reverse order!',
          timestamp: '3 hours ago'
        }
      ]
    },
    {
      id: 'post_3',
      title: 'WPA3 vs WPA2 security differences',
      content: 'Why is WPA3 considered so much more secure than WPA2 for wireless setups in Rwandan cyber enterprises? I hear it protects against offline dictionary attacks.',
      author: 'Kevin M.',
      role: 'student',
      category: 'Cyber Security',
      upvotes: 19,
      hasUpvoted: false,
      timestamp: 'Yesterday',
      replies: [
        {
          id: 'rep_3_1',
          author: 'NIT AI',
          role: 'instructor',
          content: 'WPA3 replaces the 4-way Pre-Shared Key (PSK) handshake of WPA2 with "Simultaneous Authentication of Equals" (SAE). SAE prevents eavesdroppers from capturing the initial handshake and running offline brute-force attacks against weak passwords. Even if an attacker captures the airwaves, they cannot crack the passcode offline. Plus, it offers forward secrecy!',
          timestamp: '18 hours ago'
        }
      ]
    }
  ]);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Networking');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const categories = ['All', 'Networking', 'Linux', 'Cyber Security', 'Programming', 'Databases', 'Cloud Computing'];

  const handleUpvote = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          upvotes: p.hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          hasUpvoted: !p.hasUpvoted
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: 'Guest Student',
      role: 'student',
      category: newCategory,
      upvotes: 1,
      hasUpvoted: true,
      timestamp: 'Just now',
      replies: []
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsPosting(false);
  };

  const handleAddReply = (postId: string) => {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [
            ...p.replies,
            {
              id: `rep_${Date.now()}`,
              author: 'Guest Student',
              role: 'student',
              content: text,
              timestamp: 'Just now'
            }
          ]
        };
      }
      return p;
    }));

    setReplyInputs(prev => ({ ...prev, [postId]: '' }));

    // Simulate AI response after 1.5 seconds if posted to Networking or Cloud
    setTimeout(() => {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const alreadyHasAi = p.replies.some(r => r.author === 'NIT AI');
          if (!alreadyHasAi) {
            return {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `rep_ai_${Date.now()}`,
                  author: 'NIT AI',
                  role: 'instructor',
                  content: `Amahirwe masa! NIT AI here. Regarding "${p.title}", our curriculum suggests reviewing standard Packet Tracer configurations. Let me know if you would like me to compile a custom exam flashcard or lesson outline in Kinyarwanda!`,
                  timestamp: 'A few seconds ago'
                }
              ]
            };
          }
        }
        return p;
      }));
    }, 1500);
  };

  const handleTranslate = async (postId: string) => {
    setTranslatingId(postId);
    // Simulated fast local high-fidelity Kinyarwanda translation for NET LEARN
    setTimeout(() => {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            translatedTitle: p.translatedTitle ? undefined : `Nkahe kantu kabara "OSPF Cost Metric" ku kizamini cya CCNA?`,
            translatedContent: p.translatedContent ? undefined : `Ndi kwitegura ibizamini bya Networking. Niba mfite umurongo wa fiber optic wa 1 Gbps, ese uburyo bwo kubara OSPF cost metric bukoresha reference bandwidth ya 100 Mbps cyangwa iya 1000 Mbps? Kandi ni iyihe command ikoreshwa muri Cisco switches cyangwa routers?`
          };
        }
        return p;
      }));
      setTranslatingId(null);
    }, 600);
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Rwanda Tech Community Hub
          </h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            Share ideas, solve practical labs, and collaborate with peer students & NIT AI
          </p>
        </div>

        <button
          onClick={() => setIsPosting(!isPosting)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md self-start md:self-auto transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isPosting ? 'Hide Form' : 'New Question'}</span>
        </button>
      </div>

      {/* NEW POST FORM */}
      {isPosting && (
        <form onSubmit={handleCreatePost} className={`p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-100 shadow-sm'
        } space-y-4`}>
          <h3 className={`font-display font-bold text-sm ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>
            Ask the Community & NIT AI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Question Title</label>
              <input
                type="text"
                placeholder="e.g. How to install Docker on Ubuntu 24.04?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold ${
                  darkMode ? 'bg-slate-950 text-white border-white/5' : 'bg-gray-50 text-gray-900 border-gray-200'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Discipline Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold ${
                  darkMode ? 'bg-slate-950 text-white border-white/5' : 'bg-gray-50 text-gray-900 border-gray-200'
                }`}
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Details & Context</label>
            <textarea
              placeholder="Provide a thorough explanation of your technical issue. Include diagnostic error codes, system environment parameters, or what troubleshooting you have already tried."
              rows={4}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium ${
                darkMode ? 'bg-slate-950 text-white border-white/5' : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Submit Topic
            </button>
          </div>
        </form>
      )}

      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussion topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-900/60 text-white border-white/5' : 'bg-white text-gray-900 border-gray-200 shadow-sm'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                selectedCat === c
                  ? 'bg-teal-700 text-white shadow'
                  : darkMode
                    ? 'bg-slate-900/40 text-gray-400 hover:text-white hover:bg-slate-900'
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* DISCUSSIONS LIST */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${
            darkMode ? 'bg-slate-900/20 border-white/5' : 'bg-gray-50 border-gray-100'
          }`}>
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-semibold">No discussions match your query.</p>
          </div>
        ) : (
          filteredPosts.map(p => (
            <div key={p.id} className={`p-5 rounded-2xl border transition-all ${
              darkMode ? 'bg-elegant-card border-white/5 hover:border-white/10' : 'bg-white border-gray-200/60 shadow-sm hover:shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-left">
                <div className="space-y-1 flex-1">
                  {/* Category and Author info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400">
                      {p.category}
                    </span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <User className="w-3 h-3 text-teal-500" />
                      {p.author}
                      {p.role === 'instructor' && (
                        <span className="bg-amber-500/10 text-amber-500 px-1 rounded text-[8px] font-black uppercase">Staff</span>
                      )}
                    </span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{p.timestamp}</span>
                  </div>

                  {/* Title */}
                  <h4 className={`font-display font-black text-sm sm:text-base leading-snug ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {p.translatedTitle || p.title}
                  </h4>

                  {/* Content */}
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-line`}>
                    {p.translatedContent || p.content}
                  </p>
                </div>

                {/* Vote Block */}
                <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-start">
                  <button
                    onClick={() => handleUpvote(p.id)}
                    className={`p-2 rounded-xl border flex items-center gap-1.5 sm:flex-col transition-all cursor-pointer ${
                      p.hasUpvoted
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                        : darkMode
                          ? 'bg-slate-950 border-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-black">{p.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleTranslate(p.id)}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      p.translatedContent
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : darkMode
                          ? 'bg-slate-950 border-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Translate English <-> Kinyarwanda"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kinyarwanda</span>
                  </button>
                </div>
              </div>

              {/* REPLIES AREA */}
              <div className="mt-4 pt-4 border-t border-gray-200/10 dark:border-white/5 space-y-3">
                {p.replies.map(r => (
                  <div key={r.id} className="flex gap-2 text-left pl-3 sm:pl-6">
                    <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    <div className={`flex-1 p-3.5 rounded-xl border ${
                      r.author === 'NIT AI'
                        ? (darkMode ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-100' : 'bg-indigo-50/50 border-indigo-200 text-indigo-950')
                        : (darkMode ? 'bg-slate-950/40 border-white/[0.03]' : 'bg-gray-50 border-gray-100 text-gray-800')
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black flex items-center gap-1">
                          {r.author === 'NIT AI' ? (
                            <span className="flex items-center gap-1 text-indigo-400">
                              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                              {r.author}
                            </span>
                          ) : (
                            r.author
                          )}
                          {r.role === 'instructor' && (
                            <span className="bg-amber-500/10 text-amber-500 px-1 rounded text-[8px] font-bold">Staff</span>
                          )}
                        </span>
                        <span className="text-[9px] text-gray-500 font-semibold">{r.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{r.content}</p>
                    </div>
                  </div>
                ))}

                {/* REPLY INPUT FIELD */}
                <div className="flex items-center gap-2 pl-3 sm:pl-6 pt-1">
                  <input
                    type="text"
                    placeholder="Write a helpful response..."
                    value={replyInputs[p.id] || ''}
                    onChange={e => setReplyInputs({ ...replyInputs, [p.id]: e.target.value })}
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium ${
                      darkMode ? 'bg-slate-950 text-white border-white/5' : 'bg-gray-50 text-gray-900 border-gray-200'
                    }`}
                    onKeyDown={e => e.key === 'Enter' && handleAddReply(p.id)}
                  />
                  <button
                    onClick={() => handleAddReply(p.id)}
                    className="p-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl transition-all cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
