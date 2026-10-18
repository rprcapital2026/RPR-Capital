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

describe('Authentication & Security Audits', () => {
  it('rejects login with arbitrary passwords on admin account (enforces strict password match)', async () => {
    // Should NOT allow 'password123' on admin@rprcapital.in
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@rprcapital.in', password: 'password123' })
    });
    assert.strictEqual(res.status, 401, 'Admin login with wrong password must return HTTP 401');
    assert.strictEqual(res.data.success, false);
  });

  it('verifies that login does not leak password in user response payload', async () => {
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@rprcapital.in', password: 'admin123' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.password, undefined, 'User password MUST NOT be returned in API response');
  });

  it('rejects suspended/frozen accounts from logging in', async () => {
    // 1. First freeze customer
    await req('/api/users/usr_cust_1/status', {
      method: 'PUT',
      body: JSON.stringify({ actor: { name: 'Rohit Meena', role: 'admin' } })
    });

    try {
      // Verify user is frozen
      const syncRes = await req('/api/data');
      const cust = syncRes.data.data.users.find(u => u.id === 'usr_cust_1');
      assert.strictEqual(cust.status, 'Suspended/Frozen');

      // Attempt login as frozen user
      const loginRes = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'vikram@rprcapital.in', password: 'password123' })
      });
      assert.strictEqual(loginRes.status, 403, 'Suspended user must be rejected with HTTP 403');
      assert.strictEqual(loginRes.data.success, false);
    } finally {
      // Always unfreeze user back to Active
      await req('/api/users/usr_cust_1/status', {
        method: 'PUT',
        body: JSON.stringify({ actor: { name: 'Rohit Meena', role: 'admin' } })
      });
    }
  });

  it('prevents staff officers from sanctioning loans', async () => {
    const syncRes = await req('/api/data');
    const loanApp = syncRes.data.data.loanApplications[0];
    assert.strictEqual(!!loanApp, true, 'At least one loan application must exist');

    const res = await req(`/api/loans/${loanApp.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Approved',
        reviewer: { name: 'Pooja Sharma', role: 'staff' },
        note: 'Staff attempting to sanction without admin approval'
      })
    });
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message.includes('Security Policy Violation'), true);
  });
});
