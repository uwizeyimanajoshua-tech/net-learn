import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, Download, 
  ExternalLink, Layers, Eye, RefreshCw, Compass, Sliders, Check, 
  FileText, Image as ImageIcon, Box, Monitor, Split, FileCheck,
  Grid, Cpu, Activity, Network, Binary, Search, ChevronLeft, 
  ChevronRight, Volume2, VolumeX, Printer, BookOpen, Sparkles,
  Copy, List, AlignLeft, Bookmark, FileCode, CheckCheck, Lightbulb
} from 'lucide-react';
import { Document } from '../types.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface OriginalDocumentRendererProps {
  document: Document;
  darkMode?: boolean;
  layoutMode?: 'full' | 'split' | 'standard';
  onLayoutModeChange?: (mode: 'full' | 'split' | 'standard') => void;
  onCloseFullscreen?: () => void;
  splitSide?: 'left' | 'right';
  onToggleSplitSide?: () => void;
}

export default function OriginalDocumentRenderer({
  document: doc,
  darkMode = true,
  layoutMode = 'standard',
  onLayoutModeChange,
  onCloseFullscreen,
  splitSide = 'left',
  onToggleSplitSide
}: OriginalDocumentRendererProps) {
  // Reading & Zoom state
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [invertColors, setInvertColors] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isTrueFullscreen, setIsTrueFullscreen] = useState<boolean>(false);

  // Active view tab: 'document' (authentic pages/PDF) vs 'drawings' (vector objects/schematics)
  const [activeViewTab, setActiveViewTab] = useState<'document' | 'drawings'>('document');
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark' | 'sepia' | 'blueprint'>('paper');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [readingLayout, setReadingLayout] = useState<'paginated' | 'scroll'>('paginated');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(14);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfRenderError, setPdfRenderError] = useState<string | null>(null);
  const [pdfViewMode, setPdfViewMode] = useState<'single' | 'continuous'>('single');

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTrueFullscreen) {
        setIsTrueFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrueFullscreen]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const docTypeLower = (doc.type || '').toLowerCase();
  const docNameLower = (doc.name || '').toLowerCase();
  const mimeLower = (doc.originalMimeType || '').toLowerCase();

  // Support both inline base64 and streamable file endpoints for PDFs
  const hasRawPdfBinary = !!(doc.fileData && doc.fileData.startsWith('data:application/pdf'));
  const isPdf = hasRawPdfBinary || ((docTypeLower === 'pdf' || docNameLower.endsWith('.pdf') || mimeLower.includes('pdf')) && !!(doc.fileUrl || (doc as any).filePath));

  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp'].includes(docTypeLower) || 
    /\.(png|jpe?g|svg|webp|gif|bmp)$/i.test(docNameLower) || 
    mimeLower.startsWith('image/') || 
    !!(doc.fileData && doc.fileData.startsWith('data:image/'));

  const isTechnicalDrawing = doc.category === 'Technical Drawing' || 
    docNameLower.includes('drawing') || 
    docNameLower.includes('orthographic') ||
    docNameLower.includes('blueprint') ||
    docNameLower.includes('cad') ||
    doc.id.startsWith('td_');

  const isNetworkTopology = doc.category === 'Networking' || 
    docNameLower.includes('network') || 
    docNameLower.includes('vlan') ||
    docNameLower.includes('router') ||
    docNameLower.includes('switch') ||
    doc.id.startsWith('net_');

  const isFiberDrawing = doc.category === 'Fiber Optics' || 
    doc.id.startsWith('fib_') || 
    docNameLower.includes('fiber') ||
    docNameLower.includes('optics');

  const isLinuxArch = doc.category === 'Linux' || 
    docNameLower.includes('linux') || 
    doc.id.startsWith('lin_');

  const isMachineLearning = doc.category === 'Machine Learning' || 
    doc.category === 'Artificial Intelligence' || 
    docNameLower.includes('machine learning') || 
    docNameLower.includes('neural') || 
    doc.id.startsWith('ml_');

  const hasVectorDrawings = isTechnicalDrawing || isNetworkTopology || isFiberDrawing || isLinuxArch || isMachineLearning || doc.hasDrawings;

  const fileUrl = doc.fileUrl || doc.fileData || `/api/documents/${doc.id}/file`;

  // 1. PDF.js Document Loader
  useEffect(() => {
    if (!isPdf) return;

    let isMounted = true;
    setPdfLoading(true);
    setPdfRenderError(null);

    const loadPdf = async () => {
      try {
        let loadingTask;
        if (doc.fileData && doc.fileData.startsWith('data:application/pdf;base64,')) {
          const base64Data = doc.fileData.replace(/^data:application\/pdf;base64,/, '');
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else if (fileUrl) {
          loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        } else {
          throw new Error('No PDF data available.');
        }

        const loadedPdf = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(loadedPdf);
          setPdfNumPages(loadedPdf.numPages);
          setPdfCurrentPage(1);
          setPdfLoading(false);
        }
      } catch (err: any) {
        console.warn('PDF.js loading failed, falling back to structured paper document view:', err);
        if (isMounted) {
          setPdfRenderError(err.message || 'Unable to render PDF binary canvas.');
          setPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [doc.id, doc.fileData, fileUrl, isPdf]);

  // 2. Render Current PDF Page onto Canvas
  const renderPdfPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !pdfCanvasRef.current) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const scale = (zoom / 100) * 1.5; // High-DPI render
      const viewport = page.getViewport({ scale, rotation });

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = `${viewport.width / 1.5}px`;
      canvas.style.height = `${viewport.height / 1.5}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering PDF page:', err);
      }
    }
  }, [pdfDoc, zoom, rotation]);

  useEffect(() => {
    if (pdfDoc && isPdf && activeViewTab === 'document') {
      renderPdfPage(pdfCurrentPage);
    }
  }, [pdfDoc, pdfCurrentPage, zoom, rotation, isPdf, activeViewTab, renderPdfPage]);

  // Page navigation
  const handlePrevPage = () => {
    if (pdfCurrentPage > 1) setPdfCurrentPage(prev => prev - 1);
  };
  const handleNextPage = () => {
    if (pdfCurrentPage < pdfNumPages) setPdfCurrentPage(prev => prev + 1);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 50));
  const handleResetZoom = () => { setZoom(100); setRotation(0); };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Text to Speech
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = doc.textContent || doc.name;
    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 3000));
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Print document
  const handlePrint = () => {
    window.print();
  };

  // Helper to copy code block to clipboard
  const handleCopyCode = (code: string, blockId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedBlockId(blockId);
      setTimeout(() => setCopiedBlockId(null), 2000);
    }
  };

  // Structured Block Interface for academic formatting
  interface DocBlock {
    id: string;
    type: 'header' | 'subheader' | 'outcome' | 'keyterms' | 'code' | 'bullet' | 'paragraph' | 'image';
    text: string;
    items?: string[];
    imgUrl?: string;
    caption?: string;
  }

  interface FormattedSheet {
    sheetIndex: number;
    title: string;
    blocks: DocBlock[];
  }

  // Parse Document into high-fidelity structured sheets
  const formattedSheets: FormattedSheet[] = useMemo(() => {
    // 1. If document has structured splitContent from upload or default curriculum, leverage it!
    if (doc.splitContent && Array.isArray(doc.splitContent) && doc.splitContent.length > 0) {
      return doc.splitContent.map((sec, idx) => {
        const blocks: DocBlock[] = [];
        
        // Add Chapter Header
        blocks.push({
          id: `blk_hdr_${sec.id}`,
          type: 'header',
          text: sec.title || `Chapter ${idx + 1}`
        });

        // Add Learning Outcome badge if present
        if (sec.learningOutcome) {
          blocks.push({
            id: `blk_out_${sec.id}`,
            type: 'outcome',
            text: sec.learningOutcome
          });
        }

        // Parse content paragraphs, key terms, and code snippets
        const contentLines = (sec.content || '').split('\n');
        let currentPara: string[] = [];
        let inCode = false;
        let codeLines: string[] = [];

        contentLines.forEach((line, lIdx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('```')) {
            if (inCode) {
              blocks.push({
                id: `blk_code_${sec.id}_${lIdx}`,
                type: 'code',
                text: codeLines.join('\n')
              });
              codeLines = [];
              inCode = false;
            } else {
              inCode = true;
            }
            return;
          }

          if (inCode) {
            codeLines.push(line);
            return;
          }

          // Check for Markdown Image ![caption](url)
          if (trimmed.startsWith('![') && trimmed.includes('](')) {
            const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
              if (currentPara.length) {
                blocks.push({ id: `blk_p_${sec.id}_${lIdx}_pre`, type: 'paragraph', text: currentPara.join('\n') });
                currentPara = [];
              }
              blocks.push({
                id: `blk_img_${sec.id}_${lIdx}`,
                type: 'image',
                text: trimmed,
                imgUrl: imgMatch[2],
                caption: imgMatch[1]
              });
              return;
            }
          }

          if (trimmed.startsWith('$ ') || trimmed.startsWith('#!/bin') || trimmed.startsWith('Router#') || trimmed.startsWith('Switch#')) {
            if (currentPara.length) {
              blocks.push({ id: `blk_p_${sec.id}_${lIdx}_pre`, type: 'paragraph', text: currentPara.join('\n') });
              currentPara = [];
            }
            blocks.push({
              id: `blk_cmd_${sec.id}_${lIdx}`,
              type: 'code',
              text: line
            });
            return;
          }

          if (trimmed.toLowerCase().startsWith('key terms:') || trimmed.toLowerCase().startsWith('key concepts:')) {
            if (currentPara.length) {
              blocks.push({ id: `blk_p_${sec.id}_${lIdx}_pre`, type: 'paragraph', text: currentPara.join('\n') });
              currentPara = [];
            }
            const termsStr = trimmed.replace(/^key (terms|concepts):\s*/i, '');
            const terms = termsStr.split(/[,;•|]/).map(t => t.trim()).filter(Boolean);
            blocks.push({
              id: `blk_terms_${sec.id}_${lIdx}`,
              type: 'keyterms',
              text: 'Key Terms & Glossary',
              items: terms
            });
            return;
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
            if (currentPara.length) {
              blocks.push({ id: `blk_p_${sec.id}_${lIdx}_pre`, type: 'paragraph', text: currentPara.join('\n') });
              currentPara = [];
            }
            blocks.push({
              id: `blk_li_${sec.id}_${lIdx}`,
              type: 'bullet',
              text: trimmed.replace(/^[-*]\s+|\d+\.\s+/, '')
            });
            return;
          }

          if (!trimmed) {
            if (currentPara.length) {
              blocks.push({ id: `blk_p_${sec.id}_${lIdx}`, type: 'paragraph', text: currentPara.join('\n') });
              currentPara = [];
            }
          } else {
            currentPara.push(line);
          }
        });

        if (currentPara.length) {
          blocks.push({ id: `blk_p_${sec.id}_end`, type: 'paragraph', text: currentPara.join('\n') });
        }

        // Append section attached images if present
        if ((sec as any).images && Array.isArray((sec as any).images)) {
          (sec as any).images.forEach((img: any, iIdx: number) => {
            if (img && img.url) {
              blocks.push({
                id: `blk_sec_img_${sec.id}_${iIdx}`,
                type: 'image',
                text: img.caption || 'Section Figure',
                imgUrl: img.url,
                caption: img.caption || img.alt
              });
            }
          });
        }

        return {
          sheetIndex: idx,
          title: sec.title || `Chapter ${idx + 1}`,
          blocks
        };
      });
    }

    // 2. Parse raw textContent by chapters or markdown headers
    const rawText = doc.textContent || doc.name;
    const lines = rawText.split('\n');
    const sheets: FormattedSheet[] = [];
    let currentSheetBlocks: DocBlock[] = [];
    let currentTitle = 'Chapter 1: Curriculum Introduction';
    let sheetCounter = 0;
    let currentPara: string[] = [];

    const flushPara = (id: string) => {
      if (currentPara.length) {
        currentSheetBlocks.push({ id, type: 'paragraph', text: currentPara.join('\n') });
        currentPara = [];
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      const isChapterHeader = /^(chapter\s+\d+|section\s+\d+|module\s+\d+):/i.test(trimmed) || 
        trimmed.startsWith('# ') || 
        (trimmed.startsWith('## ') && currentSheetBlocks.length > 4);

      if (isChapterHeader) {
        flushPara(`blk_p_${lineIdx}`);
        if (currentSheetBlocks.length > 0) {
          sheets.push({
            sheetIndex: sheetCounter++,
            title: currentTitle,
            blocks: currentSheetBlocks
          });
          currentSheetBlocks = [];
        }
        currentTitle = trimmed.replace(/^#+\s+/, '');
        currentSheetBlocks.push({
          id: `blk_hdr_${lineIdx}`,
          type: 'header',
          text: currentTitle
        });
        return;
      }

      if (trimmed.toLowerCase().startsWith('learning outcome') || trimmed.toLowerCase().startsWith('objective:')) {
        flushPara(`blk_p_${lineIdx}`);
        currentSheetBlocks.push({
          id: `blk_out_${lineIdx}`,
          type: 'outcome',
          text: trimmed
        });
        return;
      }

      if (trimmed.toLowerCase().startsWith('key terms:') || trimmed.toLowerCase().startsWith('key concepts:')) {
        flushPara(`blk_p_${lineIdx}`);
        const termsStr = trimmed.replace(/^key (terms|concepts):\s*/i, '');
        const terms = termsStr.split(/[,;•|]/).map(t => t.trim()).filter(Boolean);
        currentSheetBlocks.push({
          id: `blk_terms_${lineIdx}`,
          type: 'keyterms',
          text: 'Key Terms & Glossary',
          items: terms
        });
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
        flushPara(`blk_p_${lineIdx}`);
        currentSheetBlocks.push({
          id: `blk_li_${lineIdx}`,
          type: 'bullet',
          text: trimmed.replace(/^[-*]\s+|\d+\.\s+/, '')
        });
        return;
      }

      if (trimmed.startsWith('```') || trimmed.startsWith('$ ') || trimmed.startsWith('#!/bin')) {
        flushPara(`blk_p_${lineIdx}`);
        currentSheetBlocks.push({
          id: `blk_code_${lineIdx}`,
          type: 'code',
          text: trimmed.replace(/```[a-z]*/g, '')
        });
        return;
      }

      if (!trimmed) {
        flushPara(`blk_p_${lineIdx}`);
      } else {
        currentPara.push(line);
      }
    });

    flushPara('blk_p_final');
    if (currentSheetBlocks.length > 0 || sheets.length === 0) {
      sheets.push({
        sheetIndex: sheetCounter++,
        title: currentTitle,
        blocks: currentSheetBlocks.length > 0 ? currentSheetBlocks : [
          { id: 'blk_def', type: 'paragraph', text: doc.textContent || 'No text extracted.' }
        ]
      });
    }

    return sheets;
  }, [doc]);

  const totalTextPages = Math.max(formattedSheets.length, 1);
  const [textPageIndex, setTextPageIndex] = useState<number>(0);

  // Search highlighting helper
  const renderHighlightedText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded font-bold">{part}</mark>
      ) : part
    );
  };

  // Match counter for search
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    let matches = 0;
    formattedSheets.forEach(sheet => {
      sheet.blocks.forEach(blk => {
        const t = blk.text.toLowerCase();
        let pos = 0;
        while ((pos = t.indexOf(q, pos)) !== -1) {
          matches++;
          pos += q.length;
        }
      });
    });
    return matches;
  }, [searchQuery, formattedSheets]);

  // Paper theme styles
  const paperThemeClasses = {
    paper: 'bg-white text-gray-900 border-gray-300 shadow-2xl',
    dark: 'bg-[#0f1722] text-gray-100 border-white/10 shadow-2xl',
    sepia: 'bg-[#fcf5e5] text-[#3d2f1f] border-[#e8d7be] shadow-xl',
    blueprint: 'bg-[#091726] text-cyan-200 border-cyan-500/30 shadow-2xl'
  };

  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  return (
    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${
      isTrueFullscreen 
        ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-0 bg-[#070e17]'
        : layoutMode === 'full' 
          ? 'w-full min-h-[820px] h-[calc(100vh-120px)] rounded-3xl border shadow-2xl' 
          : 'w-full min-h-[640px] h-full rounded-3xl border shadow-xl'
    } ${
      darkMode ? 'bg-[#0b131e] border-white/10 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-900'
    }`}>
      
      {/* 1. TOP HEADER & PRIMARY READING TOOLBAR */}
      <div className="px-4 py-3 bg-[#111c28] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        
        {/* Left: Document Identity, Format Badge & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
            isPdf 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : isImage 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : isTechnicalDrawing 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isPdf ? 'PDF Book' : isImage ? 'Graphic Asset' : isTechnicalDrawing ? 'CAD Specification' : 'Original Text'}
          </span>
          
          <span className="font-bold text-gray-100 truncate max-w-[200px] sm:max-w-xs" title={doc.name}>
            {doc.name}
          </span>

          {/* Primary View Switcher: Document Pages vs Drawings & Objects */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-[11px] font-mono ml-1">
            <button
              onClick={() => setActiveViewTab('document')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'document'
                  ? 'bg-brand-primary text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Pages</span>
            </button>

            {hasVectorDrawings && (
              <button
                onClick={() => setActiveViewTab('drawings')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === 'drawings'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-cyan-400 hover:text-cyan-200'
                }`}
                title="Inspect technical drawings, orthographic projections, schematics, and vector objects"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Drawings & Objects</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Layout Modes (Full on Screen vs Side-by-Side vs Standard) */}
        {onLayoutModeChange && (
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-mono">
            <button
              onClick={() => {
                if (isTrueFullscreen) setIsTrueFullscreen(false);
                onLayoutModeChange('split');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'split' && !isTrueFullscreen
                  ? 'bg-brand-primary text-white font-bold shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="View original document side-by-side with textbook study notes"
            >
              <Split className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => {
                if (isTrueFullscreen) setIsTrueFullscreen(false);
                onLayoutModeChange('full');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'full' && !isTrueFullscreen
                  ? 'bg-blue-600 text-white font-bold shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Expand original document full width on page"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full on Screen</span>
            </button>

            <button
              onClick={() => {
                if (isTrueFullscreen) setIsTrueFullscreen(false);
                onLayoutModeChange('standard');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'standard' && !isTrueFullscreen
                  ? 'bg-[#04aa6d] text-white font-bold shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Standard embedded container view"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>

            {onToggleSplitSide && layoutMode === 'split' && (
              <button
                onClick={onToggleSplitSide}
                className="px-2.5 py-1.5 text-cyan-400 hover:text-cyan-200 transition-all cursor-pointer border-l border-white/10 flex items-center gap-1"
                title={`Swap Sides (Currently on ${splitSide === 'left' ? 'Left' : 'Right'})`}
              >
                <span>↔ Swap</span>
              </button>
            )}
          </div>
        )}

        {/* Right: Reading Controls (Zoom, Rotate, Audio, Fullscreen, Download) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Zoom controls */}
          <div className="flex items-center bg-black/40 px-2 py-1 rounded-xl border border-white/10 gap-1 text-[11px] font-mono">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-400 hover:text-white cursor-pointer"
              title="Zoom Out (-20%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-11 text-center text-gray-200 font-semibold">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-400 hover:text-white cursor-pointer"
              title="Zoom In (+20%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 rounded text-[9px] text-gray-400 hover:text-white bg-white/5 cursor-pointer ml-1"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
          </div>

          {/* Rotate 90 deg */}
          <button
            onClick={handleRotate}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-gray-400 hover:text-white cursor-pointer transition-all"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Search in Document */}
          <button
            onClick={() => setShowSearch(prev => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showSearch 
                ? 'bg-brand-primary text-white border-brand-primary' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Search keyword in document"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Text-to-Speech audio reader */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSpeaking 
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={isSpeaking ? "Pause Audio Reading" : "Read Document Aloud (Text-to-Speech)"}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize to True Window Fullscreen */}
          <button
            onClick={() => setIsTrueFullscreen(prev => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isTrueFullscreen 
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={isTrueFullscreen ? "Exit Window Fullscreen (ESC)" : "Maximize Document to Full Window"}
          >
            {isTrueFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={doc.name}
              className="p-2 rounded-xl bg-black/40 border border-white/10 text-gray-400 hover:text-white cursor-pointer flex items-center gap-1"
              title="Download Original File"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 2. SUB-TOOLBAR: SEARCH & READING PREFERENCES */}
      {showSearch && (
        <div className="px-4 py-2 bg-[#0e1722] border-b border-white/10 flex items-center gap-3 text-xs animate-fade-in">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type text to search and highlight in document..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-primary"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* 3. SECONDARY CONTROL BAR: TOC, PAGE NAVIGATION, LAYOUT & PAPER THEMES */}
      <div className="px-4 py-2 bg-[#0d1620] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
        
        {/* Left: Outline TOC button & Page Navigation */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] flex-wrap">
          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => setShowToc(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              showToc 
                ? 'bg-brand-primary text-white border-brand-primary font-bold shadow' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Toggle Table of Contents / Chapter Outline"
          >
            <List className="w-3.5 h-3.5" />
            <span>Contents ({formattedSheets.length})</span>
          </button>

          {/* Reading Mode Switcher: Paginated Sheets vs Continuous Scroll */}
          <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px]">
            <button
              onClick={() => setReadingLayout('paginated')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                readingLayout === 'paginated' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Paginated Sheets Mode"
            >
              Sheets
            </button>
            <button
              onClick={() => setReadingLayout('scroll')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                readingLayout === 'scroll' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Continuous Scroll Mode"
            >
              Continuous
            </button>
          </div>

          {/* Sheet Navigator (if paginated) */}
          {readingLayout === 'paginated' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTextPageIndex(prev => Math.max(0, prev - 1))}
                disabled={textPageIndex === 0}
                className="p-1 rounded bg-white/5 border border-white/10 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Previous Sheet"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold">
                Sheet <strong className="text-brand-primary">{textPageIndex + 1}</strong> of {totalTextPages}
              </span>
              <button
                onClick={() => setTextPageIndex(prev => Math.min(totalTextPages - 1, prev + 1))}
                disabled={textPageIndex >= totalTextPages - 1}
                className="p-1 rounded bg-white/5 border border-white/10 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Next Sheet"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search matches counter */}
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold">
              {searchMatchCount} match{searchMatchCount === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {/* Right: Typography (Font family, size) & Paper Themes */}
        <div className="flex items-center gap-2.5 text-[11px] flex-wrap">
          {/* Font Family Selector */}
          <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                fontFamily === 'sans' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Sans-serif (Modern Clean)"
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                fontFamily === 'serif' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Serif (Academic Textbook)"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('mono')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                fontFamily === 'mono' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Monospace (Code / Spec)"
            >
              Mono
            </button>
          </div>

          {/* Paper Theme Selector */}
          <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/10 font-mono text-[10px]">
            <button
              onClick={() => setPaperTheme('paper')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'paper' ? 'bg-white text-gray-900 font-bold shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Clean White Paper format"
            >
              Paper
            </button>
            <button
              onClick={() => setPaperTheme('dark')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'dark' ? 'bg-slate-800 text-white font-bold shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Obsidian Dark format"
            >
              Dark
            </button>
            <button
              onClick={() => setPaperTheme('sepia')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'sepia' ? 'bg-[#f4eccf] text-[#3d2f1f] font-bold shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Warm Sepia Book format"
            >
              Sepia
            </button>
            <button
              onClick={() => setPaperTheme('blueprint')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'blueprint' ? 'bg-cyan-900 text-cyan-200 font-bold shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="CAD Blueprint format"
            >
              Blueprint
            </button>
          </div>

          {/* Font size adjustments */}
          <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10 font-mono">
            <button
              onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
              className="px-2 py-1 text-gray-400 hover:text-white cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1.5 text-gray-300 font-semibold">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              className="px-2 py-1 text-gray-400 hover:text-white cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Blueprint grid toggle */}
          <button
            onClick={() => setShowGrid(prev => !prev)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              showGrid 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Toggle Precision Grid Overlay"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. MAIN DOCUMENT RENDERING CANVAS AREA */}
      <div 
        ref={containerRef}
        className="flex-1 bg-black/95 relative overflow-auto p-4 sm:p-8 flex items-start justify-center min-h-[480px] scrollbar-thin"
      >
        {/* CAD Blueprint Grid Overlay if enabled */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 z-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        )}

        {/* TAB 1: AUTHENTIC DOCUMENT PAGES & TEXT READING */}
        {activeViewTab === 'document' && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in">
            
            {/* SUB-CASE A: PDF RENDERED VIA PDF.JS CANVAS */}
            {isPdf && !pdfRenderError ? (
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="flex flex-col items-center justify-center relative shadow-2xl rounded-2xl overflow-hidden bg-white p-2"
              >
                {pdfLoading && (
                  <div className="py-24 px-16 text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs text-gray-600 font-mono">Rendering PDF pages with vector clarity...</p>
                  </div>
                )}
                <canvas 
                  ref={pdfCanvasRef} 
                  className={`max-w-full rounded-xl shadow-xl transition-opacity duration-200 ${pdfLoading ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
            ) : isImage && (doc.fileData || fileUrl) ? (
              /* SUB-CASE B: GRAPHIC / IMAGE / BLUEPRINT (PNG, JPG, SVG, WEBP) */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                  filter: invertColors ? 'invert(1) hue-rotate(180deg)' : 'none'
                }}
                className="max-w-none flex items-center justify-center p-2 relative"
              >
                <img 
                  src={doc.fileData || fileUrl} 
                  alt={doc.name} 
                  className="max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            ) : (
              /* SUB-CASE C: AUTHENTIC ACADEMIC BOOK & DOCUMENT ENGINE (Text, Markdown, DOCX & Syllabus Modules) */
              <div className="w-full flex flex-col items-center justify-center relative">
                
                {/* Table of Contents Floating Drawer / Sidebar Popover */}
                {showToc && (
                  <div className="w-full max-w-4xl mb-6 p-5 rounded-2xl bg-[#0f1824] border border-brand-primary/30 shadow-2xl text-left animate-fade-in font-sans">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand-primary" />
                        <span className="font-bold text-gray-100 uppercase tracking-wider">
                          Course Document Outline & Chapters
                        </span>
                      </div>
                      <button
                        onClick={() => setShowToc(false)}
                        className="text-gray-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/5 cursor-pointer"
                      >
                        Close Outline &times;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {formattedSheets.map((sheet, sIdx) => {
                        const isCurrent = sIdx === textPageIndex;
                        return (
                          <button
                            key={sheet.sheetIndex}
                            onClick={() => {
                              setTextPageIndex(sIdx);
                              setShowToc(false);
                            }}
                            className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isCurrent
                                ? 'bg-brand-primary/20 border-brand-primary text-white font-bold ring-1 ring-brand-primary'
                                : 'bg-black/30 border-white/5 text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="truncate flex-1">
                              <span className="text-[10px] text-gray-500 font-mono block">Sheet {sIdx + 1}</span>
                              <span className="truncate">{sheet.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sheets Container: Supports Paginated Single Sheet or Continuous Scroll */}
                <div className={`w-full max-w-4xl space-y-8 ${readingLayout === 'scroll' ? 'pb-16' : ''}`}>
                  {(readingLayout === 'paginated' 
                    ? [formattedSheets[textPageIndex] || formattedSheets[0]] 
                    : formattedSheets
                  ).filter(Boolean).map((sheet, sheetDisplayIdx) => {
                    const actualSheetNum = readingLayout === 'paginated' ? textPageIndex + 1 : sheetDisplayIdx + 1;

                    return (
                      <div 
                        key={sheet.sheetIndex || sheetDisplayIdx}
                        style={{ 
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.15s ease-out'
                        }}
                        className={`w-full p-8 sm:p-12 rounded-3xl border transition-all duration-200 text-left relative ${
                          paperThemeClasses[paperTheme]
                        } ${fontFamilyClasses[fontFamily]}`}
                      >
                        {/* Paper Top Strip: Academic Certification Header */}
                        <div className="pb-6 mb-8 border-b border-current/15 flex flex-wrap items-center justify-between gap-3 text-xs opacity-80 font-mono">
                          <div>
                            <span className="font-extrabold uppercase tracking-wider block text-sm">
                              {doc.name}
                            </span>
                            <span className="text-[10px] opacity-75">
                              Syllabus: {doc.category} • Certified Course Curriculum Sheet
                            </span>
                          </div>
                          <div className="text-right text-[11px]">
                            <span className="font-bold">Sheet {actualSheetNum} of {totalTextPages}</span>
                            <span className="block text-[10px] opacity-70">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Document Sheet Body Blocks */}
                        <div 
                          style={{ fontSize: `${fontSize}px` }} 
                          className="space-y-6 leading-relaxed"
                        >
                          {sheet.blocks.map((blk) => {
                            // 1. Chapter / Section Header
                            if (blk.type === 'header') {
                              return (
                                <div key={blk.id} className="pt-2 pb-3 border-b border-current/15">
                                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-brand-primary font-bold mb-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Certified Curriculum Chapter</span>
                                  </div>
                                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                    {renderHighlightedText(blk.text)}
                                  </h2>
                                </div>
                              );
                            }

                            // 2. Learning Outcome Callout Box
                            if (blk.type === 'outcome') {
                              return (
                                <div 
                                  key={blk.id} 
                                  className="p-4 sm:p-5 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 font-mono">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Target Learning Outcome</span>
                                  </div>
                                  <p className="font-semibold text-xs sm:text-sm leading-relaxed">
                                    {renderHighlightedText(blk.text)}
                                  </p>
                                </div>
                              );
                            }

                            // 3. Key Terms & Definitions Glossary Tag Cloud
                            if (blk.type === 'keyterms') {
                              return (
                                <div 
                                  key={blk.id}
                                  className="p-4 rounded-2xl border border-current/15 bg-black/5 dark:bg-white/5 space-y-2"
                                >
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-75 block">
                                    Key Terminology & Specifications:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {(blk.items || []).map((term, tIdx) => (
                                      <span 
                                        key={tIdx}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-primary/10 border border-brand-primary/30 text-brand-primary"
                                      >
                                        {renderHighlightedText(term)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            // 4. Code Block or CLI Command
                            if (blk.type === 'code') {
                              const isCopied = copiedBlockId === blk.id;
                              return (
                                <div 
                                  key={blk.id} 
                                  className="rounded-2xl bg-black/90 border border-white/10 text-emerald-400 font-mono text-xs overflow-hidden shadow-xl"
                                >
                                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                      <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>CLI / Code Reference</span>
                                    </div>
                                    <button
                                      onClick={() => handleCopyCode(blk.text, blk.id)}
                                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-sans text-[10px] bg-white/10 px-2 py-0.5 rounded"
                                      title="Copy code to clipboard"
                                    >
                                      {isCopied ? (
                                        <>
                                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400 font-bold">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-4 overflow-x-auto">
                                    <pre className="whitespace-pre-wrap leading-relaxed">{blk.text}</pre>
                                  </div>
                                </div>
                              );
                            }

                            // 5. Bullet List Item
                            if (blk.type === 'bullet') {
                              return (
                                <div key={blk.id} className="flex items-start gap-2.5 pl-2">
                                  <span className="text-brand-primary font-bold text-base leading-none mt-1 shrink-0">•</span>
                                  <p className="flex-1 opacity-95">
                                    {renderHighlightedText(blk.text)}
                                  </p>
                                </div>
                              );
                            }

                            // 6. Image / Figure Block
                            if (blk.type === 'image' && blk.imgUrl) {
                              return (
                                <figure key={blk.id} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl">
                                  <div className="p-4 sm:p-6 flex items-center justify-center">
                                    <img 
                                      src={blk.imgUrl} 
                                      alt={blk.caption || 'Course illustration'} 
                                      className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-lg"
                                      loading="lazy"
                                    />
                                  </div>
                                  {blk.caption && (
                                    <figcaption className="p-3 text-center text-xs text-gray-400 font-mono border-t border-white/10 bg-black/60">
                                      <span className="text-brand-primary font-bold mr-1.5">Figure:</span>
                                      {blk.caption}
                                    </figcaption>
                                  )}
                                </figure>
                              );
                            }

                            // 7. Standard Formatted Paragraph
                            return (
                              <p key={blk.id} className="leading-relaxed opacity-95 whitespace-pre-line">
                                {renderHighlightedText(blk.text)}
                              </p>
                            );
                          })}
                        </div>

                        {/* Paper Bottom Footer Strip */}
                        <div className="pt-8 mt-12 border-t border-current/15 flex flex-wrap items-center justify-between gap-3 text-[10px] opacity-70 font-mono">
                          <span>Certified Educational Suite • High-Fidelity Course Reader</span>
                          <div className="flex items-center gap-3">
                            <span>Sheet {actualSheetNum} of {totalTextPages}</span>
                            {readingLayout === 'paginated' && actualSheetNum < totalTextPages && (
                              <button
                                onClick={() => setTextPageIndex(prev => prev + 1)}
                                className="font-bold underline hover:opacity-100 cursor-pointer"
                              >
                                Next Sheet &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TECHNICAL DRAWINGS & OBJECTS INSPECTOR */}
        {activeViewTab === 'drawings' && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in">
            {isTechnicalDrawing ? (
              /* CAD 3-View Orthographic Projection & 3D Isometric Solid */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full max-w-4xl bg-[#0a121a] rounded-3xl border border-cyan-500/30 p-6 shadow-2xl text-left font-mono relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-300 uppercase tracking-wider">
                      Engineering CAD Specification: 3-View Orthographic Projection
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">Standard: ISO 128 / ASME Y14</span>
                    <span>Scale: 1:1</span>
                  </div>
                </div>

                {/* CAD Drawing Canvas */}
                <div className="py-4 relative flex items-center justify-center">
                  <svg viewBox="0 0 800 480" className="w-full h-auto max-h-[520px] select-none">
                    {/* Background Grid */}
                    <defs>
                      <pattern id="cadGridSpec" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cadGridSpec)" />

                    {/* 1. TOP VIEW (PLAN VIEW) */}
                    <g className="cursor-pointer hover:opacity-90">
                      <text x="70" y="35" fill="#38bdf8" fontSize="12" fontWeight="bold">TOP / PLAN VIEW (A-A)</text>
                      <rect x="70" y="50" width="180" height="120" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" rx="2" />
                      <circle cx="160" cy="110" r="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="110" y1="110" x2="210" y2="110" stroke="#f43f5e" strokeWidth="1" strokeDasharray="6 3 2 3" />
                      <line x1="160" y1="60" x2="160" y2="160" stroke="#f43f5e" strokeWidth="1" strokeDasharray="6 3 2 3" />
                      <line x1="70" y1="190" x2="250" y2="190" stroke="#10b981" strokeWidth="1.2" />
                      <text x="145" y="205" fill="#10b981" fontSize="11" fontWeight="bold">180 mm</text>
                      <line x1="160" y1="110" x2="225" y2="75" stroke="#10b981" strokeWidth="1" />
                      <text x="230" y="75" fill="#10b981" fontSize="11" fontWeight="bold">Ø 56.0 ±0.05</text>
                    </g>

                    {/* 2. FRONT ELEVATION VIEW */}
                    <g className="cursor-pointer hover:opacity-90">
                      <text x="70" y="250" fill="#38bdf8" fontSize="12" fontWeight="bold">FRONT ELEVATION (B-B)</text>
                      <path d="M 70 420 L 70 290 L 170 290 L 170 340 L 250 340 L 250 420 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="132" y1="290" x2="132" y2="420" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                      <line x1="188" y1="290" x2="188" y2="420" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                      <line x1="45" y1="290" x2="45" y2="420" stroke="#10b981" strokeWidth="1.2" />
                      <text x="15" y="360" fill="#10b981" fontSize="11" fontWeight="bold" transform="rotate(-90 40 360)">130 mm</text>
                      <line x1="265" y1="340" x2="265" y2="420" stroke="#10b981" strokeWidth="1.2" />
                      <text x="275" y="385" fill="#10b981" fontSize="11" fontWeight="bold">80 mm</text>
                    </g>

                    {/* 3. RIGHT END VIEW */}
                    <g className="cursor-pointer hover:opacity-90">
                      <text x="330" y="250" fill="#38bdf8" fontSize="12" fontWeight="bold">RIGHT END VIEW</text>
                      <rect x="330" y="290" width="120" height="130" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="330" y1="340" x2="450" y2="340" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="365" y1="290" x2="365" y2="420" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                      <line x1="415" y1="290" x2="415" y2="420" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="365" y="445" fill="#10b981" fontSize="11" fontWeight="bold">120 mm</text>
                    </g>

                    {/* 4. ISOMETRIC 3D SOLID OBJECT */}
                    <g className="cursor-pointer hover:opacity-90">
                      <text x="540" y="55" fill="#a855f7" fontSize="12" fontWeight="bold">3D ISOMETRIC SOLID PROJECTION</text>
                      <polygon points="620,90 680,60 620,30 560,60" fill="#6b21a8" stroke="#d8b4fe" strokeWidth="1.5" />
                      <polygon points="680,120 740,90 680,60 620,90" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="1.5" />
                      <polygon points="560,60 620,90 620,180 560,150" fill="#4c1d95" stroke="#d8b4fe" strokeWidth="1.5" />
                      <polygon points="620,90 680,120 680,210 620,180" fill="#581c87" stroke="#d8b4fe" strokeWidth="1.5" />
                      <polygon points="680,120 740,90 740,180 680,210" fill="#3b0764" stroke="#d8b4fe" strokeWidth="1.5" />
                      <ellipse cx="620" cy="60" rx="20" ry="10" fill="#0f172a" stroke="#d8b4fe" strokeWidth="1.5" />
                      <text x="560" y="235" fill="#c084fc" fontSize="10" fontWeight="semibold">ISO 3D Axonometric Projection</text>
                    </g>

                    {/* 5. TITLE BLOCK */}
                    <g transform="translate(480, 310)">
                      <rect x="0" y="0" width="300" height="150" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                      <line x1="0" y1="35" x2="300" y2="35" stroke="#0ea5e9" strokeWidth="1" />
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#0ea5e9" strokeWidth="1" />
                      <line x1="0" y1="110" x2="300" y2="110" stroke="#0ea5e9" strokeWidth="1" />
                      <line x1="150" y1="0" x2="150" y2="150" stroke="#0ea5e9" strokeWidth="1" />
                      
                      <text x="10" y="22" fill="#94a3b8" fontSize="9">PROJECT / PART</text>
                      <text x="10" y="32" fill="#f8fafc" fontSize="10" fontWeight="bold">PRECISION GUIDE BRACKET</text>

                      <text x="160" y="22" fill="#94a3b8" fontSize="9">MATERIAL SPEC</text>
                      <text x="160" y="32" fill="#f8fafc" fontSize="10" fontWeight="bold">AL 6061-T6 AIRCRAFT GRADE</text>

                      <text x="10" y="55" fill="#94a3b8" fontSize="9">PROJECTION METHOD</text>
                      <text x="10" y="68" fill="#38bdf8" fontSize="10" fontWeight="bold">THIRD ANGLE (⌖ O-D)</text>

                      <text x="160" y="55" fill="#94a3b8" fontSize="9">TOLERANCING STANDARD</text>
                      <text x="160" y="68" fill="#f8fafc" fontSize="10" fontWeight="bold">GD&T: ±0.05 mm (ISO 2768-m)</text>

                      <text x="10" y="95" fill="#94a3b8" fontSize="9">DRAWN BY</text>
                      <text x="10" y="105" fill="#10b981" fontSize="10" fontWeight="bold">INSTRUCTOR JOSHUA</text>

                      <text x="160" y="95" fill="#94a3b8" fontSize="9">AUDIT STATUS</text>
                      <text x="160" y="105" fill="#10b981" fontSize="10" fontWeight="bold">APPROVED FOR FABRICATION</text>

                      <text x="10" y="132" fill="#94a3b8" fontSize="9">DOCUMENT ID</text>
                      <text x="10" y="142" fill="#cbd5e1" fontSize="10" fontWeight="mono">DWG-ENG-2026-0811</text>
                    </g>
                  </svg>
                </div>
              </div>
            ) : isNetworkTopology ? (
              /* Cisco Network Topology */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full max-w-4xl bg-[#0b131d] rounded-3xl border border-emerald-500/30 p-6 shadow-2xl text-left font-mono relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-4 h-4" /> Enterprise Network Topology & Packet Flow Diagram
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">CCNA Architecture Model</span>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <svg viewBox="0 0 800 360" className="w-full h-auto max-h-[460px] select-none">
                    {/* Router R1 (Core Gateway) */}
                    <g transform="translate(350, 30)">
                      <circle cx="50" cy="50" r="42" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                      <path d="M 30 50 L 70 50 M 50 30 L 50 70 M 35 35 L 65 65 M 35 65 L 65 35" stroke="#10b981" strokeWidth="2" />
                      <text x="24" y="110" fill="#34d399" fontSize="11" fontWeight="bold">R1-Core-Gateway</text>
                      <text x="20" y="125" fill="#94a3b8" fontSize="9">192.168.1.1/24</text>
                    </g>

                    {/* Trunk Link R1 to SW1 */}
                    <line x1="400" y1="125" x2="400" y2="190" stroke="#38bdf8" strokeWidth="3" />
                    <text x="410" y="160" fill="#38bdf8" fontSize="10" fontWeight="bold">802.1Q Trunk (Gig0/1)</text>

                    {/* Distribution Switch SW1 */}
                    <g transform="translate(330, 190)">
                      <rect x="0" y="0" width="140" height="45" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="4" />
                      <text x="22" y="28" fill="#38bdf8" fontSize="11" fontWeight="bold">SW1-Distribution</text>
                      <circle cx="20" cy="36" r="3" fill="#10b981" />
                      <circle cx="35" cy="36" r="3" fill="#10b981" />
                      <circle cx="50" cy="36" r="3" fill="#10b981" />
                      <circle cx="65" cy="36" r="3" fill="#10b981" />
                    </g>

                    {/* VLAN 10 Links */}
                    <line x1="330" y1="215" x2="160" y2="280" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                    <g transform="translate(60, 270)">
                      <rect x="0" y="0" width="200" height="75" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="1.5" rx="8" />
                      <text x="15" y="22" fill="#fbbf24" fontSize="11" fontWeight="bold">VLAN 10: Engineering</text>
                      <text x="15" y="40" fill="#94a3b8" fontSize="9">Subnet: 192.168.10.0/24</text>
                      <text x="15" y="58" fill="#e2e8f0" fontSize="9">PC-01 (10.5) • PC-02 (10.6)</text>
                    </g>

                    {/* VLAN 20 Links */}
                    <line x1="470" y1="215" x2="640" y2="280" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 3" />
                    <g transform="translate(540, 270)">
                      <rect x="0" y="0" width="200" height="75" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" rx="8" />
                      <text x="15" y="22" fill="#c084fc" fontSize="11" fontWeight="bold">VLAN 20: Server Cluster</text>
                      <text x="15" y="40" fill="#94a3b8" fontSize="9">Subnet: 192.168.20.0/24</text>
                      <text x="15" y="58" fill="#e2e8f0" fontSize="9">Web-SRV (20.10) • DB-SRV (20.20)</text>
                    </g>
                  </svg>
                </div>
              </div>
            ) : isFiberDrawing ? (
              /* Fiber Optics Waveguide */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full max-w-4xl bg-[#0d141e] rounded-3xl border border-amber-500/30 p-6 shadow-2xl text-left font-mono relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Fiber Optic Physics: Total Internal Reflection & Waveguide
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">ITU-T G.652 Standard</span>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <svg viewBox="0 0 800 340" className="w-full h-auto max-h-[440px] select-none">
                    <rect x="50" y="40" width="700" height="60" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <text x="70" y="75" fill="#94a3b8" fontSize="12" fontWeight="bold">Cladding (n2 = 1.450 - Lower Index)</text>
                    
                    <rect x="50" y="100" width="700" height="80" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                    <text x="70" y="145" fill="#fbbf24" fontSize="14" fontWeight="black">Glass Core (n1 = 1.465 - Higher Index - 9µm SMF)</text>
                    
                    <rect x="50" y="180" width="700" height="60" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <text x="70" y="215" fill="#94a3b8" fontSize="12" fontWeight="bold">Cladding (n2 = 1.450 - Lower Index - 125µm)</text>

                    <polyline 
                      points="50,140 180,100 310,180 440,100 570,180 700,100 750,135" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    
                    <circle cx="180" cy="100" r="6" fill="#f87171" />
                    <circle cx="310" cy="180" r="6" fill="#f87171" />
                    <circle cx="440" cy="100" r="6" fill="#f87171" />
                    <circle cx="570" cy="180" r="6" fill="#f87171" />

                    <text x="210" y="115" fill="#fca5a5" fontSize="10" fontWeight="bold">θ &gt; Critical Angle (TIR)</text>

                    <g transform="translate(100, 260)">
                      <text x="0" y="15" fill="#e2e8f0" fontSize="11" fontWeight="bold">Cross Sectional Dimensions:</text>
                      <text x="0" y="32" fill="#94a3b8" fontSize="10">● Core: 9 µm (Single Mode)</text>
                      <text x="200" y="32" fill="#94a3b8" fontSize="10">● Cladding: 125 µm</text>
                      <text x="360" y="32" fill="#94a3b8" fontSize="10">● Primary Buffer: 250 µm</text>
                      <text x="530" y="32" fill="#94a3b8" fontSize="10">● Outer Jacket: 900 µm</text>
                    </g>
                  </svg>
                </div>
              </div>
            ) : isLinuxArch ? (
              /* Linux Subsystem Architecture */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full max-w-4xl bg-[#0a141d] rounded-3xl border border-cyan-500/30 p-6 shadow-2xl text-left font-mono relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Linux Operating System & Kernel Subsystem Architecture
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">GNU / Linux 6.8 POSIX</span>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <svg viewBox="0 0 800 360" className="w-full h-auto max-h-[440px] select-none">
                    <g transform="translate(50, 20)">
                      <rect x="0" y="0" width="700" height="50" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="6" />
                      <text x="20" y="30" fill="#38bdf8" fontSize="13" fontWeight="bold">USER SPACE: Applications, Bash Shell, Daemons, Python, Nginx</text>
                    </g>

                    <g transform="translate(50, 85)">
                      <rect x="0" y="0" width="700" height="45" fill="#0f172a" stroke="#a855f7" strokeWidth="2" rx="6" />
                      <text x="20" y="28" fill="#c084fc" fontSize="12" fontWeight="bold">System Call Interface (SCI) & Glibc: open(), fork(), read(), write(), socket()</text>
                    </g>

                    <g transform="translate(50, 145)">
                      <rect x="0" y="0" width="700" height="110" fill="#06121e" stroke="#10b981" strokeWidth="2.5" rx="8" />
                      <text x="20" y="25" fill="#34d399" fontSize="13" fontWeight="black">KERNEL SPACE (Ring 0): Monolithic Linux Kernel Core</text>

                      <g transform="translate(20, 40)">
                        <rect x="0" y="0" width="120" height="50" fill="#132a26" stroke="#10b981" rx="4" />
                        <text x="10" y="22" fill="#a7f3d0" fontSize="10" fontWeight="bold">Process Scheduler</text>
                        <text x="10" y="38" fill="#6ee7b7" fontSize="9">CFS & Threads</text>

                        <rect x="135" y="0" width="120" height="50" fill="#132a26" stroke="#10b981" rx="4" />
                        <text x="10" y="22" fill="#a7f3d0" fontSize="10" fontWeight="bold">Memory Mgmt</text>
                        <text x="10" y="38" fill="#6ee7b7" fontSize="9">MMU, Page Tables</text>

                        <rect x="270" y="0" width="120" height="50" fill="#132a26" stroke="#10b981" rx="4" />
                        <text x="10" y="22" fill="#a7f3d0" fontSize="10" fontWeight="bold">Virtual VFS</text>
                        <text x="10" y="38" fill="#6ee7b7" fontSize="9">ext4, btrfs, sysfs</text>

                        <rect x="405" y="0" width="120" height="50" fill="#132a26" stroke="#10b981" rx="4" />
                        <text x="10" y="22" fill="#a7f3d0" fontSize="10" fontWeight="bold">Network Stack</text>
                        <text x="10" y="38" fill="#6ee7b7" fontSize="9">TCP/IP, Netfilter</text>

                        <rect x="540" y="0" width="120" height="50" fill="#132a26" stroke="#10b981" rx="4" />
                        <text x="10" y="22" fill="#a7f3d0" fontSize="10" fontWeight="bold">Device Drivers</text>
                        <text x="10" y="38" fill="#6ee7b7" fontSize="9">PCIe, USB, GPU</text>
                      </g>
                    </g>

                    <g transform="translate(50, 275)">
                      <rect x="0" y="0" width="700" height="50" fill="#1e1b4b" stroke="#eab308" strokeWidth="2" rx="6" />
                      <text x="20" y="30" fill="#facc15" fontSize="12" fontWeight="bold">PHYSICAL HARDWARE: CPU (x86_64/ARM64), RAM, NVMe SSD, NIC, Network Interfaces</text>
                    </g>
                  </svg>
                </div>
              </div>
            ) : isMachineLearning ? (
              /* Deep Neural Network */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full max-w-4xl bg-[#110e1f] rounded-3xl border border-purple-500/30 p-6 shadow-2xl text-left font-mono relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Binary className="w-4 h-4" /> Deep Neural Network (DNN) Topology & Activation Nodes
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Forward Propagation & Backprop</span>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <svg viewBox="0 0 800 320" className="w-full h-auto max-h-[420px] select-none">
                    <g transform="translate(80, 40)">
                      <text x="0" y="0" fill="#a78bfa" fontSize="11" fontWeight="bold">INPUT (X)</text>
                      <circle cx="25" cy="40" r="18" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="18" y="44" fill="#ddd6fe" fontSize="10">x₁</text>
                      <circle cx="25" cy="110" r="18" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="18" y="114" fill="#ddd6fe" fontSize="10">x₂</text>
                      <circle cx="25" cy="180" r="18" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="18" y="184" fill="#ddd6fe" fontSize="10">x₃</text>
                    </g>

                    <g transform="translate(280, 20)">
                      <text x="0" y="0" fill="#c084fc" fontSize="11" fontWeight="bold">HIDDEN LAYER 1 (ReLU)</text>
                      <circle cx="45" cy="35" r="18" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
                      <circle cx="45" cy="95" r="18" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
                      <circle cx="45" cy="155" r="18" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
                      <circle cx="45" cy="215" r="18" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
                    </g>

                    <g transform="translate(480, 20)">
                      <text x="0" y="0" fill="#e879f9" fontSize="11" fontWeight="bold">HIDDEN LAYER 2 (Sigmoid)</text>
                      <circle cx="45" cy="65" r="18" fill="#581c87" stroke="#e879f9" strokeWidth="2" />
                      <circle cx="45" cy="125" r="18" fill="#581c87" stroke="#e879f9" strokeWidth="2" />
                      <circle cx="45" cy="185" r="18" fill="#581c87" stroke="#e879f9" strokeWidth="2" />
                    </g>

                    <g transform="translate(680, 60)">
                      <text x="0" y="0" fill="#34d399" fontSize="11" fontWeight="bold">OUTPUT (ŷ)</text>
                      <circle cx="25" cy="55" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                      <text x="18" y="59" fill="#a7f3d0" fontSize="11" fontWeight="bold">ŷ₁</text>
                      <circle cx="25" cy="135" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                      <text x="18" y="139" fill="#a7f3d0" fontSize="11" fontWeight="bold">ŷ₂</text>
                    </g>

                    <line x1="125" y1="80" x2="305" y2="55" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="80" x2="305" y2="115" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="150" x2="305" y2="115" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="150" x2="305" y2="175" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="220" x2="305" y2="175" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="220" x2="305" y2="235" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />

                    <line x1="345" y1="115" x2="505" y2="85" stroke="#9333ea" strokeWidth="1.2" opacity="0.7" />
                    <line x1="345" y1="115" x2="505" y2="145" stroke="#9333ea" strokeWidth="1.2" opacity="0.7" />
                    <line x1="345" y1="175" x2="505" y2="145" stroke="#9333ea" strokeWidth="1.2" opacity="0.7" />
                    <line x1="345" y1="175" x2="505" y2="205" stroke="#9333ea" strokeWidth="1.2" opacity="0.7" />

                    <line x1="545" y1="145" x2="685" y2="115" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
                    <line x1="545" y1="205" x2="685" y2="195" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
                  </svg>
                </div>
              </div>
            ) : isImage && fileUrl ? (
              /* Graphic Asset */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="max-w-none flex items-center justify-center p-2 relative"
              >
                <img 
                  src={fileUrl} 
                  alt={doc.name} 
                  className="max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            ) : (
              /* General Document Objects Callout */
              <div className="w-full max-w-2xl p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-4">
                <Box className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-lg font-bold text-gray-100">Document Technical Schematics</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  All diagrams, structural tables, and vector objects in this module are actively synchronized with the Document Pages view.
                </p>
                <button
                  onClick={() => setActiveViewTab('document')}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover cursor-pointer transition-all"
                >
                  Return to Document Reading &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. BOTTOM STATUS BAR */}
      <div className="px-4 py-2.5 bg-[#0e1722] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <FileCheck className="w-3.5 h-3.5" /> High-Fidelity Original Document Engine
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:inline text-gray-300">
            {isPdf ? `PDF Document (${pdfNumPages} Pages)` : isImage ? 'Graphic Asset' : `Formatted Document (${totalTextPages} Sheets)`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isTrueFullscreen ? (
            <button
              onClick={() => setIsTrueFullscreen(false)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer transition-all flex items-center gap-1"
            >
              <Minimize2 className="w-3 h-3" /> Exit Fullscreen (ESC)
            </button>
          ) : (
            <>
              <span>Mode: <strong className="text-cyan-400 capitalize">{layoutMode}</strong></span>
              {layoutMode === 'full' && onCloseFullscreen && (
                <button
                  onClick={onCloseFullscreen}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-all"
                >
                  Standard View
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
