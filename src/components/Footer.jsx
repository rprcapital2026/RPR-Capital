import React from 'react';
import { Mail, ShieldCheck, Lock, UserPlus, LogIn, MapPin, Building } from 'lucide-react';

export function Footer({ onNavigate, onOpenLogin }) {
  const handleNav = (view) => {
    if (onNavigate) onNavigate(view);
    else if (onOpenLogin) onOpenLogin();
  };

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-wrap">
      <div className="container">
        <div className="footer-grid">
          
          {/* Column 1: Brand & Purpose */}
          <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/logo-icon.png"
                alt="RPR Capital Crest"
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1 }}>
                  <span style={{ color: '#38bdf8' }}>R</span><span style={{ color: '#c084fc' }}>P</span><span style={{ color: '#38bdf8' }}>R</span> <span style={{ color: '#ffffff' }}>CAPITAL</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rajasthan Pay Reserve
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Institutional capital reserve facilities, disciplined savings, and structured credit underwriting engineered for complete clarity and trust.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', width: 'fit-content', fontSize: '0.72rem', color: '#38bdf8' }}>
              <ShieldCheck size={13} />
              <span>Jamawaramgarh Regional Hub, Jaipur</span>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="footer-col">
            <h4>Financial Facilities</h4>
            <ul className="footer-links">
              <li><a href="#services-section" onClick={(e) => handleSectionClick(e, 'services-section')}>Capital & Liquidity Reserves</a></li>
              <li><a href="#calculator-section" onClick={(e) => handleSectionClick(e, 'calculator-section')}>Loan EMI Calculator</a></li>
              <li><a href="#about-section" onClick={(e) => handleSectionClick(e, 'about-section')}>Corporate Governance</a></li>
              <li><a href="#about-section" onClick={(e) => handleSectionClick(e, 'about-section')}>Leadership & Mission</a></li>
            </ul>
          </div>

          {/* Column 3: Secure Portals */}
          <div className="footer-col">
            <h4>Authorized Portals</h4>
            <ul className="footer-links">
              <li>
                <span
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => handleNav('login')}
                >
                  <LogIn size={13} color="#38bdf8" /> Customer Portal Sign In
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => handleNav('register')}
                >
                  <UserPlus size={13} color="#38bdf8" /> Open Customer Account
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => handleNav('login')}
                >
                  <Lock size={13} color="#38bdf8" /> Staff Field Desk
                </span>
              </li>
              <li>
                <a href="mailto:contact@rprcapital.in" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={13} color="#38bdf8" /> Support & Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Regional Hub & Official Correspondence */}
          <div className="footer-col">
            <h4>Regional Operations</h4>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Branch Location
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.15rem' }}>
                  Jamawaramgarh Branch
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Jaipur District, Rajasthan - 303109
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.65rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                  Verified Communication
                </div>
                <a
                  href="mailto:contact@rprcapital.in"
                  style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.84rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Mail size={13} /> contact@rprcapital.in
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean, Well-Structured Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div>
            © {new Date().getFullYear()} <strong>RPR : Rajasthan Pay Reserve Capital</strong>. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
