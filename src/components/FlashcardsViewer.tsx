import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, BookOpen, RefreshCw, ChevronLeft, ChevronRight, Check, CheckCircle2, Circle, Trash2, HelpCircle } from 'lucide-react';
import { Flashcard, CategoryName, CATEGORIES } from '../types.js';

interface FlashcardsViewerProps {
  userId: string;
  documents: { id: string; name: string; category: string }[];
  initialDocId?: string;
  darkMode: boolean;
}

export default function FlashcardsViewer({ userId, documents, initialDocId, darkMode }: FlashcardsViewerProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryName>('Networking');
  const [docId, setDocId] = useState<string>(initialDocId || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, [userId]);

  const loadFlashcards = async () => {
    try {
      const res = await fetch(`/api/ai/flashcards?userId=${userId}`);
      const data = await res.json();
      if (res.ok && data.flashcards) {
        setCards(data.flashcards);
      }
    } catch (err) {
      console.error('Error loading cards:', err);
    }
  };

  const handleGenerateCards = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setCurrentIndex(0);

    try {
      const res = await fetch('/api/ai/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: currentCategory,
          docId: docId || undefined,
          userId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reload card list
      await loadFlashcards();
    } catch (err: any) {
      console.error('Card compilation error:', err);
      setErrorMessage(`Card compilation notice: ${err.message || 'Please retry.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMastered = async (cardId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/ai/flashcards/${cardId}/master`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMastered: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, isMastered: !currentStatus } : c));
      }
    } catch (err) {
      console.error('Error mastering card:', err);
    }
  };

  const handleDeleteCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/ai/flashcards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardId));
        if (currentIndex >= cards.length - 1 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  // Filter cards by selectedCategory
  const filteredCards = cards.filter(c => c.category === currentCategory);
  const activeCard = filteredCards[currentIndex] || null;

  const totalFiltered = filteredCards.length;
  const masteredFilteredCount = filteredCards.filter(c => c.isMastered).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
      {/* LEFT COLUMN: Setup Deck selection */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm space-y-6`}>
          <div>
            <h3 className="font-display font-bold text-lg">AI Flashcard Builder</h3>
            <p className="text-xs text-gray-400 mt-1">Select a core syllabus field, and trigger automated smart cards to study terminology and concept lists.</p>
          </div>

          <div className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Study Field</label>
              <select
                value={currentCategory}
                onChange={e => {
                  setCurrentCategory(e.target.value as CategoryName);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-white border-gray-200 text-gray-950 focus:border-indigo-500'
                }`}
                id="fc-category-select"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Document scope selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Restrict scope (Optional Document RAG)</label>
              <select
                value={docId}
                onChange={e => setDocId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-white border-gray-200 text-gray-950 focus:border-indigo-500'
                }`}
                id="fc-document-select"
              >
                <option value="">No restriction (General Subject Knowledge)</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleGenerateCards}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-sm shadow-lg hover:shadow-indigo-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="btn-generate-fc-submit"
            >
              <Sparkles className="w-4 h-4" /> {loading ? 'Compiling flashcards...' : 'Compile Smart Study Cards'}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT COLUMN: Active Flashcards Deck interface */}
      <div className="lg:col-span-2">
        <div className={`p-6 rounded-3xl border h-full min-h-[480px] flex flex-col justify-between ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
          
          {loading ? (
            <div className="py-24 text-center space-y-4 my-auto">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-semibold">Gemini is preparing your active study deck... Mapping critical terms and definitions.</p>
            </div>
          ) : activeCard ? (
            // Card deck view
            <div className="space-y-6 w-full flex-1 flex flex-col justify-between">
              {/* Deck progress header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200/10 dark:border-gray-800/40 text-xs">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 uppercase font-mono font-bold">
                    {activeCard.category}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">Mastered: {masteredFilteredCount} of {totalFiltered} cards</p>
                </div>
                <span className="font-mono text-gray-500 font-bold">Card {currentIndex + 1} of {totalFiltered}</span>
              </div>

              {/* ACTIVE 3D FLIPPABLE CONTAINER CARD */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`flex-1 min-h-[220px] rounded-2xl p-6 flex flex-col justify-between cursor-pointer border hover:scale-101 active:scale-99 transition-all duration-300 relative ${
                  isFlipped 
                    ? 'bg-indigo-950/40 border-indigo-500/30' 
                    : 'bg-white/5 border-white/5'
                }`}
                id="interactive-flippable-card"
              >
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 absolute top-4 right-4">
                  {isFlipped ? 'REVERSE (ANSWER)' : 'FRONT (QUESTION)'}
                </span>

                <div className="my-auto py-4 text-center">
                  <p className={`font-display text-base font-semibold leading-relaxed ${isFlipped ? 'text-emerald-400' : 'text-gray-100'}`}>
                    {isFlipped ? activeCard.back : activeCard.front}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="italic">Click card body to flip and reveal</span>
                  <button
                    onClick={(e) => handleDeleteCard(activeCard.id, e)}
                    className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option checkboxes for Mastering card */}
              <div className="flex items-center justify-between py-3">
                <button
                  onClick={() => handleToggleMastered(activeCard.id, activeCard.isMastered)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    activeCard.isMastered
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                      : 'border-gray-300/10 dark:border-gray-800/60 text-gray-400 hover:text-white'
                  }`}
                  id="btn-master-card"
                >
                  {activeCard.isMastered ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  <span>Mark as Mastered</span>
                </button>

                {/* Left/Right deck traversers */}
                <div className="flex gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
                    className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-300 disabled:opacity-40"
                    id="btn-fc-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentIndex === totalFiltered - 1}
                    onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }}
                    className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-300 disabled:opacity-40"
                    id="btn-fc-next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="py-24 text-center max-w-sm mx-auto space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto shadow-sm">
                <Layers className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h5 className="font-display font-bold text-sm text-gray-200">No study cards in this category</h5>
                <p className="text-xs text-gray-500 mt-1">Select a subject on the left-panel config and compile dynamic cards to start memorizing key vocabularies.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
