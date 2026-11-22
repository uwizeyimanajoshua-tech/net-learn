export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: 'student' | 'admin' | 'teacher' | 'instructor';
  isVerified: boolean;
  verificationCode?: string;
  resetToken?: string;
  resetExpires?: number | null;
  avatar?: string;
  authProvider?: 'local' | 'google';
  createdAt: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  learningOutcome?: string;
  images?: Array<{ url: string; caption?: string; alt?: string }>;
  pageNumber?: number;
  manualPage?: string;
  subsections?: any[];
}

export interface AISummary {
  title: string;
  overview: string;
  learningOutcomes: Array<{
    title: string;
    explanation: string;
    keyPoints: string[];
    importantDefinitions: Array<{ term: string; definition: string }>;
    examples: string[];
    examTips: string[];
    commonMistakes: string[];
    nationalExamQuestions: Array<{ question: string; answer: string }>;
    shortRevisionSummary: string;
  }>;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  textContent: string;
  uploadedAt: string;
  userId: string; // who uploaded
  bookmarks: string[]; // array of userIds
  splitContent: DocumentSection[];
  summary?: AISummary;
  fileData?: string; // base64 data URI (data:application/pdf;base64,... or image)
  fileUrl?: string; // /api/documents/:id/file
  hasDrawings?: boolean;
  originalMimeType?: string;
  images?: Array<{ url: string; caption?: string; alt?: string; page?: number }>;
  filePath?: string;
  pageCount?: number;
  diagrams?: any[];
  downloadUrl?: string | null;
  fileKey?: string | null;
  createdAt?: string;
  bookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isRag?: boolean; // indicates if RAG context was used
  sources?: string[]; // retrieved document section titles
  isError?: boolean; // indicates if the message is an error notification
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  category?: string;
  docId?: string; // if tied to a specific document
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // index of correct option
  explanation: string;
  hint?: string;
  topicTag?: string;
  difficulty?: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  docId?: string;
  difficulty?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface OfficialExam {
  id: string;
  title: string;
  description?: string;
  category: string;
  docId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  durationMinutes: number;
  availableUntil?: string | null;
  isPublished: boolean;
  isLocked: boolean;
  accessCode?: string;
  allowRetake: boolean;
  hideAfterSubmitOrExpiry: boolean;
  preventTabSwitch: boolean;
  maxTabSwitches: number;
  preventCopyPaste: boolean;
  requireFullscreen: boolean;
  passingScorePercent: number;
  showResultsAfterSubmit: boolean;
  questions: QuizQuestion[];
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  expiresAt: string;
  tabSwitchCount: number;
  status: 'active' | 'submitted' | 'expired';
  answersDraft?: Record<string, number>;
  updatedAt?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  category: string;
  userId: string;
  username: string;
  userEmail: string;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  autoSubmitted: boolean;
  autoSubmitReason?: 'manual' | 'time_expired' | 'tab_switch_violation' | 'deadline_passed';
  tabSwitchCount: number;
  timeTakenSeconds: number;
}

export interface Flashcard {
  id: string;
  userId: string;
  category: string;
  docId?: string;
  front: string;
  back: string;
  isMastered: boolean;
  createdAt: string;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  category: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface StudentProgress {
  userId: string;
  studiedModules: string[]; // document ids or topic titles
  weakTopics: string[];
  strongTopics: string[];
  quizScores: QuizResult[];
  aiUsageCount: number;
  lastActive: string;
}

export type CategoryName =
  | 'Networking'
  | 'Wide Area Network'
  | 'Linux'
  | 'Window Server'
  | 'Windows Server'
  | 'Cyber Security'
  | 'Fiber Optics'
  | 'Wireless Indoor'
  | 'Wireless Outdoor'
  | 'Wireless Networking'
  | 'IoT System Development'
  | 'IoT System Installation'
  | 'IoT'
  | 'VoIP'
  | 'Programming'
  | 'C Programming'
  | 'Database'
  | 'Databases'
  | 'Cloud Computing'
  | 'AI'
  | 'Artificial Intelligence'
  | 'Machine Learning'
  | 'Zero Client with NComputing'
  | 'Technical Drawing'
  | 'Mathematics'
  | 'Physics'
  | 'Electronics'
  | 'Electricity';

export const CATEGORIES: CategoryName[] = [
  'Networking',
  'Wide Area Network',
  'Linux',
  'Window Server',
  'Cyber Security',
  'Fiber Optics',
  'Wireless Indoor',
  'Wireless Outdoor',
  'IoT System Development',
  'IoT System Installation',
  'VoIP',
  'Programming',
  'C Programming',
  'Database',
  'Cloud Computing',
  'AI',
  'Machine Learning',
  'Zero Client with NComputing',
  'Technical Drawing',
  'Mathematics',
  'Physics',
  'Electronics',
  'Electricity'
];
