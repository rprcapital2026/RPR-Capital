import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  Crown,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Key,
  CheckCircle,
  X
} from 'lucide-react';

export function LoginPage({ onNavigate, onLoginSuccess, initialRole = 'customer', isAdminDirect = false }) {
  const { login, loginAsPreset } = useAuth();
  const { requestPasswordReset } = useData() || {};

  const [activeTab, setActiveTab] = useState(isAdminDirect ? 'admin' : (initialRole === 'staff' ? 'staff' : 'customer'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Request Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReqEmail, setResetReqEmail] = useState('');
  const [resetReqReason, setResetReqReason] = useState('');
  const [resetReqFeedback, setResetReqFeedback] = useState(null);

  // Sync preset credentials when tab changes
  useEffect(() => {
    setError('');
    if (isAdminDirect) {
      setActiveTab('admin');
      setEmail('admin@rprcapital.in');
      setPassword('admin123');
    } else if (activeTab === 'staff') {
      setEmail('staff@rprcapital.in');
      setPassword('staff123');
    } else {
      setEmail('vikram@rprcapital.in');
      setPassword('password123');
    }
  }, [activeTab, isAdminDirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);
    if (res && res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res?.message || 'Authentication failed');
    }
  };

  const handleQuickFill = (roleType) => {
    setActiveTab(roleType);
    if (roleType === 'customer') {
      setEmail('vikram@rprcapital.in');
      setPassword('password123');
    } else if (roleType === 'staff') {
      setEmail('staff@rprcapital.in');
      setPassword('staff123');
    } else if (roleType === 'admin') {
      setEmail('admin@rprcapital.in');
      setPassword('admin123');
    }
  };

  return (
    <div
      className="login-page-wrap"
      style={{
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '470px',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2.2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03)'
        }}
      >
        {/* Top Header: Official Brand Seal */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            onClick={() => onNavigate('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              marginBottom: '0.85rem'
            }}
          >
            <img
              src="/logo-icon.png"
              alt="RPR Capital"
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                RPR CAPITAL
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Rajasthan Pay Reserve Capital
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
            {isAdminDirect ? 'Executive Admin Gateway' : 'Sign In to Official Portal'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
            {isAdminDirect
              ? 'Authorized Administration • Rohit Meena'
              : 'Enter your verified credentials to access your dashboard'}
          </p>
        </div>

        {/* Clean Segmented Tab Switcher (Customer vs Staff) */}
        {!isAdminDirect ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'customer' ? '#ffffff' : 'transparent',
                color: activeTab === 'customer' ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === 'customer' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'customer' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <User size={15} /> Customer Portal
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'staff' ? '#ffffff' : 'transparent',
                color: activeTab === 'staff' ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === 'staff' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'staff' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Users size={15} /> Staff Desk
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#1d4ed8',
              fontSize: '0.84rem'
            }}
          >
            <Crown size={18} />
            <div>
              <strong>Super Administrator Mode</strong> (Rohit Meena)
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Simple Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} color="#1d4ed8" /> Registered Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@rprcapital.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Lock size={14} color="#1d4ed8" /> Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetReqEmail(email);
                  setResetReqReason('');
                  setResetReqFeedback(null);
                  setShowResetModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1d4ed8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.82rem', fontSize: '0.95rem', fontWeight: 700 }}
            disabled={isLoading}
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                Sign In to {activeTab === 'admin' ? 'Admin Portal' : activeTab === 'staff' ? 'Staff Desk' : 'Customer Account'}{' '}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            textAlign: 'center',
            fontSize: '0.84rem'
          }}
        >
          <div>
            <span style={{ color: '#64748b' }}>New to RPR Capital? </span>
            <span
              style={{ color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => onNavigate('register')}
            >
              Open an Account
            </span>
          </div>

          <div
            style={{ color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={13} /> Return to Homepage
          </div>
        </div>

        {/* Security Reassurance Strip */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.6rem 0.8rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #f1f5f9',
            fontSize: '0.72rem',
            color: '#64748b',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <ShieldCheck size={14} color="#1d4ed8" />
          <span>256-Bit SSL Encrypted • Jamawaramgarh Regional Hub</span>
        </div>
      </div>

      {/* Forgot Password Request Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={18} color="#1d4ed8" /> Password Reset Request
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Request forwarded directly to Admin Rohit Meena
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowResetModal(false)}>✕</button>
            </div>

            {resetReqFeedback ? (
              <div style={{ padding: '1.25rem 0', textAlign: 'center' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '0.4rem' }}>
                  Request Queued Successfully!
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {resetReqFeedback}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => setShowResetModal(false)}
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (requestPasswordReset) {
                    const res = requestPasswordReset({
                      email: resetReqEmail,
                      reason: resetReqReason
                    });
                    if (res.success) {
                      setResetReqFeedback(res.message);
                    }
                  } else {
                    setResetReqFeedback('Request submitted to Admin Rohit Meena.');
                  }
                }}
              >
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={resetReqEmail}
                    onChange={(e) => setResetReqEmail(e.target.value)}
                    required
                    placeholder="e.g. vikram@rprcapital.in"
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Reason for Reset / Recovery Note
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={resetReqReason}
                    onChange={(e) => setResetReqReason(e.target.value)}
                    placeholder="e.g. Lost device, forgot credentials. Request temporary passcode."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ gap: '0.4rem' }}
                  >
                    <Key size={14} /> Send Request to Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
