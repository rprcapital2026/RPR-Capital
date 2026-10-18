// Enhanced Mock Data for RPR : Rajasthan Pay Reserve Capital
// Modeled strictly after official specifications (Customer, Staff & Admin portals)

export const INITIAL_DATA = {
  company: {
    name: "RPR : Rajasthan Pay Reserve Capital",
    shortName: "RPR Capital",
    tagline: "Finance & Capital Reserve Services",
    owner: {
      name: "ROHIT MEENA",
      title: "Owner & Founder",
      bio: "Owner of RPR : Rajasthan Pay Reserve Capital. Executive oversight over all company operations, staff underwriting, and customer account allocations.",
      email: "rohitmeena@rprcapital.com"
    },
    contactEmail: "contact@rprcapital.in",
    branch: "Jamawaramgarh Branch, Jaipur, Rajasthan",
    reserveFundSize: "₹50,00,000",
    emailOnlyNotice: "Official correspondence strictly via email."
  },

  // Groups for Self-Help & Community Credit
  groups: [
    {
      id: "GRP-JAMWA-01",
      name: "Jamwa Mahila & Farmer Vikas Samooh",
      village: "Jamawaramgarh, Jaipur",
      leaderName: "Vikram Singh",
      leaderId: "RPR-CUST-8021",
      memberCount: 6,
      totalGroupDeposit: 420000,
      totalGroupLoan: 650000,
      meetingDay: "First Monday of Month",
      status: "Active",
      createdAt: "2024-03-01"
    },
    {
      id: "GRP-JAMWA-02",
      name: "Aravalli Artisans & Handloom Group",
      village: "Nayavas, Jamawaramgarh",
      leaderName: "Sunita Choudhary",
      leaderId: "RPR-CUST-9142",
      memberCount: 4,
      totalGroupDeposit: 280000,
      totalGroupLoan: 400000,
      meetingDay: "Second Thursday of Month",
      status: "Active",
      createdAt: "2024-04-10"
    }
  ],

  // Users for Authentication (Customer, Staff, Admin)
  users: [
    {
      id: "usr_admin_1",
      name: "Rohit Meena",
      email: "admin@rprcapital.in",
      password: "admin123",
      role: "admin",
      title: "Company Owner & Super Admin",
      avatarBg: "gradient-admin",
      status: "Active",
      branch: "Executive HQ / Jamawaramgarh Central",
      createdAt: "2024-01-01"
    },
    {
      id: "usr_staff_1",
      name: "Pooja Sharma",
      email: "staff@rprcapital.in",
      password: "staff123",
      role: "staff",
      staffId: "STF-JMW-01",
      title: "Senior Field & Underwriting Officer",
      department: "Customer Verification & Credit Desk",
      branch: "Jamawaramgarh Branch, Jaipur",
      avatarBg: "gradient-staff",
      status: "Active",
      attendance: {
        status: "Checked In",
        clockInTime: "09:30 AM",
        shiftDurationHours: 8,
        countdownEndTimestamp: Date.now() + 5.5 * 60 * 60 * 1000, // 5.5 hours remaining
        totalDaysPresent: 24,
        totalDaysLeave: 1,
        history: [
          { date: "2026-10-18", in: "09:30 AM", out: "In Progress", hours: "5.5h remaining", branch: "Jamawaramgarh Central Desk", status: "Active Duty" },
          { date: "2026-10-17", in: "09:28 AM", out: "05:32 PM", hours: "8.0h", branch: "Jamawaramgarh Central Desk", status: "Verified & Approved" },
          { date: "2026-10-16", in: "09:35 AM", out: "05:40 PM", hours: "8.1h", branch: "Nayavas Field Camp", status: "Verified & Approved" },
          { date: "2026-10-15", in: "09:30 AM", out: "05:30 PM", hours: "8.0h", branch: "Jamawaramgarh Central Desk", status: "Verified & Approved" },
          { date: "2026-10-14", in: "09:25 AM", out: "05:35 PM", hours: "8.1h", branch: "Jamawaramgarh Central Desk", status: "Verified & Approved" },
          { date: "2026-10-13", in: "09:31 AM", out: "05:30 PM", hours: "8.0h", branch: "Gopalgarh Village Center", status: "Verified & Approved" }
        ]
      },
      performance: {
        customersAdded: 16,
        kycPending: 2,
        totalDepositsCollected: 385000,
        loanApplicationsForwarded: 9,
        monthlyDepositsTarget: 500000,
        customerOnboardingTarget: 20,
        collectionEfficiency: 98.4,
        rating: 4.9
      },
      createdAt: "2024-02-15"
    },
    {
      id: "usr_cust_1",
      name: "Vikram Singh",
      email: "vikram@rprcapital.in",
      password: "password123",
      role: "customer",
      customerId: "RPR-CUST-8021",
      accountNumber: "RPR-ACC-100821",
      accountType: "Pay Reserve & Loan Account",
      phone: "+91 98290 12345",
      address: "Village Jamawaramgarh, Ward No. 4, Jaipur, Rajasthan - 303109",
      branch: "Jamawaramgarh Branch, Jaipur",
      idProof: {
        type: "Aadhaar Card",
        number: "•••• •••• 8821",
        pan: "ABCPS1234F",
        status: "Verified & Approved"
      },
      bankDetails: {
        bankName: "State Bank of India (Jamawaramgarh)",
        accountNumber: "••••••••5678",
        ifsc: "SBIN0031201"
      },
      savings: {
        totalDeposit: 185000, // Total deposits
        totalWithdrawn: 45000, // Total withdrawn
        currentBalance: 140000, // Current balance
        planName: "Monthly Recurring Reserve Deposit Plan"
      },
      loans: {
        activeLoan: 350000, // Active loan
        sanctionedAmount: 500000, // Sanctioned amount
        outstanding: 240000, // Outstanding balance
        interestRate: 10.5,
        monthlyEmi: 18500, // Monthly installment
        nextPaymentDate: "2026-11-05",
        status: "Active Repayment"
      },
      group: {
        groupId: "GRP-JAMWA-01",
        groupName: "Jamwa Mahila & Farmer Vikas Samooh",
        role: "Group Leader",
        connectedCustomers: [
          {
            name: "Surendra Meena",
            customerId: "RPR-CUST-8045",
            accountNumber: "RPR-ACC-100845",
            joinedThrough: "Referred by Vikram Singh",
            joinedDate: "2026-08-14",
            village: "Jamawaramgarh",
            savings: 65000,
            activeLoan: 120000,
            status: "Active"
          },
          {
            name: "Kailash Gurjar",
            customerId: "RPR-CUST-8092",
            accountNumber: "RPR-ACC-100892",
            joinedThrough: "Referred by Vikram Singh",
            joinedDate: "2026-09-02",
            village: "Jamawaramgarh",
            savings: 48000,
            activeLoan: 80000,
            status: "Active"
          },
          {
            name: "Radhe Shyam Sharma",
            customerId: "RPR-CUST-8110",
            accountNumber: "RPR-ACC-100910",
            joinedThrough: "Group Co-applicant",
            joinedDate: "2026-09-20",
            village: "Jamawaramgarh",
            savings: 72000,
            activeLoan: 150000,
            status: "Active"
          }
        ]
      },
      kycStatus: "Verified",
      status: "Active",
      createdAt: "2024-04-12",
      createdBy: "Rohit Meena (Admin)"
    },
    {
      id: "usr_cust_2",
      name: "Sunita Choudhary",
      email: "sunita@example.com",
      password: "cust123",
      role: "customer",
      customerId: "RPR-CUST-9142",
      accountNumber: "RPR-ACC-100914",
      accountType: "Artisan Growth Reserve Account",
      phone: "+91 94140 55432",
      address: "Nayavas, Jamawaramgarh Tehsil, Jaipur - 303109",
      branch: "Jamawaramgarh Branch, Jaipur",
      idProof: {
        type: "Aadhaar Card",
        number: "•••• •••• 4920",
        pan: "XYZPC5678K",
        status: "Verified & Approved"
      },
      bankDetails: {
        bankName: "Bank of Baroda (Nayavas Branch)",
        accountNumber: "••••••••3319",
        ifsc: "BARB0JAMWAX"
      },
      savings: {
        totalDeposit: 95000,
        totalWithdrawn: 15000,
        currentBalance: 80000,
        planName: "Weekly Handloom Reserve Scheme"
      },
      loans: {
        activeLoan: 180000,
        sanctionedAmount: 250000,
        outstanding: 110000,
        interestRate: 11.0,
        monthlyEmi: 12200,
        nextPaymentDate: "2026-11-10",
        status: "Active Repayment"
      },
      group: {
        groupId: "GRP-JAMWA-02",
        groupName: "Aravalli Artisans & Handloom Group",
        role: "Group Leader",
        connectedCustomers: [
          {
            name: "Kamla Devi",
            customerId: "RPR-CUST-9155",
            accountNumber: "RPR-ACC-100955",
            joinedThrough: "Referred by Sunita Choudhary",
            joinedDate: "2026-07-10",
            village: "Nayavas",
            savings: 42000,
            activeLoan: 60000,
            status: "Active"
          }
        ]
      },
      kycStatus: "Verified",
      status: "Active",
      createdAt: "2024-05-18",
      createdBy: "Pooja Sharma (Staff)"
    }
  ],

  // Deposit ledger transactions (Pesa Jama / Nikala / Digital Passbook)
  deposits: [
    {
      id: "DEP-101",
      customerId: "RPR-CUST-8021",
      customerName: "Vikram Singh",
      accountNumber: "RPR-ACC-100821",
      amount: 25000,
      type: "Deposit",
      date: "2026-10-12",
      mode: "UPI / Bank Transfer",
      txnRef: "UPI/RPR/20261012/9921",
      receivedBy: "Pooja Sharma (Staff)",
      receiptNumber: "RCPT-JMW-2026-881",
      balanceAfter: 140000
    },
    {
      id: "DEP-100",
      customerId: "RPR-CUST-8021",
      customerName: "Vikram Singh",
      accountNumber: "RPR-ACC-100821",
      amount: -10000,
      type: "Withdrawal",
      date: "2026-09-28",
      mode: "Branch Counter Cheque",
      txnRef: "WTH/RPR/20260928/1102",
      receivedBy: "Pooja Sharma (Staff)",
      receiptNumber: "RCPT-JMW-2026-790",
      balanceAfter: 115000
    },
    {
      id: "DEP-099",
      customerId: "RPR-CUST-8021",
      customerName: "Vikram Singh",
      accountNumber: "RPR-ACC-100821",
      amount: 40000,
      type: "Deposit",
      date: "2026-09-15",
      mode: "Cash at Jamawaramgarh Desk",
      txnRef: "CSH/RPR/20260915/4431",
      receivedBy: "Pooja Sharma (Staff)",
      receiptNumber: "RCPT-JMW-2026-720",
      balanceAfter: 125000
    },
    {
      id: "DEP-098",
      customerId: "RPR-CUST-9142",
      customerName: "Sunita Choudhary",
      accountNumber: "RPR-ACC-100914",
      amount: 15000,
      type: "Deposit",
      date: "2026-10-10",
      mode: "UPI Collection",
      txnRef: "UPI/RPR/20261010/7723",
      receivedBy: "Pooja Sharma (Staff)",
      receiptNumber: "RCPT-JMW-2026-870",
      balanceAfter: 80000
    }
  ],

  // Loan Applications matching Image 2 workflow:
  // Draft -> Submitted -> Under Review -> More Information Required -> Approved / Rejected
  loanApplications: [
    {
      id: "LN-APP-201",
      customerId: "RPR-CUST-8021",
      applicantName: "Vikram Singh",
      mobile: "+91 98290 12345",
      dob: "1988-06-15",
      address: "Ward No. 4, Jamawaramgarh, Jaipur",
      pinCode: "303109",
      occupationIncome: "Agricultural Logistics & Cold Transport — ₹45,000 / month",
      requestedAmount: 200000,
      purpose: "Solar Water Pumping & Crop Storage Expansion",
      tenureMonths: 24,
      documentsSubmitted: "Aadhaar Card, PAN Card, Land Jamabandi Slip",
      submittedDate: "2026-10-09",
      status: "Under Review", // Draft | Submitted | Under Review | More Information Required | Approved | Rejected
      statusHistory: [
        { status: "Draft", date: "2026-10-08", note: "Customer filled initial inquiry" },
        { status: "Submitted", date: "2026-10-09", note: "Submitted online via Customer Portal" },
        { status: "Under Review", date: "2026-10-11", note: "Pooja Sharma verified field documents and forwarded to Admin (Rohit Meena)" }
      ],
      disbursalStatus: "Pending Admin Final Sanction"
    },
    {
      id: "LN-APP-202",
      customerId: "RPR-CUST-9142",
      applicantName: "Sunita Choudhary",
      mobile: "+91 94140 55432",
      dob: "1992-03-22",
      address: "Nayavas, Jamawaramgarh",
      pinCode: "303109",
      occupationIncome: "Handloom Weaving & Stitching — ₹28,000 / month",
      requestedAmount: 100000,
      purpose: "Purchase of 2 Electronic Sewing Machines & Dyeing Vat",
      tenureMonths: 18,
      documentsSubmitted: "Aadhaar Card, Bank Passbook copy",
      submittedDate: "2026-10-01",
      status: "Approved",
      statusHistory: [
        { status: "Draft", date: "2026-09-30", note: "Draft created" },
        { status: "Submitted", date: "2026-10-01", note: "Submitted" },
        { status: "Under Review", date: "2026-10-03", note: "Staff review complete" },
        { status: "Approved", date: "2026-10-05", note: "Sanctioned by Admin Rohit Meena" }
      ],
      disbursalStatus: "Disbursed to Account"
    }
  ],

  // Customer Help & Complaints
  complaints: [
    {
      id: "CMP-401",
      customerId: "RPR-CUST-8021",
      customerName: "Vikram Singh",
      subject: "Passbook Digital Receipt Download Inquiry",
      category: "Passbook & Receipts",
      description: "Inquiry regarding passbook digital receipt PDF download for September deposit.",
      date: "2026-10-11",
      status: "Resolved",
      reply: "Receipt generated and available in your Downloads section. - Jamawaramgarh Staff"
    }
  ],

  // Notifications for Customer & Staff
  notifications: [
    {
      id: "NTF-101",
      targetUserId: "usr_cust_1",
      title: "Monthly EMI Reminder",
      message: "Your monthly loan installment of ₹18,500 is due on Nov 05, 2026.",
      date: "2026-10-15",
      type: "payment",
      read: false
    },
    {
      id: "NTF-102",
      targetUserId: "usr_cust_1",
      title: "Loan Application Status Updated",
      message: "Your loan application LN-APP-201 is now under review by underwriting.",
      date: "2026-10-11",
      type: "status",
      read: true
    }
  ],

  // Audit Logs (Staff entries cannot be deleted, logged strictly)
  auditLogs: [
    {
      id: "LOG-901",
      action: "Deposit Recorded",
      actor: "Pooja Sharma (Staff)",
      target: "Vikram Singh (RPR-ACC-100821)",
      details: "Deposit of ₹25,000 logged with receipt RCPT-JMW-2026-881",
      timestamp: "2026-10-12 11:20"
    },
    {
      id: "LOG-902",
      action: "Staff Attendance Clock-In",
      actor: "Pooja Sharma (Staff)",
      target: "STF-JMW-01",
      details: "Duty logged in at Jamawaramgarh Branch at 09:30 AM",
      timestamp: "2026-10-17 09:30"
    },
    {
      id: "LOG-903",
      action: "Loan Sanction Review",
      actor: "Rohit Meena (Admin)",
      target: "LN-APP-201",
      details: "Admin inspected underwriting file for Vikram Singh",
      timestamp: "2026-10-14 16:45"
    }
  ],

  // Staff Internal Escalation Tickets to Admin
  staffTickets: [
    {
      id: "TCK-JMW-101",
      staffId: "STF-JMW-01",
      staffName: "Pooja Sharma",
      subject: "Biometric KYC scanner firmware upgrade required",
      category: "Hardware / IT Desk",
      priority: "Normal",
      description: "Counter biometric fingerprint scanner occasionally prompts timeout during farmer Aadhaar e-KYC authentication.",
      status: "Resolved",
      date: "2026-10-14",
      resolution: "Scanner driver patched by Jaipur Tech Desk. Verified operational."
    },
    {
      id: "TCK-JMW-102",
      staffId: "STF-JMW-01",
      staffName: "Pooja Sharma",
      subject: "Physical Land Jamabandi Record Verification for LN-APP-201",
      category: "Underwriting Clearance",
      priority: "High",
      description: "Submitted solar pumping loan dossier for Vikram Singh (₹2,00,000) with tehsil revenue patwari seal for Admin Rohit Meena final sanction signature.",
      status: "In Review by Admin",
      date: "2026-10-16",
      resolution: "Admin Rohit Meena reviewing land revenue records and sanction limit."
    }
  ],

  // Inbound Password Reset Requests (Queued for Admin Rohit Meena)
  passwordResetRequests: [
    {
      id: "PR-REQ-101",
      userId: "usr_cust_2",
      userName: "Sunita Choudhary",
      userEmail: "sunita@example.com",
      userRole: "customer",
      accountOrId: "RPR-CUST-9142",
      requestDate: "2026-10-18 10:15 AM",
      reason: "Forgot password after phone upgrade. Please issue temporary login.",
      status: "Pending Admin Action"
    }
  ],

  // Delegated Admin Access (Profile Sharing with Staff by Rohit Meena)
  delegatedAdmins: [
    {
      id: "DLG-ADM-01",
      staffId: "STF-JMW-01",
      staffName: "Pooja Sharma",
      staffEmail: "staff@rprcapital.in",
      accessLevel: "Operations Manager (Limited Admin)",
      permissions: ["Customer Directory & KYC Audit", "Loan Underwriting Clearance", "Attendance Log Review"],
      grantedBy: "Rohit Meena (Executive Admin)",
      grantedDate: "2026-10-10",
      validTill: "2026-12-31",
      tokenPasskey: "DLG-JMW-8821",
      status: "Active"
    }
  ]
};
