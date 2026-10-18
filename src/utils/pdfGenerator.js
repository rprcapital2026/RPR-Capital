import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to convert numbers to Indian Currency Words
export function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(Math.abs(num))).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return 'Rupees Only';
  let str = '';
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

// Cached logo base64 for fast rendering without CORS delay
let cachedLogoBase64 = null;
export async function getLogoBase64() {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const res = await fetch('/logo-icon.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoBase64 = reader.result;
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('[PDF] Failed to encode logo as base64:', err);
    return '/logo-icon.png';
  }
}

/**
 * Generate & Download Official Transaction Receipt / Cash Voucher as PDF
 */
export async function generateTransactionSlipPDF(item = {}, customer = {}, staffUser = {}) {
  const logoUrl = await getLogoBase64();

  const receiptNo = item.receiptNumber || `RCPT-JMW-${Date.now().toString().slice(-6)}`;
  const dateStr = item.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const custName = item.customerName || customer.name || 'Valued Account Holder';
  const accNo = item.accountNumber || customer.accountNumber || 'RPR-2026-8801';
  const custId = item.customerId || customer.customerId || 'RPR-CUST-101';
  const rawAmt = Number(item.amount) || 0;
  const isWithdrawal = rawAmt < 0 || (item.type || '').toLowerCase().includes('withdraw');
  const absAmt = Math.abs(rawAmt);
  const formattedAmt = absAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amtWords = numberToWords(absAmt);
  const txnType = item.type || (isWithdrawal ? 'Cash Withdrawal' : 'Savings Deposit');
  const mode = item.mode || 'Cash';
  const txnRef = item.txnRef || `TXN-${Date.now().toString().slice(-8)}`;
  const balanceAfter = item.balanceAfter !== undefined && item.balanceAfter !== null
    ? Number(item.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    : null;
  const receivedBy = item.receivedBy || staffUser.name || 'Pooja Sharma (Staff Officer)';
  const hashUid = `RPR-VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  // Create temporary container with safety margin
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '820px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = "'Inter', 'Segoe UI', Arial, sans-serif";
  container.style.color = '#0f172a';
  container.style.zIndex = '999999';

  container.innerHTML = `
    <div style="background: #ffffff; padding: 14px; box-sizing: border-box;">
      <div style="
        position: relative;
        background: #ffffff;
        padding: 26px 32px 22px 32px;
        box-sizing: border-box;
        border: 3px double #1e3a8a;
        border-radius: 8px;
        overflow: hidden;
        line-height: 1.4;
      ">
        <!-- Watermark Logo Background -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background-image: url('${logoUrl}');
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.08;
          pointer-events: none;
          z-index: 1;
        "></div>

      <!-- Content wrapper -->
      <div style="position: relative; z-index: 2;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${logoUrl}" style="width: 58px; height: 58px; object-fit: contain;" alt="RPR Logo" />
            <div>
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.5px;">RPR</span>
                <span style="font-size: 20px; font-weight: 800; color: #7c3aed;">CAPITAL</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                Rajasthan Pay Reserve Capital
              </div>
              <div style="font-size: 10px; color: #64748b;">
                Jamawaramgarh Regional Hub, Jaipur, Rajasthan - 303109
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a, #7c3aed);
              color: #ffffff;
              padding: 5px 14px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.5px;
            ">
              OFFICIAL CASH VOUCHER
            </div>
            <div style="font-size: 10px; color: #16a34a; font-weight: 800; margin-top: 5px;">
              ● VERIFIED CORE LEDGER ENTRY
            </div>
            <div style="font-size: 9px; color: #94a3b8;">
              Ref: RPR-RJ/FIN-AUTH/2026
            </div>
          </div>
        </div>

        <!-- Metadata Bar -->
        <div style="
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 14px;
          margin: 16px 0;
          font-size: 11px;
        ">
          <div>
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Receipt Number</div>
            <div style="font-weight: 800; color: #1e3a8a; font-family: monospace; font-size: 12px;">${receiptNo}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Transaction Date</div>
            <div style="font-weight: 700; color: #0f172a;">${dateStr}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Payment Mode</div>
            <div style="font-weight: 700; color: #0f172a;">${mode}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Txn Reference</div>
            <div style="font-weight: 700; color: #0f172a; font-family: monospace;">${txnRef}</div>
          </div>
        </div>

        <!-- Customer & Account Information Box -->
        <div style="
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 16px;
        ">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                <td style="padding: 9px 14px; color: #64748b; width: 140px; font-weight: 600;">Customer Name</td>
                <td style="padding: 9px 14px; font-weight: 800; color: #0f172a; font-size: 13px;">${custName}</td>
                <td style="padding: 9px 14px; color: #64748b; width: 120px; font-weight: 600;">Account Number</td>
                <td style="padding: 9px 14px; font-weight: 800; color: #1e3a8a; font-family: monospace; font-size: 12px;">${accNo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #fbfcfe;">
                <td style="padding: 9px 14px; color: #64748b; font-weight: 600;">Customer ID</td>
                <td style="padding: 9px 14px; font-weight: 700; color: #334155; font-family: monospace;">${custId}</td>
                <td style="padding: 9px 14px; color: #64748b; font-weight: 600;">Transaction Type</td>
                <td style="padding: 9px 14px; font-weight: 800; color: ${isWithdrawal ? '#b91c1c' : '#15803d'};">${txnType}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 9px 14px; color: #64748b; font-weight: 600;">Branch Office</td>
                <td style="padding: 9px 14px; font-weight: 600; color: #334155;">Jamawaramgarh Rural Desk</td>
                <td style="padding: 9px 14px; color: #64748b; font-weight: 600;">Auth Status</td>
                <td style="padding: 9px 14px; font-weight: 800; color: #16a34a;">✓ System Verified</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Highlighting Amount Banner -->
        <div style="
          background: linear-gradient(135deg, #f0fdf4, #eff6ff);
          border: 1.5px solid #86efac;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #15803d; letter-spacing: 0.5px;">
              Total Amount Processed
            </div>
            <div style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 2px 0;">
              ₹ ${formattedAmt}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #475569; font-style: italic;">
              Amount in words: <strong style="color: #0f172a;">${amtWords}</strong>
            </div>
          </div>

          ${balanceAfter ? `
          <div style="text-align: right; background: #ffffff; padding: 10px 16px; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase;">
              Balance Post-Transaction
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #1e3a8a;">
              ₹ ${balanceAfter}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Authentication & Signatures Grid -->
        <div style="
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr;
          gap: 16px;
          align-items: end;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        ">
          <!-- Staff Desk -->
          <div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 30px;">
              Received & Processed By:
            </div>
            <div style="border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 11px;">
              <strong style="color: #0f172a;">${receivedBy}</strong>
              <div style="font-size: 9px; color: #64748b;">Cashier / Staff Officer Desk</div>
              <div style="font-size: 8px; color: #94a3b8;">Jamawaramgarh Regional Hub</div>
            </div>
          </div>

          <!-- Official Circular Stamp / Seal -->
          <div style="text-align: center;">
            <div style="
              display: inline-block;
              width: 90px;
              height: 90px;
              border: 2px dashed #2563eb;
              border-radius: 50%;
              padding: 4px;
              box-sizing: border-box;
            ">
              <div style="
                width: 100%;
                height: 100%;
                border: 1px solid #2563eb;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #1e40af;
                font-size: 7.5px;
                font-weight: 800;
                line-height: 1.1;
                text-transform: uppercase;
              ">
                <div>★ RPR CAPITAL ★</div>
                <div style="color: #16a34a; font-size: 8.5px; margin: 2px 0;">SEAL OF AUTH</div>
                <div>JAMWARAMGARH</div>
                <div style="font-size: 6.5px; color: #64748b;">JAIPUR HUB</div>
              </div>
            </div>
          </div>

          <!-- Admin Signature -->
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #64748b; margin-bottom: 30px;">
              Authorized & Supervised By:
            </div>
            <div style="border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 11px;">
              <strong style="color: #1e3a8a;">ROHIT MEENA</strong>
              <div style="font-size: 9px; color: #7c3aed; font-weight: 700;">Founder & Managing Director</div>
              <div style="font-size: 8px; color: #94a3b8;">RPR Capital Board of Trustees</div>
            </div>
          </div>
        </div>

        <!-- Security & Legal Footer -->
        <div style="
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8.5px;
          color: #64748b;
        ">
          <div>
            🔒 Security UID: <strong style="color: #334155; font-family: monospace;">${hashUid}</strong> | System Timestamp: ${new Date().toISOString()}
          </div>
          <div>
            Computer generated official bank instrument. Powered by RPR Core Banking Engine.
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2.2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    // Landscape A5 or Portrait A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 8mm safety margin on all sides guarantees all borders are 100% visible
    const margin = 8;
    const maxW = pdfWidth - (margin * 2);
    const maxH = pdfHeight - (margin * 2);

    const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;

    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

    const safeFilename = `${receiptNo}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('[PDF Generation Error]', err);
    // Fallback trigger print window
    window.print();
    return false;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generate & Download Official Passbook Statement as PDF
 */
export async function generateStatementPDF(customer = {}, deposits = [], currentNetBalance = 0, branch = 'Jamawaramgarh Regional Hub') {
  const logoUrl = await getLogoBase64();

  const custName = customer.name || 'Account Holder';
  const accNo = customer.accountNumber || 'RPR-2026-8801';
  const custId = customer.customerId || 'RPR-CUST-101';
  const phone = customer.phone || '9876543210';
  const address = customer.address || 'Jamawaramgarh, Jaipur, Rajasthan';
  const kycStatus = customer.kycStatus || 'Verified';
  const loans = customer.loans || {};
  const activeLoan = Number(loans.activeLoan || 0);
  const monthlyEmi = Number(loans.monthlyEmi || 0);
  const nextPaymentDate = loans.nextPaymentDate || '05 Nov 2026';

  let totalDeposits = 0;
  let totalWithdrawn = 0;
  deposits.forEach((d) => {
    const amt = Number(d.amount) || 0;
    if (amt > 0) totalDeposits += amt;
    else totalWithdrawn += Math.abs(amt);
  });

  const statementUid = `STMT-${accNo.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '820px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = "'Inter', 'Segoe UI', Arial, sans-serif";
  container.style.color = '#0f172a';
  container.style.zIndex = '999999';

  container.innerHTML = `
    <div style="background: #ffffff; padding: 14px; box-sizing: border-box;">
      <div style="
        position: relative;
        background: #ffffff;
        padding: 30px 36px 26px 36px;
        box-sizing: border-box;
        border: 3px double #1e3a8a;
        border-radius: 8px;
        overflow: hidden;
        line-height: 1.4;
      ">
      <!-- Watermark Logo Background -->
      <div style="
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 380px;
        height: 380px;
        background-image: url('${logoUrl}');
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        opacity: 0.07;
        pointer-events: none;
        z-index: 1;
      "></div>

      <!-- Content wrapper -->
      <div style="position: relative; z-index: 2;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${logoUrl}" style="width: 56px; height: 56px; object-fit: contain;" alt="RPR Logo" />
            <div>
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: 24px; font-weight: 900; color: #1e3a8a;">RPR</span>
                <span style="font-size: 20px; font-weight: 800; color: #7c3aed;">CAPITAL</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase;">
                Rajasthan Pay Reserve Capital
              </div>
              <div style="font-size: 10px; color: #64748b;">
                ${branch}, Jaipur (Rajasthan) - 303109
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="
              display: inline-block;
              background: #1e3a8a;
              color: #ffffff;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.5px;
            ">
              CUSTOMER PASSBOOK STATEMENT
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 4px;">
              Generated: <strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div style="font-size: 9px; color: #64748b; font-family: monospace;">
              UID: ${statementUid}
            </div>
          </div>
        </div>

        <!-- Customer Summary Details -->
        <div style="
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 14px 16px;
          margin: 16px 0;
          font-size: 11px;
        ">
          <div>
            <div style="display: flex; gap: 8px; margin-bottom: 4px;">
              <span style="color: #64748b; width: 110px;">Account Holder:</span>
              <strong style="color: #0f172a; font-size: 13px;">${custName}</strong>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 4px;">
              <span style="color: #64748b; width: 110px;">Account Number:</span>
              <strong style="color: #1e3a8a; font-family: monospace;">${accNo}</strong>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 4px;">
              <span style="color: #64748b; width: 110px;">Customer ID:</span>
              <span style="font-family: monospace; font-weight: 600;">${custId}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="color: #64748b; width: 110px;">Contact / KYC:</span>
              <span>+91 ${phone} • <strong style="color: #16a34a;">${kycStatus}</strong></span>
            </div>
          </div>

          <div style="border-left: 1px solid #cbd5e1; padding-left: 16px;">
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Net Available Balance</div>
            <div style="font-size: 20px; font-weight: 900; color: #15803d; margin: 2px 0;">
              ₹ ${Number(currentNetBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            ${activeLoan > 0 ? `
              <div style="font-size: 9px; color: #b91c1c; font-weight: 700; margin-top: 4px;">
                Active Loan: ₹ ${activeLoan.toLocaleString('en-IN')} (EMI: ₹${monthlyEmi.toLocaleString('en-IN')})
              </div>
            ` : '<div style="font-size: 9px; color: #64748b;">No active loan outstanding</div>'}
          </div>
        </div>

        <!-- Ledger Transactions Table -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
            Transaction History / Passbook Entries
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #1e3a8a; color: #ffffff; text-align: left;">
                <th style="padding: 7px 10px;">Date</th>
                <th style="padding: 7px 10px;">Voucher / Receipt</th>
                <th style="padding: 7px 10px;">Particulars / Type</th>
                <th style="padding: 7px 10px;">Mode</th>
                <th style="padding: 7px 10px; text-align: right;">Amount (₹)</th>
                <th style="padding: 7px 10px; text-align: right;">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${deposits.slice(0, 18).map((d, idx) => {
                const amt = Number(d.amount) || 0;
                const isDebit = amt < 0;
                return `
                  <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="padding: 6px 10px; font-weight: 600;">${d.date}</td>
                    <td style="padding: 6px 10px; font-family: monospace; color: #64748b;">${d.receiptNumber || d.txnRef || '-'}</td>
                    <td style="padding: 6px 10px; font-weight: 600; color: ${isDebit ? '#b91c1c' : '#15803d'};">
                      ${d.type || (isDebit ? 'Withdrawal' : 'Deposit')}
                    </td>
                    <td style="padding: 6px 10px;">${d.mode || 'Cash'}</td>
                    <td style="padding: 6px 10px; text-align: right; font-weight: 700; color: ${isDebit ? '#b91c1c' : '#15803d'};">
                      ${isDebit ? '-' : '+'} ₹${Math.abs(amt).toLocaleString('en-IN')}
                    </td>
                    <td style="padding: 6px 10px; text-align: right; font-weight: 800; color: #1e3a8a;">
                      ₹${Number(d.balanceAfter || currentNetBalance).toLocaleString('en-IN')}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Authentication & Signatures -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #cbd5e1;
          padding-top: 16px;
          margin-top: 20px;
        ">
          <div>
            <div style="font-size: 9px; color: #64748b; margin-bottom: 24px;">Branch Verification Desk:</div>
            <div style="border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 10px; font-weight: 700;">
              Branch Operations Manager
              <div style="font-size: 8px; color: #64748b; font-weight: normal;">Jamawaramgarh Hub</div>
            </div>
          </div>

          <!-- Circular Seal -->
          <div style="
            width: 76px;
            height: 76px;
            border: 2px dashed #1e3a8a;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #1e3a8a;
            font-size: 7px;
            font-weight: 800;
            text-align: center;
            line-height: 1.1;
          ">
            <div>★ RPR CAPITAL ★</div>
            <div style="color: #16a34a; font-size: 8px;">VERIFIED</div>
            <div>PASSBOOK DESK</div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 9px; color: #64748b; margin-bottom: 24px;">Supervised & Approved By:</div>
            <div style="border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 10px;">
              <strong style="color: #1e3a8a;">ROHIT MEENA</strong>
              <div style="font-size: 8px; color: #7c3aed; font-weight: 700;">Founder & Managing Director</div>
            </div>
          </div>
        </div>

        <div style="
          margin-top: 14px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          font-size: 8px;
          color: #64748b;
          text-align: center;
        ">
          Official digital account statement issued by Rajasthan Pay Reserve Capital. Valid without physical signature.
        </div>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2.2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 8mm margin
    const margin = 8;
    const maxW = pdfWidth - (margin * 2);
    const maxH = pdfHeight - (margin * 2);

    const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;

    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

    const safeFilename = `Passbook_${accNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('[PDF Generation Error]', err);
    window.print();
    return false;
  } finally {
    document.body.removeChild(container);
  }
}
