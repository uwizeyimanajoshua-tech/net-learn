const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'db_store.json');
const db = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));

// Filter out junk test uploads like package.json, test_binary.pdf, test_syllabus.pdf
const cleanedDocs = db.documents.filter(d => {
  const badNames = ['package.json', 'test_binary.pdf', 'test_syllabus.pdf', 'test_network_note.txt'];
  if (badNames.includes(d.name)) return false;
  // If C Programming currently has Window Server, remove that corrupted entry
  if (d.category === 'C Programming' && d.name.includes('Window Server')) return false;
  return true;
});

// Ensure existing documents have textContent populated from their sections
cleanedDocs.forEach(d => {
  if (!d.textContent || d.textContent.trim().length === 0) {
    if (d.splitContent && d.splitContent.length > 0) {
      d.textContent = d.splitContent.map(s => `${s.title}\n\n${s.content}`).join('\n\n');
    }
  }
});

const NEW_MODULES = [
  {
    category: 'C Programming',
    code: 'NITCP401',
    name: 'TeM_NITCP401_C_Programming_and_Systems_Development.pdf',
    title: 'C Programming & Systems Development (GCC 12.3)',
    desc: 'Low-level systems programming, pointers, heap dynamic memory allocation, structs, x86_64 assembly, and network sockets.',
    chapters: [
      {
        title: 'Table of Contents: C Programming & Systems Development',
        content: `# Table of Contents: C Systems Programming

MODULE CODE AND TITLE: NITCP401 C PROGRAMMING & SYSTEMS DEVELOPMENT

1. Chapter 1: C Syntax, Data Types, Bitwise Operators & Memory Layout
2. Chapter 2: Pointers, Pointer Arithmetic & References
3. Chapter 3: Dynamic Heap Memory Allocation (malloc, calloc, realloc, free)
4. Chapter 4: Structures, Unions & Complex Data Structures
5. Chapter 5: File I/O, POSIX System Calls & Buffer Management
6. Chapter 6: Network Socket Programming (TCP/UDP Sockets in C)
7. Chapter 7: Memory Safety, Valgrind Debugging & Exam Review`
      },
      {
        title: 'Chapter 1: Memory Architecture, Pointers & Dynamic Allocation',
        content: `# Chapter 1: Memory Architecture, Pointers & Dynamic Allocation

In C systems programming, understanding memory layout (Stack vs. Heap vs. Data vs. Text) is critical.

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    char hostname[64];
    unsigned int ip_address;
} NetworkNode;

int main(void) {
    // Dynamic heap allocation
    NetworkNode *switchNode = (NetworkNode *)malloc(sizeof(NetworkNode));
    if (!switchNode) {
        perror("Allocation failed");
        return 1;
    }

    switchNode->id = 101;
    snprintf(switchNode->hostname, sizeof(switchNode->hostname), "Core-SW-01");
    switchNode->ip_address = 0xC0A80101; // 192.168.1.1

    printf("Node ID: %d | Host: %s | IP: 0x%X\\n", switchNode->id, switchNode->hostname, switchNode->ip_address);

    free(switchNode);
    switchNode = NULL; // Prevent dangling pointer
    return 0;
}
\`\`\`

### Key Pointer Rules:
- Always check if \`malloc\` returns \`NULL\`.
- Every \`malloc\` or \`calloc\` MUST have a matching \`free\`.
- Set freed pointers to \`NULL\` to eliminate use-after-free vulnerabilities.`
      },
      {
        title: 'Chapter 2: Socket Programming & Network Server in C',
        content: `# Chapter 2: Network Socket Programming in C

C provides direct access to Berkeley Sockets via POSIX headers.

\`\`\`c
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <string.h>
#include <stdio.h>

int create_server(int port) {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    bind(server_fd, (struct sockaddr *)&address, sizeof(address));
    listen(server_fd, 5);
    return server_fd;
}
\`\`\`

### Core Socket Workflow:
1. \`socket()\` - Create endpoint socket descriptor.
2. \`bind()\` - Bind socket to local IP and Port.
3. \`listen()\` - Set socket to passive listening mode.
4. \`accept()\` - Accept incoming client TCP handshake.
5. \`recv()\` / \`send()\` - Transmit byte streams.`
      }
    ]
  },
  {
    category: 'Database',
    code: 'NITDB401',
    name: 'TeM_NITDB401_Relational_Databases_and_PostgreSQL.pdf',
    title: 'Relational Database Administration & PostgreSQL',
    desc: 'Relational schema design, ACID transactions, PostgreSQL administration, indexing strategies, and SQL optimization.',
    chapters: [
      {
        title: 'Table of Contents: Relational Databases & PostgreSQL',
        content: `# Table of Contents: Relational Databases & PostgreSQL

MODULE CODE AND TITLE: NITDB401 RELATIONAL DATABASES & POSTGRESQL

1. Chapter 1: Relational Data Model, Normalization (1NF, 2NF, 3NF, BCNF)
2. Chapter 2: DDL, DML & Advanced SQL Queries (Joins, Aggregations, CTEs)
3. Chapter 3: ACID Transactions & Concurrency Control (MVCC)
4. Chapter 4: Indexing Techniques (B-Tree, Hash, GIN, GiST, BRIN)
5. Chapter 5: PostgreSQL Server Administration & Security Roles
6. Chapter 6: Backup, Replication (WAL, Streaming) & Disaster Recovery`
      },
      {
        title: 'Chapter 1: Relational Modeling & Advanced SQL Joins',
        content: `# Chapter 1: Relational Modeling & Advanced SQL Joins

Relational database systems organize structured data into normalized tables with primary and foreign key constraints.

\`\`\`sql
-- Create enterprise students schema with constraints
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_code VARCHAR(20) NOT NULL,
    final_grade NUMERIC(4, 2) CHECK (final_grade BETWEEN 0 AND 100)
);

-- Advanced query with CTE and Window functions
WITH CourseAverages AS (
    SELECT 
        course_code,
        ROUND(AVG(final_grade), 2) as avg_course_score
    FROM enrollments
    GROUP BY course_code
)
SELECT 
    s.full_name,
    e.course_code,
    e.final_grade,
    ca.avg_course_score
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN CourseAverages ca ON e.course_code = ca.course_code
WHERE e.final_grade >= ca.avg_course_score;
\`\`\`

### ACID Properties:
- **Atomicity**: All or nothing transaction completion.
- **Consistency**: State changes satisfy all database constraints.
- **Isolation**: Concurrent transactions do not interfere (PostgreSQL MVCC).
- **Durability**: Committed data persists despite hardware failure.`
      }
    ]
  },
  {
    category: 'Cloud Computing',
    code: 'NITCC501',
    name: 'TeM_NITCC501_Cloud_Computing_and_Virtualization.pdf',
    title: 'Cloud Computing Architecture & Infrastructure',
    desc: 'Public and hybrid cloud paradigms, IaaS/PaaS/SaaS models, hypervisors, Docker containers, Kubernetes, and VPC networking.',
    chapters: [
      {
        title: 'Table of Contents: Cloud Computing & Virtualization',
        content: `# Table of Contents: Cloud Computing Architecture

MODULE CODE AND TITLE: NITCC501 CLOUD COMPUTING & VIRTUALIZATION

1. Chapter 1: Cloud Service Models (IaaS, PaaS, SaaS) & Deployment Architectures
2. Chapter 2: Virtualization Technologies: Type-1 (Bare Metal) vs. Type-2 Hypervisors
3. Chapter 3: Containerization with Docker & Container Orchestration
4. Chapter 4: Cloud Networking: Virtual Private Clouds (VPC), Subnets & Gateways
5. Chapter 5: High Availability, Auto-Scaling & Load Balancing
6. Chapter 6: Cloud Security: IAM Policies, Encryption & Compliance`
      },
      {
        title: 'Chapter 1: Hypervisors, Containers & VPC Cloud Networking',
        content: `# Chapter 1: Hypervisors, Containers & VPC Cloud Networking

Cloud architecture relies on virtualization to abstract physical hardware into elastic, multi-tenant resources.

### Virtualization vs Containerization:
- **Type-1 Hypervisor (ESXi, KVM, Proxmox)**: Runs directly on hardware; optimal efficiency.
- **Type-2 Hypervisor (VirtualBox, VMware Workstation)**: Runs inside an OS.
- **Containers (Docker, containerd)**: Share the host OS kernel, providing instant startup (~100ms) and minimal overhead.

\`\`\`yaml
# Docker Compose microservice cloud stack
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    restart: always
  app:
    image: node:20-alpine
    environment:
      - NODE_ENV=production
    restart: always
\`\`\``
      }
    ]
  },
  {
    category: 'AI',
    code: 'NITAI501',
    name: 'TeM_NITAI501_Artificial_Intelligence_and_Neural_Networks.pdf',
    title: 'Artificial Intelligence & Neural Networks',
    desc: 'Heuristic search algorithms, expert systems, artificial neural networks, deep learning, NLP, and computer vision.',
    chapters: [
      {
        title: 'Table of Contents: Artificial Intelligence & Neural Networks',
        content: `# Table of Contents: Artificial Intelligence & Neural Networks

MODULE CODE AND TITLE: NITAI501 ARTIFICIAL INTELLIGENCE & NEURAL NETWORKS

1. Chapter 1: Foundations of Artificial Intelligence & Search Algorithms (A*, Minimax)
2. Chapter 2: Knowledge Representation & Rule-Based Expert Systems
3. Chapter 3: Perceptron, Multi-Layer Perceptrons & Backpropagation
4. Chapter 4: Convolutional Neural Networks (CNN) for Computer Vision
5. Chapter 5: Transformers, Self-Attention & Large Language Models (LLMs)
6. Chapter 6: AI Ethics, Bias Mitigation & Production Model Serving`
      },
      {
        title: 'Chapter 1: Deep Learning Fundamentals & Neural Convergence',
        content: `# Chapter 1: Deep Learning Fundamentals & Neural Convergence

Artificial Neural Networks (ANNs) map complex high-dimensional feature spaces through forward propagation and gradient descent.

\`\`\`python
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def sigmoid_derivative(a):
    return a * (1.0 - a)

# Simple neural layer forward pass
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]]) # XOR Inputs
W = np.random.randn(2, 4) # Hidden weights
b = np.zeros((1, 4))

hidden_activations = sigmoid(np.dot(X, W) + b)
print("Hidden layer activations shape:", hidden_activations.shape)
\`\`\`

### Core Equations:
- Forward propagation: $z = W \\cdot x + b$, $a = \\sigma(z)$
- Mean Squared Error Loss: $\\mathcal{L} = \\frac{1}{2n} \\sum (y - \\hat{y})^2$
- Weight update rule: $W \\leftarrow W - \\alpha \\frac{\\partial \\mathcal{L}}{\\partial W}$`
      }
    ]
  },
  {
    category: 'Fiber Optics',
    code: 'NITFO401',
    name: 'TeM_NITFO401_Fiber_Optic_Communications_and_Splicing.pdf',
    title: 'Fiber Optic Communications & Splicing',
    desc: 'Single-mode vs multi-mode fiber, light transmission, fusion splicing, OTDR link testing, and optical power budget.',
    chapters: [
      {
        title: 'Table of Contents: Fiber Optic Communications',
        content: `# Table of Contents: Fiber Optic Communications

MODULE CODE AND TITLE: NITFO401 FIBER OPTIC COMMUNICATIONS

1. Chapter 1: Principles of Light Transmission & Total Internal Reflection
2. Chapter 2: Single-Mode (SMF) vs. Multi-Mode (MMF) Fiber Standards (OM1-OM5, OS1-OS2)
3. Chapter 3: Optical Connectors (LC, SC, ST, MPO) & Polishing (PC, UPC, APC)
4. Chapter 4: Mechanical vs. Fusion Splicing Procedures & Cleaving Techniques
5. Chapter 5: Link Testing with Optical Time Domain Reflectometer (OTDR) & VFL
6. Chapter 6: Optical Power Budget Calculations & Fiber Safety Rules`
      },
      {
        title: 'Chapter 1: Optical Physics, Splicing & OTDR Diagnostics',
        content: `# Chapter 1: Optical Physics, Splicing & OTDR Diagnostics

Fiber optic links transmit digital information as light pulses guided through high-purity silica glass cores.

### Core Principles:
- **Refractive Index ($n$)**: $n = \\frac{c}{v}$. The core has higher refractive index ($n_1$) than the cladding ($n_2$), causing **Total Internal Reflection**.
- **Single-Mode Fiber (SMF - 9µm core)**: Uses laser diodes (1310nm, 1550nm) for long distances (up to 80km+).
- **Multi-Mode Fiber (MMF - 50/62.5µm core)**: Uses LEDs/VCSELs (850nm, 1300nm) for campus backbones (< 550m).

### Fusion Splicing Workflow:
1. Strip outer jacket (250µm coating down to 125µm cladding).
2. Clean fiber end with 99.9% isopropyl alcohol.
3. Precision cleave at 90° angle.
4. Align cores in fusion splicer and electric arc discharge.
5. Target splice loss: $< 0.05 \\text{ dB}$.`
      }
    ]
  },
  {
    category: 'Wireless Indoor',
    code: 'NITWI401',
    name: 'TeM_NITWI401_Wireless_Indoor_Networking_and_WLAN.pdf',
    title: 'Wireless Indoor Networking & WLAN Administration',
    desc: 'IEEE 802.11 Wi-Fi standards, 2.4GHz/5GHz/6GHz radio bands, access point placement, WPA3 Enterprise, and roaming.',
    chapters: [
      {
        title: 'Table of Contents: Wireless Indoor Networking',
        content: `# Table of Contents: Wireless Indoor WLAN

MODULE CODE AND TITLE: NITWI401 WIRELESS INDOOR NETWORKING

1. Chapter 1: RF Fundamentals: Frequency, Wavelength, RSSI, SNR, and Attenuation
2. Chapter 2: Wi-Fi Standards: 802.11n (Wi-Fi 4), 802.11ac (Wi-Fi 5), 802.11ax (Wi-Fi 6/6E), 802.11be (Wi-Fi 7)
3. Chapter 3: Indoor Access Point Survey, Channel Planning (Non-overlapping 1, 6, 11)
4. Chapter 4: Enterprise WLAN Controllers, SSIDs, and 802.1Q VLAN Mapping
5. Chapter 5: Wi-Fi Security: WEP, WPA2-Personal, WPA3-Enterprise & 802.1X RADIUS
6. Chapter 6: Troubleshooting Interference, Co-Channel Contention & Hidden Nodes`
      },
      {
        title: 'Chapter 1: 802.11 Architecture, Channels & WPA3 Security',
        content: `# Chapter 1: 802.11 Architecture, Channels & WPA3 Security

Modern indoor WLANs use multi-band access points to deliver multi-gigabit throughput.

### 2.4 GHz vs 5 GHz vs 6 GHz:
- **2.4 GHz**: 3 non-overlapping channels (1, 6, 11) in 20 MHz width. Superior wall penetration, higher interference.
- **5 GHz**: 24+ non-overlapping channels. Supports 40, 80, and 160 MHz channel bonding.
- **6 GHz (Wi-Fi 6E/7)**: 1200 MHz of pristine spectrum, zero legacy 802.11b/g overhead.

\`\`\`bash
# Scan wireless access points and signal strength in Linux
nmcli dev wifi list
# Monitor indoor Wi-Fi connection metrics
iwconfig wlan0
\`\`\``
      }
    ]
  },
  {
    category: 'Wireless Outdoor',
    code: 'NITWO401',
    name: 'TeM_NITWO401_Wireless_Outdoor_Microwave_and_Antenna_Systems.pdf',
    title: 'Wireless Outdoor Microwave & Antenna Systems',
    desc: 'Point-to-Point (PtP) and Point-to-MultiPoint (PtMP) links, Fresnel zones, antenna gain, link budget, and lightning surge protection.',
    chapters: [
      {
        title: 'Table of Contents: Wireless Outdoor Microwave Systems',
        content: `# Table of Contents: Wireless Outdoor Systems

MODULE CODE AND TITLE: NITWO401 WIRELESS OUTDOOR MICROWAVE & ANTENNA SYSTEMS

1. Chapter 1: Outdoor Radio Propagation, Line of Sight (LOS), nLOS, and NLOS
2. Chapter 2: Fresnel Zone Clearance Calculations & Earth Curvature Adjustments
3. Chapter 3: Antenna Types: Parabolic Dish, Sector, Yagi, and Omnidirectional Antennas
4. Chapter 4: Free Space Path Loss (FSPL) and Complete Link Budget Equation
5. Chapter 5: Tower Rigging, Pole Mounting, Optical Alignment & Weatherproofing
6. Chapter 6: Lightning Surge Arrestors, Tower Grounding (Single-Point Ground) & Safety`
      },
      {
        title: 'Chapter 1: Link Budget Formula & Fresnel Zone Clearance',
        content: `# Chapter 1: Link Budget Formula & Fresnel Zone Clearance

Outdoor microwave links require unobstructed Line-of-Sight and adequate clearance of the 1st Fresnel zone.

### Link Budget Formula:
$$P_{rx} = P_{tx} + G_{tx} - L_{tx} - \\text{FSPL} + G_{rx} - L_{rx}$$

Where:
- $P_{rx}$: Received Signal Power (dBm)
- $P_{tx}$: Transmitter Output Power (dBm)
- $G_{tx}, G_{rx}$: Antenna Gains (dBi)
- $L_{tx}, L_{rx}$: Cable and connector losses (dB)
- $\\text{FSPL}$: Free Space Path Loss ($20 \\log_{10}(d) + 20 \\log_{10}(f) + 32.44$)

Target received signal for stable 64-QAM / 256-QAM modulation: $-55 \\text{ dBm}$ to $-65 \\text{ dBm}$.`
      }
    ]
  },
  {
    category: 'IoT System Development',
    code: 'IOTD401',
    name: 'TeM_IOTD401_IoT_System_Development_and_Embedded_C.pdf',
    title: 'IoT System Development & Embedded Programming',
    desc: 'Microcontroller architecture (ESP32, STM32, Arduino), GPIO interfacing, ADC/DAC, I2C/SPI protocols, and MQTT publishing.',
    chapters: [
      {
        title: 'Table of Contents: IoT System Development',
        content: `# Table of Contents: IoT System Development

MODULE CODE AND TITLE: IOTD401 IOT SYSTEM DEVELOPMENT & EMBEDDED C

1. Chapter 1: Microcontroller Architecture (ARM Cortex, Xtensa Dual-Core ESP32)
2. Chapter 2: Digital I/O (GPIO), Pulse Width Modulation (PWM), and ADC Readings
3. Chapter 3: Synchronous Serial Bus Protocols: I2C (Wire) and SPI (4-Wire)
4. Chapter 4: Asynchronous Communication: UART and AT Command Control
5. Chapter 5: IoT Networking: Wi-Fi Station Mode, HTTP REST APIs & MQTT Protocol
6. Chapter 6: Low Power Deep Sleep Modes, Battery Optimization & Real-Time OS (FreeRTOS)`
      },
      {
        title: 'Chapter 1: ESP32 GPIO, Sensor Interfacing & MQTT Telemetry',
        content: `# Chapter 1: ESP32 GPIO, Sensor Interfacing & MQTT Telemetry

The ESP32 is a powerful 32-bit Wi-Fi & Bluetooth microcontroller ideal for industrial IoT edge telemetry.

\`\`\`c
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "NETECH-IOT-AP";
const char* password = "EnterpriseSecretKey";
const char* mqtt_server = "192.168.1.50";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    client.setServer(mqtt_server, 1883);
}

void loop() {
    if (!client.connected()) {
        client.connect("ESP32_TempNode_01");
    }
    float temperature = 24.5;
    char payload[32];
    snprintf(payload, sizeof(payload), "{\\"temp\\": %.2f}", temperature);
    client.publish("telemetry/temperature", payload);
    delay(5000);
}
\`\`\``
      }
    ]
  },
  {
    category: 'IoT System Installation',
    code: 'IOTI401',
    name: 'TeM_IOTI401_IoT_System_Installation_Sensors_and_Power.pdf',
    title: 'IoT System Installation, Sensors & Power Systems',
    desc: 'Sensor calibration, IP67 industrial enclosures, DIN rail mounting, solar/battery backup systems, and edge gateway wiring.',
    chapters: [
      {
        title: 'Table of Contents: IoT System Installation',
        content: `# Table of Contents: IoT System Installation

MODULE CODE AND TITLE: IOTI401 IOT SYSTEM INSTALLATION

1. Chapter 1: Industrial IoT Enclosure Standards (NEMA 4X, IP65, IP67, IP68)
2. Chapter 2: Sensor Wiring & Signal Conditioning (4-20mA Current Loops, RS-485 Modbus)
3. Chapter 3: Power Distribution: Solar PV Panels, MPPT Charge Controllers & LiFePO4 Batteries
4. Chapter 4: Cable Gland Sealing, Shielded Twisted Pair (STP) Grounding & Surge Suppressors
5. Chapter 5: Cellular IoT Gateways (4G LTE-M, NB-IoT) & LoRaWAN Base Stations
6. Chapter 6: Commissioning, Diagnostic Testing, and Preventive Maintenance Schedules`
      },
      {
        title: 'Chapter 1: Field Installation, Enclosures & Power Management',
        content: `# Chapter 1: Field Installation, Enclosures & Power Management

Field deployments require ruggedized physical installation to withstand harsh weather, vibration, and moisture.

### Core Standards:
- **Enclosures**: Use IP67/NEMA 4X rated polycarbonate enclosures with silicone gaskets.
- **Current Loops (4-20mA)**: Immune to voltage drops over long cable runs (up to 1km).
- **Solar Power Sizing**:
  $$\\text{Daily Energy (Wh)} = \\text{Power (W)} \\times 24 \\text{ hours}$$
  Provide at least 3 days of autonomy with deep-cycle LiFePO4 battery storage.`
      }
    ]
  },
  {
    category: 'VoIP',
    code: 'NITVP501',
    name: 'TeM_NITVP501_Voice_over_IP_and_SIP_Administration.pdf',
    title: 'Voice over IP (VoIP) & SIP PBX Administration',
    desc: 'Session Initiation Protocol (SIP), Real-Time Transport Protocol (RTP), Asterisk/FreePBX configuration, audio codecs, and VoIP QoS.',
    chapters: [
      {
        title: 'Table of Contents: VoIP & SIP Administration',
        content: `# Table of Contents: Voice over IP & SIP Administration

MODULE CODE AND TITLE: NITVP501 VOIP & SIP ADMINISTRATION

1. Chapter 1: Analog vs. Digital Telephony & Voice Digitization (Nyquist Theorem, PCM)
2. Chapter 2: Session Initiation Protocol (SIP) Signaling: INVITE, 100 Trying, 180 Ringing, 200 OK, ACK, BYE
3. Chapter 3: Media Transmission via Real-time Transport Protocol (RTP) & Codecs (G.711, G.729, Opus)
4. Chapter 4: Private Branch Exchange (PBX) Setup with Asterisk and FreePBX
5. Chapter 5: IP Phone Auto-Provisioning (DHCP Option 66, TFTP/HTTP) & Dial Plans
6. Chapter 6: VoIP Quality of Service (QoS): DSCP EF (Expedited Forwarding), Jitter & Latency`
      },
      {
        title: 'Chapter 1: SIP Signaling Handshake & QoS Audio Queuing',
        content: `# Chapter 1: SIP Signaling Handshake & QoS Audio Queuing

VoIP separates signaling control (SIP on UDP 5060) from media streaming (RTP on UDP 10000-20000).

### Standard SIP Call Flow:
\`\`\`text
Caller                      SIP Server / PBX                   Callee
  |                                |                              |
  |--- INVITE (SDP Offer) -------->|                              |
  |<-- 100 Trying -----------------|                              |
  |                                |--- INVITE ------------------>|
  |                                |<-- 180 Ringing --------------|
  |<-- 180 Ringing ----------------|                              |
  |                                |<-- 200 OK (SDP Answer) ------|
  |<-- 200 OK ---------------------|                              |
  |--- ACK ------------------------------------------------------>|
  |                                                               |
  |<============== Bi-directional RTP Voice Stream ==============>|
  |                                                               |
  |--- BYE ------------------------------------------------------>|
  |<-- 200 OK ----------------------------------------------------|
\`\`\`

### QoS Priority:
Mark VoIP packets with **DSCP 46 (Expedited Forwarding - EF)** to guarantee priority queuing across enterprise switches and routers.`
      }
    ]
  },
  {
    category: 'Zero Client with NComputing',
    code: 'NITZC401',
    name: 'TeM_NITZC401_Zero_Client_and_NComputing_Virtual_Desktops.pdf',
    title: 'Zero Client & NComputing Desktop Virtualization',
    desc: 'Shared computing architecture, vSpace Pro server deployment, L-series/RX-series zero clients, and multi-user Windows Server configuration.',
    chapters: [
      {
        title: 'Table of Contents: Zero Client & NComputing',
        content: `# Table of Contents: Zero Client & NComputing Virtual Desktops

MODULE CODE AND TITLE: NITZC401 ZERO CLIENT & NCOMPUTING VIRTUAL DESKTOPS

1. Chapter 1: Desktop Virtualization Paradigms: Fat Clients vs. Thin Clients vs. Zero Clients
2. Chapter 2: NComputing Architecture: UXP Protocol & vSpace Server Technology
3. Chapter 3: Host Server Sizing: CPU Cores, RAM Calculation (1GB/user), and NVMe Storage
4. Chapter 4: Installation & Configuration of vSpace Pro Server on Windows Server
5. Chapter 5: Provisioning L-Series (L300) & RX-Series (RX300) Endpoints via DHCP
6. Chapter 6: User Session Isolation, Group Policies (GPO), and Multi-Seat License Management`
      },
      {
        title: 'Chapter 1: Multi-User Architecture & vSpace Deployment',
        content: `# Chapter 1: Multi-User Architecture & vSpace Deployment

Zero clients deliver up to 90% hardware cost savings and 95% electrical power savings by eliminating local OS drives.

### Key Benefits:
- **Low Power**: Consumes 5W per workstation compared to 250W for a standard desktop PC.
- **Centralized Administration**: OS updates and antivirus scans occur solely on the host server.
- **Hardware Endpoints**: Zero clients run proprietary firmware (UXP protocol) without hard drives, eliminating malware infections.`
      }
    ]
  },
  {
    category: 'Technical Drawing',
    code: 'GENDR301',
    name: 'TeM_GENDR301_Technical_Drawing_and_CAD_Schematics.pdf',
    title: 'Technical Drawing & CAD Network Schematics',
    desc: 'Orthographic projections, electrical drafting symbols, AutoCAD / LibreCAD conventions, server rack elevation diagrams, and structured cabling blueprints.',
    chapters: [
      {
        title: 'Table of Contents: Technical Drawing & CAD Schematics',
        content: `# Table of Contents: Technical Drawing & CAD Schematics

MODULE CODE AND TITLE: GENDR301 TECHNICAL DRAWING & CAD SCHEMATICS

1. Chapter 1: Geometric Construction, Standard Scales & ISO Sheet Formats (A0 - A4)
2. Chapter 2: Orthographic Projections: First Angle vs. Third Angle Projection
3. Chapter 3: Electrical & Electronic Schematic Symbols (IEEE / IEC Standards)
4. Chapter 4: Computer-Aided Drafting (CAD): Layer Management, Dimensions & Blocks
5. Chapter 5: Architectural Floor Plans & Structured Cabling Run Schematics
6. Chapter 6: Telecommunications Room Elevation & Server Rack (42U) Layout Diagrams`
      },
      {
        title: 'Chapter 1: Orthographic Projections & Rack Elevation Standards',
        content: `# Chapter 1: Orthographic Projections & Rack Elevation Standards

Technical drafting communicates spatial and electrical engineering layouts unambiguously.

### Standard Conventions:
- **First Angle Projection**: Object placed between observer and projection plane (European/African TVET standard).
- **Line Hierarchy**:
  - Continuous Thick: Visible outlines.
  - Dashed Thin: Hidden features.
  - Chain Thin (Long-Short-Long): Centerlines and axes of symmetry.
- **Rack Units (1U = 1.75 inches / 44.45 mm)**: Standard 42U data center enclosures.`
      }
    ]
  },
  {
    category: 'Mathematics',
    code: 'GENMA301',
    name: 'TeM_GENMA301_Applied_Mathematics_and_Boolean_Algebra.pdf',
    title: 'Applied Mathematics & Boolean Algebra for IT',
    desc: 'Number bases (Binary, Hexadecimal), Boolean algebra, logic gates, subnetting arithmetic, matrix algebra, and statistics.',
    chapters: [
      {
        title: 'Table of Contents: Applied Mathematics & Boolean Algebra',
        content: `# Table of Contents: Applied Mathematics for Computer Engineering

MODULE CODE AND TITLE: GENMA301 APPLIED MATHEMATICS FOR IT

1. Chapter 1: Positional Number Systems: Base-2 (Binary), Base-8 (Octal), Base-10 (Decimal), Base-16 (Hex)
2. Chapter 2: Boolean Algebra Laws: De Morgan's Theorems, Karnaugh Maps (K-Maps)
3. Chapter 3: Set Theory, Logic Operations & Truth Tables
4. Chapter 4: Network Mathematics: CIDR Subnetting Calculations & Wildcard Masks
5. Chapter 5: Linear Algebra & Matrix Transformations for Computer Graphics
6. Chapter 6: Probability Distributions & Descriptive Statistics in Computer Science`
      },
      {
        title: 'Chapter 1: Number Systems, De Morgan\'s Laws & Subnet Math',
        content: `# Chapter 1: Number Systems, De Morgan's Laws & Subnet Math

Mathematical logic forms the binary foundation of all computational hardware and network routing.

### De Morgan's Theorems:
$$\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$$
$$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$$

### CIDR Subnetting Formula:
- **Number of Subnets**: $2^s$, where $s$ is the number of borrowed bits.
- **Usable Hosts per Subnet**: $2^h - 2$, where $h$ is the number of host bits remaining.`
      }
    ]
  },
  {
    category: 'Physics',
    code: 'GENPH301',
    name: 'TeM_GENPH301_Applied_Physics_and_Wave_Propagation.pdf',
    title: 'Applied Physics & Wave Propagation',
    desc: 'Electromagnetic spectrum, wave equations, reflection, refraction, diffraction, optical attenuation, and signal propagation physics.',
    chapters: [
      {
        title: 'Table of Contents: Applied Physics & Wave Propagation',
        content: `# Table of Contents: Applied Physics for IT Engineering

MODULE CODE AND TITLE: GENPH301 APPLIED PHYSICS & WAVE PROPAGATION

1. Chapter 1: Wave Mechanics: Frequency, Period, Wavelength ($\\lambda$), and Phase
2. Chapter 2: The Electromagnetic Spectrum: RF, Microwave, Infrared, Visible Light
3. Chapter 3: Wave Phenomena: Reflection, Refraction (Snell's Law), Diffraction & Scattering
4. Chapter 4: Electromagnetism: Coulomb's Law, Electric Fields & Magnetic Induction (Faraday)
5. Chapter 5: Signal Attenuation, Decibel (dB) Calculations & Signal-to-Noise Ratio (SNR)
6. Chapter 6: Semiconductor Physics: P-N Junctions, Energy Bands & Photoelectric Effect`
      },
      {
        title: 'Chapter 1: Electromagnetic Waves & Signal Attenuation',
        content: `# Chapter 1: Electromagnetic Waves & Signal Attenuation

All wireless and fiber optic communications rely on the physics of electromagnetic radiation.

### Fundamental Wave Equation:
$$c = f \\cdot \\lambda$$
Where $c = 3 \\times 10^8 \\text{ m/s}$, $f$ is frequency in Hertz, and $\\lambda$ is wavelength in meters.

### Decibel Power Ratio:
$$\\text{Gain/Loss (dB)} = 10 \\log_{10}\\left(\\frac{P_{\\text{out}}}{P_{\\text{in}}}\\right)$$
- $+3 \\text{ dB} \\approx \\text{Doubling of power}$
- $-3 \\text{ dB} \\approx \\text{Halving of power}$`
      }
    ]
  },
  {
    category: 'Electronics',
    code: 'GENEL301',
    name: 'TeM_GENEL301_Applied_Electronics_and_Semiconductor_Circuits.pdf',
    title: 'Applied Electronics & Semiconductor Circuits',
    desc: 'Semiconductor physics, diodes, rectifiers, BJT and MOSFET transistors, operational amplifiers, and digital logic circuits.',
    chapters: [
      {
        title: 'Table of Contents: Applied Electronics',
        content: `# Table of Contents: Applied Electronics

MODULE CODE AND TITLE: GENEL301 APPLIED ELECTRONICS

1. Chapter 1: Passive Electronic Components: Resistors, Capacitors, Inductors & Reactance
2. Chapter 2: Semiconductor Diodes: P-N Junction, Zener Diodes & Full-Wave Bridge Rectifiers
3. Chapter 3: Bipolar Junction Transistors (BJT): NPN/PNP as Switches and Amplifiers
4. Chapter 4: Field-Effect Transistors (MOSFET): Gate Voltage Control & Switching Circuits
5. Chapter 5: Operational Amplifiers (Op-Amps): Inverting, Non-inverting & Comparators
6. Chapter 6: Printed Circuit Board (PCB) Prototyping, Soldering & Multimeter Testing`
      },
      {
        title: 'Chapter 1: Diodes, Transistor Switching & Op-Amp Circuits',
        content: `# Chapter 1: Diodes, Transistor Switching & Op-Amp Circuits

Electronics bridges computational software with physical hardware through solid-state semiconductors.

### Transistor as a Digital Switch:
When Base-Emitter voltage ($V_{BE}$) exceeds $\\approx 0.7\\text{V}$, an NPN transistor saturates, pulling the Collector voltage to ground ($0\\text{V}$ logic low), enabling microcontrollers to switch high-current loads safely.`
      }
    ]
  },
  {
    category: 'Electricity',
    code: 'GENEC301',
    name: 'TeM_GENEC301_Electrical_Principles_and_Power_Circuits.pdf',
    title: 'Electrical Principles & Power Distribution',
    desc: 'Ohm’s Law, Kirchhoff’s Laws (KVL/KCL), AC/DC circuits, single-phase and three-phase power, UPS systems, and earthing safety.',
    chapters: [
      {
        title: 'Table of Contents: Electrical Principles & Power Distribution',
        content: `# Table of Contents: Electrical Principles for IT

MODULE CODE AND TITLE: GENEC301 ELECTRICAL PRINCIPLES & POWER CIRCUITS

1. Chapter 1: Fundamentals of Electricity: Charge, Voltage ($V$), Current ($I$), Resistance ($R$)
2. Chapter 2: Ohm's Law ($V = I \\cdot R$) and Joule's Law of Electrical Power ($P = V \\cdot I$)
3. Chapter 3: Series, Parallel, and Series-Parallel DC Circuit Analysis
4. Chapter 4: Kirchhoff's Current Law (KCL) and Kirchhoff's Voltage Law (KVL)
5. Chapter 5: Alternating Current (AC): Single-Phase 230V vs. Three-Phase 400V Power
6. Chapter 6: Data Center Power: Uninterruptible Power Supplies (UPS), Circuit Breakers & Earthing`
      },
      {
        title: 'Chapter 1: Ohm\'s Law, Power Equations & Grounding Safety',
        content: `# Chapter 1: Ohm's Law, Power Equations & Grounding Safety

Reliable data center and server operation requires clean, properly grounded electrical supply.

### Core Electrical Equations:
- **Ohm's Law**: $V = I \\cdot R$
- **Electrical Power**: $P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}$
- **Energy Consumption**: $E = P \\cdot t$ (measured in kilowatt-hours, kWh)

### Safety Grounding (Earthing):
Low-resistance ground connection ($< 5 \\Omega$) directs stray fault currents safely to earth, triggering residual-current devices (RCD) to prevent electric shock and server damage.`
      }
    ]
  },
  {
    category: 'Programming',
    code: 'GENPR401',
    name: 'TeM_GENPR401_Computer_Programming_and_Algorithm_Design.pdf',
    title: 'Computer Programming & Algorithm Design',
    desc: 'Structured programming fundamentals, control flow, functions, recursion, sorting/searching algorithms, and Big-O computational complexity.',
    chapters: [
      {
        title: 'Table of Contents: Computer Programming & Algorithms',
        content: `# Table of Contents: Computer Programming & Algorithms

MODULE CODE AND TITLE: GENPR401 COMPUTER PROGRAMMING & ALGORITHM DESIGN

1. Chapter 1: Algorithms, Flowcharts, Pseudocode & Computational Thinking
2. Chapter 2: Variables, Primitive Types, Scope & Control Structures (if/else, switch, while, for)
3. Chapter 3: Modular Programming: Functions, Parameters, Return Types & Call Stacks
4. Chapter 4: Data Structures: Arrays, Linked Lists, Stacks, Queues & Hash Maps
5. Chapter 5: Fundamental Algorithms: Linear Search, Binary Search, Bubble Sort, Merge Sort
6. Chapter 6: Big-O Asymptotic Complexity Analysis & Code Optimization Techniques`
      },
      {
        title: 'Chapter 1: Algorithmic Logic, Binary Search & Big-O Notation',
        content: `# Chapter 1: Algorithmic Logic, Binary Search & Big-O Notation

Algorithms are step-by-step instructions designed to solve computational problems with predictable efficiency.

\`\`\`python
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
\`\`\`

### Time Complexity Comparison:
- **Linear Search**: $O(n)$ - checks every element one by one.
- **Binary Search**: $O(\\log n)$ - halves the search range on each step.
- **Merge Sort / Quick Sort**: $O(n \\log n)$ - optimal comparison-based sorting.`
      }
    ]
  }
];

// Generate Document objects
NEW_MODULES.forEach((mod, index) => {
  const docId = `doc_curriculum_${mod.code.toLowerCase()}`;
  const sections = mod.chapters.map((ch, chIdx) => ({
    id: `sec_${mod.code.toLowerCase()}_${chIdx}`,
    title: ch.title,
    content: ch.content,
    pageNumber: chIdx + 1,
    manualPage: `${chIdx + 1}`
  }));

  const fullText = sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n');

  const doc = {
    id: docId,
    name: mod.name,
    type: 'pdf',
    size: fullText.length,
    category: mod.category,
    textContent: fullText,
    uploadedAt: new Date(Date.now() - (index * 86400000)).toISOString(),
    userId: 'usr_admin',
    bookmarks: [],
    splitContent: sections,
    fileUrl: `/api/documents/${docId}/file`,
    hasDrawings: false,
    originalMimeType: 'application/pdf',
    images: []
  };

  cleanedDocs.push(doc);
});

db.documents = cleanedDocs;
fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf8');

console.log(`Successfully enriched database. Total active course documents now: ${db.documents.length}`);
const categoriesWithDocs = [...new Set(db.documents.map(d => d.category))];
console.log('Categories covered:', categoriesWithDocs.join(', '));
