import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generateTransactionSlipPDF, generateStatementPDF } from '../utils/pdfGenerator';
import {
  User,
  ShieldCheck,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Clock,
  CheckCircle,
  IndianRupee,
  FileText,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Mail,
  Sparkles,
  Building,
  Users,
  Bell,
  Send,
  Printer,
  ChevronRight,
  Layers,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Edit3,
  Save,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export function CustomerDashboard({ onNavigate }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const {
    deposits = [],
    loanApplications = [],
    applyCustomerLoan,
    complaints = [],
    submitComplaint,
    notifications = [],
    updateUserProfileData
  } = useData() || {};

  // Active Menu matching specification
  const [activeMenu, setActiveMenu] = useState('home'); // 'home', 'profile', 'savings', 'loans', 'group', 'receipts', 'notifications', 'complaints', 'branch'

  // Profile Editing state (Full Page View)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nominee: '',
    nomineeRelation: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    accountType: 'Savings Bank Account'
  });
  const [profileFeedback, setProfileFeedback] = useState(null);

  const openEditProfilePage = () => {
    setEditProfileForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      address: currentUser?.address || 'Village Jamawaramgarh, Ward No. 4, Jaipur, Rajasthan - 303109',
      nominee: currentUser?.nominee || 'Radha Devi',
      nomineeRelation: currentUser?.nomineeRelation || 'Wife',
      bankName: currentUser?.bankDetails?.bankName || currentUser?.bankName || 'State Bank of India (Jamawaramgarh)',
      bankAccount: currentUser?.bankDetails?.accountNumber || currentUser?.bankAccount || '40290100084920',
      ifscCode: currentUser?.bankDetails?.ifsc || currentUser?.ifscCode || 'SBIN0031201',
      accountType: currentUser?.bankDetails?.accountType || currentUser?.bankAccountType || 'Savings Bank Account'
    });
    setProfileFeedback(null);
    setIsEditingProfile(true);
    setActiveMenu('profile');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const updatedFields = {
        name: editProfileForm.name.trim(),
        phone: editProfileForm.phone.trim(),
        email: editProfileForm.email.trim(),
        address: editProfileForm.address.trim(),
        nominee: editProfileForm.nominee.trim(),
        nomineeRelation: editProfileForm.nomineeRelation.trim(),
        bankName: editProfileForm.bankName.trim(),
        bankAccount: editProfileForm.bankAccount.trim(),
        ifscCode: editProfileForm.ifscCode.trim(),
        bankAccountType: editProfileForm.accountType,
        bankDetails: {
          bankName: editProfileForm.bankName.trim(),
          accountNumber: editProfileForm.bankAccount.trim(),
          ifsc: editProfileForm.ifscCode.trim(),
          accountType: editProfileForm.accountType
        }
      };

      // Update session immediately
      if (updateCurrentUser) {
        updateCurrentUser(updatedFields);
      }

      // Persist to database
      if (updateUserProfileData && currentUser?.id) {
        await updateUserProfileData(currentUser.id, updatedFields);
      }

      setProfileFeedback({
        type: 'success',
        text: 'Profile details and account information updated successfully in database!'
      });

      // Smoothly return to overview after showing success
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileFeedback(null);
        setIsSavingProfile(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileFeedback({
        type: 'error',
        text: 'Error updating profile: ' + (err.message || 'Please try again.')
      });
      setIsSavingProfile(false);
    }
  };

  // Loan application state
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    applicantName: currentUser?.name || '',
    mobile: currentUser?.phone || '',
    dob: '1988-06-15',
    address: currentUser?.address || '',
    pinCode: '303109',
    occupationIncome: 'Business & Agriculture — ₹45,000 / month',
    requestedAmount: 200000,
    purpose: 'Crop Storage & Micro Equipment',
    tenureMonths: 24,
    documentsSubmitted: 'Aadhaar Card, PAN Card'
  });
  const [loanSubmittedMsg, setLoanSubmittedMsg] = useState(null);

  // Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    subject: '',
    category: 'Deposit / Passbook',
    description: ''
  });
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Filter deposits & withdrawals strictly for this customer
  const customerDeposits = (deposits || []).filter(
    (d) => d && (d.customerId === currentUser?.customerId || d.accountNumber === currentUser?.accountNumber)
  );

  // Filter loan applications for this customer
  const customerLoanApps = (loanApplications || []).filter(
    (a) => a && a.customerId === currentUser?.customerId
  );

  // Filter complaints for this customer
  const customerComplaints = (complaints || []).filter(
    (c) => c && c.customerId === currentUser?.customerId
  );

  // Helper to ensure 100% pure English text (no legacy cached Hindi or Hinglish notes)
  const cleanBranch = (currentUser?.branch || 'Jamawaramgarh Branch, Jaipur').replace(/\s*\([^)]*\)/g, '').trim() || 'Jamawaramgarh Branch, Jaipur';
  const cleanType = (type, amount) => {
    if (!type || typeof type !== 'string') return amount >= 0 ? 'Deposit' : 'Withdrawal';
    const cleaned = type.replace(/\s*\([^)]*\)/g, '').trim();
    if (cleaned.toLowerCase().includes('deposit')) return 'Deposit';
    if (cleaned.toLowerCase().includes('withdrawal')) return 'Withdrawal';
    return cleaned || (amount >= 0 ? 'Deposit' : 'Withdrawal');
  };

  // Total Deposits & Withdrawals calculations
  const calculatedDeposits = customerDeposits.filter(d => d.amount > 0).reduce((sum, d) => sum + d.amount, 0);
  const calculatedWithdrawn = customerDeposits.filter(d => d.amount < 0).reduce((sum, d) => sum + Math.abs(d.amount), 0);
  const totalDeposits = customerDeposits.length > 0 ? calculatedDeposits : (currentUser?.savings?.totalDeposit ?? 0);
  const totalWithdrawn = customerDeposits.length > 0 ? calculatedWithdrawn : (currentUser?.savings?.totalWithdrawn ?? 0);
  const currentNetBalance = currentUser?.savings?.currentBalance ?? (totalDeposits - totalWithdrawn);
  const isSuspended = currentUser?.status === 'Suspended/Frozen' || currentUser?.status === 'Suspended' || currentUser?.status === 'Frozen';

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    const res = applyCustomerLoan(loanForm, currentUser);
    if (res.success) {
      setLoanSubmittedMsg(`Loan application ${res.application.id} submitted successfully! Status: Submitted (Awaiting Staff Review).`);
      setTimeout(() => {
        setLoanSubmittedMsg(null);
        setShowLoanModal(false);
      }, 2000);
    }
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    submitComplaint(complaintForm, currentUser);
    setComplaintSuccess(true);
    setComplaintForm({ subject: '', category: 'Deposit / Passbook', description: '' });
    setTimeout(() => setComplaintSuccess(false), 2500);
  };

  const downloadReceipt = async (item) => {
    if (!item) return;
    await generateTransactionSlipPDF(item, currentUser);
  };

  const downloadStatement = async () => {
    await generateStatementPDF(currentUser, customerDeposits, currentNetBalance, cleanBranch);
  };

  return (
    <div className="portal-viewport-layout">
      
      {/* ===================== PINNED LEFT SIDEBAR ===================== */}
      <aside className="portal-sidebar-fixed">
        
        {/* Top Header of Sidebar */}
        <div className="sidebar-top-branding" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem', flexShrink: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffffff', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', flexShrink: 0 }}>
            <img src="/logo-icon.png" alt="RPR Capital" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.2 }}>Customer Portal</div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Member Self-Service Desk</div>
          </div>
        </div>

        <nav className="portal-sidebar-nav">
          <button
            id="btn-customer-home"
            className={`tab-btn ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('home'); setIsEditingProfile(false); }}
          >
            <Layers size={15} /> Dashboard Home
          </button>

          <button
            id="btn-customer-profile"
            className={`tab-btn ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('profile'); setIsEditingProfile(false); }}
          >
            <User size={15} /> My Profile & KYC
          </button>

          <button
            id="btn-customer-savings"
            className={`tab-btn ${activeMenu === 'savings' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('savings'); setIsEditingProfile(false); }}
          >
            <IndianRupee size={15} /> My Savings & Passbook
          </button>

          <button
            id="btn-customer-loans"
            className={`tab-btn ${activeMenu === 'loans' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('loans'); setIsEditingProfile(false); }}
          >
            <CreditCard size={15} /> Loan Facilities & Apply
          </button>

          <button
            id="btn-customer-group"
            className={`tab-btn ${activeMenu === 'group' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('group'); setIsEditingProfile(false); }}
          >
            <Users size={15} /> My Group & Referrals
          </button>

          <button
            id="btn-customer-receipts"
            className={`tab-btn ${activeMenu === 'receipts' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('receipts'); setIsEditingProfile(false); }}
          >
            <FileText size={15} /> Receipts & Statements
          </button>

          <button
            id="btn-customer-notifications"
            className={`tab-btn ${activeMenu === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('notifications'); setIsEditingProfile(false); }}
          >
            <Bell size={15} /> Notifications
          </button>

          <button
            id="btn-customer-complaints"
            className={`tab-btn ${activeMenu === 'complaints' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('complaints'); setIsEditingProfile(false); }}
          >
            <HelpCircle size={15} /> Help & Support
          </button>

          <button
            id="btn-customer-branch"
            className={`tab-btn ${activeMenu === 'branch' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('branch'); setIsEditingProfile(false); }}
          >
            <Building size={15} /> Contact Branch Desk
          </button>
        </nav>


        {/* ===================== PROFILE CARD AT BOTTOM (TASK 1) ===================== */}
        <div className="sidebar-bottom-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#ffffff', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)' }}>
              {currentUser?.name ? currentUser.name[0] : 'C'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {currentUser?.accountNumber}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                ID: {currentUser?.customerId}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '0.12rem 0.4rem' }}>
              ✓ Verified Customer
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>KYC Active</span>
          </div>

          <button
            id="btn-sidebar-edit-profile"
            type="button"
            className="btn btn-sm"
            onClick={openEditProfilePage}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.73rem',
              padding: '0.32rem 0.45rem',
              borderRadius: '7px',
              gap: '0.35rem',
              fontWeight: 700,
              border: isEditingProfile && activeMenu === 'profile' ? '1.5px solid #059669' : '1.5px solid #10b981',
              color: isEditingProfile && activeMenu === 'profile' ? '#ffffff' : '#047857',
              background: isEditingProfile && activeMenu === 'profile' ? '#059669' : '#ecfdf5',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)'
            }}
            title="Open full page to edit your personal details & profile info"
          >
            <Edit3 size={12} /> {isEditingProfile && activeMenu === 'profile' ? '● Editing Profile' : 'Edit Profile & Info'}
          </button>
        </div>
      </aside>

      {/* ===================== SCROLLABLE RIGHT MAIN CONTENT ===================== */}
      <main className="portal-main-scrollable">
        
        {/* TOP BAR */}
        <div className="dashboard-topbar" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              Welcome, {currentUser?.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Account Number: <strong>{currentUser?.accountNumber}</strong> | Branch: <strong>{cleanBranch}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={downloadStatement}>
              <Download size={14} /> Download Passbook
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (isSuspended) {
                  alert('Account is suspended or frozen. Loan applications cannot be processed.');
                  return;
                }
                setShowLoanModal(true);
              }}
              disabled={isSuspended}
              style={isSuspended ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              <CreditCard size={14} /> Apply for Loan
            </button>
          </div>
        </div>

        {isSuspended && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b'
          }}>
            <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Account Suspended / Frozen</div>
              <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                Your account is currently under administrative freeze. Transactions and credit applications are restricted. Please contact Jamawaramgarh Regional Branch.
              </div>
            </div>
          </div>
        )}

        {/* 1. DASHBOARD HOME */}
        {activeMenu === 'home' && (
          <div>
            {/* 4 Primary Metric Cards */}
            <div className="metrics-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="metric-card">
                <div className="metric-header">
                  <span>Available Savings Balance</span>
                </div>
                <div className="metric-value" style={{ color: '#059669' }}>
                  ₹{Number(currentNetBalance).toLocaleString('en-IN')}
                </div>
                <div className="metric-footer">
                  Deposited: ₹{Number(totalDeposits).toLocaleString('en-IN')} • Withdrawn: ₹{Number(totalWithdrawn).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="metric-card purple-glow">
                <div className="metric-header">
                  <span>Active Loan Facility</span>
                </div>
                <div className="metric-value text-gradient-purple">
                  ₹{Number(currentUser?.loans?.activeLoan ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="metric-footer">
                  Sanctioned Limit: ₹{Number(currentUser?.loans?.sanctionedAmount ?? 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>Outstanding Balance</span>
                </div>
                <div className="metric-value" style={{ color: '#d97706' }}>
                  ₹{Number(currentUser?.loans?.outstanding ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="metric-footer">
                  Interest Rate: {currentUser?.loans?.interestRate ?? 10.5}% p.a.
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>Upcoming Monthly EMI</span>
                </div>
                <div className="metric-value text-gradient-cyan">
                  ₹{Number(currentUser?.loans?.monthlyEmi ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="metric-footer">
                  Due Date: <strong>{currentUser?.loans?.nextPaymentDate || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Overview Section */}
            <div className="grid-split-2col" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Recent Transactions / Passbook snippet */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Transactions</h3>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setActiveMenu('savings')}>
                    View All Passbook Entries
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type / Channel</th>
                        <th>Amount</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerDeposits.slice(0, 3).map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.date}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cleanType(d.type, d.amount)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.mode}</div>
                          </td>
                          <td style={{ fontWeight: 700, color: d.amount > 0 ? '#10b981' : '#ef4444' }}>
                            {d.amount > 0 ? '+' : '-'}₹{Math.abs(d.amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => downloadReceipt(d)}>
                              <Printer size={12} /> Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loan Application Status Tracker */}
              <div className="glass-panel-purple" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--color-purple-glow)' }}>
                  Loan Application Lifecycle
                </h3>

                {customerLoanApps.length > 0 ? (
                  customerLoanApps.slice(0, 1).map((app) => (
                    <div key={app.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Application ID: {app.id}</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                          {app.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Requested: <strong>₹{Number(app.requestedAmount).toLocaleString('en-IN')}</strong> for {app.purpose}
                      </div>

                      {/* Status Stepper Tracker */}
                      <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Progress Pipeline:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>1. Draft ✓</span> →
                          <span style={{ color: '#10b981', fontWeight: 700 }}>2. Submitted ✓</span> →
                          <span style={{ color: '#d97706', fontWeight: 700 }}>3. Under Review (Current)</span> →
                          <span style={{ color: '#94a3b8' }}>4. Approved</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          Underwriting Note: {app.statusHistory?.slice(-1)[0]?.note || 'Under review by field staff & executive director.'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No active loan applications. Click 'Apply for Loan' to submit an inquiry.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MY PROFILE & KYC */}
        {activeMenu === 'profile' && (
          !isEditingProfile ? (
            /* ================= VIEW A: PROFILE OVERVIEW ================= */
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="var(--color-cyan-glow)" /> Customer Profile & KYC Documentation
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Verified Rajasthan Pay Reserve Account Holder Details
                  </p>
                </div>

                <button
                  id="btn-edit-profile-tab"
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openEditProfilePage}
                  style={{ gap: '0.4rem' }}
                >
                  <Edit3 size={14} /> Edit Profile & Information
                </button>
              </div>

              <div className="profile-card-grid" style={{ gap: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">Customer Full Name</span>
                  <span className="profile-detail-value">{currentUser?.name}</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Official Account Number</span>
                  <span className="profile-detail-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)' }}>
                    {currentUser?.accountNumber}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Customer ID</span>
                  <span className="profile-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.customerId}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Contact Mobile Number</span>
                  <span className="profile-detail-value">{currentUser?.phone || '+91 98290 12345'}</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Registered Login Email</span>
                  <span className="profile-detail-value">{currentUser?.email}</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Assigned Branch Hub</span>
                  <span className="profile-detail-value">{cleanBranch}</span>
                </div>

                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">Permanent Residential Address</span>
                  <span className="profile-detail-value">{currentUser?.address || 'Village Jamawaramgarh, Ward No. 4, Jaipur, Rajasthan'}</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">KYC Verification Status</span>
                  <span className="profile-detail-value" style={{ color: '#10b981' }}>
                    ✓ {currentUser?.kycStatus || 'Verified & Active'}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Registered Nominee</span>
                  <span className="profile-detail-value">
                    {currentUser?.nominee || 'Radha Devi'}
                    {currentUser?.nomineeRelation && !currentUser?.nominee?.toLowerCase().includes(currentUser.nomineeRelation.toLowerCase()) ? ` (${currentUser.nomineeRelation})` : ''}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">ID Proof (Aadhaar Card)</span>
                  <span className="profile-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.idProof?.number || '•••• •••• 8821'}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">PAN Card Number</span>
                  <span className="profile-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.idProof?.pan || 'ABCPS1234F'}
                  </span>
                </div>

                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">Linked Primary Bank & Account</span>
                  <span className="profile-detail-value" style={{ fontSize: '0.88rem' }}>
                    {currentUser?.bankDetails?.bankName || currentUser?.bankName || 'State Bank of India (Jamawaramgarh)'} — Acc: {currentUser?.bankDetails?.accountNumber || currentUser?.bankAccount || '40290100084920'}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">Bank IFSC Code</span>
                  <span className="profile-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.bankDetails?.ifsc || currentUser?.ifscCode || 'SBIN0031201'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================= VIEW B: FULL EDIT PROFILE PAGE (NO POPUP) ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Back & Breadcrumb Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  id="btn-back-to-profile-overview"
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setIsEditingProfile(false); setProfileFeedback(null); }}
                  style={{ gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0.9rem' }}
                >
                  <ArrowLeft size={16} /> Back to Profile Overview
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Customer Portal</span>
                  <ChevronRight size={14} />
                  <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setIsEditingProfile(false); setProfileFeedback(null); }}>
                    My Profile & KYC
                  </span>
                  <ChevronRight size={14} />
                  <span style={{ color: '#047857', fontWeight: 700 }}>Edit Profile & Information</span>
                </div>
              </div>

              {/* Page Banner */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <Edit3 size={24} color="#059669" /> Edit Profile & Account Information
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Update your official contact credentials, permanent address, nominee designation, and linked settlement bank account.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                      ✓ KYC Verified
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {currentUser?.accountNumber}
                    </span>
                  </div>
                </div>

                {/* Quick Account Summary Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(248, 250, 252, 0.75)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer ID</span>
                    <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{currentUser?.customerId}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Branch Hub</span>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>{cleanBranch}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aadhaar Link</span>
                    <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: '#047857' }}>● Verified ({currentUser?.idProof?.number || '•••• •••• 8821'})</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PAN Number</span>
                    <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{currentUser?.idProof?.pan || 'ABCPS1234F'}</strong>
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {profileFeedback && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: profileFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    border: `1.5px solid ${profileFeedback.type === 'success' ? '#10b981' : '#f87171'}`,
                    color: profileFeedback.type === 'success' ? '#065f46' : '#991b1b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  {profileFeedback.type === 'success' ? <CheckCircle size={20} color="#059669" /> : <AlertCircle size={20} color="#dc2626" />}
                  <span>{profileFeedback.text}</span>
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* SECTION 1: Personal & Contact Information */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#0284c7" /> 1. Personal & Contact Information
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Official contact coordinates used for SMS alerts, statement emails, and OTP verification.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Customer Full Name *
                      </label>
                      <input
                        type="text"
                        id="input-edit-profile-name"
                        className="form-input"
                        value={editProfileForm.name}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                        required
                        placeholder="e.g. Vikram Singh"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        As registered on official government identity proof (Aadhaar / PAN).
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Contact Mobile Number *
                      </label>
                      <input
                        type="tel"
                        id="input-edit-profile-phone"
                        className="form-input"
                        value={editProfileForm.phone}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                        required
                        placeholder="e.g. +91 98290 99999"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        Used for transaction alerts and SMS authentication.
                      </span>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Registered Email Address *
                      </label>
                      <input
                        type="email"
                        id="input-edit-profile-email"
                        className="form-input"
                        value={editProfileForm.email}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                        required
                        placeholder="e.g. vikram@rprcapital.in"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        Monthly interest e-statements and formal audit notices are dispatched to this email.
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Permanent Address & Nominee */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="#7c3aed" /> 2. Permanent Residential Address & Nominee
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Physical domicile address verified by branch credit managers and registered beneficiary.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Permanent Residential Address (with Ward / Street / Landmark) *
                      </label>
                      <textarea
                        id="input-edit-profile-address"
                        className="form-input"
                        rows={3}
                        value={editProfileForm.address}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                        required
                        placeholder="e.g. Village Jamawaramgarh, Ward No. 4, Jaipur, Rajasthan - 303109"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                          Registered Nominee Full Name
                        </label>
                        <input
                          type="text"
                          id="input-edit-profile-nominee"
                          className="form-input"
                          value={editProfileForm.nominee}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, nominee: e.target.value })}
                          placeholder="e.g. Radha Devi"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                          Relationship with Nominee
                        </label>
                        <input
                          type="text"
                          id="input-edit-profile-nominee-rel"
                          className="form-input"
                          value={editProfileForm.nomineeRelation}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, nomineeRelation: e.target.value })}
                          placeholder="e.g. Wife, Mother, Son, Father"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Linked Bank & Settlement Information */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={18} color="#1d4ed8" /> 3. Linked Bank & Settlement Account Details
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    All loan disbursements, monthly interest earnings, and maturity payout settlements are credited to this account.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Bank Name & Branch
                      </label>
                      <input
                        type="text"
                        id="input-edit-profile-bank"
                        className="form-input"
                        value={editProfileForm.bankName}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, bankName: e.target.value })}
                        placeholder="e.g. State Bank of India (Jamawaramgarh Branch)"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Account Number
                      </label>
                      <input
                        type="text"
                        id="input-edit-profile-account-num"
                        className="form-input"
                        value={editProfileForm.bankAccount}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, bankAccount: e.target.value })}
                        placeholder="e.g. 40290100084920"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        id="input-edit-profile-ifsc"
                        className="form-input"
                        value={editProfileForm.ifscCode}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SBIN0031201"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Account Type
                      </label>
                      <select
                        id="input-edit-profile-account-type"
                        className="form-input"
                        value={editProfileForm.accountType}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, accountType: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                      >
                        <option value="Savings Bank Account">Savings Bank Account</option>
                        <option value="Current Account">Current Account</option>
                        <option value="Salary Account">Salary Account</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Database & Sync Notice */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Lock size={18} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Database Synchronization & Audit Compliance:</strong>{' '}
                    Upon saving, these updates are committed directly into your central MongoDB profile record and audit history. Your session state will instantly refresh with updated credentials across the portal.
                  </div>
                </div>

                {/* ACTION FOOTER */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', marginBottom: '2rem' }}>
                  <button
                    id="btn-cancel-edit-profile"
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setIsEditingProfile(false); setProfileFeedback(null); }}
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    Cancel & Discard
                  </button>
                  <button
                    id="btn-save-profile-page"
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSavingProfile}
                    style={{
                      gap: '0.5rem',
                      background: '#059669',
                      borderColor: '#047857',
                      padding: '0.65rem 1.75rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <Save size={16} /> {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )
        )}

        {/* 3. MY SAVINGS / DEPOSIT & DIGITAL PASSBOOK */}
        {activeMenu === 'savings' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Savings & Digital Passbook</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Active Reserve Scheme: <strong>{currentUser?.savings?.planName || 'Monthly Recurring Reserve Plan'}</strong>
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={downloadStatement}>
                <Download size={14} /> Download Digital Passbook
              </button>
            </div>

            {/* Savings Summary Pill */}
            <div className="pills-summary-grid" style={{ gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Deposited</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>+₹{Number(totalDeposits).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Withdrawn</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>-₹{Number(totalWithdrawn).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Reserve Balance</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cyan-glow)' }}>₹{Number(currentNetBalance).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Digital Passbook Transactions</h4>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction Type</th>
                    <th>Channel & Reference</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {customerDeposits.map((d) => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{d.date}</td>
                      <td style={{ fontWeight: 600 }}>{cleanType(d.type, d.amount)}</td>
                      <td>
                        <div>{d.mode}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.txnRef}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: d.amount > 0 ? '#10b981' : '#ef4444' }}>
                        {d.amount > 0 ? '+' : '-'}₹{Math.abs(d.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        ₹{Number(d.balanceAfter || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.74rem' }} onClick={() => downloadReceipt(d)}>
                          <Printer size={12} /> Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. LOAN SERVICES & APPLY */}
        {activeMenu === 'loans' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Loan Facilities & Credit Line</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Inspect active credit lines, repayment schedules, and submit loan requests.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (isSuspended) {
                    alert('Account is suspended or frozen. Loan applications cannot be processed.');
                    return;
                  }
                  setShowLoanModal(true);
                }}
                disabled={isSuspended}
                style={isSuspended ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <Sparkles size={14} /> New Loan Application
              </button>
            </div>

            {/* Active Loan Details */}
            <div className="pills-summary-grid" style={{ gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sanctioned Loan Limit</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>₹{Number(currentUser?.loans?.sanctionedAmount ?? 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding Principal</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>₹{Number(currentUser?.loans?.outstanding ?? 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly EMI Installment</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>₹{Number(currentUser?.loans?.monthlyEmi ?? 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Submitted Loan Applications */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Submitted Loan Applications</h4>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Submitted Date</th>
                    <th>Purpose</th>
                    <th>Requested Amount</th>
                    <th>Status</th>
                    <th>Disbursal Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerLoanApps.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan-glow)' }}>{app.id}</td>
                      <td>{app.submittedDate}</td>
                      <td>{app.purpose}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(app.requestedAmount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${app.status === 'Approved' ? 'badge-green' : 'badge-amber'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.disbursalStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. MY GROUP & REFERRALS */}
        {activeMenu === 'group' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>
                <Users size={13} /> Community Self-Help Group
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Group: {currentUser?.group?.groupName || 'Jamwa Mahila & Farmer Vikas Samooh'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Group ID: <strong>{currentUser?.group?.groupId}</strong> | Role: <strong>{currentUser?.group?.role || 'Leader / Associate'}</strong>
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                Connected Customers (Enrolled Through This Account):
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Members who registered under Vikram Singh's direct referral and Jamawaramgarh Regional Community Desk:
              </p>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Account No & ID</th>
                    <th>Regional Location</th>
                    <th>Referral Channel</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentUser?.group?.connectedCustomers || []).map((conn, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{conn.name}</td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-cyan-glow)' }}>{conn.accountNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{conn.customerId}</div>
                      </td>
                      <td>{conn.village}</td>
                      <td>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                          {conn.joinedThrough}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{conn.joinedDate}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          ✓ {conn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. RECEIPTS & STATEMENTS */}
        {activeMenu === 'receipts' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Official Receipts & Statements</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Download official digital passbook records and transaction receipts issued by Jamawaramgarh Regional Branch:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Full Account Passbook & Ledger Statement (Text/Print)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complete deposit and withdrawal history with verified balances</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={downloadStatement}>
                  <Download size={14} /> Download Passbook
                </button>
              </div>

              {customerDeposits.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.receiptNumber || 'Receipt'} — {cleanType(d.type, d.amount)} of ₹{Math.abs(d.amount).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {d.date} | Ref: {d.txnRef}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => downloadReceipt(d)}>
                    <Printer size={13} /> Print Slip
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. NOTIFICATIONS */}
        {activeMenu === 'notifications' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Official Notifications & Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(notifications || []).map((n) => (
                <div key={n.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Bell size={18} color="var(--color-cyan-glow)" style={{ marginTop: '0.2rem' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{n.title}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date: {n.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. HELP & SUPPORT */}
        {activeMenu === 'complaints' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Help & Customer Support</h3>
            
            {complaintSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                ✓ Your inquiry ticket has been logged. Jamawaramgarh Branch Desk will respond promptly via email.
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} style={{ marginBottom: '2rem' }}>
              <div className="grid-split-2col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={complaintForm.subject}
                    onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                    placeholder="e.g. Passbook entry inquiry"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  >
                    <option value="Deposit / Passbook">Deposit / Passbook</option>
                    <option value="Loan Application">Loan Application</option>
                    <option value="EMI Repayment">EMI Repayment</option>
                    <option value="Other Assistance">Other Assistance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  placeholder="Describe your inquiry or issue..."
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <Send size={14} /> Submit Support Ticket
              </button>
            </form>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Support Ticket History</h4>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Branch Response</th>
                  </tr>
                </thead>
                <tbody>
                  {customerComplaints.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.id}</td>
                      <td>{c.date}</td>
                      <td style={{ fontWeight: 600 }}>{c.subject}</td>
                      <td>
                        <span className={`badge ${c.status === 'Resolved' ? 'badge-green' : 'badge-amber'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.reply}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. CONTACT BRANCH */}
        {activeMenu === 'branch' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={22} color="var(--color-cyan-glow)" /> Jamawaramgarh Regional Operations Hub
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  RPR Capital — Jamawaramgarh Branch
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <MapPin size={16} color="var(--color-cyan-glow)" /> Main Market, Tehsil Jamawaramgarh, Jaipur, Rajasthan - 303109
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Mail size={16} color="var(--color-purple-glow)" /> Official Email: <strong style={{ color: 'var(--color-cyan-glow)' }}>contact@rprcapital.in</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Clock size={16} /> Branch Working Hours: 10:00 AM – 05:00 PM (Monday to Saturday)
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  Branch Officers & Governance:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  • Executive Director: <strong>ROHIT MEENA</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  • Field & Verification Officer: <strong>Pooja Sharma (Staff ID: STF-JMW-01)</strong>
                </div>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Strict Governance Policy: Official correspondence is conducted solely via verified email (contact@rprcapital.in).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Portal Footer inside scrollable right pane */}
        <footer style={{ marginTop: '3.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          © {new Date().getFullYear()} <strong>RPR : Rajasthan Pay Reserve Capital</strong> • Jamawaramgarh Regional Hub, Jaipur • Official Role-Isolated Portal
        </footer>

      </main>

      {/* ===================== LOAN APPLICATION MODAL ===================== */}
      {showLoanModal && (
        <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Loan Facility Application</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Jamawaramgarh Regional Branch Underwriting
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowLoanModal(false)}>✕</button>
            </div>

            {loanSubmittedMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4>Application Submitted!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{loanSubmittedMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleLoanSubmit}>
                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Applicant Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={loanForm.applicantName}
                      onChange={(e) => setLoanForm({ ...loanForm, applicantName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={loanForm.mobile}
                      onChange={(e) => setLoanForm({ ...loanForm, mobile: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={loanForm.dob}
                      onChange={(e) => setLoanForm({ ...loanForm, dob: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal PIN Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={loanForm.pinCode}
                      onChange={(e) => setLoanForm({ ...loanForm, pinCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loanForm.address}
                    onChange={(e) => setLoanForm({ ...loanForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Occupation & Monthly Income</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loanForm.occupationIncome}
                    onChange={(e) => setLoanForm({ ...loanForm, occupationIncome: e.target.value })}
                    placeholder="e.g. Farming / Small Business — ₹40,000 / month"
                    required
                  />
                </div>

                <div className="grid-split-2col" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Requested Loan Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={loanForm.requestedAmount}
                      onChange={(e) => setLoanForm({ ...loanForm, requestedAmount: Number(e.target.value) })}
                      step={10000}
                      min={25000}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Repayment Tenure</label>
                    <select
                      className="form-select"
                      value={loanForm.tenureMonths}
                      onChange={(e) => setLoanForm({ ...loanForm, tenureMonths: Number(e.target.value) })}
                    >
                      <option value={12}>12 Months</option>
                      <option value={24}>24 Months</option>
                      <option value={36}>36 Months</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose of Loan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loanForm.purpose}
                    onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                    placeholder="e.g. Agricultural equipment, trade inventory"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Submitted KYC Verification Documents</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loanForm.documentsSubmitted}
                    onChange={(e) => setLoanForm({ ...loanForm, documentsSubmitted: e.target.value })}
                    required
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  ⚠️ <strong>Governance Standard:</strong> Initial application status is logged as `Submitted`. Following field inspection by staff, final credit sanction rests exclusively with Executive Director <strong>Rohit Meena</strong>.
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Loan Application for Verification <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
export default CustomerDashboard;
