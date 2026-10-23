const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db_store.json', 'utf8'));
const doc = db.documents.find(x => x.name.includes('NITWA401'));
const sections = doc.splitContent;

const tocSamples = [
  'AUTHOR’S NOTE PAGE (COPYRIGHT) -----------------------------------------------------------------------iii',
  'ACKNOWLEDGEMENTS ----------------------------------------------------------------------------------------iv',
  'TABLE OF CONTENT-------------------------------------------------------------------------------------------- vii',
  'ACRONYMS ------------------------------------------------------------------------------------------------------- x',
  'INTRODUCTION -------------------------------------------------------------------------------------------------- 1',
  'MODULE CODE AND TITLE: NITWA401 WINDOWS SERVER ADMINISTRATION ------------------ 2',
  'Learning Outcome 1: Prepare Server Environment ----------------------------------------------------- 3',
  'Key Competencies for Learning Outcome 1: Prepare Server Environment --------------------- 4',
  'Indicative content 1.1: Selection of Windows Server ------------------------------------------------ 6',
  'Indicative content 1.2: Identification of Server Tools and Equipment -------------------------- 14',
  'Indicative content 1.3: Installation of Windows Server -------------------------------------------- 19',
  'Learning outcome 1 end assessment ------------------------------------------------------------------- 60',
  'References ---------------------------------------------------------------------------------------------------- 61',
  'Learning Outcome 2: Deploy Active Directory Services ----------------------------------------------62',
  'Key Competencies for Learning Outcome 2: Deploy Active Directory Services --------------- 63',
  'Indicative content 2.1: Installation of Active Directory Domain Services ---------------------- 65',
  'Indicative content 2.2: Configuration of Active Directory ----------------------------------------- 76',
  'Indicative content 2.3: Joining Client Computer to the Domain --------------------------------- 82',
  'Indicative content 2.4: Management of GPO --------------------------------------------------------- 87',
  'Learning outcome 2 end assessment ------------------------------------------------------------------- 92',
  'References ---------------------------------------------------------------------------------------------------- 94',
  'Learning Outcome 3: Deploy DHCP services. ----------------------------------------------------------95',
  'Key Competencies for Learning Outcome 3: Deploy DHCP services----------------------------- 96',
  'Indicative content 3.1: Installation of DHCP Services ----------------------------------------------- 98',
  'Indicative content 3.2: Configuration of DHCP ----------------------------------------------------- 107',
  'Indicative content 3.3: Testing DHCP Configuration ---------------------------------------------- 114',
  'Learning outcome 3 end assessment ----------------------------------------------------------------- 118',
  'References -------------------------------------------------------------------------------------------------- 120',
  'Learning Outcome 4: Deploy DNS service -------------------------------------------------------------- 121',
  'Key Competencies for Learning Outcome 4: Deploy DNS service ------------------------------ 122',
  'Indicative content 4.1: Installation of DNS Service ------------------------------------------------ 124',
  'Indicative content 4.2: Configuration of DNS Settings -------------------------------------------- 146',
  'Indicative content 4.3: Testing of DNS Configuration--------------------------------------------- 159',
  'Learning outcome 4 end assessment ---------------------------------------------------------------- 162',
  'References -------------------------------------------------------------------------------------------------- 165',
  'Learning Outcome 5: Deploy Web Services ------------------------------------------------------------ 166',
  'Key Competencies for Learning Outcome 5 : Deploy Web Services --------------------------- 167',
  'Indicative content 5.1: Installation of Web Server ------------------------------------------------ 169',
  'Indicative content 5.2: Configure Web Server (IIS) ------------------------------------------------ 180',
  'Indicative content 5.3: Implement Security Access Control ------------------------------------- 185',
  'Indicative content 5.4: Deploy Web Application --------------------------------------------------- 203',
  'Indicative content 5.5: Test Web Application ------------------------------------------------------ 212',
  'Learning Outcome 5 end Assessment ---------------------------------------------------------------- 215',
  'References -------------------------------------------------------------------------------------------------- 217',
  'Learning Outcome 6: Deploy FTP Services ------------------------------------------------------------- 218',
  'Key Competencies for Learning Outcome 6: Deploy FTP Services ----------------------------- 219',
  'Indicative content 6.1: Installation of FTP Server -------------------------------------------------- 221',
  'Indicative content 6.2: Configure the FTP Server -------------------------------------------------- 233',
  'Indicative content 6.3: Implement FTP Server File Sharing -------------------------------------- 248',
  'Learning outcome 6 end assessment ----------------------------------------------------------------- 251',
  'References -------------------------------------------------------------------------------------------------- 253',
  'Learning Outcome 7: Perform Load Balancing -------------------------------------------------------- 254',
  'Key Competencies for Learning Outcome 7: Perform Load Balancing ------------------------ 255',
  'Indicative content 7.1: Description of Load Balancer Installation ----------------------------- 257',
  'Indicative content 7.2: Configuration of Windows Server Load Balancer -------------------- 261',
  'Indicative content 7.3: Management of Load Balancing Cluster ------------------------------- 273',
  'Learning outcome 7 end assessment ----------------------------------------------------------------- 276',
  'References -------------------------------------------------------------------------------------------------- 279',
  'Learning Outcome 8: Perform Server Maintenance ------------------------------------------------- 280',
  'Key Competencies for Learning Outcome 8: Perform Server Maintenance ----------------- 281',
  'Indicative content 8.1: Deployment of Windows Server Update Service ------------------- 283',
  'Indicative content 8.2: Configure WSUS ------------------------------------------------------------- 287',
  'Indicative content 8.3: Perform Server Backup ---------------------------------------------------- 290',
  'Indicative content 8.4: Perform Troubleshooting ------------------------------------------------- 295',
  'Indicative content 8.5: Perform Migration ---------------------------------------------------------- 299',
  'Learning outcome 8 end assessment ----------------------------------------------------------------- 304'
];

function findTargetSectionIndex(title) {
  const cleanTarget = title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 1. Indicative content number e.g. "1.1", "1.2", "8.5"
  const indMatch = title.match(/(\d+\.\d+)/);
  if (indMatch) {
    const num = indMatch[1];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].title.includes(num)) {
        return { index: i, section: sections[i] };
      }
    }
  }

  // 2. Assessment e.g. "Learning outcome 1 end assessment"
  const assessMatch = title.match(/outcome\s+(\d+)\s+end\s+assessment/i);
  if (assessMatch) {
    const outcomeNum = assessMatch[1];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i].title.toLowerCase();
      if (s.includes(`outcome ${outcomeNum}`) && s.includes('assessment')) {
        return { index: i, section: sections[i] };
      }
    }
  }

  // 3. Learning outcome / Competencies
  const outcomeMatch = title.match(/outcome\s+(\d+)/i);
  if (outcomeMatch) {
    const outcomeNum = outcomeMatch[1];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i].title.toLowerCase();
      if (s.includes(`outcome ${outcomeNum}`) && !s.includes('indicative') && !s.includes('assessment')) {
        return { index: i, section: sections[i] };
      }
    }
  }

  // 4. Module overview / code / intro
  if (cleanTarget.includes('nitwa401') || cleanTarget.includes('windows server administration') || cleanTarget.includes('module code') || cleanTarget.includes('introduction')) {
    return { index: 1, section: sections[1] };
  }

  // 5. Frontmatter / TOC
  if (cleanTarget.includes('table of content') || cleanTarget.includes('author') || cleanTarget.includes('acknowledgement') || cleanTarget.includes('acronym')) {
    return { index: 0, section: sections[0] };
  }

  // 6. Normal match
  for (let i = 0; i < sections.length; i++) {
    const cleanSec = sections[i].title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanSec.includes(cleanTarget) || cleanTarget.includes(cleanSec)) {
      return { index: i, section: sections[i] };
    }
  }

  return null;
}

let matchedCount = 0;
tocSamples.forEach(line => {
  const match = line.match(/^(.+?)\s*[-_.\u2013\u2014\s]{3,}\s*([0-9ivxlcIVXLC]+)\s*$/i);
  if (match) {
    const title = match[1].trim();
    const page = match[2].trim();
    const res = findTargetSectionIndex(title);
    if (res) {
      matchedCount++;
      console.log('✓', title, '(p.' + page + ') -> Section [' + res.index + ']:', res.section.title);
    } else {
      console.log('✗ NOT MATCHED:', title);
    }
  }
});

console.log('Total matched:', matchedCount, '/', tocSamples.length);
