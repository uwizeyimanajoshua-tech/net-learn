const fs = require('fs');

const storePath = './db_store.json';
const db = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const doc = db.documents.find(x => x.name.includes('NITWA401') || x.name.includes('Window Server'));

if (!doc) {
  console.error('NITWA401 doc not found!');
  process.exit(1);
}

const tocStructure = [
  {
    title: 'Table of Contents (Full Trainee Manual Index)',
    marker: 'TABLE OF CONTENT',
    type: 'toc',
    manualPage: 'vii'
  },
  {
    title: 'Module Overview: NITWA401 Windows Server Administration',
    marker: 'MODULE CODE AND TITLE: NITWA401 WINDOWS SERVER',
    type: 'intro',
    manualPage: '2'
  },
  {
    title: 'Learning Outcome 1: Prepare Server Environment - Overview',
    marker: 'Learning Outcome 1: Prepare Server Environment',
    type: 'outcome',
    manualPage: '3'
  },
  {
    title: 'Indicative content 1.1: Selection of Windows Server',
    marker: 'Indicative content 1.1: Selection of Windows Server',
    type: 'indicative',
    manualPage: '6'
  },
  {
    title: 'Indicative content 1.2: Identification of Server Tools and Equipment',
    marker: 'Indicative content 1.2: Identification of Server Tools and Equipment',
    type: 'indicative',
    manualPage: '14'
  },
  {
    title: 'Indicative content 1.3: Installation of Windows Server',
    marker: 'Indicative content 1.3: Installation of Windows Server',
    type: 'indicative',
    manualPage: '19'
  },
  {
    title: 'Learning Outcome 1: End Assessment & Review Questions',
    marker: 'Learning outcome 1 end assessment',
    type: 'assessment',
    manualPage: '60'
  },
  {
    title: 'Learning Outcome 2: Deploy Active Directory Services - Overview',
    marker: 'Learning Outcome 2: Deploy Active Directory Services',
    type: 'outcome',
    manualPage: '62'
  },
  {
    title: 'Indicative content 2.1: Installation of Active Directory Domain Services',
    marker: 'Indicative content 2.1: Installation of Active Directory Domain Services',
    type: 'indicative',
    manualPage: '65'
  },
  {
    title: 'Indicative content 2.2: Configuration of Active Directory',
    marker: 'Indicative content 2.2: Configuration of Active Directory',
    type: 'indicative',
    manualPage: '76'
  },
  {
    title: 'Indicative content 2.3: Joining Client Computer to the Domain',
    marker: 'Indicative content 2.3: Joining Client Computer to the Domain',
    type: 'indicative',
    manualPage: '82'
  },
  {
    title: 'Indicative content 2.4: Management of GPO',
    marker: 'Indicative content 2.4: Management of GPO',
    type: 'indicative',
    manualPage: '87'
  },
  {
    title: 'Learning Outcome 2: End Assessment & Review Questions',
    marker: 'Learning outcome 2 end assessment',
    type: 'assessment',
    manualPage: '92'
  },
  {
    title: 'Learning Outcome 3: Deploy DHCP Services - Overview',
    marker: 'Learning Outcome 3: Deploy DHCP services',
    type: 'outcome',
    manualPage: '95'
  },
  {
    title: 'Indicative content 3.1: Installation of DHCP Services',
    marker: 'Indicative content 3.1: Installation of DHCP Services',
    type: 'indicative',
    manualPage: '98'
  },
  {
    title: 'Indicative content 3.2: Configuration of DHCP',
    marker: 'Indicative content 3.2: Configuration of DHCP',
    type: 'indicative',
    manualPage: '107'
  },
  {
    title: 'Indicative content 3.3: Testing DHCP Configuration',
    marker: 'Indicative content 3.3: Testing DHCP Configuration',
    type: 'indicative',
    manualPage: '114'
  },
  {
    title: 'Learning Outcome 3: End Assessment & Review Questions',
    marker: 'Learning outcome 3 end assessment',
    type: 'assessment',
    manualPage: '118'
  },
  {
    title: 'Learning Outcome 4: Deploy DNS Service - Overview',
    marker: 'Learning Outcome 4: Deploy DNS service',
    type: 'outcome',
    manualPage: '121'
  },
  {
    title: 'Indicative content 4.1: Installation of DNS Service',
    marker: 'Indicative content 4.1: Installation of DNS Service',
    type: 'indicative',
    manualPage: '124'
  },
  {
    title: 'Indicative content 4.2: Configuration of DNS Settings',
    marker: 'Indicative content 4.2: Configuration of DNS Settings',
    type: 'indicative',
    manualPage: '146'
  },
  {
    title: 'Indicative content 4.3: Testing of DNS Configuration',
    marker: 'Indicative content 4.3: Testing of DNS Configuration',
    type: 'indicative',
    manualPage: '159'
  },
  {
    title: 'Learning Outcome 4: End Assessment & Review Questions',
    marker: 'Learning outcome 4 end assessment',
    type: 'assessment',
    manualPage: '162'
  },
  {
    title: 'Learning Outcome 5: Deploy Web Services - Overview',
    marker: 'Learning Outcome 5 : Deploy Web Services',
    type: 'outcome',
    manualPage: '166'
  },
  {
    title: 'Indicative content 5.1: Installation of Web Server',
    marker: 'Indicative content 5.1: Installation of Web Server',
    type: 'indicative',
    manualPage: '169'
  },
  {
    title: 'Indicative content 5.2: Configure Web Server (IIS)',
    marker: 'Indicative content 5.2: Configure Web Server (IIS)',
    type: 'indicative',
    manualPage: '180'
  },
  {
    title: 'Indicative content 5.3: Implement Security Access Control',
    marker: 'Indicative content 5.3: Implement Security Access Control',
    type: 'indicative',
    manualPage: '185'
  },
  {
    title: 'Indicative content 5.4: Deploy Web Application',
    marker: 'Indicative content 5.4: Deploy Web Application',
    type: 'indicative',
    manualPage: '203'
  },
  {
    title: 'Indicative content 5.5: Test Web Application',
    marker: 'Indicative content 5.5: Test Web Application',
    type: 'indicative',
    manualPage: '212'
  },
  {
    title: 'Learning Outcome 5: End Assessment & Review Questions',
    marker: 'Learning Outcome 5 end Assessment',
    type: 'assessment',
    manualPage: '215'
  },
  {
    title: 'Learning Outcome 6: Deploy FTP Services - Overview',
    marker: 'Learning Outcome 6: Deploy FTP Services',
    type: 'outcome',
    manualPage: '218'
  },
  {
    title: 'Indicative content 6.1: Installation of FTP Server',
    marker: 'Indicative content 6.1: Installation of FTP Server',
    type: 'indicative',
    manualPage: '221'
  },
  {
    title: 'Indicative content 6.2: Configure the FTP Server',
    marker: 'Indicative content 6.2: Configure the FTP Server',
    type: 'indicative',
    manualPage: '233'
  },
  {
    title: 'Indicative content 6.3: Implement FTP Server File Sharing',
    marker: 'Indicative content 6.3: Implement FTP Server File Sharing',
    type: 'indicative',
    manualPage: '248'
  },
  {
    title: 'Learning Outcome 6: End Assessment & Review Questions',
    marker: 'Learning outcome 6 end assessment',
    type: 'assessment',
    manualPage: '251'
  },
  {
    title: 'Learning Outcome 7: Perform Load Balancing - Overview',
    marker: 'Learning Outcome 7: Perform Load Balancing',
    type: 'outcome',
    manualPage: '254'
  },
  {
    title: 'Indicative content 7.1: Description of Load Balancer Installation',
    marker: 'Indicative content 7.1: Description of Load Balancer Installation',
    type: 'indicative',
    manualPage: '257'
  },
  {
    title: 'Indicative content 7.2: Configuration of Windows Server Load Balancer',
    marker: 'Indicative content 7.2: Configuration of Windows Server Load Balancer',
    type: 'indicative',
    manualPage: '261'
  },
  {
    title: 'Indicative content 7.3: Management of Load Balancing Cluster',
    marker: 'Indicative content 7.3: Management of Load Balancing Cluster',
    type: 'indicative',
    manualPage: '273'
  },
  {
    title: 'Learning Outcome 7: End Assessment & Review Questions',
    marker: 'Learning outcome 7 end assessment',
    type: 'assessment',
    manualPage: '276'
  },
  {
    title: 'Learning Outcome 8: Perform Server Maintenance - Overview',
    marker: 'Learning Outcome 8: Perform Server Maintenance',
    type: 'outcome',
    manualPage: '280'
  },
  {
    title: 'Indicative content 8.1: Deployment of Windows Server Update Service',
    marker: 'Indicative content 8.1: Deployment of Windows Server Update Service',
    type: 'indicative',
    manualPage: '283'
  },
  {
    title: 'Indicative content 8.2: Configure WSUS',
    marker: 'Indicative content 8.2: Configure WSUS',
    type: 'indicative',
    manualPage: '287'
  },
  {
    title: 'Indicative content 8.3: Perform Server Backup',
    marker: 'Indicative content 8.3: Perform Server Backup',
    type: 'indicative',
    manualPage: '290'
  },
  {
    title: 'Indicative content 8.4: Perform Troubleshooting',
    marker: 'Indicative content 8.4: Perform Troubleshooting',
    type: 'indicative',
    manualPage: '295'
  },
  {
    title: 'Indicative content 8.5: Perform Migration',
    marker: 'Indicative content 8.5: Perform Migration',
    type: 'indicative',
    manualPage: '299'
  },
  {
    title: 'Learning Outcome 8: End Assessment & Review Questions',
    marker: 'Learning outcome 8 end assessment',
    type: 'assessment',
    manualPage: '304'
  }
];

let currentSearchPos = 0;
const slices = [];

for (let i = 0; i < tocStructure.length; i++) {
  const item = tocStructure[i];
  const minPos = i === 0 ? 0 : 12000;
  const searchStart = Math.max(currentSearchPos, minPos);
  
  let foundPos = -1;
  const lowerMarker = item.marker.toLowerCase();
  const lowerText = doc.textContent.toLowerCase();
  
  let p = searchStart;
  while (p < doc.textContent.length) {
    const idx = lowerText.indexOf(lowerMarker, p);
    if (idx === -1) break;
    const lineAhead = doc.textContent.substring(idx, Math.min(idx + 120, doc.textContent.length));
    if (!lineAhead.includes('----') || i === 0) {
      foundPos = idx;
      break;
    }
    p = idx + lowerMarker.length;
  }
  
  if (foundPos === -1 && item.marker.includes('NITWA401')) {
    foundPos = 14362;
  }
  
  slices.push({ item, pos: foundPos });
  if (foundPos > 0) currentSearchPos = foundPos + 20;
}

const newSections = [];
for (let i = 0; i < slices.length; i++) {
  const startPos = slices[i].pos;
  const endPos = (i < slices.length - 1 && slices[i+1].pos > startPos) ? slices[i+1].pos : doc.textContent.length;
  let rawChunk = doc.textContent.substring(startPos, endPos).trim();
  
  // Format section 0 nicely with table of contents markdown and instructions
  if (i === 0) {
    rawChunk = `# TABLE OF CONTENT\n\n` +
      `> **Interactive Navigation:** Click any topic below to jump directly to that chapter in this manual.\n\n` +
      `AUTHOR’S NOTE PAGE (COPYRIGHT) -----------------------------------------------------------------------iii\n` +
      `ACKNOWLEDGEMENTS ----------------------------------------------------------------------------------------iv\n` +
      `TABLE OF CONTENT-------------------------------------------------------------------------------------------- vii\n` +
      `ACRONYMS ------------------------------------------------------------------------------------------------------- x\n` +
      `INTRODUCTION -------------------------------------------------------------------------------------------------- 1\n` +
      `MODULE CODE AND TITLE: NITWA401 WINDOWS SERVER ADMINISTRATION ------------------ 2\n` +
      `Learning Outcome 1: Prepare Server Environment ----------------------------------------------------- 3\n` +
      `Key Competencies for Learning Outcome 1: Prepare Server Environment --------------------- 4\n` +
      `Indicative content 1.1: Selection of Windows Server ------------------------------------------------ 6\n` +
      `Indicative content 1.2: Identification of Server Tools and Equipment -------------------------- 14\n` +
      `Indicative content 1.3: Installation of Windows Server -------------------------------------------- 19\n` +
      `Learning outcome 1 end assessment ------------------------------------------------------------------- 60\n` +
      `References ---------------------------------------------------------------------------------------------------- 61\n` +
      `Learning Outcome 2: Deploy Active Directory Services ----------------------------------------------62\n` +
      `Key Competencies for Learning Outcome 2: Deploy Active Directory Services --------------- 63\n` +
      `Indicative content 2.1: Installation of Active Directory Domain Services ---------------------- 65\n` +
      `Indicative content 2.2: Configuration of Active Directory ----------------------------------------- 76\n` +
      `Indicative content 2.3: Joining Client Computer to the Domain --------------------------------- 82\n` +
      `Indicative content 2.4: Management of GPO --------------------------------------------------------- 87\n` +
      `Learning outcome 2 end assessment ------------------------------------------------------------------- 92\n` +
      `References ---------------------------------------------------------------------------------------------------- 94\n` +
      `Learning Outcome 3: Deploy DHCP services. ----------------------------------------------------------95\n` +
      `Key Competencies for Learning Outcome 3: Deploy DHCP services----------------------------- 96\n` +
      `Indicative content 3.1: Installation of DHCP Services ----------------------------------------------- 98\n` +
      `Indicative content 3.2: Configuration of DHCP ----------------------------------------------------- 107\n` +
      `Indicative content 3.3: Testing DHCP Configuration ---------------------------------------------- 114\n` +
      `Learning outcome 3 end assessment ----------------------------------------------------------------- 118\n` +
      `References -------------------------------------------------------------------------------------------------- 120\n` +
      `Learning Outcome 4: Deploy DNS service -------------------------------------------------------------- 121\n` +
      `Key Competencies for Learning Outcome 4: Deploy DNS service ------------------------------ 122\n` +
      `Indicative content 4.1: Installation of DNS Service ------------------------------------------------ 124\n` +
      `Indicative content 4.2: Configuration of DNS Settings -------------------------------------------- 146\n` +
      `Indicative content 4.3: Testing of DNS Configuration--------------------------------------------- 159\n` +
      `Learning outcome 4 end assessment ---------------------------------------------------------------- 162\n` +
      `References -------------------------------------------------------------------------------------------------- 165\n` +
      `Learning Outcome 5: Deploy Web Services ------------------------------------------------------------ 166\n` +
      `Key Competencies for Learning Outcome 5 : Deploy Web Services --------------------------- 167\n` +
      `Indicative content 5.1: Installation of Web Server ------------------------------------------------ 169\n` +
      `Indicative content 5.2: Configure Web Server (IIS) ------------------------------------------------ 180\n` +
      `Indicative content 5.3: Implement Security Access Control ------------------------------------- 185\n` +
      `Indicative content 5.4: Deploy Web Application --------------------------------------------------- 203\n` +
      `Indicative content 5.5: Test Web Application ------------------------------------------------------ 212\n` +
      `Learning Outcome 5 end Assessment ---------------------------------------------------------------- 215\n` +
      `References -------------------------------------------------------------------------------------------------- 217\n` +
      `Learning Outcome 6: Deploy FTP Services ------------------------------------------------------------- 218\n` +
      `Key Competencies for Learning Outcome 6: Deploy FTP Services ----------------------------- 219\n` +
      `Indicative content 6.1: Installation of FTP Server -------------------------------------------------- 221\n` +
      `Indicative content 6.2: Configure the FTP Server -------------------------------------------------- 233\n` +
      `Indicative content 6.3: Implement FTP Server File Sharing -------------------------------------- 248\n` +
      `Learning outcome 6 end assessment ----------------------------------------------------------------- 251\n` +
      `References -------------------------------------------------------------------------------------------------- 253\n` +
      `Learning Outcome 7: Perform Load Balancing -------------------------------------------------------- 254\n` +
      `Key Competencies for Learning Outcome 7: Perform Load Balancing ------------------------ 255\n` +
      `Indicative content 7.1: Description of Load Balancer Installation ----------------------------- 257\n` +
      `Indicative content 7.2: Configuration of Windows Server Load Balancer -------------------- 261\n` +
      `Indicative content 7.3: Management of Load Balancing Cluster ------------------------------- 273\n` +
      `Learning outcome 7 end assessment ----------------------------------------------------------------- 276\n` +
      `References -------------------------------------------------------------------------------------------------- 279\n` +
      `Learning Outcome 8: Perform Server Maintenance ------------------------------------------------- 280\n` +
      `Key Competencies for Learning Outcome 8: Perform Server Maintenance ----------------- 281\n` +
      `Indicative content 8.1: Deployment of Windows Server Update Service ------------------- 283\n` +
      `Indicative content 8.2: Configure WSUS ------------------------------------------------------------- 287\n` +
      `Indicative content 8.3: Perform Server Backup ---------------------------------------------------- 290\n` +
      `Indicative content 8.4: Perform Troubleshooting ------------------------------------------------- 295\n` +
      `Indicative content 8.5: Perform Migration ---------------------------------------------------------- 299\n` +
      `Learning outcome 8 end assessment ----------------------------------------------------------------- 304\n\n` +
      rawChunk;
  }

  // Prepend a nice chapter heading
  let sectionText = rawChunk;
  if (!sectionText.startsWith('# ')) {
    sectionText = `# ${slices[i].item.title}\n\n` + sectionText;
  }

  newSections.push({
    id: `sec_nitwa401_${i + 1}`,
    title: slices[i].item.title,
    content: sectionText,
    pageNumber: i + 1,
    manualPage: slices[i].item.manualPage
  });
}

doc.splitContent = newSections;
fs.writeFileSync(storePath, JSON.stringify(db, null, 2));
console.log(`Successfully partitioned NITWA401 into ${newSections.length} structured sections!`);
