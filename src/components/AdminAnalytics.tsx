import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Database, Layers, Trash2, AlertCircle, X, RefreshCw, ClipboardList, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { User, Document, ExamSubmission } from '../types.js';

interface AdminAnalyticsProps {
  userId: string;
  userRole?: string;
  userEmail?: string;
  documents: Document[];
  onRefreshDocs: () => void;
  darkMode: boolean;
}

export default function AdminAnalytics({ userId, userRole, userEmail, documents, onRefreshDocs, darkMode }: AdminAnalyticsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Confirmation states
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadAdminStats();
  }, [userId, documents]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const loadAdminStats = async () => {
    setLoading(true);
    setError('');
    try {
      // Load users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.users) {
        setUsers(usersData.users);
      }

      // Load analytics
      const analyticRes = await fetch('/api/admin/analytics');
      const analyticData = await analyticRes.json();
      if (analyticRes.ok && analyticData.analytics) {
        setAnalytics(analyticData.analytics);
      }

      // Load all submitted exam & quiz answers
      const subRes = await fetch(
        `/api/admin/submissions?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail || '')}`,
        {
          headers: {
            'x-user-id': userId || '',
            'x-user-email': userEmail || '',
            'x-user-role': userRole || 'admin'
          }
        }
      );
      const subData = await subRes.json();
      if (subRes.ok && Array.isArray(subData.submissions)) {
        setSubmissions(subData.submissions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (subId: string) => {
    try {
      const res = await fetch(
        `/api/admin/submissions/${subId}?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail || '')}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': userId || '',
            'x-user-email': userEmail || '',
            'x-user-role': userRole || 'admin'
          }
        }
      );
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== subId));
        showSuccess('Submission record deleted.');
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
    }
  };

  const handleChangeRole = async (targetId: string, currentRole: 'student' | 'admin') => {
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${targetId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === targetId ? { ...u, role: nextRole } : u));
        loadAdminStats();
        showSuccess(`User role updated to ${nextRole}`);
      }
    } catch (err) {
      console.error('Error changing user role:', err);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === userId) {
      setError('Action prevented: You cannot delete your own administrative account.');
      setUserToDelete(null);
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        loadAdminStats();
        showSuccess(`User "${userToDelete.username || userToDelete.email}" deleted successfully.`);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user account:', err);
      setError('Error deleting user account.');
    } finally {
      setActionInProgress(false);
      setUserToDelete(null);
    }
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/documents/${docToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess(`Course note "${docToDelete.name}" deleted successfully.`);
        onRefreshDocs();
        loadAdminStats();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to delete note.');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Error deleting course note.');
    } finally {
      setActionInProgress(false);
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="font-display font-bold text-3xl tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-500" /> Admin Analytics Center
        </h2>
        <p className="text-sm text-gray-400 mt-1">Full control tower for managing accounts, documents, category weight distributions, and RAG stats.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm flex items-center gap-4`}>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Accounts</span>
            <h4 className="text-xl font-bold font-display mt-0.5">{analytics?.totalUsers || users.length}</h4>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm flex items-center gap-4`}>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Indexed Documents</span>
            <h4 className="text-xl font-bold font-display mt-0.5">{analytics?.totalDocuments || documents.length}</h4>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm flex items-center gap-4`}>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Chat sessions</span>
            <h4 className="text-xl font-bold font-display mt-0.5">{analytics?.totalChats || 0}</h4>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm flex items-center gap-4`}>
          <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Configured Quizzes</span>
            <h4 className="text-xl font-bold font-display mt-0.5">{analytics?.totalQuizzes || 0}</h4>
          </div>
        </div>
      </div>

      {/* Accounts Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Account Controls */}
        <div id="admin-account-management" className={`p-6 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm space-y-4`}>
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-indigo-400" /> Account Management
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/10 dark:border-gray-800/40 text-gray-500 font-mono text-[10px] uppercase">
                  <th className="py-2">User / Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/10 dark:divide-gray-800/30">
                {users.map(u => (
                  <tr key={u.id} className="text-gray-300">
                    <td className="py-3">
                      <p className="font-semibold text-gray-200">{u.username}</p>
                      <span className="text-[10px] text-gray-500">{u.email}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                          : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleChangeRole(u.id, u.role)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-gray-400 border border-white/5"
                        id={`btn-change-role-${u.id}`}
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-400 cursor-pointer"
                        id={`btn-delete-user-${u.id}`}
                        title="Delete user profile"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Indexed Syllabus Files controls */}
        <div id="admin-syllabus-control" className={`p-6 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm space-y-4`}>
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-emerald-400" /> Syllabus Library Control
          </h3>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {documents.length > 0 ? (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <p className="font-semibold text-gray-200 truncate">{doc.name}</p>
                    <span className="text-[10px] text-indigo-400 font-bold">{doc.category}</span>
                  </div>
                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer transition-colors"
                    id={`btn-admin-delete-doc-${doc.id}`}
                    title="Delete course note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs space-y-1">
                <p className="font-semibold">No course notes currently uploaded.</p>
                <p className="text-[11px] text-gray-500">Course notes will be uploaded by the Admin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Submitted Answers Center (All Official Exams & Practice Quizzes) */}
      <div
        id="admin-submitted-answers"
        className={`p-6 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'} shadow-sm space-y-4`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              <span>Student Submitted Answers Center ({submissions.length})</span>
            </h3>
            <p className="text-xs text-gray-400">
              All Official Timed Exam &amp; Practice Quiz answers submitted by students are stored and inspectable here.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={submissionSearch}
                onChange={e => setSubmissionSearch(e.target.value)}
                placeholder="Filter by student or exam..."
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs ${
                  darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={loadAdminStats}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Answers</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {(() => {
            const q = submissionSearch.trim().toLowerCase();
            const filtered = q
              ? submissions.filter(s =>
                  (s.username || '').toLowerCase().includes(q) ||
                  (s.userEmail || '').toLowerCase().includes(q) ||
                  (s.examTitle || '').toLowerCase().includes(q) ||
                  (s.category || '').toLowerCase().includes(q)
                )
              : submissions;

            if (filtered.length === 0) {
              return (
                <div className="p-6 text-center rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs">
                  No student answers recorded yet. Once any student completes an exam or quiz, every answer appears here.
                </div>
              );
            }

            return filtered.map(sub => {
              const isExpanded = expandedSubId === sub.id;
              const details = sub.answerDetails || [];
              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border space-y-3 text-xs ${
                    darkMode ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          sub.sourceType === 'practice_quiz'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {sub.sourceType === 'practice_quiz' ? 'Practice Quiz' : 'Official Exam'}
                        </span>
                        <span className="font-bold text-sm">{sub.examTitle}</span>
                        <span className="text-[11px] text-gray-400">({sub.category})</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 flex flex-wrap gap-2">
                        <span className={darkMode ? 'text-gray-200 font-semibold' : 'text-gray-800 font-semibold'}>
                          {sub.username} {sub.userEmail ? `(${sub.userEmail})` : ''}
                        </span>
                        <span>• {new Date(sub.submittedAt).toLocaleString()}</span>
                        <span>• Tab Violations: <strong className={sub.tabSwitchCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>{sub.tabSwitchCount}</strong></span>
                        <span>• Mode: {sub.autoSubmitted ? `Auto (${sub.autoSubmitReason})` : 'Manual'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl font-mono font-black ${
                        sub.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {sub.score}/{sub.maxScore} ({sub.percentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                        className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-bold cursor-pointer flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? 'Hide Answers' : `Inspect All Answers (${details.length || Object.keys(sub.answers || {}).length})`}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer"
                        title="Delete submission record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-500/20 space-y-2">
                      {details.length > 0 ? (
                        details.map((ans, idx) => (
                          <div
                            key={`${sub.id}_${ans.questionId}_${idx}`}
                            className={`p-3 rounded-xl border space-y-1 ${
                              ans.isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/25'
                                : 'bg-rose-500/5 border-rose-500/25'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-xs">Q{idx + 1}. {ans.question}</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                ans.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {ans.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                              <span>
                                Student Answer:{' '}
                                <strong className={ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                  {ans.selectedOptionIndex !== null ? `${String.fromCharCode(65 + ans.selectedOptionIndex)}. ` : ''}
                                  {ans.selectedOptionText}
                                </strong>
                              </span>
                              {!ans.isCorrect && (
                                <span>
                                  Correct Answer:{' '}
                                  <strong className="text-emerald-400">
                                    {String.fromCharCode(65 + ans.correctOptionIndex)}. {ans.correctOptionText}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400">
                          Raw Answers Map: <span className="font-mono">{JSON.stringify(sub.answers || {})}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Confirmation Modal for Document Deletion */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
            darkMode ? 'bg-[#0f171e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => !actionInProgress && setDocToDelete(null)}
              disabled={actionInProgress}
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
              Are you sure you want to delete this course note? This will permanently remove the syllabus module, associated quizzes, and study cards. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={actionInProgress}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDocument}
                disabled={actionInProgress}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                id="btn-admin-confirm-delete-doc"
              >
                {actionInProgress ? (
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
      )}

      {/* Confirmation Modal for User Deletion */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
            darkMode ? 'bg-[#0f171e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => !actionInProgress && setUserToDelete(null)}
              disabled={actionInProgress}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold">Delete User Profile</h3>
                <span className="text-[11px] text-slate-400">Confirmation Required</span>
              </div>
            </div>

            <p className={`text-xs mb-6 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete <span className="font-bold">{userToDelete.username || userToDelete.email}</span>? All linked progress, logs, and sessions will be destroyed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={actionInProgress}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={actionInProgress}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {actionInProgress ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Yes, Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
