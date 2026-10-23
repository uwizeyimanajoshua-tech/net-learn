const fs = require('fs');
const path = require('path');

function svgUri(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
}

// 1. Server Hardware & RAID Architecture SVG
const raidAndHardwareSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0f172a; font-family:system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
  </defs>

  <!-- Title Banner -->
  <rect x="20" y="20" width="810" height="50" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="52" fill="#38bdf8" font-size="18" font-weight="bold">Figure 1.2: Server Hardware Specifications &amp; RAID Topologies</text>
  <text x="680" y="50" fill="#94a3b8" font-size="12">TVET Rwanda NITWA401</text>

  <!-- Card 1: Rack Mount Server Hardware -->
  <rect x="20" y="90" width="255" height="300" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="35" y="105" width="225" height="30" rx="6" fill="#0369a1"/>
  <text x="50" y="125" fill="#ffffff" font-size="13" font-weight="bold">1U/2U Rack Server Chassis</text>
  <text x="35" y="160" fill="#e2e8f0" font-size="11" font-weight="bold">• CPU: Multi-core Xeon/EPYC</text>
  <text x="35" y="185" fill="#e2e8f0" font-size="11" font-weight="bold">• RAM: ECC Registered DDR4/DDR5</text>
  <text x="35" y="210" fill="#e2e8f0" font-size="11" font-weight="bold">• Dual Redundant PSUs (1+1)</text>
  <text x="35" y="235" fill="#e2e8f0" font-size="11" font-weight="bold">• Quad 10GbE NICs (Teaming)</text>
  <text x="35" y="260" fill="#e2e8f0" font-size="11" font-weight="bold">• Hardware RAID Controller + BBU</text>
  <rect x="35" y="285" width="225" height="85" rx="8" fill="#0f172a" stroke="#334155"/>
  <text x="45" y="310" fill="#38bdf8" font-size="10" font-weight="bold">Out-of-Band Management:</text>
  <text x="45" y="330" fill="#94a3b8" font-size="10">• iDRAC / iLO / IPMI 2.0</text>
  <text x="45" y="350" fill="#94a3b8" font-size="10">• Dedicated Remote KVM Port</text>

  <!-- Card 2: RAID 1 Mirroring -->
  <rect x="295" y="90" width="255" height="300" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <rect x="310" y="105" width="225" height="30" rx="6" fill="#047857"/>
  <text x="330" y="125" fill="#ffffff" font-size="13" font-weight="bold">RAID 1 (Mirroring - OS Drives)</text>
  <rect x="325" y="150" width="85" height="100" rx="8" fill="#0f172a" stroke="#10b981" stroke-dasharray="4"/>
  <text x="345" y="180" fill="#10b981" font-size="12" font-weight="bold">Disk 0</text>
  <text x="335" y="205" fill="#e2e8f0" font-size="10">OS Block A</text>
  <text x="335" y="225" fill="#e2e8f0" font-size="10">OS Block B</text>
  <rect x="435" y="150" width="85" height="100" rx="8" fill="#0f172a" stroke="#10b981" stroke-dasharray="4"/>
  <text x="455" y="180" fill="#10b981" font-size="12" font-weight="bold">Disk 1</text>
  <text x="445" y="205" fill="#e2e8f0" font-size="10">OS Block A</text>
  <text x="445" y="225" fill="#e2e8f0" font-size="10">OS Block B</text>
  <text x="310" y="280" fill="#a7f3d0" font-size="11" font-weight="bold">Capacity: 50% (1x Drive)</text>
  <text x="310" y="305" fill="#e2e8f0" font-size="11">Fault Tolerance: 1 Disk Failure</text>
  <text x="310" y="330" fill="#e2e8f0" font-size="11">Write Speed: 1x | Read: 2x</text>
  <text x="310" y="355" fill="#94a3b8" font-size="10">Used for: C:\\ System Partition</text>

  <!-- Card 3: RAID 5 Striping with Parity -->
  <rect x="570" y="90" width="260" height="300" rx="12" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
  <rect x="585" y="105" width="230" height="30" rx="6" fill="#6d28d9"/>
  <text x="600" y="125" fill="#ffffff" font-size="13" font-weight="bold">RAID 5 (Striping + Parity)</text>
  <rect x="585" y="150" width="65" height="95" rx="6" fill="#0f172a" stroke="#8b5cf6"/>
  <text x="595" y="175" fill="#c4b5fd" font-size="10" font-weight="bold">Disk 1</text>
  <text x="595" y="195" fill="#e2e8f0" font-size="9">Data A1</text>
  <text x="595" y="215" fill="#f43f5e" font-size="9">Parity P1</text>
  <rect x="665" y="150" width="65" height="95" rx="6" fill="#0f172a" stroke="#8b5cf6"/>
  <text x="675" y="175" fill="#c4b5fd" font-size="10" font-weight="bold">Disk 2</text>
  <text x="675" y="195" fill="#e2e8f0" font-size="9">Data B1</text>
  <text x="675" y="215" fill="#e2e8f0" font-size="9">Data B2</text>
  <rect x="745" y="150" width="65" height="95" rx="6" fill="#0f172a" stroke="#8b5cf6"/>
  <text x="755" y="175" fill="#c4b5fd" font-size="10" font-weight="bold">Disk 3</text>
  <text x="755" y="195" fill="#f43f5e" font-size="9">Parity P2</text>
  <text x="755" y="215" fill="#e2e8f0" font-size="9">Data C2</text>
  <text x="585" y="275" fill="#ddd6fe" font-size="11" font-weight="bold">Capacity: (N-1) x Drive Size</text>
  <text x="585" y="300" fill="#e2e8f0" font-size="11">Minimum Disks: 3 Drives</text>
  <text x="585" y="325" fill="#e2e8f0" font-size="11">High Read Performance</text>
  <text x="585" y="350" fill="#94a3b8" font-size="10">Used for: File Shares &amp; Databases</text>
</svg>
`;

// 2. Windows Server 2016 Server Manager Interface SVG
const serverManagerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b1329; font-family:system-ui, -apple-system, sans-serif;">
  <!-- Window Header -->
  <rect x="15" y="15" width="820" height="35" rx="8" fill="#1e293b" stroke="#334155"/>
  <circle cx="35" cy="32" r="6" fill="#ef4444"/>
  <circle cx="55" cy="32" r="6" fill="#f59e0b"/>
  <circle cx="75" cy="32" r="6" fill="#10b981"/>
  <text x="100" y="37" fill="#f8fafc" font-size="13" font-weight="bold">Server Manager • WIN-SRV2016-DC01</text>
  <text x="700" y="36" fill="#38bdf8" font-size="11">Manage | Tools | View</text>

  <!-- Left Sidebar Roles Tree -->
  <rect x="15" y="55" width="200" height="345" fill="#0f172a" stroke="#334155"/>
  <rect x="25" y="70" width="180" height="28" rx="6" fill="#0284c7"/>
  <text x="35" y="89" fill="#ffffff" font-size="12" font-weight="bold">Dashboard</text>
  <text x="35" y="125" fill="#94a3b8" font-size="12">Local Server</text>
  <text x="35" y="155" fill="#94a3b8" font-size="12">All Servers (1)</text>
  <line x1="25" y1="175" x2="205" y2="175" stroke="#334155" stroke-width="1"/>
  <text x="25" y="195" fill="#38bdf8" font-size="10" font-weight="bold">ROLES &amp; SERVER GROUPS</text>
  <rect x="25" y="210" width="180" height="24" rx="4" fill="#1e293b"/>
  <text x="35" y="226" fill="#e2e8f0" font-size="11">✓ AD DS</text>
  <rect x="25" y="240" width="180" height="24" rx="4" fill="#1e293b"/>
  <text x="35" y="256" fill="#e2e8f0" font-size="11">✓ DHCP Server</text>
  <rect x="25" y="270" width="180" height="24" rx="4" fill="#1e293b"/>
  <text x="35" y="286" fill="#e2e8f0" font-size="11">✓ DNS Server</text>
  <rect x="25" y="300" width="180" height="24" rx="4" fill="#1e293b"/>
  <text x="35" y="316" fill="#e2e8f0" font-size="11">✓ File &amp; Storage</text>
  <rect x="25" y="330" width="180" height="24" rx="4" fill="#1e293b"/>
  <text x="35" y="346" fill="#e2e8f0" font-size="11">✓ Web Server (IIS)</text>

  <!-- Main Content Dashboard -->
  <rect x="225" y="55" width="610" height="345" fill="#020617" stroke="#334155"/>
  <text x="245" y="85" fill="#ffffff" font-size="16" font-weight="bold">Welcome to Server Manager</text>

  <!-- Step 1, 2, 3 Quick Action Blocks -->
  <rect x="245" y="105" width="180" height="85" rx="8" fill="#1e293b" stroke="#0284c7"/>
  <text x="255" y="125" fill="#38bdf8" font-size="11" font-weight="bold">1. Configure Local Server</text>
  <text x="255" y="145" fill="#94a3b8" font-size="10">IP: 192.168.1.10/24</text>
  <text x="255" y="165" fill="#94a3b8" font-size="10">Domain: rwandatvet.local</text>

  <rect x="440" y="105" width="180" height="85" rx="8" fill="#1e293b" stroke="#10b981"/>
  <text x="450" y="125" fill="#10b981" font-size="11" font-weight="bold">2. Add Roles &amp; Features</text>
  <text x="450" y="145" fill="#94a3b8" font-size="10">Install Active Directory, DNS,</text>
  <text x="450" y="165" fill="#94a3b8" font-size="10">DHCP &amp; IIS Web Servers</text>

  <rect x="635" y="105" width="185" height="85" rx="8" fill="#1e293b" stroke="#8b5cf6"/>
  <text x="645" y="125" fill="#c4b5fd" font-size="11" font-weight="bold">3. Promote to Domain Controller</text>
  <text x="645" y="145" fill="#94a3b8" font-size="10">Run dcpromo / ADDS Wizard</text>
  <text x="645" y="165" fill="#94a3b8" font-size="10">Status: Primary Forest Root</text>

  <!-- Server Roles Status Table -->
  <text x="245" y="215" fill="#38bdf8" font-size="12" font-weight="bold">ROLES AND SERVER GROUPS STATUS (ALL GREEN)</text>
  <rect x="245" y="225" width="575" height="155" rx="8" fill="#0f172a" stroke="#334155"/>
  
  <rect x="260" y="240" width="165" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
  <circle cx="280" cy="268" r="8" fill="#10b981"/>
  <text x="295" y="265" fill="#ffffff" font-size="11" font-weight="bold">AD DS</text>
  <text x="295" y="280" fill="#a7f3d0" font-size="10">Running • 0 Alerts</text>

  <rect x="445" y="240" width="165" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
  <circle cx="465" cy="268" r="8" fill="#10b981"/>
  <text x="480" y="265" fill="#ffffff" font-size="11" font-weight="bold">DNS Server</text>
  <text x="480" y="280" fill="#a7f3d0" font-size="10">Running • 0 Alerts</text>

  <rect x="630" y="240" width="170" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
  <circle cx="650" cy="268" r="8" fill="#10b981"/>
  <text x="665" y="265" fill="#ffffff" font-size="11" font-weight="bold">DHCP Server</text>
  <text x="665" y="280" fill="#a7f3d0" font-size="10">Scope 100% Active</text>

  <rect x="260" y="310" width="260" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
  <circle cx="280" cy="338" r="8" fill="#10b981"/>
  <text x="295" y="335" fill="#ffffff" font-size="11" font-weight="bold">IIS 10.0 Web Server</text>
  <text x="295" y="350" fill="#a7f3d0" font-size="10">Default Web Site Started (Port 80)</text>

  <rect x="540" y="310" width="260" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
  <circle cx="560" cy="338" r="8" fill="#10b981"/>
  <text x="575" y="335" fill="#ffffff" font-size="11" font-weight="bold">File &amp; Storage Services</text>
  <text x="575" y="350" fill="#a7f3d0" font-size="10">Shares: \\\\WIN-SRV\\CourseData</text>
</svg>
`;

// 3. Active Directory Forest Architecture SVG
const activeDirectorySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0f172a; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 2.1: Active Directory Domain Services (AD DS) Architecture</text>
  <text x="640" y="42" fill="#94a3b8" font-size="11">Forest • Trees • Trust Relationships</text>

  <!-- Forest Boundary Outer Box -->
  <rect x="20" y="75" width="810" height="325" rx="16" fill="#020617" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6"/>
  <text x="40" y="100" fill="#38bdf8" font-size="12" font-weight="bold">ACTIVE DIRECTORY FOREST BOUNDARY: rwandatvet.local</text>

  <!-- Root Domain Triangle / Card -->
  <polygon points="425,115 300,240 550,240" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="365" y="170" fill="#a7f3d0" font-size="14" font-weight="bold">Forest Root Domain</text>
  <text x="365" y="195" fill="#ffffff" font-size="12">rwandatvet.local</text>
  <text x="345" y="215" fill="#94a3b8" font-size="10">• Schema Master • Domain Naming Master</text>
  <text x="345" y="230" fill="#94a3b8" font-size="10">• PDC Emulator • RID Master • Infrastructure</text>

  <!-- Child Domain 1: Kigali Campus -->
  <polygon points="210,265 110,380 310,380" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
  <text x="145" y="325" fill="#38bdf8" font-size="12" font-weight="bold">Child Domain 1</text>
  <text x="135" y="345" fill="#ffffff" font-size="11">kigali.rwandatvet.local</text>
  <text x="135" y="365" fill="#94a3b8" font-size="9">Two-Way Transitive Trust</text>

  <!-- Child Domain 2: Huye Campus -->
  <polygon points="640,265 540,380 740,380" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
  <text x="580" y="325" fill="#c4b5fd" font-size="12" font-weight="bold">Child Domain 2</text>
  <text x="570" y="345" fill="#ffffff" font-size="11">huye.rwandatvet.local</text>
  <text x="570" y="365" fill="#94a3b8" font-size="9">Two-Way Transitive Trust</text>

  <!-- Trust Arrows -->
  <line x1="340" y1="240" x2="240" y2="280" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="510" y1="240" x2="610" y2="280" stroke="#10b981" stroke-width="2"/>
</svg>
`;

// 4. Active Directory OU & GPO Hierarchy SVG
const ouAndGpoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b132b; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 2.4: Group Policy Object (GPO) Inheritance &amp; OU Structure</text>
  <text x="650" y="42" fill="#94a3b8" font-size="11">LSDOU Processing Order</text>

  <!-- Processing Order Banner -->
  <rect x="20" y="70" width="810" height="35" rx="6" fill="#1e293b"/>
  <text x="35" y="93" fill="#f59e0b" font-size="12" font-weight="bold">Processing Hierarchy: </text>
  <text x="190" y="93" fill="#e2e8f0" font-size="12">1. Local Policy &rarr; 2. Site GPO &rarr; 3. Domain GPO &rarr; 4. Organizational Unit (OU) GPO (Highest Precedence)</text>

  <!-- Domain Level Node -->
  <rect x="300" y="120" width="250" height="55" rx="8" fill="#0284c7" stroke="#38bdf8"/>
  <text x="320" y="145" fill="#ffffff" font-size="13" font-weight="bold">Domain: rwandatvet.local</text>
  <text x="320" y="163" fill="#e0f2fe" font-size="10">Default Domain Policy (Password Complexity, Lockout)</text>

  <!-- Connectors -->
  <line x1="425" y1="175" x2="425" y2="200" stroke="#94a3b8" stroke-width="2"/>
  <line x1="180" y1="200" x2="670" y2="200" stroke="#94a3b8" stroke-width="2"/>
  <line x1="180" y1="200" x2="180" y2="225" stroke="#94a3b8" stroke-width="2"/>
  <line x1="425" y1="200" x2="425" y2="225" stroke="#94a3b8" stroke-width="2"/>
  <line x1="670" y1="200" x2="670" y2="225" stroke="#94a3b8" stroke-width="2"/>

  <!-- OU 1: Staff OU -->
  <rect x="70" y="225" width="220" height="160" rx="10" fill="#1e293b" stroke="#10b981"/>
  <rect x="80" y="235" width="200" height="26" rx="4" fill="#047857"/>
  <text x="90" y="253" fill="#ffffff" font-size="11" font-weight="bold">OU=Staff_Instructors</text>
  <text x="85" y="285" fill="#a7f3d0" font-size="10" font-weight="bold">• Linked GPO: Staff_Desktop_Security</text>
  <text x="85" y="305" fill="#e2e8f0" font-size="10">- Screen saver password: 10 min</text>
  <text x="85" y="325" fill="#e2e8f0" font-size="10">- Map Z:\\\\ server network share</text>
  <text x="85" y="345" fill="#e2e8f0" font-size="10">- Restrict USB Mass Storage</text>
  <text x="85" y="365" fill="#94a3b8" font-size="9">Users: joshua.u, marie.k, paul.m</text>

  <!-- OU 2: Students OU -->
  <rect x="315" y="225" width="220" height="160" rx="10" fill="#1e293b" stroke="#f59e0b"/>
  <rect x="325" y="235" width="200" height="26" rx="4" fill="#b45309"/>
  <text x="340" y="253" fill="#ffffff" font-size="11" font-weight="bold">OU=Trainees_Students</text>
  <text x="330" y="285" fill="#fde68a" font-size="10" font-weight="bold">• Linked GPO: Student_Lab_Kiosk</text>
  <text x="330" y="305" fill="#e2e8f0" font-size="10">- Disable Command Prompt / Regedit</text>
  <text x="330" y="325" fill="#e2e8f0" font-size="10">- Redirect Documents to Server Share</text>
  <text x="330" y="345" fill="#e2e8f0" font-size="10">- Force TVET Wallpaper &amp; Homepage</text>
  <text x="330" y="365" fill="#94a3b8" font-size="9">Users: student01, student02...</text>

  <!-- OU 3: Servers OU -->
  <rect x="560" y="225" width="220" height="160" rx="10" fill="#1e293b" stroke="#8b5cf6"/>
  <rect x="570" y="235" width="200" height="26" rx="4" fill="#6d28d9"/>
  <text x="585" y="253" fill="#ffffff" font-size="11" font-weight="bold">OU=Member_Servers</text>
  <text x="575" y="285" fill="#ddd6fe" font-size="10" font-weight="bold">• Linked GPO: Hardened_Server_Baseline</text>
  <text x="575" y="305" fill="#e2e8f0" font-size="10">- Enable Advanced Audit Logging</text>
  <text x="575" y="325" fill="#e2e8f0" font-size="10">- Windows Defender ATP real-time</text>
  <text x="575" y="345" fill="#e2e8f0" font-size="10">- Enforce SMB v3 Signing / TLS 1.3</text>
  <text x="575" y="365" fill="#94a3b8" font-size="9">Computers: SRV-DHCP01, SRV-IIS01</text>
</svg>
`;

// 5. DHCP DORA Protocol Sequence Diagram SVG
const dhcpDoraSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0f172a; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 3.1: DHCP 4-Step DORA Protocol Handshake</text>
  <text x="640" y="42" fill="#94a3b8" font-size="11">Discover • Offer • Request • ACK</text>

  <!-- Client Host Column -->
  <rect x="60" y="80" width="200" height="50" rx="8" fill="#0284c7"/>
  <text x="90" y="110" fill="#ffffff" font-size="13" font-weight="bold">DHCP Client (PC-01)</text>
  <text x="95" y="125" fill="#e0f2fe" font-size="10">MAC: 00-15-5D-01-2A-9C</text>
  <line x1="160" y1="130" x2="160" y2="390" stroke="#0284c7" stroke-width="2" stroke-dasharray="4"/>

  <!-- Server Column -->
  <rect x="590" y="80" width="200" height="50" rx="8" fill="#10b981"/>
  <text x="610" y="110" fill="#ffffff" font-size="13" font-weight="bold">Windows DHCP Server</text>
  <text x="625" y="125" fill="#a7f3d0" font-size="10">IP: 192.168.1.10 (Static)</text>
  <line x1="690" y1="130" x2="690" y2="390" stroke="#10b981" stroke-width="2" stroke-dasharray="4"/>

  <!-- Step 1: Discover -->
  <rect x="230" y="150" width="390" height="36" rx="6" fill="#1e293b" stroke="#38bdf8"/>
  <line x1="160" y1="168" x2="690" y2="168" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="685,164 695,168 685,172" fill="#38bdf8"/>
  <text x="245" y="173" fill="#38bdf8" font-size="11" font-weight="bold">1. DHCP DISCOVER (Broadcast: 255.255.255.255:67 UDP)</text>

  <!-- Step 2: Offer -->
  <rect x="230" y="210" width="390" height="36" rx="6" fill="#1e293b" stroke="#10b981"/>
  <line x1="690" y1="228" x2="160" y2="228" stroke="#10b981" stroke-width="2"/>
  <polygon points="165,224 155,228 165,232" fill="#10b981"/>
  <text x="245" y="233" fill="#10b981" font-size="11" font-weight="bold">2. DHCP OFFER (Offering IP: 192.168.1.50, Subnet: 255.255.255.0)</text>

  <!-- Step 3: Request -->
  <rect x="230" y="270" width="390" height="36" rx="6" fill="#1e293b" stroke="#f59e0b"/>
  <line x1="160" y1="288" x2="690" y2="288" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="685,284 695,288 685,292" fill="#f59e0b"/>
  <text x="245" y="293" fill="#f59e0b" font-size="11" font-weight="bold">3. DHCP REQUEST (Client accepts 192.168.1.50 from Server)</text>

  <!-- Step 4: Acknowledge -->
  <rect x="230" y="330" width="390" height="36" rx="6" fill="#1e293b" stroke="#a855f7"/>
  <line x1="690" y1="348" x2="160" y2="348" stroke="#a855f7" stroke-width="2"/>
  <polygon points="165,344 155,348 165,352" fill="#a855f7"/>
  <text x="245" y="353" fill="#c084fc" font-size="11" font-weight="bold">4. DHCP ACK (Lease committed: 8 Days, Gateway: 192.168.1.1, DNS: .10)</text>
</svg>
`;

// 6. DNS Hierarchy & Forward Lookup Zones SVG
const dnsArchitectureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b1329; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 4.1: DNS Hierarchical Namespace &amp; Forward Lookup Resolution</text>
  <text x="650" y="42" fill="#94a3b8" font-size="11">Iterative vs Recursive Queries</text>

  <!-- Root Server '.' -->
  <circle cx="425" cy="100" r="28" fill="#e11d48"/>
  <text x="420" y="106" fill="#ffffff" font-size="18" font-weight="bold">.</text>
  <text x="460" y="105" fill="#f43f5e" font-size="11" font-weight="bold">Root DNS Level (13 Named Root Clusters)</text>

  <!-- TLD Level -->
  <line x1="425" y1="128" x2="250" y2="165" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="425" y1="128" x2="600" y2="165" stroke="#94a3b8" stroke-width="1.5"/>

  <rect x="180" y="165" width="140" height="40" rx="8" fill="#1e293b" stroke="#38bdf8"/>
  <text x="220" y="190" fill="#38bdf8" font-size="13" font-weight="bold">.rw / .gov</text>

  <rect x="530" y="165" width="140" height="40" rx="8" fill="#1e293b" stroke="#38bdf8"/>
  <text x="560" y="190" fill="#38bdf8" font-size="13" font-weight="bold">.com / .local</text>

  <!-- Second-Level Domain -->
  <line x1="600" y1="205" x2="600" y2="245" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="490" y="245" width="220" height="45" rx="8" fill="#0284c7"/>
  <text x="520" y="272" fill="#ffffff" font-size="13" font-weight="bold">rwandatvet.local (SLD)</text>

  <!-- Resource Records Table in Zone -->
  <rect x="40" y="225" width="410" height="170" rx="10" fill="#0f172a" stroke="#10b981"/>
  <rect x="50" y="235" width="390" height="24" rx="4" fill="#047857"/>
  <text x="60" y="252" fill="#ffffff" font-size="11" font-weight="bold">Forward Lookup Zone: rwandatvet.local</text>
  <text x="60" y="280" fill="#a7f3d0" font-size="10" font-weight="bold">Host (A)        | dc01.rwandatvet.local     &rarr; 192.168.1.10</text>
  <text x="60" y="305" fill="#e2e8f0" font-size="10">Host (A)        | mail.rwandatvet.local     &rarr; 192.168.1.25</text>
  <text x="60" y="330" fill="#e2e8f0" font-size="10">Alias (CNAME)   | www                       &rarr; dc01.rwandatvet.local</text>
  <text x="60" y="355" fill="#e2e8f0" font-size="10">Mail Exchanger  | MX Priority 10            &rarr; mail.rwandatvet.local</text>
  <text x="60" y="380" fill="#94a3b8" font-size="9">Reverse PTR Zone: 1.168.192.in-addr.arpa (IP &rarr; FQDN)</text>

  <!-- Query Box -->
  <rect x="490" y="310" width="320" height="85" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="505" y="335" fill="#f59e0b" font-size="11" font-weight="bold">Client Resolution Command (CMD/PowerShell):</text>
  <text x="505" y="358" fill="#38bdf8" font-size="11" font-family="monospace">nslookup www.rwandatvet.local 192.168.1.10</text>
  <text x="505" y="380" fill="#10b981" font-size="10">Response: Address: 192.168.1.10 (Authoritative)</text>
</svg>
`;

// 7. IIS Web Server Architecture SVG
const iisArchitectureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0f172a; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 5.1: Microsoft IIS 10.0 Modular Architecture &amp; Worker Processes</text>
  <text x="640" y="42" fill="#94a3b8" font-size="11">Kernel Mode vs User Mode</text>

  <!-- Kernel Mode -->
  <rect x="40" y="75" width="770" height="90" rx="12" fill="#020617" stroke="#ef4444" stroke-width="1.5"/>
  <text x="60" y="100" fill="#f87171" font-size="12" font-weight="bold">KERNEL MODE (Ring 0)</text>
  <rect x="60" y="110" width="730" height="42" rx="6" fill="#1e293b" stroke="#ef4444"/>
  <text x="80" y="136" fill="#ffffff" font-size="13" font-weight="bold">HTTP.SYS (Kernel-Mode Protocol Listener - Port 80 / 443 TCP)</text>
  <text x="590" y="135" fill="#fca5a5" font-size="11">Request Queue &amp; Kernel Cache</text>

  <!-- User Mode Boundary -->
  <rect x="40" y="180" width="770" height="220" rx="12" fill="#020617" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="60" y="205" fill="#38bdf8" font-size="12" font-weight="bold">USER MODE (Ring 3) - IIS Web Administration &amp; Worker Processes</text>

  <!-- WAS Box -->
  <rect x="60" y="220" width="200" height="160" rx="8" fill="#1e293b" stroke="#0284c7"/>
  <text x="75" y="245" fill="#38bdf8" font-size="12" font-weight="bold">Windows Process</text>
  <text x="75" y="265" fill="#38bdf8" font-size="12" font-weight="bold">Activation (WAS)</text>
  <text x="75" y="295" fill="#94a3b8" font-size="10">• Configuration Mgr</text>
  <text x="75" y="315" fill="#94a3b8" font-size="10">• ApplicationPool Mgr</text>
  <text x="75" y="335" fill="#94a3b8" font-size="10">• Process Health Monitor</text>
  <text x="75" y="355" fill="#94a3b8" font-size="10">• applicationHost.config</text>

  <!-- App Pool 1 -->
  <rect x="290" y="220" width="240" height="160" rx="8" fill="#1e293b" stroke="#10b981"/>
  <rect x="300" y="230" width="220" height="26" rx="4" fill="#047857"/>
  <text x="310" y="248" fill="#ffffff" font-size="11" font-weight="bold">DefaultAppPool (Isolated)</text>
  <rect x="300" y="265" width="220" height="105" rx="6" fill="#0f172a" stroke="#10b981" stroke-dasharray="3"/>
  <text x="310" y="290" fill="#a7f3d0" font-size="11" font-weight="bold">Worker Process (w3wp.exe)</text>
  <text x="310" y="312" fill="#e2e8f0" font-size="10">Site: Default Web Site (Port 80)</text>
  <text x="310" y="332" fill="#e2e8f0" font-size="10">Physical: C:\\inetpub\\wwwroot</text>
  <text x="310" y="352" fill="#94a3b8" font-size="9">Modules: ASP.NET Core, PHP, Static</text>

  <!-- App Pool 2 -->
  <rect x="560" y="220" width="235" height="160" rx="8" fill="#1e293b" stroke="#8b5cf6"/>
  <rect x="570" y="230" width="215" height="26" rx="4" fill="#6d28d9"/>
  <text x="580" y="248" fill="#ffffff" font-size="11" font-weight="bold">ExamPortalAppPool (Secure)</text>
  <rect x="570" y="265" width="215" height="105" rx="6" fill="#0f172a" stroke="#8b5cf6" stroke-dasharray="3"/>
  <text x="580" y="290" fill="#ddd6fe" font-size="11" font-weight="bold">Worker Process (w3wp.exe)</text>
  <text x="580" y="312" fill="#e2e8f0" font-size="10">Site: https://exams.local (Port 443)</text>
  <text x="580" y="332" fill="#e2e8f0" font-size="10">SSL/TLS 1.3 Certified</text>
  <text x="580" y="352" fill="#94a3b8" font-size="9">Authentication: Windows Integrated</text>
</svg>
`;

// 8. FTP Server Architecture SVG
const ftpArchitectureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b1329; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 6.1: FTP Client-Server Architecture (Port 21 Control vs Port 20 Data)</text>
  <text x="660" y="42" fill="#94a3b8" font-size="11">Active vs Passive Modes</text>

  <!-- Client -->
  <rect x="40" y="80" width="200" height="300" rx="10" fill="#1e293b" stroke="#38bdf8"/>
  <rect x="50" y="95" width="180" height="30" rx="6" fill="#0369a1"/>
  <text x="65" y="115" fill="#ffffff" font-size="12" font-weight="bold">FTP Client (FileZilla/CMD)</text>
  <text x="55" y="155" fill="#e2e8f0" font-size="11">• User PI (Protocol Interpreter)</text>
  <text x="55" y="180" fill="#e2e8f0" font-size="11">• User DTP (Data Transfer)</text>
  <text x="55" y="210" fill="#38bdf8" font-size="11" font-weight="bold">Client Ports:</text>
  <text x="55" y="235" fill="#94a3b8" font-size="10">Control: Ephemeral (e.g. 51500)</text>
  <text x="55" y="260" fill="#94a3b8" font-size="10">Data: Ephemeral (e.g. 51501)</text>

  <!-- Server -->
  <rect x="610" y="80" width="200" height="300" rx="10" fill="#1e293b" stroke="#10b981"/>
  <rect x="620" y="95" width="180" height="30" rx="6" fill="#047857"/>
  <text x="635" y="115" fill="#ffffff" font-size="12" font-weight="bold">IIS FTP Service</text>
  <text x="625" y="155" fill="#e2e8f0" font-size="11">• Server PI (Control Port 21)</text>
  <text x="625" y="180" fill="#e2e8f0" font-size="11">• Server DTP (Data Port 20/High)</text>
  <text x="625" y="210" fill="#10b981" font-size="11" font-weight="bold">Directory Isolation:</text>
  <text x="625" y="235" fill="#a7f3d0" font-size="10">C:\\inetpub\\ftproot\\LocalUser</text>
  <text x="625" y="260" fill="#94a3b8" font-size="10">User Home Directory Isolation</text>

  <!-- Channel 1: Control Channel Port 21 -->
  <rect x="260" y="130" width="330" height="50" rx="8" fill="#0f172a" stroke="#38bdf8"/>
  <text x="275" y="153" fill="#38bdf8" font-size="11" font-weight="bold">1. Control Channel (TCP Port 21)</text>
  <text x="275" y="170" fill="#94a3b8" font-size="10">USER, PASS, LIST, CWD, RETR, STOR commands</text>

  <!-- Channel 2: Data Channel Port 20 -->
  <rect x="260" y="210" width="330" height="50" rx="8" fill="#0f172a" stroke="#10b981"/>
  <text x="275" y="233" fill="#10b981" font-size="11" font-weight="bold">2. Data Channel (TCP Port 20 / Passive Ports)</text>
  <text x="275" y="250" fill="#a7f3d0" font-size="10">High-speed binary file stream (PDF, ISO, Notes)</text>

  <!-- Security note -->
  <rect x="260" y="290" width="330" height="70" rx="8" fill="#1e293b" stroke="#f59e0b"/>
  <text x="275" y="315" fill="#f59e0b" font-size="11" font-weight="bold">FTPS (FTP over SSL/TLS):</text>
  <text x="275" y="335" fill="#e2e8f0" font-size="10">Encrypts control &amp; data channel credentials using X.509</text>
  <text x="275" y="350" fill="#94a3b8" font-size="9">Protects student files against network packet sniffing</text>
</svg>
`;

// 9. Network Load Balancing (NLB) Cluster Architecture SVG
const nlbArchitectureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b1329; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 7.1: Network Load Balancing (NLB) Cluster Architecture</text>
  <text x="650" y="42" fill="#94a3b8" font-size="11">Virtual IP &amp; Heartbeat</text>

  <!-- Client Traffic -->
  <rect x="50" y="150" width="160" height="90" rx="10" fill="#0284c7"/>
  <text x="65" y="185" fill="#ffffff" font-size="12" font-weight="bold">Incoming Web Clients</text>
  <text x="65" y="205" fill="#e0f2fe" font-size="10">HTTP / HTTPS Traffic</text>
  <text x="65" y="225" fill="#e0f2fe" font-size="10">Target: 192.168.1.100 (VIP)</text>

  <!-- Arrow -->
  <line x1="210" y1="195" x2="290" y2="195" stroke="#38bdf8" stroke-width="3"/>

  <!-- Virtual IP Cluster Node -->
  <rect x="290" y="100" width="220" height="190" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="310" y="130" fill="#f59e0b" font-size="13" font-weight="bold">NLB Virtual Cluster</text>
  <text x="310" y="155" fill="#ffffff" font-size="11">Virtual IP: 192.168.1.100</text>
  <text x="310" y="175" fill="#e2e8f0" font-size="10">Cluster MAC: 03-BF-C0-A8-01-64</text>
  <text x="310" y="200" fill="#94a3b8" font-size="10">Mode: Multicast / Unicast</text>
  <text x="310" y="225" fill="#94a3b8" font-size="10">Convergence: Automatic</text>
  <text x="310" y="250" fill="#10b981" font-size="10" font-weight="bold">Heartbeat Interval: 1000ms</text>

  <!-- Server 1 -->
  <rect x="570" y="80" width="240" height="110" rx="10" fill="#0f172a" stroke="#10b981"/>
  <text x="585" y="105" fill="#10b981" font-size="12" font-weight="bold">Cluster Host 1: NLB-NODE01</text>
  <text x="585" y="125" fill="#e2e8f0" font-size="10">Dedicated IP: 192.168.1.101</text>
  <text x="585" y="145" fill="#e2e8f0" font-size="10">Load Weight: 50% • State: Converged</text>
  <text x="585" y="165" fill="#a7f3d0" font-size="9">IIS Web Server Active</text>

  <!-- Server 2 -->
  <rect x="570" y="220" width="240" height="110" rx="10" fill="#0f172a" stroke="#8b5cf6"/>
  <text x="585" y="245" fill="#c4b5fd" font-size="12" font-weight="bold">Cluster Host 2: NLB-NODE02</text>
  <text x="585" y="265" fill="#e2e8f0" font-size="10">Dedicated IP: 192.168.1.102</text>
  <text x="585" y="285" fill="#e2e8f0" font-size="10">Load Weight: 50% • State: Converged</text>
  <text x="585" y="305" fill="#ddd6fe" font-size="9">IIS Web Server Active</text>

  <!-- Connectors -->
  <line x1="510" y1="160" x2="570" y2="135" stroke="#10b981" stroke-width="2"/>
  <line x1="510" y1="230" x2="570" y2="275" stroke="#8b5cf6" stroke-width="2"/>
  <line x1="690" y1="190" x2="690" y2="220" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>
  <text x="700" y="210" fill="#f59e0b" font-size="9">Cluster Heartbeat</text>
</svg>
`;

// 10. Windows Server Update Services (WSUS) Architecture SVG
const wsusArchitectureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b1329; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="45" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="40" y="44" fill="#38bdf8" font-size="17" font-weight="bold">Figure 8.1: Windows Server Update Services (WSUS) Multi-Tier Hierarchy</text>
  <text x="650" y="42" fill="#94a3b8" font-size="11">Bandwidth Optimization</text>

  <!-- Microsoft Update Cloud -->
  <rect x="300" y="75" width="250" height="50" rx="10" fill="#0284c7"/>
  <text x="330" y="105" fill="#ffffff" font-size="13" font-weight="bold">Microsoft Update Cloud</text>
  <text x="330" y="120" fill="#e0f2fe" font-size="9">Windows Update Servers (Public Internet)</text>

  <line x1="425" y1="125" x2="425" y2="165" stroke="#38bdf8" stroke-width="2"/>

  <!-- Upstream WSUS Server -->
  <rect x="280" y="165" width="290" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="300" y="195" fill="#10b981" font-size="13" font-weight="bold">Central WSUS Server (Upstream)</text>
  <text x="300" y="215" fill="#ffffff" font-size="10">Syncs updates once &bull; Saves 98% Internet Bandwidth</text>
  <text x="300" y="235" fill="#a7f3d0" font-size="10">Database: WID (Windows Internal Database) / SQL Server</text>

  <!-- Branch lines -->
  <line x1="330" y1="245" x2="200" y2="280" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="520" y1="245" x2="650" y2="280" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Computer Group 1: Pilot / Testing -->
  <rect x="80" y="280" width="240" height="110" rx="8" fill="#0f172a" stroke="#f59e0b"/>
  <text x="95" y="305" fill="#f59e0b" font-size="11" font-weight="bold">Group 1: Pilot &amp; Test Machines</text>
  <text x="95" y="325" fill="#e2e8f0" font-size="10">Automatic Approval on Day 1</text>
  <text x="95" y="345" fill="#e2e8f0" font-size="10">Verify patch stability &amp; app compatibility</text>
  <text x="95" y="365" fill="#94a3b8" font-size="9">Computers: LAB-PC01 to LAB-PC05</text>

  <!-- Computer Group 2: Production -->
  <rect x="530" y="280" width="240" height="110" rx="8" fill="#0f172a" stroke="#8b5cf6"/>
  <text x="545" y="305" fill="#c4b5fd" font-size="11" font-weight="bold">Group 2: All Production Servers &amp; PCs</text>
  <text x="545" y="325" fill="#e2e8f0" font-size="10">Approved after 7-Day Pilot Phase</text>
  <text x="545" y="345" fill="#e2e8f0" font-size="10">Maintenance Window: Sun 02:00 AM</text>
  <text x="545" y="365" fill="#94a3b8" font-size="9">Group Policy: Specify Intranet Microsoft Update Service</text>
</svg>
`;

function main() {
  const storePath = path.join(process.cwd(), 'db_store.json');
  if (!fs.existsSync(storePath)) {
    console.error('db_store.json not found!');
    return;
  }

  const db = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const doc = db.documents.find(x => x.id === 'doc_1791980285840');

  if (!doc) {
    console.error('Windows server doc not found in db_store.json');
    return;
  }

  console.log('Enriching document with visual diagrams and photos: ' + doc.name);

  const imagesMap = {
    // 1.2 Identification of Server Tools and Equipment
    '1.2': {
      uri: svgUri(raidAndHardwareSvg),
      title: 'Figure 1.2: Server Hardware Specifications & RAID Topologies',
      caption: 'Server Hardware Architecture, Dual Redundant PSUs, ECC Memory, and RAID 1/5 Storage Arrays'
    },
    // 1.3 Installation of Windows Server
    '1.3': {
      uri: svgUri(serverManagerSvg),
      title: 'Figure 1.3: Windows Server 2016 Server Manager Interface & Role Provisioning',
      caption: 'Server Manager Dashboard showing Active Directory, DNS, DHCP, and IIS status in Windows Server 2016'
    },
    // 2.1 Installation of Active Directory Domain Services
    '2.1': {
      uri: svgUri(activeDirectorySvg),
      title: 'Figure 2.1: Active Directory Domain Services (AD DS) Architecture',
      caption: 'AD DS Forest Root Domain, Child Domains, Domain Controllers, and Two-Way Transitive Trusts'
    },
    // 2.4 Management of GPO
    '2.4': {
      uri: svgUri(ouAndGpoSvg),
      title: 'Figure 2.4: Group Policy Object (GPO) Inheritance & Organizational Unit Structure',
      caption: 'GPO Inheritance Order (LSDOU: Local, Site, Domain, OU) and Policy Deployment across Staff & Student OUs'
    },
    // 3.1 Installation of DHCP Services
    '3.1': {
      uri: svgUri(dhcpDoraSvg),
      title: 'Figure 3.1: DHCP 4-Step DORA Protocol Sequence Diagram',
      caption: 'DHCP Discover, Offer, Request, and Acknowledgment exchange between Client PC and Windows DHCP Server'
    },
    // 4.1 Installation of DNS Service
    '4.1': {
      uri: svgUri(dnsArchitectureSvg),
      title: 'Figure 4.1: DNS Hierarchical Namespace Architecture & Forward Lookup Resolution',
      caption: 'DNS Root (.), TLD (.rw, .com), Second-Level Domain, and Forward/Reverse Lookup Resource Records'
    },
    // 5.1 Installation of Web Server
    '5.1': {
      uri: svgUri(iisArchitectureSvg),
      title: 'Figure 5.1: Microsoft IIS 10.0 Modular Architecture & Application Pools',
      caption: 'Kernel-Mode HTTP.sys listener, Windows Process Activation (WAS), and isolated w3wp.exe Worker Processes'
    },
    // 6.1 Installation of FTP Server
    '6.1': {
      uri: svgUri(ftpArchitectureSvg),
      title: 'Figure 6.1: FTP Client-Server Architecture & Port Channels',
      caption: 'TCP Port 21 Control Channel vs TCP Port 20 Data Channel, and Isolated User Directories'
    },
    // 7.1 Description of Load Balancer Installation
    '7.1': {
      uri: svgUri(nlbArchitectureSvg),
      title: 'Figure 7.1: Network Load Balancing (NLB) Cluster Architecture',
      caption: 'Virtual IP (VIP) Cluster, Traffic Distribution, and Heartbeat State Convergence between Nodes'
    },
    // 8.1 Deployment of Windows Server Update Service
    '8.1': {
      uri: svgUri(wsusArchitectureSvg),
      title: 'Figure 8.1: Windows Server Update Services (WSUS) Multi-Tier Hierarchy',
      caption: 'Central Upstream WSUS Server, Bandwidth Conservation, and Computer Testing Groups'
    }
  };

  const allDocImages = [];

  // Update sections with images
  doc.splitContent.forEach((sec, idx) => {
    for (const [key, val] of Object.entries(imagesMap)) {
      if (sec.title.includes(key)) {
        console.log(`Found section match for ${key}: ${sec.title}`);
        
        // Add images array to section
        sec.images = [{
          url: val.uri,
          caption: val.caption,
          alt: val.title
        }];

        allDocImages.push({
          url: val.uri,
          caption: val.caption,
          alt: val.title
        });

        // Prepend figure markdown to section content if not already present
        const mdImageTag = `![${val.title}](${val.uri})\n\n> Note: **${val.title}** - ${val.caption}\n\n`;
        if (!sec.content.includes(val.uri)) {
          sec.content = mdImageTag + sec.content;
        }
      }
    }
  });

  doc.hasDrawings = true;
  doc.images = allDocImages;

  fs.writeFileSync(storePath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Successfully embedded ${allDocImages.length} high-fidelity educational figures and photos into ${doc.name}!`);
}

main();
