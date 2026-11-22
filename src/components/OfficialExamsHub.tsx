import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Lock, Unlock, Clock, Plus, Trash2, Edit, Users, CheckCircle2,
  XCircle, AlertTriangle, Sparkles, Eye, EyeOff, Play, Flag, ChevronRight,
  ChevronLeft, Ban, Copy, KeyRound, Maximize2, FileCheck2, RefreshCw, Timer
} from 'lucide-react';
import { CategoryName, CATEGORIES, OfficialExam, ExamSubmission, QuizQuestion } from '../types.js';

interface OfficialExamListItem extends Omit<OfficialExam, 'questions'> {
  questions: Array<Omit<QuizQuestion, 'answer' | 'explanation'> & { answer?: number; explanation?: string }>;
  questionCount?: number;
  submissionCount?: number;
  hasAccessCode?: boolean;
  hasSubmitted?: boolean;
  userSubmission?: Partial<ExamSubmission>;
  remainingSeconds?: number;
  isDeadlinePassed?: boolean;
  expiredOrSubmittedHidden?: boolean;
}

interface OfficialExamsHubProps {
  userId: string;
  userRole?: string;
  userEmail?: string;
  username?: string;
  isAdmin: boolean;
  documents: { id: string; name: string; category: string }[];
  darkMode: boolean;
  onExamSubmitted: () => void;
  defaultSubView?: 'take' | 'manage';
}

function createEmptyQuestion(idx: number, category: CategoryName): QuizQuestion {
  return {
    id: `eq_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    topicTag: category
  };
}

export default function OfficialExamsHub({
  userId,
  userRole,
  userEmail,
  username,
  isAdmin,
  documents,
  darkMode,
  onExamSubmitted,
  defaultSubView = 'take'
}: OfficialExamsHubProps) {
  const [exams, setExams] = useState<OfficialExamListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [subView, setSubView] = useState<'list' | 'builder'>(isAdmin && defaultSubView === 'manage' ? 'builder' : 'list');

  useEffect(() => {
    setSubView(isAdmin && defaultSubView === 'manage' ? 'builder' : 'list');
  }, [defaultSubView, isAdmin]);

  // PIN unlock dialog state per exam card
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [startingExamId, setStartingExamId] = useState<string | null>(null);

  // Active exam-taking session state (student)
  const [activeExam, setActiveExam] = useState<OfficialExamListItem | null>(null);
  const [activeAnswers, setActiveAnswers] = useState<Record<string, number>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [submittingExam, setSubmittingExam] = useState<boolean>(false);
  const [completedBanner, setCompletedBanner] = useState<{
    examTitle: string;
    autoSubmitted: boolean;
    reason?: string;
    showResults: boolean;
    submission?: Partial<ExamSubmission>;
  } | null>(null);

  // Refs to guarantee zero stale closures in countdown & tab-switch listeners
  const activeExamRef = useRef<OfficialExamListItem | null>(null);
  const activeAnswersRef = useRef<Record<string, number>>({});
  const violationsRef = useRef<number>(0);
  const submittingRef = useRef<boolean>(false);
  const lastViolationTsRef = useRef<number>(0);

  useEffect(() => { activeExamRef.current = activeExam; }, [activeExam]);
  useEffect(() => { activeAnswersRef.current = activeAnswers; }, [activeAnswers]);
  useEffect(() => { violationsRef.current = violationsCount; }, [violationsCount]);
  useEffect(() => { submittingRef.current = submittingExam; }, [submittingExam]);

  // Admin Builder state
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryName>('Networking');
  const [formDocId, setFormDocId] = useState('');
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(30);
  const [formAvailableUntil, setFormAvailableUntil] = useState<string>('');
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);
  const [formIsLocked, setFormIsLocked] = useState<boolean>(false);
  const [formAccessCode, setFormAccessCode] = useState<string>('');
  const [formPreventTabSwitch, setFormPreventTabSwitch] = useState<boolean>(true);
  const [formMaxTabSwitches, setFormMaxTabSwitches] = useState<number>(1);
  const [formPreventCopyPaste, setFormPreventCopyPaste] = useState<boolean>(true);
  const [formRequireFullscreen, setFormRequireFullscreen] = useState<boolean>(false);
  const [formAllowRetake, setFormAllowRetake] = useState<boolean>(false);
  const [formHideAfterSubmitOrExpiry, setFormHideAfterSubmitOrExpiry] = useState<boolean>(true);
  const [formPassingScore, setFormPassingScore] = useState<number>(50);
  const [formShowResults, setFormShowResults] = useState<boolean>(true);
  const [formQuestions, setFormQuestions] = useState<QuizQuestion[]>([createEmptyQuestion(1, 'Networking')]);
  const [savingExam, setSavingExam] = useState<boolean>(false);
  const [aiDraftCount, setAiDraftCount] = useState<number>(5);
  const [aiDraftLoading, setAiDraftLoading] = useState<boolean>(false);

  // Admin Delete Confirmation & Submissions Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submissionsModalExam, setSubmissionsModalExam] = useState<OfficialExamListItem | null>(null);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': userId || '',
    'x-user-email': userEmail || '',
    'x-user-role': userRole || ''
  }), [userId, userEmail, userRole]);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail || '')}`, {
        headers: {
          'x-user-id': userId || '',
          'x-user-email': userEmail || '',
          'x-user-role': userRole || ''
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.exams)) {
        setExams(data.exams);
      }
    } catch (err) {
      console.error('Failed to load official exams:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail, userRole]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Core submit + disappear handler (shared by manual click, timer expiry, and tab-switch lock)
  const submitActiveExam = useCallback(async (
    autoSubmitted: boolean,
    reason: 'manual' | 'time_expired' | 'tab_switch_violation' | 'deadline_passed'
  ) => {
    const currentExam = activeExamRef.current;
    if (!currentExam || submittingRef.current) return;

    submittingRef.current = true;
    setSubmittingExam(true);

    try {
      const res = await fetch(`/api/exams/${currentExam.id}/submit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          userId,
          username,
          userEmail,
          answers: activeAnswersRef.current,
          autoSubmitted,
          autoSubmitReason: reason,
          tabSwitchCount: violationsRef.current
        })
      });
      const data = await res.json();

      // Exit fullscreen safely if active
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }

      // Immediately close & disappear the active exam interface
      setActiveExam(null);
      activeExamRef.current = null;
      setActiveAnswers({});
      activeAnswersRef.current = {};
      setSecondsLeft(0);
      setSecurityWarning(null);

      setCompletedBanner({
        examTitle: currentExam.title,
        autoSubmitted,
        reason,
        showResults: Boolean(data.showResults),
        submission: data.submission
      });

      onExamSubmitted();
      await fetchExams();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err?.message || 'Could not submit exam. Please check connection and try again.' });
    } finally {
      submittingRef.current = false;
      setSubmittingExam(false);
    }
  }, [authHeaders, fetchExams, onExamSubmitted, userEmail, userId, username]);

  // Countdown tick loop while taking exam
  useEffect(() => {
    if (!activeExam) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          void submitActiveExam(true, 'time_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeExam, submitActiveExam]);

  // Sync draft answers periodically while taking exam so timer expiration always captures latest answers
  useEffect(() => {
    if (!activeExam) return;
    const syncTimer = window.setTimeout(() => {
      fetch(`/api/exams/${activeExam.id}/draft`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId, answers: activeAnswers })
      }).catch(() => {});
    }, 1200);
    return () => window.clearTimeout(syncTimer);
  }, [activeAnswers, activeExam, authHeaders, userId]);

  // Anti-tab-switch & fullscreen-exit proctoring (strictly according to admin settings)
  useEffect(() => {
    if (!activeExam || !activeExam.preventTabSwitch) return;

    const handleLeaveAttempt = async (source: string) => {
      if (!activeExamRef.current || submittingRef.current) return;
      const now = Date.now();
      if (now - lastViolationTsRef.current < 1300) return;
      lastViolationTsRef.current = now;

      try {
        const res = await fetch(`/api/exams/${activeExamRef.current.id}/violation`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        const count = Number(data.tabSwitchCount || violationsRef.current + 1);
        const maxAllowed = Number(data.maxTabSwitches || activeExamRef.current.maxTabSwitches || 1);
        setViolationsCount(count);
        violationsRef.current = count;

        if (data.shouldAutoSubmit || count >= maxAllowed) {
          setSecurityWarning(`Tab switch limit reached (${source}). Exam auto-submitted & locked!`);
          await submitActiveExam(true, 'tab_switch_violation');
        } else {
          setSecurityWarning(
            `Security Alert (${count}/${maxAllowed}): Tab or window switching is locked for this exam. Reaching ${maxAllowed} violation(s) will auto-submit & close your exam.`
          );
        }
      } catch {
        const nextLocal = violationsRef.current + 1;
        setViolationsCount(nextLocal);
        violationsRef.current = nextLocal;
        const maxAllowed = activeExamRef.current.maxTabSwitches || 1;
        if (nextLocal >= maxAllowed) {
          await submitActiveExam(true, 'tab_switch_violation');
        }
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        void handleLeaveAttempt('Switched browser tab');
      }
    };

    const onWindowBlur = () => {
      void handleLeaveAttempt('Window focus lost');
    };

    const onFullscreenChange = () => {
      if (activeExamRef.current?.requireFullscreen && !document.fullscreenElement) {
        void handleLeaveAttempt('Exited fullscreen lock');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [activeExam, authHeaders, submitActiveExam, userId]);

  // Anti-Copy/Cut/Paste/Context-Menu & Shortcut Guard (strictly according to admin settings)
  useEffect(() => {
    if (!activeExam || !activeExam.preventCopyPaste) return;

    const blockClipboard = (e: Event) => {
      e.preventDefault();
      setSecurityWarning('Copy, cut, paste, and right-click are locked by the administrator during this exam.');
    };

    const blockKeys = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's', 'p'].includes(keyLower)) {
        e.preventDefault();
        setSecurityWarning('Keyboard copy/paste/print shortcuts are locked during this exam.');
      }
      if (e.key === 'F12' || e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('paste', blockClipboard);
    document.addEventListener('contextmenu', blockClipboard);
    window.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('paste', blockClipboard);
      document.removeEventListener('contextmenu', blockClipboard);
      window.removeEventListener('keydown', blockKeys);
    };
  }, [activeExam]);

  const handleStartExam = async (exam: OfficialExamListItem) => {
    setStartingExamId(exam.id);
    setStatusBanner(null);
    setCompletedBanner(null);

    try {
      const res = await fetch(`/api/exams/${exam.id}/start`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          userId,
          accessCode: pinInputs[exam.id] || ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not start exam.');
      }

      if (data.exam?.requireFullscreen && typeof document !== 'undefined') {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }

      setActiveExam(data.exam);
      activeExamRef.current = data.exam;
      const savedDraft = data.session?.answersDraft || {};
      setActiveAnswers(savedDraft);
      activeAnswersRef.current = savedDraft;
      setActiveQuestionIdx(0);
      setSecondsLeft(Number(data.remainingSeconds || (data.exam.durationMinutes || 30) * 60));
      const vCount = Number(data.session?.tabSwitchCount || 0);
      setViolationsCount(vCount);
      violationsRef.current = vCount;
      setSecurityWarning(null);
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Unable to unlock exam.' });
      await fetchExams();
    } finally {
      setStartingExamId(null);
    }
  };

  // Admin helpers
  const resetBuilderForm = () => {
    setEditingExamId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Networking');
    setFormDocId('');
    setFormDurationMinutes(30);
    setFormAvailableUntil('');
    setFormIsPublished(true);
    setFormIsLocked(false);
    setFormAccessCode('');
    setFormPreventTabSwitch(true);
    setFormMaxTabSwitches(1);
    setFormPreventCopyPaste(true);
    setFormRequireFullscreen(false);
    setFormAllowRetake(false);
    setFormHideAfterSubmitOrExpiry(true);
    setFormPassingScore(50);
    setFormShowResults(true);
    setFormQuestions([createEmptyQuestion(1, 'Networking')]);
  };

  const handleEditExam = (exam: OfficialExamListItem) => {
    setEditingExamId(exam.id);
    setFormTitle(exam.title);
    setFormDescription(exam.description || '');
    setFormCategory(exam.category);
    setFormDocId(exam.docId || '');
    setFormDurationMinutes(exam.durationMinutes || 30);
    setFormAvailableUntil(exam.availableUntil ? exam.availableUntil.slice(0, 16) : '');
    setFormIsPublished(exam.isPublished);
    setFormIsLocked(exam.isLocked);
    setFormAccessCode(exam.accessCode && exam.accessCode !== 'PROTECTED' ? exam.accessCode : '');
    setFormPreventTabSwitch(exam.preventTabSwitch);
    setFormMaxTabSwitches(exam.maxTabSwitches || 1);
    setFormPreventCopyPaste(exam.preventCopyPaste);
    setFormRequireFullscreen(Boolean(exam.requireFullscreen));
    setFormAllowRetake(Boolean(exam.allowRetake));
    setFormHideAfterSubmitOrExpiry(exam.hideAfterSubmitOrExpiry !== false);
    setFormPassingScore(exam.passingScorePercent || 50);
    setFormShowResults(exam.showResultsAfterSubmit !== false);
    setFormQuestions(
      (exam.questions || []).map((q, idx) => ({
        id: q.id || `eq_${idx}`,
        question: q.question,
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['', '', '', ''],
        answer: typeof q.answer === 'number' ? q.answer : 0,
        explanation: q.explanation || '',
        topicTag: q.topicTag || exam.category
      }))
    );
    setSubView('builder');
  };

  const handleAiDraftQuestions = async () => {
    setAiDraftLoading(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/ai/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory,
          docId: formDocId || undefined,
          userId,
          questionCount: aiDraftCount,
          difficulty: 'national_exam',
          questionType: 'mixed',
          topic: formTitle.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.quiz?.questions)) {
        throw new Error(data.error || 'Could not draft questions.');
      }
      const drafted: QuizQuestion[] = data.quiz.questions.map((q: any, idx: number) => ({
        id: `eq_${Date.now()}_${idx + 1}`,
        question: q.question,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: typeof q.answer === 'number' ? q.answer : 0,
        explanation: q.explanation || '',
        topicTag: q.topicTag || formCategory
      }));
      setFormQuestions(drafted);
      setStatusBanner({ type: 'success', text: `Drafted ${drafted.length} questions from curriculum notes. Review or edit them before saving.` });
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Failed to draft questions.' });
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleSaveOfficialExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setStatusBanner({ type: 'error', text: 'Please enter an exam title.' });
      return;
    }
    const validQuestions = formQuestions.filter(
      q => q.question.trim().length > 0 && q.options.filter(o => o.trim().length > 0).length >= 2
    );
    if (validQuestions.length === 0) {
      setStatusBanner({ type: 'error', text: 'Please add at least one complete question with at least 2 options.' });
      return;
    }

    setSavingExam(true);
    setStatusBanner(null);
    try {
      const payload = {
        userId,
        userEmail,
        userRole,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        docId: formDocId || undefined,
        durationMinutes: formDurationMinutes,
        availableUntil: formAvailableUntil ? new Date(formAvailableUntil).toISOString() : undefined,
        isPublished: formIsPublished,
        isLocked: formIsLocked,
        accessCode: formAccessCode.trim() || undefined,
        preventTabSwitch: formPreventTabSwitch,
        maxTabSwitches: formMaxTabSwitches,
        preventCopyPaste: formPreventCopyPaste,
        requireFullscreen: formRequireFullscreen,
        allowRetake: formAllowRetake,
        hideAfterSubmitOrExpiry: formHideAfterSubmitOrExpiry,
        passingScorePercent: formPassingScore,
        showResultsAfterSubmit: formShowResults,
        questions: validQuestions.map(q => ({
          ...q,
          options: q.options.map(o => o.trim() || 'Option')
        }))
      };

      const url = editingExamId ? `/api/exams/${editingExamId}` : '/api/exams';
      const method = editingExamId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save exam.');

      setStatusBanner({
        type: 'success',
        text: editingExamId
          ? `Updated exam "${data.exam.title}" and synced security rules.`
          : `Published "${data.exam.title}" to all website accounts!`
      });
      resetBuilderForm();
      setSubView('list');
      await fetchExams();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Could not save official exam.' });
    } finally {
      setSavingExam(false);
    }
  };

  const handleToggleExamField = async (exam: OfficialExamListItem, field: 'isLocked' | 'isPublished' | 'preventTabSwitch' | 'preventCopyPaste') => {
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          userId,
          userEmail,
          userRole,
          [field]: !exam[field]
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Update failed');
      }
      await fetchExams();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Failed to update exam lock settings.' });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      setConfirmDeleteId(null);
      setStatusBanner({ type: 'success', text: 'Exam deleted cleanly.' });
      await fetchExams();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Could not delete exam.' });
    }
  };

  const handleOpenSubmissions = async (exam: OfficialExamListItem) => {
    setSubmissionsModalExam(exam);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}/submissions?userId=${encodeURIComponent(userId)}`, {
        headers: authHeaders()
      });
      const data = await res.json();
      setExamSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch {
      setExamSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleResetSubmission = async (examId: string, subId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}/submissions/${subId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (res.ok) {
        setExamSubmissions(prev => prev.filter(s => s.id !== subId));
        await fetchExams();
      }
    } catch {}
  };

  const formatClock = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // =========================================================
  // ACTIVE TIMED & LOCKED EXAM-TAKING SCREEN
  // =========================================================
  if (activeExam) {
    const qList = activeExam.questions || [];
    const currentQ = qList[activeQuestionIdx];
    const answeredCount = qList.filter(q => activeAnswers[q.id] !== undefined).length;
    const isCriticalTime = secondsLeft <= 60;

    return (
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-6 animate-fade-in ${
          activeExam.preventCopyPaste ? 'select-none' : ''
        } ${darkMode ? 'bg-[#0b131e] border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900 shadow-xl'}`}
        onCopy={activeExam.preventCopyPaste ? (e) => e.preventDefault() : undefined}
        onCut={activeExam.preventCopyPaste ? (e) => e.preventDefault() : undefined}
        onPaste={activeExam.preventCopyPaste ? (e) => e.preventDefault() : undefined}
        onContextMenu={activeExam.preventCopyPaste ? (e) => e.preventDefault() : undefined}
      >
        {/* Top Security & Countdown Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-500/20">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase">
                Official Exam • {activeExam.category}
              </span>
              {activeExam.preventTabSwitch && (
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Tab Lock Active ({violationsCount}/{activeExam.maxTabSwitches || 1})
                </span>
              )}
              {activeExam.preventCopyPaste && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Copy/Paste Locked
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-black">{activeExam.title}</h2>
          </div>

          {/* Live Auto-Submit Countdown */}
          <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 font-mono ${
            isCriticalTime
              ? 'bg-red-500/15 border-red-500/50 text-red-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Timer className="w-5 h-5" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider opacity-75">Auto-Submit Countdown</span>
              <span className="text-xl font-black tracking-widest">{formatClock(secondsLeft)}</span>
            </div>
          </div>
        </div>

        {/* Security Warning Banner */}
        {securityWarning && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{securityWarning}</span>
          </div>
        )}

        {/* Question Palette */}
        <div className="flex flex-wrap items-center gap-1.5">
          {qList.map((q, idx) => {
            const answered = activeAnswers[q.id] !== undefined;
            const current = idx === activeQuestionIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveQuestionIdx(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  current
                    ? 'bg-indigo-600 border-indigo-400 text-white scale-105'
                    : answered
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
          <span className="ml-auto text-xs font-mono text-gray-400">
            Answered: {answeredCount} / {qList.length}
          </span>
        </div>

        {/* Active Question Card */}
        {currentQ && (
          <div className={`p-6 rounded-2xl border space-y-5 ${
            darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>QUESTION {activeQuestionIdx + 1} OF {qList.length}</span>
              {currentQ.topicTag && <span>{currentQ.topicTag}</span>}
            </div>
            <h3 className="text-base sm:text-lg font-bold leading-relaxed whitespace-pre-wrap">
              {currentQ.question}
            </h3>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const selected = activeAnswers[currentQ.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => setActiveAnswers(prev => ({ ...prev, [currentQ.id]: oIdx }))}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 ${
                      selected
                        ? 'bg-indigo-600/20 border-indigo-500 font-bold text-indigo-300 shadow'
                        : darkMode
                        ? 'bg-black/30 border-white/10 hover:border-white/25 text-gray-200'
                        : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-800'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                      selected ? 'bg-indigo-600 text-white border-indigo-400' : 'border-gray-500/30 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation & Submit */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeQuestionIdx === 0}
              onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-gray-500/25 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              type="button"
              disabled={activeQuestionIdx >= qList.length - 1}
              onClick={() => setActiveQuestionIdx(prev => Math.min(qList.length - 1, prev + 1))}
              className="px-4 py-2.5 rounded-xl border border-gray-500/25 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={submittingExam}
            onClick={() => void submitActiveExam(false, 'manual')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submittingExam ? 'Submitting...' : 'Submit Official Exam'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN OFFICIAL EXAMS HUB (ADMIN BUILDER + AVAILABLE EXAMS)
  // =========================================================
  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Toolbar */}
      <div className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-elegant-card border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div>
          <h2 className="font-display text-lg sm:text-xl font-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Official Course Exams & Timed Assessments</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isAdmin
              ? 'Prepare timed exams, enforce tab-switch & copy/paste locks, and inspect student submissions across all website accounts.'
              : 'All published official exams appear here. Once started, complete within the countdown before the exam auto-submits and closes.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchExams}
            className="px-3 py-2 rounded-xl border border-gray-500/25 text-xs font-bold hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setSubView('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  subView === 'list'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'border border-gray-500/25 text-gray-400 hover:text-white'
                }`}
              >
                All Exams ({exams.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  resetBuilderForm();
                  setSubView('builder');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  subView === 'builder'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Prepare New Exam
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {statusBanner && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
          statusBanner.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <span>{statusBanner.text}</span>
          <button type="button" onClick={() => setStatusBanner(null)} className="text-xs font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Immediate Post-Submit / Auto-Disappear Confirmation */}
      {completedBanner && (
        <div className={`p-5 rounded-3xl border space-y-2 ${
          completedBanner.autoSubmitted
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-display font-black text-base flex items-center gap-2">
              <FileCheck2 className="w-5 h-5" />
              <span>
                {completedBanner.autoSubmitted
                  ? completedBanner.reason === 'tab_switch_violation'
                    ? `Exam "${completedBanner.examTitle}" Auto-Submitted (Tab Switch Lock Triggered)`
                    : `Time Expired — "${completedBanner.examTitle}" Submitted Automatically & Closed`
                  : `Exam "${completedBanner.examTitle}" Submitted Successfully`}
              </span>
            </h4>
            <button type="button" onClick={() => setCompletedBanner(null)} className="text-xs underline cursor-pointer">
              Close
            </button>
          </div>
          {completedBanner.showResults && completedBanner.submission && typeof completedBanner.submission.score === 'number' ? (
            <p className="text-xs font-bold">
              Score: {completedBanner.submission.score} / {completedBanner.submission.maxScore} ({completedBanner.submission.percentage}%) —{' '}
              {completedBanner.submission.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </p>
          ) : (
            <p className="text-xs opacity-90">Your responses are safely recorded. Results are managed by the course administrator.</p>
          )}
        </div>
      )}

      {/* ADMIN EXAM BUILDER & SECURITY CONTROLS */}
      {isAdmin && subView === 'builder' ? (
        <form
          onSubmit={handleSaveOfficialExam}
          className={`p-6 rounded-3xl border space-y-6 ${
            darkMode ? 'bg-elegant-card border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-500/20 pb-3">
            <h3 className="font-display text-base font-black">
              {editingExamId ? 'Edit Official Exam & Security Rules' : 'Prepare Official Timed & Locked Exam'}
            </h3>
            <button
              type="button"
              onClick={() => { resetBuilderForm(); setSubView('list'); }}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel & Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Exam Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g., Wide Area Networks (NITWN401) Final Assessment"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Course / Subject Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as CategoryName)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-gray-400 block">Instructions / Description (Visible to All Students)</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Instructions, covered units, and rules for examinees..."
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Countdown Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                max={360}
                value={formDurationMinutes}
                onChange={e => setFormDurationMinutes(Math.max(1, Number(e.target.value) || 1))}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Hard Closing Deadline (Optional Date/Time)</label>
              <input
                type="datetime-local"
                value={formAvailableUntil}
                onChange={e => setFormAvailableUntil(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Optional Unlock PIN / Access Code</label>
              <input
                type="text"
                value={formAccessCode}
                onChange={e => setFormAccessCode(e.target.value)}
                placeholder="Leave blank for open access or set PIN e.g. 4019"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 block">Passing Score (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formPassingScore}
                onChange={e => setFormPassingScore(Math.max(1, Math.min(100, Number(e.target.value) || 50)))}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Admin Security & Proctoring Switches */}
          <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
            darkMode ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className="font-display font-bold text-sm flex items-center gap-2 text-indigo-400">
              <Lock className="w-4 h-4" />
              <span>Admin Security, Tab-Switch Lock & Auto-Submit Rules (Configure As Needed)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formIsPublished} onChange={e => setFormIsPublished(e.target.checked)} className="accent-emerald-500" />
                <span><strong>Publish Exam</strong> (Visible to all accounts)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formIsLocked} onChange={e => setFormIsLocked(e.target.checked)} className="accent-rose-500" />
                <span><strong>Lock Exam Now</strong> (Prevent entry until unlocked)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formHideAfterSubmitOrExpiry} onChange={e => setFormHideAfterSubmitOrExpiry(e.target.checked)} className="accent-amber-500" />
                <span><strong>Auto-Submit & Disappear</strong> after timeout/submit</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formPreventTabSwitch} onChange={e => setFormPreventTabSwitch(e.target.checked)} className="accent-rose-500" />
                <span><strong>Prevent Tab Switching</strong> (Lock focus)</span>
              </label>

              {formPreventTabSwitch && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-rose-500/25 bg-rose-500/5">
                  <span className="font-semibold">Max Tab Leaves Before Auto-Submit:</span>
                  <select
                    value={formMaxTabSwitches}
                    onChange={e => setFormMaxTabSwitches(Number(e.target.value))}
                    className={`px-2 py-1 rounded-lg border font-mono ${
                      darkMode ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value={1}>1 (Instant Lock)</option>
                    <option value={2}>2 (1 Warning)</option>
                    <option value={3}>3 (2 Warnings)</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formPreventCopyPaste} onChange={e => setFormPreventCopyPaste(e.target.checked)} className="accent-amber-500" />
                <span><strong>Disable Copy, Cut, Paste & Selection</strong></span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formRequireFullscreen} onChange={e => setFormRequireFullscreen(e.target.checked)} className="accent-indigo-500" />
                <span><strong>Require Fullscreen Lock</strong></span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formShowResults} onChange={e => setFormShowResults(e.target.checked)} className="accent-emerald-500" />
                <span><strong>Show Score After Submit</strong></span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl border border-gray-500/15">
                <input type="checkbox" checked={formAllowRetake} onChange={e => setFormAllowRetake(e.target.checked)} className="accent-indigo-500" />
                <span><strong>Allow Multiple Retakes</strong></span>
              </label>
            </div>
          </div>

          {/* Optional AI Question Auto-Drafter from Course Notes */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
            darkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold">Optional AI Draft Helper:</span>
              <select
                value={formDocId}
                onChange={e => setFormDocId(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Any Notes in {formCategory}</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                value={aiDraftCount}
                onChange={e => setAiDraftCount(Number(e.target.value))}
                className={`px-2.5 py-1.5 rounded-xl border font-mono ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300'
                }`}
              >
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
            <button
              type="button"
              disabled={aiDraftLoading}
              onClick={handleAiDraftQuestions}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiDraftLoading ? 'Drafting...' : 'Auto-Draft Questions to Edit'}</span>
            </button>
          </div>

          {/* Questions Composer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm">Exam Questions ({formQuestions.length})</h4>
              <button
                type="button"
                onClick={() => setFormQuestions(prev => [...prev, createEmptyQuestion(prev.length + 1, formCategory)])}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {formQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border space-y-3 text-xs ${
                  darkMode ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400">QUESTION {qIdx + 1}</span>
                  {formQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormQuestions(prev => prev.filter((_, i) => i !== qIdx))}
                      className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={q.question}
                  onChange={e => {
                    const val = e.target.value;
                    setFormQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, question: val } : item));
                  }}
                  placeholder="Enter question prompt..."
                  className={`w-full px-3 py-2 rounded-xl border ${
                    darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_${q.id}`}
                        checked={q.answer === oIdx}
                        onChange={() => setFormQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, answer: oIdx } : item))}
                        title="Mark as correct option"
                        className="accent-emerald-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const val = e.target.value;
                          setFormQuestions(prev => prev.map((item, i) => {
                            if (i !== qIdx) return item;
                            const nextOpts = [...item.options];
                            nextOpts[oIdx] = val;
                            return { ...item, options: nextOpts };
                          }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className={`flex-1 px-3 py-1.5 rounded-xl border ${
                          q.answer === oIdx
                            ? 'border-emerald-500/60 bg-emerald-500/5'
                            : darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={savingExam}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-lg disabled:opacity-50"
            >
              {savingExam ? 'Saving Exam...' : editingExamId ? 'Save Changes & Sync Rules' : 'Save & Publish Official Exam'}
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading official exams...</div>
      ) : exams.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          darkMode ? 'bg-elegant-card border-white/10' : 'bg-white border-gray-200'
        }`}>
          <Lock className="w-8 h-8 text-gray-500 mx-auto" />
          <h3 className="font-display font-bold text-base">No Official Exams Published Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {isAdmin
              ? 'Click "Prepare New Exam" above to create a timed, locked exam visible to all website accounts.'
              : 'Your instructor has not published an official exam yet. You can still practice below with AI quizzes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {exams.map(exam => {
            const qCount = exam.questionCount || exam.questions?.length || 0;
            const lockedForStudent = !isAdmin && (exam.isLocked || exam.isDeadlinePassed || exam.expiredOrSubmittedHidden);

            return (
              <div
                key={exam.id}
                className={`p-5 rounded-3xl border space-y-4 flex flex-col justify-between ${
                  darkMode ? 'bg-elegant-card border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {exam.category}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {!exam.isPublished && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-500/20 text-gray-300">Draft Hidden</span>
                      )}
                      {exam.isLocked ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked by Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Open
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-base">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{exam.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> {exam.durationMinutes} min</span>
                    <span>•</span>
                    <span>{qCount} Questions</span>
                    {exam.preventTabSwitch && (
                      <>
                        <span>•</span>
                        <span className="text-rose-400">Tab Lock ({exam.maxTabSwitches || 1})</span>
                      </>
                    )}
                    {exam.preventCopyPaste && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">No Copy/Paste</span>
                      </>
                    )}
                    {exam.availableUntil && (
                      <>
                        <span>•</span>
                        <span>Closes {new Date(exam.availableUntil).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Management Controls */}
                {isAdmin ? (
                  <div className="pt-3 border-t border-gray-500/20 space-y-3">
                    {confirmDeleteId === exam.id && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
                        <span>Delete "{exam.title}" permanently?</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleDeleteExam(exam.id)} className="px-2.5 py-1 rounded bg-red-600 text-white font-bold cursor-pointer">Delete</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 rounded bg-white/10 cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleExamField(exam, 'isLocked')}
                        className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer flex items-center gap-1 ${
                          exam.isLocked
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/15 border-red-500/30 text-red-400'
                        }`}
                      >
                        {exam.isLocked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleExamField(exam, 'isPublished')}
                        className="px-3 py-1.5 rounded-xl font-bold border border-gray-500/25 hover:bg-white/5 cursor-pointer flex items-center gap-1"
                      >
                        {exam.isPublished ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditExam(exam)}
                        className="px-3 py-1.5 rounded-xl font-bold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/15 cursor-pointer flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSubmissions(exam)}
                        className="px-3 py-1.5 rounded-xl font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" /> Results ({exam.submissionCount || 0})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartExam(exam)}
                        className="px-3 py-1.5 rounded-xl font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15 cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" /> Test View
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(exam.id)}
                        className="ml-auto px-2.5 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Student / Website Account View */
                  <div className="pt-3 border-t border-gray-500/20 space-y-2.5">
                    {exam.hasSubmitted && exam.expiredOrSubmittedHidden ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          {exam.userSubmission?.autoSubmitted
                            ? 'Submitted Automatically & Closed'
                            : 'Submitted & Recorded'}
                        </span>
                        {exam.showResultsAfterSubmit && typeof exam.userSubmission?.percentage === 'number' && (
                          <span className="font-mono font-black">
                            {exam.userSubmission.score}/{exam.userSubmission.maxScore} ({exam.userSubmission.percentage}%)
                          </span>
                        )}
                      </div>
                    ) : exam.isDeadlinePassed && exam.expiredOrSubmittedHidden ? (
                      <div className="p-3 rounded-xl bg-gray-500/15 border border-gray-500/30 text-gray-400 text-xs font-bold">
                        Exam window has closed & disappeared.
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {exam.hasAccessCode && !exam.isLocked && (
                          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                            <input
                              type="password"
                              value={pinInputs[exam.id] || ''}
                              onChange={e => setPinInputs(prev => ({ ...prev, [exam.id]: e.target.value }))}
                              placeholder="Enter exam PIN..."
                              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                                darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-300'
                              }`}
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={Boolean(lockedForStudent) || startingExamId === exam.id}
                          onClick={() => handleStartExam(exam)}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            exam.isLocked
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                          }`}
                        >
                          {exam.isLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Locked by Administrator
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              {startingExamId === exam.id
                                ? 'Unlocking Exam...'
                                : exam.hasSubmitted && exam.allowRetake
                                ? 'Retake Exam'
                                : 'Start Timed Exam'}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN SUBMISSIONS & VIOLATION INSPECTOR MODAL */}
      {submissionsModalExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            darkMode ? 'bg-[#0f1722] border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="p-5 border-b border-gray-500/20 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base">
                  Student Submissions: {submissionsModalExam.title}
                </h3>
                <p className="text-xs text-gray-400">
                  Scores, auto-submit status, and tab-switch violation tracking
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionsModalExam(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {loadingSubmissions ? (
                <p className="text-xs text-gray-400 text-center py-8">Loading submissions...</p>
              ) : examSubmissions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No student has submitted this exam yet.</p>
              ) : (
                examSubmissions.map(sub => (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                      darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm">
                        {sub.username} {sub.userEmail ? <span className="text-gray-400 font-normal text-xs">({sub.userEmail})</span> : null}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 flex flex-wrap gap-2">
                        <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                        <span>• Tab Switches: <strong className={sub.tabSwitchCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>{sub.tabSwitchCount}</strong></span>
                        <span>• Mode: {sub.autoSubmitted ? `Auto (${sub.autoSubmitReason})` : 'Manual'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl font-mono font-black ${
                        sub.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {sub.score}/{sub.maxScore} ({sub.percentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleResetSubmission(submissionsModalExam.id, sub.id)}
                        className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/15 text-xs font-bold cursor-pointer"
                        title="Allow student to retake"
                      >
                        Reset Attempt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
