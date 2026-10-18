import React from 'react';
import { Mail, ShieldCheck, Award, CheckCircle2, UserCheck, Building, Landmark, Lock, MapPin, FileText } from 'lucide-react';

export function AboutOwnerSection() {
  return (
    <section id="about-section" className="section-padding" style={{ background: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Corporate Governance & Leadership</span>
          <h2 className="section-title">
            About Us & <span className="text-gradient">Leadership Profile</span>
          </h2>
          <p className="section-description">
            Discover the mission, regional operations, and governance standards driving <strong>RPR : Rajasthan Pay Reserve Capital</strong>.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Column 1: Institutional Mission & Core Philosophy */}
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <Landmark size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Our Mission & Vision
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Institutional Finance & Reserve Capital
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              <strong>RPR (Rajasthan Pay Reserve Capital)</strong> was founded with a clear institutional commitment: to deliver simple, transparent, and structured financial services that individuals and regional enterprises can understand and rely upon without ambiguity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="#1d4ed8" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Disciplined Capital Preservation</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Deposits and credit allocations are backed by segregated reserves with 100% auditability.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="#1d4ed8" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Jamawaramgarh Regional Operations</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Headquartered regionally at Jamawaramgarh, Jaipur (PIN 303109), bridging credit to grassroots growth.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Lock size={18} color="#1d4ed8" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Role-Segregated Data Security</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Firewalled portal access ensuring customer privacy, verified field desks, and executive sanctioning.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Executive Leadership — Rohit Meena */}
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <Award size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Executive Leadership
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Founder & Executive Director
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
                RM
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  ROHIT MEENA
                </div>
                <div style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 600 }}>
                  Owner & Executive Director — RPR Capital
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Under the executive stewardship of <strong>Rohit Meena</strong>, RPR Capital enforces rigorous underwriting protocols, capital reserves governance, and final sanction approval for all loan allocations.
            </p>

            {/* Official Correspondence Card */}
            <div style={{ marginTop: 'auto', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Official Verified Communication Policy
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                To maintain total security and prevent unauthorized solicitation, all official corporate and executive inquiries are conducted exclusively via verified email:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Mail size={16} color="#1d4ed8" />
                <a
                  href="mailto:contact@rprcapital.in"
                  style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                >
                  contact@rprcapital.in
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Operational Hub Highlights */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Regional Branch</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Jamawaramgarh Branch</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tehsil Jamawaramgarh, Jaipur, Rajasthan</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Underwriting Policy</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Strict Field KYC</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Aadhaar & PAN verification required</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Credit Sanction</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Executive Admin Approval</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Final authorization by Rohit Meena</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Digital Statements</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Real-Time Passbook</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Paperless receipts with transaction IDs</div>
          </div>
        </div>

      </div>
    </section>
  );
}
export default AboutOwnerSection;
