import mongoose from 'mongoose';

const staffTicketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, default: 'Operations Discrepancy' },
    priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
    description: { type: String, required: true },
    status: { type: String, default: 'Submitted to Admin' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    resolution: { type: String, default: 'Queued for Executive Admin Rohit Meena review' }
  },
  { timestamps: true }
);

export const StaffTicket = mongoose.models.StaffTicket || mongoose.model('StaffTicket', staffTicketSchema);
export default StaffTicket;
