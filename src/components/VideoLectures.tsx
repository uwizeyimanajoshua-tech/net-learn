import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, 
  CheckCircle2, Clock, BookOpen, Search, Filter, 
  ExternalLink, Sparkles, MessageSquare, ChevronRight,
  Bookmark, Check, Copy, Share2, Plus, X, MonitorPlay,
  Layers, Shield, Server, Terminal, Cpu, Radio, Network, Download
} from 'lucide-react';
import { CategoryName } from '../types.js';

export interface VideoLecture {
  id: string;
  title: string;
  category: CategoryName | string;
  duration: string;
  durationSec: number;
  instructor: string;
  views: string;
  youtubeId: string;
  fallbackVideoUrl?: string;
  thumbnailUrl?: string;
  description: string;
  chapters: Array<{ time: string; seconds: number; title: string }>;
  keyCommands?: Array<{ label: string; command: string; note: string }>;
  takeaways: string[];
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const DEFAULT_LECTURES: VideoLecture[] = [
  {
    id: 'vid_1',
    title: 'OSI 7-Layer Model Architecture & Protocol Encapsulation',
    category: 'Networking',
    duration: '18:45',
    durationSec: 1125,
    instructor: 'Joshua Uwizeyimana (Lead Examiner)',
    views: '4.8K views',
    youtubeId: 'vv4y_uOneC0', // NetworkChuck / CCNA OSI Model
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    description: 'Master the fundamental architecture of computer networks through the OSI 7-layer model. Learn how data moves from application payloads down to physical bits across Ethernet cables and optical fibers.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Introduction to OSI & Why Layering Matters' },
      { time: '03:15', seconds: 195, title: 'Layers 7-5: Application, Presentation, Session' },
      { time: '07:30', seconds: 450, title: 'Layer 4: Transport (TCP vs UDP Ports & Sockets)' },
      { time: '11:10', seconds: 670, title: 'Layer 3: Network (IP Addressing & Routing)' },
      { time: '14:40', seconds: 880, title: 'Layers 2-1: Data Link (MACs, Frames) & Physical (Bits)' },
      { time: '17:00', seconds: 1020, title: 'Data Encapsulation & Decapsulation PDU Summary' }
    ],
    keyCommands: [
      { label: 'Inspect active socket connections', command: 'ss -tulpn', note: 'View Layer 4 TCP/UDP listening ports on Linux' },
      { label: 'Check IP route mapping', command: 'ip route show', note: 'Inspect Layer 3 IPv4 gateway routing table' },
      { label: 'View physical interface MAC', command: 'ip link show', note: 'Check Layer 2 hardware address (MAC)' }
    ],
    takeaways: [
      'Layer 4 PDU is a Segment; Layer 3 PDU is a Packet; Layer 2 PDU is a Frame; Layer 1 is Bits.',
      'Routers operate primarily at Layer 3 (IP); standard Switches operate at Layer 2 (MAC).',
      'Encapsulation prepends protocol headers down the stack; decapsulation strips them on reception.'
    ],
    quizQuestion: {
      question: 'Which Layer of the OSI model is responsible for logical IP addressing and packet routing across Autonomous Systems?',
      options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
      correctIndex: 1,
      explanation: 'Layer 3 (Network Layer) manages logical IP addressing (IPv4/IPv6) and path determination (routing) between different networks.'
    }
  },
  {
    id: 'vid_2',
    title: 'Cisco Router Configuration & VLAN Subnetting (CCNA Lab)',
    category: 'Networking',
    duration: '24:30',
    durationSec: 1470,
    instructor: 'Instructor Joshua Uwizeyimana',
    views: '6.2K views',
    youtubeId: 'H8W9oMNSuwo', // NetworkChuck VLANs
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    description: 'Practical Cisco IOS laboratory on VLAN configuration, 802.1Q trunking, Router-on-a-Stick inter-VLAN routing, and broadcast containment for enterprise networks.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'VLAN Fundamentals & Broadcast Domains' },
      { time: '04:10', seconds: 250, title: 'Creating VLANs on Cisco Catalyst Switches' },
      { time: '09:20', seconds: 560, title: 'Configuring 802.1Q Trunk Ports & Native VLAN' },
      { time: '14:45', seconds: 885, title: 'Router-on-a-Stick Subinterface Configuration' },
      { time: '19:30', seconds: 1170, title: 'Verification with ping & show vlan brief' },
      { time: '22:15', seconds: 1335, title: 'Common Troubleshooting & Mismatched Native VLAN' }
    ],
    keyCommands: [
      { label: 'Create VLAN in Cisco IOS', command: 'vlan 10\n name Staff\nexit', note: 'Defines VLAN ID 10 with descriptive name' },
      { label: 'Assign access port', command: 'interface f0/1\n switchport mode access\n switchport access vlan 10', note: 'Binds switchport to VLAN' },
      { label: 'Configure 802.1Q trunk', command: 'interface g0/1\n switchport mode trunk', note: 'Enables trunking for all VLAN tags' },
      { label: 'Router subinterface', command: 'interface g0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0', note: 'Router-on-a-Stick gateway' }
    ],
    takeaways: [
      'VLANs break large physical broadcast domains into smaller, secure logical broadcast domains.',
      'Trunk links use IEEE 802.1Q tags (4-byte tag with 12-bit VLAN ID) to multiplex multiple VLANs over a single cable.',
      'Inter-VLAN routing requires a Layer 3 router (Router-on-a-Stick) or a Layer 3 multilayer switch with SVIs.'
    ],
    quizQuestion: {
      question: 'Which Cisco IOS command configures 802.1Q trunk encapsulation on a router subinterface for VLAN 20?',
      options: ['switchport trunk vlan 20', 'encapsulation dot1Q 20', 'vlan encapsulation 802.1q 20', 'ip route vlan 20'],
      correctIndex: 1,
      explanation: 'On a Cisco router subinterface (e.g. g0/0.20), you must execute "encapsulation dot1Q 20" before an IP address can be bound.'
    }
  },
  {
    id: 'vid_3',
    title: 'Linux Filesystem Hierarchy, Permissions & Bash Shell Mastery',
    category: 'Linux',
    duration: '21:10',
    durationSec: 1270,
    instructor: 'Eric S. (Senior Linux Systems Admin)',
    views: '3.9K views',
    youtubeId: 'wBp0Rb-ZJak', // freeCodeCamp Linux for beginners
    thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
    description: 'Deep dive into the Linux Filesystem Hierarchy Standard (FHS), understanding /etc, /var, /proc, and mastering octal permissions, chown, systemd service management, and pipes.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Linux Filesystem Hierarchy Standard (FHS)' },
      { time: '03:40', seconds: 220, title: 'Navigating & Manipulating Files (cd, ls, mkdir, cp, rm)' },
      { time: '07:50', seconds: 470, title: 'Linux Permissions: rwx, Octal (755, 644), chmod & chown' },
      { time: '12:20', seconds: 740, title: 'Systemd Administration: systemctl start, stop, enable' },
      { time: '16:45', seconds: 1005, title: 'Pipes, Redirection, grep & awk Text Processing' },
      { time: '19:30', seconds: 1170, title: 'Practical System Administration Verification' }
    ],
    keyCommands: [
      { label: 'Set standard web root permissions', command: 'chmod -R 755 /var/www/html && chown -R www-data:www-data /var/www/html', note: 'Owner rwx, Group/Other r-x' },
      { label: 'Enable & start daemon service', command: 'sudo systemctl enable --now nginx', note: 'Configures autostart on system boot' },
      { label: 'Filter running processes with pipe', command: 'ps aux | grep -i "ssh"', note: 'Pipes process listing into regex filter' }
    ],
    takeaways: [
      'Linux treats everything as a file, including block devices (/dev), kernel status (/proc), and system configs (/etc).',
      'Octal permissions: Read = 4, Write = 2, Execute = 1. A permission of 754 means rwxr-xr--.',
      'Systemd units control daemons, targets, and sockets; use systemctl and journalctl for inspection.'
    ],
    quizQuestion: {
      question: 'What permission code allows the owner to read/write/execute, the group to read/execute, and others read-only?',
      options: ['755', '754', '644', '777'],
      correctIndex: 1,
      explanation: 'Owner: 4+2+1 = 7. Group: 4+1 = 5. Others: 4 = 4. The octal code is 754.'
    }
  },
  {
    id: 'vid_4',
    title: 'Active Directory Domain Setup & Group Policy in Windows Server',
    category: 'Window Server',
    duration: '26:50',
    durationSec: 1610,
    instructor: 'Kevin M. (Windows Server Specialist)',
    views: '2.7K views',
    youtubeId: '9y-3iP8zWpU', // Windows Server Active Directory
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    description: 'Comprehensive installation and configuration of Active Directory Domain Services (AD DS) on Windows Server 2016/2022. Configure Forest Root Domains, DNS zones, DHCP scopes, and apply Group Policy Objects (GPOs).',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Active Directory Architecture & Kerberos/LDAP' },
      { time: '04:15', seconds: 255, title: 'Installing AD DS, DNS & DHCP Roles via Server Manager' },
      { time: '09:30', seconds: 570, title: 'Promoting Server to a Domain Controller (Forest Root)' },
      { time: '14:50', seconds: 890, title: 'Creating Organizational Units (OUs), Users & Security Groups' },
      { time: '19:40', seconds: 1180, title: 'Configuring Group Policy Objects (GPO Password Policy)' },
      { time: '23:30', seconds: 1410, title: 'PowerShell Management Cmdlets & Verification' }
    ],
    keyCommands: [
      { label: 'Install AD DS & DNS Roles via PowerShell', command: 'Install-WindowsFeature -Name AD-Domain-Services, DNS -IncludeManagementTools', note: 'Installs AD DS role and admin tools' },
      { label: 'Create new Forest Root Domain', command: 'Install-ADDSForest -DomainName "joshnet.local" -InstallDns:$true', note: 'Promotes server to Primary DC' },
      { label: 'Force immediate GPO refresh', command: 'gpupdate /force', note: 'Applies new group policies immediately' }
    ],
    takeaways: [
      'Active Directory Domain Services (AD DS) provides centralized authentication via Kerberos v5 and directory lookup via LDAP.',
      'DNS is critically required for Active Directory to locate Domain Controllers using SRV resource records.',
      'Group Policy Objects (GPOs) apply configurations hierarchically from Local, Site, Domain, down to Organizational Unit (OU).'
    ],
    quizQuestion: {
      question: 'Which DNS resource record type does Active Directory depend on to help client computers discover Domain Controllers?',
      options: ['A (Address) Record', 'SRV (Service) Record', 'CNAME (Canonical) Record', 'MX (Mail) Record'],
      correctIndex: 1,
      explanation: 'Active Directory relies on SRV (Service) records (e.g., _ldap._tcp.dc._msdcs.<domain>) for clients to locate Domain Controllers.'
    }
  },
  {
    id: 'vid_5',
    title: 'Cybersecurity Fundamentals: CIA Triad, Firewalls & Defense in Depth',
    category: 'Cyber Security',
    duration: '20:15',
    durationSec: 1215,
    instructor: 'Eng. Neza Mugabo (Certified Security Analyst)',
    views: '5.1K views',
    youtubeId: 'inWWhr5tnEA', // freeCodeCamp Cybersecurity Course
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    description: 'Explore enterprise cybersecurity architecture. Understand Confidentiality, Integrity, and Availability (CIA Triad), stateful packet inspection firewalls, cryptographic algorithms (AES-256 vs RSA), and defense-in-depth methodologies.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'The CIA Triad Security Model' },
      { time: '03:50', seconds: 230, title: 'Cryptography: Symmetric (AES), Asymmetric (RSA) & Hashing' },
      { time: '08:15', seconds: 495, title: 'Network Security: Firewalls, IDS/IPS & DMZ Architecture' },
      { time: '12:40', seconds: 760, title: 'Common Attack Vectors: MITM, Phishing, DDoS & SQLi' },
      { time: '16:30', seconds: 990, title: 'Defense-in-Depth Implementation Checklist' },
      { time: '18:50', seconds: 1130, title: 'Security Incident Response & Forensic Basics' }
    ],
    keyCommands: [
      { label: 'Configure Linux UFW firewall', command: 'sudo ufw default deny incoming\nsudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable', note: 'Applies zero-trust ingress filtering' },
      { label: 'Compute SHA-256 hash for integrity', command: 'sha256sum document.pdf', note: 'Verifies file has not been altered' },
      { label: 'Scan open listening ports with nmap', command: 'nmap -sS -p 1-1000 192.168.1.1', note: 'SYN stealth port inspection' }
    ],
    takeaways: [
      'Confidentiality protects data from unauthorized disclosure (encryption, access controls).',
      'Integrity verifies data has not been modified or corrupted (cryptographic hashing, HMAC, digital signatures).',
      'Availability ensures authorized users have timely access to resources (redundancy, failover clusters, DDoS mitigation).'
    ],
    quizQuestion: {
      question: 'Which cryptographic mechanism provides non-repudiation and proves that a message was originated by a specific sender without modification?',
      options: ['Symmetric AES-256 Encryption', 'Digital Signature (Asymmetric Private Key + Hash)', 'Base64 Encoding', 'Diffie-Hellman Key Exchange'],
      correctIndex: 1,
      explanation: 'A Digital Signature uses the sender\'s private key to sign a cryptographic hash of the message, providing authentication, integrity, and non-repudiation.'
    }
  },
  {
    id: 'vid_6',
    title: 'Python for Network Automation & Machine Learning Pipeline',
    category: 'Programming',
    duration: '22:40',
    durationSec: 1360,
    instructor: 'Joshua Uwizeyimana',
    views: '3.4K views',
    youtubeId: '7eh4d6sabA0', // Python Machine Learning
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
    description: 'Learn modern Python programming tailored for technical engineers. Connect to routers with Netmiko/SSH, parse telemetry data with regular expressions, and build automated machine learning preprocessing pipelines.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Python Technical Foundations & Virtual Environments' },
      { time: '04:20', seconds: 260, title: 'Network Automation with Netmiko & Paramiko SSH' },
      { time: '09:15', seconds: 555, title: 'Parsing Router Configuration Output with Regex' },
      { time: '14:00', seconds: 840, title: 'Data Preprocessing with Pandas & NumPy' },
      { time: '18:30', seconds: 1110, title: 'Building a Scikit-Learn Classification Model' },
      { time: '21:00', seconds: 1260, title: 'Production Best Practices & Error Handling' }
    ],
    keyCommands: [
      { label: 'Install network automation dependencies', command: 'pip install netmiko pandas scikit-learn', note: 'Installs automation packages' },
      { label: 'Run automation script', command: 'python3 network_audit.py --host 192.168.1.1', note: 'Executes programmatic audit' }
    ],
    takeaways: [
      'Network automation replaces error-prone manual CLI commands with repeatable programmatic scripts.',
      'Netmiko simplifies SSH connections to Cisco IOS, Arista EOS, and Juniper Junos devices.',
      'Data pre-processing is 80% of machine learning: handle null values, scale features, and encode categorical data.'
    ],
    quizQuestion: {
      question: 'Which Python library is purpose-built for multi-vendor network device SSH CLI automation?',
      options: ['Flask', 'Netmiko', 'PyQt', 'Matplotlib'],
      correctIndex: 1,
      explanation: 'Netmiko is a multi-vendor Python library built on top of Paramiko specifically designed to automate CLI interactions with networking hardware.'
    }
  },
  {
    id: 'vid_7',
    title: 'IPv4 Subnetting Mastery: Fast CIDR Calculations (/24 to /30)',
    category: 'Networking',
    duration: '19:15',
    durationSec: 1155,
    instructor: 'Instructor Joshua Uwizeyimana',
    views: '7.1K views',
    youtubeId: 's_NATH6cbpg', // Subnetting Made Easy
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    description: 'Master binary to decimal conversion, calculate usable hosts, determine network and broadcast addresses in under 30 seconds for Cisco CCNA and TVET national certification exams.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Understanding IPv4 Structure & Subnet Masks' },
      { time: '03:30', seconds: 210, title: 'The Magic Number Method for Instant Subnetting' },
      { time: '08:00', seconds: 480, title: 'Calculating /25, /26, /27, and /28 Subnets' },
      { time: '12:30', seconds: 750, title: 'Point-to-Point WAN Links (/30 and /31)' },
      { time: '16:00', seconds: 960, title: 'Exam Speed Drill: 5 Practice Problems' }
    ],
    keyCommands: [
      { label: 'Calculate subnet in Linux', command: 'ipcalc 192.168.10.65/26', note: 'Displays network, broadcast, and host range' }
    ],
    takeaways: [
      'Formula for total addresses: 2^(host bits). Usable hosts = 2^(host bits) - 2.',
      'A /28 mask has 4 host bits: 2^4 = 16 total addresses, with 14 usable hosts.',
      'The Magic Number is 256 minus the non-zero octet of the subnet mask.'
    ],
    quizQuestion: {
      question: 'How many usable host IP addresses are available in a /29 IPv4 subnet?',
      options: ['4 hosts', '6 hosts', '8 hosts', '14 hosts'],
      correctIndex: 1,
      explanation: '32 - 29 = 3 host bits. Total addresses = 2^3 = 8. Subtracting 2 (network ID & broadcast) gives 6 usable hosts.'
    }
  },
  {
    id: 'vid_8',
    title: 'Fiber Optics Fundamentals: Cabling, Splicing & OTDR Testing',
    category: 'Fiber Optics',
    duration: '17:30',
    durationSec: 1050,
    instructor: 'Eng. Eric Munyaneza (Optical Specialist)',
    views: '2.1K views',
    youtubeId: '0MwMkBET_5I', // Fiber Optics Fundamentals
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    description: 'Principles of optical transmission: Single-mode (SMF) vs Multi-mode (MMF) fiber, total internal reflection, fusion splicing techniques, and analyzing Optical Time-Domain Reflectometer (OTDR) trace logs.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Optical Light Transmission & Core/Cladding' },
      { time: '03:40', seconds: 220, title: 'Single-Mode vs Multi-Mode Fiber Characteristics' },
      { time: '07:20', seconds: 440, title: 'Fiber Connectors: LC, SC, ST & Polish Angles (PC/APC)' },
      { time: '11:15', seconds: 675, title: 'Fusion Splicing Safety & Precision Cleaving' },
      { time: '14:50', seconds: 890, title: 'OTDR Trace Analysis & Loss Budget Calculation' }
    ],
    keyCommands: [
      { label: 'Check optical transceiver levels on Cisco switch', command: 'show interfaces g0/1 transceiver detail', note: 'Inspects dBm optical transmit/receive power' }
    ],
    takeaways: [
      'Single-Mode Fiber (9µm core) uses laser light for long-haul transmission with minimal modal dispersion.',
      'Multi-Mode Fiber (50µm or 62.5µm core) uses LEDs/VCSELs for short-range campus backbone links.',
      'Angled Physical Contact (APC) connectors have an 8-degree angle to minimize optical return loss (ORL).'
    ],
    quizQuestion: {
      question: 'What is the typical core diameter of Single-Mode Optical Fiber (SMF)?',
      options: ['9 micrometers (µm)', '50 micrometers (µm)', '62.5 micrometers (µm)', '125 micrometers (µm)'],
      correctIndex: 0,
      explanation: 'Single-Mode Fiber has a very small core of approximately 8 to 10 µm (typically 9 µm), which allows only a single ray or mode of light to propagate.'
    }
  }
];

interface VideoLecturesProps {
  darkMode?: boolean;
  onNavigateToTab?: (tab: string, category?: CategoryName, docId?: string, query?: string) => void;
  user?: any;
}

export default function VideoLectures({ darkMode = false, onNavigateToTab, user }: VideoLecturesProps) {
  const [lectures, setLectures] = useState<VideoLecture[]>(() => {
    try {
      const saved = localStorage.getItem('netlearn_custom_lectures');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...DEFAULT_LECTURES, ...parsed.filter(p => !DEFAULT_LECTURES.some(d => d.id === p.id))];
        }
      }
    } catch (_) {}
    return DEFAULT_LECTURES;
  });

  const [activeLectureId, setActiveLectureId] = useState<string>(DEFAULT_LECTURES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('netlearn_completed_videos');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return ['vid_1'];
  });
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('netlearn_bookmarked_videos');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  // Player controls state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'notes' | 'chapters' | 'quiz' | 'commands'>('notes');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New lecture form state (for admin)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryName>('Networking');
  const [newYoutubeId, setNewYoutubeId] = useState('');
  const [newInstructor, setNewInstructor] = useState('Instructor Joshua');
  const [newDuration, setNewDuration] = useState('15:00');
  const [newDescription, setNewDescription] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentLecture = lectures.find(v => v.id === activeLectureId) || lectures[0];

  // Sync completion with localStorage and server progress
  const toggleCompleted = async (videoId: string) => {
    const isCompleted = completedVideos.includes(videoId);
    let updated: string[];
    if (isCompleted) {
      updated = completedVideos.filter(id => id !== videoId);
    } else {
      updated = [...completedVideos, videoId];
    }
    setCompletedVideos(updated);
    localStorage.setItem('netlearn_completed_videos', JSON.stringify(updated));

    // Save progress to server if logged in
    if (user?.id) {
      try {
        await fetch('/api/student/progress/study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, docId: videoId })
        });
      } catch (e) {
        console.warn('Progress sync warning:', e);
      }
    }
  };

  const toggleBookmark = (videoId: string) => {
    const isBookmarked = bookmarkedVideos.includes(videoId);
    const updated = isBookmarked
      ? bookmarkedVideos.filter(id => id !== videoId)
      : [...bookmarkedVideos, videoId];
    setBookmarkedVideos(updated);
    localStorage.setItem('netlearn_bookmarked_videos', JSON.stringify(updated));
  };

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSeekChapter = (seconds: number) => {
    // Post message to YouTube iframe to seek
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        '*'
      );
    }
  };

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newYoutubeId.trim()) return;

    // Clean YouTube ID if full link was provided
    let cleanId = newYoutubeId.trim();
    if (cleanId.includes('youtube.com/watch?v=')) {
      cleanId = cleanId.split('watch?v=')[1]?.split('&')[0] || cleanId;
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1]?.split('?')[0] || cleanId;
    }

    const newLecture: VideoLecture = {
      id: `vid_custom_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      duration: newDuration || '15:00',
      durationSec: 900,
      instructor: newInstructor || 'JoshNet Elearning Faculty',
      views: '100 views',
      youtubeId: cleanId,
      description: newDescription || 'Academic lecture session at JoshNet Elearning.',
      chapters: [
        { time: '00:00', seconds: 0, title: 'Lecture Introduction' },
        { time: '05:00', seconds: 300, title: 'Main Topic & Core Concepts' },
        { time: '10:00', seconds: 600, title: 'Hands-On Demonstration & Summary' }
      ],
      takeaways: [
        'Review the key concepts presented in this technical lecture.',
        'Practice related CLI commands in the interactive simulation terminal.'
      ]
    };

    const updated = [newLecture, ...lectures];
    setLectures(updated);
    setActiveLectureId(newLecture.id);
    localStorage.setItem('netlearn_custom_lectures', JSON.stringify([newLecture]));
    setShowAddModal(false);
    setNewTitle('');
    setNewYoutubeId('');
    setNewDescription('');
  };

  // Filter lectures
  const filteredLectures = lectures.filter(v => {
    const matchesCategory = selectedCategory === 'All' || v.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() || 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Networking', 'Wide Area Network', 'Linux', 'Window Server', 'Cyber Security', 'Programming', 'Fiber Optics'];

  return (
    <div className="space-y-6 animate-fade-in text-left pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <h1 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Academic Video Lectures
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Official recorded lecture series, Cisco packet tracer demonstrations, and technical masterclasses
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-600 dark:text-teal-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedVideos.length} of {lectures.length} Completed ({Math.round((completedVideos.length / lectures.length) * 100)}%)</span>
          </div>

          {/* Add Lecture Button (Admin only) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Playback Theater */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Video Player & Tabbed Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Box */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black shadow-xl">
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
              {currentLecture.youtubeId ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  src={`https://www.youtube-nocookie.com/embed/${currentLecture.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                  title={currentLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                  <Play className="w-12 h-12 text-teal-400 mb-3" />
                  <p className="text-sm font-bold">Interactive Lecture Stream</p>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    Direct high-definition technical tutorial streaming for {currentLecture.title}
                  </p>
                </div>
              )}
            </div>

            {/* Video Action Bar */}
            <div className={`p-4 flex flex-wrap items-center justify-between gap-3 border-t ${
              darkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCompleted(currentLecture.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    completedVideos.includes(currentLecture.id)
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedVideos.includes(currentLecture.id) ? 'Completed' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={() => toggleBookmark(currentLecture.id)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    bookmarkedVideos.includes(currentLecture.id)
                      ? 'bg-amber-500/10 text-amber-500'
                      : darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                  title={bookmarkedVideos.includes(currentLecture.id) ? 'Remove Bookmark' : 'Bookmark Lecture'}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedVideos.includes(currentLecture.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Ask NIT AI Tutor Shortcut */}
              <button
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('ai_chat', undefined, undefined, `Can you explain the key concepts and lab steps from the lecture "${currentLecture.title}"?`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask NIT AI about this Lecture</span>
              </button>
            </div>
          </div>

          {/* Current Video Details & Navigation Tabs */}
          <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200 shadow-xs'} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                {currentLecture.category}
              </span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {currentLecture.duration}
                </span>
                <span>•</span>
                <span>{currentLecture.views}</span>
                <span>•</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">{currentLecture.instructor}</span>
              </div>
            </div>

            <h2 className={`font-display text-lg sm:text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLecture.title}
            </h2>

            <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentLecture.description}
            </p>

            {/* Navigation Tabs (Notes, Commands, Chapters, Quiz) */}
            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'notes', label: 'Key Takeaways & Notes', icon: BookOpen },
                  { id: 'chapters', label: 'Timeline & Chapters', icon: Clock },
                  { id: 'commands', label: 'Terminal Commands', icon: Terminal },
                  { id: 'quiz', label: 'Knowledge Check', icon: Sparkles }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        activeTab === t.id
                          ? 'bg-teal-500 text-white shadow-xs'
                          : darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="mt-4">
                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Essential Curriculum Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {currentLecture.takeaways.map((note, i) => (
                        <li key={i} className={`flex items-start gap-2.5 text-xs p-3 rounded-xl border ${
                          darkMode ? 'bg-white/[0.02] border-white/5 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'chapters' && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Click to Jump to Chapter Timestamp
                    </h3>
                    <div className="space-y-1.5">
                      {currentLecture.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSeekChapter(ch.seconds)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                            darkMode 
                              ? 'bg-white/[0.02] border-white/5 hover:bg-white/10 text-gray-200' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Play className="w-3.5 h-3.5 text-teal-500" />
                            <span>{ch.title}</span>
                          </div>
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                            {ch.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'commands' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Ready-to-Run Laboratory Commands
                    </h3>
                    {currentLecture.keyCommands && currentLecture.keyCommands.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentLecture.keyCommands.map((cmd, i) => (
                          <div key={i} className={`p-3 rounded-xl border ${
                            darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-900 border-slate-800 text-white'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-teal-400">{cmd.label}</span>
                              <button
                                onClick={() => handleCopyCommand(cmd.command, i)}
                                className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                              >
                                {copiedIndex === i ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap p-2 rounded bg-black/40">
                              {cmd.command}
                            </pre>
                            <p className="text-[10px] text-gray-400 mt-1 italic">{cmd.note}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No command sequence attached for this theoretical module.</p>
                    )}
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-3">
                    {currentLecture.quizQuestion ? (
                      <div className={`p-4 rounded-xl border ${
                        darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'
                      } space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            Retention Check Question
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currentLecture.quizQuestion.question}
                        </p>

                        <div className="space-y-1.5">
                          {currentLecture.quizQuestion.options.map((opt, optIdx) => {
                            const isSelected = quizAnswer === optIdx;
                            const isCorrect = optIdx === currentLecture.quizQuestion!.correctIndex;
                            let style = darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-200';
                            
                            if (showQuizResult) {
                              if (isCorrect) style = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold';
                              else if (isSelected && !isCorrect) style = 'bg-red-500/20 border-red-500/40 text-red-600 dark:text-red-400';
                            } else if (isSelected) {
                              style = 'bg-teal-500 text-white font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  setQuizAnswer(optIdx);
                                  setShowQuizResult(true);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl text-xs border transition cursor-pointer flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {showQuizResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResult && (
                          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 leading-relaxed mt-2 animate-fade-in">
                            <strong>Explanation: </strong> {currentLecture.quizQuestion.explanation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No retention check attached for this session.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Playlist & Lecture Library */}
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-elegant-card border-white/5' : 'bg-white border-gray-200 shadow-xs'} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-display text-sm font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Academy Video Playlist
              </h3>
              <span className="text-xs text-gray-400 font-semibold">{filteredLectures.length} Videos</span>
            </div>

            {/* Search Input */}
            <div className={`relative flex items-center px-3 py-1.5 rounded-xl border text-xs ${
              darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search lectures, topics, commands..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none placeholder-gray-400 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                  <X className="w-3 h-3 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-500 text-white shadow-xs'
                      : darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Video List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredLectures.map(lecture => {
                const isCurrent = lecture.id === currentLecture.id;
                const isCompleted = completedVideos.includes(lecture.id);

                return (
                  <div
                    key={lecture.id}
                    onClick={() => {
                      setActiveLectureId(lecture.id);
                      setQuizAnswer(null);
                      setShowQuizResult(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isCurrent
                        ? (darkMode ? 'bg-teal-500/15 border-teal-500/40 text-white shadow-sm' : 'bg-teal-50 border-teal-300 text-gray-900 shadow-sm')
                        : (darkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-gray-300' : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-700')
                    }`}
                  >
                    {/* Thumbnail representation */}
                    <div className="relative aspect-video w-24 shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                      {lecture.thumbnailUrl ? (
                        <img 
                          src={lecture.thumbnailUrl} 
                          alt={lecture.title}
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-teal-400">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className={`p-1.5 rounded-full ${isCurrent ? 'bg-teal-500 text-white' : 'bg-black/60 text-white'}`}>
                          <Play className="w-2.5 h-2.5 fill-current" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-[8px] font-mono font-bold text-white rounded">
                        {lecture.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 truncate">
                            {lecture.category}
                          </span>
                          {isCompleted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <h4 className={`text-xs font-bold line-clamp-2 leading-snug mt-0.5 ${
                          isCurrent ? 'text-teal-700 dark:text-teal-300 font-extrabold' : ''
                        }`}>
                          {lecture.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span className="truncate">{lecture.instructor.split(' ')[0]}</span>
                        <span>{lecture.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredLectures.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">
                  No video lectures match your search query. Try another keyword or filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Add Custom Lecture Modal (Admin only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 text-left animate-fade-in ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-display font-black text-lg">Add Academic Video Lecture</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddLecture} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-bold block mb-1">Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco OSPF Multi-Area Configuration & LSA Types"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Curriculum Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="Networking">Networking</option>
                    <option value="Linux">Linux</option>
                    <option value="Window Server">Window Server</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Programming">Programming</option>
                    <option value="Fiber Optics">Fiber Optics</option>
                    <option value="Machine Learning">Machine Learning</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    placeholder="20:30"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">YouTube Video ID or Full Link *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vv4y_uOneC0 or https://www.youtube.com/watch?v=..."
                  value={newYoutubeId}
                  onChange={e => setNewYoutubeId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Paste the 11-character YouTube video ID or the direct YouTube URL.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Instructor Name</label>
                <input
                  type="text"
                  placeholder="Instructor Joshua Uwizeyimana"
                  value={newInstructor}
                  onChange={e => setNewInstructor(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Lecture Summary & Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Describe the topics, protocols, and hands-on laboratory exercises covered in this lecture."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save & Publish Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
