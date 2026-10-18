import React from 'react';
import { Globe, Shield, Sparkles, CheckCircle, ExternalLink, Zap } from 'lucide-react';

export function DomainBrandSection() {
  const domains = [
    {
      domain: "rprcapital.in",
      tier: "Primary National Gateway",
      purpose: "Official financial and lending portal for Rajasthan & India",
      uniqueness: "100% Unique",
      status: "Recommended Primary"
    },
    {
      domain: "rajasthanpayreserve.com",
      tier: "Full Institutional Identity",
      purpose: "Unmistakable identity honoring Rajasthan Pay Reserve Capital",
      uniqueness: "100% Unique",
      status: "Exclusive Corporate"
    },
    {
      domain: "rprcapital.org",
      tier: "Reserve Trust & Treasury",
      purpose: "Dedicated reserve holding and institutional audits",
      uniqueness: "100% Unique",
      status: "Treasury Node"
    },
    {
      domain: "rprpay.in",
      tier: "Fintech & Instant Clearing",
      purpose: "Fast merchant settlements and micro-liquidity lines",
      uniqueness: "100% Unique",
      status: "Fintech Gateway"
    }
  ];

  return (
    <section id="domains-section" className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ background: 'rgba(0, 132, 255, 0.1)', color: '#0084ff', fontWeight: 700 }}>
            Unique Internet Identity
          </span>
          <h2 className="section-title" style={{ color: '#0f172a', fontWeight: 800 }}>
            Unmistakable & Unique <span className="text-gradient">Internet Domain</span>
          </h2>
          <p className="section-description" style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>
            Official Specification: Exclusive, distinctive digital web identities allocated for RPR : Rajasthan Pay Reserve Capital across regional and national tiers.
          </p>
        </div>

        <div className="domain-grid">
          {domains.map((d, i) => (
            <div key={i} className="domain-card glass-panel" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {d.tier}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} /> {d.uniqueness}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {d.domain}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {d.purpose}
                </p>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-cyan-glow)', fontWeight: 600 }}>
                  {d.status}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  100% Unique Presence
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Trademark & Security Guarantee Banner */}
        <div
          style={{
            marginTop: '2.5rem',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <img src="/logo-icon.png" alt="RPR Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0, 132, 255, 0.35))' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                RPR : Rajasthan Pay Reserve Capital
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Executive Leadership: <strong style={{ color: 'var(--text-main)' }}>ROHIT MEENA</strong> | Official Correspondence: <strong style={{ color: 'var(--color-cyan-glow)' }}>contact@rprcapital.in</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-purple" style={{ padding: '0.5rem 1rem' }}>
              <Shield size={14} /> Official Unique Identity
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
