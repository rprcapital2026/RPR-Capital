import { describe, it, before } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

describe('API Endpoint Audits & Backend Verification', () => {
  before(async () => {
    // Verify server is reachable
    const health = await req('/health');
    assert.strictEqual(health.status, 200, 'Server must be running on localhost:5000');
  });

  it('1. GET /health returns valid system operational status', async () => {
    const res = await req('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.system, 'RPR Capital Banking & Ledger Engine');
    assert.strictEqual(typeof res.data.timestamp, 'string');
  });

  it('2. GET /api/status returns database connection details and dual-mode state', async () => {
    const res = await req('/api/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.mongo, 'object');
    assert.strictEqual(typeof res.data.mongo.readyState, 'number');
    assert.strictEqual(typeof res.data.timestamp, 'string');
  });

  it('3. GET /api/data returns system collections', async () => {
    const res = await req('/api/data');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(Array.isArray(res.data.data.users), true);
    assert.strictEqual(Array.isArray(res.data.data.deposits), true);
    assert.strictEqual(Array.isArray(res.data.data.loanApplications), true);
    assert.strictEqual(Array.isArray(res.data.data.groups), true);
    assert.strictEqual(Array.isArray(res.data.data.auditLogs), true);
  });

  it('4. POST /api/auth/login validates credentials correctly and rejects bad inputs', async () => {
    // 4a. Empty body
    const emptyRes = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({}) });
    assert.strictEqual(emptyRes.status, 400);
    assert.strictEqual(emptyRes.data.success, false);

    // 4b. Nonexistent account
    const notFoundRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent-user-999@rprcapital.in', password: 'randompassword' })
    });
    assert.strictEqual(notFoundRes.status, 404);

    // 4c. Valid email, wrong password
    const wrongPassRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@rprcapital.in', password: 'definitelyWrongPasswordXYZ!' })
    });
    assert.strictEqual(wrongPassRes.status, 401);
    assert.strictEqual(wrongPassRes.data.success, false);

    // 4d. Valid admin credentials
    const validAdmin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@rprcapital.in', password: 'admin123' })
    });
    assert.strictEqual(validAdmin.status, 200);
    assert.strictEqual(validAdmin.data.success, true);
    assert.strictEqual(validAdmin.data.user.role, 'admin');

    // 4e. Valid staff credentials
    const validStaff = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@rprcapital.in', password: 'staff123' })
    });
    assert.strictEqual(validStaff.status, 200);
    assert.strictEqual(validStaff.data.success, true);
    assert.strictEqual(validStaff.data.user.role, 'staff');

    // 4f. Valid customer credentials
    const validCust = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'vikram@rprcapital.in', password: 'password123' })
    });
    assert.strictEqual(validCust.status, 200);
    assert.strictEqual(validCust.data.success, true);
    assert.strictEqual(validCust.data.user.role, 'customer');
  });

  it('5. POST /api/customers registers a new customer account', async () => {
    const testEmail = `synthetic.test.${Date.now()}@rprtest.in`;
    const res = await req('/api/customers', {
      method: 'POST',
      body: JSON.stringify({
        formData: {
          name: 'Synthetic Test Customer',
          email: testEmail,
          phone: '+91 98299 11223',
          password: 'TestPassword123!',
          address: 'Jamawaramgarh Test Ward, Jaipur',
          initialDeposit: 25000,
          accountType: 'Pay Reserve & Loan Account'
        },
        authorizedBy: { name: 'Admin Rohit Meena', role: 'admin' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.customer.customerId, 'string');
    assert.strictEqual(typeof res.data.customer.accountNumber, 'string');
    assert.strictEqual(res.data.customer.savings.currentBalance, 25000);
  });

  it('6. POST /api/deposits records customer deposit and updates balance', async () => {
    const res = await req('/api/deposits', {
      method: 'POST',
      body: JSON.stringify({
        customerId: 'RPR-CUST-8021',
        amount: 5000,
        mode: 'Cash (Jamawaramgarh Counter)',
        txnRef: `TXN/TEST/${Date.now().toString().slice(-6)}`,
        receivedBy: { name: 'Pooja Sharma', role: 'staff' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.receiptNumber, 'string');
    assert.strictEqual(res.data.deposit.amount, 5000);
  });

  it('7. POST /api/collections/emi records monthly loan EMI installment', async () => {
    const res = await req('/api/collections/emi', {
      method: 'POST',
      body: JSON.stringify({
        customerId: 'RPR-CUST-8021',
        amount: 18500,
        mode: 'Cash (Field Collection)',
        txnRef: `EMI/TEST/${Date.now().toString().slice(-6)}`,
        receivedBy: { name: 'Pooja Sharma', role: 'staff' },
        note: 'October Installment Paid'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.receiptNumber, 'string');
  });

  let createdLoanId = null;

  it('8. POST /api/loans/apply creates a new loan application', async () => {
    const res = await req('/api/loans/apply', {
      method: 'POST',
      body: JSON.stringify({
        applicationData: {
          applicantName: 'Vikram Singh',
          mobile: '+91 98290 12345',
          address: 'Village Jamawaramgarh, Ward No. 4, Jaipur',
          requestedAmount: 150000,
          purpose: 'Agricultural Equipment Reserve',
          tenureMonths: 24
        },
        creator: { name: 'Vikram Singh', role: 'customer' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.application.id, 'string');
    assert.strictEqual(res.data.application.requestedAmount, 150000);
    createdLoanId = res.data.application.id;
  });

  it('9. PUT /api/loans/:id/status enforces staff vs admin sanction policy', async () => {
    // 9a. Staff cannot sanction loan
    const staffAttempt = await req(`/api/loans/${createdLoanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Approved',
        reviewer: { name: 'Pooja Sharma', role: 'staff' },
        note: 'Staff attempting sanction'
      })
    });
    assert.strictEqual(staffAttempt.data.success, false);
    assert.strictEqual(staffAttempt.data.message.includes('Security Policy Violation'), true);

    // 9b. Staff can forward to Under Review
    const staffForward = await req(`/api/loans/${createdLoanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Under Review',
        reviewer: { name: 'Pooja Sharma', role: 'staff' },
        note: 'Staff verified KYC and forwarded'
      })
    });
    assert.strictEqual(staffForward.status, 200);
    assert.strictEqual(staffForward.data.success, true);
  });

  it('10. POST /api/groups creates a new self-help group', async () => {
    const res = await req('/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        groupData: {
          name: `Synthetic Test SHG ${Date.now().toString().slice(-4)}`,
          village: 'Jamawaramgarh',
          leaderName: 'Anita Devi',
          memberCount: 5,
          initialDeposit: 20000,
          meetingDay: 'First Monday of Month'
        },
        creator: { name: 'Pooja Sharma', role: 'staff' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.group.id, 'string');
  });

  it('11. POST /api/tickets submits a staff escalation ticket', async () => {
    const res = await req('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        ticketData: {
          subject: 'Field KYC Document Verification Need',
          category: 'Operations Discrepancy',
          priority: 'Normal',
          description: 'Aadhaar copy requires secondary verification by Admin'
        },
        staff: { name: 'Pooja Sharma', staffId: 'STF-JMW-01' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.ticket.id, 'string');
  });

  it('12. POST /api/attendance/toggle clocks staff in and out', async () => {
    const res = await req('/api/attendance/toggle', {
      method: 'POST',
      body: JSON.stringify({ staffUserId: 'usr_staff_1' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(['Checked In', 'Checked Out'].includes(res.data.attendance.status), true);
  });

  it('13. POST /api/staff creates a new staff officer', async () => {
    const testStaffEmail = `staff.synth.${Date.now()}@rprcapital.in`;
    const res = await req('/api/staff', {
      method: 'POST',
      body: JSON.stringify({
        staffData: {
          name: 'Synthetic Staff Officer',
          email: testStaffEmail,
          password: 'staffSecure123',
          title: 'Field Verification Officer',
          department: 'Credit Operations'
        },
        authorizedBy: { name: 'Rohit Meena', role: 'admin' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.staff.staffId, 'string');
  });

  it('14. PUT /api/users/:id/status toggles user active/frozen state', async () => {
    const res = await req('/api/users/usr_cust_1/status', {
      method: 'PUT',
      body: JSON.stringify({ actor: { name: 'Rohit Meena', role: 'admin' } })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const newStatus = res.data.user.status;
    assert.strictEqual(['Active', 'Suspended/Frozen'].includes(newStatus), true);

    // Toggle back to Active so tests leave user in active state
    if (newStatus === 'Suspended/Frozen') {
      await req('/api/users/usr_cust_1/status', {
        method: 'PUT',
        body: JSON.stringify({ actor: { name: 'Rohit Meena', role: 'admin' } })
      });
    }
  });

  it('15. PUT /api/users/:id/profile updates user contact details without reference errors', async () => {
    const res = await req('/api/users/usr_cust_1/profile', {
      method: 'PUT',
      body: JSON.stringify({
        phone: '+91 98290 12345',
        address: 'Village Jamawaramgarh, Ward No. 4, Jaipur, Rajasthan - 303109'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  it('16. POST /api/complaints submits a customer grievance ticket', async () => {
    const res = await req('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({
        complaintData: {
          subject: 'Passbook transaction inquiry',
          category: 'Deposit / Passbook',
          description: 'Need confirmation on counter deposit receipt'
        },
        customer: { customerId: 'RPR-CUST-8021', name: 'Vikram Singh' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.complaint.id, 'string');
  });

  it('17. POST /api/reset restores database to pristine demo template', async () => {
    const res = await req('/api/reset', { method: 'POST' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });
});
