import fs from 'fs';

function scanInteractive(file) {
  const content = fs.readFileSync(file, 'utf-8');
  console.log(`\n=================== ${file} ===================`);
  
  // Find all <button
  const buttonRegex = /<button[\s\S]*?<\/button>/g;
  const buttons = content.match(buttonRegex) || [];
  console.log(`Found ${buttons.length} buttons.`);
  
  let issueCount = 0;
  buttons.forEach((b, idx) => {
    // Extract onClick
    const hasOnClick = /onClick=\{/.test(b);
    const isSubmit = /type=["']submit["']/.test(b);
    const text = b.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (!hasOnClick && !isSubmit) {
      console.log(`[NON-INTERACTIVE BUTTON #${idx + 1}]: "${text}"\nSnippet: ${b.slice(0, 100)}...`);
      issueCount++;
    }
  });

  // Find all <form
  const formRegex = /<form[\s\S]*?>/g;
  const forms = content.match(formRegex) || [];
  console.log(`Found ${forms.length} forms.`);
  forms.forEach((f, idx) => {
    const hasOnSubmit = /onSubmit=\{/.test(f);
    if (!hasOnSubmit) {
      console.log(`[FORM WITHOUT ONSUBMIT #${idx + 1}]: ${f}`);
      issueCount++;
    }
  });

  // Find all <a
  const aRegex = /<a[\s\S]*?>/g;
  const links = content.match(aRegex) || [];
  console.log(`Found ${links.length} anchor links.`);
  links.forEach((l, idx) => {
    if (l.includes('href="#"') || (!l.includes('href=') && !l.includes('onClick='))) {
      console.log(`[BROKEN / EMPTY LINK #${idx + 1}]: ${l}`);
      issueCount++;
    }
  });

  console.log(`Issues found in ${file}: ${issueCount}`);
}

scanInteractive('src/pages/StaffDashboard.jsx');
scanInteractive('src/pages/CustomerDashboard.jsx');
scanInteractive('src/pages/AdminDashboard.jsx');
scanInteractive('src/pages/LoginPage.jsx');
scanInteractive('src/pages/RegisterPage.jsx');
scanInteractive('src/components/Navbar.jsx');
scanInteractive('src/components/HeroSection.jsx');
scanInteractive('src/components/Calculator.jsx');
scanInteractive('src/components/ServicesSection.jsx');
scanInteractive('src/components/AboutOwnerSection.jsx');
scanInteractive('src/components/Footer.jsx');
