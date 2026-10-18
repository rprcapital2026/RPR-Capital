import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Lock,
  ArrowRight,
  FileText,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CreditCard,
  MapPin,
  Landmark
} from 'lucide-react';

export function RegisterPage({ onNavigate }) {
  const { registerCustomer, users = [] } = useData() || {};

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: 'Jamawaramgarh, Jaipur, Rajasthan',
    pinCode: '303109',
    panNumber: '',
    idNumber: '',
    initialDeposit: 10000,
    accountType: 'Pay Reserve & Loan Account'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);

  const safeUsers = Array.isArray(users) ? users : [];
  const adminUser = safeUsers.find((u) => u && u.role === 'admin') || { name: 'Rohit Meena', role: 'admin' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setForm((prev) => ({
      ...prev,
      [name]: name === 'panNumber' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Safe input validation
    if (!form.name.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address for official correspondence.');
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const res = registerCustomer(form, adminUser);
        setIsSubmitting(false);

        if (res && res.success) {
          setCreatedCustomer(res.customer);
          setSubmitted(true);
        } else {
          setError(res?.message || 'Registration could not be completed. Please try again.');
        }
      } catch (err) {
        setIsSubmitting(false);
        setError('System error while processing registration. Please try again.');
        console.error('Registration error:', err);
      }
    }, 400);
  };

  return (
    <div
      className="register-page-wrap"
      style={{
        minHeight: '88vh',
        padding: '3rem 1rem',
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03)'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '1.2rem'
          }}
        >
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={14} /> Back to Website
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#1d4ed8',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: '#eff6ff',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #dbeafe'
            }}
          >
            <Building size={14} /> Jamawaramgarh Branch, Jaipur
          </div>
        </div>

        {submitted && createdCustomer ? (
          /* Official Success Certificate */
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '2px solid #1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#1d4ed8'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Official Customer Account Issued
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Welcome to <strong>RPR : Rajasthan Pay Reserve Capital</strong>. Your credentials and verified passbook record have been registered under Jamawaramgarh Regional Hub.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                margin: '1.5rem auto',
                maxWidth: '460px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Account Holder:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{createdCustomer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Customer ID:</span>
                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{createdCustomer.customerId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Account Number:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>{createdCustomer.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Login Email:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{createdCustomer.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Initial Reserve Balance:</span>
                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>
                  ₹{Number(createdCustomer.savings?.currentBalance || 10000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginTop: '1.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('login')}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                Sign In to Customer Portal <ArrowRight size={15} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate('home')}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                Return to Website
              </button>
            </div>
          </div>
        ) : (
          /* Official Registration Form */
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                <img src="/logo-icon.png" alt="RPR Capital" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                    RPR CAPITAL
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rajasthan Pay Reserve Capital
                  </div>
                </div>
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0 0.2rem' }}>
                Open Official Customer Account
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                Enter your authentic details below. A verified Customer ID and Official Account Number will be generated immediately.
              </p>
            </div>

            {/* Error Message */}
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

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: Personal & Contact Details */}
              <div style={{ marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1d4ed8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> 1. Personal & Contact Information
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '0.9rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Surendra Meena"
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="surendra@example.com"
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98290 12345"
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Account Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        required
                        style={{ width: '100%', padding: '0.7rem 2.4rem 0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: KYC & Identification */}
              <div style={{ marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1d4ed8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CreditCard size={14} /> 2. KYC & Identity Verification
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '0.9rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      className="form-input"
                      value={form.panNumber}
                      onChange={handleChange}
                      placeholder="ABCPS9911X"
                      maxLength={10}
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Aadhaar (Last 4 Digits)
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      className="form-input"
                      value={form.idNumber}
                      onChange={handleChange}
                      placeholder="8821"
                      maxLength={4}
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="grid-split-2col" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Residential Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Village / Tehsil, District"
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      className="form-input"
                      value={form.pinCode}
                      onChange={handleChange}
                      placeholder="303109"
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Account & Deposit Setup */}
              <div style={{ marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1d4ed8', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Landmark size={14} /> 3. Reserve Facility & Deposit
                </div>

                <div className="grid-split-2col" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Account Type
                    </label>
                    <select
                      name="accountType"
                      className="form-select"
                      value={form.accountType}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                    >
                      <option value="Pay Reserve & Loan Account">Pay Reserve & Loan Account</option>
                      <option value="Monthly Recurring Reserve Plan">Monthly Recurring Reserve Plan</option>
                      <option value="Farmer & Small Business Line">Farmer & Small Business Line</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      Initial Deposit (₹)
                    </label>
                    <input
                      type="number"
                      name="initialDeposit"
                      className="form-input"
                      value={form.initialDeposit}
                      onChange={handleChange}
                      step={1000}
                      min={1000}
                      required
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Official Protocol Strip */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldCheck size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Assisted Branch KYC Protocol:</strong> Account is minted under <strong>Jamawaramgarh Regional Hub</strong> oversight. Final sanction authorization by Executive Director Rohit Meena.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.96rem', fontWeight: 700 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Issuing Customer Account...'
                ) : (
                  <>
                    <ShieldCheck size={16} /> Open Customer Account & Issue ID <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                Already registered?{' '}
                <span
                  style={{ color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => onNavigate('login')}
                >
                  Sign In to Portal
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
