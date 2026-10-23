import { Document } from '../types.js';

export const DEFAULT_CHAPTERS: Record<string, Array<{ id: string; name: string; content: string }>> = {};

export const SIDEBAR_CATEGORIES = [
  'Networking',
  'Linux',
  'Window Server',
  'Cyber Security',
  'Programming',
  'C Programming',
  'Database',
  'Cloud Computing',
  'AI',
  'Machine Learning',
  'Fiber Optics',
  'Wireless Indoor',
  'Wireless Outdoor',
  'IoT System Development',
  'IoT System Installation',
  'VoIP',
  'Zero Client with NComputing',
  'Technical Drawing',
  'Mathematics',
  'Physics',
  'Electronics',
  'Electricity'
];

export function translateChapterToDocument(
  category: string,
  chapterId: string,
  chapterName: string,
  chapterContent: string
): Document {
  return {
    id: chapterId,
    name: chapterName,
    type: 'text/plain',
    size: chapterContent.length,
    category: category as any,
    textContent: chapterContent,
    uploadedAt: new Date().toISOString(),
    userId: 'usr_student',
    bookmarks: [],
    splitContent: [
      {
        id: `${chapterId}_sec1`,
        title: 'Section Lecture Notes',
        content: chapterContent,
        learningOutcome: `Master the key concepts and parameters of ${chapterName} within ${category}.`
      },
      {
        id: `${chapterId}_sec2`,
        title: 'Core Concept Cheat Sheet',
        content: `Cheat sheet study notes for ${chapterName}:\n- Key mechanism: High-efficiency execution parameters and standardized specifications.\n- Critical values: Standard protocol port addresses, octal numbers, or geometric limits.\n- Common setups: Always review manufacturer reference specs and run diagnostic log loops to verify configuration.`,
        learningOutcome: 'Quick retention of mechanical and protocol specifications.'
      }
    ],
    summary: {
      title: chapterName,
      overview: `This educational unit covers the architecture, configurations, and core standards governing ${chapterName} in modern enterprise systems.`,
      learningOutcomes: [
        {
          title: `Syllabus Outcome: ${chapterName}`,
          explanation: `Explains the essential components and operation models of ${chapterName}.`,
          keyPoints: [
            'Understanding standard definitions and configurations.',
            'Best practice installation and testing criteria.',
            'Common debugging commands and error codes.'
          ],
          importantDefinitions: [
            { term: 'Standard Spec', definition: 'The formally agreed RFC or mechanical standard governing this topic.' }
          ],
          examples: [
            'Sample command blocks, projections, or network topologies.'
          ],
          examTips: [
            'Be prepared for multiple-choice questions targeting syntax boundaries or layers.'
          ],
          commonMistakes: [
            'Confusing protocols, neglecting boundary dimensions, or running incorrect switch commands.'
          ],
          nationalExamQuestions: [
            { question: `What is a primary system benefit of ${chapterName}?`, answer: `Standardization and security across enterprise deployments.` }
          ],
          shortRevisionSummary: `Review this module using our interactive AI Sandbox terminal on the Sandbox tab. Type configurations or python snippets to run simulated analysis.`
        }
      ]
    }
  };
}
