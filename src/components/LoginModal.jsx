import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  X,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Zap,
  Building,
  Phone,
  CheckCircle2,
  Sparkles,
  User,
  Users,
  Crown
} from 'lucide-react';

export function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, loginAsPreset } = useAuth();

  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin', 'staff', 'customer'
  const [email, setEmail] = useState('admin@rprcapital.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  // Profile presets metadata directly reflecting the documents
  const profiles = [
    {
      role: 'admin',
      icon: Crown,
      name: 'Rohit Meena',
      designation: 'Website Owner & Admin',
      badge: '👑 Admin (Rohit Meena)',
      defaultEmail: 'admin@rprcapital.com',
      defaultPassword: 'admin123',
      color: '#0284c7',
      bgGlow: 'rgba(0, 132, 255, 0.08)',
      borderColor: 'rgba(0, 132, 255, 0.4)',
      scope: 'Complete administrative oversight across customer and staff records'
    },
    {
      role: 'staff',
      icon: Users,
      name: 'Pooja Sharma',
      designation: 'Credit & Verification Staff',
      badge: '👔 Staff Officer',
      defaultEmail: 'staff@rprcapital.com',
      defaultPassword: 'staff123',
      color: '#7c3aed',
      bgGlow: 'rgba(147, 51, 234, 0.08)',
      borderColor: 'rgba(147, 51, 234, 0.4)',
      scope: 'Enroll customer accounts, verify KYC and collect deposits'
    },
    {
      role: 'customer',
      icon: User,
      name: 'Vikram Singh',
      designation: 'Authorized Customer',
      badge: '👤 Customer Account',
      defaultEmail: 'vikram@example.com',
      defaultPassword: 'cust123',
      color: '#059669',
      bgGlow: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      scope: 'View savings balance, passbook, credit portfolio & statements'
    }
  ];

  const currentProfile = profiles.find((p) => p.role === selectedRole) || profiles[0];

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setError('');
    const target = profiles.find((p) => p.role === role);
    if (target) {
      setEmail(target.defaultEmail);
      setPassword(target.defaultPassword);
    }
  };

  const handleQuickLogin = (role) => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const res = loginAsPreset(role);
      setIsLoading(false);
      if (res.success) {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(res.message);
      }
    }, 250);
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (res && res.success) {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(res?.message || 'Authentication failed');
      }
    } catch {
      setIsLoading(false);
      setError('Connection error. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo-icon.png"
              alt="RPR Capital Crest"
              className="auth-header-logo"
            />
            <div>
              <h3 style={{ fontSize: '1.25rem', lineHeight: 1.15, fontWeight: 800 }}>
                RPR Capital Secure Portal
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                RPR : Rajasthan Pay Reserve Capital — Authorized Credential Gateway
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close window">
            <X size={18} />
          </button>
        </div>

        {/* Strict Compliance Banner from Document */}
        <div
          style={{
            background: 'rgba(0, 132, 255, 0.06)',
            border: '1px solid rgba(0, 132, 255, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            margin: '0.75rem 0 1rem',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
            lineHeight: 1.5
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-cyan-glow)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <ShieldCheck size={16} /> Institutional Policy: Account Provisioning Standard
          </div>
          Customer accounts are provisioned exclusively by authorized branch staff or Executive Admin Rohit Meena following verified KYC. Self-registration is restricted.
        </div>

        {error && (
          <div className="auth-error-banner">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ===================== AUTHENTICATION SECTION ===================== */}
        <div>
            {/* Step 1: Profile Selection Question */}
            <div className="auth-profile-section">
              <div className="auth-step-label">
                <span>1. Select Account Profile:</span>
                <span className="auth-step-pill">Authorized Roles</span>
              </div>

              <div className="profile-select-grid">
                {profiles.map((p) => {
                  const IconComp = p.icon;
                  const isSelected = selectedRole === p.role;
                  return (
                    <div
                      key={p.role}
                      className={`profile-select-card ${isSelected ? 'selected' : ''}`}
                      style={{
                        borderColor: isSelected ? p.color : 'var(--border-subtle)',
                        backgroundColor: isSelected ? p.bgGlow : '#ffffff'
                      }}
                      onClick={() => handleSelectRole(p.role)}
                    >
                      <div className="profile-card-top">
                        <div
                          className="profile-icon-circle"
                          style={{
                            background: isSelected ? p.color : 'rgba(0, 132, 255, 0.08)',
                            color: isSelected ? '#ffffff' : p.color
                          }}
                        >
                          <IconComp size={16} />
                        </div>
                        {isSelected && (
                          <span
                            className="badge"
                            style={{
                              background: p.color,
                              color: '#ffffff',
                              fontSize: '0.62rem',
                              padding: '0.15rem 0.45rem'
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="profile-card-badge" style={{ color: p.color }}>
                        {p.badge}
                      </div>
                      <div className="profile-card-name">{p.name}</div>
                      <div className="profile-card-scope">{p.scope}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant 1-Click Login Action for Selected Role */}
            <div className="quick-instant-box" style={{ borderColor: currentProfile.borderColor }}>
              <div className="quick-instant-info">
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: currentProfile.color, fontWeight: 700, letterSpacing: '0.04em' }}>
                    Instant Persona Login
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Login directly as {currentProfile.name} ({currentProfile.badge})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: currentProfile.color,
                  color: '#ffffff',
                  boxShadow: `0 4px 14px ${currentProfile.borderColor}`,
                  padding: '0.5rem 1rem',
                  fontSize: '0.84rem'
                }}
                disabled={isLoading}
                onClick={() => handleQuickLogin(selectedRole)}
              >
                <Zap size={14} /> Instant Access
              </button>
            </div>

            {/* Step 2: Credentials Form for Selected Role */}
            <form onSubmit={handleSubmitLogin} style={{ marginTop: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Or Authenticate With Credentials
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} color={currentProfile.color} /> Authorized Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Official ID / Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} color={currentProfile.color} /> Confidential Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Verifying Profile...'
                ) : (
                  <>
                    Sign In to {currentProfile.badge} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* RPR Charter Policy Reminder */}
            <div className="auth-policy-note">
              <strong>Institutional Policy:</strong> Customer accounts are provisioned exclusively through authorized Staff or Executive Admin Rohit Meena following verified KYC. Self-registration is strictly restricted.
            </div>

            {/* Inquire via Email for New ID */}
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="var(--color-cyan-glow)" /> Customer ID Inquiries & Onboarding:
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                To request a new Customer ID or credit facility, submit formal correspondence to the official corporate email. Following document verification, branch staff or Rohit Meena will activate your account.
              </p>
              <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <a
                  href="mailto:contact@rprcapital.in"
                  style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-cyan-glow)', textDecoration: 'none' }}
                >
                  contact@rprcapital.in
                </a>
                <a
                  href="mailto:contact@rprcapital.in?subject=New%20Customer%20ID%20Request%20-%20RPR%20Capital"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Mail size={13} /> Send Email Inquiries
                </a>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
export default LoginModal;
