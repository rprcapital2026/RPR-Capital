import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    actor: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
