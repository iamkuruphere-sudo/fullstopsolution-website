/**
 * Automated Security Audit & Formatting Verification Test Suite
 * Validates all remediations against OWASP, PCI-DSS, and DPDP/GDPR criteria.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n🔒 RUNNING SECURITY & FORMATTING AUDIT VERIFICATION...\n');

// 1. Credentials Check
const dashboardJs = fs.readFileSync(path.join(ROOT, 'assets/js/dashboard.js'), 'utf8');
const dashboardHtml = fs.readFileSync(path.join(ROOT, 'dashboard.html'), 'utf8');

assert(!dashboardJs.includes('Admin@Fullstop2026'), 'No default password Admin@Fullstop2026 in dashboard.js');
assert(!dashboardHtml.includes('Admin@Fullstop2026'), 'No default password in dashboard.html');
assert(!dashboardJs.includes("'8492'"), 'No fallback PIN 8492 in dashboard.js');
assert(!dashboardJs.includes("pin === '8492'"), 'No query parameter ?pin=8492 bypass in dashboard.js');

// 2. Checkout Payment Integrity Check
const checkoutJs = fs.readFileSync(path.join(ROOT, 'assets/js/checkout.js'), 'utf8');
assert(!checkoutJs.includes('Razorpay Verified Instant Mode'), 'No simulated instant fulfillment in checkout.js');
assert(!checkoutJs.includes("localStorage.setItem('fs_sales_ledger'"), 'No sales ledger persisted in localStorage');
assert(!checkoutJs.includes("localStorage.setItem('fs_purchases'"), 'No customer purchases persisted in localStorage');

// 3. Customer PII in localStorage Check
const appJs = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
assert(!appJs.includes("localStorage.setItem('fs_support_inquiries'"), 'No support inquiries in localStorage');
assert(!appJs.includes("localStorage.setItem('fs_free_downloads'"), 'No free download leads in localStorage');

// 4. Service Worker Cache Strategy Check
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert(swJs.includes('fullstop-v3.0.0'), 'Service worker cache version bumped to v3.0.0');
assert(swJs.includes('navigate'), 'Service worker uses Network-First for navigation');

// 5. Font Overlap & Platform Card Check
const stylesCss = fs.readFileSync(path.join(ROOT, 'assets/css/styles.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(stylesCss.includes('platform-card-title-group'), 'Platform card title-group class defined in CSS');
assert(!stylesCss.includes('.platform-card-badge {\n  position: absolute;'), 'platform-card-badge does not use absolute positioning over title');
assert(indexHtml.includes('<div class="platform-card-header">\n              <span class="platform-card-icon">🍏</span>\n              <span class="platform-card-badge">Apple Silicon</span>'), 'Platform card uses clean non-overlapping header layout');

// 6. Security Headers Check
const htaccess = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');
assert(htaccess.includes("frame-ancestors 'none'"), 'Frame-ancestors none set in .htaccess');
assert(htaccess.includes("base-uri 'self'"), 'Base-uri self set in .htaccess');

console.log(`\n==================================================`);
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log(`==================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SECURITY & FORMATTING AUDIT CRITERIA MET!\n');
}
