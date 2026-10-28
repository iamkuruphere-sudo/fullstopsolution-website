/**
 * FULLSTOP SOLUTION — GOOGLE APPS SCRIPT INVOICE SYNC WEBHOOK
 * Domain: www.fullstopsolution.in
 *
 * HOW TO INSTALL IN GOOGLE SHEETS IN 60 SECONDS:
 * 1. Open your Google Sheet (or create a new blank Google Sheet at sheets.new)
 * 2. Name the sheet: "Fullstop Solution - Master Invoices & Revenue Ledger"
 * 3. In the top menu, click: Extensions -> Apps Script
 * 4. Delete any code in the editor, paste this entire file, and click Save (💾 icon)
 * 5. Run the function "setupSheetHeaders()" once from the top toolbar to automatically
 *    format headers, styling, column widths, and freeze the top row.
 * 6. Click: Deploy -> New deployment
 * 7. Click the gear icon next to "Select type" -> choose "Web app"
 * 8. Set:
 *    - Description: "Fullstop Solution Invoice Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (allows website/backend to POST invoice without complex OAuth)
 * 9. Click "Deploy", copy the Web App URL (ends with /exec), and paste it into:
 *    Fullstop Console -> Invoices & Vault -> Google Apps Script Webhook URL
 *
 * All paid invoices will now instantly append to your Google Sheet automatically!
 */

const SHEET_NAME = "Invoices Master Ledger";

/**
 * Initialize / Format the Google Sheet with corporate branding and column formatting
 */
function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }

  const headers = [
    "Invoice Number",
    "Timestamp (ISO)",
    "Date",
    "Time (IST)",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Product Name",
    "Currency",
    "Taxable Supply (INR/USD)",
    "GST Tax (18%)",
    "Total Paid",
    "Payment Gateway",
    "Payment ID",
    "License Key",
    "Status"
  ];

  // Set Headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground("#0f172a"); // Navy dark background
  headerRange.setFontColor("#38bdf8");   // Cyan text
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");

  // Freeze top header row
  sheet.setFrozenRows(1);

  // Set column widths
  const widths = [180, 190, 110, 130, 180, 220, 140, 260, 80, 140, 120, 130, 150, 180, 190, 90];
  widths.forEach((w, idx) => {
    sheet.setColumnWidth(idx + 1, w);
  });

  Logger.log("Fullstop Solution Invoice Sheet successfully formatted!");
}

/**
 * Handle incoming POST requests from fullstopsolution.in or Python CLI
 */
function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupSheetHeaders();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const invoiceNumber = data.invoiceNumber || ("FS-INV-" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd-HHmmss"));
    const timestamp = data.timestamp || new Date().toISOString();
    const date = data.date || Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd");
    const timeIST = data.timeIST || Utilities.formatDate(new Date(), "GMT+5:30", "hh:mm:ss a 'IST'");
    const customerName = data.customerName || "Customer";
    const customerEmail = data.customerEmail || "";
    const customerPhone = data.customerPhone || "";
    const productName = data.productName || "Digital Toolkit";
    const currency = data.currency || "INR";
    const baseAmount = Number(data.baseAmount) || 0;
    const taxAmount = Number(data.taxAmount) || 0;
    const totalAmount = Number(data.totalAmount) || 0;
    const paymentGateway = data.paymentGateway || "Razorpay Verified";
    const paymentId = data.paymentId || "pay_verified";
    const licenseKey = data.licenseKey || "FS-LIC-VERIFIED";
    const status = data.status || "PAID";

    const row = [
      invoiceNumber,
      timestamp,
      date,
      timeIST,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      currency,
      baseAmount,
      taxAmount,
      totalAmount,
      paymentGateway,
      paymentId,
      licenseKey,
      status
    ];

    sheet.appendRow(row);

    // Format new row styling
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, row.length);
    range.setFontFamily("Roboto");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");

    // Number format for amounts
    sheet.getRange(lastRow, 10).setNumberFormat("#,##0.00");
    sheet.getRange(lastRow, 11).setNumberFormat("#,##0.00");
    sheet.getRange(lastRow, 12).setNumberFormat("#,##0.00");

    // Status pill background
    const statusCell = sheet.getRange(lastRow, 16);
    statusCell.setBackground("#ecfdf5");
    statusCell.setFontColor("#059669");
    statusCell.setFontWeight("bold");
    statusCell.setHorizontalAlignment("center");

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", invoiceNumber: invoiceNumber, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (Healthcheck)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", service: "Fullstop Solution Invoices Sync", timestamp: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}
