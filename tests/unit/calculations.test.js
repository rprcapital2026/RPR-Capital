import { describe, it } from 'node:test';
import assert from 'node:assert';

// 1. EMI Formula Calculation
function calculateEmi(principal, annualRate, tenureMonths) {
  if (!principal || !tenureMonths || principal <= 0 || tenureMonths <= 0) return 0;
  if (!annualRate || annualRate <= 0) return Math.round(principal / tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

// 2. numberToWords (as used in StaffDashboard)
function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(Math.abs(num))).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

// 3. Validation utilities
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function validatePan(pan) {
  if (!pan || typeof pan !== 'string') return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

describe('Unit Tests: Financial Calculations & Validators', () => {
  it('correctly calculates EMI for standard loan: 15 Lakhs, 24 months, 10.5% APR', () => {
    const principal = 1500000;
    const rate = 10.5;
    const tenure = 24;
    const emi = calculateEmi(principal, rate, tenure);
    
    // Formula verification: standard banking amortization
    assert.strictEqual(emi > 69000 && emi < 70000, true, `Calculated EMI ${emi} out of expected range`);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;
    assert.strictEqual(totalInterest > 0, true);
    assert.strictEqual(totalPayment > principal, true);
  });

  it('handles boundary conditions for zero and negative EMI inputs', () => {
    assert.strictEqual(calculateEmi(0, 10.5, 24), 0);
    assert.strictEqual(calculateEmi(-5000, 10.5, 24), 0);
    assert.strictEqual(calculateEmi(100000, 0, 10), 10000); // 0% rate is principal / tenure
  });

  it('correctly converts Indian currency numbers to words', () => {
    assert.strictEqual(numberToWords(0), 'Zero Rupees');
    assert.strictEqual(numberToWords(10000), 'Ten Thousand Rupees Only');
    assert.strictEqual(numberToWords(150000), 'One Lakh Fifty Thousand Rupees Only');
    assert.strictEqual(numberToWords(5000000), 'Fifty Lakh Rupees Only');
    assert.strictEqual(numberToWords(10000000), 'One Crore Rupees Only');
  });

  it('validates legal email addresses strictly', () => {
    assert.strictEqual(validateEmail('admin@rprcapital.in'), true);
    assert.strictEqual(validateEmail('customer.name+test@domain.co.in'), true);
    assert.strictEqual(validateEmail('invalid-email'), false);
    assert.strictEqual(validateEmail('user@'), false);
    assert.strictEqual(validateEmail('@domain.com'), false);
    assert.strictEqual(validateEmail(''), false);
    assert.strictEqual(validateEmail(null), false);
  });

  it('validates Indian 10-digit mobile numbers with optional country code', () => {
    assert.strictEqual(validatePhone('+91 98290 12345'), true);
    assert.strictEqual(validatePhone('9829012345'), true);
    assert.strictEqual(validatePhone('09829012345'), true);
    assert.strictEqual(validatePhone('12345'), false);
    assert.strictEqual(validatePhone('abcdefghij'), false);
    assert.strictEqual(validatePhone(''), false);
  });

  it('validates official Indian PAN Card format (5 letters, 4 digits, 1 letter)', () => {
    assert.strictEqual(validatePan('ABCPS1234F'), true);
    assert.strictEqual(validatePan('abcps1234f'), true); // case normalization
    assert.strictEqual(validatePan('PRPRK9911Z'), true);
    assert.strictEqual(validatePan('ABC123456F'), false);
    assert.strictEqual(validatePan('ABCD12345'), false);
    assert.strictEqual(validatePan('1234567890'), false);
  });
});
