# NET LEARN – Interactive Technical Learning & Systems Engineering Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)

An enterprise-grade, W3Schools-styled curriculum and interactive learning portal built for Systems Engineering, Networking, Linux, Windows Server, and Cyber Security students.

Created and maintained by **Joshua Uwizeyimana** ([@uwizeyimanajoshua-tech](https://github.com/uwizeyimanajoshua-tech)).

---

## 🌟 Key Features

- **W3Schools-Styled Document Reader**: Interactive Table of Contents (TOC), nested chapters, sticky progress tracking, diagrams, code blocks with copy-to-clipboard, and reading bookmarks.
- **Admin Document Management**: Strict role-based upload zone allowing verified administrators to upload, partition, and enrich syllabus notes (PDF, DOCX, TXT) and technical diagrams. Non-admin users are restricted to read-only curriculum access.
- **Dual Persistence Architecture**: Dual-layer synchronization between real-time Google Cloud Firestore and local persistence fallback with automated upserting (`merge: true`).
- **Interactive Simulators & Labs**:
  - Interactive Linux Terminal Simulator with POSIX commands (`ls`, `cat`, `systemctl`, `chmod`, `grep`, etc.).
  - Python In-Browser Code Runner for networking scripts and automation.
  - Interactive Exam & Practice Quiz Simulator with detailed rationale and score analytics.
  - Technical Flashcards system for rapid certification revision.
- **AI Mentorship (NIT AI)**: Context-grounded technical tutor powered by Google Gemini API for deep technical explanations, code review, and troubleshooting.
- **Production SEO & Discovery**: Full Schema.org JSON-LD structured data, dynamic `/sitemap.xml`, OpenGraph cards, Twitter cards, and semantic HTML5 heading hierarchy.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+ installed
- npm or bun

### 2. Installation
```bash
git clone https://github.com/uwizeyimanajoshua-tech/net-learn.git
cd net-learn
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure you have configured your Google Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### 4. Running Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```
├── public/                 # Static assets, robots.txt, sitemap.xml
├── src/
│   ├── components/         # React UI Components
│   │   ├── DocumentViewer.tsx   # Interactive W3Schools-styled curriculum reader
│   │   ├── LinuxSimulator.tsx   # Interactive terminal shell
│   │   ├── PythonRunner.tsx     # In-browser Python workspace
│   │   ├── ExamSimulator.tsx    # Timed exams & question banks
│   │   ├── FlashcardsViewer.tsx # Interactive revision cards
│   │   ├── AdminAnalytics.tsx   # Institution administrator portal
│   │   └── AuthModal.tsx        # Multi-provider authentication
│   ├── db/
│   │   └── store.ts        # Database store with Firestore sync
│   ├── firebase.ts         # Firebase Client SDK & Auth handlers
│   └── App.tsx             # Root Application & Navigation
├── server.ts               # Express Backend + Vite Middleware + Gemini API Proxy
├── firestore.rules         # Enterprise security rules for Cloud Firestore
├── firebase-blueprint.json # Schema specification for collections & roles
└── package.json            # Node.js project manifest & scripts
```

---

## 🔒 Security & Admin Privileges

Curriculum modifications and syllabus uploads are restricted to accredited administrators:
- **Admin Accounts**: Authenticated users with role `admin` or designated instructor emails (`uwizeyimanajoshua@gmail.com`).
- **Students / Public Users**: Can freely read curriculum modules, use the Linux/Python simulators, take practice exams, and save personal bookmarks.

---

## 👨‍💻 Author

**Joshua Uwizeyimana**  
GitHub: [https://github.com/uwizeyimanajoshua-tech](https://github.com/uwizeyimanajoshua-tech)  
Email: [uwizeyimanajoshua@gmail.com](mailto:uwizeyimanajoshua@gmail.com)
