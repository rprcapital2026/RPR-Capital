import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, TrendingUp, Lock, Award, CheckCircle, Sparkles, UserPlus, Building, Layers } from 'lucide-react';

export function HeroSection({ onNavigate, onOpenLogin, onScrollToCalc }) {
  const [auditedCount, setAuditedCount] = useState(0);
  const [portalsCount, setPortalsCount] = useState(0);

  useEffect(() => {
    let frameId;
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth count-up

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // High-end ease-out exponential curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setAuditedCount(Math.round(ease * 100));
      setPortalsCount(Math.round(ease * 3));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleLogin = () => {
    if (onNavigate) onNavigate('login');
    else if (onOpenLogin) onOpenLogin();
  };

  const handleRegister = () => {
    if (onNavigate) onNavigate('register');
  };

  const handleScrollToAbout = () => {
    document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-wrapper">
      <div className="hero-glow-blob-1" />
      <div className="hero-glow-blob-2" />

      <div className="container hero-grid">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span className="hero-pill-pulse" />
            <span>RPR : Rajasthan Pay Reserve Capital • Official Finance Portal</span>
          </div>

          <h1 className="hero-title">
            Modern, Transparent & Secure <span style={{ color: '#1d4ed8' }}>Financial Services</span>
          </h1>

          <p className="hero-subtitle">
            Welcome to <strong>RPR : Rajasthan Pay Reserve Capital</strong>. We provide accessible credit facilities, disciplined capital reserves, and dedicated role-based portals engineered for complete clarity and trust.
          </p>

          <div className="hero-btn-group">
            <button className="btn btn-primary btn-lg" onClick={handleLogin}>
              <Lock size={18} /> Sign In <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleRegister}
            >
              <UserPlus size={18} /> Open Account
            </button>
            <button className="btn btn-outline-cyan btn-lg" onClick={onScrollToCalc}>
              <TrendingUp size={18} /> EMI Calculator
            </button>
          </div>

          {/* Clean Unified Trust Pillars with Count-Up Animation */}
          <div className="hero-stats-row">
            <div className="hero-stat-card">
              <span className="hero-stat-number">{auditedCount}%</span>
              <span className="hero-stat-label">Audited Passbook & Records</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">{portalsCount} Dedicated</span>
              <span className="hero-stat-label">Customer, Staff & Admin Portals</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">Jaipur Hub</span>
              <span className="hero-stat-label">Jamawaramgarh Regional Operations</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean, Fresh Fintech Emblem Card */}
        <div className="hero-visual-card" style={{ padding: '2rem' }}>
          <div className="hero-visual-header" style={{ marginBottom: '1rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.74rem' }}>
              <ShieldCheck size={13} /> Institutional Reserve
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
              <Layers size={13} /> Multi-Tier Security
            </span>
          </div>

          {/* Large Logo Emblem */}
          <div className="hero-logo-large-wrap" style={{ margin: '1rem 0' }}>
            <img
              src="/logo.png"
              alt="RPR Capital Official Seal"
              className="hero-logo-large"
            />
          </div>

          {/* Clean Highlights without Clutter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
            <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <Building size={16} color="#1d4ed8" /> Operations Center
              </div>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Jamawaramgarh Branch, Jaipur
              </span>
            </div>

            <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="#1d4ed8" /> Customer Verification
              </div>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Assisted Branch KYC Protocol
              </span>
            </div>

            <button
              onClick={handleScrollToAbout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1d4ed8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '0.4rem 0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              Explore Company Profile & Leadership in About Us <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HeroSection;
