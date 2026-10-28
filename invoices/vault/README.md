# Fullstop Solution — Encrypted Invoices & Tax Vault
**Domain:** `www.fullstopsolution.in`  
**Security Classification:** Restricted / Confidential  
**Compliance Standard:** India Digital Personal Data Protection (DPDP) Act 2023, ISO/IEC 27001, RBI Digital Payment Guidelines, PCI-DSS SAQ-A.

---

### Vault Architecture & Data Privacy Controls

1. **Storage Structure:**
   - Every invoice auto-generated upon verified customer payment is saved with exact UTC timestamp, local Indian Standard Time (IST), customer billing identifiers, itemization, and cryptographic transaction proof.
   - Individual files follow the pattern:  
     `invoices/vault/YYYY-MM-DD_HH-mm-ss_FS-INV-xxxx.json`
   - Consolidated index:  
     `invoices/vault/master-registry.json`

2. **Access Control:**
   - Public web access is blocked via `.htaccess` (`Require all denied`) and hardened `index.html` (HTTP 403 Forbidden).
   - Backend access is granted exclusively through the authenticated **Private Executive Console** (`dashboard.html`), protected with master password hashing (SHA-256 with cryptographic salt) and RFC 6238 TOTP Two-Factor Authentication (2FA).

3. **Field Specifications:**
   - `invoiceNumber`: Unique alphanumeric sequential ID (e.g. `FS-INV-20261028-A4F9`).
   - `timestamp`: ISO-8601 UTC string.
   - `date`: `YYYY-MM-DD`.
   - `timeIST`: `HH:MM:SS AM/PM IST`.
   - `customerName`: Billing contact name.
   - `customerEmail`: License delivery destination.
   - `customerPhone`: Payment SMS/WhatsApp notification number.
   - `product`: Product ID, display title, and package specifications.
   - `currency`: INR (`₹`) or USD (`$`).
   - `baseAmount`: Taxable supply value.
   - `taxRate`: 18% GST (CGST 9% + SGST 9%) or 0% LUT for Export.
   - `taxAmount`: Total tax assessed.
   - `totalAmount`: Gross settlement amount.
   - `paymentGateway`: Razorpay or PayPal.
   - `paymentId`: Unique gateway reference (`pay_...`).
   - `orderId`: Gateway order reference (`order_...`).
   - `licenseKey`: Cryptographic product activation key.
   - `status`: `PAID`.
   - `integrityHash`: SHA-256 HMAC digest of invoice payload ensuring tamper evidence.

4. **Integration Connectors:**
   - **Google Sheets Live Sync**: Automatically appends new transactions to the administrative Master Google Sheet.
   - **Export Capabilities**: Consolidated CSV export, JSON vault backup, and instant PDF rendering.
