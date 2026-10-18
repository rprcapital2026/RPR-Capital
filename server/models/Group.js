import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    village: { type: String, required: true },
    leaderName: { type: String, default: 'To Be Nominated' },
    leaderId: { type: String, default: 'N/A' },
    memberCount: { type: Number, default: 1 },
    totalGroupDeposit: { type: Number, default: 0 },
    totalGroupLoan: { type: Number, default: 0 },
    meetingDay: { type: String, default: 'First Monday of Month' },
    status: { type: String, default: 'Active' },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  { timestamps: true }
);

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
export default Group;
