import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Play, RotateCcw, Folder, File, ChevronRight, ChevronDown, 
  HelpCircle, CheckCircle, Shield, Laptop, Copy, Check, Maximize2, Minimize2, 
  Cpu, HardDrive, Activity, Eye, Edit3, X, Download
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  mtime: string;
  children?: Record<string, FileNode>;
}

interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: number;
  rss: number;
  stat: string;
  time: string;
  command: string;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  user: string;
  cwd: string;
  timestamp: string;
  isError?: boolean;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.4, vsz: 168400, rss: 12480, stat: 'Ss', time: '0:03', command: '/sbin/init' },
  { pid: 320, user: 'root', cpu: 0.0, mem: 0.2, vsz: 84200, rss: 6240, stat: 'Ss', time: '0:00', command: '/lib/systemd/systemd-journald' },
  { pid: 780, user: 'root', cpu: 0.0, mem: 0.1, vsz: 14200, rss: 3120, stat: 'Ss', time: '0:00', command: '/usr/sbin/cron -f' },
  { pid: 910, user: 'root', cpu: 0.0, mem: 0.3, vsz: 72100, rss: 8400, stat: 'Ss', time: '0:01', command: 'sshd: /usr/sbin/sshd -D' },
  { pid: 1412, user: 'root', cpu: 0.2, mem: 0.8, vsz: 142000, rss: 18400, stat: 'Ss', time: '0:02', command: 'nginx: master process /usr/sbin/nginx' },
  { pid: 1413, user: 'nginx', cpu: 0.4, mem: 0.6, vsz: 144500, rss: 14200, stat: 'S', time: '0:05', command: 'nginx: worker process' },
  { pid: 1840, user: 'student', cpu: 0.1, mem: 0.3, vsz: 22400, rss: 5120, stat: 'Ss', time: '0:01', command: '-bash' },
  { pid: 2104, user: 'student', cpu: 0.8, mem: 1.2, vsz: 88200, rss: 24500, stat: 'S', time: '0:04', command: 'python3 /home/student/health_check.py --monitor' },
];

const INITIAL_PACKAGES = ['coreutils', 'bash', 'grep', 'sed', 'systemd', 'nginx', 'python3', 'curl', 'openssh-server'];

function createDefaultFilesystem(): FileNode {
  return {
    name: '/',
    type: 'dir',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    size: 4096,
    mtime: 'Sep 29 07:00',
    children: {
      bin: {
        name: 'bin',
        type: 'dir',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        mtime: 'Sep 29 07:00',
        children: {
          bash: { name: 'bash', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 1248000, mtime: 'Sep 29 07:00' },
          sh: { name: 'sh', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 132000, mtime: 'Sep 29 07:00' },
          ls: { name: 'ls', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 142000, mtime: 'Sep 29 07:00' },
          cat: { name: 'cat', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 48000, mtime: 'Sep 29 07:00' },
          grep: { name: 'grep', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 215000, mtime: 'Sep 29 07:00' },
          pwd: { name: 'pwd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 38000, mtime: 'Sep 29 07:00' },
          mkdir: { name: 'mkdir', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 76000, mtime: 'Sep 29 07:00' },
          rm: { name: 'rm', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 72000, mtime: 'Sep 29 07:00' },
          echo: { name: 'echo', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 34000, mtime: 'Sep 29 07:00' },
          touch: { name: 'touch', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 78000, mtime: 'Sep 29 07:00' },
          ps: { name: 'ps', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 134000, mtime: 'Sep 29 07:00' },
          top: { name: 'top', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 182000, mtime: 'Sep 29 07:00' },
          df: { name: 'df', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 98000, mtime: 'Sep 29 07:00' },
          free: { name: 'free', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 42000, mtime: 'Sep 29 07:00' },
          uname: { name: 'uname', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 35000, mtime: 'Sep 29 07:00' },
          whoami: { name: 'whoami', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 32000, mtime: 'Sep 29 07:00' },
          python3: { name: 'python3', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 5800000, mtime: 'Sep 29 07:00' },
        }
      },
      etc: {
        name: 'etc',
        type: 'dir',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        mtime: 'Sep 29 07:00',
        children: {
          'os-release': {
            name: 'os-release',
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'root',
            size: 260,
            mtime: 'Sep 29 07:00',
            content: 'NAME="Ubuntu"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 24.04.1 LTS"\nVERSION_ID="24.04"\nHOME_URL="https://www.ubuntu.com/"'
          },
          hostname: {
            name: 'hostname',
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'root',
            size: 15,
            mtime: 'Sep 29 07:00',
            content: 'netlearn-srv01\n'
          },
          hosts: {
            name: 'hosts',
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'root',
            size: 180,
            mtime: 'Sep 29 07:00',
            content: '127.0.0.1\tlocalhost\n127.0.1.1\tnetlearn-srv01\n192.168.1.1\tgateway.corp.local\n192.168.1.100\tdns.corp.local\n'
          },
          passwd: {
            name: 'passwd',
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'root',
            size: 890,
            mtime: 'Sep 29 07:00',
            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nstudent:x:1000:1000:Student Joshua,,,:/home/student:/bin/bash\nnginx:x:101:101:nginx web server:/nonexistent:/bin/false\nsshd:x:102:65534::/run/sshd:/usr/sbin/nologin\n'
          },
          nginx: {
            name: 'nginx',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            mtime: 'Sep 29 07:00',
            children: {
              'nginx.conf': {
                name: 'nginx.conf',
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'root',
                group: 'root',
                size: 640,
                mtime: 'Sep 29 07:00',
                content: 'user nginx;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    sendfile on;\n    tcp_nopush on;\n    types_hash_max_size 2048;\n\n    server {\n        listen 80 default_server;\n        listen [::]:80 default_server;\n        server_name netlearn.internal;\n        root /var/www/html;\n        index index.html;\n\n        location / {\n            try_files $uri $uri/ =404;\n        }\n    }\n}\n'
              }
            }
          }
        }
      },
      var: {
        name: 'var',
        type: 'dir',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        mtime: 'Sep 29 07:00',
        children: {
          log: {
            name: 'log',
            type: 'dir',
            permissions: 'drwxrwxr-x',
            owner: 'root',
            group: 'syslog',
            size: 4096,
            mtime: 'Sep 29 07:00',
            children: {
              syslog: {
                name: 'syslog',
                type: 'file',
                permissions: '-rw-r-----',
                owner: 'syslog',
                group: 'adm',
                size: 2480,
                mtime: 'Sep 29 07:22',
                content: `Sep 29 07:15:01 netlearn-srv01 CRON[1204]: (root) CMD (test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily ))
Sep 29 07:18:22 netlearn-srv01 systemd[1]: Started Nginx High-Performance Web Server.
Sep 29 07:22:45 netlearn-srv01 sshd[1450]: Accepted publickey for student from 192.168.1.55 port 54220 ssh2
Sep 29 07:35:10 netlearn-srv01 kernel: [ 45.221] eth0: link up, 1000Mbps, full-duplex, lpa 0x05E1
Sep 29 07:40:02 netlearn-srv01 systemd[1]: Starting Network Time Synchronization...
Sep 29 07:40:05 netlearn-srv01 systemd[1]: Started Network Time Synchronization.
Sep 29 07:44:11 netlearn-srv01 sudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/systemctl status nginx`
              },
              nginx: {
                name: 'nginx',
                type: 'dir',
                permissions: 'drwxr-x---',
                owner: 'www-data',
                group: 'adm',
                size: 4096,
                mtime: 'Sep 29 07:20',
                children: {
                  'access.log': {
                    name: 'access.log',
                    type: 'file',
                    permissions: '-rw-r-----',
                    owner: 'www-data',
                    group: 'adm',
                    size: 1540,
                    mtime: 'Sep 29 07:28',
                    content: `192.168.1.45 - - [29/Sep/2026:07:20:12 +0000] "GET /index.html HTTP/1.1" 200 4523 "-" "Mozilla/5.0"
192.168.1.60 - - [29/Sep/2026:07:21:04 +0000] "GET /api/v1/health HTTP/1.1" 200 128 "-" "curl/8.5.0"
192.168.1.99 - - [29/Sep/2026:07:22:31 +0000] "GET /admin/config.php HTTP/1.1" 404 196 "-" "Python-urllib/3.10"
192.168.1.99 - - [29/Sep/2026:07:22:35 +0000] "GET /wp-login.php HTTP/1.1" 404 196 "-" "Python-urllib/3.10"
192.168.1.55 - - [29/Sep/2026:07:25:50 +0000] "GET /styles.css HTTP/1.1" 200 8920 "http://netlearn.internal/" "Mozilla/5.0"
192.168.1.88 - - [29/Sep/2026:07:27:14 +0000] "POST /api/telemetry HTTP/1.1" 201 44 "-" "IoT-Sensor-ESP32"
192.168.1.99 - - [29/Sep/2026:07:28:02 +0000] "GET /.env HTTP/1.1" 404 196 "-" "Python-urllib/3.10"`
                  },
                  'error.log': {
                    name: 'error.log',
                    type: 'file',
                    permissions: '-rw-r-----',
                    owner: 'www-data',
                    group: 'adm',
                    size: 620,
                    mtime: 'Sep 29 07:28',
                    content: `2026/09/29 07:22:31 [error] 1413#1413: *14 open() "/var/www/html/admin/config.php" failed (2: No such file or directory), client: 192.168.1.99, server: netlearn.internal
2026/09/29 07:22:35 [error] 1413#1413: *15 open() "/var/www/html/wp-login.php" failed (2: No such file or directory), client: 192.168.1.99, server: netlearn.internal
2026/09/29 07:28:02 [error] 1413#1413: *18 open() "/var/www/html/.env" failed (2: No such file or directory), client: 192.168.1.99, server: netlearn.internal`
                  }
                }
              }
            }
          },
          www: {
            name: 'www',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            mtime: 'Sep 29 07:00',
            children: {
              html: {
                name: 'html',
                type: 'dir',
                permissions: 'drwxr-xr-x',
                owner: 'root',
                group: 'root',
                size: 4096,
                mtime: 'Sep 29 07:00',
                children: {
                  'index.html': {
                    name: 'index.html',
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 340,
                    mtime: 'Sep 29 07:00',
                    content: '<!DOCTYPE html>\n<html>\n<head><title>NET LEARN Enterprise Web Node</title></head>\n<body>\n<h1>Nginx Web Server is Active</h1>\n<p>Ubuntu 24.04 LTS host node 01</p>\n</body>\n</html>'
                  }
                }
              }
            }
          }
        }
      },
      home: {
        name: 'home',
        type: 'dir',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        mtime: 'Sep 29 07:00',
        children: {
          student: {
            name: 'student',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            owner: 'student',
            group: 'student',
            size: 4096,
            mtime: 'Sep 29 07:25',
            children: {
              'welcome.txt': {
                name: 'welcome.txt',
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'student',
                group: 'student',
                size: 512,
                mtime: 'Sep 29 07:00',
                content: `========================================================
 Welcome to the NET LEARN Linux OS Terminal Simulator!
 Operating System: Ubuntu 24.04 LTS (x86_64 Linux 6.8)
========================================================

You have full shell access to this interactive virtual OS.
Try running standard Linux commands:
  • ls -la            - List directory files & permissions
  • pwd               - Print current working directory
  • cat welcome.txt   - Display file content
  • ./backup.sh       - Execute a shell script
  • ps aux            - View running background processes
  • df -h             - Inspect virtual disk space
  • free -m           - View RAM / memory usage
  • systemctl status nginx  - Check web server status
  • neofetch          - Display system hardware & OS stats
  • help              - View full command reference
`
              },
              'backup.sh': {
                name: 'backup.sh',
                type: 'file',
                permissions: '-rwxr-xr-x',
                owner: 'student',
                group: 'student',
                size: 280,
                mtime: 'Sep 29 07:10',
                content: `#!/bin/bash
echo "[BACKUP]: Initializing daily filesystem backup..."
echo "[BACKUP]: Target directory: /home/student/projects"
echo "[BACKUP]: Archiving data stream into /tmp/backup_2026.tar.gz"
echo "[BACKUP]: Verifying SHA256 integrity hash: 8f9b4c2... OK"
echo "[SUCCESS]: Backup completed successfully. 42KB compressed."
`
              },
              'health_check.py': {
                name: 'health_check.py',
                type: 'file',
                permissions: '-rwxr-xr-x',
                owner: 'student',
                group: 'student',
                size: 460,
                mtime: 'Sep 29 07:15',
                content: `import sys, time

print("[DIAGNOSTIC]: Starting Linux Server Health Check...")
time.sleep(0.5)
print("  ✓ CPU Cores: 4 vCPUs @ 2.80GHz (Load: 0.12)")
print("  ✓ Memory: 2.3 GB / 8.0 GB Used (5.7 GB Free)")
print("  ✓ Storage: /dev/sda1 18 GB / 50 GB Used (36%)")
print("  ✓ Network: eth0 link up, 1000Mbps full-duplex")
print("  ✓ Daemons: nginx (active), sshd (active), cron (active)")
print("[DIAGNOSTIC]: All systems operational and within standard tolerances.")
`
              },
              projects: {
                name: 'projects',
                type: 'dir',
                permissions: 'drwxr-xr-x',
                owner: 'student',
                group: 'student',
                size: 4096,
                mtime: 'Sep 29 07:10',
                children: {
                  'server_config.json': {
                    name: 'server_config.json',
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'student',
                    group: 'student',
                    size: 195,
                    mtime: 'Sep 29 07:10',
                    content: '{\n  "environment": "production",\n  "node": "netlearn-01",\n  "port": 8080,\n  "max_clients": 500,\n  "ssl_enabled": true\n}\n'
                  },
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'student',
                    group: 'student',
                    size: 120,
                    mtime: 'Sep 29 07:10',
                    content: '# Networking Lab Projects\nStudent hands-on workspace for bash scripts, python daemons, and system configurations.\n'
                  }
                }
              }
            }
          }
        }
      },
      tmp: {
        name: 'tmp',
        type: 'dir',
        permissions: 'drwxrwxrwt',
        owner: 'root',
        group: 'root',
        size: 4096,
        mtime: 'Sep 29 07:00',
        children: {
          'session_cache.tmp': {
            name: 'session_cache.tmp',
            type: 'file',
            permissions: '-rw-rw-r--',
            owner: 'student',
            group: 'student',
            size: 64,
            mtime: 'Sep 29 07:05',
            content: 'session_token=usr_student_active_session_4982\n'
          }
        }
      }
    }
  };
}

export default function LinuxSimulator({ 
  darkMode = true,
  embedded = false,
  onClose
}: { 
  darkMode?: boolean;
  embedded?: boolean;
  onClose?: () => void;
}) {
  const [fs, setFs] = useState<FileNode>(createDefaultFilesystem);
  const [cwd, setCwd] = useState<string>('/home/student');
  const [currentUser, setCurrentUser] = useState<'student' | 'root'>('student');
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'uname -a',
      output: 'Linux netlearn-srv01 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      user: 'student',
      cwd: '/home/student',
      timestamp: '07:20:00'
    },
    {
      id: 'init-2',
      command: 'cat /home/student/welcome.txt',
      output: `========================================================\n Welcome to the NET LEARN Linux OS Terminal Simulator!\n Operating System: Ubuntu 24.04 LTS (x86_64 Linux 6.8)\n========================================================\nType 'help' to inspect available system commands, or click any Lab Scenario below to start guided tasks!`,
      user: 'student',
      cwd: '/home/student',
      timestamp: '07:20:01'
    }
  ]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number>(-1);
  const [enteredCommands, setEnteredCommands] = useState<string[]>(['uname -a', 'cat /home/student/welcome.txt']);
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [installedPackages, setInstalledPackages] = useState<string[]>(INITIAL_PACKAGES);
  const [servicesStatus, setServicesStatus] = useState<Record<string, 'active' | 'inactive'>>({
    nginx: 'active',
    sshd: 'active',
    cron: 'active',
    mysql: 'inactive'
  });
  
  // Navigation & UI state
  const [viewTab, setViewTab] = useState<'terminal' | 'files' | 'processes' | 'scenarios'>('terminal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [scenarioCompleted, setScenarioCompleted] = useState<Record<string, boolean>>({});

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus terminal input on mount or tab change
  useEffect(() => {
    if (viewTab === 'terminal') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [viewTab]);

  // Resolve path helper
  const resolvePath = (targetPath: string, fromPath: string = cwd): string => {
    let cleanTarget = targetPath.trim();
    if (!cleanTarget) return fromPath;

    if (cleanTarget === '~' || cleanTarget.startsWith('~/')) {
      cleanTarget = `/home/student${cleanTarget.slice(1)}`;
    }

    let parts: string[];
    if (cleanTarget.startsWith('/')) {
      parts = cleanTarget.split('/').filter(Boolean);
    } else {
      const fromParts = fromPath.split('/').filter(Boolean);
      const targetParts = cleanTarget.split('/').filter(Boolean);
      parts = [...fromParts, ...targetParts];
    }

    const resolved: string[] = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  };

  // Find node in filesystem
  const findNode = (path: string, rootFs: FileNode = fs): FileNode | null => {
    if (path === '/' || path === '') return rootFs;
    const parts = path.split('/').filter(Boolean);
    let curr: FileNode = rootFs;

    for (const part of parts) {
      if (curr.type !== 'dir' || !curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  };

  // Command Execution Engine
  const executeCommandLine = (cmdLine: string) => {
    const trimmed = cmdLine.trim();
    if (!trimmed) return;

    // Add to history
    setEnteredCommands(prev => [...prev, trimmed]);
    setCommandHistoryIndex(-1);

    // Support pipes: cmd1 | cmd2 | cmd3
    if (trimmed.includes('|')) {
      executePipedCommands(trimmed);
      return;
    }

    // Support Redirections: > (overwrite) or >> (append)
    if (trimmed.includes('>') || trimmed.includes('>>')) {
      executeRedirection(trimmed);
      return;
    }

    const result = runSingleCommand(trimmed);

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}-${Math.random()}`,
        command: trimmed,
        output: result.output,
        user: currentUser,
        cwd,
        timestamp: new Date().toLocaleTimeString(),
        isError: result.isError
      }
    ]);

    // Check scenarios
    checkScenarioGoals(trimmed, result.output);
  };

  // Execute piped commands
  const executePipedCommands = (cmdLine: string) => {
    const pipeline = cmdLine.split('|').map(c => c.trim()).filter(Boolean);
    let intermediateOutput = '';
    let isError = false;

    for (let i = 0; i < pipeline.length; i++) {
      const segment = pipeline[i];
      const parts = segment.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      if (i === 0) {
        // First command produces initial output
        const res = runSingleCommand(segment);
        intermediateOutput = res.output;
        isError = res.isError || false;
        if (isError) break;
      } else {
        // Subsequent command takes intermediateOutput as stdin
        if (cmd === 'grep') {
          const ignoreCase = args.includes('-i');
          const invertMatch = args.includes('-v');
          const cleanArgs = args.filter(a => !a.startsWith('-'));
          const pattern = (cleanArgs[0] || '').replace(/['"]/g, '');
          
          if (!pattern) {
            intermediateOutput = 'grep: missing pattern';
            isError = true;
            break;
          }

          const lines = intermediateOutput.split('\n');
          const filtered = lines.filter(line => {
            const matches = ignoreCase 
              ? line.toLowerCase().includes(pattern.toLowerCase()) 
              : line.includes(pattern);
            return invertMatch ? !matches : matches;
          });
          intermediateOutput = filtered.join('\n');
        } else if (cmd === 'wc') {
          const lines = intermediateOutput ? intermediateOutput.split('\n').filter(Boolean).length : 0;
          const words = intermediateOutput ? intermediateOutput.split(/\s+/).filter(Boolean).length : 0;
          const bytes = intermediateOutput ? intermediateOutput.length : 0;

          if (args.includes('-l')) {
            intermediateOutput = `${lines}`;
          } else if (args.includes('-w')) {
            intermediateOutput = `${words}`;
          } else if (args.includes('-c')) {
            intermediateOutput = `${bytes}`;
          } else {
            intermediateOutput = `   ${lines}   ${words}   ${bytes}`;
          }
        } else if (cmd === 'head') {
          const n = parseInt(args[1] || '10', 10);
          intermediateOutput = intermediateOutput.split('\n').slice(0, isNaN(n) ? 10 : n).join('\n');
        } else if (cmd === 'tail') {
          const n = parseInt(args[1] || '10', 10);
          const allLines = intermediateOutput.split('\n');
          intermediateOutput = allLines.slice(Math.max(0, allLines.length - (isNaN(n) ? 10 : n))).join('\n');
        } else if (cmd === 'sort') {
          intermediateOutput = intermediateOutput.split('\n').sort().join('\n');
        } else {
          intermediateOutput = `bash: ${cmd}: command not supported in pipe simulation`;
          isError = true;
          break;
        }
      }
    }

    setHistory(prev => [
      ...prev,
      {
        id: `pipe-${Date.now()}`,
        command: cmdLine,
        output: intermediateOutput,
        user: currentUser,
        cwd,
        timestamp: new Date().toLocaleTimeString(),
        isError
      }
    ]);

    checkScenarioGoals(cmdLine, intermediateOutput);
  };

  // Execute redirection e.g. echo "text" > file.txt
  const executeRedirection = (cmdLine: string) => {
    const isAppend = cmdLine.includes('>>');
    const [leftPart, rightPart] = cmdLine.split(isAppend ? '>>' : '>').map(s => s.trim());
    if (!leftPart || !rightPart) {
      setHistory(prev => [...prev, {
        id: `err-${Date.now()}`,
        command: cmdLine,
        output: 'bash: syntax error near unexpected token `>`',
        user: currentUser,
        cwd,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      }]);
      return;
    }

    const commandRes = runSingleCommand(leftPart);
    const contentToWrite = commandRes.output;
    const targetFilePath = resolvePath(rightPart);

    // Write to virtual filesystem
    const parentPath = targetFilePath.substring(0, targetFilePath.lastIndexOf('/')) || '/';
    const fileName = targetFilePath.substring(targetFilePath.lastIndexOf('/') + 1);

    const parentNode = findNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir') {
      setHistory(prev => [...prev, {
        id: `err-${Date.now()}`,
        command: cmdLine,
        output: `bash: ${rightPart}: No such file or directory`,
        user: currentUser,
        cwd,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      }]);
      return;
    }

    setFs(prevFs => {
      const cloned = JSON.parse(JSON.stringify(prevFs));
      const targetParent = findNode(parentPath, cloned);
      if (targetParent && targetParent.children) {
        const existing = targetParent.children[fileName];
        if (existing) {
          existing.content = isAppend ? ((existing.content || '') + '\n' + contentToWrite) : contentToWrite;
          existing.size = (existing.content || '').length;
          existing.mtime = 'Sep 29 ' + new Date().toTimeString().slice(0, 5);
        } else {
          targetParent.children[fileName] = {
            name: fileName,
            type: 'file',
            permissions: '-rw-r--r--',
            owner: currentUser,
            group: currentUser,
            size: contentToWrite.length,
            mtime: 'Sep 29 ' + new Date().toTimeString().slice(0, 5),
            content: contentToWrite
          };
        }
      }
      return cloned;
    });

    setHistory(prev => [
      ...prev,
      {
        id: `redir-${Date.now()}`,
        command: cmdLine,
        output: '',
        user: currentUser,
        cwd,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Run a single command string
  const runSingleCommand = (cmdStr: string): { output: string; isError?: boolean } => {
    const rawTokens = cmdStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const tokens = rawTokens.map(t => t.replace(/^['"]|['"]$/g, ''));
    if (tokens.length === 0) return { output: '' };

    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case 'clear': {
        setHistory([]);
        return { output: '' };
      }

      case 'help': {
        return {
          output: `NET LEARN Linux Terminal Emulator (Ubuntu 24.04.1 LTS)
Common Available Commands:
  • Navigation & FS : ls, cd, pwd, cat, mkdir, touch, rm, cp, mv, echo, tree
  • Inspection & Logs: grep, head, tail, wc, nano, chmod, chown
  • System & Process: ps, top, kill, df, free, uptime, uname, whoami, id, hostname, date
  • Network & Admin : ping, ifconfig, ip, systemctl, service, apt, sudo, su, exit
  • Script Execution: python3 <script.py>, bash <script.sh>, ./<script>
  • I/O Features    : Pipelines (|), Redirection (> and >>), Tab completion, Up/Down history`
        };
      }

      case 'pwd': {
        return { output: cwd };
      }

      case 'whoami': {
        return { output: currentUser };
      }

      case 'id': {
        if (currentUser === 'root') {
          return { output: 'uid=0(root) gid=0(root) groups=0(root)' };
        }
        return { output: 'uid=1000(student) gid=1000(student) groups=1000(student),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)' };
      }

      case 'hostname': {
        return { output: 'netlearn-srv01' };
      }

      case 'date': {
        return { output: new Date().toUTCString() };
      }

      case 'uptime': {
        return { output: ` 07:48:32 up 4 days,  2:14,  1 user,  load average: 0.14, 0.08, 0.05` };
      }

      case 'uname': {
        if (args.includes('-a')) {
          return { output: 'Linux netlearn-srv01 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' };
        }
        if (args.includes('-r')) return { output: '6.8.0-31-generic' };
        if (args.includes('-m')) return { output: 'x86_64' };
        return { output: 'Linux' };
      }

      case 'cd': {
        const target = args[0] || '~';
        const newPath = resolvePath(target);
        const node = findNode(newPath);

        if (!node) {
          return { output: `bash: cd: ${target}: No such file or directory`, isError: true };
        }
        if (node.type !== 'dir') {
          return { output: `bash: cd: ${target}: Not a directory`, isError: true };
        }

        setCwd(newPath);
        return { output: '' };
      }

      case 'ls': {
        let showHidden = false;
        let showLong = false;
        let showHuman = false;
        const pathArgs: string[] = [];

        for (const arg of args) {
          if (arg.startsWith('-')) {
            if (arg.includes('a')) showHidden = true;
            if (arg.includes('l')) showLong = true;
            if (arg.includes('h')) showHuman = true;
          } else {
            pathArgs.push(arg);
          }
        }

        const targetPath = resolvePath(pathArgs[0] || '.');
        const node = findNode(targetPath);

        if (!node) {
          return { output: `ls: cannot access '${pathArgs[0] || '.'}': No such file or directory`, isError: true };
        }

        if (node.type === 'file') {
          if (showLong) {
            return { output: `${node.permissions} 1 ${node.owner} ${node.group} ${node.size} ${node.mtime} ${node.name}` };
          }
          return { output: node.name };
        }

        const entries = Object.values(node.children || {});
        const filtered = showHidden ? entries : entries.filter(e => !e.name.startsWith('.'));

        if (filtered.length === 0) return { output: '' };

        if (showLong) {
          const totalBlocks = Math.ceil(filtered.reduce((acc, f) => acc + f.size, 0) / 1024);
          const lines = [`total ${totalBlocks}`];
          filtered.forEach(item => {
            const sizeStr = showHuman && item.size > 1024 ? `${Math.round(item.size / 1024)}K` : `${item.size}`;
            lines.push(`${item.permissions} 1 ${item.owner} ${item.group} ${sizeStr.padStart(6)} ${item.mtime} ${item.name}${item.type === 'dir' ? '/' : ''}`);
          });
          return { output: lines.join('\n') };
        } else {
          return { output: filtered.map(e => e.name + (e.type === 'dir' ? '/' : '')).join('   ') };
        }
      }

      case 'cat': {
        if (args.length === 0) {
          return { output: 'cat: missing file operand' };
        }
        const outputs: string[] = [];
        for (const filePath of args) {
          const target = resolvePath(filePath);
          const node = findNode(target);
          if (!node) {
            return { output: `cat: ${filePath}: No such file or directory`, isError: true };
          }
          if (node.type === 'dir') {
            return { output: `cat: ${filePath}: Is a directory`, isError: true };
          }
          outputs.push(node.content || '');
        }
        return { output: outputs.join('\n') };
      }

      case 'echo': {
        return { output: args.join(' ') };
      }

      case 'mkdir': {
        const pFlag = args.includes('-p');
        const dirArgs = args.filter(a => !a.startsWith('-'));
        if (dirArgs.length === 0) {
          return { output: 'mkdir: missing operand', isError: true };
        }

        const targetPath = resolvePath(dirArgs[0]);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const newDirName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

        const parentNode = findNode(parentPath);
        if (!parentNode || parentNode.type !== 'dir') {
          if (!pFlag) {
            return { output: `mkdir: cannot create directory '${dirArgs[0]}': No such file or directory`, isError: true };
          }
        }

        setFs(prev => {
          const cloned = JSON.parse(JSON.stringify(prev));
          const p = findNode(parentPath, cloned);
          if (p && p.children) {
            p.children[newDirName] = {
              name: newDirName,
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: currentUser,
              group: currentUser,
              size: 4096,
              mtime: 'Sep 29 ' + new Date().toTimeString().slice(0, 5),
              children: {}
            };
          }
          return cloned;
        });

        return { output: '' };
      }

      case 'touch': {
        if (args.length === 0) return { output: 'touch: missing file operand', isError: true };
        const fileName = args[0];
        const targetPath = resolvePath(fileName);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const baseName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

        const parentNode = findNode(parentPath);
        if (!parentNode || parentNode.type !== 'dir') {
          return { output: `touch: cannot touch '${fileName}': No such file or directory`, isError: true };
        }

        setFs(prev => {
          const cloned = JSON.parse(JSON.stringify(prev));
          const p = findNode(parentPath, cloned);
          if (p && p.children) {
            if (p.children[baseName]) {
              p.children[baseName].mtime = 'Sep 29 ' + new Date().toTimeString().slice(0, 5);
            } else {
              p.children[baseName] = {
                name: baseName,
                type: 'file',
                permissions: '-rw-r--r--',
                owner: currentUser,
                group: currentUser,
                size: 0,
                content: '',
                mtime: 'Sep 29 ' + new Date().toTimeString().slice(0, 5)
              };
            }
          }
          return cloned;
        });

        return { output: '' };
      }

      case 'rm': {
        const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-R');
        const targetNames = args.filter(a => !a.startsWith('-'));
        if (targetNames.length === 0) return { output: 'rm: missing operand', isError: true };

        const target = resolvePath(targetNames[0]);
        if (target === '/' || target === '/bin' || target === '/etc') {
          return { output: `rm: it is dangerous to operate recursively on '${target}' (blocked by safety shield)`, isError: true };
        }

        const parentPath = target.substring(0, target.lastIndexOf('/')) || '/';
        const baseName = target.substring(target.lastIndexOf('/') + 1);

        const targetNode = findNode(target);
        if (!targetNode) {
          if (args.includes('-f') || args.includes('-rf')) return { output: '' };
          return { output: `rm: cannot remove '${targetNames[0]}': No such file or directory`, isError: true };
        }

        if (targetNode.type === 'dir' && !recursive) {
          return { output: `rm: cannot remove '${targetNames[0]}': Is a directory`, isError: true };
        }

        setFs(prev => {
          const cloned = JSON.parse(JSON.stringify(prev));
          const p = findNode(parentPath, cloned);
          if (p && p.children) {
            delete p.children[baseName];
          }
          return cloned;
        });

        return { output: '' };
      }

      case 'tree': {
        const target = resolvePath(args[0] || '.');
        const node = findNode(target);
        if (!node) return { output: `tree: '${args[0] || '.'}': No such file or directory`, isError: true };
        
        const renderTree = (n: FileNode, prefix = ''): string[] => {
          const lines: string[] = [];
          const entries = Object.values(n.children || {});
          entries.forEach((e, idx) => {
            const isLast = idx === entries.length - 1;
            const branch = isLast ? '└── ' : '├── ';
            lines.push(`${prefix}${branch}${e.name}${e.type === 'dir' ? '/' : ''}`);
            if (e.type === 'dir') {
              lines.push(...renderTree(e, prefix + (isLast ? '    ' : '│   ')));
            }
          });
          return lines;
        };

        const resultLines = [target, ...renderTree(node)];
        return { output: resultLines.join('\n') };
      }

      case 'chmod': {
        if (args.length < 2) return { output: 'chmod: missing operand', isError: true };
        const mode = args[0];
        const targetPath = resolvePath(args[1]);
        const node = findNode(targetPath);
        if (!node) return { output: `chmod: cannot access '${args[1]}': No such file or directory`, isError: true };

        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const baseName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

        setFs(prev => {
          const cloned = JSON.parse(JSON.stringify(prev));
          const p = findNode(parentPath, cloned);
          if (p && p.children && p.children[baseName]) {
            if (mode === '+x') {
              p.children[baseName].permissions = p.children[baseName].permissions.replace(/-/g, 'x');
            } else if (mode === '755') {
              p.children[baseName].permissions = '-rwxr-xr-x';
            } else if (mode === '644') {
              p.children[baseName].permissions = '-rw-r--r--';
            }
          }
          return cloned;
        });

        return { output: '' };
      }

      case 'ps': {
        if (args.includes('aux') || args.includes('-ef')) {
          const header = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
          const rows = processes.map(p => 
            `${p.user.padEnd(8)} ${p.pid.toString().padStart(5)}  ${p.cpu.toFixed(1)}  ${p.mem.toFixed(1)} ${p.vsz.toString().padStart(6)} ${p.rss.toString().padStart(5)} ?        ${p.stat.padEnd(4)} 07:15   ${p.time.padStart(4)} ${p.command}`
          );
          return { output: [header, ...rows].join('\n') };
        }
        return {
          output: `  PID TTY          TIME CMD\n 1840 pts/0    00:00:01 bash\n 2410 pts/0    00:00:00 ps`
        };
      }

      case 'top':
      case 'htop': {
        return {
          output: `top - 07:49:10 up 4 days,  2:14,  1 user,  load average: 0.12, 0.08, 0.05
Tasks:  8 total,   1 running,   7 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.4 us,  1.1 sy,  0.0 ni, 96.2 id,  0.2 wa,  0.0 hi,  0.1 si
MiB Mem :   8192.0 total,   5640.2 free,   2240.8 used,    311.0 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5720.5 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1412 root      20   0  142000  18400   8200 S   0.8   0.2   0:02.14 nginx
 2104 student   20   0   88200  24500  12100 S   0.5   0.3   0:04.88 python3
  910 root      20   0   72100   8400   6100 S   0.0   0.1   0:01.05 sshd
    1 root      20   0  168400  12480   8900 S   0.0   0.2   0:03.12 systemd`
        };
      }

      case 'kill': {
        if (args.length === 0) return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...', isError: true };
        const pid = parseInt(args[0], 10);
        if (isNaN(pid)) return { output: `kill: ${args[0]}: arguments must be process or job IDs`, isError: true };

        const proc = processes.find(p => p.pid === pid);
        if (!proc) return { output: `kill: (${pid}) - No such process`, isError: true };
        if (proc.pid === 1) return { output: `kill: (${pid}) - Operation not permitted (cannot kill init process)`, isError: true };

        setProcesses(prev => prev.filter(p => p.pid !== pid));
        return { output: `[SYSTEM]: Process ${pid} (${proc.command}) terminated.` };
      }

      case 'df': {
        return {
          output: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 18874368  33554432  36% /
tmpfs            4194304        0   4194304   0% /dev/shm
tmpfs            1048576      128   1048448   1% /run
/dev/sda2        1048576   124928    923648  12% /boot`
        };
      }

      case 'free': {
        const unit = args.includes('-m') ? 'MiB' : args.includes('-g') ? 'GiB' : 'total';
        return {
          output: `               total        used        free      shared  buff/cache   available
Mem:            8192        2240        5640          32         312        5720
Swap:           2048           0        2048`
        };
      }

      case 'systemctl':
      case 'service': {
        const action = args[0];
        const serviceName = args[1] || 'nginx';

        if (action === 'status') {
          const isActive = servicesStatus[serviceName] === 'active';
          return {
            output: `● ${serviceName}.service - High Performance Web Server and Reverse Proxy
     Loaded: loaded (/lib/systemd/system/${serviceName}.service; enabled; vendor preset: enabled)
     Active: ${isActive ? 'active (running)' : 'inactive (dead)'} since Sun 2026-09-29 07:18:22 UTC
    Process: 1412 ExecStart=/usr/sbin/${serviceName} (code=exited, status=0/SUCCESS)
   Main PID: 1412 (${serviceName})
      Tasks: 2 (limit: 9482)
     Memory: 32.6M
        CPU: 184ms
     CGroup: /system.slice/${serviceName}.service
             ├─1412 nginx: master process /usr/sbin/nginx
             └─1413 nginx: worker process`
          };
        } else if (action === 'restart' || action === 'start') {
          setServicesStatus(prev => ({ ...prev, [serviceName]: 'active' }));
          return { output: `[OK] Service '${serviceName}' restarted successfully.` };
        } else if (action === 'stop') {
          setServicesStatus(prev => ({ ...prev, [serviceName]: 'inactive' }));
          return { output: `[OK] Service '${serviceName}' stopped.` };
        }
        return { output: `systemctl: command syntax: systemctl [status|start|stop|restart] <service>` };
      }

      case 'ifconfig':
      case 'ip': {
        return {
          output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::5054:ff:fe12:3456  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)
        RX packets 145902  bytes 128491024 (128.4 MB)
        TX packets 98402   bytes 89201402 (89.2 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`
        };
      }

      case 'ping': {
        const host = args[0] || '8.8.8.8';
        return {
          output: `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=118 time=12.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=118 time=11.8 ms
64 bytes from ${host}: icmp_seq=3 ttl=118 time=13.1 ms
64 bytes from ${host}: icmp_seq=4 ttl=118 time=12.0 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 11.821/12.332/13.104/0.490 ms`
        };
      }

      case 'apt':
      case 'apt-get': {
        const sub = args[0];
        if (sub === 'update') {
          return {
            output: `Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]
Get:3 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]
Fetched 252 kB in 1s (248 kB/s)
Reading package lists... Done
Building dependency tree... Done
All 142 packages are up to date.`
          };
        } else if (sub === 'install') {
          const pkg = args[1];
          if (!pkg) return { output: 'apt: missing package name', isError: true };
          if (currentUser !== 'root') {
            return { output: 'E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)\nE: Unable to acquire the dpkg frontend lock, are you root?', isError: true };
          }
          setInstalledPackages(prev => [...prev, pkg]);
          return {
            output: `Reading package lists... Done
Building dependency tree... Done
Suggested packages: ${pkg}-doc
The following NEW packages will be installed:
  ${pkg}
0 upgraded, 1 newly installed, 0 to remove.
Need to get 148 kB of archives.
Unpacking ${pkg} (amd64)...
Setting up ${pkg} ...
Processing triggers for man-db...`
          };
        }
        return { output: `apt: usage: apt [update | install <pkg>]` };
      }

      case 'sudo': {
        if (args.length === 0) return { output: 'usage: sudo command' };
        if (args[0] === '-s' || args[0] === 'su' || args[0] === '-i') {
          setCurrentUser('root');
          return { output: '[sudo]: root shell opened. Welcome Superuser.' };
        }
        // Run with root privileges
        const subCmd = args.join(' ');
        const prevUser = currentUser;
        setCurrentUser('root');
        const res = runSingleCommand(subCmd);
        setCurrentUser(prevUser);
        return res;
      }

      case 'su': {
        setCurrentUser('root');
        return { output: 'Switched to root.' };
      }

      case 'exit': {
        if (currentUser === 'root') {
          setCurrentUser('student');
          return { output: 'exit: logged out from root' };
        }
        return { output: 'Terminal session cannot be terminated. Type clear to wipe logs.' };
      }

      case 'neofetch': {
        return {
          output: `
       _,met$$$$$gg.          student@netlearn-srv01
    ,g$$$$$$$$$$$$$$$P.       ----------------------
  ,g$$P"        """Y$$.".     OS: Ubuntu 24.04.1 LTS x86_64
 ,$$P'              \`$$$.    Host: NetLearn Cloud Hypervisor
',$$P       ,ggs.     \`$$b:  Kernel: 6.8.0-31-generic
\`d$$'     ,$P"'   .    $$$   Uptime: 4 days, 2 hours, 14 mins
 $$P      d$'     ,    $$P    Packages: ${installedPackages.length} (dpkg)
 $$:      $$.   -    ,d$$'    Shell: bash 5.2.21
 $$;      Y$b._   _,d$P'      Terminal: xterm-256color
 Y$$.    \`."Y$$$$P"'          CPU: AMD EPYC 7763 (4) @ 2.800GHz
  \`$$b      "-.__             Memory: 2240MiB / 8192MiB (27%)
   \`Y$$                       Disk (/): 18G / 50G (36%)
    \`$$b.
`
        };
      }

      case 'python3':
      case 'python': {
        if (args.length === 0) {
          return {
            output: `Python 3.12.3 (main, Feb  4 2026, 14:48:19) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n(Use the dedicated Python Runner tab for interactive multiline coding!)`
          };
        }

        const scriptPath = resolvePath(args[0]);
        const node = findNode(scriptPath);
        if (!node) {
          return { output: `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`, isError: true };
        }
        if (node.type === 'dir') {
          return { output: `python3: error: '${args[0]}' is a directory`, isError: true };
        }

        // Execute script content simulation
        const content = node.content || '';
        if (args[0].includes('health_check.py')) {
          return {
            output: `[DIAGNOSTIC]: Starting Linux Server Health Check...
  ✓ CPU Cores: 4 vCPUs @ 2.80GHz (Load: 0.12)
  ✓ Memory: 2.3 GB / 8.0 GB Used (5.7 GB Free)
  ✓ Storage: /dev/sda1 18 GB / 50 GB Used (36%)
  ✓ Network: eth0 link up, 1000Mbps full-duplex
  ✓ Daemons: nginx (active), sshd (active), cron (active)
[DIAGNOSTIC]: All systems operational and within standard tolerances.`
          };
        }

        // Simple script parsing
        const printLines: string[] = [];
        const lines = content.split('\n');
        for (const l of lines) {
          const match = l.match(/print\s*\(\s*f?["'](.*?)["']\s*\)/);
          if (match) {
            printLines.push(match[1]);
          }
        }

        return {
          output: printLines.length > 0 ? printLines.join('\n') : `[PYTHON3]: Executed ${node.name} successfully.`
        };
      }

      case 'bash':
      case 'sh': {
        if (args.length === 0) return { output: '' };
        const scriptPath = resolvePath(args[0]);
        const node = findNode(scriptPath);
        if (!node) return { output: `bash: ${args[0]}: No such file or directory`, isError: true };
        
        return {
          output: node.content || `[BASH]: Script ${node.name} finished with return code 0.`
        };
      }

      case 'nano': {
        const filePath = resolvePath(args[0] || 'untitled.txt');
        const node = findNode(filePath);
        setEditingFile({
          path: filePath,
          name: args[0] || 'untitled.txt',
          content: node?.content || ''
        });
        return { output: `[NANO]: Opened editor for ${args[0] || 'untitled.txt'}` };
      }

      default: {
        // Check if executable file like ./backup.sh
        if (cmd.startsWith('./') || cmd.endsWith('.sh')) {
          const scriptName = cmd.replace('./', '');
          const node = findNode(resolvePath(scriptName));
          if (node) {
            if (!node.permissions.includes('x')) {
              return { output: `bash: ${cmd}: Permission denied (run 'chmod +x ${scriptName}' first)`, isError: true };
            }
            return {
              output: node.content || `[BASH]: Executed ${scriptName} successfully.`
            };
          }
          return { output: `bash: ${cmd}: No such file or directory`, isError: true };
        }

        return { output: `bash: ${cmd}: command not found. Type 'help' to see list of available commands.`, isError: true };
      }
    }
  };

  // Scenario check helper
  const checkScenarioGoals = (cmd: string, output: string) => {
    const c = cmd.toLowerCase();
    if (c.includes('cat /var/log/nginx/access.log') && c.includes('grep 404')) {
      setScenarioCompleted(prev => ({ ...prev, 'log_forensics': true }));
    }
    if (c.includes('chmod +x') && c.includes('backup.sh')) {
      setScenarioCompleted(prev => ({ ...prev, 'chmod_lab': true }));
    }
    if (c.includes('systemctl status nginx') || c.includes('systemctl restart nginx')) {
      setScenarioCompleted(prev => ({ ...prev, 'service_mgmt': true }));
    }
    if (c.includes('ps aux') || c.includes('top')) {
      setScenarioCompleted(prev => ({ ...prev, 'process_mgmt': true }));
    }
    if (c.includes('pwd') && c.includes('cd')) {
      setScenarioCompleted(prev => ({ ...prev, 'navigation': true }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommandLine(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (enteredCommands.length === 0) return;
      const nextIndex = commandHistoryIndex === -1 ? enteredCommands.length - 1 : Math.max(0, commandHistoryIndex - 1);
      setCommandHistoryIndex(nextIndex);
      setCommandInput(enteredCommands[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (enteredCommands.length === 0 || commandHistoryIndex === -1) return;
      const nextIndex = commandHistoryIndex + 1;
      if (nextIndex >= enteredCommands.length) {
        setCommandHistoryIndex(-1);
        setCommandInput('');
      } else {
        setCommandHistoryIndex(nextIndex);
        setCommandInput(enteredCommands[nextIndex] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const tokens = commandInput.split(' ');
      const lastToken = tokens[tokens.length - 1];
      if (tokens.length === 1) {
        const availableCmds = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'grep', 'ps', 'top', 'df', 'free', 'uname', 'whoami', 'systemctl', 'python3', 'neofetch', 'chmod', 'clear', 'help'];
        const matched = availableCmds.find(c => c.startsWith(lastToken));
        if (matched) setCommandInput(matched + ' ');
      } else {
        const currentNode = findNode(cwd);
        if (currentNode && currentNode.children) {
          const files = Object.keys(currentNode.children);
          const matched = files.find(f => f.startsWith(lastToken));
          if (matched) {
            tokens[tokens.length - 1] = matched;
            setCommandInput(tokens.join(' '));
          }
        }
      }
    }
  };

  // Reset entire filesystem to factory defaults
  const handleResetOS = () => {
    setFs(createDefaultFilesystem());
    setCwd('/home/student');
    setCurrentUser('student');
    setProcesses(INITIAL_PROCESSES);
    setHistory([
      {
        id: `reset-${Date.now()}`,
        command: '# SYSTEM REBOOT & FACTORY RESET',
        output: 'System reset completed. Ubuntu 24.04 virtual filesystem reloaded.',
        user: 'system',
        cwd: '/home/student',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const promptSymbol = currentUser === 'root' ? '#' : '$';
  const displayCwd = cwd.replace('/home/student', '~');

  return (
    <div className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full shadow-lg'
    } ${
      darkMode ? 'bg-[#0f171e] border-white/10 text-slate-100' : 'bg-slate-900 border-slate-700 text-slate-100'
    }`}>
      {/* 1. TOP TITLEBAR */}
      <div className="bg-[#15202b] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 pl-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-gray-200">
              NET LEARN Linux OS Emulator (Ubuntu 24.04 LTS)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-semibold hidden sm:inline-block">
              ● Active Node: netlearn-srv01
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick tab switcher */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/5 text-[11px] font-mono">
            <button
              onClick={() => setViewTab('terminal')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewTab === 'terminal' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setViewTab('files')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewTab === 'files' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Filesystem
            </button>
            <button
              onClick={() => setViewTab('processes')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewTab === 'processes' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Processes
            </button>
            <button
              onClick={() => setViewTab('scenarios')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewTab === 'scenarios' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Guided Labs
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-400 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResetOS}
            className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-400 hover:text-amber-400 cursor-pointer"
            title="Reset Filesystem to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 cursor-pointer"
              title="Close Simulator"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-BAR LAB QUICK BUTTONS */}
      <div className="bg-[#111922] px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs overflow-x-auto scrollbar-thin gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <span className="text-gray-400">Quick Commands:</span>
          {[
            { label: 'ls -la', cmd: 'ls -la' },
            { label: 'ps aux', cmd: 'ps aux' },
            { label: 'free -m', cmd: 'free -m' },
            { label: 'df -h', cmd: 'df -h' },
            { label: 'cat welcome.txt', cmd: 'cat welcome.txt' },
            { label: './backup.sh', cmd: './backup.sh' },
            { label: 'systemctl status nginx', cmd: 'systemctl status nginx' },
            { label: 'neofetch', cmd: 'neofetch' },
            { label: 'help', cmd: 'help' }
          ].map(btn => (
            <button
              key={btn.cmd}
              onClick={() => {
                executeCommandLine(btn.cmd);
                setViewTab('terminal');
              }}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-gray-300 border border-white/5 transition-all cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 shrink-0">
          <span>User: <strong className="text-emerald-400">{currentUser}</strong></span>
          <span>Path: <strong className="text-cyan-400">{displayCwd}</strong></span>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 min-h-[460px] max-h-[640px] flex flex-col relative overflow-hidden bg-black/90">
        
        {/* VIEW 1: INTERACTIVE TERMINAL */}
        {viewTab === 'terminal' && (
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 cursor-text scrollbar-thin"
          >
            {history.map((item) => (
              <div key={item.id} className="space-y-1">
                {item.command && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-emerald-400 font-bold">
                      {item.user}@netlearn-linux
                    </span>
                    <span className="text-gray-500">:</span>
                    <span className="text-cyan-400 font-semibold">
                      {item.cwd.replace('/home/student', '~')}
                    </span>
                    <span className="text-emerald-400 font-bold">{item.user === 'root' ? '#' : '$'}</span>
                    <span className="text-white font-medium">{item.command}</span>
                  </div>
                )}
                {item.output && (
                  <pre className={`whitespace-pre-wrap leading-relaxed pl-2 ${
                    item.isError ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {item.output}
                  </pre>
                )}
              </div>
            ))}

            {/* Live active command input row */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-emerald-400 font-bold">
                {currentUser}@netlearn-linux
              </span>
              <span className="text-gray-500">:</span>
              <span className="text-cyan-400 font-semibold">
                {displayCwd}
              </span>
              <span className="text-emerald-400 font-bold">{promptSymbol}</span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs caret-emerald-400"
                placeholder="type command (e.g. ls, cat, ps aux, ./backup.sh, help)..."
                autoFocus
                spellCheck={false}
              />
            </div>
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* VIEW 2: VISUAL FILESYSTEM EXPLORER */}
        {viewTab === 'files' && (
          <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-gray-200">Virtual Linux Filesystem Hierarchy Standard (FHS)</span>
              </div>
              <span className="text-[10px] text-gray-400">Click any file to view content or edit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Directory Tree Explorer */}
              <div className="col-span-1 p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2 max-h-[380px] overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Directories</span>
                {['/', '/bin', '/etc', '/etc/nginx', '/var/log', '/var/log/nginx', '/home/student', '/home/student/projects', '/tmp'].map(dirPath => (
                  <button
                    key={dirPath}
                    onClick={() => {
                      setCwd(dirPath);
                      setViewTab('terminal');
                      executeCommandLine(`ls -la ${dirPath}`);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-all cursor-pointer ${
                      cwd === dirPath ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <span className="truncate">{dirPath}</span>
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  </button>
                ))}
              </div>

              {/* Current Directory Content Grid */}
              <div className="col-span-2 p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3 max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">Listing: {cwd}</span>
                  <button
                    onClick={() => {
                      setViewTab('terminal');
                      executeCommandLine(`ls -la ${cwd}`);
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 cursor-pointer"
                  >
                    Open in Terminal &gt;
                  </button>
                </div>

                <div className="space-y-1">
                  {Object.values(findNode(cwd)?.children || {}).map(item => (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (item.type === 'dir') {
                          setCwd(resolvePath(item.name));
                        } else {
                          setEditingFile({
                            path: `${cwd}/${item.name}`,
                            name: item.name,
                            content: item.content || ''
                          });
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.type === 'dir' ? (
                          <Folder className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <File className="w-4 h-4 text-emerald-400" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-200">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.permissions} • {item.owner}:{item.group}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {item.size} B
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: PROCESS MANAGEMENT MONITOR */}
        {viewTab === 'processes' && (
          <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-gray-200">Active Linux Daemon & Process Table (ps aux)</span>
              </div>
              <span className="text-[10px] text-gray-400">Total: {processes.length} Processes</span>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#15202b] text-[10px] text-gray-400 uppercase tracking-wider border-b border-white/10">
                    <th className="p-2.5">PID</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">CPU %</th>
                    <th className="p-2.5">Mem %</th>
                    <th className="p-2.5">Command</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {processes.map(p => (
                    <tr key={p.pid} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-bold text-cyan-400">{p.pid}</td>
                      <td className="p-2.5 text-gray-300">{p.user}</td>
                      <td className="p-2.5 text-gray-400">{p.cpu}%</td>
                      <td className="p-2.5 text-gray-400">{p.mem}%</td>
                      <td className="p-2.5 text-emerald-300 truncate max-w-[200px]">{p.command}</td>
                      <td className="p-2.5 text-right">
                        {p.pid !== 1 ? (
                          <button
                            onClick={() => {
                              executeCommandLine(`kill ${p.pid}`);
                              setViewTab('terminal');
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 cursor-pointer"
                          >
                            kill
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-600">protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: GUIDED HANDS-ON LAB SCENARIOS */}
        {viewTab === 'scenarios' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div>
              <h3 className="font-display font-black text-sm text-gray-100">
                Interactive Hands-on Linux Lab Missions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete real system administration tasks using standard commands and pipeline redirections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {[
                {
                  id: 'navigation',
                  title: '1. Filesystem Navigation & Directory Audit',
                  desc: 'Use pwd and cd to navigate between home and /var/log directories.',
                  task: 'Run: cd /var/log && pwd && ls -la',
                  cmd: 'cd /var/log'
                },
                {
                  id: 'log_forensics',
                  title: '2. Nginx Web Log Forensic Investigation',
                  desc: 'Search for 404 client errors in the live web server access logs using grep and pipes.',
                  task: 'Run: cat /var/log/nginx/access.log | grep 404',
                  cmd: 'cat /var/log/nginx/access.log | grep 404'
                },
                {
                  id: 'chmod_lab',
                  title: '3. Shell Script Permissions & Execution',
                  desc: 'Grant executable bit permissions to backup.sh and run the script.',
                  task: 'Run: chmod +x /home/student/backup.sh && /home/student/backup.sh',
                  cmd: 'chmod +x /home/student/backup.sh'
                },
                {
                  id: 'service_mgmt',
                  title: '4. Systemd Service Control & Audit',
                  desc: 'Inspect the status of the Nginx web server daemon and restart it.',
                  task: 'Run: systemctl status nginx',
                  cmd: 'systemctl status nginx'
                },
                {
                  id: 'process_mgmt',
                  title: '5. Process Telemetry & Diagnostics',
                  desc: 'Audit CPU load, inspect running python daemons, and run hardware neofetch.',
                  task: 'Run: ps aux && neofetch',
                  cmd: 'ps aux'
                }
              ].map(scenario => {
                const isDone = scenarioCompleted[scenario.id];
                return (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-slate-950 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-gray-200">{scenario.title}</h4>
                      {isDone ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                          <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-400">PENDING</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
                      {scenario.desc}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <code className="text-[10px] font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded">
                        {scenario.task}
                      </code>
                      <button
                        onClick={() => {
                          executeCommandLine(scenario.cmd);
                          setViewTab('terminal');
                        }}
                        className="px-2.5 py-1 rounded bg-brand-primary hover:bg-brand-primary-hover text-white text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                      >
                        Execute Step &gt;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 4. MODAL FILE EDITOR (NANO EMULATION) */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#121921] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[85vh]">
            <div className="px-4 py-2.5 bg-[#18232e] border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> GNU nano 7.2 — File: {editingFile.name}
              </span>
              <button
                onClick={() => setEditingFile(null)}
                className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              rows={16}
              className="p-4 bg-slate-950 text-gray-100 font-mono text-xs focus:outline-none resize-none scrollbar-thin"
              placeholder="Edit file contents..."
            />

            <div className="p-3 bg-[#15202b] border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Path: {editingFile.path}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingFile(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const target = resolvePath(editingFile.path);
                    const parentPath = target.substring(0, target.lastIndexOf('/')) || '/';
                    const baseName = target.substring(target.lastIndexOf('/') + 1);

                    setFs(prev => {
                      const cloned = JSON.parse(JSON.stringify(prev));
                      const p = findNode(parentPath, cloned);
                      if (p && p.children && p.children[baseName]) {
                        p.children[baseName].content = editingFile.content;
                        p.children[baseName].size = editingFile.content.length;
                        p.children[baseName].mtime = 'Sep 29 ' + new Date().toTimeString().slice(0, 5);
                      }
                      return cloned;
                    });

                    setHistory(prev => [
                      ...prev,
                      {
                        id: `save-${Date.now()}`,
                        command: `nano ${editingFile.name}`,
                        output: `[NANO]: File '${editingFile.name}' written (${editingFile.content.length} bytes).`,
                        user: currentUser,
                        cwd,
                        timestamp: new Date().toLocaleTimeString()
                      }
                    ]);

                    setEditingFile(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Save File (Ctrl+O)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOTER STATUS BAR */}
      <div className="bg-[#121b22] px-4 py-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> CPU: 2.4% (4 cores)
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> RAM: 2.2 / 8.0 GB
          </span>
          <span className="hidden md:inline text-gray-600">|</span>
          <span className="hidden md:inline">Shell: /bin/bash (UTF-8)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">Press Enter to run • Tab to autocomplete • Up/Down for history</span>
        </div>
      </div>
    </div>
  );
}
