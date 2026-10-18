import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    accountNumber: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Deposit', 'Withdrawal', 'EMI Repayment'], default: 'Deposit' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    mode: { type: String, default: 'Cash (Jamawaramgarh Counter)' },
    txnRef: { type: String, required: true },
    receivedBy: { type: String, default: 'Staff Officer' },
    receiptNumber: { type: String, required: true, unique: true },
    balanceAfter: { type: Number, required: true },
    note: { type: String }
  },
  { timestamps: true }
);

export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
export default Deposit;
