import React, { useState, useEffect, useRef } from 'react';
import { 
  FileQuestion, Sparkles, HelpCircle, Trophy, RefreshCw, CheckCircle, 
  XCircle, ArrowRight, ArrowLeft, BookOpen, Clock, Play, Flag, 
  Lightbulb, AlertCircle, ShieldCheck, ChevronRight, BarChart2, Hash,
  Download, Terminal, Code2
} from 'lucide-react';
import { Quiz, QuizQuestion, CategoryName, CATEGORIES } from '../types.js';
import CodeRunnerWidget, { SupportedLanguage } from './CodeRunnerWidget.js';

interface ExamSimulatorProps {
  userId: string;
  documents: { id: string; name: string; category: string }[];
  initialDocId?: string;
  onQuizSubmit: () => void;
  darkMode: boolean;
}

export default function ExamSimulator({ 
  userId, 
  documents, 
  initialDocId, 
  onQuizSubmit, 
  darkMode 
}: ExamSimulatorProps) {
  // Config selection states
  const [category, setCategory] = useState<CategoryName>('Networking');
  const [docId, setDocId] = useState<string>(initialDocId || '');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'foundational' | 'intermediate' | 'advanced' | 'national_exam'>('intermediate');
  const [questionType, setQuestionType] = useState<'mixed' | 'mcq' | 'scenario' | 'true_false'>('mixed');
  const [customTopic, setCustomTopic] = useState<string>('');

  // Timed exam options
  const [timedMode, setTimedMode] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Quiz running states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [instantChecked, setInstantChecked] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results & Analytics
  const [finalScore, setFinalScore] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);

  // Sync initialDocId if changed externally
  useEffect(() => {
    if (initialDocId) {
      setDocId(initialDocId);
      const match = documents.find(d => d.id === initialDocId);
      if (match && CATEGORIES.includes(match.category as CategoryName)) {
        setCategory(match.category as CategoryName);
      }
    }
  }, [initialDocId, documents]);

  // Timer countdown handler
  useEffect(() => {
    if (activeQuiz && timedMode && !quizFinished && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz, timedMode, quizFinished, secondsRemaining]);

  // Interactive Code Sandbox states for programming assessment
  const [showCodeRunner, setShowCodeRunner] = useState<Record<string, boolean>>({});
  const [reviewCodeRunner, setReviewCodeRunner] = useState<Record<string, boolean>>({});

  // Helper to extract code and language from question or explanation
  const extractCodeDetails = (text: string, cat: string): { code: string; language: SupportedLanguage } => {
    const backtickMatch = text.match(/```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/);
    const catLower = (cat || '').toLowerCase();
    let defaultLang: SupportedLanguage = 'python';
    if (catLower.includes('linux')) defaultLang = 'bash';
    else if (catLower.includes('database')) defaultLang = 'sql';
    else if (catLower.includes('programming')) defaultLang = 'python';

    if (backtickMatch) {
      const rawLang = (backtickMatch[1] || '').toLowerCase();
      let lang: SupportedLanguage = defaultLang;
      if (rawLang.includes('js') || rawLang.includes('javascript')) lang = 'javascript';
      else if (rawLang.includes('bash') || rawLang.includes('sh')) lang = 'bash';
      else if (rawLang.includes('sql')) lang = 'sql';
      else if (rawLang.includes('py')) lang = 'python';
      return { code: backtickMatch[2].trim(), language: lang };
    }

    const textLower = text.toLowerCase();
    let lang: SupportedLanguage = defaultLang;
    if (textLower.includes('javascript') || textLower.includes('console.log') || textLower.includes('function(') || textLower.includes('const ') || textLower.includes('let ')) {
      lang = 'javascript';
    } else if (textLower.includes('chmod ') || textLower.includes('systemctl ') || textLower.includes('grep ') || textLower.includes('bash') || textLower.includes('linux command')) {
      lang = 'bash';
    } else if (textLower.includes('select ') || textLower.includes('insert ') || textLower.includes('update ') || textLower.includes('from ') || textLower.includes('sql')) {
      lang = 'sql';
    }

    const lines = text.split('\n').filter(l => {
      const t = l.trim();
      return t.startsWith('def ') || t.startsWith('print(') || t.startsWith('for ') || 
             t.startsWith('import ') || t.startsWith('class ') || t.startsWith('SELECT ') ||
             t.startsWith('const ') || t.startsWith('let ') || t.startsWith('$ ') || t.startsWith('sudo ');
    });

    if (lines.length > 0) {
      return { code: lines.join('\n'), language: lang };
    }

    // Default starter template if code block not embedded
    if (lang === 'python') {
      return {
        code: `# Python 3.12 Scratchpad\n# Test your logic or verify question syntax:\n\ndef solve():\n    return "Evaluation completed"\n\nprint(solve())\n`,
        language: 'python'
      };
    } else if (lang === 'bash') {
      return {
        code: `#!/usr/bin/env bash\n# Linux shell command scratchpad\necho "Testing shell command..."\nuname -a\n`,
        language: 'bash'
      };
    } else if (lang === 'sql') {
      return {
        code: `-- SQL Query scratchpad\nSELECT id, name, score\nFROM learners\nORDER BY score DESC;\n`,
        language: 'sql'
      };
    }
    return {
      code: `// JavaScript ES6 scratchpad\nconsole.log("Evaluating solution...");\nconst res = [1, 2, 3].reduce((acc, n) => acc + n, 0);\nconsole.log("Result:", res);\n`,
      language: 'javascript'
    };
  };

  const handleDownloadQuestionCode = (q: QuizQuestion, index: number, cat: string) => {
    const details = extractCodeDetails(q.question, cat);
    const ext = details.language === 'python' ? 'py' : details.language === 'javascript' ? 'js' : details.language === 'bash' ? 'sh' : 'sql';
    const content = `# NET LEARN Assessment Code - Question ${index + 1}\n# Topic: ${q.topicTag || cat}\n# Question: ${q.question.replace(/\n/g, ' ')}\n\n${details.code}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `question_${index + 1}_${details.language}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate a quiz via API
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setErrorMessage(null);
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setRevealedHints({});
    setShowCodeRunner({});
    setReviewCodeRunner({});
    setQuizFinished(false);
    startTimeRef.current = Date.now();

    try {
      const res = await fetch('/api/ai/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          docId: docId || undefined,
          userId,
          questionCount,
          difficulty,
          questionType,
          topic: customTopic.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate assessment');
      }

      if (!data.quiz || !Array.isArray(data.quiz.questions) || data.quiz.questions.length === 0) {
        throw new Error('Assessment returned with no questions. Please retry.');
      }

      setActiveQuiz(data.quiz);
      setInstantChecked({});
      if (timedMode) {
        setSecondsRemaining(timerMinutes * 60);
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setErrorMessage(err.message || 'Unable to generate questions. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleToggleHint = (questionId: string) => {
    setRevealedHints(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || quizFinished) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTakenSeconds(duration);

    let score = 0;
    activeQuiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) {
        score++;
      }
    });

    setFinalScore(score);
    setQuizFinished(true);

    try {
      // Submit progress log to backend
      const res = await fetch('/api/ai/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quizId: activeQuiz.id,
          quizTitle: activeQuiz.title,
          category: activeQuiz.category,
          score,
          maxScore: activeQuiz.questions.length
        })
      });
      
      if (res.ok) {
        onQuizSubmit(); // trigger dashboard refresh
      }
    } catch (err) {
      console.error('Error logging quiz results:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeQuestion: QuizQuestion | null = activeQuiz ? activeQuiz.questions[currentQuestionIndex] : null;

  // Format timer MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Grade calculation
  const scorePercent = activeQuiz ? Math.round((finalScore / activeQuiz.questions.length) * 100) : 0;
  const getGradeInfo = (pct: number) => {
    if (pct >= 85) return { label: 'Distinction (High Honors)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 70) return { label: 'Merit (Certified Pass)', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (pct >= 50) return { label: 'Satisfactory Pass', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Needs Revision & Lab Practice', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
      
      {/* LEFT COLUMN: Setup Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-md'
        } space-y-5`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <FileQuestion className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-base">Assessment Generator</h3>
            </div>
            <p className="text-xs text-gray-400">
              Formulate interactive technical examinations, past Rwandan national questions, and hands-on scenarios tailored to your uploaded syllabus.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Generation Notice</p>
                <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
                <button
                  onClick={handleGenerateQuiz}
                  className="mt-2 text-[10px] font-bold underline hover:text-white cursor-pointer"
                >
                  Retry with Curriculum Engine
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Category Select */}
            <div>
              <label className="block font-semibold text-gray-400 mb-1.5">Syllabus Subject Area</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryName)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                }`}
                id="exam-category-select"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Document Select (RAG Scope) */}
            <div>
              <label className="block font-semibold text-gray-400 mb-1.5">Scope Material (Course Document)</label>
              <select
                value={docId}
                onChange={e => setDocId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                }`}
                id="exam-document-select"
              >
                <option value="">General Subject Curriculum (Full Pool)</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Subtopic or Chapter (Optional) */}
            <div>
              <label className="block font-semibold text-gray-400 mb-1.5">
                Target Subtopic / Keyword <span className="opacity-60 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. Subnetting /28, OSPF vs EIGRP, chmod 755"
                className={`w-full px-3.5 py-2.5 rounded-xl font-medium border focus:outline-none transition-all placeholder:text-gray-500 ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500/50' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Question Count Selection & Custom Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-400">Number of Questions</label>
                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                </span>
              </div>
              
              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[3, 5, 10, 15, 20, 25, 30].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      questionCount === cnt
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : darkMode
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>

              {/* Direct Custom Number Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-400">Or enter exact count:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={questionCount}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setQuestionCount(Math.max(1, Math.min(50, val)));
                    }
                  }}
                  className={`w-20 px-2.5 py-1.5 rounded-xl font-mono font-bold text-xs text-center border focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/15 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                  }`}
                  placeholder="Count"
                  id="input-quiz-question-count"
                />
                <span className="text-[10px] text-gray-500">(1 to 50 max)</span>
              </div>
            </div>

            {/* Difficulty Tier */}
            <div>
              <label className="block font-semibold text-gray-400 mb-1.5">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="foundational">Foundational</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced (Deep)</option>
                <option value="national_exam">National Exam / REB</option>
              </select>
            </div>

            {/* Question Style */}
            <div>
              <label className="block font-semibold text-gray-400 mb-1.5">Assessment Style</label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { id: 'mixed', label: 'Mixed Styles' },
                  { id: 'mcq', label: 'Standard MCQ' },
                  { id: 'scenario', label: 'Enterprise Scenario' },
                  { id: 'true_false', label: 'True / False' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuestionType(t.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      questionType === t.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                        : darkMode 
                          ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Timer & Minutes Input */}
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-gray-300">Exam Timer</span>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="timed-mode-toggle" className="text-[11px] text-gray-400 cursor-pointer">
                    {timedMode ? 'Timed Active' : 'Untimed'}
                  </label>
                  <input
                    type="checkbox"
                    id="timed-mode-toggle"
                    checked={timedMode}
                    onChange={e => setTimedMode(e.target.checked)}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {timedMode && (
                <div className="pt-1 space-y-2 animate-fade-in border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Quick presets:</span>
                    <span className="font-mono font-bold text-indigo-400">{timerMinutes} Minutes</span>
                  </div>
                  {/* Preset Minute Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 15, 20, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTimerMinutes(mins)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          timerMinutes === mins
                            ? 'bg-indigo-600 text-white'
                            : darkMode
                              ? 'bg-black/30 text-gray-300 hover:bg-black/50'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  {/* Direct Minutes Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-gray-400">Custom time:</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={timerMinutes}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setTimerMinutes(Math.max(1, Math.min(180, val)));
                        }
                      }}
                      className={`w-20 px-2.5 py-1 rounded-xl font-mono font-bold text-xs text-center border focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-black/40 border-indigo-500/30 text-indigo-300' 
                          : 'bg-white border-indigo-200 text-indigo-700'
                      }`}
                      placeholder="Minutes"
                      id="input-quiz-timer-minutes"
                    />
                    <span className="text-[11px] text-gray-400">min (1 - 180)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-display font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-generate-exam-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing Exam Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Certification Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT COLUMNS: Active Quiz Interface */}
      <div className="lg:col-span-2">
        <div className={`p-6 sm:p-8 rounded-3xl border h-full min-h-[540px] flex flex-col justify-between ${
          darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100 shadow-md'
        }`}>
          
          {loading ? (
            <div className="py-24 text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-gray-200">
                  Formulating {category} Questions...
                </h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Gemini is constructing validated distractors, pedagogical explanations, and referencing standard RFC architectures.
                </p>
              </div>
            </div>
          ) : activeQuiz && activeQuestion && !quizFinished ? (
            // Quiz in progress
            <div className="space-y-6 w-full flex-1 flex flex-col justify-between">
              
              {/* Quiz Header & Status */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200/10 dark:border-gray-800/40 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 uppercase tracking-wider font-bold font-mono">
                        {activeQuiz.category}
                      </span>
                      {activeQuiz.difficulty && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase font-mono">
                          {activeQuiz.difficulty}
                        </span>
                      )}
                      {activeQuestion.topicTag && (
                        <span className="px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-400 font-mono">
                          {activeQuestion.topicTag}
                        </span>
                      )}
                    </div>
                    <h4 className={`font-display font-bold text-lg sm:text-xl mt-1.5 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {activeQuiz.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Timed countdown indicator */}
                    {timedMode && secondsRemaining > 0 && (
                      <div className={`px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border flex items-center gap-2 shadow-sm ${
                        secondsRemaining < 60 
                          ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' 
                          : darkMode
                            ? 'bg-slate-900 border-indigo-500/40 text-indigo-300'
                            : 'bg-indigo-50 border-indigo-300 text-indigo-800'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTimer(secondsRemaining)} remaining</span>
                      </div>
                    )}

                    {/* Question Flag Button */}
                    <button
                      onClick={() => handleToggleFlag(activeQuestion.id)}
                      className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        flaggedQuestions[activeQuestion.id]
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                      }`}
                      title="Flag question for review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Navigator Number Bar */}
                <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
                  {activeQuiz.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    const isFlagged = flaggedQuestions[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all shrink-0 relative flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md'
                            : isAnswered
                              ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300'
                              : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-[#0c131f]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* High-Visibility Question Stem Card */}
              <div className="space-y-4">
                <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
                  darkMode 
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-xl' 
                    : 'bg-slate-50 border-slate-300 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-3">
                    <span className={darkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                      QUESTION {currentQuestionIndex + 1} OF {activeQuiz.questions.length}
                    </span>
                    {flaggedQuestions[activeQuestion.id] && (
                      <span className="text-amber-500 font-semibold flex items-center gap-1 text-xs">
                        <Flag className="w-3.5 h-3.5 fill-amber-500/20" /> Flagged for review
                      </span>
                    )}
                  </div>
                  <h3 className={`text-base sm:text-lg md:text-xl font-bold leading-relaxed tracking-normal ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {activeQuestion.question}
                  </h3>
                </div>

                {/* Code Execution & Downloader Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCodeRunner(prev => ({ ...prev, [activeQuestion.id]: !prev[activeQuestion.id] }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        showCodeRunner[activeQuestion.id]
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30'
                          : darkMode 
                            ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/25 text-indigo-300' 
                            : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{showCodeRunner[activeQuestion.id] ? 'Hide Code Sandbox' : '💻 Run / Test Code in Sandbox'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadQuestionCode(activeQuestion, currentQuestionIndex, activeQuiz.category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        darkMode 
                          ? 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30 text-teal-300' 
                          : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700'
                      }`}
                      title="Download code file for this question"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>📥 Download Code</span>
                    </button>
                  </div>

                  {activeQuestion.hint && !revealedHints[activeQuestion.id] && (
                    <button
                      type="button"
                      onClick={() => handleToggleHint(activeQuestion.id)}
                      className="text-[11px] text-gray-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Need a hint? Click to reveal</span>
                    </button>
                  )}
                </div>

                {/* Interactive Code Runner Widget */}
                {showCodeRunner[activeQuestion.id] && (() => {
                  const details = extractCodeDetails(activeQuestion.question, activeQuiz.category);
                  return (
                    <div className="animate-fade-in my-2">
                      <CodeRunnerWidget
                        initialCode={details.code}
                        initialLanguage={details.language}
                        title={`Question ${currentQuestionIndex + 1} Code Sandbox`}
                        category={activeQuiz.category}
                        darkMode={darkMode}
                        onClose={() => setShowCodeRunner(prev => ({ ...prev, [activeQuestion.id]: false }))}
                        isCollapsible={true}
                        defaultExpanded={true}
                        compact={true}
                      />
                    </div>
                  );
                })()}

                {/* Collapsible Hint */}
                {activeQuestion.hint && (
                  <div>
                    {revealedHints[activeQuestion.id] ? (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5 animate-fade-in">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold block text-amber-300 mb-0.5">Study Hint:</span>
                          <span className="leading-relaxed opacity-90">{activeQuestion.hint}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleHint(activeQuestion.id)}
                        className="text-[11px] text-gray-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Need a hint? Click to reveal</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2.5">
                  {activeQuestion.options.map((opt, optIndex) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === optIndex;
                    const optionLetter = String.fromCharCode(65 + optIndex);
                    const isChecked = instantChecked[activeQuestion.id];
                    const isCorrectAnswer = optIndex === activeQuestion.answer;

                    let optionBorderClass = darkMode 
                      ? 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-100' 
                      : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-indigo-400 text-slate-900 shadow-sm';

                    if (isChecked) {
                      if (isCorrectAnswer) {
                        optionBorderClass = darkMode
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 shadow-md'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/40 shadow-sm';
                      } else if (isSelected) {
                        optionBorderClass = darkMode
                          ? 'bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-500/50 shadow-md'
                          : 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500/40 shadow-sm';
                      }
                    } else if (isSelected) {
                      optionBorderClass = darkMode
                        ? 'bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/60 shadow-md'
                        : 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/40 shadow-sm';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(activeQuestion.id, optIndex)}
                        className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left font-medium transition-all flex items-center justify-between gap-3.5 cursor-pointer ${optionBorderClass}`}
                        id={`option-btn-${activeQuestion.id}-${optIndex}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm ${
                            isChecked
                              ? isCorrectAnswer 
                                ? 'bg-emerald-600 text-white' 
                                : isSelected 
                                  ? 'bg-rose-600 text-white' 
                                  : darkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-700 border border-slate-300'
                              : isSelected
                                ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                                : darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className={`text-sm sm:text-base font-semibold leading-relaxed ${
                            darkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {opt}
                          </span>
                        </div>
                        {isChecked ? (
                          isCorrectAnswer ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : isSelected ? (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          ) : null
                        ) : isSelected ? (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider shrink-0">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Answer Validation & Pedagogical Breakdown */}
                <div className="pt-1 space-y-3">
                  {!instantChecked[activeQuestion.id] && selectedAnswers[activeQuestion.id] !== undefined && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setInstantChecked(prev => ({ ...prev, [activeQuestion.id]: true }))}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Validate Answer & View Technical Breakdown</span>
                      </button>
                      <span className="text-[11px] text-gray-400">
                        Check your choice immediately or proceed with navigation
                      </span>
                    </div>
                  )}

                  {instantChecked[activeQuestion.id] && selectedAnswers[activeQuestion.id] !== undefined && (() => {
                    const isCorrect = selectedAnswers[activeQuestion.id] === activeQuestion.answer;
                    return (
                      <div className={`p-4 rounded-2xl border animate-fade-in text-xs space-y-2.5 ${
                        isCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-sm">
                            {isCorrect ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>Correct Answer!</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span>Incorrect Choice &bull; Correct answer is {String.fromCharCode(65 + activeQuestion.answer)}</span>
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setInstantChecked(prev => ({ ...prev, [activeQuestion.id]: false }));
                            }}
                            className="text-[11px] font-semibold underline opacity-80 hover:opacity-100 cursor-pointer text-gray-300 hover:text-white"
                          >
                            Change / Re-attempt
                          </button>
                        </div>
                        <div className="text-gray-200 leading-relaxed pt-1">
                          <strong className="text-indigo-300 block mb-1">Standard Technical Breakdown:</strong>
                          {activeQuestion.explanation}
                        </div>
                        {activeQuestion.topicTag && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            Specification / Topic: {activeQuestion.topicTag}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bottom Navigation Toolbar */}
              <div className="pt-5 border-t border-gray-200/10 dark:border-gray-800/40 flex items-center justify-between gap-3">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
                  id="btn-quiz-prev"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex + 1 === activeQuiz.questions.length ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                      id="btn-quiz-submit"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                          <span>Grading...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Finish & Grade Assessment</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      id="btn-quiz-next"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : quizFinished && activeQuiz ? (
            // Quiz Results & Review Mode
            <div className="space-y-6 w-full animate-fade-in">
              {/* Score Trophy Banner */}
              <div className="text-center py-6 border-b border-gray-200/10 dark:border-gray-800/40 space-y-3">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl ring-1 ring-emerald-500/20 shadow-lg">
                  <Trophy className="w-8 h-8" />
                </div>
                
                <div>
                  <h4 className={`font-display font-bold text-xl sm:text-2xl ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Assessment Evaluation Complete
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your answers were submitted and recorded to your learning record.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 py-1">
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-emerald-400">
                    {finalScore} / {activeQuiz.questions.length}
                  </h3>
                  <span className="text-sm font-mono text-gray-400 font-bold">
                    ({scorePercent}%)
                  </span>
                </div>

                {/* Grade Label Badge */}
                {(() => {
                  const grade = getGradeInfo(scorePercent);
                  return (
                    <div className={`inline-block px-4 py-1.5 rounded-xl border text-xs font-bold ${grade.bg} ${grade.color}`}>
                      {grade.label} • {timeTakenSeconds > 0 ? `Completed in ${Math.round(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s` : 'Completed'}
                    </div>
                  );
                })()}
              </div>

              {/* In-Depth Question-by-Question Review */}
              <div>
                <h5 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  Detailed Answers & Explanations Review:
                </h5>

                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {activeQuiz.questions.map((q, idx) => {
                    const userAnswer = selectedAnswers[q.id];
                    const isCorrect = userAnswer === q.answer;
                    const hasAnswered = userAnswer !== undefined;

                    return (
                      <div 
                        key={q.id} 
                        className={`p-5 rounded-2xl border text-xs space-y-3.5 ${
                          isCorrect 
                            ? darkMode 
                              ? 'bg-emerald-950/20 border-emerald-500/30' 
                              : 'bg-emerald-50/70 border-emerald-300'
                            : darkMode 
                              ? 'bg-rose-950/20 border-rose-500/30' 
                              : 'bg-rose-50/70 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5 font-semibold">
                          <span className={`font-mono text-xs font-bold ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            QUESTION {idx + 1}
                          </span>
                          {isCorrect ? (
                            <span className="text-emerald-500 flex items-center gap-1 font-bold">
                              <CheckCircle className="w-4 h-4" /> Correct (+1)
                            </span>
                          ) : (
                            <span className="text-rose-500 flex items-center gap-1 font-bold">
                              <XCircle className="w-4 h-4" /> Incorrect (0)
                            </span>
                          )}
                        </div>

                        <h4 className={`font-bold text-sm sm:text-base leading-relaxed ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {q.question}
                        </h4>

                        <div className={`space-y-2 p-3.5 rounded-xl border text-xs ${
                          darkMode 
                            ? 'bg-black/50 border-white/10 text-slate-200' 
                            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                        }`}>
                          <p>
                            <span className="font-bold opacity-75">Your Selection: </span>
                            {hasAnswered ? (
                              <span className={isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                {q.options[userAnswer]}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No answer recorded</span>
                            )}
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-bold opacity-75">Correct Specification: </span>
                              <span className="text-emerald-500 font-bold">
                                {q.options[q.answer]}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Explanation justification */}
                        <div className={`p-3.5 rounded-xl border-l-4 border-indigo-500 leading-relaxed text-xs ${
                          darkMode 
                            ? 'bg-indigo-950/30 text-slate-200' 
                            : 'bg-indigo-50/90 text-slate-800'
                        }`}>
                          <span className={`font-bold block mb-1 ${
                            darkMode ? 'text-indigo-300' : 'text-indigo-700'
                          }`}>
                            Technical Justification:
                          </span>
                          <span className="opacity-95 leading-relaxed">{q.explanation}</span>
                        </div>

                        {/* Interactive Code Runner and Download in Review Mode */}
                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewCodeRunner(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              reviewCodeRunner[q.id]
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>{reviewCodeRunner[q.id] ? 'Hide Solution Sandbox' : '💻 Run Solution Code in Sandbox'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDownloadQuestionCode(q, idx, activeQuiz.category)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>📥 Download Solution Code</span>
                          </button>
                        </div>

                        {reviewCodeRunner[q.id] && (() => {
                          const details = extractCodeDetails(`${q.question}\n${q.explanation}`, activeQuiz.category);
                          return (
                            <div className="mt-3 animate-fade-in">
                              <CodeRunnerWidget
                                initialCode={details.code}
                                initialLanguage={details.language}
                                title={`Question ${idx + 1} Solution Code`}
                                category={activeQuiz.category}
                                darkMode={darkMode}
                                onClose={() => setReviewCodeRunner(prev => ({ ...prev, [q.id]: false }))}
                                isCollapsible={true}
                                defaultExpanded={true}
                                compact={true}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Retake Toolbar */}
              <div className="pt-4 border-t border-gray-200/10 dark:border-gray-800/40 flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateQuiz}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Another Assessment Exam
                </button>
              </div>
            </div>
          ) : (
            // Idle state
            <div className="py-24 text-center max-w-sm mx-auto space-y-4 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h5 className="font-display font-bold text-base text-gray-100">
                  Ready for Exam Simulation
                </h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Select your syllabus subject, pick an optional uploaded textbook, configure your question count, and click Generate to start.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
