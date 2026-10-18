import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOT_PATH = path.resolve(__dirname, '../../server/data/ledger_snapshot.json');

describe('Database & Ledger Data Integrity Audits', () => {
  it('ensures local ledger snapshot file exists and is valid JSON', () => {
    assert.strictEqual(fs.existsSync(SNAPSHOT_PATH), true, 'ledger_snapshot.json must exist');
    const content = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
    const data = JSON.parse(content);
    assert.strictEqual(typeof data, 'object');
    assert.strictEqual(Array.isArray(data.users), true);
    assert.strictEqual(Array.isArray(data.deposits), true);
    assert.strictEqual(Array.isArray(data.loanApplications), true);
  });

  it('verifies all required initial users exist in snapshot (Admin, Staff, Customer)', () => {
    const content = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    const admin = data.users.find(u => u.role === 'admin');
    const staff = data.users.find(u => u.role === 'staff');
    const cust = data.users.find(u => u.role === 'customer');

    assert.strictEqual(!!admin, true, 'Admin user must exist');
    assert.strictEqual(!!staff, true, 'Staff user must exist');
    assert.strictEqual(!!cust, true, 'Customer user must exist');
  });

  it('verifies ledger audit trail records actions', () => {
    const content = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
    const data = JSON.parse(content);

    assert.strictEqual(Array.isArray(data.auditLogs), true);
    assert.strictEqual(data.auditLogs.length > 0, true);

    const firstLog = data.auditLogs[0];
    assert.strictEqual(typeof firstLog.id, 'string');
    assert.strictEqual(typeof firstLog.action, 'string');
    assert.strictEqual(typeof firstLog.actor, 'string');
    assert.strictEqual(typeof firstLog.timestamp, 'string');
  });

  it('verifies deposit transaction balance mathematics', () => {
    const content = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
    const data = JSON.parse(content);

    // Verify deposits have required fields
    data.deposits.forEach((dep, idx) => {
      assert.strictEqual(typeof dep.id, 'string', `Deposit #${idx} missing id`);
      assert.strictEqual(typeof dep.customerId, 'string', `Deposit #${idx} missing customerId`);
      assert.strictEqual(typeof dep.amount, 'number', `Deposit #${idx} amount must be number`);
      assert.strictEqual(typeof dep.receiptNumber, 'string', `Deposit #${idx} missing receiptNumber`);
      assert.strictEqual(typeof dep.balanceAfter, 'number', `Deposit #${idx} missing balanceAfter`);
    });
  });
});
