import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generateTransactionSlipPDF } from '../utils/pdfGenerator';
import {
  ShieldAlert,
  Users,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Lock,
  Unlock,
  IndianRupee,
  Building,
  Clock,
  Activity,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
  FileText,
  ChevronRight,
  Award,
  Sparkles,
  Mail,
  Layers,
  Key,
  Share2,
  Printer,
  Download,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Timer,
  CheckCircle2,
  Phone,
  ArrowRight,
  Filter,
  Send,
  Zap,
  MapPin,
  ShieldOff
} from 'lucide-react';

export function AdminDashboard({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const data = useData() || {};

  const company = data.company || {};
  const users = data.users || [];
  const deposits = data.deposits || [];
  const loanApplications = data.loanApplications || data.applications || [];
  const auditLogs = data.auditLogs || [];
  const passwordResetRequests = data.passwordResetRequests || [];
  const delegatedAdmins = data.delegatedAdmins || [];

  const createStaff = data.createStaff;
  const createDirectCustomer = data.createDirectCustomer || data.registerCustomer;
  const toggleUserStatus = data.toggleUserStatus;
  const setUserAuthority = data.setUserAuthority;
  const updateLoanStatus = data.updateLoanStatus;
  const resetUserPassword = data.resetUserPassword;
  const grantDelegatedAdmin = data.grantDelegatedAdmin;
  const revokeDelegatedAdmin = data.revokeDelegatedAdmin;
  const adminUpdateStaffAttendance = data.adminUpdateStaffAttendance;
  const resetToDefault = data.resetToDefault;

  // Active Menu Tab (Left Vertical Sidebar)
  const [activeMenu, setActiveMenu] = useState('overview');

  // Headquarter Configuration
  const [adminHQ, setAdminHQ] = useState(() => {
    return localStorage.getItem('rpr_admin_hq') || company?.headquarters || 'Jaipur Central HQ';
  });
  const [showHQModal, setShowHQModal] = useState(false);
  const [hqInput, setHqInput] = useState(adminHQ);

  // Search & Filter States
  const [searchCust, setSearchCust] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [searchLedger, setSearchLedger] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Feedback Notification Banner
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: 'staff123',
    title: 'Senior Credit Officer',
    department: 'Risk & Underwriting',
    branch: 'Jamawaramgarh Branch, Jaipur'
  });

  const [showDirectCustModal, setShowDirectCustModal] = useState(false);
  const [custForm, setCustForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'cust123',
    address: 'Jamawaramgarh, Jaipur',
    accountType: 'Pay Reserve & Loan Account',
    creditLimit: 500000,
    initialDeposit: 15000
  });

  // Password Reset Modal (for targeted user)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delegated Admin Grant Modal (Profile Sharing)
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationForm, setDelegationForm] = useState({
    staffId: '',
    staffName: '',
    staffEmail: '',
    accessLevel: 'Operations Manager (Limited Admin)',
    permissions: ['Customer Directory & KYC Audit', 'Loan Underwriting Clearance'],
    validTill: '2026-12-31'
  });

  // View Customer Full Dossier Modal
  const [viewingCustomerDossier, setViewingCustomerDossier] = useState(null);
  const [showPlainPassword, setShowPlainPassword] = useState({});

  // View Financial Voucher Modal
  const [viewingVoucher, setViewingVoucher] = useState(null);

  // Filtered Roles
  const customers = useMemo(() => users.filter((u) => u.role === 'customer'), [users]);
  const staffMembers = useMemo(() => users.filter((u) => u.role === 'staff'), [users]);
  const pendingApps = useMemo(
    () => loanApplications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review' || a.status === 'Pending Review'),
    [loanApplications]
  );
  const pendingResetReqs = useMemo(
    () => (passwordResetRequests || []).filter((r) => r.status?.includes('Pending')),
    [passwordResetRequests]
  );

  // Numeric Aggregations (Fixed: No NaN, Accurate totals)
  const totalDisbursed = useMemo(
    () => customers.reduce((sum, c) => sum + Number(c.loans?.activeLoan ?? c.activeLoan ?? 0), 0),
    [customers]
  );
  const totalInflow = useMemo(
    () => (deposits || []).filter((d) => d.amount > 0).reduce((sum, d) => sum + Number(d.amount), 0),
    [deposits]
  );
  const activeStaffOnDuty = useMemo(
    () => staffMembers.filter((s) => s.attendance?.status === 'Checked In').length,
    [staffMembers]
  );

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = searchCust.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q) ||
        c.accountNumber?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, searchCust]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    const q = searchStaff.toLowerCase().trim();
    if (!q) return staffMembers;
    return staffMembers.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.staffId?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
    );
  }, [staffMembers, searchStaff]);

  // Filtered Deposits / Ledger Entries
  const filteredDeposits = useMemo(() => {
    const q = searchLedger.toLowerCase().trim();
    if (!q) return deposits;
    return deposits.filter(
      (d) =>
        d.customerName?.toLowerCase().includes(q) ||
        d.customerId?.toLowerCase().includes(q) ||
        d.receiptNumber?.toLowerCase().includes(q) ||
        d.mode?.toLowerCase().includes(q)
    );
  }, [deposits, searchLedger]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return auditLogs;
    if (activityFilter === 'money') return auditLogs.filter((l) => l.action?.toLowerCase().includes('deposit') || l.action?.toLowerCase().includes('collection') || l.action?.toLowerCase().includes('loan'));
    if (activityFilter === 'attendance') return auditLogs.filter((l) => l.action?.toLowerCase().includes('attendance') || l.action?.toLowerCase().includes('clock'));
    if (activityFilter === 'security') return auditLogs.filter((l) => l.action?.toLowerCase().includes('password') || l.action?.toLowerCase().includes('delegat') || l.action?.toLowerCase().includes('status'));
    return auditLogs;
  }, [auditLogs, activityFilter]);

  // Handler: Onboard Staff Officer
  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!createStaff) return;
    const res = createStaff(staffForm, currentUser);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Staff Officer ${res.staff.name} onboarded! Staff ID: ${res.staff.staffId || 'STF-JMW-02'} | Login: ${res.staff.email}`
      });
      setShowStaffModal(false);
      setStaffForm({
        name: '',
        email: '',
        password: 'staff123',
        title: 'Senior Field Officer',
        department: 'Customer Verification & Credit Desk',
        branch: 'Jamawaramgarh Branch, Jaipur'
      });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  // Handler: Direct Customer Provisioning
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!createDirectCustomer) return;
    const res = createDirectCustomer(custForm, currentUser);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Customer Account created by Admin! Assigned ID: ${res.customer.customerId} | Login: ${res.customer.email}`
      });
      setShowDirectCustModal(false);
      setCustForm({
        name: '',
        email: '',
        phone: '',
        password: 'cust123',
        address: 'Jamawaramgarh, Jaipur',
        accountType: 'Pay Reserve & Loan Account',
        creditLimit: 500000,
        initialDeposit: 15000
      });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  // Handler: Execute Targeted Password Reset
  const handleExecutePasswordReset = (e) => {
    e.preventDefault();
    if (!selectedUserForReset || !resetUserPassword) return;

    const res = resetUserPassword(selectedUserForReset.id, newPasswordInput, currentUser);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Password successfully overwritten for ${selectedUserForReset.name} (${selectedUserForReset.email})!`
      });
      setShowPasswordModal(false);
      setSelectedUserForReset(null);
      setNewPasswordInput('');
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  // Handler: Grant Delegated Admin Access (Profile Sharing)
  const handleGrantDelegation = (e) => {
    e.preventDefault();
    if (!grantDelegatedAdmin) return;
    const selectedStaff = staffMembers.find((s) => s.staffId === delegationForm.staffId || s.id === delegationForm.staffId);
    if (!selectedStaff) {
      setFeedback({ type: 'error', text: 'Please select an authorized staff member from the roster.' });
      return;
    }

    const res = grantDelegatedAdmin(
      {
        staffId: selectedStaff.staffId || selectedStaff.id,
        staffName: selectedStaff.name,
        staffEmail: selectedStaff.email,
        accessLevel: delegationForm.accessLevel,
        permissions: delegationForm.permissions,
        validTill: delegationForm.validTill
      },
      currentUser
    );

    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Admin profile access successfully shared with ${selectedStaff.name}! Delegated Passkey: ${res.delegation.tokenPasskey}`
      });
      setShowDelegationModal(false);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  // Handler: Update Staff Authority (Block / Revoke / Active)
  const handleUpdateStaffAuthority = (targetStaff, newStatus) => {
    if (!setUserAuthority) return;
    setUserAuthority(targetStaff.id, newStatus, currentUser);
    if (newStatus === 'Blocked') {
      setFeedback({ type: 'error', text: `Staff Officer ${targetStaff.name} has been BLOCKED. Login access denied.` });
    } else if (newStatus === 'Revoked') {
      setFeedback({ type: 'error', text: `Access REVOKED for ${targetStaff.name}. Duty shift terminated & permissions cancelled.` });
    } else {
      setFeedback({ type: 'success', text: `Staff privileges restored to Active for ${targetStaff.name}.` });
    }
  };

  // Handler: Save Headquarter
  const handleSaveHQ = (e) => {
    e.preventDefault();
    const trimmed = hqInput.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', text: 'Headquarter name cannot be empty.' });
      return;
    }
    setAdminHQ(trimmed);
    try {
      localStorage.setItem('rpr_admin_hq', trimmed);
    } catch {}
    if (company) {
      company.headquarters = trimmed;
    }
    setShowHQModal(false);
    setFeedback({ type: 'success', text: `Headquarter location updated to: ${trimmed}` });
  };

  return (
    <div className="portal-viewport-layout">
      {/* ===================== PINNED LEFT SIDEBAR ===================== */}
      <aside className="portal-sidebar-fixed">
        {/* Top Header Branding */}
        <div className="sidebar-top-branding" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem', flexShrink: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', flexShrink: 0 }}>
            <img src="/logo-icon.png" alt="RPR Capital" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.2 }}>Admin Executive Suite</div>
            <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Master Control & Governance</div>
          </div>
        </div>

        {/* Headquarter Setting & Oversight Strip */}
        <div
          className="sidebar-attendance-widget"
          style={{
            background: '#f8fafc',
            padding: '0.35rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #e2e8f0',
            marginBottom: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            flexShrink: 0
          }}
        >
          <div style={{ minWidth: 0, flex: 1, marginRight: '0.35rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }} />
              Headquarter
            </div>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={adminHQ}>
              {adminHQ}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.68rem', padding: '0.18rem 0.45rem', height: 'auto', borderRadius: '5px', flexShrink: 0 }}
            onClick={() => {
              setHqInput(adminHQ);
              setShowHQModal(true);
            }}
            title="Change Headquarter Location"
          >
            <Edit3 size={11} /> Change
          </button>
        </div>

        {/* 9 Clean Navigation Menus (Left Vertical Bar) */}
        <nav className="portal-sidebar-nav">
          <button
            id="btn-admin-overview"
            className={`tab-btn ${activeMenu === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveMenu('overview')}
          >
            <Layers size={15} /> Dashboard Overview
          </button>

          <button
            id="btn-admin-activity"
            className={`tab-btn ${activeMenu === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveMenu('activity')}
          >
            <Activity size={15} /> Live Activity & Feed
          </button>

          <button
            id="btn-admin-customers"
            className={`tab-btn ${activeMenu === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveMenu('customers')}
          >
            <Users size={15} /> Master Customer Directory ({customers.length})
          </button>

          <button
            id="btn-admin-staff"
            className={`tab-btn ${activeMenu === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveMenu('staff')}
          >
            <UserCheck size={15} /> Staff & Attendance ({staffMembers.length})
          </button>

          <button
            id="btn-admin-applications"
            className={`tab-btn ${activeMenu === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveMenu('applications')}
          >
            <Clock size={15} /> Inbound Queue ({pendingApps.length})
          </button>

          <button
            id="btn-admin-ledger"
            className={`tab-btn ${activeMenu === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveMenu('ledger')}
          >
            <IndianRupee size={15} /> Financial Inflow & Ledger
          </button>

          <button
            id="btn-admin-passwords"
            className={`tab-btn ${activeMenu === 'passwords' ? 'active' : ''}`}
            onClick={() => setActiveMenu('passwords')}
          >
            <Key size={15} /> Password Reset Desk {pendingResetReqs.length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: '10px', marginLeft: 'auto' }}>{pendingResetReqs.length}</span>}
          </button>

          <button
            id="btn-admin-delegation"
            className={`tab-btn ${activeMenu === 'delegation' ? 'active' : ''}`}
            onClick={() => setActiveMenu('delegation')}
          >
            <Share2 size={15} /> Delegated Admin Access ({delegatedAdmins.filter(d => d.status === 'Active').length})
          </button>

          <button
            id="btn-admin-logs"
            className={`tab-btn ${activeMenu === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveMenu('logs')}
          >
            <ShieldAlert size={15} /> Audit & Security Logs
          </button>
        </nav>

        {/* ===================== ADMIN PROFILE CARD AT BOTTOM ===================== */}
        <div className="sidebar-bottom-profile-card admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d4ed8, #0284c7)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)'
              }}
            >
              RM
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Rohit Meena
              </div>
              <div style={{ fontSize: '0.67rem', color: '#1d4ed8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                Director & Master Admin
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {currentUser?.email || 'rprcapital2624@gmail.com'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '0.12rem 0.4rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              ● Master Authority
            </span>
            <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>
              Super Active
            </span>
          </div>

          <button
            id="btn-admin-edit-profile"
            type="button"
            className="btn btn-sm"
            onClick={() => setActiveMenu('security')}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.73rem',
              padding: '0.32rem 0.45rem',
              borderRadius: '7px',
              gap: '0.35rem',
              fontWeight: 700,
              border: '1.5px solid #1d4ed8',
              color: activeMenu === 'security' ? '#ffffff' : '#1d4ed8',
              background: activeMenu === 'security' ? '#1d4ed8' : '#eff6ff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(29, 78, 216, 0.15)'
            }}
            title="Master Security Controls & System Administration"
          >
            <ShieldCheck size={12} /> Master Security Controls
          </button>
        </div>
      </aside>

      {/* ===================== SCROLLABLE RIGHT MAIN CONTENT ===================== */}
      <main className="portal-main-scrollable">
        {/* Top Operational Header */}
        <div
          className="dashboard-topbar"
          style={{
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ROHIT MEENA — Executive Admin Suite
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Headquarter: <strong>{adminHQ}</strong> • Master Administrative Controls
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDirectCustModal(true)}>
              <UserPlus size={14} /> + New Customer
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowStaffModal(true)}>
              <UserCheck size={14} /> + Add Staff Officer
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowDelegationModal(true)}>
              <Share2 size={14} /> Delegate Access
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${feedback.type === 'success' ? '#10b981' : '#f87171'}`,
              color: feedback.type === 'success' ? '#15803d' : '#991b1b',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} color="#15803d" /> : <AlertCircle size={16} color="#dc2626" />}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Metrics Grid (Fixed NaN & Missing values) */}
        <div className="metrics-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="metric-card">
            <div className="metric-header">
              <span>Total Capital Reserve Pool</span>
            </div>
            <div className="metric-value text-gradient-cyan">
              {company.reserveFundSize || '₹50,00,000'}
            </div>
            <div className="metric-footer">
              Institutional capital buffer (Jamawaramgarh HQ)
            </div>
          </div>

          <div className="metric-card purple-glow">
            <div className="metric-header">
              <span>Total Active Credit Disbursals</span>
            </div>
            <div className="metric-value text-gradient-purple">
              ₹{Number(totalDisbursed).toLocaleString('en-IN')}
            </div>
            <div className="metric-footer">
              Live sanctioned loans across {customers.length} customer accounts
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Total Cash Inflow (Deposits)</span>
            </div>
            <div className="metric-value" style={{ color: '#059669' }}>
              ₹{Number(totalInflow).toLocaleString('en-IN')}
            </div>
            <div className="metric-footer">
              {deposits.length} Ledger receipts verified & cryptographically signed
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>Authorized Staff & Duty Status</span>
            </div>
            <div className="metric-value" style={{ color: '#7c3aed' }}>
              {activeStaffOnDuty} / {staffMembers.length} On Duty
            </div>
            <div className="metric-footer">
              Operational field & verification underwriters
            </div>
          </div>
        </div>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeMenu === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-split-2col" style={{ gap: '1.25rem' }}>
              {/* Quick Queue / Inbound Actions */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={18} color="#d97706" /> Inbound Approvals Requiring Rohit Meena
                  </h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveMenu('applications')}>
                    View All ({pendingApps.length})
                  </button>
                </div>

                {pendingApps.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pendingApps.slice(0, 3).map((app) => (
                      <div key={app.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{app.applicantName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {app.id} • Amount: <strong style={{ color: '#7c3aed' }}>₹{Number(app.requestedAmount).toLocaleString('en-IN')}</strong> ({app.purpose})
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#10b981', color: '#fff', fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => {
                              updateLoanStatus(app.id, 'Approved', currentUser, 'Approved & Sanctioned directly by Owner Rohit Meena');
                              setFeedback({ type: 'success', text: `Loan ${app.id} sanctioned directly by Rohit Meena!` });
                            }}
                          >
                            <Check size={12} /> Sanction
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    ✓ Inbound queue clear. No loan files awaiting administrative sanction.
                  </div>
                )}
              </div>

              {/* Password Reset Requests Widget */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Key size={18} color="#1d4ed8" /> Inbound Password Reset Requests
                  </h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveMenu('passwords')}>
                    Desk ({pendingResetReqs.length})
                  </button>
                </div>

                {pendingResetReqs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pendingResetReqs.slice(0, 3).map((req) => (
                      <div key={req.id} style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e3a8a' }}>{req.userEmail}</div>
                          <div style={{ fontSize: '0.74rem', color: '#3b82f6' }}>{req.reason}</div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => {
                            resetUserPassword(req.userEmail, 'password123', currentUser);
                            setFeedback({ type: 'success', text: `Password for ${req.userEmail} reset to 'password123'!` });
                          }}
                        >
                          Reset to 'password123'
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    ✓ No pending password reset requests. All accounts secure.
                  </div>
                )}
              </div>
            </div>

            {/* Live Staff Duty & Attendance Banner */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <UserCheck size={18} color="#10b981" /> Live Staff Attendance & Duty Monitor
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Live oversight of branch field officers and underwriting shift activity.
                  </p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveMenu('staff')}>
                  Full Staff Roster ({staffMembers.length})
                </button>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Staff Officer</th>
                      <th>Staff ID</th>
                      <th>Branch Desk</th>
                      <th>Duty Status</th>
                      <th>Clock-in Time</th>
                      <th>Admin Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((s) => {
                      const isCheckedIn = s.attendance?.status === 'Checked In';
                      return (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.title}</div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1d4ed8' }}>
                            {s.staffId || 'STF-JMW-01'}
                          </td>
                          <td>{s.branch || 'Jamawaramgarh Branch, Jaipur'}</td>
                          <td>
                            <span className={`badge ${isCheckedIn ? 'badge-green' : 'badge-amber'}`}>
                              {isCheckedIn ? '● ON DUTY' : 'OFF DUTY'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                            {isCheckedIn ? s.attendance?.clockInTime || '09:30 AM' : 'Shift Ended'}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                              onClick={() => {
                                adminUpdateStaffAttendance(
                                  s.staffId || s.id,
                                  isCheckedIn ? 'Checked Out' : 'Checked In',
                                  'Manual override by Executive Admin Rohit Meena',
                                  currentUser
                                );
                                setFeedback({
                                  type: 'success',
                                  text: `Staff attendance for ${s.name} marked as ${isCheckedIn ? 'Checked Out' : 'Checked In'}!`
                                });
                              }}
                            >
                              <Timer size={12} /> {isCheckedIn ? 'Set Off-Duty' : 'Set On-Duty'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: LIVE ACTIVITY FEED ===================== */}
        {activeMenu === 'activity' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Activity size={20} color="#7c3aed" /> Real-Time Institutional Activity Log
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Immutable audit trail of all transactions, account registrations, attendance logs, and administrative decisions.
                </p>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button className={`btn btn-sm ${activityFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivityFilter('all')}>
                  All ({auditLogs.length})
                </button>
                <button className={`btn btn-sm ${activityFilter === 'money' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivityFilter('money')}>
                  Money Inflow / Loans
                </button>
                <button className={`btn btn-sm ${activityFilter === 'attendance' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivityFilter('attendance')}>
                  Staff Attendance
                </button>
                <button className={`btn btn-sm ${activityFilter === 'security' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivityFilter('security')}>
                  Security & Passwords
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor (Initiator)</th>
                    <th>Target Entity</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>
                        {log.id}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {log.timestamp}
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                        {log.actor}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                        {log.target}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: MASTER CUSTOMER DIRECTORY ===================== */}
        {activeMenu === 'customers' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Master Customer Directory & Credentials</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Full administrative oversight to inspect credentials, active credit lines, and account security.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search name, ID, mobile..."
                    value={searchCust}
                    onChange={(e) => setSearchCust(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '220px', fontSize: '0.84rem' }}
                  />
                </div>

                <button className="btn btn-primary btn-sm" onClick={() => setShowDirectCustModal(true)}>
                  <UserPlus size={14} /> New Customer
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name & Account</th>
                    <th>Login Email</th>
                    <th>Mobile</th>
                    <th>Location</th>
                    <th>Credit Limit</th>
                    <th>Active Loan</th>
                    <th>Savings Bal</th>
                    <th>Created By</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust) => {
                    const creditLimit = cust.loans?.sanctionedAmount ?? cust.creditLimit ?? (cust.loans?.activeLoan ? cust.loans.activeLoan * 1.5 : 500000);
                    const activeLoan = cust.loans?.activeLoan ?? cust.activeLoan ?? 0;
                    const savingsBal = cust.savings?.currentBalance ?? cust.reserveBalance ?? 0;
                    const location = cust.city || cust.address?.split(',')[1]?.trim() || 'Jamawaramgarh, Jaipur';
                    const createdBy = cust.createdBy || 'Rohit Meena (Admin)';

                    return (
                      <tr key={cust.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8' }}>
                          {cust.customerId}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{cust.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {cust.accountNumber || `RPR-ACC-${cust.customerId?.slice(-4)}`}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{cust.email}</td>
                        <td style={{ fontSize: '0.82rem' }}>{cust.phone || '+91 98290 12345'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{location}</td>
                        <td style={{ fontWeight: 700, color: '#7c3aed' }}>
                          ₹{Number(creditLimit).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: activeLoan > 0 ? '#d97706' : '#10b981' }}>
                          ₹{Number(activeLoan).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>
                          ₹{Number(savingsBal).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {createdBy}
                        </td>
                        <td>
                          <span className={`badge ${cust.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                            {cust.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => setViewingCustomerDossier(cust)}
                              title="View full credentials & dossier"
                            >
                              <Eye size={12} /> Dossier
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => {
                                setSelectedUserForReset(cust);
                                setNewPasswordInput('cust123');
                                setShowPasswordModal(true);
                              }}
                              title="Reset customer password"
                            >
                              <Key size={12} /> Reset
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => {
                                toggleUserStatus(cust.id, currentUser);
                                setFeedback({ type: 'success', text: `Status toggled for ${cust.name}!` });
                              }}
                              title="Freeze or Activate customer"
                            >
                              {cust.status === 'Active' ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: STAFF & ATTENDANCE DESK ===================== */}
        {activeMenu === 'staff' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Staff Officers & Attendance Roster</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Underwriters and field collection officers authorized under Rohit Meena's supervision.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Filter staff by name/ID..."
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  className="form-input"
                  style={{ width: '200px', fontSize: '0.84rem' }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>
                  <UserPlus size={14} /> + Onboard Staff Officer
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Staff Officer</th>
                    <th>Staff ID</th>
                    <th>Official Login</th>
                    <th>Department</th>
                    <th>Branch Desk</th>
                    <th>Authority Status</th>
                    <th>Live Duty Status</th>
                    <th>Attendance Records</th>
                    <th>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((st) => {
                    const isCheckedIn = st.attendance?.status === 'Checked In';
                    const isBlocked = st.status === 'Blocked';
                    const isRevoked = st.status === 'Revoked';
                    return (
                      <tr key={st.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{st.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.title}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8' }}>
                          {st.staffId || 'STF-JMW-01'}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{st.email}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{st.department}</td>
                        <td style={{ fontSize: '0.82rem' }}>{st.branch}</td>
                        <td>
                          {isBlocked ? (
                            <span className="badge badge-amber" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.68rem' }}>
                              ● BLOCKED
                            </span>
                          ) : isRevoked ? (
                            <span className="badge badge-red" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.68rem' }}>
                              ● ACCESS REVOKED
                            </span>
                          ) : (
                            <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                              ● ACTIVE
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${isCheckedIn ? 'badge-green' : 'badge-amber'}`}>
                            {isCheckedIn ? '● ON DUTY' : 'OFF DUTY'}
                          </span>
                          {isCheckedIn && (
                            <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                              Since {st.attendance?.clockInTime || '09:30 AM'}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem' }}>
                            <strong>{st.attendance?.totalDaysPresent || 24} Days Present</strong>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {st.attendance?.totalDaysLeave || 1} Days Leave
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => {
                                adminUpdateStaffAttendance(
                                  st.staffId || st.id,
                                  isCheckedIn ? 'Checked Out' : 'Checked In',
                                  'Manual override by Rohit Meena',
                                  currentUser
                                );
                                setFeedback({
                                  type: 'success',
                                  text: `Duty status updated for ${st.name}!`
                                });
                              }}
                              title="Toggle Duty Status"
                            >
                              <Timer size={12} /> {isCheckedIn ? 'Clock Out' : 'Clock In'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => {
                                setSelectedUserForReset(st);
                                setNewPasswordInput('staff123');
                                setShowPasswordModal(true);
                              }}
                              title="Reset Staff Password"
                            >
                              <Key size={12} /> Password
                            </button>
                            {isBlocked ? (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#16a34a', borderColor: '#bbf7d0' }}
                                onClick={() => handleUpdateStaffAuthority(st, 'Active')}
                                title="Unblock Staff Officer"
                              >
                                <Unlock size={12} /> Unblock
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#d97706', borderColor: '#fde68a' }}
                                onClick={() => handleUpdateStaffAuthority(st, 'Blocked')}
                                title="Block Staff Officer Access"
                              >
                                <Lock size={12} /> Block
                              </button>
                            )}
                            {isRevoked ? (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                                onClick={() => handleUpdateStaffAuthority(st, 'Active')}
                                title="Restore Staff Access"
                              >
                                <ShieldCheck size={12} /> Restore
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#dc2626', borderColor: '#fecaca' }}
                                onClick={() => {
                                  if (window.confirm(`Revoke all administrative access and terminate privileges for ${st.name}?`)) {
                                    handleUpdateStaffAuthority(st, 'Revoked');
                                  }
                                }}
                                title="Revoke Staff Access Permanently"
                              >
                                <ShieldOff size={12} /> Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: INBOUND QUEUE & APPROVALS ===================== */}
        {activeMenu === 'applications' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Loan Sanctions & Underwriting Decision Desk</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Sole authority to sanction or reject credit files rests exclusively with Executive Admin Rohit Meena.
                </p>
              </div>
              <span className="badge badge-amber">{pendingApps.length} Action Required</span>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Applicant Name</th>
                    <th>Customer ID</th>
                    <th>Contact & Domicile</th>
                    <th>Loan Purpose</th>
                    <th>Requested Limit</th>
                    <th>Current Status</th>
                    <th>Rohit Meena Decision Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loanApplications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8' }}>
                        {app.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.applicantName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tenure: {app.tenureMonths || 24} Months</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>{app.customerId}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>{app.mobile}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.address}</div>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>{app.purpose}</td>
                      <td style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.95rem' }}>
                        ₹{Number(app.requestedAmount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${app.status === 'Approved' ? 'badge-green' : app.status === 'Rejected' ? 'badge-amber' : 'badge-cyan'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status !== 'Approved' && app.status !== 'Rejected' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.28rem 0.6rem', fontSize: '0.74rem', background: '#10b981', borderColor: '#10b981' }}
                              onClick={() => {
                                updateLoanStatus(app.id, 'Approved', currentUser, 'Approved & Sanctioned directly by Owner Rohit Meena');
                                setFeedback({ type: 'success', text: `Loan ${app.id} for ₹${Number(app.requestedAmount).toLocaleString('en-IN')} approved!` });
                              }}
                            >
                              <Check size={12} /> Sanction
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.28rem 0.6rem', fontSize: '0.74rem', color: '#ef4444' }}
                              onClick={() => {
                                updateLoanStatus(app.id, 'Rejected', currentUser, 'Rejected by Admin');
                                setFeedback({ type: 'error', text: `Loan application ${app.id} was rejected.` });
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {app.status === 'Approved' ? '✓ Disbursed & Active' : '✕ Formally Declined'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: FINANCIAL INFLOW & LEDGER ===================== */}
        {activeMenu === 'ledger' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Master Financial Inflow & Cash Ledger</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Comprehensive audit of counter deposits, EMI collections, and voucher receipts.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search receipt, customer..."
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  className="form-input"
                  style={{ width: '220px', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Account No</th>
                    <th>Type / Channel</th>
                    <th>Inflow Amount</th>
                    <th>Received By Staff</th>
                    <th>Payment Mode</th>
                    <th>Voucher Slip</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeposits.map((dep) => (
                    <tr key={dep.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8' }}>
                        {dep.receiptNumber || dep.id}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{dep.date}</td>
                      <td>
                        <strong>{dep.customerName}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dep.customerId}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{dep.accountNumber}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          {dep.type || 'Deposit'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: dep.amount > 0 ? '#10b981' : '#ef4444', fontSize: '0.92rem' }}>
                        {dep.amount > 0 ? '+' : '-'}₹{Math.abs(dep.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{dep.receivedBy || 'Staff Officer'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dep.mode}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => setViewingVoucher(dep)}
                        >
                          <Printer size={12} /> Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 7: PASSWORD RESET DESK ===================== */}
        {activeMenu === 'passwords' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Inbound Password Reset Queue */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Key size={20} color="#1d4ed8" /> Inbound Password Recovery Queue
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Requests submitted by customers or staff who forgot their credentials.
                  </p>
                </div>
                <span className="badge badge-purple">{pendingResetReqs.length} Pending Inquiries</span>
              </div>

              {pendingResetReqs.length > 0 ? (
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>User Email</th>
                        <th>Reason / Note</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Admin Password Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingResetReqs.map((req) => (
                        <tr key={req.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8' }}>
                            {req.id}
                          </td>
                          <td>
                            <strong>{req.userEmail}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: {req.accountOrId}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{req.reason}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.requestDate}</td>
                          <td>
                            <span className="badge badge-amber">{req.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.28rem 0.6rem', fontSize: '0.74rem' }}
                                onClick={() => {
                                  resetUserPassword(req.userEmail, 'password123', currentUser);
                                  setFeedback({ type: 'success', text: `Password for ${req.userEmail} reset to 'password123'!` });
                                }}
                              >
                                Set to 'password123'
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.28rem 0.6rem', fontSize: '0.74rem' }}
                                onClick={() => {
                                  const targetUser = users.find(u => u.email === req.userEmail);
                                  setSelectedUserForReset(targetUser || { id: req.userEmail, email: req.userEmail, name: req.userName });
                                  setNewPasswordInput('');
                                  setShowPasswordModal(true);
                                }}
                              >
                                Custom Passkey
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  ✓ No pending password recovery requests. All customer and staff accounts are in order.
                </div>
              )}
            </div>

            {/* Direct Password Reset for Any Account */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Lock size={18} color="#7c3aed" /> Direct Account Password Overwrite
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Admin Rohit Meena can directly overwrite the password of any customer or staff officer at any time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {users.slice(0, 6).map((u) => (
                  <div key={u.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#1d4ed8', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role: {u.role?.toUpperCase()}</div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => {
                        setSelectedUserForReset(u);
                        setNewPasswordInput(u.role === 'customer' ? 'cust123' : 'staff123');
                        setShowPasswordModal(true);
                      }}
                    >
                      <Key size={12} /> Reset
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 8: PROFILE SHARING & DELEGATED ACCESS ===================== */}
        {activeMenu === 'delegation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Share2 size={20} color="#7c3aed" /> Delegated Administrative Access (Profile Sharing)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Share your administrative suite with trusted staff members under strictly configured, limited-access privileges.
                  </p>
                </div>
                <button className="btn btn-purple btn-sm" onClick={() => setShowDelegationModal(true)}>
                  <Share2 size={14} /> + Grant Delegated Access
                </button>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Delegated Officer</th>
                      <th>Staff ID</th>
                      <th>Assigned Access Scope</th>
                      <th>Configured Permissions</th>
                      <th>Passkey Token</th>
                      <th>Valid Till</th>
                      <th>Status</th>
                      <th>Executive Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delegatedAdmins.map((dlg) => (
                      <tr key={dlg.id}>
                        <td>
                          <strong>{dlg.staffName}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dlg.staffEmail}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1d4ed8' }}>
                          {dlg.staffId}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.82rem', color: '#7c3aed' }}>
                          {dlg.accessLevel}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {dlg.permissions?.map((p, idx) => (
                              <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                          {dlg.tokenPasskey}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dlg.validTill}</td>
                        <td>
                          <span className={`badge ${dlg.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                            {dlg.status}
                          </span>
                        </td>
                        <td>
                          {dlg.status === 'Active' ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', color: '#ef4444' }}
                              onClick={() => {
                                revokeDelegatedAdmin(dlg.id, currentUser);
                                setFeedback({ type: 'success', text: `Delegated access revoked for ${dlg.staffName}!` });
                              }}
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Access Rescinded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 9: AUDIT & SYSTEM LOGS ===================== */}
        {activeMenu === 'logs' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldAlert size={20} color="#7c3aed" /> Institutional Cryptographic System Audit Logs
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Permanent record of all modifications to customer accounts, employee permissions, and financial registers.
            </p>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Initiator (Actor)</th>
                    <th>Target Entity</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>
                        {log.id}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                      <td style={{ fontWeight: 600 }}>{log.action}</td>
                      <td style={{ color: '#7c3aed', fontWeight: 700 }}>{log.actor}</td>
                      <td style={{ color: 'var(--text-main)' }}>{log.target}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 10: MASTER SECURITY CONTROLS & ADMINISTRATION ===================== */}
        {activeMenu === 'security' && (
          <div className="grid-2col-even" style={{ gap: '1.5rem' }}>
            {/* Panel 1: Security Controls & Headquarter Administration */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <ShieldCheck size={22} color="#1d4ed8" /> Master Security Controls & Governance
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Principal executive governance controls for <strong>Rajasthan Pay Reserve Capital</strong>. You hold sole authority over staff appointments, operational headquarters, and system policies.
              </p>

              {/* Headquarter Management Box */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Headquarter Location
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      setHqInput(adminHQ);
                      setShowHQModal(true);
                    }}
                  >
                    <Edit3 size={12} /> Edit HQ
                  </button>
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e293b' }}>
                  {adminHQ}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                <div><strong>Founder & Owner:</strong> ROHIT MEENA</div>
                <div><strong>Authorized Login:</strong> {currentUser?.email || 'rprcapital2624@gmail.com'}</div>
                <div><strong>Authority Level:</strong> Super Administrator (Master Authority)</div>
                <div><strong>Entity Name:</strong> Rajasthan Pay Reserve Capital (RPR)</div>
              </div>
            </div>

            {/* Panel 2: Demonstration State Reset */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={22} color="#475569" /> System Data Reset & Baseline
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Need to restart fresh with pristine baseline records? This will restore initial staff, customer accounts, vouchers, and pending queue back to their clean baseline.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (window.confirm('Reset local demo dataset to defaults? All test changes will revert to baseline.')) {
                    resetToDefault();
                    setFeedback({ type: 'success', text: 'Database reset to initial demo state.' });
                  }
                }}
              >
                <RotateCcw size={15} /> Reset Local Demo Database
              </button>
            </div>
          </div>
        )}

        {/* Minimal Portal Footer inside scrollable pane */}
        <footer style={{ marginTop: '3.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          © {new Date().getFullYear()} <strong>RPR : Rajasthan Pay Reserve Capital</strong> • {adminHQ} • Master Executive Administration
        </footer>
      </main>

      {/* ===================== MODALS ===================== */}

      {/* 1. Modal: Onboard New Staff Officer */}
      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Onboard New Staff Officer</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Authorize an underwriter with account minting privileges
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowStaffModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Staff Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rameshwar Soni"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Official Staff Email (Login ID) *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rameshwar.soni@rprcapital.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Temporary Passkey *</label>
                <input
                  type="text"
                  className="form-input"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={staffForm.title}
                    onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Branch Desk</label>
                  <input
                    type="text"
                    className="form-input"
                    value={staffForm.branch}
                    onChange={(e) => setStaffForm({ ...staffForm, branch: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '0.75rem' }}>
                <UserCheck size={16} /> Authorize & Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Direct Customer Provisioning by Admin */}
      {showDirectCustModal && (
        <div className="modal-overlay" onClick={() => setShowDirectCustModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Direct Customer Account Provisioning</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Mint customer ID and activate immediate portal access
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDirectCustModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Customer Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={custForm.name}
                    onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98290 88888"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Login Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. ramesh@example.com"
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Initial Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={custForm.password}
                    onChange={(e) => setCustForm({ ...custForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Initial Credit Limit (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={custForm.creditLimit}
                    onChange={(e) => setCustForm({ ...custForm, creditLimit: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Initial Deposit Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={custForm.initialDeposit}
                    onChange={(e) => setCustForm({ ...custForm, initialDeposit: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                <UserPlus size={16} /> Mint ID & Provision Customer Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Targeted Password Reset */}
      {showPasswordModal && selectedUserForReset && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={18} color="#7c3aed" /> Reset Account Password
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  User: <strong>{selectedUserForReset.name}</strong> ({selectedUserForReset.email})
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>

            <form onSubmit={handleExecutePasswordReset}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  New Password / Temporary Passkey *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setNewPasswordInput('cust123')}
                >
                  cust123
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setNewPasswordInput('staff123')}
                >
                  staff123
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setNewPasswordInput(`RPR@${Math.floor(1000 + Math.random() * 9000)}`)}
                >
                  Generate Random
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', background: '#7c3aed', borderColor: '#7c3aed' }}>
                  <Key size={14} /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Grant Delegated Admin Access (Profile Sharing) */}
      {showDelegationModal && (
        <div className="modal-overlay" onClick={() => setShowDelegationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Share2 size={18} color="#7c3aed" /> Grant Delegated Admin Access
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Share limited administrative privileges with an authorized staff officer
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDelegationModal(false)}>✕</button>
            </div>

            <form onSubmit={handleGrantDelegation}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  Select Authorized Staff Officer *
                </label>
                <select
                  className="form-input"
                  value={delegationForm.staffId}
                  onChange={(e) => {
                    const st = staffMembers.find((s) => s.staffId === e.target.value || s.id === e.target.value);
                    setDelegationForm({
                      ...delegationForm,
                      staffId: e.target.value,
                      staffName: st?.name || '',
                      staffEmail: st?.email || ''
                    });
                  }}
                  required
                  style={{ width: '100%', background: '#fff' }}
                >
                  <option value="">-- Choose Staff Member --</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.staffId || s.id}>
                      {s.name} ({s.staffId || 'STF-01'}) — {s.branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  Delegated Administrative Role *
                </label>
                <select
                  className="form-input"
                  value={delegationForm.accessLevel}
                  onChange={(e) => setDelegationForm({ ...delegationForm, accessLevel: e.target.value })}
                  style={{ width: '100%', background: '#fff' }}
                >
                  <option value="Operations Manager (Limited Admin)">Operations Manager (Limited Admin)</option>
                  <option value="Audit & Financial Supervisor">Audit & Financial Supervisor</option>
                  <option value="Underwriting Approval Delegate">Underwriting Approval Delegate</option>
                  <option value="Attendance & Field Supervisor">Attendance & Field Supervisor</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  Access Expiry Date (Valid Till)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={delegationForm.validTill}
                  onChange={(e) => setDelegationForm({ ...delegationForm, validTill: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                <strong style={{ color: '#0f172a' }}>Security Guardrail:</strong> Master administrative actions (deleting databases, changing company ownership, modifying Rohit Meena credentials) cannot be delegated.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDelegationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', background: '#7c3aed', borderColor: '#7c3aed' }}>
                  <Share2 size={14} /> Authorize Profile Sharing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: View Customer Dossier & Credentials */}
      {viewingCustomerDossier && (
        <div className="modal-overlay" onClick={() => setViewingCustomerDossier(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Customer Credentials & KYC Dossier</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Audited record under Rohit Meena's administrative access
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingCustomerDossier(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Customer ID</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#1d4ed8' }}>{viewingCustomerDossier.customerId}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Account Number</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{viewingCustomerDossier.accountNumber}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Login Email</span>
                  <strong>{viewingCustomerDossier.email}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Number</span>
                  <strong>{viewingCustomerDossier.phone || '+91 98290 12345'}</strong>
                </div>
              </div>

              {/* Password Inspection Row */}
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#1d4ed8', display: 'block', fontWeight: 700 }}>Portal Passkey / Password</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#1e3a8a' }}>
                    {showPlainPassword[viewingCustomerDossier.id] ? viewingCustomerDossier.password || 'password123' : '••••••••••••'}
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPlainPassword({ ...showPlainPassword, [viewingCustomerDossier.id]: !showPlainPassword[viewingCustomerDossier.id] })}
                >
                  {showPlainPassword[viewingCustomerDossier.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPlainPassword[viewingCustomerDossier.id] ? ' Hide' : ' Reveal'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Aadhaar Link</span>
                  <strong>{viewingCustomerDossier.idProof?.number || '•••• •••• 8821'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>PAN Card</span>
                  <strong>{viewingCustomerDossier.idProof?.pan || 'ABCPS1234F'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Registered Nominee</span>
                  <strong>{viewingCustomerDossier.nominee || 'Radha Devi'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Linked Bank</span>
                  <strong>{viewingCustomerDossier.bankDetails?.bankName || 'State Bank of India'}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedUserForReset(viewingCustomerDossier);
                  setNewPasswordInput('cust123');
                  setShowPasswordModal(true);
                  setViewingCustomerDossier(null);
                }}
              >
                <Key size={14} /> Overwrite Password
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setViewingCustomerDossier(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: View Financial Voucher */}
      {viewingVoucher && (
        <div className="modal-overlay" onClick={() => setViewingVoucher(null)}>
          <div className="modal-content printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> Official Financial Audit Voucher
              </span>
              <button className="modal-close-btn" onClick={() => setViewingVoucher(null)}>✕</button>
            </div>

            <div className="staff-receipt-voucher">
              <div className="staff-receipt-watermark" />
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  RPR : RAJASTHAN PAY RESERVE CAPITAL
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Jamawaramgarh Regional Hub, Jaipur • Administrative Voucher Copy
                </div>
              </div>

              <div className="grid-2col-even" style={{ gap: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div><span style={{ color: '#64748b' }}>Voucher No: </span><strong style={{ fontFamily: 'var(--font-mono)' }}>{viewingVoucher.receiptNumber || viewingVoucher.id}</strong></div>
                <div style={{ textAlign: 'right' }}><span style={{ color: '#64748b' }}>Date: </span><strong>{viewingVoucher.date}</strong></div>
                <div><span style={{ color: '#64748b' }}>Customer: </span><strong>{viewingVoucher.customerName}</strong></div>
                <div style={{ textAlign: 'right' }}><span style={{ color: '#64748b' }}>Account: </span><strong style={{ fontFamily: 'var(--font-mono)' }}>{viewingVoucher.accountNumber}</strong></div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{viewingVoucher.type || 'Deposit'} Amount</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8' }}>₹{Math.abs(viewingVoucher.amount).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div><strong>Payment Mode:</strong> {viewingVoucher.mode}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{viewingVoucher.txnRef}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div>Received by: <strong>{viewingVoucher.receivedBy || 'Staff Officer'}</strong></div>
                <div style={{ color: '#16a34a', fontWeight: 800 }}>✓ AUDITED BY EXECUTIVE ADMIN ROHIT MEENA</div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => generateTransactionSlipPDF(viewingVoucher, {}, currentUser)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', border: 'none' }}
              >
                <FileText size={15} /> Download Official PDF
              </button>
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={15} /> Print Voucher
              </button>
              <button className="btn btn-secondary" onClick={() => setViewingVoucher(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Headquarter Location */}
      {showHQModal && (
        <div className="modal-overlay" onClick={() => setShowHQModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Update Headquarter</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Set official operational central hub for RPR Capital
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowHQModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveHQ}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  Headquarter Location Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jaipur Central HQ"
                  value={hqInput}
                  onChange={(e) => setHqInput(e.target.value)}
                  required
                  autoFocus
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
                  This updates the official location across your administrative oversight and vouchers.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowHQModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
