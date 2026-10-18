import React from 'react';
import { Landmark, Users, ShieldCheck, Mail, ArrowRight, UserCheck, LayoutDashboard } from 'lucide-react';

export function ServicesSection({ onNavigate, onOpenLogin }) {
  const handleNav = (view = 'login') => {
    if (onNavigate) onNavigate(view);
    else if (onOpenLogin) onOpenLogin();
  };

  const services = [
    {
      icon: <Landmark size={26} />,
      isPurple: false,
      title: "Capital & Reserve Facilities",
      badge: "Transparent Liquidity",
      desc: "RPR (Rajasthan Pay Reserve Capital) provides transparent, dependable capital reserves and micro-financing tailored to community enterprise and personal stability.",
      points: [
        "Straightforward, reliable finance facilities",
        "Transparent interest rates with flexible EMI schedules",
        "Clear digital ledger and verifiable passbook statements"
      ]
    },
    {
      icon: <LayoutDashboard size={26} />,
      isPurple: true,
      title: "Three Dedicated Portals",
      badge: "Role-Isolated Architecture",
      desc: "Purpose-built interfaces ensure data confidentiality and streamlined workflows tailored specifically to Customers, Field Staff, and Executive Leadership.",
      points: [
        "Customer Portal: Account balances, passbook, group & loans",
        "Staff Desk: Shift countdown timer, deposit entries & KYC",
        "Executive Suite: Centralized auditing & loan sanctions"
      ]
    },
    {
      icon: <ShieldCheck size={26} />,
      isPurple: false,
      title: "Verified Customer Onboarding",
      badge: "Regional Branch Oversight",
      desc: "Open accounts seamlessly online or visit the Jamawaramgarh Branch. Every account is assigned a verified account number following standard KYC verification.",
      points: [
        "Instant official account number generation (RPR-ACC-XXXX)",
        "Verified by regional Jamawaramgarh Branch officers",
        "Secure credential authentication via registered email"
      ]
    },
    {
      icon: <Mail size={26} />,
      isPurple: true,
      title: "Verified Email Communication",
      badge: "Strict Anti-Fraud Governance",
      desc: "To eliminate impersonation, all official communications, account statements, and inquiries are conducted strictly through verified email channels.",
      points: [
        "Authentication bound directly to registered email",
        "Executive Leadership: Rohit Meena",
        "Official Inquiry Desk: contact@rprcapital.in"
      ]
    }
  ];

  return (
    <section id="services-section" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">RPR : Rajasthan Pay Reserve Capital</span>
          <h2 className="section-title">
            Institutional Standards, <span className="text-gradient">Accessible Finance</span>
          </h2>
          <p className="section-description">
            Engineered with clarity, security, and institutional transparency. Every service operates in strict accordance with verified financial governance.
          </p>
        </div>

        <div className="services-grid">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="feature-card glass-panel"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div className="feature-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
                  {svc.icon}
                </div>
                <span className="badge badge-cyan">
                  {svc.badge}
                </span>
              </div>

              <h3 className="feature-title" style={{ fontSize: '1.2rem', marginBottom: '0.6rem', color: '#0f172a' }}>
                {svc.title}
              </h3>

              <p className="feature-desc" style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#475569' }}>{svc.desc}</p>

              <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {svc.points.map((p, pIdx) => (
                    <li key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#1d4ed8', fontWeight: 'bold' }}>✓</span> {p}
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '1.2rem' }}
                  onClick={() => handleNav('login')}
                >
                  Access Portal <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default ServicesSection;
