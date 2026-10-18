import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Deposit } from './models/Deposit.js';
import { LoanApplication } from './models/LoanApplication.js';
import { Group } from './models/Group.js';
import { StaffTicket } from './models/StaffTicket.js';
import { Complaint } from './models/Complaint.js';
import { AuditLog } from './models/AuditLog.js';
import { INITIAL_DATA } from '../src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOT_FILE = path.resolve(__dirname, 'data/ledger_snapshot.json');

// Ensure local persistence directory exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory / persistent fallback mirror
let inMemoryData = null;

export function loadSnapshot() {
  if (inMemoryData) return inMemoryData;
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const content = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      inMemoryData = JSON.parse(content);
      return inMemoryData;
    }
  } catch (e) {
    console.warn('[DataStore] Could not read local snapshot, using initial seed data.', e.message);
  }
  inMemoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
  saveSnapshot(inMemoryData);
  return inMemoryData;
}

export function saveSnapshot(data) {
  inMemoryData = data;
  try {
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DataStore] Error saving snapshot to disk:', e.message);
  }
}

// Check if MongoDB is currently available
export function isMongoActive() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Seed MongoDB Atlas if collections are empty
export async function seedMongoIfEmpty() {
  if (!isMongoActive()) return;

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB Atlas] Seeding fresh database with initial RPR Capital records...');
      const snapshot = loadSnapshot();

      if (snapshot.users && snapshot.users.length) {
        await User.insertMany(snapshot.users);
      }
      if (snapshot.deposits && snapshot.deposits.length) {
        await Deposit.insertMany(snapshot.deposits);
      }
      if (snapshot.loanApplications && snapshot.loanApplications.length) {
        await LoanApplication.insertMany(snapshot.loanApplications);
      }
      if (snapshot.groups && snapshot.groups.length) {
        await Group.insertMany(snapshot.groups);
      }
      if (snapshot.staffTickets && snapshot.staffTickets.length) {
        await StaffTicket.insertMany(snapshot.staffTickets);
      }
      if (snapshot.complaints && snapshot.complaints.length) {
        await Complaint.insertMany(snapshot.complaints);
      }
      if (snapshot.auditLogs && snapshot.auditLogs.length) {
        await AuditLog.insertMany(snapshot.auditLogs);
      }
      console.log('[MongoDB Atlas] Seeding completed successfully!');
    }
  } catch (err) {
    console.error('[MongoDB Atlas Seeding Error]:', err.message);
  }
}

// -------------------------------------------------------------
// Unified Data Access API (Atlas First, Local Persistent Backup)
// -------------------------------------------------------------

export async function getAllSystemData() {
  const snapshot = loadSnapshot();

  if (isMongoActive()) {
    try {
      const [users, deposits, loanApplications, groups, staffTickets, complaints, auditLogs] = await Promise.all([
        User.find({}).lean(),
        Deposit.find({}).sort({ createdAt: -1 }).lean(),
        LoanApplication.find({}).sort({ createdAt: -1 }).lean(),
        Group.find({}).lean(),
        StaffTicket.find({}).sort({ createdAt: -1 }).lean(),
        Complaint.find({}).sort({ createdAt: -1 }).lean(),
        AuditLog.find({}).sort({ createdAt: -1 }).lean()
      ]);

      const liveData = {
        company: snapshot.company,
        users,
        deposits,
        loanApplications,
        groups,
        staffTickets,
        complaints,
        auditLogs
      };
      saveSnapshot(liveData);
      return liveData;
    } catch (err) {
      console.warn('[MongoDB Atlas Fetch Error, serving mirror]:', err.message);
    }
  }

  return snapshot;
}

// Create New Customer Account
export async function createCustomerAccount(custData, authorizedBy) {
  if (!custData || !custData.name || !custData.email) {
    return { success: false, message: 'Customer name and valid email are strictly required.' };
  }

  const snapshot = loadSnapshot();
  const cleanEmail = custData.email.trim().toLowerCase();

  const existing = (snapshot.users || []).find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: `An account with email "${cleanEmail}" is already registered. Please sign in instead.` };
  }

  const generatedCustId = `RPR-CUST-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedAccNo = `RPR-ACC-10${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toISOString().split('T')[0];
  const safeAuthName = authorizedBy?.name || 'Jamawaramgarh Branch Admin';
  const safeAuthRole = (authorizedBy?.role || 'admin').toUpperCase();
  const depositAmt = Math.max(0, Number(custData.initialDeposit ?? custData.reserveBalance ?? 10000) || 10000);
  const initialLoanAmt = Math.max(0, Number(custData.initialLoan ?? custData.activeLoan ?? 0) || 0);

  const newCustomer = {
    id: `usr_cust_${Date.now()}`,
    name: custData.name.trim(),
    email: cleanEmail,
    password: custData.password || 'cust123',
    role: 'customer',
    customerId: generatedCustId,
    accountNumber: generatedAccNo,
    accountType: custData.accountType || 'Pay Reserve & Loan Account',
    phone: custData.phone || custData.mobile || '+91 98000 00000',
    address: custData.address || custData.city || 'Jamawaramgarh, Jaipur, Rajasthan',
    branch: 'Jamawaramgarh Branch, Jaipur',
    idProof: {
      type: custData.idType || 'Aadhaar Card',
      number: custData.idNumber || '•••• •••• 1234',
      pan: (custData.panNumber || 'PRPRK9911Z').toUpperCase(),
      status: 'Verified & Approved'
    },
    bankDetails: {
      bankName: custData.bankName || 'State Bank of India',
      accountNumber: custData.bankAccNumber || '••••••••1234',
      ifsc: custData.ifsc || 'SBIN0031201'
    },
    savings: {
      totalDeposit: depositAmt,
      totalWithdrawn: 0,
      currentBalance: depositAmt,
      planName: custData.planName || 'Monthly Recurring Reserve Deposit Plan'
    },
    loans: {
      activeLoan: initialLoanAmt,
      sanctionedAmount: Math.max(initialLoanAmt, Number(custData.creditLimit) || initialLoanAmt),
      outstanding: initialLoanAmt,
      interestRate: 10.5,
      monthlyEmi: Number(initialLoanAmt ? Math.round((initialLoanAmt * 1.1) / 24) : 0),
      nextPaymentDate: '2026-11-15',
      status: initialLoanAmt ? 'Active Repayment' : 'No Active Loan'
    },
    group: {
      groupId: custData.groupId || 'GRP-JAMWA-01',
      groupName: custData.groupName || 'Jamwa Mahila & Farmer Vikas Samooh',
      role: 'Member',
      connectedCustomers: []
    },
    kycStatus: 'Verified',
    status: 'Active',
    createdAt: dateStr,
    createdBy: `${safeAuthName} (${safeAuthRole})`
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Customer Registered & Account Created',
    actor: `${safeAuthName} (${safeAuthRole})`,
    target: `${newCustomer.name} (${generatedCustId})`,
    details: `Account ${generatedAccNo} opened at Jamawaramgarh Branch with initial deposit ₹${depositAmt.toLocaleString('en-IN')}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  // Sync to MongoDB if active
  if (isMongoActive()) {
    try {
      await User.create(newCustomer);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Customer Write Error]:', e.message);
    }
  }

  // Always update snapshot mirror
  snapshot.users = [newCustomer, ...(snapshot.users || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, customer: newCustomer };
}

// Record Deposit Entry
export async function recordDepositEntry({ customerId, amount, mode, txnRef, receivedBy }) {
  const numAmount = Number(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return { success: false, message: 'Valid deposit amount greater than zero is required.' };
  }

  const snapshot = loadSnapshot();
  const dateStr = new Date().toISOString().split('T')[0];
  const receiptNum = `RCPT-JMW-${Date.now().toString().slice(-4)}`;

  const targetUser = snapshot.users.find((u) => u.customerId === customerId || u.id === customerId);
  if (!targetUser) return { success: false, message: 'Target customer account not found.' };

  const currentBal = targetUser.savings?.currentBalance || 0;
  const newBal = currentBal + numAmount;
  const totalDep = (targetUser.savings?.totalDeposit || 0) + (numAmount > 0 ? numAmount : 0);
  const totalWth = (targetUser.savings?.totalWithdrawn || 0) + (numAmount < 0 ? Math.abs(numAmount) : 0);

  const newDepositEntry = {
    id: `DEP-${Date.now().toString().slice(-4)}`,
    customerId: targetUser.customerId,
    customerName: targetUser.name,
    accountNumber: targetUser.accountNumber || `RPR-ACC-${targetUser.customerId.slice(-4)}`,
    amount: numAmount,
    type: numAmount >= 0 ? 'Deposit' : 'Withdrawal',
    date: dateStr,
    mode: mode || 'Cash (Jamawaramgarh Counter)',
    txnRef: txnRef || `TXN/${Date.now().toString().slice(-8)}`,
    receivedBy: receivedBy?.name || 'Staff Officer',
    receiptNumber: receiptNum,
    balanceAfter: newBal
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Deposit Entry Logged (Strict No-Delete)',
    actor: receivedBy?.name || 'Staff',
    target: `${targetUser.name} (${targetUser.customerId})`,
    details: `Amount: ₹${numAmount.toLocaleString('en-IN')}, Mode: ${mode}, Receipt: ${receiptNum}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  // Update target user balances
  targetUser.savings = {
    ...targetUser.savings,
    currentBalance: newBal,
    totalDeposit: totalDep,
    totalWithdrawn: totalWth
  };

  // If receivedBy is staff, update their performance
  const staffUser = snapshot.users.find((u) => u.id === receivedBy?.id || u.role === 'staff');
  if (staffUser) {
    staffUser.performance = {
      ...staffUser.performance,
      totalDepositsCollected: (staffUser.performance?.totalDepositsCollected || 0) + numAmount
    };
  }

  // Sync to MongoDB if active
  if (isMongoActive()) {
    try {
      await Deposit.create(newDepositEntry);
      await AuditLog.create(newAudit);
      await User.updateOne({ id: targetUser.id }, { $set: { savings: targetUser.savings } });
      if (staffUser) {
        await User.updateOne({ id: staffUser.id }, { $set: { performance: staffUser.performance } });
      }
    } catch (e) {
      console.warn('[MongoDB Atlas Deposit Write Error]:', e.message);
    }
  }

  snapshot.deposits = [newDepositEntry, ...(snapshot.deposits || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, receiptNumber: receiptNum, customer: targetUser, deposit: newDepositEntry };
}

// Record Loan Monthly EMI Collection
export async function recordEmiCollectionEntry({ customerId, amount, mode, txnRef, receivedBy, note }) {
  const numAmount = Number(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return { success: false, message: 'Valid EMI collection amount greater than zero is required.' };
  }

  const snapshot = loadSnapshot();
  const dateStr = new Date().toISOString().split('T')[0];
  const receiptNum = `RCPT-EMI-${Date.now().toString().slice(-4)}`;

  const targetUser = snapshot.users.find((u) => u.customerId === customerId || u.id === customerId);
  if (!targetUser) return { success: false, message: 'Target customer account not found.' };

  const currentActive = targetUser.loans?.activeLoan || 0;
  const currentOutstanding = targetUser.loans?.outstanding || currentActive;
  const newOutstanding = Math.max(0, currentOutstanding - numAmount);
  const newActive = Math.max(0, currentActive - numAmount);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 30);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const newReceiptEntry = {
    id: `EMI-${Date.now().toString().slice(-4)}`,
    customerId: targetUser.customerId,
    customerName: targetUser.name,
    accountNumber: targetUser.accountNumber || `RPR-ACC-${targetUser.customerId.slice(-4)}`,
    amount: numAmount,
    type: 'EMI Repayment',
    date: dateStr,
    mode: mode || 'Cash (Doorstep Field Collection)',
    txnRef: txnRef || `EMI/JMW/${Date.now().toString().slice(-6)}`,
    receivedBy: receivedBy?.name || 'Staff Officer',
    receiptNumber: receiptNum,
    balanceAfter: newOutstanding,
    note: note || 'Monthly Loan Installment Received'
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Loan EMI Collected & Discharged',
    actor: receivedBy?.name || 'Staff Officer',
    target: `${targetUser.name} (${targetUser.customerId})`,
    details: `EMI Amount: ₹${numAmount.toLocaleString('en-IN')}, Remaining Outstanding: ₹${newOutstanding.toLocaleString('en-IN')}, Receipt: ${receiptNum}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  targetUser.loans = {
    ...targetUser.loans,
    activeLoan: newActive,
    outstanding: newOutstanding,
    nextPaymentDate: nextDateStr,
    status: newOutstanding === 0 ? 'Fully Repaid' : 'Active Repayment'
  };

  const staffUser = snapshot.users.find((u) => u.id === receivedBy?.id || u.role === 'staff');
  if (staffUser) {
    staffUser.performance = {
      ...staffUser.performance,
      totalDepositsCollected: (staffUser.performance?.totalDepositsCollected || 0) + numAmount
    };
  }

  if (isMongoActive()) {
    try {
      await Deposit.create(newReceiptEntry);
      await AuditLog.create(newAudit);
      await User.updateOne({ id: targetUser.id }, { $set: { loans: targetUser.loans } });
      if (staffUser) {
        await User.updateOne({ id: staffUser.id }, { $set: { performance: staffUser.performance } });
      }
    } catch (e) {
      console.warn('[MongoDB Atlas EMI Collection Write Error]:', e.message);
    }
  }

  snapshot.deposits = [newReceiptEntry, ...(snapshot.deposits || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, receiptNumber: receiptNum, customer: targetUser, receipt: newReceiptEntry };
}

// Submit Loan Application (Customer or Walk-in Staff Assist)
export async function submitLoanDossier(applicationData, creator) {
  if (!applicationData) return { success: false, message: 'Loan application data is required.' };
  const reqAmount = Number(applicationData.requestedAmount);
  if (!reqAmount || isNaN(reqAmount) || reqAmount <= 0) {
    return { success: false, message: 'Valid loan requested amount greater than zero is required.' };
  }

  const snapshot = loadSnapshot();
  const newAppId = `LN-APP-${Math.floor(100 + Math.random() * 900)}`;
  const dateStr = new Date().toISOString().split('T')[0];
  const isStaffAssisted = creator?.role === 'staff';

  const newApp = {
    id: newAppId,
    customerId: applicationData.customerId || `RPR-CUST-${Math.floor(8000 + Math.random() * 1000)}`,
    applicantName: applicationData.applicantName || creator?.name || 'Applicant',
    mobile: applicationData.mobile || creator?.phone || '+91 98000 00000',
    dob: applicationData.dob || '1990-01-01',
    address: applicationData.address || creator?.address || 'Jamawaramgarh, Jaipur',
    pinCode: applicationData.pinCode || '303109',
    occupationIncome: applicationData.occupationIncome || 'Agriculture & Local Business',
    requestedAmount: reqAmount,
    purpose: applicationData.purpose || 'Working Capital & Machinery',
    tenureMonths: Number(applicationData.tenureMonths || 24),
    documentsSubmitted: applicationData.documentsSubmitted || 'Aadhaar Card, PAN Card',
    inspectionNotes: applicationData.inspectionNotes || (isStaffAssisted ? 'Staff inspected premises and verified documents in order.' : ''),
    submittedDate: dateStr,
    status: isStaffAssisted ? 'Under Review' : 'Submitted',
    statusHistory: [
      { status: 'Draft', date: dateStr, note: 'Intake initiated' },
      { status: isStaffAssisted ? 'Under Review' : 'Submitted', date: dateStr, note: isStaffAssisted ? `Forwarded to Admin Rohit Meena by Staff ${creator?.name}` : 'Submitted via customer portal' }
    ],
    disbursalStatus: isStaffAssisted ? 'Pending Admin Final Sanction' : 'Pending Verification by Jamawaramgarh Staff'
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: isStaffAssisted ? 'Walk-in Loan Intake by Staff' : 'Customer Loan Application Submitted',
    actor: `${creator?.name || 'Applicant'} (${creator?.role || 'customer'})`,
    target: newAppId,
    details: `Requested ₹${Number(newApp.requestedAmount).toLocaleString('en-IN')} for ${newApp.purpose}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await LoanApplication.create(newApp);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Loan Dossier Write Error]:', e.message);
    }
  }

  snapshot.loanApplications = [newApp, ...(snapshot.loanApplications || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, application: newApp };
}

// Update Loan Application Status (Staff forwards; Admin sanctions/rejects)
export async function updateLoanApplicationStatus(appId, newStatus, reviewer, note) {
  // Security protocol: Staff cannot sanction loans
  if (newStatus === 'Approved' && reviewer?.role === 'staff') {
    return {
      success: false,
      message: 'Security Policy Violation: Staff does not have sanction authority. Only Executive Admin (Rohit Meena) can sanction and disburse loans.'
    };
  }

  const snapshot = loadSnapshot();
  const dateStr = new Date().toISOString().split('T')[0];
  const app = snapshot.loanApplications.find((a) => a.id === appId);
  if (!app) return { success: false, message: 'Loan application not found.' };

  const newHistory = [
    ...(app.statusHistory || []),
    { status: newStatus, date: dateStr, note: note || `Status transitioned to ${newStatus} by ${reviewer?.name || 'Reviewer'}` }
  ];

  let disbursal = app.disbursalStatus;
  if (newStatus === 'Approved') {
    disbursal = 'Sanctioned by Admin Rohit Meena';
    // Update target customer's loan state
    const customer = (snapshot.users || []).find((u) => u.customerId === app.customerId || (app.applicantName && u.name && u.name.toLowerCase() === app.applicantName.toLowerCase()));
    if (customer) {
      const loanAmt = Number(app.requestedAmount) || 0;
      const tenure = Number(app.tenureMonths || 24);
      const monthlyEmi = Math.round((loanAmt * 1.1) / tenure);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      customer.loans = {
        activeLoan: loanAmt,
        sanctionedAmount: loanAmt,
        outstanding: loanAmt,
        interestRate: 10.5,
        monthlyEmi,
        nextPaymentDate: nextDateStr,
        status: 'Active Repayment'
      };

      if (isMongoActive()) {
        try {
          await User.updateOne({ id: customer.id }, { $set: { loans: customer.loans } });
        } catch (e) {
          console.warn('[MongoDB Atlas Customer Loan Sanction Update Error]:', e.message);
        }
      }
    }
  }
  if (newStatus === 'Rejected') disbursal = 'Rejected';
  if (newStatus === 'Under Review') disbursal = 'Forwarded to Admin Rohit Meena';

  app.status = newStatus;
  app.statusHistory = newHistory;
  app.disbursalStatus = disbursal;

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: `Loan Status: ${newStatus}`,
    actor: `${reviewer?.name || 'Reviewer'} (${reviewer?.role || 'system'})`,
    target: appId,
    details: note || `Application transitioned to ${newStatus}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await LoanApplication.updateOne({ id: appId }, { $set: { status: newStatus, statusHistory: newHistory, disbursalStatus: disbursal } });
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Loan Status Update Error]:', e.message);
    }
  }

  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, application: app };
}

// Register Self-Help Group
export async function createSelfHelpGroup(groupData, creator) {
  if (!groupData || !groupData.name || typeof groupData.name !== 'string') {
    return { success: false, message: 'Group name is strictly required.' };
  }
  const snapshot = loadSnapshot();
  const newGroupId = `GRP-JAMWA-${Math.floor(10 + Math.random() * 90)}`;

  const newGroup = {
    id: newGroupId,
    name: groupData.name.trim(),
    village: (groupData.village || 'Jamawaramgarh, Jaipur').trim(),
    leaderName: groupData.leaderName || 'To Be Nominated',
    leaderId: groupData.leaderId || 'N/A',
    memberCount: Number(groupData.memberCount || 1),
    totalGroupDeposit: Number(groupData.initialDeposit || 10000),
    totalGroupLoan: 0,
    meetingDay: groupData.meetingDay || 'First Monday of Month',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Self-Help Group Registered',
    actor: creator?.name || 'Staff Officer',
    target: `${newGroup.name} (${newGroupId})`,
    details: `Group registered in ${newGroup.village}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await Group.create(newGroup);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Group Write Error]:', e.message);
    }
  }

  snapshot.groups = [newGroup, ...(snapshot.groups || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, group: newGroup };
}

// Staff Escalation Ticket to Admin
export async function submitStaffEscalationTicket(ticketData, staff) {
  if (!ticketData || !ticketData.subject || typeof ticketData.subject !== 'string') {
    return { success: false, message: 'Ticket subject is required.' };
  }
  const snapshot = loadSnapshot();
  const newTicket = {
    id: `TCK-JMW-${Math.floor(100 + Math.random() * 900)}`,
    staffId: staff?.staffId || 'STF-JMW-01',
    staffName: staff?.name || 'Pooja Sharma',
    subject: ticketData.subject.trim(),
    category: ticketData.category || 'Operations Discrepancy',
    priority: ticketData.priority || 'Normal',
    description: (ticketData.description || '').trim(),
    status: 'Submitted to Admin',
    date: new Date().toISOString().split('T')[0],
    resolution: 'Queued for Executive Admin Rohit Meena review'
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Staff Branch Escalation Dispatched',
    actor: staff?.name || 'Staff Officer',
    target: newTicket.id,
    details: `Subject: ${newTicket.subject} (Priority: ${newTicket.priority})`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await StaffTicket.create(newTicket);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Ticket Write Error]:', e.message);
    }
  }

  snapshot.staffTickets = [newTicket, ...(snapshot.staffTickets || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, ticket: newTicket };
}

// Toggle Staff Attendance
export async function toggleStaffAttendanceRecord(staffUserId) {
  const snapshot = loadSnapshot();
  const staff = snapshot.users.find((u) => u.id === staffUserId || u.role === 'staff');
  if (!staff) return { success: false, message: 'Staff user not found.' };

  const isCurrentlyCheckedIn = staff.attendance?.status === 'Checked In';
  const newStatus = isCurrentlyCheckedIn ? 'Checked Out' : 'Checked In';
  const now = new Date();

  staff.attendance = {
    ...staff.attendance,
    status: newStatus,
    clockInTime: isCurrentlyCheckedIn ? staff.attendance.clockInTime : now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    countdownEndTimestamp: isCurrentlyCheckedIn ? null : Date.now() + 8 * 60 * 60 * 1000
  };

  if (isMongoActive()) {
    try {
      await User.updateOne({ id: staff.id }, { $set: { attendance: staff.attendance } });
    } catch (e) {
      console.warn('[MongoDB Atlas Attendance Write Error]:', e.message);
    }
  }

  saveSnapshot(snapshot);
  return { success: true, attendance: staff.attendance };
}

// Create Staff Officer (by Admin)
export async function createStaffOfficer(staffData, authorizedBy) {
  if (!staffData || !staffData.email || !staffData.name) {
    return { success: false, message: 'Staff name and official email are strictly required.' };
  }
  const snapshot = loadSnapshot();
  const cleanEmail = staffData.email.trim().toLowerCase();

  const existing = (snapshot.users || []).find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: `A user account with email "${cleanEmail}" is already registered.` };
  }

  const newStaff = {
    id: `usr_staff_${Date.now()}`,
    name: staffData.name.trim(),
    email: cleanEmail,
    password: staffData.password || 'staff123',
    role: 'staff',
    staffId: `STF-JMW-${Math.floor(10 + Math.random() * 90)}`,
    title: staffData.title || 'Field Verification & Underwriting Officer',
    department: staffData.department || 'Customer Verification & Operations',
    branch: 'Jamawaramgarh Branch, Jaipur',
    avatarBg: 'gradient-staff',
    status: 'Active',
    attendance: {
      status: 'Checked In',
      clockInTime: '09:30 AM',
      shiftDurationHours: 8,
      countdownEndTimestamp: Date.now() + 6 * 60 * 60 * 1000,
      totalDaysPresent: 1,
      totalDaysLeave: 0
    },
    performance: {
      customersAdded: 0,
      kycPending: 0,
      totalDepositsCollected: 0,
      loanApplicationsForwarded: 0
    },
    createdAt: new Date().toISOString().split('T')[0]
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Staff Officer Created',
    actor: authorizedBy?.name || 'Admin Rohit Meena',
    target: `${newStaff.name} (${newStaff.staffId})`,
    details: `Appointed to Jamawaramgarh Branch Desk`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await User.create(newStaff);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Staff Write Error]:', e.message);
    }
  }

  snapshot.users = [newStaff, ...(snapshot.users || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, staff: newStaff };
}

// Toggle User Status (Active / Frozen by Admin)
export async function toggleUserStatusRecord(userId, actor) {
  const snapshot = loadSnapshot();
  const targetUser = snapshot.users.find((u) => u.id === userId);
  if (!targetUser) return { success: false, message: 'User not found.' };

  const newStatus = targetUser.status === 'Active' ? 'Blocked' : 'Active';
  return setUserAuthorityRecord(userId, newStatus, actor);
}

// Set User Authority (Active / Blocked / Revoked) by Admin
export async function setUserAuthorityRecord(userId, newStatus, actor) {
  const snapshot = loadSnapshot();
  const targetUser = (snapshot.users || []).find((u) => u.id === userId || u.staffId === userId);
  if (!targetUser) return { success: false, message: 'User not found.' };

  targetUser.status = newStatus;
  if (newStatus === 'Blocked' || newStatus === 'Revoked') {
    if (targetUser.attendance) {
      targetUser.attendance.status = 'Checked Out';
    }
    if (snapshot.delegatedAdmins) {
      snapshot.delegatedAdmins = snapshot.delegatedAdmins.map((d) => {
        if (d.staffId === targetUser.staffId || d.staffId === targetUser.id) {
          return { ...d, status: 'Revoked' };
        }
        return d;
      });
    }
  }

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: `Staff Authority: ${newStatus}`,
    actor: actor?.name || 'Executive Admin Rohit Meena',
    target: `${targetUser.name} (${targetUser.role})`,
    details: `Administrative authority set to: ${newStatus}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await User.updateOne(
        { id: targetUser.id },
        { 
          $set: { 
            status: newStatus, 
            ...(newStatus === 'Blocked' || newStatus === 'Revoked' ? { 'attendance.status': 'Checked Out' } : {}) 
          } 
        }
      );
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas User Status Update Error]:', e.message);
    }
  }

  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, user: targetUser };
}


// Update User Profile (Customer, Staff, Admin)
export async function updateUserProfile(userId, profileData) {
  const snapshot = loadSnapshot();
  const user = (snapshot.users || []).find(
    (u) => u.id === userId || u.customerId === userId || u.accountNumber === userId
  );

  if (!user) {
    return { success: false, message: 'User not found in system.' };
  }

  // Update profile fields
  Object.assign(user, profileData);

  // If user is a customer, keep customer records synchronized
  if (snapshot.customers) {
    const cust = snapshot.customers.find(
      (c) => c.customerId === user.customerId || c.id === user.id || c.accountNumber === user.accountNumber
    );
    if (cust) {
      Object.assign(cust, profileData);
    }
  }

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Profile Details Updated',
    actor: `${user.name} (${user.role})`,
    target: user.customerId || user.accountNumber || user.id,
    details: `Updated personal & contact details`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await User.updateOne({ id: user.id }, { $set: profileData });
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas User Profile Update Error]:', e.message);
    }
  }

  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, user };
}

// Record Customer Complaint
export async function recordCustomerComplaint(complaintData, customer) {
  const snapshot = loadSnapshot();
  const dateStr = new Date().toISOString().split('T')[0];
  const newComplaintId = `CMP-${Date.now().toString().slice(-4)}`;

  const newComplaint = {
    id: newComplaintId,
    customerId: customer?.customerId || complaintData.customerId || 'RPR-CUST-8021',
    customerName: customer?.name || complaintData.customerName || 'Customer',
    subject: (complaintData.subject || 'General Inquiry').trim(),
    category: complaintData.category || 'General',
    description: (complaintData.description || '').trim(),
    date: dateStr,
    status: 'Pending',
    reply: 'Your complaint has been queued for Jamawaramgarh Branch Desk.'
  };

  const newAudit = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    action: 'Customer Complaint Logged',
    actor: `${newComplaint.customerName} (${newComplaint.customerId})`,
    target: newComplaintId,
    details: `Category: ${newComplaint.category} | Subject: ${newComplaint.subject}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  };

  if (isMongoActive()) {
    try {
      await Complaint.create(newComplaint);
      await AuditLog.create(newAudit);
    } catch (e) {
      console.warn('[MongoDB Atlas Complaint Write Error]:', e.message);
    }
  }

  snapshot.complaints = [newComplaint, ...(snapshot.complaints || [])];
  snapshot.auditLogs = [newAudit, ...(snapshot.auditLogs || [])];
  saveSnapshot(snapshot);

  return { success: true, complaint: newComplaint };
}

