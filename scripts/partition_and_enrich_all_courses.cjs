const fs = require('fs');
const path = require('path');

const storePath = './db_store.json';
const db = JSON.parse(fs.readFileSync(storePath, 'utf8'));

function svgUri(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
}

// ==========================================
// 1. LINUX SERVER ADMINISTRATION SVG DIAGRAMS
// ==========================================

const linuxArchitectureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="lgrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="lgrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="lgrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="lgrad4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
  </defs>

  <!-- Banner -->
  <rect x="20" y="15" width="810" height="50" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="46" fill="#38bdf8" font-size="18" font-weight="bold">Figure 1.1: GNU/Linux Operating System Architecture</text>
  <text x="660" y="45" fill="#94a3b8" font-size="12">TVET Rwanda NITLS501</text>

  <!-- Layer 1: User Space -->
  <rect x="30" y="80" width="790" height="75" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="45" y="90" width="180" height="24" rx="4" fill="#0284c7"/>
  <text x="55" y="106" fill="#ffffff" font-size="11" font-weight="bold">USER SPACE APPLICATIONS</text>
  <rect x="45" y="120" width="130" height="26" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="60" y="137" fill="#e2e8f0" font-size="11">Bash / Zsh Shell</text>
  <rect x="185" y="120" width="140" height="26" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="195" y="137" fill="#e2e8f0" font-size="11">GNU Core Utilities</text>
  <rect x="335" y="120" width="150" height="26" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="345" y="137" fill="#e2e8f0" font-size="11">Web Server (Apache/Nginx)</text>
  <rect x="495" y="120" width="140" height="26" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="505" y="137" fill="#e2e8f0" font-size="11">Daemons (systemd/cron)</text>
  <rect x="645" y="120" width="160" height="26" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="655" y="137" fill="#e2e8f0" font-size="11">User GUI (GNOME/X11)</text>

  <!-- System Call Interface -->
  <rect x="30" y="165" width="790" height="32" rx="6" fill="#0f766e" stroke="#14b8a6"/>
  <text x="280" y="186" fill="#ffffff" font-size="12" font-weight="bold">System Call Interface (SCI) — read(), write(), fork(), open()</text>

  <!-- Layer 2: Kernel Space -->
  <rect x="30" y="208" width="790" height="120" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <rect x="45" y="218" width="160" height="24" rx="4" fill="#047857"/>
  <text x="55" y="234" fill="#ffffff" font-size="11" font-weight="bold">LINUX MONOLITHIC KERNEL</text>
  
  <rect x="45" y="250" width="140" height="65" rx="6" fill="#0f172a" stroke="#10b981"/>
  <text x="55" y="275" fill="#34d399" font-size="11" font-weight="bold">Process Scheduler</text>
  <text x="55" y="295" fill="#94a3b8" font-size="10">CFS (Completely Fair)</text>

  <rect x="195" y="250" width="140" height="65" rx="6" fill="#0f172a" stroke="#10b981"/>
  <text x="205" y="275" fill="#34d399" font-size="11" font-weight="bold">Memory Management</text>
  <text x="205" y="295" fill="#94a3b8" font-size="10">Virtual Paging &amp; MMU</text>

  <rect x="345" y="250" width="140" height="65" rx="6" fill="#0f172a" stroke="#10b981"/>
  <text x="355" y="275" fill="#34d399" font-size="11" font-weight="bold">Virtual File System</text>
  <text x="355" y="295" fill="#94a3b8" font-size="10">VFS (ext4, xfs, btrfs)</text>

  <rect x="495" y="250" width="140" height="65" rx="6" fill="#0f172a" stroke="#10b981"/>
  <text x="505" y="275" fill="#34d399" font-size="11" font-weight="bold">Network Subsystem</text>
  <text x="505" y="295" fill="#94a3b8" font-size="10">TCP/IP, Netfilter/iptables</text>

  <rect x="645" y="250" width="160" height="65" rx="6" fill="#0f172a" stroke="#10b981"/>
  <text x="655" y="275" fill="#34d399" font-size="11" font-weight="bold">Device Drivers</text>
  <text x="655" y="295" fill="#94a3b8" font-size="10">Disk, NIC, GPU Modules</text>

  <!-- Layer 3: Hardware -->
  <rect x="30" y="340" width="790" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="45" y="350" width="140" height="22" rx="4" fill="#b45309"/>
  <text x="55" y="365" fill="#ffffff" font-size="11" font-weight="bold">PHYSICAL HARDWARE</text>
  <text x="200" y="375" fill="#e2e8f0" font-size="11">CPU (x86_64 / ARM64)</text>
  <text x="360" y="375" fill="#e2e8f0" font-size="11">RAM (ECC Memory)</text>
  <text x="510" y="375" fill="#e2e8f0" font-size="11">Storage (NVMe / SATA SSD)</text>
  <text x="700" y="375" fill="#e2e8f0" font-size="11">NICs (10GbE)</text>
</svg>`;

const linuxFhsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="50" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="46" fill="#38bdf8" font-size="18" font-weight="bold">Figure 2.1: Linux Filesystem Hierarchy Standard (FHS)</text>
  <text x="660" y="45" fill="#94a3b8" font-size="12">TVET Rwanda NITLS501</text>

  <!-- Root Directory -->
  <rect x="375" y="75" width="100" height="40" rx="8" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <text x="415" y="100" fill="#ffffff" font-size="18" font-weight="bold">/</text>

  <!-- Branches -->
  <line x1="425" y1="115" x2="425" y2="140" stroke="#38bdf8" stroke-width="2"/>
  <line x1="60" y1="140" x2="780" y2="140" stroke="#38bdf8" stroke-width="2"/>

  <!-- Directories -->
  <!-- /bin -->
  <line x1="75" y1="140" x2="75" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="30" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="40" y="175" width="70" height="22" rx="4" fill="#0f766e"/>
  <text x="55" y="190" fill="#ffffff" font-size="12" font-weight="bold">/bin</text>
  <text x="35" y="215" fill="#94a3b8" font-size="9">Essential user</text>
  <text x="35" y="228" fill="#94a3b8" font-size="9">binaries (ls, cp,</text>
  <text x="35" y="241" fill="#94a3b8" font-size="9">bash, cat)</text>

  <!-- /etc -->
  <line x1="175" y1="140" x2="175" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="130" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#10b981"/>
  <rect x="140" y="175" width="70" height="22" rx="4" fill="#047857"/>
  <text x="155" y="190" fill="#ffffff" font-size="12" font-weight="bold">/etc</text>
  <text x="135" y="215" fill="#a7f3d0" font-size="9">System-wide</text>
  <text x="135" y="228" fill="#a7f3d0" font-size="9">configuration</text>
  <text x="135" y="241" fill="#a7f3d0" font-size="9">(passwd, fstab)</text>

  <!-- /home -->
  <line x1="275" y1="140" x2="275" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="230" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="240" y="175" width="70" height="22" rx="4" fill="#0284c7"/>
  <text x="250" y="190" fill="#ffffff" font-size="12" font-weight="bold">/home</text>
  <text x="235" y="215" fill="#94a3b8" font-size="9">User personal</text>
  <text x="235" y="228" fill="#94a3b8" font-size="9">directories</text>
  <text x="235" y="241" fill="#94a3b8" font-size="9">(/home/student)</text>

  <!-- /root -->
  <line x1="375" y1="140" x2="375" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="330" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#ef4444"/>
  <rect x="340" y="175" width="70" height="22" rx="4" fill="#b91c1c"/>
  <text x="355" y="190" fill="#ffffff" font-size="12" font-weight="bold">/root</text>
  <text x="335" y="215" fill="#fca5a5" font-size="9">Superuser (root)</text>
  <text x="335" y="228" fill="#fca5a5" font-size="9">home directory</text>
  <text x="335" y="241" fill="#fca5a5" font-size="9">Private partition</text>

  <!-- /var -->
  <line x1="475" y1="140" x2="475" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="430" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#f59e0b"/>
  <rect x="440" y="175" width="70" height="22" rx="4" fill="#b45309"/>
  <text x="455" y="190" fill="#ffffff" font-size="12" font-weight="bold">/var</text>
  <text x="435" y="215" fill="#fde68a" font-size="9">Variable data</text>
  <text x="435" y="228" fill="#fde68a" font-size="9">(/var/log/syslog,</text>
  <text x="435" y="241" fill="#fde68a" font-size="9">/var/www/html)</text>

  <!-- /usr -->
  <line x1="575" y1="140" x2="575" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="530" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="540" y="175" width="70" height="22" rx="4" fill="#6d28d9"/>
  <text x="555" y="190" fill="#ffffff" font-size="12" font-weight="bold">/usr</text>
  <text x="535" y="215" fill="#94a3b8" font-size="9">User software &amp;</text>
  <text x="535" y="228" fill="#94a3b8" font-size="9">secondary apps</text>
  <text x="535" y="241" fill="#94a3b8" font-size="9">(/usr/bin, /usr/lib)</text>

  <!-- /dev -->
  <line x1="675" y1="140" x2="675" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="630" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="640" y="175" width="70" height="22" rx="4" fill="#334155"/>
  <text x="655" y="190" fill="#ffffff" font-size="12" font-weight="bold">/dev</text>
  <text x="635" y="215" fill="#94a3b8" font-size="9">Device nodes</text>
  <text x="635" y="228" fill="#94a3b8" font-size="9">(/dev/sda1 disk,</text>
  <text x="635" y="241" fill="#94a3b8" font-size="9">/dev/null, /dev/tty)</text>

  <!-- /tmp -->
  <line x1="765" y1="140" x2="765" y2="165" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="720" y="165" width="90" height="90" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="730" y="175" width="70" height="22" rx="4" fill="#334155"/>
  <text x="745" y="190" fill="#ffffff" font-size="12" font-weight="bold">/tmp</text>
  <text x="725" y="215" fill="#94a3b8" font-size="9">Temporary files</text>
  <text x="725" y="228" fill="#94a3b8" font-size="9">Cleared upon</text>
  <text x="725" y="241" fill="#94a3b8" font-size="9">system reboot</text>

  <!-- Note Card -->
  <rect x="30" y="280" width="780" height="115" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="50" y="310" fill="#38bdf8" font-size="12" font-weight="bold">KEY PRINCIPLE: IN LINUX, EVERYTHING IS A FILE</text>
  <text x="50" y="335" fill="#e2e8f0" font-size="11">• Hard drives and partitions are represented in <tspan fill="#38bdf8">/dev/sda, /dev/nvme0n1</tspan></text>
  <text x="50" y="355" fill="#e2e8f0" font-size="11">• Process details and kernel run-time variables are mapped to <tspan fill="#38bdf8">/proc</tspan> and <tspan fill="#38bdf8">/sys</tspan></text>
  <text x="50" y="375" fill="#e2e8f0" font-size="11">• System services and daemons are configured purely via human-readable plain text files in <tspan fill="#10b981">/etc</tspan></text>
</svg>`;

const linuxPermissionsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="50" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="46" fill="#38bdf8" font-size="18" font-weight="bold">Figure 2.4: Linux File Permissions &amp; Octal Modes (chmod / chown)</text>
  <text x="660" y="45" fill="#94a3b8" font-size="12">TVET Rwanda NITLS501</text>

  <!-- Permissions Breakdown Card -->
  <rect x="30" y="80" width="790" height="150" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  
  <!-- File Type -->
  <rect x="50" y="100" width="60" height="60" rx="8" fill="#0f172a" stroke="#64748b"/>
  <text x="75" y="140" fill="#94a3b8" font-size="28" font-weight="bold">-</text>
  <text x="52" y="180" fill="#94a3b8" font-size="10">File Type (-/d/l)</text>

  <!-- User (Owner) -->
  <rect x="130" y="100" width="200" height="60" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <text x="160" y="140" fill="#34d399" font-size="26" font-weight="bold">r  w  x</text>
  <text x="145" y="180" fill="#10b981" font-size="11" font-weight="bold">USER (Owner): 4+2+1 = 7</text>

  <!-- Group -->
  <rect x="350" y="100" width="200" height="60" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
  <text x="380" y="140" fill="#38bdf8" font-size="26" font-weight="bold">r  -  x</text>
  <text x="365" y="180" fill="#0284c7" font-size="11" font-weight="bold">GROUP: 4+0+1 = 5</text>

  <!-- Others -->
  <rect x="570" y="100" width="200" height="60" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="600" y="140" fill="#fbbf24" font-size="26" font-weight="bold">r  -  -</text>
  <text x="585" y="180" fill="#f59e0b" font-size="11" font-weight="bold">OTHERS: 4+0+0 = 4</text>

  <rect x="50" y="195" width="720" height="26" rx="4" fill="#0284c7"/>
  <text x="210" y="213" fill="#ffffff" font-size="12" font-weight="bold">Complete Octal Mode: chmod 754 script.sh (Owner: rwx | Group: r-x | Others: r--)</text>

  <!-- Lower Table: Permission Values -->
  <rect x="30" y="245" width="380" height="150" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="45" y="270" fill="#38bdf8" font-size="12" font-weight="bold">Binary &amp; Numeric Values:</text>
  <text x="45" y="295" fill="#e2e8f0" font-size="11">• <tspan fill="#34d399">r (Read)</tspan> = 4 (Binary 100) — View file contents / list dir</text>
  <text x="45" y="320" fill="#e2e8f0" font-size="11">• <tspan fill="#38bdf8">w (Write)</tspan> = 2 (Binary 010) — Edit file / create files in dir</text>
  <text x="45" y="345" fill="#e2e8f0" font-size="11">• <tspan fill="#fbbf24">x (Execute)</tspan> = 1 (Binary 001) — Run binary or script / cd into dir</text>
  <text x="45" y="370" fill="#94a3b8" font-size="10">Special: SUID (4000), SGID (2000), Sticky Bit (1000 for /tmp)</text>

  <!-- Commands Card -->
  <rect x="430" y="245" width="390" height="150" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="445" y="270" fill="#10b981" font-size="12" font-weight="bold">Practical Terminal Commands:</text>
  <rect x="445" y="285" width="360" height="28" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="455" y="303" fill="#a7f3d0" font-size="11" font-family="monospace">chmod 755 /var/www/html/index.php</text>
  <rect x="445" y="320" width="360" height="28" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="455" y="338" fill="#a7f3d0" font-size="11" font-family="monospace">chown -R www-data:www-data /var/www/html</text>
  <rect x="445" y="355" width="360" height="28" rx="4" fill="#0f172a" stroke="#334155"/>
  <text x="455" y="373" fill="#a7f3d0" font-size="11" font-family="monospace">setfacl -m u:student:rwx /shared/project</text>
</svg>`;

const linuxServicesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 420" width="100%" height="100%" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">
  <rect x="20" y="15" width="810" height="50" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="46" fill="#38bdf8" font-size="18" font-weight="bold">Figure 3.1: Linux Network Server Services Architecture (DNS, DHCP, Web, File)</text>
  <text x="660" y="45" fill="#94a3b8" font-size="12">TVET Rwanda NITLS501</text>

  <!-- Central Server Box -->
  <rect x="20" y="80" width="810" height="315" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  
  <!-- Service 1: BIND9 DNS -->
  <rect x="40" y="100" width="180" height="135" rx="8" fill="#0f172a" stroke="#0284c7"/>
  <rect x="50" y="110" width="160" height="24" rx="4" fill="#0369a1"/>
  <text x="60" y="126" fill="#ffffff" font-size="11" font-weight="bold">BIND9 DNS (Port 53)</text>
  <text x="50" y="150" fill="#94a3b8" font-size="10">• Config: /etc/bind/named.conf</text>
  <text x="50" y="170" fill="#94a3b8" font-size="10">• Zone: db.rwandatvet.local</text>
  <text x="50" y="190" fill="#94a3b8" font-size="10">• A, CNAME, MX, PTR records</text>
  <text x="50" y="210" fill="#38bdf8" font-size="9" font-weight="bold">Status: systemctl status bind9</text>

  <!-- Service 2: ISC-DHCP -->
  <rect x="235" y="100" width="180" height="135" rx="8" fill="#0f172a" stroke="#10b981"/>
  <rect x="245" y="110" width="160" height="24" rx="4" fill="#047857"/>
  <text x="255" y="126" fill="#ffffff" font-size="11" font-weight="bold">ISC-DHCP (Port 67/68)</text>
  <text x="245" y="150" fill="#94a3b8" font-size="10">• Config: /etc/dhcp/dhcpd.conf</text>
  <text x="245" y="170" fill="#94a3b8" font-size="10">• Scope: 192.168.1.100 - 200</text>
  <text x="245" y="190" fill="#94a3b8" font-size="10">• Gateway: 192.168.1.1</text>
  <text x="245" y="210" fill="#34d399" font-size="9" font-weight="bold">Status: systemctl status isc-dhcp</text>

  <!-- Service 3: Apache2 / Nginx -->
  <rect x="430" y="100" width="180" height="135" rx="8" fill="#0f172a" stroke="#f59e0b"/>
  <rect x="440" y="110" width="160" height="24" rx="4" fill="#b45309"/>
  <text x="450" y="126" fill="#ffffff" font-size="11" font-weight="bold">Apache2 Web (80/443)</text>
  <text x="440" y="150" fill="#94a3b8" font-size="10">• Root: /var/www/html</text>
  <text x="440" y="170" fill="#94a3b8" font-size="10">• Sites: /etc/apache2/sites-available</text>
  <text x="440" y="190" fill="#94a3b8" font-size="10">• a2ensite, a2enmod ssl</text>
  <text x="440" y="210" fill="#fbbf24" font-size="9" font-weight="bold">Status: systemctl status apache2</text>

  <!-- Service 4: Samba & NFS -->
  <rect x="625" y="100" width="185" height="135" rx="8" fill="#0f172a" stroke="#8b5cf6"/>
  <rect x="635" y="110" width="165" height="24" rx="4" fill="#6d28d9"/>
  <text x="645" y="126" fill="#ffffff" font-size="11" font-weight="bold">Samba / NFS File Server</text>
  <text x="635" y="150" fill="#94a3b8" font-size="10">• Config: /etc/samba/smb.conf</text>
  <text x="635" y="170" fill="#94a3b8" font-size="10">• Shares: [PublicShare], [Home]</text>
  <text x="635" y="190" fill="#94a3b8" font-size="10">• NFS Exports: /etc/exports</text>
  <text x="635" y="210" fill="#c4b5fd" font-size="9" font-weight="bold">Status: smbd / nfs-kernel-server</text>

  <!-- Lower Terminal Log Box -->
  <rect x="40" y="250" width="770" height="130" rx="8" fill="#020617" stroke="#334155"/>
  <text x="55" y="275" fill="#38bdf8" font-size="11" font-weight="bold font-mono">root@linux-srv:~# systemctl status bind9 isc-dhcp-server apache2 smbd</text>
  <text x="55" y="300" fill="#10b981" font-size="11" font-family="monospace">● bind9.service - BIND Domain Name Server [ACTIVE (running)]</text>
  <text x="55" y="320" fill="#10b981" font-size="11" font-family="monospace">● isc-dhcp-server.service - ISC DHCP IPv4 server [ACTIVE (running)]</text>
  <text x="55" y="340" fill="#10b981" font-size="11" font-family="monospace">● apache2.service - The Apache HTTP Server [ACTIVE (running) - Port 80, 443]</text>
  <text x="55" y="360" fill="#10b981" font-size="11" font-family="monospace">● smbd.service - Samba SMB Daemon [ACTIVE (running) - Shares Online]</text>
</svg>`;

// ==========================================
// 2. PARTITION & ENRICH LINUX SERVER (NITLS501)
// ==========================================
const lsDoc = db.documents.find(d => d.id === 'doc_1792147281686');
if (lsDoc) {
  const fullText = (lsDoc.splitContent[1]?.content || lsDoc.textContent || '');
  console.log(`Original Linux content length: ${fullText.length}`);

  const tocStructure = [
    { title: 'Table of Contents (Full Trainee Manual Index)', marker: 'TABLE OF CONTENT', manualPage: 'vii' },
    { title: 'Module Overview: NITLS501 Linux Server Administration', marker: 'MODULE CODE AND TITLE: NITLS501 LINUX SERVER', manualPage: '2' },
    { title: 'Learning Outcome 1: Prepare Linux server Environment - Overview', marker: 'Learning Outcome 1: Prepare Linux server Environment', manualPage: '3' },
    { title: 'Indicative content 1.1: Identification of Linux server requirements', marker: 'Indicative content 1.1: Identification of Linux server requirements', manualPage: '6' },
    { title: 'Indicative content 1.2: Selection of Tools and Equipment', marker: 'Indicative content 1.2: Selection of Tools and Equipment', manualPage: '12' },
    { title: 'Indicative content 1.3: Installation of Linux OS', marker: 'Indicative content 1.3: Installation of Linux OS', manualPage: '18' },
    { title: 'Learning Outcome 1: End Assessment & Review Questions', marker: 'Learning outcome 1 end assessment', manualPage: '32' },
    { title: 'Learning Outcome 2: Manage Files and Directories - Overview', marker: 'Learning Outcome 2: Manage Files and Directories', manualPage: '36' },
    { title: 'Indicative content 2.1: Applying Basic Linux Commands', marker: 'Indicative content 2.1: Applying Basic Linux Commands', manualPage: '39' },
    { title: 'Indicative content 2.2: Creation of Linux files and Directories', marker: 'Indicative content 2.2: Creation of Linux files and Directories', manualPage: '55' },
    { title: 'Indicative content 2.3: Management of User and Groups', marker: 'Indicative content 2.3: Management of User and Groups', manualPage: '62' },
    { title: 'Indicative content 2.4: Application of files and directories permissions', marker: 'Indicative content 2.4: Application of files and directories permissions', manualPage: '77' },
    { title: 'Learning Outcome 2: End Assessment & Review Questions', marker: 'Learning Outcome 2 end assessment', manualPage: '83' },
    { title: 'Learning Outcome 3: Manage Linux services - Overview', marker: 'Learning Outcome 3: Manage Linux services', manualPage: '89' },
    { title: 'Indicative content 3.1: Configuration of DNS Service', marker: 'Indicative content 3.1: Configuration of DNS Service', manualPage: '92' },
    { title: 'Indicative content 3.2: Configuration of DHCP service', marker: 'Indicative content 3.2: Configuration of DHCP service', manualPage: '98' },
    { title: 'Indicative content 3.3: Configuration of File Server Service', marker: 'Indicative content 3.3: Configuration of File Server Service', manualPage: '102' },
    { title: 'Indicative content 3.4: Configuration of Web Server', marker: 'Indicative content 3.4: Configuration of Web Server', manualPage: '108' },
    { title: 'Indicative content 3.5: Configuration of Mail Server Service', marker: 'Indicative content 3.5: Configuration of Mail Server Service', manualPage: '113' },
    { title: 'Learning outcome 3: End Assessment & Review Questions', marker: 'Learning outcome 3 end assessment', manualPage: '119' }
  ];

  let lastIndex = 0;
  const slices = [];
  tocStructure.forEach((item, i) => {
    let pos = -1;
    if (i === 0) {
      pos = fullText.indexOf(item.marker);
    } else {
      const searchFrom = Math.max(lastIndex, 7000);
      pos = fullText.toLowerCase().indexOf(item.marker.toLowerCase(), searchFrom);
    }
    slices.push({ item, pos });
    lastIndex = pos + item.marker.length;
  });

  const linuxImages = [
    { url: svgUri(linuxArchitectureSvg), alt: 'Figure 1.1: GNU/Linux Operating System Architecture', caption: 'Kernel Space, User Space & System Call Interface in Linux Server' },
    { url: svgUri(linuxFhsSvg), alt: 'Figure 2.1: Linux Filesystem Hierarchy Standard (FHS)', caption: 'Directory tree hierarchy (/etc, /var, /usr, /home, /bin, /dev) in Linux' },
    { url: svgUri(linuxPermissionsSvg), alt: 'Figure 2.4: Linux File Permissions & Octal Modes', caption: 'chmod, chown, octal permission breakdown (rwx = 754) and Access Control Lists (ACLs)' },
    { url: svgUri(linuxServicesSvg), alt: 'Figure 3.1: Linux Network Server Services Architecture', caption: 'BIND9 DNS, ISC-DHCP, Apache2 Web Server, and Samba File Sharing daemons' }
  ];

  const newSections = [];
  for (let i = 0; i < slices.length; i++) {
    const startPos = slices[i].pos;
    const endPos = (i + 1 < slices.length) ? slices[i + 1].pos : fullText.length;
    let rawChunk = fullText.slice(startPos, endPos).trim();

    let attachedImages = [];
    if (i === 3) {
      // Indicative content 1.1
      attachedImages = [linuxImages[0]];
      rawChunk = `![Figure 1.1: GNU/Linux Operating System Architecture](${linuxImages[0].url})\n\n` + rawChunk;
    } else if (i === 8 || i === 9) {
      // Indicative content 2.1 / 2.2
      attachedImages = [linuxImages[1]];
      rawChunk = `![Figure 2.1: Linux Filesystem Hierarchy Standard (FHS)](${linuxImages[1].url})\n\n` + rawChunk;
    } else if (i === 11) {
      // Indicative content 2.4 (Permissions)
      attachedImages = [linuxImages[2]];
      rawChunk = `![Figure 2.4: Linux File Permissions & Octal Modes](${linuxImages[2].url})\n\n` + rawChunk;
    } else if (i === 14 || i === 15 || i === 17) {
      // Indicative content 3.1 / 3.2 / 3.4 (Services)
      attachedImages = [linuxImages[3]];
      rawChunk = `![Figure 3.1: Linux Network Server Services Architecture](${linuxImages[3].url})\n\n` + rawChunk;
    }

    // Section 0 is Table of Contents: build interactive links exactly like Window Server!
    if (i === 0) {
      rawChunk = `# Table of Contents: NITLS501 Linux Server Administration\n\n` +
        `> **Interactive Navigation:** Click any topic below to jump directly to that chapter in this manual.\n\n` +
        `AUTHOR’S NOTE PAGE (COPYRIGHT) ----------------------------------------------------------------------- iii\n` +
        `ACKNOWLEDGEMENTS ---------------------------------------------------------------------------------------- iv\n` +
        `TABLE OF CONTENT ------------------------------------------------------------------------------------------- vii\n` +
        `ACRONYMS ----------------------------------------------------------------------------------------------------- viii\n` +
        `INTRODUCTION ------------------------------------------------------------------------------------------------- 1\n` +
        `MODULE CODE AND TITLE: NITLS501 LINUX SERVER ADMINISTRATION -------------------------- 2\n` +
        `Learning Outcome 1: Prepare Linux server Environment --------------------------------------------- 3\n` +
        `Key Competencies for Learning Outcome 1 : Prepare Linux server Environment ----------------------- 4\n` +
        `Indicative content 1.1: Identification of Linux server requirements ---------------------------------------- 6\n` +
        `Indicative content 1.2: Selection of Tools and Equipment ---------------------------------------------------- 12\n` +
        `Indicative content 1.3: Installation of Linux OS ------------------------------------------------------------------ 18\n` +
        `Learning outcome 1 end assessment ------------------------------------------------------------------------------ 32\n` +
        `References --------------------------------------------------------------------------------------------------------------- 35\n` +
        `Learning Outcome 2: Manage Files and Directories --------------------------------------------------- 36\n` +
        `Key Competencies for Learning Outcome 2 : Manage Files and Directories ----------------------------- 37\n` +
        `Indicative content 2.1: Applying Basic Linux Commands ------------------------------------------------------ 39\n` +
        `Indicative content 2.2: Creation of Linux files and Directories----------------------------------------------- 55\n` +
        `Indicative content 2.3: Management of User and Groups ---------------------------------------------------- 62\n` +
        `Indicative content 2.4: Application of files and directories permissions ---------------------------------- 77\n` +
        `Learning Outcome 2 end assessment ------------------------------------------------------------------------------ 83\n` +
        `References --------------------------------------------------------------------------------------------------------------- 88\n` +
        `Learning Outcome 3: Manage Linux services------------------------------------------------------------ 89\n` +
        `Key Competencies for Learning Outcome 3: Manage Linux services--------------------------------------- 90\n` +
        `Indicative content 3.1: Configuration of DNS Service ---------------------------------------------------------- 92\n` +
        `Indicative content 3.2: Configuration of DHCP service -------------------------------------------------------- 98\n` +
        `Indicative content 3.3: Configuration of File Server Service ------------------------------------------------ 102\n` +
        `Indicative content 3.4: Configuration of Web Server -------------------------------------------------------- 108\n` +
        `Indicative content 3.5: Configuration of Mail Server Service ---------------------------------------------- 113\n` +
        `Learning outcome 3 end assessment ---------------------------------------------------------------------------- 119\n` +
        `References ------------------------------------------------------------------------------------------------------------- 122\n\n` +
        rawChunk;
    }

    let sectionText = rawChunk;
    if (!sectionText.startsWith('# ')) {
      sectionText = `# ${slices[i].item.title}\n\n` + sectionText;
    }

    newSections.push({
      id: `sec_nitls501_${i + 1}`,
      title: slices[i].item.title,
      content: sectionText,
      pageNumber: i + 1,
      manualPage: slices[i].item.manualPage,
      images: attachedImages
    });
  }

  lsDoc.splitContent = newSections;
  lsDoc.images = linuxImages;
  lsDoc.hasDrawings = true;
  console.log(`Successfully partitioned Linux Server into ${newSections.length} structured sections with 4 SVG diagrams!`);
}

// ==========================================
// 3. ENRICH CYBER SECURITY (NITCS501)
// ==========================================
const csDoc = db.documents.find(d => d.id === 'doc_1791973820187');
if (csDoc) {
  const csToc = `# Table of Contents: NITCS501 Cyber Security Principles & National Standards\n\n` +
    `> **Interactive Navigation:** Click any topic below to jump directly to that chapter in this manual.\n\n` +
    `MODULE CODE AND TITLE: NITCS501 CYBER SECURITY -------------------------------------- 1\n` +
    `Learning Outcome 1: Information Security Architecture & CIA Triad ----------------------- 3\n` +
    `Indicative content 1.1: Threat Vectors, Vulnerabilities & Risk Assessment ---------------- 6\n` +
    `Indicative content 1.2: Network Defense, Firewalls & DMZ Topologies -------------------- 14\n` +
    `Learning outcome 1 end assessment ----------------------------------------------------------- 28\n` +
    `Learning Outcome 2: Cryptography & Public Key Infrastructure (PKI) ------------------- 32\n` +
    `Indicative content 2.1: Symmetric & Asymmetric Encryption, AES, RSA & Hashing -------- 36\n` +
    `Indicative content 2.2: Digital Certificates, CA Hierarchy & SSL/TLS Handshake ------- 48\n` +
    `Indicative content 2.3: Identity & Access Management (IAM), Authentication & RBAC --- 58\n` +
    `Learning outcome 2 end assessment ----------------------------------------------------------- 68\n\n` +
    `The Rwanda TVET Board (RTB) Certificate V in Cyber Security establishes competencies for enterprise protection, vulnerability analysis, encryption implementation, and perimeter defense.`;

  const existingSecs = csDoc.splitContent || [];
  const sec1Text = existingSecs[0]?.content || '';
  const sec2Text = existingSecs[1]?.content || '';
  const sec3Text = existingSecs[2]?.content || '';
  const sec4Text = existingSecs[3]?.content || '';

  const csSections = [
    {
      id: 'sec_nitcs501_0',
      title: 'Table of Contents (Full Trainee Manual Index)',
      content: csToc,
      pageNumber: 1,
      manualPage: 'vii'
    },
    {
      id: 'sec_nitcs501_1',
      title: 'Module Overview: NITCS501 Cyber Security Principles',
      content: `# Module Overview: NITCS501 Cyber Security Principles\n\nMODULE CODE AND TITLE: NITCS501 CYBER SECURITY\n\nThis module delivers core competencies for TVET Certificate V students in securing computer networks, data repositories, operating system environments, and cryptography.\n\n### Learning Outcomes:\n1. Implement Information Security Principles & CIA Triad.\n2. Apply Network Defense, Firewall Architectures & DMZ Segmentation.\n3. Deploy Cryptography, PKI Digital Certificates & Key Management.\n4. Enforce Identity, Authentication & Role-Based Access Control (RBAC).`,
      pageNumber: 2,
      manualPage: '1'
    },
    {
      id: 'sec_nitcs501_2',
      title: 'Learning Outcome 1: Information Security Architecture & CIA Triad - Overview',
      content: `# Learning Outcome 1: Information Security Architecture & CIA Triad - Overview\n\n${sec1Text}`,
      pageNumber: 3,
      manualPage: '3'
    },
    {
      id: 'sec_nitcs501_3',
      title: 'Indicative content 1.1: Threat Vectors, Vulnerabilities & Risk Assessment',
      content: `# Indicative content 1.1: Threat Vectors, Vulnerabilities & Risk Assessment\n\n### Core Security Concepts:\n- **Threat**: An agent or event with the potential to cause harm to an asset (e.g., malware, phishing, unauthorized access).\n- **Vulnerability**: A flaw or weakness in system design, implementation, or operation (e.g., unpatched software, weak passwords, SQL injection).\n- **Risk**: The probability that a threat will exploit a vulnerability multiplied by the resulting business impact: **Risk = Threat × Vulnerability × Impact**.\n\n### Threat Classification (STRIDE Model):\n1. **Spoofing**: Pretending to be someone else.\n2. **Tampering**: Modifying data in transit or at rest.\n3. **Repudiation**: Denying that an action was performed.\n4. **Information Disclosure**: Unauthorized data access.\n5. **Denial of Service**: Overwhelming system resources.\n6. **Elevation of Privilege**: Gaining unauthorized root/admin rights.`,
      pageNumber: 4,
      manualPage: '6'
    },
    {
      id: 'sec_nitcs501_4',
      title: 'Indicative content 1.2: Network Defense, Firewalls & DMZ Topologies',
      content: `# Indicative content 1.2: Network Defense, Firewalls & DMZ Topologies\n\n${sec2Text}`,
      pageNumber: 5,
      manualPage: '14'
    },
    {
      id: 'sec_nitcs501_5',
      title: 'Learning Outcome 1: End Assessment & Practical Review Questions',
      content: `# Learning Outcome 1: End Assessment & Practical Review Questions\n\n### Knowledge Evaluation Questions:\n1. Define the three components of the CIA Triad and provide one technology used to enforce each.\n2. Explain the difference between stateful inspection firewalls and next-generation application firewalls.\n3. Why is a DMZ (Demilitarized Zone) essential when deploying public-facing web or mail servers?\n4. What is the STRIDE threat model, and how does it assist security architects?\n\n### Hands-On Lab Exercise:\n- Configure an iptables or Windows Defender Firewall rule to block inbound ICMP echo requests while allowing inbound TCP port 443 (HTTPS).`,
      pageNumber: 6,
      manualPage: '28'
    },
    {
      id: 'sec_nitcs501_6',
      title: 'Learning Outcome 2: Cryptography & Public Key Infrastructure (PKI) - Overview',
      content: `# Learning Outcome 2: Cryptography & Public Key Infrastructure (PKI) - Overview\n\n${sec3Text}`,
      pageNumber: 7,
      manualPage: '32'
    },
    {
      id: 'sec_nitcs501_7',
      title: 'Indicative content 2.1: Symmetric & Asymmetric Encryption, AES, RSA & Hashing',
      content: `# Indicative content 2.1: Symmetric & Asymmetric Encryption, AES, RSA & Hashing\n\n### 1. Symmetric Key Encryption\n- Single secret key shared between sender and receiver.\n- Algorithms: AES-128, AES-256, ChaCha20.\n- Very high speed; suitable for bulk data and disk encryption (BitLocker, LUKS).\n\n### 2. Asymmetric Key Cryptography (Public-Key)\n- Key pairs: Public Key (encrypt/verify) and Private Key (decrypt/sign).\n- Algorithms: RSA (2048/4096-bit), ECC (Elliptic Curve Cryptography), Diffie-Hellman.\n- Solves the key exchange problem; used for TLS handshakes and SSH authentication.\n\n### 3. Cryptographic Hashing\n- One-way mathematical function producing a fixed-size digest.\n- Algorithms: SHA-256, SHA-512, bcrypt, Argon2.\n- Guarantees integrity; prevents tampering.`,
      pageNumber: 8,
      manualPage: '36'
    },
    {
      id: 'sec_nitcs501_8',
      title: 'Indicative content 2.2: Digital Certificates, CA Hierarchy & SSL/TLS Handshake',
      content: `# Indicative content 2.2: Digital Certificates, CA Hierarchy & SSL/TLS Handshake\n\n### X.509 Digital Certificates\nAn electronic passport that binds an entity's identity to their public key, signed by a trusted Certificate Authority (CA).\n\n### TLS 1.3 Handshake Protocol:\n1. **ClientHello**: Supported cipher suites and key share.\n2. **ServerHello**: Selected cipher suite, server certificate, server key share.\n3. **Certificate Verification**: Client validates CA chain to Trusted Root Store.\n4. **Session Keys Generated**: Both sides compute symmetric AES-GCM session key.\n5. **Encrypted Application Data**: Secure HTTPS transmission begins.`,
      pageNumber: 9,
      manualPage: '48'
    },
    {
      id: 'sec_nitcs501_9',
      title: 'Indicative content 2.3: Identity & Access Management (IAM), Authentication & RBAC',
      content: `# Indicative content 2.3: Identity & Access Management (IAM), Authentication & RBAC\n\n${sec4Text}`,
      pageNumber: 10,
      manualPage: '58'
    },
    {
      id: 'sec_nitcs501_10',
      title: 'Learning Outcome 2: End Assessment & Practical Review Questions',
      content: `# Learning Outcome 2: End Assessment & Practical Review Questions\n\n### Knowledge Evaluation Questions:\n1. Compare AES-256 with RSA-2048 in terms of computational overhead and key distribution.\n2. What is a Certificate Revocation List (CRL) and how does OCSP (Online Certificate Status Protocol) improve revocation verification?\n3. Describe the Principle of Least Privilege in Role-Based Access Control (RBAC).\n4. Why should user passwords never be stored using standard unsalted SHA-256 hashes? What is password salting?`,
      pageNumber: 11,
      manualPage: '68'
    }
  ];

  csDoc.splitContent = csSections;
  csDoc.hasDrawings = true;
  console.log(`Successfully partitioned Cyber Security into ${csSections.length} structured sections!`);
}

// ==========================================
// 4. ENRICH CCNA NETWORKING
// ==========================================
const ccnaDoc = db.documents.find(d => d.id === 'doc_1791973062068');
if (ccnaDoc) {
  const ccnaToc = `# Table of Contents: CCNA 200-301 Enterprise Networking & Switching Guide\n\n` +
    `> **Interactive Navigation:** Click any topic below to jump directly to that chapter in this manual.\n\n` +
    `MODULE CODE AND TITLE: CCNA 200-301 ENTERPRISE NETWORKING ------------------------- 1\n` +
    `Chapter 1: OSI 7-Layer Reference Model & TCP/IP Protocol Stack ------------------------- 4\n` +
    `Chapter 2: Ethernet Switching, MAC Learning & IEEE 802.1Q VLAN Trunking ------------- 18\n` +
    `Chapter 3: IP Routing Fundamentals & OSPF Single-Area Configuration ------------------ 34\n` +
    `Chapter 4: Network Services (DHCP, NAT/PAT & DNS) --------------------------------------- 52\n` +
    `Chapter 5: Network Security & Access Control Lists (Standard & Extended ACLs) ------- 68\n` +
    `Chapter 6: Practical Packet Tracer Lab Guide & Exam Self-Assessment -------------------- 84\n\n` +
    `Official study curriculum and lab guide for Cisco Certified Network Associate (CCNA 200-301).`;

  const existingSecs = ccnaDoc.splitContent || [];
  const sec1Text = existingSecs[0]?.content || '';
  const sec2Text = existingSecs[1]?.content || '';

  const ccnaSections = [
    {
      id: 'sec_ccna_0',
      title: 'Table of Contents (Full Trainee Manual Index)',
      content: ccnaToc,
      pageNumber: 1,
      manualPage: 'vii'
    },
    {
      id: 'sec_ccna_1',
      title: 'Module Overview: CCNA 200-301 Enterprise Networking',
      content: `# Module Overview: CCNA 200-301 Enterprise Networking\n\nMODULE CODE AND TITLE: CCNA 200-301 ENTERPRISE NETWORKING & SWITCHING\n\nThis comprehensive study and lab manual prepares engineering students for Cisco CCNA certification and enterprise network deployments.\n\n### Core Topics:\n- Layer 2 Switching, Spanning Tree Protocol (STP), and VLANs.\n- Layer 3 Routing, CIDR Subnetting, and OSPFv2 / OSPFv3.\n- IP Services: DHCP Helper, NAT/PAT, NTP, and SNMP.\n- Network Security: Port Security, ACLs, and SSH configuration.`,
      pageNumber: 2,
      manualPage: '1'
    },
    {
      id: 'sec_ccna_2',
      title: 'Chapter 1: OSI 7-Layer Reference Model & TCP/IP Protocol Stack',
      content: `# Chapter 1: OSI 7-Layer Reference Model & TCP/IP Protocol Stack\n\n${sec1Text}`,
      pageNumber: 3,
      manualPage: '4'
    },
    {
      id: 'sec_ccna_3',
      title: 'Chapter 2: Ethernet Switching, MAC Learning & IEEE 802.1Q VLAN Trunking',
      content: `# Chapter 2: Ethernet Switching, MAC Learning & IEEE 802.1Q VLAN Trunking\n\n${sec2Text}`,
      pageNumber: 4,
      manualPage: '18'
    },
    {
      id: 'sec_ccna_4',
      title: 'Chapter 3: IP Routing Fundamentals & OSPF Single-Area Configuration',
      content: `# Chapter 3: IP Routing Fundamentals & OSPF Single-Area Configuration\n\n### 1. Routing Fundamentals\nRouters forward packets between different IP subnets based on destination IP address and the routing table.\n\n### 2. OSPF (Open Shortest Path First)\n- Link-State Interior Gateway Protocol (IGP).\n- Metric: Cost (calculated as 100 Mbps / Bandwidth in bps).\n- Uses Dijkstra Shortest Path First (SPF) algorithm.\n- Forms neighbor adjacencies using Hello packets sent to multicast 224.0.0.5.\n\n\`\`\`cisco\nRouter(config)# router ospf 1\nRouter(config-router)# router-id 1.1.1.1\nRouter(config-router)# network 192.168.10.0 0.0.0.255 area 0\nRouter(config-router)# network 10.0.0.0 0.0.0.3 area 0\nRouter(config-router)# passive-interface GigabitEthernet0/0\nRouter(config-router)# exit\n\`\`\`\n\n### Verification Commands:\n- \`show ip route ospf\`\n- \`show ip ospf neighbor\`\n- \`show ip ospf interface brief\``,
      pageNumber: 5,
      manualPage: '34'
    },
    {
      id: 'sec_ccna_5',
      title: 'Chapter 4: Network Services (DHCP, NAT/PAT & DNS)',
      content: `# Chapter 4: Network Services (DHCP, NAT/PAT & DNS)\n\n### 1. DHCP on Cisco IOS Routers\n\`\`\`cisco\nRouter(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10\nRouter(config)# ip dhcp pool LAN_POOL\nRouter(dhcp-config)# network 192.168.10.0 255.255.255.0\nRouter(dhcp-config)# default-router 192.168.10.1\nRouter(dhcp-config)# dns-server 8.8.8.8 192.168.10.2\nRouter(dhcp-config)# exit\n\`\`\`\n\n### 2. Port Address Translation (PAT / NAT Overload)\n\`\`\`cisco\nRouter(config)# access-list 1 permit 192.168.10.0 0.0.0.255\nRouter(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload\nRouter(config)# interface GigabitEthernet0/0\nRouter(config-if)# ip nat inside\nRouter(config)# interface GigabitEthernet0/1\nRouter(config-if)# ip nat outside\n\`\`\``,
      pageNumber: 6,
      manualPage: '52'
    },
    {
      id: 'sec_ccna_6',
      title: 'Chapter 5: Network Security & Access Control Lists (Standard & Extended ACLs)',
      content: `# Chapter 5: Network Security & Access Control Lists (Standard & Extended ACLs)\n\n### ACL Rules:\n1. Processed sequentially top-to-bottom.\n2. First match applies.\n3. Implicit deny all at the bottom (\`deny ip any any\`).\n\n### Standard ACL (1-99): Filters based on Source IP only. Place closest to destination.\n\`\`\`cisco\nRouter(config)# access-list 10 permit 192.168.10.50 0.0.0.0\nRouter(config)# interface GigabitEthernet0/0\nRouter(config-if)# ip access-group 10 out\n\`\`\`\n\n### Extended ACL (100-199): Filters based on Protocol, Source IP, Dest IP, Port. Place closest to source.\n\`\`\`cisco\nRouter(config)# ip access-list extended BLOCK_WEB\nRouter(config-ext-nacl)# deny tcp 192.168.10.0 0.0.0.255 any eq 80\nRouter(config-ext-nacl)# deny tcp 192.168.10.0 0.0.0.255 any eq 443\nRouter(config-ext-nacl)# permit ip any any\nRouter(config-ext-nacl)# exit\n\`\`\``,
      pageNumber: 7,
      manualPage: '68'
    },
    {
      id: 'sec_ccna_7',
      title: 'Chapter 6: Practical Packet Tracer Lab Guide & Exam Self-Assessment',
      content: `# Chapter 6: Practical Packet Tracer Lab Guide & Exam Self-Assessment\n\n### CCNA Practice Questions:\n1. A switch receives a frame with an unknown destination MAC address. What action does it take?\n   - A) Drops the frame.\n   - B) Sends to default gateway.\n   - C) Floods frame out all ports except receiving port. (Correct)\n   - D) Stores in NVRAM.\n\n2. Which metric does OSPF use to determine the best path to a destination network?\n   - A) Hop count\n   - B) Bandwidth (Cost) (Correct)\n   - C) Delay and Reliability\n   - D) Load\n\n3. What is the default administrative distance of OSPF in Cisco IOS?\n   - Answer: **110** (EIGRP internal is 90, RIP is 120, Static route is 1, Directly connected is 0).`,
      pageNumber: 8,
      manualPage: '84'
    }
  ];

  ccnaDoc.splitContent = ccnaSections;
  ccnaDoc.hasDrawings = true;
  console.log(`Successfully partitioned CCNA Networking into ${ccnaSections.length} structured sections!`);
}

fs.writeFileSync(storePath, JSON.stringify(db, null, 2));
console.log('Finished updating db_store.json successfully!');
