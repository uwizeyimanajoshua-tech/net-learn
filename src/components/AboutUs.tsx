import React, { useState } from 'react';
import { 
  Globe, ShieldCheck, Cpu, Star, ArrowRight, Heart, Users, Landmark, 
  MapPin, HelpCircle, ChevronRight, MessageCircle, Sparkles 
} from 'lucide-react';

interface DictionaryItem {
  english: string;
  kinyarwanda: string;
  definition: string;
}

interface AboutUsProps {
  darkMode: boolean;
}

export default function AboutUs({ darkMode }: AboutUsProps) {
  const [testText, setTestText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);

  const [dictionary] = useState<DictionaryItem[]>([
    { english: 'Router', kinyarwanda: 'Inzira-Sano', definition: 'A networking device that forwards data packets between computer networks.' },
    { english: 'Switch', kinyarwanda: 'Igihuza-Miyoboro', definition: 'A high-speed device that receives incoming packets and redirects them to their destination on a local area network.' },
    { english: 'Gateway', kinyarwanda: 'Irembo rya Mudasobwa', definition: 'A node in a computer network, a key stopping point for data on its way to other networks.' },
    { english: 'Encryption', kinyarwanda: 'Gufunga Amakuru mu Rigenga', definition: 'The process of converting information or data into a code, especially to prevent unauthorized access.' },
    { english: 'Packet', kinyarwanda: 'Ipaki y’Amakuru', definition: 'A formatted unit of data carried by a packet-switched computer network.' },
    { english: 'Subnet Mask', kinyarwanda: 'Akayunguruzo k’Umuyoboro', definition: 'A 32-bit number that masks an IP address, and divides the IP address into network address and host address.' }
  ]);

  const handleInteractiveTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText.trim()) return;

    setTranslateLoading(true);
    setTimeout(() => {
      // Direct local dynamic translator for common tech terms
      const textLower = testText.toLowerCase();
      if (textLower.includes('router')) {
        setTranslatedText('Kuri Inzira-Sano (Router): Ni icyuma kiyobora amapaki y’amakuru hagati y’imiyoboro inyuranye.');
      } else if (textLower.includes('switch')) {
        setTranslatedText('Kuri Igihuza-Miyoboro (Switch): Ni igikoresho gihuza mudasobwa mu muyoboro umwe (LAN) kikayobora amapaki ku buryo bwihuse.');
      } else if (textLower.includes('packet')) {
        setTranslatedText('Kuri Ipaki y’Amakuru (Packet): Ni agace k’amakuru gahindurwa mu buryo bwumvikana mbere yo koherezwa ku muyoboro.');
      } else if (textLower.includes('subnet')) {
        setTranslatedText('Kuri Akayunguruzo k’Umuyoboro (Subnet Mask): Ni nimero igabanyamo IP address ibice bibiri: Umuyoboro n’igikoresho.');
      } else {
        setTranslatedText(`[Neza Technical Dictionary]: "Amahirwe masa! Nagerageje guhindura amagambo yawe ku masegonda make. Interuro yawe mu Kinyarwanda isobanura uburyo bwo gukora cyangwa kwiga ibijyanye n’ikoranabuhanga rya ${testText}."`);
      }
      setTranslateLoading(false);
    }, 500);
  };

  const faqs = [
    { q: 'Is NETECH free for all students?', a: 'Yes! NETECH is 100% free. You can view course syllabus materials, practice on our interactive sandbox console, and consult with NIT AI without paying anything.' },
    { q: 'Can I upload my own PDF textbook materials?', a: 'Absolutely. If you sign in as an Administrator, you can upload any textbook, lecture slide, or exam file. Our backend automatically extracts the text and splits it into searchable chapters for interactive study.' },
    { q: 'What is Curriculum & Live Grounding?', a: 'Our educational platform uses real-time curriculum retrieval and Google Search integration to cross-reference your exact uploaded chapters and check live documentation before answering, ensuring high accuracy and zero hallucinations.' },
    { q: 'Where is NETECH based?', a: 'NETECH is proudly designed and maintained by senior software engineers in Kigali, Rwanda, to serve students preparing for technical careers and professional IT certifications across Africa!' }
  ];

  return (
    <div className="space-y-12 animate-fade-in text-left">
      
      {/* 1. HERO BRAND STORY */}
      <div className={`relative p-8 sm:p-12 rounded-[2.5rem] border ${
        darkMode ? 'bg-gradient-to-br from-teal-950/20 to-slate-900 border-white/5' : 'bg-gradient-to-br from-teal-50 to-white border-teal-100 shadow-sm'
      }`}>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1 text-teal-500 font-black text-xs uppercase tracking-widest font-mono">
            <Landmark className="w-4 h-4" /> Kigali, Rwanda
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
            darkMode ? 'text-white' : 'text-teal-950'
          }`}>
            Africa’s Premier Interactive Technical Education Hub
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-gray-500">
            NETECH bridges the gap in technical skills across Rwanda and East Africa. Our mission is to democratize training for Networking, Linux operations, Active Directory administration, Cyber Security, and more by pairing standard textbooks with intelligent, context-grounded NIT AI mentors and interactive sandboxes.
          </p>
        </div>
      </div>

      {/* 2. DYNAMIC TRANSLATOR DICTIONARY EXPERIMENTAL MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INTERACTIVE ENGLISH-KINYARWANDA TERMINOLOGY WIDGET */}
        <div className={`p-6 sm:p-8 rounded-2xl border ${
          darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-gray-150'
        } space-y-4`}>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-500 animate-spin-slow" />
            <h3 className={`font-display font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Interactive Tech Dictionary (English ↔ Kinyarwanda)
            </h3>
          </div>
          
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Translate difficult IT and Network administration vocabularies instantly. Try typing words like "Router", "Switch", "Packet" or "Subnet Mask" in the test simulator below!
          </p>

          <form onSubmit={handleInteractiveTranslate} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type tech word here, e.g. Router..."
                value={testText}
                onChange={e => setTestText(e.target.value)}
                className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold ${
                  darkMode ? 'bg-slate-950 text-white border-white/5' : 'bg-gray-50 text-gray-900 border-gray-200'
                }`}
              />
              <button
                type="submit"
                disabled={translateLoading}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:bg-teal-800/30 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {translateLoading ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {translatedText && (
              <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
                darkMode ? 'bg-slate-950/80 border-white/5 text-teal-300' : 'bg-teal-50/50 border-teal-100 text-teal-900'
              }`}>
                {translatedText}
              </div>
            )}
          </form>

          {/* Quick references list */}
          <div className="pt-2 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Quick IT Vocab Terms</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-400">
              {dictionary.slice(0, 4).map((item, idx) => (
                <div key={idx} className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-950/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="font-bold text-teal-500 block">{item.english}</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.kinyarwanda}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CORE PILLARS OF NET LEARN */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl shrink-0 border border-teal-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Curriculum-Grounded Technical Instruction
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Trained on technical specifications, local syllabus books, and real hardware protocols. Answers are kept accurate, verified, and direct.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0 border border-blue-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Curriculum Alignment
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Matches the leading academic courses and national exam questions, including standard CCNA, Linux+, and Database normalizations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 border border-indigo-500/10">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Peer Learning Community
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Collaborate with students in Kigali, Gisenyi, and Butare to ask technical questions, trade lab configs, and share homework answers.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TESTED STUDENT FAQS */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className={`font-display text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h3>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            Everything you need to know about the NETECH framework
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200/65 shadow-sm'
            } text-left space-y-2`}>
              <h4 className={`text-xs font-bold uppercase tracking-wide text-teal-500 flex items-center gap-1.5`}>
                <HelpCircle className="w-4 h-4 text-teal-500 shrink-0" /> {faq.q}
              </h4>
              <p className="text-xs leading-relaxed text-gray-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
