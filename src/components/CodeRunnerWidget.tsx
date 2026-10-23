import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Download, Copy, RefreshCw, Terminal, Check, 
  Code2, Sparkles, ChevronDown, ChevronUp, X, FileCode, AlertCircle, CornerDownLeft
} from 'lucide-react';

export type SupportedLanguage = 'python' | 'javascript' | 'bash' | 'sql';

interface CodeRunnerWidgetProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  title?: string;
  category?: string;
  darkMode?: boolean;
  onClose?: () => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export default function CodeRunnerWidget({
  initialCode = '',
  initialLanguage = 'python',
  title = 'Code Scratchpad & Runner',
  category = 'Programming',
  darkMode = true,
  onClose,
  isCollapsible = false,
  defaultExpanded = true,
  compact = false
}: CodeRunnerWidgetProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Execution states
  const [running, setRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  
  // UI states
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync if initialCode changes externally (e.g. user selects a different question)
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  // Handle Tab key in textarea for professional indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setCode(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Generate appropriate file extension and filename
  const getFileExtension = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'python': return 'py';
      case 'javascript': return 'js';
      case 'bash': return 'sh';
      case 'sql': return 'sql';
      default: return 'txt';
    }
  };

  const getCleanFileName = (): string => {
    const safeTitle = (title || 'solution')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return `${safeTitle || 'solution'}.${getFileExtension(language)}`;
  };

  // Download Code File
  const handleDownloadCode = () => {
    if (!code) return;
    try {
      const fileName = getCleanFileName();
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset to original snippet
  const handleReset = () => {
    setCode(initialCode || getDefaultStarterForLang(language));
    setTerminalOutput('');
    setAiExplanation('');
  };

  // Execute Code
  const handleRunCode = async () => {
    if (!code.trim()) {
      setTerminalOutput('[ERROR]: Editor is empty. Write or paste code before running.');
      return;
    }

    setRunning(true);
    setTerminalOutput(`[SIMULATOR]: Initializing runtime environment (${language.toUpperCase()})...\n[SIMULATOR]: Executing script snippet...`);
    setAiExplanation('');
    const startTime = performance.now();

    // Fast-path client evaluation for JavaScript
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args: any[]) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        console.error = (...args: any[]) => {
          logs.push(`[STDERR]: ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        console.warn = (...args: any[]) => {
          logs.push(`[WARN]: ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        // Run in local function scope
        let result: any;
        try {
          const runnable = new Function(code);
          result = runnable();
        } finally {
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
        }

        const endTime = performance.now();
        setExecutionTimeMs(Math.round(endTime - startTime));

        let out = logs.join('\n');
        if (result !== undefined) {
          out += (out ? '\n' : '') + `=> Return Value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`;
        }
        if (!out) {
          out = '[COMPLETED]: Script executed with 0 console logs (Exit Code 0).';
        }

        setTerminalOutput(out);
        setAiExplanation('Executed natively via local JavaScript ES6 engine. Output matches standard Node.js/V8 behavior.');
        setRunning(false);
        return;
      } catch (err: any) {
        // If client-side failed with syntax error, we still let server verify or report error
        console.warn('Local JS execution error, falling back to server analyzer:', err);
      }
    }

    // Server-side compiler simulation & evaluation
    try {
      const res = await fetch('/api/ai/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          category,
          moduleName: title
        })
      });

      const data = await res.json();
      const endTime = performance.now();
      setExecutionTimeMs(Math.round(endTime - startTime));

      if (res.ok) {
        setTerminalOutput(data.terminalOutput || 'Script executed.');
        setAiExplanation(data.aiExplanation || '');
      } else {
        setTerminalOutput(`[COMPILER ERROR]: ${data.error || 'Execution failed.'}`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setExecutionTimeMs(Math.round(endTime - startTime));
      setTerminalOutput(`[RUNTIME EXCEPTION]: ${err.message || 'Execution failed.'}`);
    } finally {
      setRunning(false);
    }
  };

  function getDefaultStarterForLang(l: SupportedLanguage): string {
    switch (l) {
      case 'python':
        return `# Python 3.12 interactive runner\nprint("Testing solution...")\n\ndef test_solution():\n    return 42\n\nprint(f"Result: {test_solution()}")\n`;
      case 'javascript':
        return `// JavaScript ES6 runner\nconsole.log("Testing solution...");\nconst result = [1, 2, 3].map(x => x * 2);\nconsole.log("Transformed:", result);\n`;
      case 'bash':
        return `#!/usr/bin/env bash\necho "Running bash commands..."\nuname -a\necho "Status: OK"\n`;
      case 'sql':
        return `-- SQL Query testing\nSELECT user_id, username, score\nFROM learners\nWHERE active = 1\nORDER BY score DESC;\n`;
    }
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      darkMode ? 'bg-[#0b1019] border-indigo-500/20 shadow-xl' : 'bg-white border-gray-200 shadow-md'
    } overflow-hidden text-left`}>
      
      {/* HEADER TOOLBAR */}
      <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
        darkMode ? 'bg-slate-900/80 border-white/5' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-xs font-bold font-display ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {title}
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                {language}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 block">
              {getCleanFileName()}
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={e => {
              const newLang = e.target.value as SupportedLanguage;
              setLanguage(newLang);
              if (!code.trim() || code === getDefaultStarterForLang(language)) {
                setCode(getDefaultStarterForLang(newLang));
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none transition-all ${
              darkMode ? 'bg-black/40 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <option value="python">Python 3.12</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="bash">Bash / Shell</option>
            <option value="sql">SQL Query</option>
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            title="Copy Code to Clipboard"
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              copied 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : darkMode 
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download Code Button */}
          <button
            onClick={handleDownloadCode}
            title={`Download as ${getCleanFileName()}`}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              downloadSuccess
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-teal-600/20 hover:bg-teal-600/30 border-teal-500/40 text-teal-300 hover:text-teal-200'
            }`}
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{downloadSuccess ? 'Downloaded!' : 'Download Code'}</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={running}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            {running ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                <span className="text-[11px]">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px]">Run Code</span>
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            title="Reset to original code"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Toggle */}
          {isCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* COLLAPSIBLE BODY */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          
          {/* EDITOR & TERMINAL SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* CODE EDITOR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <FileCode className="w-3 h-3 text-indigo-400" /> Source Editor (Tab indent & Ctrl+Enter to Run)
                </span>
                <span>{code.split('\n').length} lines</span>
              </div>
              
              <div className={`relative rounded-xl border overflow-hidden ${
                darkMode ? 'bg-[#060a11] border-white/10' : 'bg-gray-900 border-gray-800'
              }`}>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={compact ? 8 : 12}
                  placeholder={`Write or paste ${language} code to test and run...`}
                  className="w-full p-3 font-mono text-xs leading-relaxed text-emerald-400 bg-transparent resize-y focus:outline-none scrollbar-thin select-text"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* SIMULATED TERMINAL OUTPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1 text-teal-400 font-bold">
                  <Terminal className="w-3 h-3" /> Execution Terminal & Stdout
                </span>
                {executionTimeMs !== null && (
                  <span className="text-[10px] text-gray-500">{executionTimeMs}ms</span>
                )}
              </div>

              <div className={`p-3.5 rounded-xl border font-mono text-xs overflow-y-auto max-h-[295px] min-h-[175px] ${
                darkMode ? 'bg-[#04070d] border-white/10 text-gray-200' : 'bg-black border-gray-800 text-green-400'
              }`}>
                {terminalOutput ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    <code>{terminalOutput}</code>
                  </pre>
                ) : (
                  <div className="py-8 text-center text-gray-500 space-y-1">
                    <p className="font-mono text-[11px]">&gt; Terminal ready.</p>
                    <p className="text-[10px]">Click "Run Code" or press Ctrl+Enter to evaluate your solution.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI CODE EXPLANATION IF AVAILABLE */}
          {aiExplanation && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compiler Analysis & Execution Insights:</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed whitespace-pre-wrap">
                {aiExplanation}
              </p>
            </div>
          )}

          {/* FOOTER HELPER */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-gray-400">
            <span>
              💡 <strong>Tip:</strong> You can edit the code freely to experiment with edge cases before selecting your answer.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCode}
                className="text-teal-400 hover:text-teal-300 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Save to {getCleanFileName()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
