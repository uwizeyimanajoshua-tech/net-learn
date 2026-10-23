import React, { useState } from 'react';
import { BookOpen, Sparkles, Languages, HelpCircle, Code, List, HelpCircle as QuizIcon, Play, GraduationCap, ChevronRight, AlertCircle } from 'lucide-react';

interface TeacherPanelProps {
  userId: string;
  darkMode: boolean;
}

type TeacherAction = 'teach' | 'kinyarwanda' | 'simple' | 'packet_tracer';

export default function TeacherPanel({ userId, darkMode }: TeacherPanelProps) {
  const [topic, setTopic] = useState('');
  const [action, setAction] = useState<TeacherAction>('teach');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTeachSubmit = async (selectedAction?: TeacherAction) => {
    const act = selectedAction || action;
    const targetTopic = topic.trim() || 'Routing & VLAN Fundamentals';

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: act,
          topic: targetTopic,
          userId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.answer);
    } catch (err: any) {
      setResult(`Failed to teach topic: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const actionPresets = [
    { type: 'teach', label: 'Step-by-Step Lesson', icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'simple', label: 'Explain in Simple Metaphors', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { type: 'kinyarwanda', label: 'Translate to Kinyarwanda', icon: Languages, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { type: 'packet_tracer', label: 'Create Packet Tracer Lab', icon: Code, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
      {/* LEFT COLUMN: Input Selector & Topic Box */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm space-y-6`}>
          <div>
            <h3 className="font-display font-bold text-lg">AI Technical Teacher</h3>
            <p className="text-xs text-gray-400 mt-1">Specify any technical curriculum topic, and select a specialized educational strategy.</p>
          </div>

          <div className="space-y-4">
            {/* Custom topic text box */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">What do you want to learn?</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., VLAN Trunking, OSPF routing, Linux permissions..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs border font-medium focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-white border-gray-200 text-gray-950 focus:border-indigo-500'
                }`}
                id="input-teacher-topic"
              />
            </div>

            {/* Action selectors */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-gray-400">Teaching Strategy</label>
              <div className="flex flex-col gap-2.5">
                {actionPresets.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = action === preset.type;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => setAction(preset.type as any)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 group transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : `${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'}`
                      }`}
                      id={`btn-teacher-strategy-${preset.type}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${isSelected ? 'bg-white/10 border-white/20 text-white' : preset.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{preset.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleTeachSubmit()}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-sm shadow-lg hover:shadow-indigo-500/10 active:scale-98 transition-all flex items-center justify-center gap-2"
              id="btn-teacher-teach-submit"
            >
              <GraduationCap className="w-4 h-4" /> {loading ? 'Teaching...' : 'Start Lesson'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Output Display Area */}
      <div className="lg:col-span-2">
        <div className={`p-6 rounded-3xl border h-full min-h-[520px] flex flex-col justify-between ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
          <div className="space-y-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/10 dark:border-gray-800/40 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h4 className="font-display font-bold text-sm text-gray-200">Interactive Classroom Board</h4>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-gray-500">Lesson Console</span>
            </div>

            {/* Teaching Results */}
            <div className="flex-1 min-h-0 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin">
              {loading ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 font-semibold">Generating customized step-by-step lecture and configurations...</p>
                </div>
              ) : result ? (
                <div className="text-xs text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-left p-1">
                  {result}
                </div>
              ) : (
                <div className="py-24 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-xl mx-auto shadow-sm">👨‍💻</div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-gray-200">Classroom whiteboard is blank</h5>
                    <p className="text-xs text-gray-500 mt-1">Specify a concept, click a teaching strategy preset, and watch NexaLearn compile the configurations immediately.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {result && !loading && (
            <div className="pt-4 border-t border-gray-200/10 dark:border-gray-800/40 flex items-center justify-between text-[10px] text-gray-500">
              <span>Lesson compiled by NexaLearn Trainer</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {copied ? '✓ Lesson Notes Copied!' : 'Copy Lesson Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
