import React, { useState } from 'react';
import { Calculator as CalcIcon, IndianRupee, Clock, Percent, ArrowRight, Check } from 'lucide-react';

export function Calculator({ onApplyWithAmount }) {
  const [amount, setAmount] = useState(1500000);
  const [tenure, setTenure] = useState(24);
  const [rate, setRate] = useState(10.5);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = rate / 12 / 100;
  const emi = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
  );

  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - amount;

  // Alternate calculation: If deposited in Pay Reserve
  const reserveAnnualYield = Math.round(amount * 0.098); // 9.8% p.a.

  return (
    <section id="calculator-section" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Instant Financial Projections</span>
          <h2 className="section-title">
            Capital Reserve & <span className="text-gradient">EMI Simulator</span>
          </h2>
          <p className="section-description">
            Customize your requested capital reserve line and inspect monthly repayment schedules with full transparent interest breakdown.
          </p>
        </div>

        <div className="calc-wrapper">
          <div className="calc-grid">
            {/* Left: Interactive Sliders */}
            <div className="calc-controls">
              {/* Slider 1: Capital Amount */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Capital Reserve Amount</span>
                  <span className="calc-slider-value">
                    ₹{Number(amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>₹1.00 Lakh</span>
                  <span>₹25 Lakhs</span>
                  <span>₹50.00 Lakhs</span>
                </div>
              </div>

              {/* Slider 2: Tenure */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Repayment Tenure</span>
                  <span className="calc-slider-value">{tenure} Months ({Math.round(tenure / 12 * 10) / 10} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>6 Mo</span>
                  <span>24 Mo</span>
                  <span>60 Mo</span>
                </div>
              </div>

              {/* Slider 3: Interest Rate */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Annual Interest Rate (APR)</span>
                  <span className="calc-slider-value" style={{ color: '#1d4ed8' }}>{rate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="8.5"
                  max="18.0"
                  step="0.25"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>8.5% (Prime)</span>
                  <span>12.0%</span>
                  <span>18.0%</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Prepayment Flexibility:</strong> RPR Capital allows complete or partial prepayment of the reserve facility after 3 months with zero foreclosure penalty.
              </div>
            </div>

            {/* Right: Results Card */}
            <div className="calc-summary-box">
              <div className="calc-emi-display">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Estimated Monthly EMI
                </span>
                <div className="calc-emi-number">
                  ₹{Number(emi).toLocaleString('en-IN')}
                </div>
                <span className="calc-emi-tag">Fixed monthly installment for {tenure} months</span>
              </div>

              <div>
                <div className="calc-breakdown-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Principal Loan Amount:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{Number(amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Interest Payable:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{Number(totalInterest).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Repayment Amount:</span>
                  <span style={{ fontWeight: 700, color: '#1d4ed8' }}>₹{Number(totalPayment).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <a
                  href={`mailto:contact@rprcapital.in?subject=Loan%20Finance%20Inquiry%20-%20₹${amount}`}
                  className="btn btn-primary"
                  style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                >
                  📩 Inquire via Email for ₹{Number(amount).toLocaleString('en-IN')} <ArrowRight size={16} />
                </a>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Official Email: contact@rprcapital.in (Strictly Verified Correspondence)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
