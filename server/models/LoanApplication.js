import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, index: true },
    applicantName: { type: String, required: true },
    mobile: { type: String, required: true },
    dob: { type: String, default: '1990-01-01' },
    address: { type: String, required: true },
    pinCode: { type: String, default: '303109' },
    occupationIncome: { type: String, default: 'Agriculture / Micro-enterprise' },
    requestedAmount: { type: Number, required: true },
    purpose: { type: String, required: true },
    tenureMonths: { type: Number, default: 24 },
    documentsSubmitted: { type: String, default: 'Aadhaar Card, PAN Card' },
    inspectionNotes: { type: String },
    submittedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'More Information Required', 'Approved', 'Rejected'],
      default: 'Submitted'
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: String },
        note: { type: String }
      }
    ],
    disbursalStatus: { type: String, default: 'Pending Verification by Jamawaramgarh Staff' }
  },
  { timestamps: true }
);

export const LoanApplication = mongoose.models.LoanApplication || mongoose.model('LoanApplication', loanApplicationSchema);
export default LoanApplication;
