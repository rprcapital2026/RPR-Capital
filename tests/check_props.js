import { INITIAL_DATA } from '../src/data/mockData.js';
import fs from 'fs';

console.log('Sample user structure:');
console.log('Customer:', JSON.stringify(INITIAL_DATA.users.find(u => u.role === 'customer'), null, 2));

function checkAdminProperties() {
  const content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf-8');
  const cust = INITIAL_DATA.users.find(u => u.role === 'customer');
  
  // Properties accessed on c or cust:
  const matches = [...content.matchAll(/cust\.([a-zA-Z0-9_]+)|c\.([a-zA-Z0-9_]+)/g)];
  const props = new Set(matches.map(m => m[1] || m[2]));
  console.log('\nAdminDashboard customer property accesses:', [...props]);
  
  for (const p of props) {
    if (cust[p] === undefined) {
      console.log(`[PROP UNDEFINED ON CUSTOMER] ${p}`);
    } else {
      console.log(`[PROP OK] ${p}:`, cust[p]);
    }
  }
}

checkAdminProperties();
