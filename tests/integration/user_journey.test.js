import { describe, it } from 'node:test';
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

describe('Complete End-to-End User Journeys & Ledger Lifecycle', () => {
  const uniqueId = Date.now();
  const testCustomerEmail = `journey.cust.${uniqueId}@rprcapital.in`;
  const testPassword = 'JourneyPassword#2026';
  let createdCustomerId = null;
  let createdUserInternalId = null;
  let createdLoanAppId = null;

  it('Step 1: Customer registers account with initial deposit of ₹20,000', async () => {
    const regRes = await req('/api/customers', {
      method: 'POST',
      body: JSON.stringify({
        formData: {
          name: 'Rameshwar Meena',
          email: testCustomerEmail,
          phone: '+91 98295 99887',
          password: testPassword,
          address: 'Village Jamawaramgarh, Ward 2, Jaipur',
          initialDeposit: 20000,
          accountType: 'Pay Reserve & Loan Account',
          panNumber: 'RAMPM1234K'
        },
        authorizedBy: { name: 'Pooja Sharma', role: 'staff' }
      })
    });
    assert.strictEqual(regRes.status, 200);
    assert.strictEqual(regRes.data.success, true);
    assert.strictEqual(typeof regRes.data.customer.customerId, 'string');
    createdCustomerId = regRes.data.customer.customerId;
    createdUserInternalId = regRes.data.customer.id;
    assert.strictEqual(regRes.data.customer.savings.currentBalance, 20000);
  });

  it('Step 2: Customer authenticates using new credentials and gets profile', async () => {
    const loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testCustomerEmail,
        password: testPassword
      })
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.success, true);
    assert.strictEqual(loginRes.data.user.customerId, createdCustomerId);
    assert.strictEqual(loginRes.data.user.role, 'customer');
  });

  it('Step 3: Staff logs counter deposit of ₹10,000 into customer savings reserve', async () => {
    const depRes = await req('/api/deposits', {
      method: 'POST',
      body: JSON.stringify({
        customerId: createdCustomerId,
        amount: 10000,
        mode: 'Cash (Jamawaramgarh Counter)',
        txnRef: `DEP/JMW/${uniqueId}`,
        receivedBy: { name: 'Pooja Sharma', role: 'staff', id: 'usr_staff_1' }
      })
    });
    assert.strictEqual(depRes.status, 200);
    assert.strictEqual(depRes.data.success, true);
    assert.strictEqual(typeof depRes.data.receiptNumber, 'string');
    assert.strictEqual(depRes.data.customer.savings.currentBalance, 30000);
  });

  it('Step 4: Customer applies for a Loan of ₹1,00,000', async () => {
    const loanRes = await req('/api/loans/apply', {
      method: 'POST',
      body: JSON.stringify({
        applicationData: {
          customerId: createdCustomerId,
          applicantName: 'Rameshwar Meena',
          mobile: '+91 98295 99887',
          address: 'Village Jamawaramgarh, Ward 2, Jaipur',
          requestedAmount: 100000,
          purpose: 'Tractor Attachment & Farm Reserve',
          tenureMonths: 24
        },
        creator: { name: 'Rameshwar Meena', role: 'customer' }
      })
    });
    assert.strictEqual(loanRes.status, 200);
    assert.strictEqual(loanRes.data.success, true);
    assert.strictEqual(typeof loanRes.data.application.id, 'string');
    createdLoanAppId = loanRes.data.application.id;
    assert.strictEqual(loanRes.data.application.status, 'Submitted');
  });

  it('Step 5: Staff verifies physical documents and forwards application to Admin', async () => {
    const fwdRes = await req(`/api/loans/${createdLoanAppId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Under Review',
        reviewer: { name: 'Pooja Sharma', role: 'staff' },
        note: 'Field inspection completed, forward to Rohit Meena'
      })
    });
    assert.strictEqual(fwdRes.status, 200);
    assert.strictEqual(fwdRes.data.success, true);
    assert.strictEqual(fwdRes.data.application.status, 'Under Review');
  });

  it('Step 6: Admin Rohit Meena sanctions and approves loan', async () => {
    const apprRes = await req(`/api/loans/${createdLoanAppId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Approved',
        reviewer: { name: 'Rohit Meena', role: 'admin' },
        note: 'Sanction approved by Admin Rohit Meena'
      })
    });
    assert.strictEqual(apprRes.status, 200);
    assert.strictEqual(apprRes.data.success, true);
    assert.strictEqual(apprRes.data.application.status, 'Approved');
  });

  it('Step 7: Staff collects first monthly EMI installment of ₹4,580', async () => {
    const emiRes = await req('/api/collections/emi', {
      method: 'POST',
      body: JSON.stringify({
        customerId: createdCustomerId,
        amount: 4580,
        mode: 'Cash (Jamawaramgarh Counter)',
        txnRef: `EMI/REC/${uniqueId}`,
        receivedBy: { name: 'Pooja Sharma', role: 'staff' },
        note: 'Installment 1 of 24'
      })
    });
    assert.strictEqual(emiRes.status, 200);
    assert.strictEqual(emiRes.data.success, true);
    assert.strictEqual(typeof emiRes.data.receiptNumber, 'string');
  });
});
