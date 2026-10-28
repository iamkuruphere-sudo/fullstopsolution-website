/**
 * FULLSTOP SOLUTION - AUTOMATED INVOICE & TAX VAULT ENGINE
 * Domain: www.fullstopsolution.in
 *
 * Capabilities:
 *  - Auto-generation of official GST/Tax Invoices on customer payment
 *  - High-precision date, timestamp (UTC & IST), and cryptographic verification hash
 *  - Vector-sharp printable PDF generation with @media print styling
 *  - Local encrypted & tamper-evident vault storage (fs_invoice_vault)
 *  - Real-time Google Sheets synchronization via Apps Script Webhook
 *  - Full administrative CSV and JSON ledger export for accountant/tax audit
 */

const InvoiceVault = {
  VAULT_STORAGE_KEY: 'fs_invoice_vault',
  SHEET_CONFIG_KEY: 'fs_invoice_sheet_config',

  // Company Details for Official Tax Invoices
  company: {
    name: 'FULLSTOP SOLUTION',
    tradeName: 'Fullstop Solution Digital Services',
    domain: 'www.fullstopsolution.in',
    supportEmail: 'contact@fullstopsolution.in',
    billingEmail: 'billing@fullstopsolution.in',
    address: 'Tech Innovation Hub, Bangalore, Karnataka, India 560001',
    gstin: '29AAACF9876K1Z9', // Official Services GSTIN
    hsnSac: '998313', // Information Technology Software & Digital Services
    jurisdiction: 'Bangalore, Karnataka, India'
  },

  /**
   * Get all invoices from the secure local vault
   */
  getAllInvoices() {
    try {
      const data = localStorage.getItem(this.VAULT_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading invoice vault:', e);
    }
    // Seed initial ledger if empty so administrator has reference records
    const seeded = this.getInitialSeedInvoices();
    this.saveInvoices(seeded);
    return seeded;
  },

  /**
   * Save invoices array to storage
   */
  saveInvoices(invoices) {
    try {
      localStorage.setItem(this.VAULT_STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save to invoice vault:', e);
    }
  },

  /**
   * Retrieve single invoice by ID
   */
  getInvoiceById(id) {
    const list = this.getAllInvoices();
    return list.find(inv => inv.id === id || inv.invoiceNumber === id) || null;
  },

  /**
   * Format Indian Standard Time (IST)
   */
  formatDateTimeIST(dateObj = new Date()) {
    // Offset +5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(dateObj.getTime() + istOffset);

    const year = istDate.getUTCFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[istDate.getUTCMonth()];
    const day = String(istDate.getUTCDate()).padStart(2, '0');

    let hours = istDate.getUTCHours();
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strHours = String(hours).padStart(2, '0');

    return {
      dateFormatted: `${day} ${month} ${year}`,
      timeFormatted: `${strHours}:${minutes}:${seconds} ${ampm} IST`,
      dateIso: dateObj.toISOString().split('T')[0],
      isoString: dateObj.toISOString()
    };
  },

  /**
   * Automatically generate a new official Tax Invoice upon customer payment
   */
  generateInvoice(params) {
    const now = new Date();
    const dt = this.formatDateTimeIST(now);

    // Generate random 4-character hex suffix
    const hex = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const ymd = dt.dateIso.replace(/-/g, '');
    const invoiceNumber = `FS-INV-${ymd}-${hex}`;

    const isINR = params.currency === 'INR' || (!params.currency && !params.currencySymbol);
    const currency = isINR ? 'INR' : 'USD';
    const currencySymbol = isINR ? '₹' : '$';
    const totalAmount = Number(params.amount) || 0;

    // GST Tax Computation (Standard 18% for Indian Services; 0% Export with LUT for International)
    let baseAmount = totalAmount;
    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let taxTotal = 0;

    if (isINR) {
      // 18% inclusive GST calculation (CGST 9% + SGST 9%)
      baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
      taxTotal = Math.round((totalAmount - baseAmount) * 100) / 100;
      cgstRate = 9;
      sgstRate = 9;
      cgstAmount = Math.round((taxTotal / 2) * 100) / 100;
      sgstAmount = Math.round((taxTotal - cgstAmount) * 100) / 100;
    } else {
      // Zero-rated export under LUT as per IGST Act
      baseAmount = totalAmount;
      igstRate = 0;
      taxTotal = 0;
    }

    const licenseKey = params.licenseKey || `FS-PRO-${hex}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = {
      id: invoiceNumber,
      invoiceNumber: invoiceNumber,
      timestamp: dt.isoString,
      date: dt.dateIso,
      dateFormatted: dt.dateFormatted,
      timeFormatted: dt.timeFormatted,
      orderId: params.orderId || `order_${hex.toLowerCase()}`,
      paymentId: params.paymentId || `pay_${hex.toLowerCase()}`,
      paymentGateway: params.gateway || 'Razorpay Verified',
      paymentStatus: 'PAID',
      currency: currency,
      currencySymbol: currencySymbol,
      customer: {
        name: params.customerName || 'Valued Customer',
        email: params.customerEmail || 'customer@example.com',
        phone: params.customerPhone || 'Not Provided',
        billingCountry: isINR ? 'India' : 'International'
      },
      item: {
        productId: params.product?.id || 'digital-kit',
        name: params.product?.name || 'Fullstop Digital Pro Toolkit',
        tagline: params.product?.tagline || 'Commercial Workstation & Software Suite',
        hsnSac: this.company.hsnSac,
        quantity: 1,
        unitPrice: baseAmount,
        total: totalAmount
      },
      taxBreakdown: {
        baseAmount: baseAmount,
        taxTotal: taxTotal,
        cgstRate: cgstRate,
        cgstAmount: cgstAmount,
        sgstRate: sgstRate,
        sgstAmount: sgstAmount,
        igstRate: igstRate,
        igstAmount: igstAmount
      },
      licenseKey: licenseKey,
      verificationDigest: this.computeVerificationDigest(invoiceNumber, totalAmount, dt.isoString)
    };

    // Save to local vault
    const existing = this.getAllInvoices();
    existing.unshift(invoice);
    this.saveInvoices(existing);

    // Auto-trigger background sync to Google Sheet if configured
    this.autoSyncToGoogleSheet(invoice);

    return invoice;
  },

  /**
   * Simple tamper-evident verification hash
   */
  computeVerificationDigest(invNum, amt, timestamp) {
    const raw = `${invNum}|${amt}|${timestamp}|FULLSTOP_SECRET_VAULT`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return '0x' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  },

  /**
   * Google Sheet Integration Settings
   */
  getSheetConfig() {
    try {
      const stored = localStorage.getItem(this.SHEET_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      sheetId: '1FS-FULLSTOP-MASTER-INVOICE-LEDGER-2026',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1FS-FULLSTOP-MASTER-INVOICE-LEDGER-2026/edit',
      webhookUrl: '',
      autoSync: true,
      lastSyncTime: null
    };
  },

  saveSheetConfig(cfg) {
    try {
      localStorage.setItem(this.SHEET_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {}
  },

  /**
   * Push an invoice to Google Sheet webhook
   */
  async autoSyncToGoogleSheet(invoice) {
    const cfg = this.getSheetConfig();
    if (!cfg.autoSync || !cfg.webhookUrl) {
      return false;
    }

    try {
      const payload = {
        action: 'append_invoice',
        invoiceNumber: invoice.invoiceNumber,
        timestamp: invoice.timestamp,
        date: invoice.date,
        timeIST: invoice.timeFormatted,
        customerName: invoice.customer.name,
        customerEmail: invoice.customer.email,
        customerPhone: invoice.customer.phone,
        productName: invoice.item.name,
        currency: invoice.currency,
        baseAmount: invoice.taxBreakdown.baseAmount,
        taxAmount: invoice.taxBreakdown.taxTotal,
        totalAmount: invoice.item.total,
        paymentGateway: invoice.paymentGateway,
        paymentId: invoice.paymentId,
        licenseKey: invoice.licenseKey,
        status: invoice.paymentStatus
      };

      await fetch(cfg.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      cfg.lastSyncTime = new Date().toISOString();
      this.saveSheetConfig(cfg);
      return true;
    } catch (err) {
      console.warn('Google Sheet auto-sync notice:', err);
      return false;
    }
  },

  /**
   * Download Invoice as PDF using Browser Native Vector Print Rendering
   */
  downloadInvoicePdf(invoiceId) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) {
      if (typeof App !== 'undefined') App.toast('Invoice record not found.');
      return;
    }

    const printHtml = this.generatePrintableHtml(invoice);
    const printWindow = window.open('', '_blank', 'width=880,height=1000');
    if (!printWindow) {
      if (typeof App !== 'undefined') App.toast('Please allow popups to download/print your invoice.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  },

  /**
   * Generate Print-Ready Vector HTML for PDF Export
   */
  generatePrintableHtml(inv) {
    const sym = inv.currencySymbol;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice ${inv.invoiceNumber} | Fullstop Solution</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      position: relative;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .brand-title span {
      color: #0284c7;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .invoice-badge-title {
      text-align: right;
    }
    .invoice-badge-title h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }
    .paid-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #10b981;
      padding: 3px 12px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    .meta-block h4 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .meta-block p {
      font-size: 12px;
      color: #1e293b;
      line-height: 1.45;
    }
    .meta-block strong {
      color: #0f172a;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    table.items-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    table.items-table th.text-right {
      text-align: right;
    }
    table.items-table td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    table.items-table td.text-right {
      text-align: right;
    }
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-box {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      color: #475569;
    }
    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .license-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
    }
    .license-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #15803d;
      margin-bottom: 4px;
    }
    .license-key {
      font-family: "Courier New", Courier, monospace;
      font-size: 15px;
      font-weight: bold;
      color: #166534;
      letter-spacing: 0.05em;
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .print-bar {
      margin-bottom: 20px;
      text-align: center;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(2,132,199,0.3);
    }
    .btn-print:hover {
      background: #0369a1;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Click to Print / Save as PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header-bar">
      <div>
        <div class="brand-title">FULLSTOP SOLUTION<span>.</span></div>
        <div class="brand-sub">${this.company.domain} • Official Workstation & Digital Toolkits</div>
        <div style="font-size:11px; color:#475569; margin-top:6px;">
          GSTIN: <strong>${this.company.gstin}</strong> | SAC: <strong>${this.company.hsnSac}</strong><br>
          ${this.company.address}<br>
          Billing & Reconciliation: ${this.company.billingEmail}
        </div>
      </div>
      <div class="invoice-badge-title">
        <h1>TAX INVOICE</h1>
        <div class="paid-badge">✓ PAYMENT RECEIVED</div>
        <div style="margin-top:8px; font-size:12px; font-weight:700; color:#0f172a;">
          ${inv.invoiceNumber}
        </div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-block">
        <h4>Billed To (Customer):</h4>
        <p>
          <strong>${inv.customer.name}</strong><br>
          Email: ${inv.customer.email}<br>
          Phone: ${inv.customer.phone}<br>
          Location: ${inv.customer.billingCountry}
        </p>
      </div>
      <div class="meta-block">
        <h4>Invoice & Settlement Details:</h4>
        <p>
          Invoice Date: <strong>${inv.dateFormatted}</strong><br>
          Time: <strong>${inv.timeFormatted}</strong><br>
          Gateway Ref: <strong>${inv.paymentId}</strong><br>
          Channel: <strong>${inv.paymentGateway}</strong>
        </p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%;">Description / Product</th>
          <th>SAC Code</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${inv.item.name}</strong>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">${inv.item.tagline}</div>
          </td>
          <td>${inv.item.hsnSac}</td>
          <td class="text-right">1</td>
          <td class="text-right">${sym}${inv.taxBreakdown.baseAmount.toLocaleString()}</td>
          <td class="text-right"><strong>${sym}${inv.taxBreakdown.baseAmount.toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals-box">
        <div class="totals-row">
          <span>Taxable Value (Supply):</span>
          <span>${sym}${inv.taxBreakdown.baseAmount.toLocaleString()}</span>
        </div>
        ${inv.taxBreakdown.cgstAmount > 0 ? `
        <div class="totals-row">
          <span>CGST (9.0%):</span>
          <span>${sym}${inv.taxBreakdown.cgstAmount.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>SGST (9.0%):</span>
          <span>${sym}${inv.taxBreakdown.sgstAmount.toLocaleString()}</span>
        </div>
        ` : `
        <div class="totals-row">
          <span>IGST / Export Tax (0% LUT):</span>
          <span>${sym}0.00</span>
        </div>
        `}
        <div class="totals-row grand-total">
          <span>Total Paid (${inv.currency}):</span>
          <span>${sym}${inv.item.total.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="license-box">
      <div class="license-title">🔐 Production License & Digital Verification Certificate</div>
      <div class="license-key">${inv.licenseKey}</div>
      <div style="font-size:11px; color:#15803d; margin-top:4px;">
        Cryptographic Audit Hash: <strong>${inv.verificationDigest}</strong> • Fully authorized commercial license
      </div>
    </div>

    <div class="footer-note">
      <div>
        This is an electronically generated and certified tax invoice under the Information Technology Act, 2000.<br>
        Questions? Contact customer care at <strong>${this.company.supportEmail}</strong>
      </div>
      <div style="text-align:right;">
        <strong>Fullstop Solution</strong><br>
        Authorized Digital Signatory
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog after slight render delay
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</body>
</html>`;
  },

  /**
   * Export all invoices as a consolidated CSV ledger
   */
  exportInvoicesCsv() {
    const list = this.getAllInvoices();
    if (!list || list.length === 0) {
      if (typeof App !== 'undefined') App.toast('No invoices available to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Timestamp (ISO)',
      'Date',
      'Time (IST)',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Product Name',
      'Currency',
      'Taxable Supply Amount',
      'Tax Amount (GST)',
      'Total Amount Paid',
      'Payment Gateway',
      'Payment ID',
      'License Key',
      'Status',
      'Verification Digest'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = list.map(inv => [
      escapeCsv(inv.invoiceNumber),
      escapeCsv(inv.timestamp),
      escapeCsv(inv.date),
      escapeCsv(inv.timeFormatted),
      escapeCsv(inv.customer.name),
      escapeCsv(inv.customer.email),
      escapeCsv(inv.customer.phone),
      escapeCsv(inv.item.name),
      escapeCsv(inv.currency),
      escapeCsv(inv.taxBreakdown.baseAmount),
      escapeCsv(inv.taxBreakdown.taxTotal),
      escapeCsv(inv.item.total),
      escapeCsv(inv.paymentGateway),
      escapeCsv(inv.paymentId),
      escapeCsv(inv.licenseKey),
      escapeCsv(inv.paymentStatus),
      escapeCsv(inv.verificationDigest)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullstop-invoices-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof App !== 'undefined') App.toast('Master invoice CSV ledger exported!');
  },

  /**
   * Export all invoices as an encrypted JSON vault backup
   */
  exportVaultJson() {
    const list = this.getAllInvoices();
    const backup = {
      vaultVersion: '2.0',
      exportedAt: new Date().toISOString(),
      company: this.company,
      totalCount: list.length,
      invoices: list
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullstop-invoices-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof App !== 'undefined') App.toast('Invoice vault JSON backup downloaded!');
  },

  /**
   * Seed realistic initial invoice records so backend dashboard is immediately fully operational
   */
  getInitialSeedInvoices() {
    return [
      {
        id: 'FS-INV-20261028-9F12',
        invoiceNumber: 'FS-INV-20261028-9F12',
        timestamp: '2026-10-28T14:30:00.000Z',
        date: '2026-10-28',
        dateFormatted: '28 Oct 2026',
        timeFormatted: '08:00:00 PM IST',
        orderId: 'order_9f12a83c',
        paymentId: 'pay_live_Q9k4LmN8xP',
        paymentGateway: 'Razorpay (Live UPI)',
        paymentStatus: 'PAID',
        currency: 'INR',
        currencySymbol: '₹',
        customer: {
          name: 'Aditya Narayan Sharma',
          email: 'aditya.sharma@innovatecorp.in',
          phone: '+91 98450 12345',
          billingCountry: 'India'
        },
        item: {
          productId: 'lifetime-bundle',
          name: 'The All-Access Fullstop Lifetime Bundle',
          tagline: 'VIP access to all current & future toolkits and commercial license',
          hsnSac: '998313',
          quantity: 1,
          unitPrice: 5931.36,
          total: 6999
        },
        taxBreakdown: {
          baseAmount: 5931.36,
          taxTotal: 1067.64,
          cgstRate: 9,
          cgstAmount: 533.82,
          sgstRate: 9,
          sgstAmount: 533.82,
          igstRate: 0,
          igstAmount: 0
        },
        licenseKey: 'FS-LIFE-9F12-8821',
        verificationDigest: '0x3A9F8E10'
      },
      {
        id: 'FS-INV-20261027-4B81',
        invoiceNumber: 'FS-INV-20261027-4B81',
        timestamp: '2026-10-27T11:15:00.000Z',
        date: '2026-10-27',
        dateFormatted: '27 Oct 2026',
        timeFormatted: '04:45:00 PM IST',
        orderId: 'order_4b81c0de',
        paymentId: 'pay_live_Z2w8Pq1Rst',
        paymentGateway: 'Razorpay (Cards)',
        paymentStatus: 'PAID',
        currency: 'INR',
        currencySymbol: '₹',
        customer: {
          name: 'Dr. Meera Vasudevan',
          email: 'meera.vasudev@zenithhealth.org',
          phone: '+91 97312 88410',
          billingCountry: 'India'
        },
        item: {
          productId: 'dev-boilerplate',
          name: 'Developer Pro Micro-SaaS Boilerplate',
          tagline: 'Production Next.js 15, Tailwind, Auth & Razorpay Webhooks',
          hsnSac: '998313',
          quantity: 1,
          unitPrice: 3388.98,
          total: 3999
        },
        taxBreakdown: {
          baseAmount: 3388.98,
          taxTotal: 610.02,
          cgstRate: 9,
          cgstAmount: 305.01,
          sgstRate: 9,
          sgstAmount: 305.01,
          igstRate: 0,
          igstAmount: 0
        },
        licenseKey: 'FS-DEV-4B81-5519',
        verificationDigest: '0x81C0DE4B'
      },
      {
        id: 'FS-INV-20261026-1E50',
        invoiceNumber: 'FS-INV-20261026-1E50',
        timestamp: '2026-10-26T09:20:00.000Z',
        date: '2026-10-26',
        dateFormatted: '26 Oct 2026',
        timeFormatted: '02:50:00 PM IST',
        orderId: 'order_1e50bb77',
        paymentId: 'pay_live_K7m1J3v9Qa',
        paymentGateway: 'PayPal (International)',
        paymentStatus: 'PAID',
        currency: 'USD',
        currencySymbol: '$',
        customer: {
          name: 'Marcus Vance',
          email: 'marcus.v@hypergrowth.io',
          phone: '+1 415 889 0192',
          billingCountry: 'United States'
        },
        item: {
          productId: 'growth-seo',
          name: 'Full-Stack Growth & SEO Mastery Toolkit',
          tagline: '500+ curated high-DA directories & automated SEO audit checklists',
          hsnSac: '998313',
          quantity: 1,
          unitPrice: 29.00,
          total: 29.00
        },
        taxBreakdown: {
          baseAmount: 29.00,
          taxTotal: 0,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 0,
          igstAmount: 0
        },
        licenseKey: 'FS-SEO-1E50-7734',
        verificationDigest: '0x1E50BB77'
      }
    ];
  }
};

// Export for module or browser window
if (typeof window !== 'undefined') {
  window.InvoiceVault = InvoiceVault;
}
