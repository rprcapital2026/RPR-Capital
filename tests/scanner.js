import fs from 'fs';

function scanFile(filePath) {
  console.log(`\n=== Scanning ${filePath} ===`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Empty handlers
    if (/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/.test(line)) {
      console.log(`[EMPTY HANDLER] Line ${lineNum}: ${line.trim()}`);
    }
    // Alert handlers
    if (/onClick=\{\s*\(\)\s*=>\s*alert\(/.test(line)) {
      console.log(`[ALERT HANDLER] Line ${lineNum}: ${line.trim()}`);
    }
    // Undefined/NaN risks
    if (/\.toLocaleString\(\)/.test(line) && !line.includes('Number(')) {
      // Possible undefined.toLocaleString()
      console.log(`[POSSIBLE LOCALE RISK] Line ${lineNum}: ${line.trim()}`);
    }
    if (/href="#"/.test(line)) {
      console.log(`[DEAD LINK href="#"] Line ${lineNum}: ${line.trim()}`);
    }
    if (/console\.error/.test(line)) {
      console.log(`[CATCH LOG] Line ${lineNum}: ${line.trim()}`);
    }
  });
}

scanFile('src/pages/StaffDashboard.jsx');
scanFile('src/pages/CustomerDashboard.jsx');
scanFile('src/pages/AdminDashboard.jsx');
scanFile('src/App.jsx');
scanFile('src/context/DataContext.jsx');
scanFile('src/context/AuthContext.jsx');
scanFile('server/dataStore.js');
scanFile('server/routes/api.js');
