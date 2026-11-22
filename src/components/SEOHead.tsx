import { useEffect } from 'react';
import { CategoryName } from '../types';

interface SEOHeadProps {
  activeTab: string;
  categoryFilter?: CategoryName;
  activeDocTitle?: string;
}

const TAB_SEO_MAP: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'JoshNet Elearning (JoshNet) – Networking & Internet Technology (NIT) Rwanda',
    description: 'JoshNet Elearning, founded by Uwizeyimana Joshua in Rwanda, empowers NIT students in Windows Server, Linux Administration, CCNA Networking, and Cyber Security.'
  },
  documents: {
    title: 'Curriculum Library & Study Notes – JoshNet Elearning',
    description: 'Explore comprehensive NIT Rwanda course notes, architectural SVG diagrams, learning outcomes, and indicative content on JoshNet Elearning.'
  },
  linux_sim: {
    title: 'Linux Terminal & Shell Simulator – JoshNet Elearning',
    description: 'Practice real Bash terminal commands, file permissions (chmod/chown), systemd daemons, and package management in the JoshNet Elearning Linux sandbox.'
  },
  python_sim: {
    title: 'Python Code Sandbox & Lab – JoshNet Elearning',
    description: 'Write, run, and experiment with Python code in a real-time browser environment on JoshNet Elearning.'
  },
  exams: {
    title: 'Official Timed Exams & Practice Quizzes – JoshNet Elearning',
    description: 'Prepare for NIT Rwanda, CCNA, Linux+, and Windows Server certifications with timed assessments and instant explanations on JoshNet Elearning.'
  },
  flashcards: {
    title: 'Technical Study Flashcards & Key Terms – JoshNet Elearning',
    description: 'Review technical definitions, acronyms, ports, commands, and core NIT concepts with spaced repetition study flashcards on JoshNet Elearning.'
  },
  chats: {
    title: 'NIT AI Technical Study Assistant & Mentor – JoshNet Elearning',
    description: 'Ask questions, get syllabus explanations with verified grounded citations, and troubleshoot commands with the NIT AI tutor on JoshNet Elearning.'
  },
  analytics: {
    title: 'Student Progress & Lab Analytics – JoshNet Elearning',
    description: 'Track course module completion, quiz scores, strengths, and study milestones across all JoshNet Elearning topics.'
  }
};

export default function SEOHead({ activeTab, categoryFilter, activeDocTitle }: SEOHeadProps) {
  useEffect(() => {
    let title = TAB_SEO_MAP[activeTab]?.title || 'JoshNet Elearning (JoshNet) – Networking & Internet Technology (NIT) Rwanda';
    let description = TAB_SEO_MAP[activeTab]?.description || 'JoshNet Elearning is Rwanda\'s Networking and Internet Technology (NIT) platform founded by Uwizeyimana Joshua.';

    if (activeDocTitle) {
      title = `${activeDocTitle} – JoshNet Elearning Syllabus`;
      description = `Study ${activeDocTitle} on JoshNet Elearning (NIT Rwanda). Includes learning outcomes, indicative content, architectural diagrams, and self-assessment questions.`;
    } else if (categoryFilter) {
      title = `${categoryFilter} Notes & Curriculum – JoshNet Elearning`;
      description = `Browse all official NIT study materials, practical labs, and revision guides for ${categoryFilter} on JoshNet Elearning.`;
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
