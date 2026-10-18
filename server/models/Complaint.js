import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, default: 'General' },
    description: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    reply: { type: String, default: 'Your complaint has been queued for Jamawaramgarh Branch Desk.' }
  },
  { timestamps: true }
);

export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
export default Complaint;
