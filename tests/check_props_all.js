import { INITIAL_DATA } from '../src/data/mockData.js';
import fs from 'fs';

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf-8');
  console.log(`\n=== Checking property accesses in ${file} ===`);
  const cust = INITIAL_DATA.users.find(u => u.role === 'customer');
  const staff = INITIAL_DATA.users.find(u => u.role === 'staff');
  
  // Find customer property accesses: c.foo or cust.foo or customer.foo or u.foo
  const matches = [...content.matchAll(/(?:c|cust|customer|currentUser)\.([a-zA-Z0-9_]+)/g)];
  const props = new Set(matches.map(m => m[1]));
  
  console.log('Props accessed on customer/user:', [...props].length);
  for (const p of props) {
    if (cust[p] === undefined && staff[p] === undefined) {
      console.log(`[UNDEFINED ON BOTH CUST & STAFF] ${p}`);
    }
  }
}

checkFile('src/pages/StaffDashboard.jsx');
checkFile('src/pages/CustomerDashboard.jsx');
