import { useEffect } from 'react';
import { CategoryName } from '../types';

interface SEOHeadProps {
  activeTab: string;
  categoryFilter?: CategoryName;
  activeDocTitle?: string;
}

const TAB_SEO_MAP: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'NETECH – Technical Learning, Networking & Systems Engineering',
    description: 'Master Windows Server, Linux Administration, CCNA Networking, and Cyber Security with W3Schools-styled curriculum and NIT AI mentorship.'
  },
  documents: {
    title: 'Curriculum Library & Study Notes – NETECH',
    description: 'Explore comprehensive course notes, architectural SVG diagrams, learning outcomes, and indicative content for Windows Server, Linux, Networking, and Cyber Security.'
  },
  linux_sim: {
    title: 'Linux Terminal & Shell Simulator – NETECH',
    description: 'Practice real Bash terminal commands, file permissions (chmod/chown), systemd daemons, and package management in a browser-based Linux sandbox.'
  },
  python_sim: {
    title: 'Python Code Sandbox & Lab – NETECH',
    description: 'Write, run, and experiment with Python code in a real-time browser environment with syntax feedback and practical exercises.'
  },
  exams: {
    title: 'Certification Practice Exams & Quizzes – NETECH',
    description: 'Prepare for CCNA, Linux+, and Windows Server certifications with mock tests, timed assessments, and instant step-by-step explanations.'
  },
  flashcards: {
    title: 'Technical Study Flashcards & Key Terms – NETECH',
    description: 'Review technical definitions, acronyms, ports, commands, and core concepts with spaced repetition study flashcards.'
  },
  chats: {
    title: 'NIT AI Technical Study Assistant & Mentor – NETECH',
    description: 'Ask questions, get syllabus explanations with verified grounded citations, and troubleshoot commands with the NIT AI technical tutor.'
  },
  analytics: {
    title: 'Student Progress & Lab Analytics – NETECH',
    description: 'Track course module completion, quiz scores, strengths, and study milestones across all syllabus topics.'
  }
};

export default function SEOHead({ activeTab, categoryFilter, activeDocTitle }: SEOHeadProps) {
  useEffect(() => {
    let title = TAB_SEO_MAP[activeTab]?.title || 'NETECH – Technical Learning Platform';
    let description = TAB_SEO_MAP[activeTab]?.description || 'A comprehensive technical education platform for Windows Server, Linux, CCNA Networking, and Cyber Security.';

    if (activeDocTitle) {
      title = `${activeDocTitle} – NETECH Syllabus`;
      description = `Study ${activeDocTitle}. Includes learning outcomes, indicative content, architectural diagrams, and self-assessment questions.`;
    } else if (categoryFilter) {
      title = `${categoryFilter} Notes & Curriculum – NETECH`;
      description = `Browse all official study materials, practical labs, and revision guides for ${categoryFilter}.`;
    }

    // Update document title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update OpenGraph title and description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Update Twitter title and description
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);
  }, [activeTab, categoryFilter, activeDocTitle]);

  return null;
}
