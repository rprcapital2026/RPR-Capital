import express from 'express';
import {
  getAllSystemData,
  createCustomerAccount,
  recordDepositEntry,
  recordEmiCollectionEntry,
  submitLoanDossier,
  updateLoanApplicationStatus,
  createSelfHelpGroup,
  submitStaffEscalationTicket,
  toggleStaffAttendanceRecord,
  createStaffOfficer,
  toggleUserStatusRecord,
  updateUserProfile,
  recordCustomerComplaint,
  loadSnapshot,
  saveSnapshot
} from '../dataStore.js';
import { getConnectionStatus } from '../config/db.js';
import { INITIAL_DATA } from '../../src/data/mockData.js';

const router = express.Router();

// Helper to sanitize sensitive credentials from user objects before serialization
function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

// 1. Connection & System Status
router.get('/status', (req, res) => {
  const status = getConnectionStatus();
  res.json({
    success: true,
    mongo: status,
    timestamp: new Date().toISOString()
  });
});

// 2. Full System State Sync (Passwords Stripped)
router.get('/data', async (req, res) => {
  try {
    const data = await getAllSystemData();
    const safeUsers = (data.users || []).map(sanitizeUser);
    res.json({
      success: true,
      data: {
        ...data,
        users: safeUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. User Authentication
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid email and password are required.' });
  }

  const data = await getAllSystemData();
  const trimmed = email.trim().toLowerCase();
  const users = data.users || [];

  let found = users.find((u) => u.email && u.email.toLowerCase() === trimmed);
  if (!found) {
    // Check known domain aliases (e.g. .com vs .in)
    const normalizedPrefix = trimmed.split('@')[0];
    found = users.find((u) => u.email && u.email.toLowerCase().split('@')[0] === normalizedPrefix);
  }

  if (!found) {
    return res.status(404).json({ success: false, message: 'Account not found with this email.' });
  }

  if (found.password !== password) {
    return res.status(401).json({ success: false, message: 'Incorrect password.' });
  }

  if (found.status === 'Suspended/Frozen') {
    return res.status(403).json({ success: false, message: 'This account has been restricted by Administration.' });
  }

  res.json({ success: true, user: sanitizeUser(found) });
});

// 4. Register Customer
router.post('/customers', async (req, res) => {
  try {
    const { formData, authorizedBy } = req.body;
    const result = await createCustomerAccount(formData, authorizedBy);
    if (!result.success) {
      const statusCode = result.message?.includes('already registered') ? 409 : 400;
      return res.status(statusCode).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Post Deposit Entry
router.post('/deposits', async (req, res) => {
  try {
    const { customerId, amount, mode, txnRef, receivedBy } = req.body;
    const result = await recordDepositEntry({ customerId, amount, mode, txnRef, receivedBy });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Collect Monthly EMI
router.post('/collections/emi', async (req, res) => {
  try {
    const { customerId, amount, mode, txnRef, receivedBy, note } = req.body;
    const result = await recordEmiCollectionEntry({ customerId, amount, mode, txnRef, receivedBy, note });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Submit Loan Application / Walk-in Assistance
router.post('/loans/apply', async (req, res) => {
  try {
    const { applicationData, creator } = req.body;
    const result = await submitLoanDossier(applicationData, creator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Update Loan Status (Verify & Forward by staff / Sanction by Admin)
router.put('/loans/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer, note } = req.body;
    const result = await updateLoanApplicationStatus(id, status, reviewer, note);
    if (!result.success) {
      const statusCode = result.message?.includes('Security Policy Violation') ? 403 : 404;
      return res.status(statusCode).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Register Self-Help Group
router.post('/groups', async (req, res) => {
  try {
    const { groupData, creator } = req.body;
    const result = await createSelfHelpGroup(groupData, creator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Staff Escalation Ticket to Admin
router.post('/tickets', async (req, res) => {
  try {
    const { ticketData, staff } = req.body;
    const result = await submitStaffEscalationTicket(ticketData, staff);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Staff Attendance Clock In / Out
router.post('/attendance/toggle', async (req, res) => {
  try {
    const { staffUserId } = req.body;
    const result = await toggleStaffAttendanceRecord(staffUserId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Create Staff Officer (by Admin)
router.post('/staff', async (req, res) => {
  try {
    const { staffData, authorizedBy } = req.body;
    const result = await createStaffOfficer(staffData, authorizedBy);
    if (!result.success) {
      const statusCode = result.message?.includes('already registered') ? 409 : 400;
      return res.status(statusCode).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 13. Toggle User Status (Active / Frozen)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;
    const result = await toggleUserStatusRecord(id, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 14. Update User Profile (Customer / Staff / Admin)
router.put('/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;
    const result = await updateUserProfile(id, profileData);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 15. Customer Complaints & Grievance
router.post('/complaints', async (req, res) => {
  try {
    const { complaintData, customer } = req.body;
    const result = await recordCustomerComplaint(complaintData, customer);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 16. Reset to Default Demo Data
router.post('/reset', (req, res) => {
  saveSnapshot(JSON.parse(JSON.stringify(INITIAL_DATA)));
  res.json({ success: true, message: 'Database reset to default template.' });
});

export default router;
