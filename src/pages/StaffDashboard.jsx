import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  User,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  IndianRupee,
  Mail,
  Phone,
  Search,
  FileCheck,
  ArrowRight,
  Filter,
  Sparkles,
  Check,
  Layers,
  FileText,
  Printer,
  TrendingUp,
  UserCheck,
  Send,
  HelpCircle,
  LogOut,
  Calendar,
  Zap,
  Timer,
  X,
  Eye,
  Download,
  ShieldAlert,
  Award,
  ChevronRight,
  PlusCircle,
  CreditCard,
  RefreshCw,
  FileSpreadsheet,
  Edit3,
  Save,
  Lock,
  MapPin,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

// Helper to convert numbers to Indian Currency Words
function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(Math.abs(num))).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

export function StaffDashboard({ onNavigate }) {
  const { currentUser, logout, loginAsPreset, updateCurrentUser } = useAuth();
  const data = useData() || {};
  const users = data.users || [];
  const deposits = data.deposits || [];
  const groups = data.groups || [];
  const loanApplications = data.loanApplications || [];
  const staffTickets = data.staffTickets || [];
  const auditLogs = data.auditLogs || [];

  const recordDeposit = data.recordDeposit;
  const recordEmiCollection = data.recordEmiCollection;
  const updateLoanStatus = data.updateLoanStatus;
  const assistCustomerLoan = data.assistCustomerLoan;
  const registerCustomer = data.registerCustomer;
  const createGroup = data.createGroup;
  const submitStaffTicket = data.submitStaffTicket;
  const toggleStaffAttendance = data.toggleStaffAttendance;
  const updateUserProfileData = data.updateUserProfileData;

  // Active Menu: 11 menus matching specification
  const [activeMenu, setActiveMenu] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Staff Profile Editing state (Full Page View)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyRelation: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    accountType: 'Salary Account'
  });
  const [profileFeedback, setProfileFeedback] = useState(null);

  const openEditProfilePage = () => {
    setEditProfileForm({
      name: currentUser?.name || 'Pooja Sharma',
      phone: currentUser?.phone || '+91 98291 55678',
      email: currentUser?.email || 'pooja@rprcapital.in',
      address: currentUser?.address || 'Tehsil Road, Jamawaramgarh, Jaipur, Rajasthan - 303109',
      emergencyContact: currentUser?.emergencyContact || currentUser?.nominee || 'Ramesh Sharma',
      emergencyRelation: currentUser?.emergencyRelation || currentUser?.nomineeRelation || 'Brother / Next of Kin',
      bankName: currentUser?.bankDetails?.bankName || currentUser?.bankName || 'Punjab National Bank (Jamawaramgarh)',
      bankAccount: currentUser?.bankDetails?.accountNumber || currentUser?.bankAccount || '30920015002931',
      ifscCode: currentUser?.bankDetails?.ifsc || currentUser?.ifscCode || 'PUNB0309200',
      accountType: currentUser?.bankDetails?.accountType || currentUser?.bankAccountType || 'Salary Account'
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
        emergencyContact: editProfileForm.emergencyContact.trim(),
        emergencyRelation: editProfileForm.emergencyRelation.trim(),
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

      if (updateCurrentUser) {
        updateCurrentUser(updatedFields);
      }

      if (updateUserProfileData && currentUser?.id) {
        await updateUserProfileData(currentUser.id, updatedFields);
      }

      setProfileFeedback({
        type: 'success',
        text: 'Staff officer credentials and salary settlement bank updated successfully!'
      });

      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileFeedback(null);
        setIsSavingProfile(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update staff profile:', err);
      setProfileFeedback({
        type: 'error',
        text: 'Error updating profile: ' + (err.message || 'Please try again.')
      });
      setIsSavingProfile(false);
    }
  };

  // Active Modals
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingLoanDossier, setViewingLoanDossier] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [showAssistLoanModal, setShowAssistLoanModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showWelcomeSlip, setShowWelcomeSlip] = useState(null);

  // Live Duty Countdown Timer (computed from attendance countdownEndTimestamp or 8-hour shift)
  const isCheckedIn = currentUser?.attendance?.status === 'Checked In';

  const [timeLeft, setTimeLeft] = useState(() => {
    const end = currentUser?.attendance?.countdownEndTimestamp || Date.now() + 5.5 * 3600 * 1000;
    const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60
    };
  });

  useEffect(() => {
    if (!isCheckedIn) return;
    const timer = setInterval(() => {
      const end = currentUser?.attendance?.countdownEndTimestamp || Date.now() + 5.5 * 3600 * 1000;
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft({
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, currentUser?.attendance?.countdownEndTimestamp]);

  // Filter customers
  const customers = useMemo(() => users.filter((u) => u.role === 'customer'), [users]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q) ||
        c.accountNumber?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // 1. Customer Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'cust123',
    address: 'Jamawaramgarh, Jaipur',
    pinCode: '303109',
    panNumber: '',
    idNumber: '',
    initialDeposit: 15000,
    accountType: 'Pay Reserve & Loan Account',
    groupName: groups[0]?.name || 'Jamwa Mahila & Farmer Vikas Samooh',
    nomineeName: '',
    nomineeRelation: 'Spouse'
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regForm.phone && regForm.phone.replace(/\D/g, '').length < 10) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    const res = registerCustomer(regForm, currentUser);
    if (res.success) {
      setShowWelcomeSlip(res.customer);
      setFeedbackMsg({
        type: 'success',
        text: `Customer Enrolled! Assigned ID: ${res.customer.customerId} | Account: ${res.customer.accountNumber}`
      });
      setRegForm({
        name: '',
        email: '',
        phone: '',
        password: 'cust123',
        address: 'Jamawaramgarh, Jaipur',
        pinCode: '303109',
        panNumber: '',
        idNumber: '',
        initialDeposit: 15000,
        accountType: 'Pay Reserve & Loan Account',
        groupName: groups[0]?.name || 'Jamwa Mahila & Farmer Vikas Samooh',
        nomineeName: '',
        nomineeRelation: 'Spouse'
      });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Failed to enroll customer.' });
    }
  };

  // 2. Deposit Entry State
  const [depositForm, setDepositForm] = useState({
    customerId: customers[0]?.customerId || 'RPR-CUST-8021',
    amount: 10000,
    mode: 'Cash (Jamawaramgarh Counter)',
    txnRef: `CSH/JMW/${Date.now().toString().slice(-6)}`,
    note: 'Customer Counter Reserve Deposit'
  });

  const selectedDepositCustomer = useMemo(
    () => customers.find((c) => c.customerId === depositForm.customerId) || customers[0],
    [customers, depositForm.customerId]
  );

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const res = recordDeposit({
      customerId: depositForm.customerId,
      amount: Number(depositForm.amount),
      mode: depositForm.mode,
      txnRef: depositForm.txnRef,
      receivedBy: currentUser
    });

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Deposit entry posted & ledger updated! Receipt No: ${res.receiptNumber}`
      });
      // Show receipt modal
      const newReceipt = {
        receiptNumber: res.receiptNumber,
        date: new Date().toISOString().split('T')[0],
        customerName: selectedDepositCustomer?.name || 'Valued Customer',
        accountNumber: selectedDepositCustomer?.accountNumber || 'RPR-ACC-100821',
        customerId: depositForm.customerId,
        amount: Number(depositForm.amount),
        type: 'Deposit',
        mode: depositForm.mode,
        txnRef: depositForm.txnRef,
        receivedBy: `${currentUser?.name || 'Pooja Sharma'} (Staff Officer)`,
        balanceAfter: (selectedDepositCustomer?.savings?.currentBalance || 0) + Number(depositForm.amount)
      };
      setViewingReceipt(newReceipt);
      setDepositForm({
        ...depositForm,
        amount: 10000,
        txnRef: `CSH/JMW/${Date.now().toString().slice(-6)}`
      });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Deposit recording failed.' });
    }
  };

  // 3. EMI Collection State
  const [emiForm, setEmiForm] = useState({
    customerId: customers[0]?.customerId || 'RPR-CUST-8021',
    amount: customers[0]?.loans?.monthlyEmi || 18500,
    mode: 'Cash (Jamawaramgarh Counter)',
    txnRef: `EMI/JMW/${Date.now().toString().slice(-6)}`,
    note: 'Monthly Loan Installment Received'
  });

  const selectedEmiCustomer = useMemo(
    () => customers.find((c) => c.customerId === emiForm.customerId) || customers[0],
    [customers, emiForm.customerId]
  );

  const handleEmiSubmit = (e) => {
    e.preventDefault();
    const res = recordEmiCollection({
      customerId: emiForm.customerId,
      amount: Number(emiForm.amount),
      mode: emiForm.mode,
      txnRef: emiForm.txnRef,
      receivedBy: currentUser,
      note: emiForm.note
    });

    if (res.success) {
      setShowEmiModal(false);
      setFeedbackMsg({
        type: 'success',
        text: `Monthly EMI of ₹${Number(emiForm.amount).toLocaleString('en-IN')} recorded! Receipt: ${res.receiptNumber}`
      });
      const newReceipt = {
        receiptNumber: res.receiptNumber,
        date: new Date().toISOString().split('T')[0],
        customerName: selectedEmiCustomer?.name || 'Valued Borrower',
        accountNumber: selectedEmiCustomer?.accountNumber || 'RPR-ACC-100821',
        customerId: emiForm.customerId,
        amount: Number(emiForm.amount),
        type: 'EMI Repayment',
        mode: emiForm.mode,
        txnRef: emiForm.txnRef,
        receivedBy: `${currentUser?.name || 'Pooja Sharma'} (Staff Officer)`,
        balanceAfter: Math.max(0, (selectedEmiCustomer?.loans?.outstanding || 0) - Number(emiForm.amount))
      };
      setViewingReceipt(newReceipt);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'EMI collection failed.' });
    }
  };

  // 4. Walk-in Customer Loan Assistance State
  const [assistLoanForm, setAssistLoanForm] = useState({
    customerId: customers[0]?.customerId || '',
    applicantName: customers[0]?.name || '',
    mobile: customers[0]?.phone || '',
    address: customers[0]?.address || 'Jamawaramgarh, Jaipur',
    occupationIncome: 'Farmer / Micro-enterprise — ₹35,000 / month',
    requestedAmount: 150000,
    purpose: 'Agricultural Machinery & Solar Water Pump Installation',
    tenureMonths: 24,
    documentsSubmitted: 'Aadhaar Card, PAN Card, Jamabandi Revenue Slip',
    inspectionNotes: 'Branch staff inspected business premises and confirmed residence in Jamawaramgarh Tehsil.'
  });

  const handleAssistLoanSubmit = (e) => {
    e.preventDefault();
    const res = assistCustomerLoan(assistLoanForm, currentUser);
    if (res.success) {
      setShowAssistLoanModal(false);
      setFeedbackMsg({
        type: 'success',
        text: `Loan Application ${res.application.id} initiated by staff and forwarded to Admin Rohit Meena for final sanction approval.`
      });
      setActiveMenu('loans');
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Loan creation failed.' });
    }
  };

  // 5. Forward Loan Application to Admin (from Table)
  const handleForwardToAdmin = (appId) => {
    const res = updateLoanStatus(
      appId,
      'Under Review',
      currentUser,
      `Staff ${currentUser?.name || 'Pooja Sharma'} verified physical documents & KYC; forwarded dossier to Admin Rohit Meena for sanction.`
    );
    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `Application ${appId} verified and forwarded to Admin Rohit Meena for final sanction approval.`
      });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Status update failed.' });
    }
  };

  // 6. Create New Self-Help Group
  const [groupForm, setGroupForm] = useState({
    name: '',
    village: 'Jamawaramgarh, Jaipur',
    leaderName: '',
    leaderId: '',
    meetingDay: 'First Monday of Month',
    initialDeposit: 25000,
    memberCount: 4
  });

  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    const res = createGroup(groupForm, currentUser);
    if (res.success) {
      setShowCreateGroupModal(false);
      setFeedbackMsg({
        type: 'success',
        text: `Self-Help Group "${res.group.name}" registered with ID: ${res.group.id}`
      });
      setGroupForm({
        name: '',
        village: 'Jamawaramgarh, Jaipur',
        leaderName: '',
        leaderId: '',
        meetingDay: 'First Monday of Month',
        initialDeposit: 25000,
        memberCount: 4
      });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Group creation failed.' });
    }
  };

  // 7. Internal Escalation Ticket State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Operations Discrepancy',
    priority: 'Normal',
    description: ''
  });

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const res = submitStaffTicket(ticketForm, currentUser);
    if (res.success) {
      setShowTicketModal(false);
      setFeedbackMsg({
        type: 'success',
        text: `Escalation Ticket ${res.ticket.id} dispatched to Admin Rohit Meena.`
      });
      setTicketForm({
        subject: '',
        category: 'Operations Discrepancy',
        priority: 'Normal',
        description: ''
      });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Failed to dispatch ticket.' });
    }
  };

  // Download raw receipt text as fallback
  const downloadRawSlip = (d) => {
    const text = `=====================================================
RPR : RAJASTHAN PAY RESERVE CAPITAL
Jamawaramgarh Branch, Jaipur (Rajasthan)
OFFICIAL TRANSACTION RECEIPT / CASH VOUCHER
=====================================================
Receipt No:    ${d.receiptNumber || 'RCPT-JMW-2026'}
Date:          ${d.date}
Customer Name: ${d.customerName}
Account No:    ${d.accountNumber}
Customer ID:   ${d.customerId || 'RPR-CUST'}
Transaction:   ${d.type || 'Deposit'}
Amount:        ₹${Math.abs(d.amount).toLocaleString('en-IN')}
In Words:      ${numberToWords(Math.abs(d.amount))}
Payment Mode:  ${d.mode}
Txn Ref:       ${d.txnRef}
Received By:   ${d.receivedBy || currentUser?.name || 'Pooja Sharma (Staff Officer)'}
Supervising:   ROHIT MEENA (Admin & Founder)
=====================================================
Audit Protocol: Record locked into immutable ledger.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.receiptNumber || 'Receipt'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Guard: if current user is not logged in as staff
  if (!currentUser || currentUser.role !== 'staff') {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', border: '2px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Staff Authorization Required</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          This operations portal is strictly reserved for appointed Field Officers & Staff at the Jamawaramgarh Branch. Please sign in with staff officer credentials.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-purple" onClick={() => loginAsPreset('staff')}>
            <UserCheck size={16} /> Enter as Staff (Pooja Sharma)
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('login')}>
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-viewport-layout">
      {/* ===================== STAFF SIDEBAR (11 Menus) ===================== */}
      <aside className="portal-sidebar-fixed">
        {/* Top Branding Header */}
        <div className="sidebar-top-branding" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem', flexShrink: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', flexShrink: 0 }}>
            <img src="/logo-icon.png" alt="RPR Capital" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.2 }}>Staff Desk Portal</div>
            <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Operations & Field Officer</div>
          </div>
        </div>

        {/* Compact Live Attendance Strip */}
        <div
          className="sidebar-attendance-widget"
          style={{
            background: isCheckedIn ? '#f0fdf4' : '#fef2f2',
            padding: '0.24rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${isCheckedIn ? '#bbf7d0' : '#fecaca'}`,
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: isCheckedIn ? '#15803d' : '#b91c1c' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCheckedIn ? '#16a34a' : '#dc2626' }} />
            {isCheckedIn ? 'ON DUTY' : 'OFF DUTY'}
          </div>
          {isCheckedIn && (
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1d4ed8', fontSize: '0.74rem' }}>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* 11 Navigation Menus */}
        <nav className="portal-sidebar-nav">
          <button
            className={`tab-btn ${activeMenu === 'home' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('home'); setIsEditingProfile(false); }}
          >
            <Layers size={15} /> Dashboard Home
          </button>
          <button
            className={`tab-btn ${activeMenu === 'register' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('register'); setIsEditingProfile(false); }}
          >
            <UserPlus size={15} /> Register Customer
          </button>
          <button
            className={`tab-btn ${activeMenu === 'customers' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('customers'); setIsEditingProfile(false); }}
          >
            <Users size={15} /> Customer List
          </button>
          <button
            className={`tab-btn ${activeMenu === 'groups' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('groups'); setIsEditingProfile(false); }}
          >
            <Building size={15} /> Group Management
          </button>
          <button
            className={`tab-btn ${activeMenu === 'deposit' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('deposit'); setIsEditingProfile(false); }}
          >
            <IndianRupee size={15} /> Deposit Entry
          </button>
          <button
            className={`tab-btn ${activeMenu === 'receipts' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('receipts'); setIsEditingProfile(false); }}
          >
            <Printer size={15} /> Receipt Management
          </button>
          <button
            className={`tab-btn ${activeMenu === 'loans' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('loans'); setIsEditingProfile(false); }}
          >
            <FileCheck size={15} /> Loan Applications
          </button>
          <button
            className={`tab-btn ${activeMenu === 'collections' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('collections'); setIsEditingProfile(false); }}
          >
            <Clock size={15} /> Collection Management
          </button>
          <button
            className={`tab-btn ${activeMenu === 'attendance' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('attendance'); setIsEditingProfile(false); }}
          >
            <Timer size={15} /> Staff Attendance
          </button>
          <button
            className={`tab-btn ${activeMenu === 'performance' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('performance'); setIsEditingProfile(false); }}
          >
            <TrendingUp size={15} /> My Performance
          </button>
          <button
            className={`tab-btn ${activeMenu === 'support' && !isEditingProfile ? 'active purple' : ''}`}
            onClick={() => { setActiveMenu('support'); setIsEditingProfile(false); }}
          >
            <HelpCircle size={15} /> Support / Logout
          </button>
        </nav>

        {/* ===================== STAFF PROFILE CARD AT BOTTOM ===================== */}
        <div className="sidebar-bottom-profile-card staff-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
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
              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'PS'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Pooja Sharma'}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#1d4ed8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {currentUser?.staffId || 'STF-JMW-01'} • Field Officer
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Jamawaramgarh Hub
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '0.12rem 0.4rem' }}>
              ● Authorized Staff
            </span>
            <span style={{ fontSize: '0.62rem', color: isCheckedIn ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          <button
            id="btn-staff-edit-profile"
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
              border: isEditingProfile && activeMenu === 'profile' ? '1.5px solid #1d4ed8' : '1.5px solid #3b82f6',
              color: isEditingProfile && activeMenu === 'profile' ? '#ffffff' : '#1d4ed8',
              background: isEditingProfile && activeMenu === 'profile' ? '#1d4ed8' : '#eff6ff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(29, 78, 216, 0.15)'
            }}
            title="Open full page to edit your staff officer details & profile info"
          >
            <Edit3 size={12} /> {isEditingProfile && activeMenu === 'profile' ? '● Editing Profile' : 'Edit Profile & Info'}
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <main className="portal-main-scrollable">
        {/* ================= STAFF EDIT PROFILE FULL PAGE ================= */}
        {isEditingProfile && activeMenu === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Back & Breadcrumb Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                id="btn-back-to-staff-home"
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setIsEditingProfile(false); setActiveMenu('home'); setProfileFeedback(null); }}
                style={{ gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0.9rem' }}
              >
                <ArrowLeft size={16} /> Back to Staff Dashboard
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Staff Desk Portal</span>
                <ChevronRight size={14} />
                <span>Field Operations</span>
                <ChevronRight size={14} />
                <span style={{ color: '#1d4ed8', fontWeight: 700 }}>Edit Officer Profile & Bank Details</span>
              </div>
            </div>

            {/* Page Banner */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #1d4ed8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <Edit3 size={24} color="#1d4ed8" /> Edit Staff Officer Profile & Credentials
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Maintain your official contact details, residential address, emergency next-of-kin, and linked salary settlement bank account.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    ● Authorized Field Staff
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.staffId || 'STF-JMW-01'}
                  </span>
                </div>
              </div>

              {/* Quick Staff Summary Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(248, 250, 252, 0.75)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Staff Officer ID</span>
                  <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{currentUser?.staffId || 'STF-JMW-01'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Branch Assignment</span>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>Jamawaramgarh Regional Hub, Jaipur</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reporting Authority</span>
                  <strong style={{ fontSize: '0.86rem', color: '#7c3aed' }}>ROHIT MEENA (Admin)</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Duty Shift</span>
                  <strong style={{ fontSize: '0.86rem', color: isCheckedIn ? '#15803d' : '#b91c1c' }}>● {isCheckedIn ? 'Active (Checked In)' : 'Offline / Shift Ended'}</strong>
                </div>
              </div>
            </div>

            {/* Feedback Alert */}
            {profileFeedback && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: profileFeedback.type === 'success' ? '#eff6ff' : '#fef2f2',
                  border: `1.5px solid ${profileFeedback.type === 'success' ? '#3b82f6' : '#f87171'}`,
                  color: profileFeedback.type === 'success' ? '#1e40af' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.1)'
                }}
              >
                {profileFeedback.type === 'success' ? <CheckCircle size={20} color="#1d4ed8" /> : <AlertCircle size={20} color="#dc2626" />}
                <span>{profileFeedback.text}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* SECTION 1: Personal & Contact Information */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="#0284c7" /> 1. Staff Official & Contact Information
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Official credentials used for branch communications, field collections, and shift audit trail.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Staff Officer Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      required
                      placeholder="e.g. Pooja Sharma"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Official Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                      required
                      placeholder="e.g. +91 98291 55678"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Official Staff Email *
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={editProfileForm.email}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                      required
                      placeholder="e.g. pooja@rprcapital.in"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Residential Address & Emergency Contact */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="#7c3aed" /> 2. Permanent Residential Address & Emergency Contact
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Official residential record and designated emergency contact coordinates.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Permanent Residential Address *
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editProfileForm.address}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                      required
                      placeholder="e.g. Tehsil Road, Jamawaramgarh, Jaipur, Rajasthan - 303109"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Emergency Next-of-Kin Full Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editProfileForm.emergencyContact}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, emergencyContact: e.target.value })}
                        placeholder="e.g. Ramesh Sharma"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                        Relationship
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editProfileForm.emergencyRelation}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, emergencyRelation: e.target.value })}
                        placeholder="e.g. Brother, Father, Spouse"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Linked Salary & Settlement Bank Account */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} color="#1d4ed8" /> 3. Linked Salary & Commission Settlement Account
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Monthly compensation, incentive payouts, and travel reimbursements are directly deposited to this account.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Bank Name & Branch
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editProfileForm.bankName}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, bankName: e.target.value })}
                      placeholder="e.g. Punjab National Bank (Jamawaramgarh Branch)"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editProfileForm.bankAccount}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, bankAccount: e.target.value })}
                      placeholder="e.g. 30920015002931"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editProfileForm.ifscCode}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. PUNB0309200"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', display: 'block' }}>
                      Account Type
                    </label>
                    <select
                      className="form-input"
                      value={editProfileForm.accountType}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, accountType: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                    >
                      <option value="Salary Account">Salary Account</option>
                      <option value="Savings Bank Account">Savings Bank Account</option>
                      <option value="Current Account">Current Account</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Compliance Notice */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Lock size={18} color="#1d4ed8" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Official Governance & Administrative Audit:</strong>{' '}
                  All modifications to officer contact and banking records are logged under Jamawaramgarh Regional Hub oversight and verified by Executive Director Rohit Meena.
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', marginBottom: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsEditingProfile(false); setActiveMenu('home'); setProfileFeedback(null); }}
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancel & Discard
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingProfile}
                  style={{
                    gap: '0.5rem',
                    background: '#1d4ed8',
                    borderColor: '#1e40af',
                    padding: '0.65rem 1.75rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)'
                  }}
                >
                  <Save size={16} /> {isSavingProfile ? 'Saving Changes...' : 'Save Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isEditingProfile && (
          <>
            {/* Top Operational Bar */}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Staff Desk — {currentUser?.name || 'Pooja Sharma'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Branch: <strong>Jamawaramgarh, Jaipur</strong> | Direct Reporting:{' '}
              <strong>ROHIT MEENA (Admin)</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${isCheckedIn ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => toggleStaffAttendance(currentUser?.id)}
            >
              <Timer size={14} /> {isCheckedIn ? 'Clock Out (Duty Over)' : 'Clock In (Start Duty)'}
            </button>
            <button className="btn btn-purple btn-sm" onClick={() => setActiveMenu('register')}>
              <UserPlus size={14} /> + Register Customer
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssistLoanModal(true)}>
              <FileCheck size={14} /> + Assist Loan
            </button>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div
            style={{
              background: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${feedbackMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: feedbackMsg.type === 'success' ? '#15803d' : '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. DASHBOARD HOME: Daily Customers, Deposit Entries, Pending Applications, Duty Log */}
        {activeMenu === 'home' && (
          <div>
            {/* 4 Metric Cards */}
            <div className="metrics-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="metric-card" onClick={() => setActiveMenu('customers')} style={{ cursor: 'pointer' }}>
                <div className="metric-header">
                  <span>Customers Enrolled</span>
                </div>
                <div className="metric-value text-gradient-cyan">{currentUser?.performance?.customersAdded ?? 0}</div>
                <div className="metric-footer">Active Customer Accounts</div>
              </div>

              <div className="metric-card" onClick={() => setActiveMenu('customers')} style={{ cursor: 'pointer' }}>
                <div className="metric-header">
                  <span>Pending KYC</span>
                </div>
                <div className="metric-value" style={{ color: '#d97706' }}>
                  {currentUser?.performance?.kycPending ?? 0}
                </div>
                <div className="metric-footer">Document Verification In Progress</div>
              </div>

              <div className="metric-card purple-glow" onClick={() => setActiveMenu('deposit')} style={{ cursor: 'pointer' }}>
                <div className="metric-header">
                  <span>Total Deposits Collected</span>
                </div>
                <div className="metric-value text-gradient-purple">
                  ₹{Number(currentUser?.performance?.totalDepositsCollected ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="metric-footer">Cumulative Branch Receipts</div>
              </div>

              <div className="metric-card" onClick={() => setActiveMenu('loans')} style={{ cursor: 'pointer' }}>
                <div className="metric-header">
                  <span>Pending Loan Reviews</span>
                </div>
                <div className="metric-value">
                  {loanApplications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length}
                </div>
                <div className="metric-footer">Awaiting Admin Sanction</div>
              </div>
            </div>

            {/* Quick Operational Launch Bar */}
            <div
              className="glass-panel"
              style={{
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                <Zap size={16} color="#1d4ed8" /> Quick Actions:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setActiveMenu('deposit')}>
                  <IndianRupee size={13} /> Record Deposit
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowEmiModal(true)}>
                  <Clock size={13} /> Collect Loan EMI
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowAssistLoanModal(true)}>
                  <FileCheck size={13} /> Assist Loan Onboarding
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setActiveMenu('receipts')}>
                  <Printer size={13} /> Print Receipts
                </button>
              </div>
            </div>

            {/* Recent Queue & Governance Box */}
            <div className="grid-split-2col" style={{ gap: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Counter Transactions Log</h3>
                  <button className="btn btn-sm btn-secondary" onClick={() => setActiveMenu('receipts')} style={{ fontSize: '0.75rem' }}>
                    View All Receipts
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.slice(0, 4).map((d) => (
                        <tr key={d.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{d.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.accountNumber}</div>
                          </td>
                          <td>
                            <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                              {d.type || 'Deposit'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: d.type === 'Withdrawal' ? '#ef4444' : '#10b981' }}>
                            {d.type === 'Withdrawal' ? '-' : '+'}₹{Math.abs(d.amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                              onClick={() => setViewingReceipt(d)}
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

              {/* Special Rule Box from Image 5 */}
              <div className="glass-panel-purple" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1d4ed8' }}>
                  Staff Operational Governance Standard:
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  Every deposit transaction and loan intake recorded by branch staff creates an automated, immutable entry in the
                  ledger. Staff cannot alter or remove transactions. Sole loan sanction authority is exclusively reserved for Executive
                  Admin Rohit Meena.
                </p>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem'
                  }}
                >
                  <strong>Branch:</strong> Jamawaramgarh, Jaipur | <strong>Director:</strong> Rohit Meena
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTER CUSTOMER: Add New Customer, Issue Account Number & Customer ID */}
        {activeMenu === 'register' && (
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>
                <UserPlus size={13} /> Staff Registration Desk
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>2. Register New Customer & Issue Account ID</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Onboard new customer, issue Customer ID, allocate Account Number, and record initial reserve deposit
              </p>
            </div>

            <div className="grid-split-2col" style={{ gap: '1.5rem' }}>
              <form onSubmit={handleRegisterSubmit}>
                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Customer Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Surendra Meena"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Portal ID) *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="e.g. surendra@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+91 98290 XXXXX"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Aadhaar Card Last 4 Digits *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regForm.idNumber}
                      onChange={(e) => setRegForm({ ...regForm, idNumber: e.target.value })}
                      placeholder="8821"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="grid-split-2col" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Village Address (Jamawaramgarh Tehsil) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Savings Deposit (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={regForm.initialDeposit}
                      onChange={(e) => setRegForm({ ...regForm, initialDeposit: Number(e.target.value) })}
                      step={1000}
                      min={1000}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Group Assignment (Self-Help / Farmer Group)</label>
                    <select
                      className="form-select"
                      value={regForm.groupName}
                      onChange={(e) => setRegForm({ ...regForm, groupName: e.target.value })}
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name} ({g.village})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">PAN Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regForm.panNumber}
                      onChange={(e) => setRegForm({ ...regForm, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCPS1234F"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2col-even" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nominee Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regForm.nomineeName}
                      onChange={(e) => setRegForm({ ...regForm, nomineeName: e.target.value })}
                      placeholder="e.g. Santosh Meena"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nominee Relationship</label>
                    <select
                      className="form-select"
                      value={regForm.nomineeRelation}
                      onChange={(e) => setRegForm({ ...regForm, nomineeRelation: e.target.value })}
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                  <UserPlus size={16} /> Complete Registration & Issue Account
                </button>
              </form>

              {/* Live Preview Card */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Customer Passbook Preview
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>RPR CAPITAL</span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>KYC VERIFIED</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {regForm.name || 'Customer Name'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {regForm.email || 'customer@rprcapital.in'}
                  </div>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.75rem' }}>
                    <div><strong>Village:</strong> {regForm.address}</div>
                    <div><strong>Initial Deposit:</strong> ₹{Number(regForm.initialDeposit || 0).toLocaleString('en-IN')}</div>
                    <div><strong>Group:</strong> {regForm.groupName}</div>
                    <div><strong>Staff Officer:</strong> {currentUser?.name || 'Pooja Sharma'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CUSTOMER LIST: Search, Profiles, Account Records */}
        {activeMenu === 'customers' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>3. Customer List & Registry</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Directory of enrolled customers, verified savings balances, and active loan portfolios
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '250px', fontSize: '0.85rem' }}
                    placeholder="Search name, ID, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn btn-purple btn-sm" onClick={() => setActiveMenu('register')}>
                  <UserPlus size={14} /> New Customer
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Account No & ID</th>
                    <th>Customer Name</th>
                    <th>Village / Address</th>
                    <th>Savings Balance</th>
                    <th>Active Loan</th>
                    <th>KYC Status</th>
                    <th>Staff Desk Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan-glow)' }}>
                          {c.accountNumber}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.customerId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.phone || c.email}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{c.address}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        ₹{Number(c.savings?.currentBalance || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 700, color: '#f59e0b' }}>
                        ₹{Number(c.loans?.activeLoan || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                          ✓ {c.kycStatus || 'Verified'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                            title="View Customer Dossier"
                            onClick={() => setViewingCustomer(c)}
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                            title="Deposit to this account"
                            onClick={() => {
                              setDepositForm((prev) => ({ ...prev, customerId: c.customerId }));
                              setActiveMenu('deposit');
                            }}
                          >
                            <IndianRupee size={12} /> Deposit
                          </button>
                          {Number(c.loans?.activeLoan || 0) > 0 && (
                            <button
                              className="btn btn-purple btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                              title="Collect Loan Installment"
                              onClick={() => {
                                setEmiForm((prev) => ({
                                  ...prev,
                                  customerId: c.customerId,
                                  amount: c.loans?.monthlyEmi || 15000
                                }));
                                setShowEmiModal(true);
                              }}
                            >
                              <Clock size={12} /> EMI
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. GROUP MANAGEMENT: Self-Help Groups, Farmer Collectives & Members */}
        {activeMenu === 'groups' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>4. Self-Help Group Management</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Active Self-Help Groups, Farmer Collectives, and enrolled members in Jamawaramgarh Tehsil
                </p>
              </div>
              <button className="btn btn-purple btn-sm" onClick={() => setShowCreateGroupModal(true)}>
                <PlusCircle size={14} /> + Register New SHG
              </button>
            </div>

            <div className="grid-2col-even" style={{ gap: '1.25rem' }}>
              {(groups || []).map((g) => (
                <div
                  key={g.id}
                  style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      {g.id}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                      ✓ {g.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{g.name}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Location: <strong>{g.village}</strong> | Meeting Schedule: <strong>{g.meetingDay}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Group Leader: <strong>{g.leaderName} ({g.leaderId})</strong>
                  </div>
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span>
                      Enrolled: <strong>{g.memberCount} Members</strong>
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>
                      Savings: ₹{Number(g.totalGroupDeposit).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '0.78rem' }}
                      onClick={() => setViewingGroup(g)}
                    >
                      <Users size={13} /> View Enrolled Group Members
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DEPOSIT ENTRY: Record Deposit Amount, Date, Mode & Reference */}
        {activeMenu === 'deposit' && (
          <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '680px', marginInline: 'auto' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              5. Deposit Entry & Counter Collection
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Post a verified reserve deposit entry to customer account. Each transaction generates an automated, permanent audit
              log and official printable receipt.
            </p>

            <form onSubmit={handleDepositSubmit}>
              <div className="form-group">
                <label className="form-label">Select Customer Account</label>
                <select
                  className="form-select"
                  value={depositForm.customerId}
                  onChange={(e) => setDepositForm({ ...depositForm, customerId: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} — {c.accountNumber} (Bal: ₹{Number(c.savings?.currentBalance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Customer Balance Preview */}
              {selectedDepositCustomer && (
                <div
                  style={{
                    background: '#eff6ff',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #bfdbfe',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Current Balance: </span>
                    <strong style={{ color: '#1d4ed8' }}>
                      ₹{Number(selectedDepositCustomer.savings?.currentBalance || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Projected Balance After: </span>
                    <strong style={{ color: '#16a34a' }}>
                      ₹{Number((selectedDepositCustomer.savings?.currentBalance || 0) + Number(depositForm.amount || 0)).toLocaleString(
                        'en-IN'
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Deposit Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  step={500}
                  min={500}
                  required
                />
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {[5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => setDepositForm({ ...depositForm, amount: amt })}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Collection Mode</label>
                <select
                  className="form-select"
                  value={depositForm.mode}
                  onChange={(e) => setDepositForm({ ...depositForm, mode: e.target.value })}
                >
                  <option value="Cash (Jamawaramgarh Counter)">Cash (Branch Counter Collection)</option>
                  <option value="UPI / QR Digital Collection">UPI / QR Digital Collection</option>
                  <option value="Bank NEFT / IMPS Transfer">Bank NEFT / IMPS Transfer</option>
                  <option value="Field Collection (Doorstep Agent)">Field Collection (Doorstep Agent)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={depositForm.txnRef}
                  onChange={(e) => setDepositForm({ ...depositForm, txnRef: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                <IndianRupee size={16} /> Post Deposit & Generate Official Voucher
              </button>
            </form>
          </div>
        )}

        {/* 6. RECEIPT MANAGEMENT: Issue, Print & Download Slips */}
        {activeMenu === 'receipts' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>6. Receipt Management & Print Archive</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Permanent counter collection archive, deposit slips, and EMI receipts with verified stamps
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Customer Name</th>
                    <th>Account No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan-glow)' }}>
                        {d.receiptNumber || 'RCPT-JMW-881'}
                      </td>
                      <td>{d.customerName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{d.accountNumber}</td>
                      <td>{d.date}</td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                          {d.type || 'Deposit'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: d.type === 'Withdrawal' ? '#ef4444' : '#10b981' }}>
                        {d.type === 'Withdrawal' ? '-' : '+'}₹{Math.abs(d.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{d.mode}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                          onClick={() => setViewingReceipt(d)}
                        >
                          <Printer size={12} /> View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. LOAN APPLICATIONS: Inspection & Forward to Admin for Sanction (MATCHING USER SCREENSHOT) */}
        {activeMenu === 'loans' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.6rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>7. Loan Applications Desk</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Staff reviews loan applications and supporting documents, then forwards them to Admin Rohit Meena for final sanction
                  approval. (Governance Protocol: Exclusive loan sanction authority rests with Admin).
                </p>
              </div>

              <button className="btn btn-purple btn-sm" onClick={() => setShowAssistLoanModal(true)}>
                <UserPlus size={14} /> + Assist Customer: New Loan
              </button>
            </div>

            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>APP ID</th>
                    <th>APPLICANT NAME</th>
                    <th>REQUESTED AMOUNT</th>
                    <th>PURPOSE</th>
                    <th>STATUS</th>
                    <th>STAFF ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loanApplications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{app.id}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.applicantName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.mobile}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                        ₹{Number(app.requestedAmount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{app.purpose}</td>
                      <td>
                        <span
                          className={`badge ${
                            app.status === 'Approved'
                              ? 'badge-green'
                              : app.status === 'Under Review'
                              ? 'badge-amber'
                              : 'badge-purple'
                          }`}
                        >
                          {app.status === 'Under Review' ? 'UNDER REVIEW' : app.status === 'Approved' ? 'APPROVED' : app.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {app.status === 'Submitted' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => handleForwardToAdmin(app.id)}
                            >
                              <FileCheck size={12} /> Verify & Forward to Admin
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {app.disbursalStatus || (app.status === 'Under Review' ? 'Pending Admin Final Sanction' : 'Disbursed to Account')}
                            </span>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                            onClick={() => setViewingLoanDossier(app)}
                          >
                            <Eye size={12} /> Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. COLLECTION MANAGEMENT: EMI Collections */}
        {activeMenu === 'collections' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>8. Monthly EMI Collection Desk</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Collect monthly loan installments, issue instant digital EMI receipts, and adjust outstanding customer loan balances
                </p>
              </div>
              <button className="btn btn-purple btn-sm" onClick={() => setShowEmiModal(true)}>
                <IndianRupee size={14} /> + Collect Installment
              </button>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Account No</th>
                    <th>Active Loan</th>
                    <th>Monthly EMI</th>
                    <th>Next Due Date</th>
                    <th>Status</th>
                    <th>Collection Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{c.accountNumber}</td>
                      <td style={{ fontWeight: 700, color: '#f59e0b' }}>
                        ₹{Number(c.loans?.activeLoan || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{Number(c.loans?.monthlyEmi || 0).toLocaleString('en-IN')}</td>
                      <td>{c.loans?.nextPaymentDate || '05 Nov 2026'}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          {Number(c.loans?.activeLoan || 0) > 0 ? 'On Track' : 'No Dues'}
                        </span>
                      </td>
                      <td>
                        {Number(c.loans?.activeLoan || 0) > 0 ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => {
                              setEmiForm((prev) => ({
                                ...prev,
                                customerId: c.customerId,
                                amount: c.loans?.monthlyEmi || 18500
                              }));
                              setShowEmiModal(true);
                            }}
                          >
                            <IndianRupee size={12} /> Collect EMI
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. MY ATTENDANCE & COUNTDOWN TIMER (Image 5 Menu 9) */}
        {activeMenu === 'attendance' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Timer size={22} color="#1d4ed8" /> 9. Staff Attendance & Duty Countdown Timer
            </h3>

            <div className="grid-split-2col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Duty Shift Remaining Countdown
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    color: isCheckedIn ? '#1d4ed8' : '#94a3b8',
                    margin: '0.5rem 0'
                  }}
                >
                  {isCheckedIn
                    ? `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(
                        timeLeft.seconds
                      ).padStart(2, '0')}`
                    : '00:00:00 (OFF DUTY)'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Clock-In Time: <strong>{currentUser?.attendance?.clockInTime || '09:30 AM'}</strong> | Branch:{' '}
                  <strong>Jamawaramgarh, Jaipur</strong>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    className={`btn ${isCheckedIn ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => toggleStaffAttendance(currentUser?.id)}
                  >
                    <Timer size={16} /> {isCheckedIn ? 'Clock Out (Finish Duty Shift)' : 'Clock In (Start Duty Shift)'}
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Monthly Attendance Record</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Total Days Present:</span>
                  <strong style={{ color: '#10b981' }}>{currentUser?.attendance?.totalDaysPresent || 24} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Leave Taken:</span>
                  <strong>{currentUser?.attendance?.totalDaysLeave || 1} Day</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Shift Schedule:</span>
                  <strong>09:30 AM – 05:30 PM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Supervising Authority:</span>
                  <strong>ROHIT MEENA (Admin)</strong>
                </div>
              </div>
            </div>

            {/* Attendance History Table */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Verified Duty Shift History (October 2026)
              </h4>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Branch Location</th>
                      <th>In Time</th>
                      <th>Out Time</th>
                      <th>Duration</th>
                      <th>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      currentUser?.attendance?.history || [
                        { date: '2026-10-18', in: '09:30 AM', out: 'In Progress', hours: '5.5h remaining', branch: 'Jamawaramgarh Central Desk', status: 'Active Duty' },
                        { date: '2026-10-17', in: '09:28 AM', out: '05:32 PM', hours: '8.0h', branch: 'Jamawaramgarh Central Desk', status: 'Verified & Approved' },
                        { date: '2026-10-16', in: '09:35 AM', out: '05:40 PM', hours: '8.1h', branch: 'Nayavas Field Camp', status: 'Verified & Approved' },
                        { date: '2026-10-15', in: '09:30 AM', out: '05:30 PM', hours: '8.0h', branch: 'Jamawaramgarh Central Desk', status: 'Verified & Approved' }
                      ]
                    ).map((h, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{h.date}</td>
                        <td style={{ fontSize: '0.82rem' }}>{h.branch}</td>
                        <td>{h.in}</td>
                        <td>{h.out}</td>
                        <td>{h.hours}</td>
                        <td>
                          <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                            ✓ {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 10. MY PERFORMANCE: Work Report & Enrolled Customers Tracking */}
        {activeMenu === 'performance' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <TrendingUp size={22} color="var(--color-cyan-glow)" /> 10. Staff Performance & Monthly Targets
            </h3>

            <div className="metrics-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customers Enrolled</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                  {currentUser?.performance?.customersAdded ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Target: 20 Accounts</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending KYC Files</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
                  {currentUser?.performance?.kycPending ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Documentation In Progress</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Deposits Logged</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                  ₹{Number(currentUser?.performance?.totalDepositsCollected ?? 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Target: ₹5,00,000</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loan Files Forwarded</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>
                  {loanApplications.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Forwarded to Admin</div>
              </div>
            </div>

            {/* Target Progress Bars */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Monthly Field Officer KPI Progress</h4>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Monthly Deposit Target (₹5,00,000)</span>
                  <strong>77% Achieved (₹3,85,000)</strong>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '77%', height: '100%', background: 'linear-gradient(90deg, #1d4ed8, #2563eb)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Customer Onboarding Target (20 Accounts)</span>
                  <strong>80% Achieved (16 Enrolled)</strong>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Field Collection Efficiency Rate</span>
                  <strong>98.4% On-time Discharges</strong>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '98.4%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 11. SUPPORT / LOGOUT */}
        {activeMenu === 'support' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>11. Support Desk & Executive Oversight</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Internal branch escalation tickets and executive oversight contacts
                </p>
              </div>
              <button className="btn btn-purple btn-sm" onClick={() => setShowTicketModal(true)}>
                <Send size={14} /> + Raise Branch Escalation
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div>
                <strong>Director & Founder:</strong> ROHIT MEENA
              </div>
              <div>
                <strong>Official Email:</strong> contact@rprcapital.in / rohitmeena@rprcapital.com
              </div>
              <div>
                <strong>Branch:</strong> Jamawaramgarh Branch, Jaipur (Rajasthan - 303109)
              </div>
            </div>

            {/* Past Escalation Tickets */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Internal Branch Escalation Log
              </h4>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Resolution Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(staffTickets || []).map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{t.id}</td>
                        <td style={{ fontWeight: 600 }}>{t.subject}</td>
                        <td style={{ fontSize: '0.8rem' }}>{t.category}</td>
                        <td>
                          <span className={`badge ${t.priority === 'High' ? 'badge-amber' : 'badge-purple'}`} style={{ fontSize: '0.68rem' }}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.resolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={15} /> Sign Out of Staff Desk
            </button>
          </div>
        )}
        </>
        )}

        {/* Minimal Portal Footer inside scrollable pane */}
        <footer style={{ marginTop: '3.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          © {new Date().getFullYear()} <strong>RPR : Rajasthan Pay Reserve Capital</strong> • Jamawaramgarh Regional Hub, Jaipur • Official Role-Isolated Portal
        </footer>
      </main>

      {/* ===================== MODALS ===================== */}

      {/* 1. OFFICIAL FINANCIAL RECEIPT / VOUCHER MODAL */}
      {viewingReceipt && (
        <div className="modal-overlay" onClick={() => setViewingReceipt(null)}>
          <div className="modal-content printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> Official Financial Voucher
              </span>
              <button className="modal-close-btn" onClick={() => setViewingReceipt(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="staff-receipt-voucher">
              <div className="staff-receipt-watermark">RPR CAPITAL</div>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  RPR : RAJASTHAN PAY RESERVE CAPITAL
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Jamawaramgarh Regional Hub, Jaipur • Official Transaction Voucher
                </div>
              </div>

              <div className="grid-2col-even" style={{ gap: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Receipt No: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{viewingReceipt.receiptNumber || 'RCPT-JMW-881'}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b' }}>Date: </span>
                  <strong>{viewingReceipt.date}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Customer: </span>
                  <strong>{viewingReceipt.customerName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b' }}>Account No: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{viewingReceipt.accountNumber}</strong>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                      {viewingReceipt.type || 'Deposit'} Received
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8' }}>
                      ₹{Math.abs(viewingReceipt.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div><strong>Mode:</strong> {viewingReceipt.mode}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{viewingReceipt.txnRef}</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem' }}>
                  <strong>Amount in Words:</strong> {numberToWords(Math.abs(viewingReceipt.amount))}
                </div>
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                <div>
                  <div>Received & Verified by:</div>
                  <strong>{viewingReceipt.receivedBy || currentUser?.name || 'Pooja Sharma (Staff Officer)'}</strong>
                  <div style={{ color: '#64748b' }}>Jamawaramgarh Branch Desk</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#16a34a', fontWeight: 800 }}>✓ VERIFIED BY ADMIN ROHIT MEENA</div>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Cryptographic Ledger Synced</div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
                <Printer size={15} /> Print Official Voucher
              </button>
              <button className="btn btn-secondary" onClick={() => downloadRawSlip(viewingReceipt)}>
                <Download size={15} /> Download Text File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOAN DOSSIER MODAL */}
      {viewingLoanDossier && (
        <div className="modal-overlay" onClick={() => setViewingLoanDossier(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileCheck size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Loan Inspection Dossier</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Application ID: {viewingLoanDossier.id}
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingLoanDossier(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="grid-2col-even" style={{ gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Applicant Name:</span>
                <div style={{ fontWeight: 700 }}>{viewingLoanDossier.applicantName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingLoanDossier.mobile}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sanction Status:</span>
                <div>
                  <span
                    className={`badge ${
                      viewingLoanDossier.status === 'Approved'
                        ? 'badge-green'
                        : viewingLoanDossier.status === 'Under Review'
                        ? 'badge-amber'
                        : 'badge-purple'
                    }`}
                  >
                    {viewingLoanDossier.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingLoanDossier.disbursalStatus}</div>
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requested Amount</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>
                    ₹{Number(viewingLoanDossier.requestedAmount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
                  <div><strong>Tenure:</strong> {viewingLoanDossier.tenureMonths || 24} Months</div>
                  <div><strong>Approx EMI:</strong> ₹{Math.round((Number(viewingLoanDossier.requestedAmount) * 1.1) / (viewingLoanDossier.tenureMonths || 24)).toLocaleString('en-IN')} / mo</div>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                <strong>Purpose:</strong> {viewingLoanDossier.purpose}
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div><strong>Documents Submitted:</strong> {viewingLoanDossier.documentsSubmitted || 'Aadhaar Card, PAN Card'}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Occupation & Income:</strong> {viewingLoanDossier.occupationIncome || 'Agriculture & Local Transport'}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Address:</strong> {viewingLoanDossier.address}</div>
            </div>

            {/* Timeline */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.5rem' }}>
                Application Audit Trail
              </div>
              {(viewingLoanDossier.statusHistory || []).map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{h.date}:</span>
                  <strong>{h.status}</strong> — <span>{h.note}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {viewingLoanDossier.status === 'Submitted' && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleForwardToAdmin(viewingLoanDossier.id);
                    setViewingLoanDossier(null);
                  }}
                >
                  <FileCheck size={14} /> Verify & Forward to Admin Rohit Meena
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewingLoanDossier(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSIST WALK-IN CUSTOMER LOAN MODAL */}
      {showAssistLoanModal && (
        <div className="modal-overlay" onClick={() => setShowAssistLoanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <PlusCircle size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Assist Walk-in Customer Loan</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Intake at Jamawaramgarh Branch Desk • Forwards to Admin for Sanction
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAssistLoanModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssistLoanSubmit}>
              <div className="form-group">
                <label className="form-label">Select Registered Customer or Walk-in</label>
                <select
                  className="form-select"
                  value={assistLoanForm.customerId}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.customerId === e.target.value);
                    if (cust) {
                      setAssistLoanForm({
                        ...assistLoanForm,
                        customerId: cust.customerId,
                        applicantName: cust.name,
                        mobile: cust.phone || '',
                        address: cust.address || 'Jamawaramgarh, Jaipur'
                      });
                    }
                  }}
                >
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} — {c.accountNumber} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Applicant Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={assistLoanForm.applicantName}
                    onChange={(e) => setAssistLoanForm({ ...assistLoanForm, applicantName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={assistLoanForm.mobile}
                    onChange={(e) => setAssistLoanForm({ ...assistLoanForm, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-split-2col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Requested Loan Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={assistLoanForm.requestedAmount}
                    onChange={(e) => setAssistLoanForm({ ...assistLoanForm, requestedAmount: Number(e.target.value) })}
                    step={10000}
                    min={25000}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tenure (Months) *</label>
                  <select
                    className="form-select"
                    value={assistLoanForm.tenureMonths}
                    onChange={(e) => setAssistLoanForm({ ...assistLoanForm, tenureMonths: Number(e.target.value) })}
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={18}>18 Months (1.5 Years)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Purpose *</label>
                <input
                  type="text"
                  className="form-input"
                  value={assistLoanForm.purpose}
                  onChange={(e) => setAssistLoanForm({ ...assistLoanForm, purpose: e.target.value })}
                  placeholder="e.g. Solar Pump, Electronic Sewing Machines, Dairy Equipment"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Documents Submitted & Verified</label>
                <input
                  type="text"
                  className="form-input"
                  value={assistLoanForm.documentsSubmitted}
                  onChange={(e) => setAssistLoanForm({ ...assistLoanForm, documentsSubmitted: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Staff Field Inspection Remarks</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={assistLoanForm.inspectionNotes}
                  onChange={(e) => setAssistLoanForm({ ...assistLoanForm, inspectionNotes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                <FileCheck size={16} /> Submit Loan Dossier to Admin for Sanction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. COLLECT EMI INSTALLMENT MODAL */}
      {showEmiModal && (
        <div className="modal-overlay" onClick={() => setShowEmiModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <IndianRupee size={22} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Collect Monthly Loan EMI</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Discharge installment and update customer balance
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEmiModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEmiSubmit}>
              <div className="form-group">
                <label className="form-label">Select Borrower Account</label>
                <select
                  className="form-select"
                  value={emiForm.customerId}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.customerId === e.target.value);
                    setEmiForm({
                      ...emiForm,
                      customerId: e.target.value,
                      amount: cust?.loans?.monthlyEmi || 15000
                    });
                  }}
                >
                  {customers
                    .filter((c) => Number(c.loans?.activeLoan || 0) > 0)
                    .map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.name} — Outstanding: ₹{Number(c.loans?.activeLoan).toLocaleString('en-IN')} (EMI: ₹
                        {Number(c.loans?.monthlyEmi).toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>

              {selectedEmiCustomer && (
                <div
                  style={{
                    background: '#fef3c7',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #fde68a',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#92400e' }}>Active Loan Outstanding: </span>
                    <strong style={{ color: '#b45309' }}>
                      ₹{Number(selectedEmiCustomer.loans?.activeLoan || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#92400e' }}>Remaining After EMI: </span>
                    <strong style={{ color: '#15803d' }}>
                      ₹{Math.max(
                        0,
                        (selectedEmiCustomer.loans?.activeLoan || 0) - Number(emiForm.amount || 0)
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">EMI Amount to Collect (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={emiForm.amount}
                  onChange={(e) => setEmiForm({ ...emiForm, amount: e.target.value })}
                  step={500}
                  min={500}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collection Mode *</label>
                <select
                  className="form-select"
                  value={emiForm.mode}
                  onChange={(e) => setEmiForm({ ...emiForm, mode: e.target.value })}
                >
                  <option value="Cash (Branch Counter Collection)">Cash (Jamawaramgarh Branch Counter)</option>
                  <option value="Cash (Doorstep Field Agent)">Cash (Doorstep Field Collection)</option>
                  <option value="UPI / QR Digital Collection">UPI / QR Digital Collection</option>
                  <option value="Bank NEFT / IMPS Transfer">Bank NEFT / IMPS Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Txn Reference / Receipt Note</label>
                <input
                  type="text"
                  className="form-input"
                  value={emiForm.txnRef}
                  onChange={(e) => setEmiForm({ ...emiForm, txnRef: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                <IndianRupee size={16} /> Discharge EMI & Issue Digital Voucher
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. CUSTOMER DOSSIER / PROFILE MODAL */}
      {viewingCustomer && (
        <div className="modal-overlay" onClick={() => setViewingCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Customer Dossier & Passbook</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {viewingCustomer.customerId} | Acc: {viewingCustomer.accountNumber}
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingCustomer(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="grid-2col-even" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Customer Name:</div>
                <div style={{ fontWeight: 800 }}>{viewingCustomer.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingCustomer.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingCustomer.phone}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Branch & KYC:</div>
                <div style={{ fontWeight: 700 }}>{viewingCustomer.branch || 'Jamawaramgarh Branch, Jaipur'}</div>
                <span className="badge badge-green" style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>
                  ✓ {viewingCustomer.kycStatus || 'Verified'}
                </span>
              </div>
            </div>

            <div className="grid-2col-even" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Savings Balance</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>
                  ₹{Number(viewingCustomer.savings?.currentBalance || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Total Deposited: ₹{Number(viewingCustomer.savings?.totalDeposit || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Loan Portfolio</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                  ₹{Number(viewingCustomer.loans?.activeLoan || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Monthly EMI: ₹{Number(viewingCustomer.loans?.monthlyEmi || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div><strong>Address:</strong> {viewingCustomer.address}</div>
              <div><strong>Aadhaar / ID:</strong> {viewingCustomer.idProof?.number || '•••• •••• 8821'} (PAN: {viewingCustomer.idProof?.pan || 'ABCPS1234F'})</div>
              <div><strong>Group:</strong> {viewingCustomer.group?.groupName || 'Jamwa Mahila & Farmer Vikas Samooh'}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setDepositForm((prev) => ({ ...prev, customerId: viewingCustomer.customerId }));
                  setViewingCustomer(null);
                  setActiveMenu('deposit');
                }}
              >
                <IndianRupee size={14} /> Deposit
              </button>
              {Number(viewingCustomer.loans?.activeLoan || 0) > 0 && (
                <button
                  className="btn btn-purple"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEmiForm((prev) => ({
                      ...prev,
                      customerId: viewingCustomer.customerId,
                      amount: viewingCustomer.loans?.monthlyEmi || 15000
                    }));
                    setViewingCustomer(null);
                    setShowEmiModal(true);
                  }}
                >
                  <Clock size={14} /> Collect EMI
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewingCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Building size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Register New Self-Help Group</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Community Credit & Farmer Collective Desk
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCreateGroupModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit}>
              <div className="form-group">
                <label className="form-label">Group Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. Gopalgarh Kisan Samriddhi Samooh"
                  required
                />
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Village / Tehsil Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={groupForm.village}
                    onChange={(e) => setGroupForm({ ...groupForm, village: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Day *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={groupForm.meetingDay}
                    onChange={(e) => setGroupForm({ ...groupForm, meetingDay: e.target.value })}
                    placeholder="e.g. Second Saturday of Month"
                    required
                  />
                </div>
              </div>

              <div className="grid-split-2col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Group Leader Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={groupForm.leaderName}
                    onChange={(e) => setGroupForm({ ...groupForm, leaderName: e.target.value })}
                    placeholder="e.g. Ramprasad Meena"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Members</label>
                  <input
                    type="number"
                    className="form-input"
                    value={groupForm.memberCount}
                    onChange={(e) => setGroupForm({ ...groupForm, memberCount: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '0.85rem' }}>
                <Building size={16} /> Register Self-Help Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. VIEW GROUP MEMBERS MODAL */}
      {viewingGroup && (
        <div className="modal-overlay" onClick={() => setViewingGroup(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>{viewingGroup.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: {viewingGroup.id} | Village: {viewingGroup.village}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingGroup(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <div><strong>Leader:</strong> {viewingGroup.leaderName} ({viewingGroup.leaderId})</div>
              <div><strong>Total Group Savings:</strong> ₹{Number(viewingGroup.totalGroupDeposit).toLocaleString('en-IN')}</div>
              <div><strong>Meeting Schedule:</strong> {viewingGroup.meetingDay}</div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enrolled Group Members</h4>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Account No</th>
                    <th>Savings Balance</th>
                    <th>Active Loan</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter((c) => c.group?.groupId === viewingGroup.id || c.group?.groupName === viewingGroup.name)
                    .map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 700 }}>{m.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{m.accountNumber}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>
                          ₹{Number(m.savings?.currentBalance || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: '#f59e0b', fontWeight: 700 }}>
                          ₹{Number(m.loans?.activeLoan || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setViewingGroup(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 8. RAISE STAFF TICKET MODAL */}
      {showTicketModal && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Send size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>Internal Branch Escalation</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Dispatch operational note directly to Admin Rohit Meena
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowTicketModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Biometric KYC Scanner Driver Update"
                  required
                />
              </div>

              <div className="grid-2col-even" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  >
                    <option value="Operations Discrepancy">Operations Discrepancy</option>
                    <option value="Underwriting Clearance">Underwriting Clearance</option>
                    <option value="Hardware / IT Desk">Hardware / IT Desk</option>
                    <option value="Customer Record Correction">Customer Record Correction</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Requires Immediate Admin Sanction)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Operational Description *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Provide complete details for Admin Rohit Meena review..."
                  required
                />
              </div>

              <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '0.85rem' }}>
                <Send size={16} /> Dispatch Ticket to Executive Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. WELCOME PASSBOOK SLIP MODAL */}
      {showWelcomeSlip && (
        <div className="modal-overlay" onClick={() => setShowWelcomeSlip(null)}>
          <div className="modal-content printable-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-green">✓ Account Initialized</span>
              <button className="modal-close-btn" onClick={() => setShowWelcomeSlip(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="staff-receipt-voucher">
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>RPR : RAJASTHAN PAY RESERVE CAPITAL</h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Jamawaramgarh Regional Hub, Jaipur • Official Customer Welcome Passbook
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div><strong>Customer Name:</strong> {showWelcomeSlip.name}</div>
                <div><strong>Customer ID:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: '#1d4ed8', fontWeight: 800 }}>{showWelcomeSlip.customerId}</span></div>
                <div><strong>Account Number:</strong> <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{showWelcomeSlip.accountNumber}</span></div>
                <div><strong>Email (Portal Login):</strong> {showWelcomeSlip.email}</div>
                <div><strong>Village Address:</strong> {showWelcomeSlip.address}</div>
                <div><strong>Initial Reserve Deposit:</strong> ₹{Number(showWelcomeSlip.savings?.totalDeposit || 0).toLocaleString('en-IN')}</div>
                <div><strong>Branch:</strong> Jamawaramgarh Branch, Jaipur</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div>Issued by: <strong>{currentUser?.name || 'Pooja Sharma'} (Staff)</strong></div>
                <div>Approved by: <strong>ROHIT MEENA (Admin)</strong></div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
                <Printer size={15} /> Print Passbook Welcome Slip
              </button>
              <button className="btn btn-secondary" onClick={() => setShowWelcomeSlip(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
