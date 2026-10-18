import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, default: 'cust123' },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    customerId: { type: String, index: true },
    accountNumber: { type: String, index: true },
    accountType: { type: String, default: 'Pay Reserve & Loan Account' },
    phone: { type: String, default: '+91 98000 00000' },
    address: { type: String, default: 'Jamawaramgarh, Jaipur' },
    branch: { type: String, default: 'Jamawaramgarh Branch, Jaipur' },
    title: { type: String },
    department: { type: String },
    staffId: { type: String, index: true },
    avatarBg: { type: String },
    status: { type: String, default: 'Active' },
    kycStatus: { type: String, default: 'Verified' },
    idProof: {
      type: { type: String, default: 'Aadhaar Card' },
      number: { type: String, default: '•••• •••• 1234' },
      pan: { type: String, default: 'ABCPS1234F' },
      status: { type: String, default: 'Verified & Approved' }
    },
    bankDetails: {
      bankName: { type: String, default: 'State Bank of India' },
      accountNumber: { type: String, default: '••••••••1234' },
      ifsc: { type: String, default: 'SBIN0031201' }
    },
    savings: {
      totalDeposit: { type: Number, default: 0 },
      totalWithdrawn: { type: Number, default: 0 },
      currentBalance: { type: Number, default: 0 },
      planName: { type: String, default: 'Monthly Recurring Reserve Deposit Plan' }
    },
    loans: {
      activeLoan: { type: Number, default: 0 },
      sanctionedAmount: { type: Number, default: 0 },
      outstanding: { type: Number, default: 0 },
      interestRate: { type: Number, default: 10.5 },
      monthlyEmi: { type: Number, default: 0 },
      nextPaymentDate: { type: String, default: '2026-11-15' },
      status: { type: String, default: 'No Active Loan' }
    },
    group: {
      groupId: { type: String, default: 'GRP-JAMWA-01' },
      groupName: { type: String, default: 'Jamwa Mahila & Farmer Vikas Samooh' },
      role: { type: String, default: 'Member' },
      connectedCustomers: { type: Array, default: [] }
    },
    attendance: {
      status: { type: String, default: 'Checked Out' },
      clockInTime: { type: String, default: '09:30 AM' },
      shiftDurationHours: { type: Number, default: 8 },
      countdownEndTimestamp: { type: Number },
      totalDaysPresent: { type: Number, default: 24 },
      totalDaysLeave: { type: Number, default: 1 },
      history: { type: Array, default: [] }
    },
    performance: {
      customersAdded: { type: Number, default: 0 },
      kycPending: { type: Number, default: 0 },
      totalDepositsCollected: { type: Number, default: 0 },
      loanApplicationsForwarded: { type: Number, default: 0 },
      monthlyDepositsTarget: { type: Number, default: 500000 },
      customerOnboardingTarget: { type: Number, default: 20 },
      collectionEfficiency: { type: Number, default: 98.4 },
      rating: { type: Number, default: 4.9 }
    },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    createdBy: { type: String, default: 'System Initializer' }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
