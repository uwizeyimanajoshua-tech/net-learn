import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    image: '/src/assets/images/slide_vr_classroom_1784235517208.jpg',
    title: 'Interactive VR Classrooms',
    description: 'Step into a three-dimensional cognitive space where network nodes and subnet divisions are visual components.',
    badge: 'Virtual Reality'
  },
  {
    image: '/src/assets/images/slide_knowledge_map_1784235530644.jpg',
    title: 'Syllabus Knowledge Maps',
    description: 'Trace complex courses, Linux configurations, and Cisco protocols mapped in a single semantic brain graph.',
    badge: 'Cognitive Mapping'
  },
  {
    image: '/src/assets/images/slide_ai_professor_1784235542693.jpg',
    title: 'Personalized AI Professors',
    description: 'Your virtual technical tutor available 24/7 to formulate mock quizzes, grade lab exercises, and explain topics in multiple languages.',
    badge: 'Gemini RAG Engine'
  }
];

export default function ImageCarousel({ darkMode }: { darkMode: boolean }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.4 } }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: { x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.4 } }
    })
  };

  return (
    <div className={`relative max-w-5xl mx-auto rounded-3xl overflow-hidden border shadow-2xl ${
      darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-100'
    }`} id="landing-carousel">
      {/* Aspect Container */}
      <div className="relative h-[300px] sm:h-[450px] w-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Slide Image */}
            <img
              src={SLIDES[current].image}
              alt={SLIDES[current].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Captions Layout */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mb-3"
              >
                <Sparkles className="w-3 h-3" /> {SLIDES[current].badge}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight leading-tight"
              >
                {SLIDES[current].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs sm:text-sm text-gray-300 max-w-2xl mt-2 leading-relaxed"
              >
                {SLIDES[current].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Manual Arrow Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/65 backdrop-blur-md border border-white/5 hover:bg-slate-800/80 active:scale-90 text-white transition-all z-20 cursor-pointer"
          id="btn-carousel-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/65 backdrop-blur-md border border-white/5 hover:bg-slate-800/80 active:scale-90 text-white transition-all z-20 cursor-pointer"
          id="btn-carousel-next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators / Navigation Dots */}
      <div className={`p-4 border-t flex items-center justify-between px-6 ${
        darkMode ? 'border-white/5 bg-slate-950/30' : 'border-gray-100 bg-gray-50/50'
      }`}>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">
          Slide {current + 1} of {SLIDES.length}
        </span>
        
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-gray-600/40 hover:bg-gray-500'
              }`}
              id={`btn-carousel-dot-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
