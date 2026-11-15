import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, RotateCcw, Copy, Check, Download, Sparkles, Terminal, 
  Layers, Cpu, CheckCircle, AlertCircle, RefreshCw, 
  Code2, BookOpen, ChevronRight, X, Maximize2, Minimize2,
  FileText, Binary, Shield, Sliders, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { CategoryName } from '../types.js';

export interface CProjectTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  standard: 'c11' | 'c99' | 'c17';
  code: string;
  stdinDefault?: string;
  expectedOutputHint: string;
}

export const C_PROJECT_TEMPLATES: CProjectTemplate[] = [
  {
    id: 'c_fundamentals',
    title: '1. Pointers & Memory Address Arithmetic',
    category: 'Memory & Pointers',
    difficulty: 'Beginner',
    standard: 'c11',
    description: 'Inspect hexadecimal memory addresses, pointer dereferencing, and value mutation via reference.',
    expectedOutputHint: 'Prints variable values, their exact physical RAM memory addresses (%p), and modified values.',
    code: `/* 
 * NETECH Academy - C Programming Dev IDE
 * Module: Pointers & Hexadecimal Memory Addresses
 */
#include <stdio.h>

int main() {
    int counter = 42;
    int *ptr = &counter;

    printf("=========================================\\n");
    printf("   C POINTER & MEMORY INSPECTOR          \\n");
    printf("=========================================\\n");
    printf("Original counter value: %d\\n", counter);
    printf("Physical Memory Address (&counter): %p\\n", (void*)&counter);
    printf("Pointer variable value (ptr holds):  %p\\n", (void*)ptr);
    printf("Dereferenced value (*ptr):          %d\\n\\n", *ptr);

    // Modify counter value through pointer
    *ptr = 100;
    printf("[MUTATION]: Modified value via *ptr = 100\\n");
    printf("New counter value:                  %d\\n", counter);

    // Pointer arithmetic on array
    int numbers[4] = {10, 20, 30, 40};
    int *num_ptr = numbers;

    printf("\\n[ARRAY POINTER WALK]:\\n");
    for (int i = 0; i < 4; i++) {
        printf("Index %d: value = %d | Address = %p\\n", i, *(num_ptr + i), (void*)(num_ptr + i));
    }

    return 0;
}
`
  },
  {
    id: 'c_dynamic_mem',
    title: '2. Dynamic Memory Allocation (malloc & free)',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    standard: 'c11',
    description: 'Allocate dynamic arrays on the Heap using malloc, resize with realloc, and properly deallocate with free to prevent memory leaks.',
    expectedOutputHint: 'Allocates heap memory, populates data, calculates statistics, and cleans up heap pointers.',
    code: `/* 
 * NETECH Academy - Heap Memory Management
 * Module: malloc, realloc, and memory leak prevention
 */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int initial_size = 5;
    printf("[HEAP ALLOCATION]: Allocating %d integers on heap...\\n", initial_size);

    // Allocate heap memory
    int *dynamic_arr = (int*)malloc(initial_size * sizeof(int));
    if (dynamic_arr == NULL) {
        fprintf(stderr, "Heap allocation failed!\\n");
        return 1;
    }

    printf("Heap Buffer Address: %p\\n\\n", (void*)dynamic_arr);

    // Populate data
    for (int i = 0; i < initial_size; i++) {
        dynamic_arr[i] = (i + 1) * 10;
        printf("Element [%d] = %d at %p\\n", i, dynamic_arr[i], (void*)&dynamic_arr[i]);
    }

    // Reallocate memory for expansion
    int new_size = 8;
    printf("\\n[EXPANSION]: Resizing heap buffer to %d integers...\\n", new_size);
    int *temp = (int*)realloc(dynamic_arr, new_size * sizeof(int));
    if (temp == NULL) {
        free(dynamic_arr);
        fprintf(stderr, "Heap reallocation failed!\\n");
        return 1;
    }
    dynamic_arr = temp;

    dynamic_arr[5] = 60;
    dynamic_arr[6] = 70;
    dynamic_arr[7] = 80;

    int sum = 0;
    for (int i = 0; i < new_size; i++) {
        sum += dynamic_arr[i];
    }

    printf("Buffer sum total: %d\\n", sum);
    printf("Average: %.2f\\n", (float)sum / new_size);

    // Critical: Free allocated heap memory
    free(dynamic_arr);
    dynamic_arr = NULL;
    printf("\\n[CLEANUP]: Heap memory successfully freed. Pointers reset to NULL.\\n");

    return 0;
}
`
  },
  {
    id: 'c_linked_list',
    title: '3. Singly Linked List Data Structure',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    standard: 'c11',
    description: 'Build a dynamic singly linked list in C with node structures, head insertion, tail insertion, and memory disposal.',
    expectedOutputHint: 'Constructs a linked list, performs node insertions, traverses links, and frees all allocated memory.',
    code: `/*
 * NETECH Academy - C Data Structures
 * Singly Linked List with Dynamic Node Allocation
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int student_id;
    char name[32];
    float gpa;
    struct Node *next;
} Node;

// Create new node on heap
Node* create_node(int id, const char *name, float gpa) {
    Node *new_node = (Node*)malloc(sizeof(Node));
    if (!new_node) return NULL;
    new_node->student_id = id;
    strncpy(new_node->name, name, sizeof(new_node->name) - 1);
    new_node->name[sizeof(new_node->name) - 1] = '\\0';
    new_node->gpa = gpa;
    new_node->next = NULL;
    return new_node;
}

// Insert node at the end (Tail)
void insert_tail(Node **head_ref, int id, const char *name, float gpa) {
    Node *new_node = create_node(id, name, gpa);
    if (*head_ref == NULL) {
        *head_ref = new_node;
        return;
    }
    Node *curr = *head_ref;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    curr->next = new_node;
}

// Display all student records
void print_list(Node *head) {
    printf("--- ACADEMY STUDENT ENROLLMENT LINKED LIST ---\\n");
    Node *curr = head;
    int count = 1;
    while (curr != NULL) {
        printf("Node %d [%p]: ID=%d | Name=%-12s | GPA=%.2f -> Next=%p\\n",
               count++, (void*)curr, curr->student_id, curr->name, curr->gpa, (void*)curr->next);
        curr = curr->next;
    }
    printf("NULL (End of List)\\n\\n");
}

// Free entire list to prevent leaks
void free_list(Node *head) {
    Node *curr = head;
    while (curr != NULL) {
        Node *temp = curr;
        curr = curr->next;
        free(temp);
    }
}

int main() {
    Node *head = NULL;

    insert_tail(&head, 101, "Joshua U.", 3.95);
    insert_tail(&head, 102, "Sarah K.", 3.82);
    insert_tail(&head, 103, "David M.", 3.65);
    insert_tail(&head, 104, "Elena N.", 4.00);

    print_list(head);

    free_list(head);
    printf("[CLEANUP]: All list nodes freed from heap.\\n");
    return 0;
}
`
  },
  {
    id: 'c_sockets',
    title: '4. Network Socket Programming (TCP IP)',
    category: 'Networking',
    difficulty: 'Advanced',
    standard: 'c11',
    description: 'Low-level Berkeley sockets in C: Create AF_INET socket, configure sockaddr_in struct, pack IP addresses with inet_pton, and simulate protocol communication.',
    expectedOutputHint: 'Creates socket descriptor, converts network byte order (htons), and handles TCP protocol states.',
    code: `/*
 * NETECH Academy - Systems & Network Programming in C
 * Berkeley Sockets (AF_INET / SOCK_STREAM)
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

int main() {
    printf("===========================================\\n");
    printf("   C NETWORK SOCKET SIMULATOR (CCNA/TVET)  \\n");
    printf("===========================================\\n");

    // 1. Create IPv4 TCP socket
    int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd < 0) {
        perror("Socket creation failed");
        return 1;
    }
    printf("1. Socket Created Successfully! (FD: %d)\\n", sock_fd);

    // 2. Setup server address struct
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(80); // HTTP Port in Network Byte Order (Big Endian)

    // Convert IP string to binary format
    const char *target_ip = "192.168.1.1";
    if (inet_pton(AF_INET, target_ip, &server_addr.sin_addr) <= 0) {
        perror("Invalid IP address");
        close(sock_fd);
        return 1;
    }

    printf("2. Target Server Configured:\\n");
    printf("   - Address Family: AF_INET (IPv4)\\n");
    printf("   - Target IP:      %s\\n", target_ip);
    printf("   - Target Port:    80 (Network Order: 0x%04x)\\n", server_addr.sin_port);

    // 3. Socket options
    int opt = 1;
    if (setsockopt(sock_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) == 0) {
        printf("3. Set SO_REUSEADDR option: Enabled\\n");
    }

    printf("4. Ready to initiate 3-Way Handshake (SYN -> SYN/ACK -> ACK)\\n");
    printf("   [INFO]: Protocol stack verified successfully.\\n");

    close(sock_fd);
    printf("5. Socket closed cleanly.\\n");
    return 0;
}
`
  },
  {
    id: 'c_process_fork',
    title: '5. Operating Systems: fork(), exec & IPC Pipes',
    category: 'Operating Systems',
    difficulty: 'Advanced',
    standard: 'c11',
    description: 'Process creation in Linux/Unix using fork(). Inspect parent and child process IDs, and pass data through an anonymous unidirectional pipe.',
    expectedOutputHint: 'Forks a child process, exchanges messages through pipe, and verifies exit status with waitpid.',
    code: `/*
 * NETECH Academy - OS Kernel & Process Architecture
 * fork(), pipe(), and process synchronization
 */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

int main() {
    int pipefd[2];
    char write_msg[] = "Telemetry message from child process to parent!";
    char read_msg[128];

    // Create an IPC pipe: pipefd[0] is read, pipefd[1] is write
    if (pipe(pipefd) == -1) {
        perror("Pipe creation failed");
        return 1;
    }

    printf("[INIT]: Parent Process PID = %d\\n", getpid());
    printf("[FORK]: Forking child process...\\n\\n");

    pid_t pid = fork();

    if (pid < 0) {
        perror("fork() failed");
        return 1;
    }

    if (pid == 0) {
        // --- CHILD PROCESS ---
        close(pipefd[0]); // Close unused read end

        printf("  [CHILD]: Hello from Child! PID = %d (Parent PID = %d)\\n", getpid(), getppid());
        printf("  [CHILD]: Writing data to IPC pipe buffer...\\n");

        write(pipefd[1], write_msg, strlen(write_msg) + 1);
        close(pipefd[1]); // Close write end after sending

        printf("  [CHILD]: Work finished. Exiting with code 0.\\n\\n");
        exit(0);
    } else {
        // --- PARENT PROCESS ---
        close(pipefd[1]); // Close unused write end

        // Wait for child to finish execution
        int status;
        waitpid(pid, &status, 0);

        printf("[PARENT]: Child PID %d terminated (Exit Status: %d)\\n", pid, WEXITSTATUS(status));
        read(pipefd[0], read_msg, sizeof(read_msg));
        close(pipefd[0]);

        printf("[PARENT]: Received from IPC Pipe: \\"%s\\"\\n", read_msg);
        printf("[PARENT]: Pipeline complete.\\n");
    }

    return 0;
}
`
  },
  {
    id: 'c_subnet_bitwise',
    title: '6. Subnet Calculations & Bitwise Manipulation in C',
    category: 'Networking',
    difficulty: 'Intermediate',
    standard: 'c11',
    description: 'Compute network IDs, broadcast addresses, and wildcard masks using high-performance C bitwise operators (AND, OR, NOT, Shifts).',
    expectedOutputHint: 'Parses IP and CIDR prefix, applies bitmask, and calculates network and broadcast addresses.',
    code: `/*
 * NETECH Academy - Bitwise Calculations for Subnetting
 * Bit twiddling: bitwise AND (&), OR (|), NOT (~), shifts (<<, >>)
 */
#include <stdio.h>
#include <stdint.h>

void print_ip_bytes(uint32_t ip) {
    printf("%d.%d.%d.%d", 
           (ip >> 24) & 0xFF,
           (ip >> 16) & 0xFF,
           (ip >> 8) & 0xFF,
           ip & 0xFF);
}

void print_binary_32(uint32_t val) {
    for (int i = 31; i >= 0; i--) {
        printf("%d", (val >> i) & 1);
        if (i % 8 == 0 && i != 0) printf(" ");
    }
}

int main() {
    // Target: 192.168.10.130 with a /26 subnet mask
    uint32_t ip = (192 << 24) | (168 << 16) | (10 << 8) | 130;
    int cidr = 26;

    // Compute mask: shift 0xFFFFFFFF by (32 - cidr)
    uint32_t mask = (cidr == 0) ? 0 : (~0U << (32 - cidr));
    uint32_t wildcard = ~mask;

    // Compute network ID (IP & MASK)
    uint32_t network = ip & mask;

    // Compute broadcast (NETWORK | WILDCARD)
    uint32_t broadcast = network | wildcard;

    uint32_t first_host = network + 1;
    uint32_t last_host = broadcast - 1;
    uint32_t total_hosts = (1U << (32 - cidr)) - 2;

    printf("===========================================\\n");
    printf("   C HIGH-PERFORMANCE SUBNETTING ENGINE    \\n");
    printf("===========================================\\n");
    printf("Input IP:       "); print_ip_bytes(ip); printf(" /%d\\n", cidr);
    printf("Binary IP:      "); print_binary_32(ip); printf("\\n");
    printf("Subnet Mask:    "); print_ip_bytes(mask); printf("\\n");
    printf("Binary Mask:    "); print_binary_32(mask); printf("\\n");
    printf("-------------------------------------------\\n");
    printf("Network ID:     "); print_ip_bytes(network); printf("\\n");
    printf("Broadcast IP:   "); print_ip_bytes(broadcast); printf("\\n");
    printf("First Usable:   "); print_ip_bytes(first_host); printf("\\n");
    printf("Last Usable:    "); print_ip_bytes(last_host); printf("\\n");
    printf("Usable Hosts:   %u hosts\\n", total_hosts);

    return 0;
}
`
  }
];

interface CProgrammingIDEProps {
  darkMode?: boolean;
  onNavigateToTab?: (tab: string, category?: CategoryName, docId?: string, query?: string) => void;
  user?: any;
}

export default function CProgrammingIDE({ 
  darkMode = false, 
  onNavigateToTab, 
  user 
}: CProgrammingIDEProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('c_fundamentals');
  const [code, setCode] = useState<string>(() => C_PROJECT_TEMPLATES[0].code);
  const [stdinInput, setStdinInput] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [standard, setStandard] = useState<'c11' | 'c99' | 'c17'>('c11');
  const [optimization, setOptimization] = useState<'O0' | 'O1' | 'O2' | 'O3'>('O2');
  
  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompilingAssembly, setIsCompilingAssembly] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [compilerWarnings, setCompilerWarnings] = useState<string>('');
  const [assemblyOutput, setAssemblyOutput] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'console' | 'assembly' | 'visualizer'>('console');
  
  // AI Assistance
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  
  const [copied, setCopied] = useState<boolean>(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = C_PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCode(tmpl.code);
      setStandard(tmpl.standard);
      setStdinInput(tmpl.stdinDefault || '');
      setConsoleOutput('');
      setCompilerWarnings('');
      setAssemblyOutput('');
      setExecutionTime(null);
      setExitCode(null);
      setAiAnalysis('');
    }
  };

  // Compile and run C code on native server GCC engine
  const handleCompileAndRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setViewMode('console');
    setConsoleOutput('>> Compiling with GCC (std=' + standard + ', -' + optimization + ' -Wall -Wextra)...\n');
    setCompilerWarnings('');
    setExecutionTime(null);
    setExitCode(null);

    const startTime = performance.now();

    try {
      const res = await fetch('/api/c/compile-and-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          stdin: stdinInput,
          standard,
          optimization
        })
      });

      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (!res.ok) {
        setConsoleOutput(`[ERROR ${res.status}]: ${data.error || 'Compilation service failed'}\n`);
        setExitCode(1);
        return;
      }

      setExecutionTime(data.executionTimeMs !== undefined ? data.executionTimeMs : elapsed);
      setExitCode(data.exitCode !== undefined ? data.exitCode : (data.success ? 0 : 1));

      if (data.compilerOutput && data.compilerOutput.trim()) {
        setCompilerWarnings(data.compilerOutput.trim());
      }

      if (data.stage === 'compilation' && !data.success) {
        setConsoleOutput(`[GCC COMPILATION FAILED]:\n${data.compilerOutput || data.stderr}\n\nReview syntax and missing header includes.`);
      } else {
        let output = data.stdout || '';
        if (data.stderr && data.stderr.trim()) {
          output += (output ? '\n' : '') + `[STDERR]:\n${data.stderr}`;
        }
        if (!output) {
          output = `(Program executed cleanly with exit code ${data.exitCode || 0} and produced no stdout)`;
        }
        setConsoleOutput(output);
      }
    } catch (err: any) {
      console.error('C Compilation error:', err);
      setConsoleOutput(`[RUNTIME CONNECTION ERROR]: Unable to contact compilation engine.\n${err.message}`);
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate Intel x86_64 Disassembly
  const handleGenerateAssembly = async () => {
    setIsCompilingAssembly(true);
    setViewMode('assembly');
    setAssemblyOutput('>> Generating x86_64 Intel Disassembly with GCC -S...');

    try {
      const res = await fetch('/api/c/assembly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, standard, optimization })
      });
      const data = await res.json();
      if (data.success && data.assembly) {
        setAssemblyOutput(data.assembly);
      } else {
        setAssemblyOutput(`[ASSEMBLY GENERATION ERROR]:\n${data.error || 'Failed to produce assembly.'}`);
      }
    } catch (err: any) {
      setAssemblyOutput(`[ERROR]: ${err.message}`);
    } finally {
      setIsCompilingAssembly(false);
    }
  };

  // AI Code Explanation & Debugging with Gemini
  const handleAnalyzeWithAI = async () => {
    if (!code.trim()) return;
    setIsAiLoading(true);
    setAiAnalysis('');

    try {
      const res = await fetch('/api/ai/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          category: 'C Programming',
          moduleName: 'Memory & Systems Architecture',
          language: 'C (GCC)',
          userId: user?.id
        })
      });

      const data = await res.json();
      if (data.aiExplanation) {
        setAiAnalysis(data.aiExplanation);
      } else {
        setAiAnalysis('Analysis completed. Review your pointer dereferences and buffer bounds.');
      }
    } catch (err: any) {
      setAiAnalysis(`AI Analysis temporarily unavailable: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/x-csrc' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplateId}.c`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              C Programming Dev IDE
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              GCC 12.3 Native Engine
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Write, compile, inspect memory pointers, and execute real C programs with native GCC compiler & assembler output
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* C Standard Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-gray-400">Std:</span>
            <select
              value={standard}
              onChange={e => setStandard(e.target.value as any)}
              className={`p-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                darkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <option value="c11">C11 (Standard)</option>
              <option value="c99">C99 (Legacy)</option>
              <option value="c17">C17 (Strict)</option>
            </select>
          </div>

          {/* Optimization Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-gray-400">Opt:</span>
            <select
              value={optimization}
              onChange={e => setOptimization(e.target.value as any)}
              className={`p-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                darkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <option value="O2">-O2 (Speed)</option>
              <option value="O0">-O0 (Debug)</option>
              <option value="O3">-O3 (Max)</option>
              <option value="Os">-Os (Size)</option>
            </select>
          </div>

          {/* Disassembly View Button */}
          <button
            onClick={handleGenerateAssembly}
            disabled={isCompilingAssembly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              viewMode === 'assembly'
                ? 'bg-purple-600 text-white shadow-xs'
                : darkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
            title="Compile to Intel Assembly"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>{isCompilingAssembly ? 'Assembling...' : 'ASM (x86_64)'}</span>
          </button>

          {/* Primary Run Button */}
          <button
            onClick={handleCompileAndRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
              isRunning
                ? 'bg-emerald-600 text-white opacity-80 cursor-wait'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'Compiling & Running...' : 'RUN PROGRAM (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Workspace: Sidebar Templates + Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Curriculum C Projects */}
        <div className="lg:col-span-1 space-y-3">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200 shadow-xs'} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Curriculum Projects
              </span>
              <span className="text-[10px] font-mono text-gray-400">{C_PROJECT_TEMPLATES.length} Projects</span>
            </div>

            <div className="space-y-1.5">
              {C_PROJECT_TEMPLATES.map(tmpl => {
                const isCurrent = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                      isCurrent
                        ? (darkMode ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold shadow-sm' : 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-sm')
                        : (darkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-gray-300' : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-700')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{tmpl.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                        tmpl.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                        tmpl.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {tmpl.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{tmpl.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-200 dark:border-white/10 space-y-1.5">
              <button
                onClick={handleAnalyzeWithAI}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Analyzing C Syntax...' : 'Explain / Debug with NIT AI'}</span>
              </button>
            </div>
          </div>

          {/* Quick Concept Cheatsheet */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200 shadow-xs'} space-y-2 text-xs`}>
            <span className="font-bold text-[11px] uppercase tracking-wider text-gray-400 block">
              Core C Syntax Reference
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between p-1 rounded bg-black/20 dark:bg-white/5">
                <span className="text-blue-400">&amp;var</span>
                <span className="text-gray-400">Address of variable</span>
              </div>
              <div className="flex justify-between p-1 rounded bg-black/20 dark:bg-white/5">
                <span className="text-blue-400">*ptr</span>
                <span className="text-gray-400">Dereference pointer</span>
              </div>
              <div className="flex justify-between p-1 rounded bg-black/20 dark:bg-white/5">
                <span className="text-blue-400">malloc(size)</span>
                <span className="text-gray-400">Allocate heap bytes</span>
              </div>
              <div className="flex justify-between p-1 rounded bg-black/20 dark:bg-white/5">
                <span className="text-blue-400">free(ptr)</span>
                <span className="text-gray-400">Deallocate heap memory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Editor + Multi-Tab Console */}
        <div className="lg:col-span-3 space-y-4">
          {/* Code Editor Container */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-slate-950 shadow-xl">
            {/* Editor Top Bar */}
            <div className="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-400">main.c</span>
                <span className="text-gray-500 text-[10px]">({code.split('\n').length} lines)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStdin(!showStdin)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    showStdin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'hover:bg-white/5 text-gray-400'
                  }`}
                  title="Toggle Standard Input (stdin)"
                >
                  <Sliders className="w-3 h-3" />
                  <span>stdin input</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Copy C Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Download .c file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleSelectTemplate(selectedTemplateId)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Reset to Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Optional Stdin Drawer */}
            {showStdin && (
              <div className="p-2.5 bg-slate-900/90 border-b border-white/10 animate-fade-in flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">stdin &gt;</span>
                <input
                  type="text"
                  placeholder="Provide standard inputs for scanf() or fgets() separated by space or newline..."
                  value={stdinInput}
                  onChange={e => setStdinInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            )}

            {/* Code Textarea with line numbers */}
            <div className="relative flex min-h-[360px] max-h-[500px] overflow-auto bg-[#0b0f19]">
              <div className="py-3 px-2 bg-[#090d16] text-gray-600 font-mono text-xs select-none text-right shrink-0 border-r border-white/5">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-relaxed px-1 text-[11px]">{i + 1}</div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleCompileAndRun();
                  }
                }}
                spellCheck={false}
                className="w-full h-full p-3 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* AI Analysis Box (if triggered) */}
          {aiAnalysis && (
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-purple-950/20 border-purple-500/20 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'} space-y-2 animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">NIT AI Code Explanation & Security Audit</span>
                </div>
                <button onClick={() => setAiAnalysis('')} className="cursor-pointer text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          )}

          {/* Compiler Warnings Banner (if any) */}
          {compilerWarnings && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs animate-fade-in">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Compiler Diagnostic Notices (-Wall -Wextra):</span>
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto text-[11px]">{compilerWarnings}</pre>
            </div>
          )}

          {/* Output Viewer: Multi-tab (Console / Assembly) */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-slate-950 shadow-lg">
            <div className="p-2 bg-slate-900 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('console')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'console'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Program Console Output</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('assembly');
                    if (!assemblyOutput) handleGenerateAssembly();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'assembly'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Binary className="w-3.5 h-3.5" />
                  <span>x86_64 Intel Disassembly</span>
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 text-[11px]">
                {executionTime !== null && (
                  <span className="font-mono text-gray-400">
                    ⏱️ {executionTime} ms
                  </span>
                )}
                {exitCode !== null && (
                  <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                    exitCode === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    exit: {exitCode}
                  </span>
                )}
                {consoleOutput && (
                  <button
                    onClick={() => {
                      setConsoleOutput('');
                      setCompilerWarnings('');
                      setExecutionTime(null);
                      setExitCode(null);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                    title="Clear Console"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Console Output Body */}
            {viewMode === 'console' && (
              <div className="p-4 bg-[#06090e] min-h-[160px] max-h-[300px] overflow-auto font-mono text-xs leading-relaxed text-gray-200">
                {consoleOutput ? (
                  <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                ) : (
                  <div className="text-gray-500 italic flex items-center gap-2 pt-2">
                    <Terminal className="w-4 h-4" />
                    <span>Click "RUN PROGRAM" or press Ctrl+Enter to compile with GCC and execute binary...</span>
                  </div>
                )}
                <div ref={consoleBottomRef} />
              </div>
            )}

            {/* Assembly Output Body */}
            {viewMode === 'assembly' && (
              <div className="p-4 bg-[#06090e] min-h-[180px] max-h-[360px] overflow-auto font-mono text-xs text-purple-300">
                <div className="text-[10px] text-gray-400 mb-2 border-b border-white/5 pb-1 flex justify-between">
                  <span>Target: x86_64 Linux ELF | Syntax: Intel (-masm=intel)</span>
                  <span>Compiler: GCC 12.3</span>
                </div>
                <pre className="whitespace-pre-wrap">{assemblyOutput || 'Generating disassembly...'}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
