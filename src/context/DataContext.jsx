import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_DATA } from '../data/mockData';

export const DataContext = createContext(null);

const STORAGE_KEY = 'rpr_capital_db_v8'; // v8 Connected with MongoDB Atlas

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.deposits)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[DataContext] Local cache read notice:', e.message);
    }
    return INITIAL_DATA;
  });

  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    database: 'rpr_capital',
    host: 'cluster0.n6ggqqj.mongodb.net'
  });

  // Fetch live system state from MongoDB Atlas backend API on load and periodically
  const fetchBackendData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          setData((prev) => ({
            ...prev,
            ...json.data
          }));
        }
      }

      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const sJson = await statusRes.json();
        if (sJson && sJson.mongo) {
          setDbStatus(sJson.mongo);
        }
      }
    } catch {
      // Backend starting up or proxy syncing
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 15000); // 15-second heartbeat sync
    return () => clearInterval(interval);
  }, [fetchBackendData]);

  // Persist locally for immediate offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to cache RPR data', e);
    }
  }, [data]);

  // Helper to send API calls in background without blocking UI
  const apiCall = async (url, method, body) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn(`[API Async Sync] ${method} ${url} local queued:`, e.message);
      return { success: false, offline: true };
    }
  };

  // 1. Record Deposit Entry (Staff or Admin)
  const recordDeposit = ({ customerId, amount, mode, txnRef, receivedBy }) => {
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Please enter a valid deposit amount greater than zero.' };
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const receiptNum = `RCPT-JMW-${Date.now().toString().slice(-4)}`;
    let targetCustomerFound = null;

    setData((prev) => {
      const targetUser = prev.users.find((u) => u.customerId === customerId || u.id === customerId);
      if (!targetUser) return prev;

      targetCustomerFound = targetUser;
      const currentBal = targetUser.savings?.currentBalance || 0;
      const newBal = currentBal + numAmount;
      const totalDep = (targetUser.savings?.totalDeposit || 0) + numAmount;
      const totalWth = targetUser.savings?.totalWithdrawn || 0;

      const newDepositEntry = {
        id: `DEP-${Date.now().toString().slice(-4)}`,
        customerId: targetUser.customerId,
        customerName: targetUser.name,
        accountNumber: targetUser.accountNumber || `RPR-ACC-${targetUser.customerId.slice(-4)}`,
        amount: numAmount,
        type: 'Deposit',
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

      const updatedUsers = prev.users.map((u) => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            savings: {
              ...u.savings,
              currentBalance: newBal,
              totalDeposit: totalDep,
              totalWithdrawn: totalWth
            }
          };
        }
        if (receivedBy && (u.id === receivedBy.id || u.email === receivedBy.email || u.role === 'staff')) {
          return {
            ...u,
            performance: {
              ...u.performance,
              totalDepositsCollected: (u.performance?.totalDepositsCollected || 0) + numAmount
            }
          };
        }
        return u;
      });

      return {
        ...prev,
        users: updatedUsers,
        deposits: [newDepositEntry, ...prev.deposits],
        auditLogs: [newAudit, ...prev.auditLogs]
      };
    });

    // Sync to MongoDB
    apiCall('/api/deposits', 'POST', { customerId, amount: numAmount, mode, txnRef, receivedBy });

    return { success: true, receiptNumber: receiptNum, customer: targetCustomerFound };
  };

  // 1b. Record Loan Monthly EMI Collection (Staff or Admin)
  const recordEmiCollection = ({ customerId, amount, mode, txnRef, receivedBy, note }) => {
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Please enter a valid EMI collection amount greater than zero.' };
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const receiptNum = `RCPT-EMI-${Date.now().toString().slice(-4)}`;
    let targetCust = null;

    setData((prev) => {
      const targetUser = prev.users.find((u) => u.customerId === customerId || u.id === customerId);
      if (!targetUser) return prev;

      targetCust = targetUser;
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

      const updatedUsers = prev.users.map((u) => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            loans: {
              ...u.loans,
              activeLoan: newActive,
              outstanding: newOutstanding,
              nextPaymentDate: nextDateStr,
              status: newOutstanding === 0 ? 'Fully Repaid' : 'Active Repayment'
            }
          };
        }
        if (receivedBy && (u.id === receivedBy.id || u.email === receivedBy.email || u.role === 'staff')) {
          return {
            ...u,
            performance: {
              ...u.performance,
              totalDepositsCollected: (u.performance?.totalDepositsCollected || 0) + numAmount
            }
          };
        }
        return u;
      });

      return {
        ...prev,
        users: updatedUsers,
        deposits: [newReceiptEntry, ...prev.deposits],
        auditLogs: [newAudit, ...prev.auditLogs]
      };
    });

    // Sync to MongoDB
    apiCall('/api/collections/emi', 'POST', { customerId, amount: numAmount, mode, txnRef, receivedBy, note });

    return { success: true, receiptNumber: receiptNum, customer: targetCust };
  };

  // 2. Customer applies for a Loan (Customer Self-Service)
  const applyCustomerLoan = (applicationData, customer) => {
    const newAppId = `LN-APP-${Math.floor(100 + Math.random() * 900)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newApp = {
      id: newAppId,
      customerId: customer.customerId,
      applicantName: applicationData.applicantName || customer.name,
      mobile: applicationData.mobile || customer.phone,
      dob: applicationData.dob || '1990-01-01',
      address: applicationData.address || customer.address,
      pinCode: applicationData.pinCode || '303109',
      occupationIncome: applicationData.occupationIncome,
      requestedAmount: Number(applicationData.requestedAmount),
      purpose: applicationData.purpose,
      tenureMonths: Number(applicationData.tenureMonths || 24),
      documentsSubmitted: applicationData.documentsSubmitted || 'Aadhaar Card, PAN Card',
      submittedDate: dateStr,
      status: 'Submitted',
      statusHistory: [
        { status: 'Draft', date: dateStr, note: 'Draft completed' },
        { status: 'Submitted', date: dateStr, note: 'Customer submitted application via portal' }
      ],
      disbursalStatus: 'Pending Verification by Jamawaramgarh Staff'
    };

    setData((prev) => ({
      ...prev,
      loanApplications: [newApp, ...prev.loanApplications],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Loan Application Submitted',
          actor: customer.name,
          target: newAppId,
          details: `Requested ₹${Number(newApp.requestedAmount).toLocaleString('en-IN')} for ${newApp.purpose}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...prev.auditLogs
      ]
    }));

    apiCall('/api/loans/apply', 'POST', { applicationData, creator: customer });

    return { success: true, application: newApp };
  };

  // 2b. Staff Assists Walk-in Customer: Direct Loan Application Onboarding Desk
  const assistCustomerLoan = (loanData, staffOfficer) => {
    if (!loanData || !loanData.applicantName || !loanData.requestedAmount) {
      return { success: false, message: 'Applicant name and requested loan amount are required.' };
    }

    const newAppId = `LN-APP-${Math.floor(100 + Math.random() * 900)}`;
    const dateStr = new Date().toISOString().split('T')[0];
    const staffName = staffOfficer?.name || 'Pooja Sharma';

    const newApp = {
      id: newAppId,
      customerId: loanData.customerId || `RPR-CUST-${Math.floor(8000 + Math.random() * 1000)}`,
      applicantName: loanData.applicantName.trim(),
      mobile: loanData.mobile || '+91 98000 00000',
      dob: loanData.dob || '1990-01-01',
      address: loanData.address || 'Jamawaramgarh Tehsil, Jaipur',
      pinCode: loanData.pinCode || '303109',
      occupationIncome: loanData.occupationIncome || 'Agriculture / Self-Employed',
      requestedAmount: Number(loanData.requestedAmount),
      purpose: loanData.purpose || 'Agricultural & Working Capital Reserve',
      tenureMonths: Number(loanData.tenureMonths || 24),
      documentsSubmitted: loanData.documentsSubmitted || 'Aadhaar Card, PAN Card, Land Revenue Receipt',
      inspectionNotes: loanData.inspectionNotes || 'Field verification conducted; documents confirmed in order.',
      submittedDate: dateStr,
      status: 'Under Review',
      statusHistory: [
        { status: 'Draft', date: dateStr, note: 'Walk-in customer intake at Jamawaramgarh Branch' },
        { status: 'Under Review', date: dateStr, note: `Field inspection completed by ${staffName} and forwarded to Admin Rohit Meena for final sanction` }
      ],
      disbursalStatus: 'Forwarded to Admin Rohit Meena for Sanction'
    };

    setData((prev) => ({
      ...prev,
      loanApplications: [newApp, ...prev.loanApplications],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Walk-in Loan Application Intake by Staff',
          actor: `${staffName} (Staff)`,
          target: newAppId,
          details: `Requested ₹${Number(newApp.requestedAmount).toLocaleString('en-IN')} for ${newApp.purpose}. Forwarded to Admin Rohit Meena.`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...prev.auditLogs
      ]
    }));

    apiCall('/api/loans/apply', 'POST', { applicationData: loanData, creator: staffOfficer });

    return { success: true, application: newApp };
  };

  // 3. Update Loan Application Status (Staff forwards to Admin; Admin approves/rejects)
  const updateLoanStatus = (appId, newStatus, reviewer, note) => {
    if (newStatus === 'Approved' && reviewer?.role === 'staff') {
      return {
        success: false,
        message: 'Security Policy Violation: Staff does not have sanction authority. Only Executive Admin (Rohit Meena) can sanction and disburse loans.'
      };
    }

    const dateStr = new Date().toISOString().split('T')[0];

    setData((prev) => {
      let targetCustId = null;
      let requestedAmt = 0;
      let tenureMonths = 24;

      const updatedApplications = prev.loanApplications.map((app) => {
        if (app.id === appId) {
          targetCustId = app.customerId;
          requestedAmt = Number(app.requestedAmount) || 0;
          tenureMonths = Number(app.tenureMonths || 24);

          const newHistory = [
            ...(app.statusHistory || []),
            { status: newStatus, date: dateStr, note: note || `Status updated to ${newStatus} by ${reviewer?.name || 'Reviewer'}` }
          ];

          let disbursal = app.disbursalStatus;
          if (newStatus === 'Approved') disbursal = 'Sanctioned by Admin Rohit Meena';
          if (newStatus === 'Rejected') disbursal = 'Rejected';
          if (newStatus === 'Under Review') disbursal = 'Forwarded to Admin Rohit Meena';

          return {
            ...app,
            status: newStatus,
            statusHistory: newHistory,
            disbursalStatus: disbursal
          };
        }
        return app;
      });

      let updatedUsers = prev.users;
      if (newStatus === 'Approved' && targetCustId) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        const monthlyEmi = Math.round((requestedAmt * 1.1) / tenureMonths);

        updatedUsers = prev.users.map((u) => {
          if (u.customerId === targetCustId || u.id === targetCustId) {
            return {
              ...u,
              loans: {
                activeLoan: requestedAmt,
                sanctionedAmount: requestedAmt,
                outstanding: requestedAmt,
                interestRate: 10.5,
                monthlyEmi,
                nextPaymentDate: nextDateStr,
                status: 'Active Repayment'
              }
            };
          }
          return u;
        });
      }

      return {
        ...prev,
        users: updatedUsers,
        loanApplications: updatedApplications,
        auditLogs: [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            action: `Loan Status: ${newStatus}`,
            actor: `${reviewer?.name || 'User'} (${reviewer?.role || 'system'})`,
            target: appId,
            details: note || `Application transitioned to ${newStatus}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          },
          ...prev.auditLogs
        ]
      };
    });

    apiCall(`/api/loans/${appId}/status`, 'PUT', { status: newStatus, reviewer, note });

    return { success: true };
  };

  // 4. Staff or Admin Registers a Customer (Direct Onboarding)
  const registerCustomer = (formData, authorizedBy) => {
    if (!formData || !formData.email || !formData.name) {
      return { success: false, message: 'Customer name and valid email are strictly required.' };
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const existing = (data.users || []).find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: `An account with email "${cleanEmail}" is already registered. Please sign in instead.` };
    }

    const generatedCustId = `RPR-CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedAccNo = `RPR-ACC-10${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const safeAuthName = authorizedBy?.name || 'Jamawaramgarh Branch Admin';
    const safeAuthRole = (authorizedBy?.role || 'admin').toUpperCase();
    const depositAmt = Math.max(0, Number(formData.initialDeposit ?? formData.reserveBalance ?? 10000) || 10000);
    const initialLoanAmt = Math.max(0, Number(formData.initialLoan ?? formData.activeLoan ?? 0) || 0);

    const newCustomer = {
      id: `usr_cust_${Date.now()}`,
      name: formData.name.trim(),
      email: cleanEmail,
      password: formData.password || 'cust123',
      role: 'customer',
      customerId: generatedCustId,
      accountNumber: generatedAccNo,
      accountType: formData.accountType || 'Pay Reserve & Loan Account',
      phone: formData.phone || formData.mobile || '+91 98000 00000',
      address: formData.address || formData.city || 'Jamawaramgarh, Jaipur, Rajasthan',
      branch: 'Jamawaramgarh Branch, Jaipur',
      idProof: {
        type: formData.idType || 'Aadhaar Card',
        number: formData.idNumber || '•••• •••• 1234',
        pan: (formData.panNumber || 'PRPRK9911Z').toUpperCase(),
        status: 'Verified & Approved'
      },
      bankDetails: {
        bankName: formData.bankName || 'State Bank of India',
        accountNumber: formData.bankAccNumber || '••••••••1234',
        ifsc: formData.ifsc || 'SBIN0031201'
      },
      savings: {
        totalDeposit: depositAmt,
        totalWithdrawn: 0,
        currentBalance: depositAmt,
        planName: formData.planName || 'Monthly Recurring Reserve Deposit Plan'
      },
      loans: {
        activeLoan: initialLoanAmt,
        sanctionedAmount: Math.max(initialLoanAmt, Number(formData.creditLimit) || initialLoanAmt),
        outstanding: initialLoanAmt,
        interestRate: 10.5,
        monthlyEmi: Number(initialLoanAmt ? Math.round((initialLoanAmt * 1.1) / 24) : 0),
        nextPaymentDate: '2026-11-15',
        status: initialLoanAmt ? 'Active Repayment' : 'No Active Loan'
      },
      group: {
        groupId: formData.groupId || 'GRP-JAMWA-01',
        groupName: formData.groupName || 'Jamwa Mahila & Farmer Vikas Samooh',
        role: 'Member',
        connectedCustomers: []
      },
      kycStatus: 'Verified',
      status: 'Active',
      createdAt: dateStr,
      createdBy: `${safeAuthName} (${safeAuthRole})`
    };

    setData((prev) => ({
      ...prev,
      users: [newCustomer, ...(prev.users || [])],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Customer Registered & Account Created',
          actor: `${safeAuthName} (${safeAuthRole})`,
          target: `${newCustomer.name} (${generatedCustId})`,
          details: `Account ${generatedAccNo} opened at Jamawaramgarh Branch with initial deposit ₹${depositAmt.toLocaleString('en-IN')}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));

    apiCall('/api/customers', 'POST', { formData, authorizedBy });

    return { success: true, customer: newCustomer };
  };

  // 5. Staff Attendance Clock-In / Clock-Out
  const toggleStaffAttendance = (staffUserId) => {
    setData((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === staffUserId || u.role === 'staff') {
          const isCurrentlyCheckedIn = u.attendance?.status === 'Checked In';
          const newStatus = isCurrentlyCheckedIn ? 'Checked Out' : 'Checked In';

          return {
            ...u,
            attendance: {
              ...u.attendance,
              status: newStatus,
              clockInTime: isCurrentlyCheckedIn ? u.attendance.clockInTime : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              countdownEndTimestamp: isCurrentlyCheckedIn ? null : Date.now() + 8 * 60 * 60 * 1000
            }
          };
        }
        return u;
      });

      return {
        ...prev,
        users: updatedUsers
      };
    });

    apiCall('/api/attendance/toggle', 'POST', { staffUserId });
  };

  // 6. Submit Complaint / Help Ticket
  const submitComplaint = (complaintData, customer) => {
    const newComplaint = {
      id: `CMP-${Date.now().toString().slice(-3)}`,
      customerId: customer?.customerId || 'RPR-CUST-8021',
      customerName: customer?.name || 'Customer',
      subject: complaintData.subject,
      category: complaintData.category || 'General',
      description: complaintData.description,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      reply: 'Your complaint has been queued for Jamawaramgarh Branch Desk.'
    };

    setData((prev) => ({
      ...prev,
      complaints: [newComplaint, ...(prev.complaints || [])]
    }));

    apiCall('/api/complaints', 'POST', { complaintData, customer });

    return { success: true };
  };

  // 7. Admin Creates Staff Member
  const createStaff = (staffData, authorizedBy) => {
    const newStaff = {
      id: `usr_staff_${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      password: staffData.password || 'staff123',
      role: 'staff',
      staffId: `STF-JMW-${Math.floor(10 + Math.random() * 90)}`,
      title: staffData.title || 'Field Verification & Underwriting Officer',
      department: 'Customer Verification & Operations',
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

    setData((prev) => ({
      ...prev,
      users: [newStaff, ...prev.users],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Staff Officer Created',
          actor: authorizedBy.name,
          target: `${newStaff.name} (${newStaff.staffId})`,
          details: `Appointed to Jamawaramgarh Branch Desk`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...prev.auditLogs
      ]
    }));

    apiCall('/api/staff', 'POST', { staffData, authorizedBy });

    return { success: true, staff: newStaff };
  };

  // 8. Admin Sets User Authority (Active / Blocked / Revoked)
  const setUserAuthority = (userId, newStatus, actor) => {
    setData((prev) => {
      const user = prev.users.find((u) => u.id === userId || u.staffId === userId);
      if (!user) return prev;

      const targetId = user.id;
      const updatedUsers = prev.users.map((u) => {
        if (u.id === targetId) {
          const updated = { ...u, status: newStatus };
          if (newStatus === 'Blocked' || newStatus === 'Revoked') {
            if (updated.attendance) {
              updated.attendance = { ...updated.attendance, status: 'Checked Out' };
            }
          }
          return updated;
        }
        return u;
      });

      const updatedDelegations = (prev.delegatedAdmins || []).map((del) => {
        if ((del.staffId === user.staffId || del.staffId === user.id) && (newStatus === 'Blocked' || newStatus === 'Revoked')) {
          return { ...del, status: 'Revoked' };
        }
        return del;
      });

      const actionTitle = newStatus === 'Blocked' 
        ? 'Account Blocked: Access Suspended' 
        : newStatus === 'Revoked' 
          ? 'Access Permanently Revoked' 
          : 'Account Access Restored';

      return {
        ...prev,
        users: updatedUsers,
        delegatedAdmins: updatedDelegations,
        auditLogs: [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            action: `Staff Authority: ${newStatus}`,
            actor: actor?.name || 'Executive Admin Rohit Meena',
            target: `${user.name} (${user.role})`,
            details: `${actionTitle} by Executive Administration`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          },
          ...prev.auditLogs
        ]
      };
    });

    apiCall(`/api/users/${userId}/authority`, 'PUT', { status: newStatus, actor });
  };

  const toggleUserStatus = (userId, actor) => {
    const user = data.users.find((u) => u.id === userId || u.staffId === userId);
    if (!user) return;
    const nextStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    setUserAuthority(userId, nextStatus, actor);
  };


  // 9. Create Self-Help Group (SHG)
  const createGroup = (groupData, creator) => {
    if (!groupData || !groupData.name || !groupData.village) {
      return { success: false, message: 'Group Name and Village location are required.' };
    }

    const newGroupId = `GRP-JAMWA-${Math.floor(10 + Math.random() * 90)}`;
    const newGroup = {
      id: newGroupId,
      name: groupData.name.trim(),
      village: groupData.village.trim(),
      leaderName: groupData.leaderName || 'To Be Nominated',
      leaderId: groupData.leaderId || 'N/A',
      memberCount: Number(groupData.memberCount || 1),
      totalGroupDeposit: Number(groupData.initialDeposit || 10000),
      totalGroupLoan: 0,
      meetingDay: groupData.meetingDay || 'First Monday of Month',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setData((prev) => ({
      ...prev,
      groups: [newGroup, ...(prev.groups || [])],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Self-Help Group Registered',
          actor: creator?.name || 'Staff Officer',
          target: `${newGroup.name} (${newGroupId})`,
          details: `Group registered in ${newGroup.village}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));

    apiCall('/api/groups', 'POST', { groupData, creator });

    return { success: true, group: newGroup };
  };

  // 10. Add Customer to Group
  const addCustomerToGroup = (customerId, groupId, groupName) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.customerId === customerId || u.id === customerId) {
          return {
            ...u,
            group: {
              ...u.group,
              groupId,
              groupName: groupName || u.group?.groupName || 'Self-Help Group'
            }
          };
        }
        return u;
      })
    }));
    return { success: true };
  };

  // 11. Staff Submits Internal Branch Ticket / Escalation to Admin
  const submitStaffTicket = (ticketData, staff) => {
    if (!ticketData || !ticketData.subject || !ticketData.description) {
      return { success: false, message: 'Subject and detailed description are required.' };
    }

    const newTicket = {
      id: `TCK-JMW-${Math.floor(100 + Math.random() * 900)}`,
      staffId: staff?.staffId || 'STF-JMW-01',
      staffName: staff?.name || 'Pooja Sharma',
      subject: ticketData.subject.trim(),
      category: ticketData.category || 'Operations Discrepancy',
      priority: ticketData.priority || 'Normal',
      description: ticketData.description.trim(),
      status: 'Submitted to Admin',
      date: new Date().toISOString().split('T')[0],
      resolution: 'Queued for Executive Admin Rohit Meena review'
    };

    setData((prev) => ({
      ...prev,
      staffTickets: [newTicket, ...(prev.staffTickets || [])],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Staff Branch Escalation Dispatched',
          actor: staff?.name || 'Staff Officer',
          target: newTicket.id,
          details: `Subject: ${newTicket.subject} (Priority: ${newTicket.priority})`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));

    apiCall('/api/tickets', 'POST', { ticketData, staff });

    return { success: true, ticket: newTicket };
  };

  // 12. Submit Public Application
  const submitApplication = (appData) => {
    const customer = {
      customerId: 'WALK-IN',
      name: appData.fullName,
      phone: appData.mobile,
      address: appData.city || 'Jaipur'
    };
    return applyCustomerLoan(
      {
        applicantName: appData.fullName,
        mobile: appData.mobile,
        address: appData.city,
        requestedAmount: appData.requestedAmount,
        purpose: appData.appliedProduct || 'Capital Reserve',
        tenureMonths: appData.tenureMonths || 24,
        occupationIncome: 'Business & Trade'
      },
      customer
    );
  };

  // Update User Profile Data
  const updateUserProfileData = async (userId, profileData) => {
    let updatedUser = null;
    setData((prev) => {
      const newUsers = (prev.users || []).map((u) => {
        if (u.id === userId || u.customerId === userId || u.accountNumber === userId) {
          updatedUser = { ...u, ...profileData };
          return updatedUser;
        }
        return u;
      });

      const newCustomers = (prev.customers || []).map((c) => {
        if (c.customerId === userId || c.id === userId || c.accountNumber === userId) {
          return { ...c, ...profileData };
        }
        return c;
      });

      return {
        ...prev,
        users: newUsers,
        customers: newCustomers
      };
    });

    try {
      const res = await apiCall(`/api/users/${userId}/profile`, 'PUT', profileData);
      return res;
    } catch {
      return { success: true, user: updatedUser };
    }
  };

  // Reset User Password (Admin Direct Control or Inbound Request Approval)
  const resetUserPassword = (userIdOrEmail, newPassword, adminActor) => {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    let updatedTargetUser = null;
    setData((prev) => {
      const updatedUsers = (prev.users || []).map((u) => {
        if (
          u.id === userIdOrEmail ||
          u.email?.toLowerCase() === userIdOrEmail?.toLowerCase() ||
          u.customerId === userIdOrEmail ||
          u.staffId === userIdOrEmail
        ) {
          updatedTargetUser = { ...u, password: newPassword.trim() };
          return updatedTargetUser;
        }
        return u;
      });

      // Update matching reset request if any
      const updatedRequests = (prev.passwordResetRequests || []).map((r) => {
        if (
          r.userId === userIdOrEmail ||
          r.userEmail?.toLowerCase() === userIdOrEmail?.toLowerCase() ||
          r.accountOrId === userIdOrEmail
        ) {
          return {
            ...r,
            status: 'Resolved (Password Reset by Admin)',
            resolvedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
            resolvedBy: adminActor?.name || 'Rohit Meena (Admin)'
          };
        }
        return r;
      });

      const audit = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        action: 'Account Security Password Overwrite',
        actor: adminActor?.name || 'Rohit Meena (Admin)',
        target: updatedTargetUser ? `${updatedTargetUser.name} (${updatedTargetUser.email})` : userIdOrEmail,
        details: `Credentials reset by administrative oversight authority. New passkey provisioned.`,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      };

      return {
        ...prev,
        users: updatedUsers,
        passwordResetRequests: updatedRequests,
        auditLogs: [audit, ...(prev.auditLogs || [])]
      };
    });

    apiCall('/api/users/reset-password', 'POST', { userIdOrEmail, newPassword, adminActor });

    return {
      success: true,
      message: `Password successfully updated for ${updatedTargetUser?.name || userIdOrEmail}!`,
      user: updatedTargetUser
    };
  };

  // Inbound Password Reset Request (Submitted by Customer or Staff)
  const requestPasswordReset = ({ email, accountOrId, reason, userName }) => {
    if (!email) {
      return { success: false, message: 'Please enter your registered email address.' };
    }

    const newReq = {
      id: `PR-REQ-${Math.floor(100 + Math.random() * 900)}`,
      userEmail: email.trim().toLowerCase(),
      userName: userName || email.split('@')[0],
      accountOrId: accountOrId || 'N/A',
      requestDate: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      reason: reason?.trim() || 'User requested password recovery through official portal desk.',
      status: 'Pending Admin Action'
    };

    setData((prev) => ({
      ...prev,
      passwordResetRequests: [newReq, ...(prev.passwordResetRequests || [])],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Inbound Password Reset Queued',
          actor: email,
          target: accountOrId || email,
          details: `Password recovery request received: ${newReq.reason}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));

    return {
      success: true,
      message: 'Password reset request has been forwarded directly to Executive Admin Rohit Meena.'
    };
  };

  // Grant Delegated Admin Access (Profile Sharing)
  const grantDelegatedAdmin = (delegationData, adminActor) => {
    if (!delegationData || !delegationData.staffId) {
      return { success: false, message: 'Please select an authorized staff officer.' };
    }

    const newGrant = {
      id: `DLG-ADM-${Math.floor(10 + Math.random() * 90)}`,
      staffId: delegationData.staffId,
      staffName: delegationData.staffName,
      staffEmail: delegationData.staffEmail,
      accessLevel: delegationData.accessLevel || 'Operations Manager (Limited Admin)',
      permissions: delegationData.permissions || ['Customer Directory & KYC Audit', 'Loan Underwriting Clearance'],
      grantedBy: adminActor?.name || 'Rohit Meena (Executive Admin)',
      grantedDate: new Date().toISOString().split('T')[0],
      validTill: delegationData.validTill || '2026-12-31',
      tokenPasskey: `DLG-JMW-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Active'
    };

    setData((prev) => ({
      ...prev,
      delegatedAdmins: [newGrant, ...(prev.delegatedAdmins || [])],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Admin Executive Profile Delegation',
          actor: adminActor?.name || 'Rohit Meena (Admin)',
          target: `${newGrant.staffName} (${newGrant.staffId})`,
          details: `Role: ${newGrant.accessLevel} | Passkey: ${newGrant.tokenPasskey} | Perms: ${newGrant.permissions.join(', ')}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));

    return { success: true, delegation: newGrant };
  };

  // Revoke Delegated Admin Access
  const revokeDelegatedAdmin = (delegationId, adminActor) => {
    setData((prev) => ({
      ...prev,
      delegatedAdmins: (prev.delegatedAdmins || []).map((d) => {
        if (d.id === delegationId) {
          return { ...d, status: 'Revoked', revokedAt: new Date().toISOString().split('T')[0] };
        }
        return d;
      }),
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Delegated Admin Privilege Revoked',
          actor: adminActor?.name || 'Rohit Meena (Admin)',
          target: delegationId,
          details: `Privileges immediately rescinded under executive directive.`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));
    return { success: true };
  };

  // Admin Override / Update Staff Attendance
  const adminUpdateStaffAttendance = (staffId, newStatus, note, adminActor) => {
    setData((prev) => ({
      ...prev,
      users: (prev.users || []).map((u) => {
        if (u.staffId === staffId || u.id === staffId) {
          const isCheckIn = newStatus === 'Checked In';
          return {
            ...u,
            attendance: {
              ...(u.attendance || {}),
              status: newStatus,
              clockInTime: isCheckIn ? '09:30 AM' : (u.attendance?.clockInTime || '09:30 AM'),
              countdownEndTimestamp: isCheckIn ? Date.now() + 6 * 3600 * 1000 : null
            }
          };
        }
        return u;
      }),
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: 'Staff Attendance Administrative Override',
          actor: adminActor?.name || 'Rohit Meena (Admin)',
          target: staffId,
          details: `Status set to '${newStatus}' by Executive Admin. Note: ${note || 'Verified'}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        },
        ...(prev.auditLogs || [])
      ]
    }));
    return { success: true };
  };

  // Reset to default
  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(INITIAL_DATA);
    apiCall('/api/reset', 'POST', {});
  };

  return (
    <DataContext.Provider
      value={{
        company: data.company,
        users: data.users || [],
        groups: data.groups || [],
        deposits: data.deposits || [],
        loanApplications: data.loanApplications || [],
        applications: data.loanApplications || [],
        complaints: data.complaints || [],
        staffTickets: data.staffTickets || [],
        notifications: data.notifications || [],
        auditLogs: data.auditLogs || [],
        passwordResetRequests: data.passwordResetRequests || [],
        delegatedAdmins: data.delegatedAdmins || [],
        dbStatus,
        recordDeposit,
        recordEmiCollection,
        applyCustomerLoan,
        assistCustomerLoan,
        updateLoanStatus,
        createGroup,
        addCustomerToGroup,
        submitStaffTicket,
        submitApplication,
        registerCustomer,
        createDirectCustomer: registerCustomer,
        approveAndCreateCustomer: updateLoanStatus,
        toggleStaffAttendance,
        adminUpdateStaffAttendance,
        submitComplaint,
        createStaff,
        toggleUserStatus,
        setUserAuthority,
        updateUserProfileData,
        resetUserPassword,
        requestPasswordReset,
        grantDelegatedAdmin,
        revokeDelegatedAdmin,
        resetToDefault,
        refreshData: fetchBackendData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
