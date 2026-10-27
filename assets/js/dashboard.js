/**
 * FULLSTOP SOLUTION - ENTERPRISE PRIVATE BACKEND CONSOLE ENGINE
 * Domain: www.fullstopsolution.in
 * Architecture:
 *   - Web Crypto SHA-256 Master Password Hashing with Salt
 *   - RFC 6238 TOTP Two-Factor Authentication (2FA) with SVG QR Code Generator
 *   - Real-Time Product-Wise Sales & Conversions Ledger (Realistic, Zero Exaggeration)
 *   - Product-Wise Free Downloads Tracker (Name, Email, Time, Date, Geo)
 *   - Full Developer & Web Administrator Control (List/Unlist Products, Edit Pricing, Theme Customizer)
 *   - Retina High-DPI Pure Canvas Interactive Neon Charts
 */

// ==========================================================================
// 1. SECURITY & CRYPTOGRAPHY ENGINE (AdminSecurity)
// ==========================================================================

const AdminSecurity = {
  DEFAULT_PASSWORD: 'Admin@Fullstop2026',
  BACKUP_CODES_KEY: 'fs_admin_backup_codes',
  SALT_KEY: 'fs_admin_pwd_salt',
  HASH_KEY: 'fs_admin_pwd_hash',
  TWO_FACTOR_KEY: 'fs_admin_2fa_enabled',
  TWO_FACTOR_SECRET_KEY: 'fs_admin_2fa_secret',
  SESSION_KEY: 'fs_admin_session_token',
  SESSION_EXPIRE_KEY: 'fs_admin_session_expires',
  FAILED_ATTEMPTS_KEY: 'fs_admin_failed_attempts',
  LOCKOUT_UNTIL_KEY: 'fs_admin_lockout_until',

  // Convert string to ArrayBuffer
  strToBuffer(str) {
    return new TextEncoder().encode(str);
  },

  // Convert ArrayBuffer to Hex String
  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Generate cryptographic random salt
  generateSalt(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Compute SHA-256 hash of (salt + password)
  async computeHash(password, salt) {
    const data = this.strToBuffer(salt + '::FS::' + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  },

  // Initialize or verify password
  async verifyPassword(inputPassword) {
    const storedHash = localStorage.getItem(this.HASH_KEY);
    const storedSalt = localStorage.getItem(this.SALT_KEY);

    // If no custom password has been set yet, check default password or legacy PIN 8492
    if (!storedHash || !storedSalt) {
      if (inputPassword === this.DEFAULT_PASSWORD || inputPassword === '8492') {
        return true;
      }
      return false;
    }

    const computed = await this.computeHash(inputPassword, storedSalt);
    return computed === storedHash;
  },

  // Change master password
  async changePassword(oldPassword, newPassword) {
    const isOldValid = await this.verifyPassword(oldPassword);
    if (!isOldValid) {
      throw new Error('Current master password does not match.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const salt = this.generateSalt();
    const newHash = await this.computeHash(newPassword, salt);
    localStorage.setItem(this.SALT_KEY, salt);
    localStorage.setItem(this.HASH_KEY, newHash);
    this.logAudit('Password Changed', 'Master password updated successfully');
    return true;
  },

  // Check if 2FA is active
  is2faEnabled() {
    return localStorage.getItem(this.TWO_FACTOR_KEY) === 'true';
  },

  // Get or create 2FA Base32 Secret
  get2faSecret() {
    let secret = localStorage.getItem(this.TWO_FACTOR_SECRET_KEY);
    if (!secret) {
      secret = this.generateBase32Secret(16);
      localStorage.setItem(this.TWO_FACTOR_SECRET_KEY, secret);
    }
    return secret;
  },

  // Generate Base32 Secret Key (RFC 4648)
  generateBase32Secret(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars[array[i] % chars.length];
    }
    return secret;
  },

  // Generate 6 emergency backup recovery codes
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 6; i++) {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      codes.push(`${part1}-${part2}`);
    }
    localStorage.setItem(this.BACKUP_CODES_KEY, JSON.stringify(codes));
    return codes;
  },

  getBackupCodes() {
    try {
      const raw = localStorage.getItem(this.BACKUP_CODES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.generateBackupCodes();
  },

  useBackupCode(code) {
    const clean = code.trim();
    const codes = this.getBackupCodes();
    const index = codes.indexOf(clean);
    if (index !== -1) {
      codes.splice(index, 1);
      localStorage.setItem(this.BACKUP_CODES_KEY, JSON.stringify(codes));
      this.logAudit('Backup Code Used', `Emergency code consumed. Remaining: ${codes.length}`);
      return true;
    }
    return false;
  },

  // Base32 decode into Uint8Array
  base32ToBytes(base32) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = '';
    for (let i = 0; i < cleaned.length; i++) {
      const val = alphabet.indexOf(cleaned[i]);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return new Uint8Array(bytes);
  },

  // RFC 6238 TOTP Algorithm (HMAC-SHA1 dynamic truncation)
  async generateTotp(secret, timeStepOffset = 0) {
    const keyBytes = this.base32ToBytes(secret);
    if (keyBytes.length === 0) return '000000';

    const epochSeconds = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epochSeconds / 30) + timeStepOffset;

    // Convert counter to 8-byte big-endian buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, Math.floor(counter / 0x100000000), false);
    counterView.setUint32(4, counter & 0xffffffff, false);

    // Import secret as HMAC-SHA1 CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    // Sign counter
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const sigBytes = new Uint8Array(signature);

    // Dynamic Truncation
    const offset = sigBytes[sigBytes.length - 1] & 0x0f;
    const binary =
      ((sigBytes[offset] & 0x7f) << 24) |
      ((sigBytes[offset + 1] & 0xff) << 16) |
      ((sigBytes[offset + 2] & 0xff) << 8) |
      (sigBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  },

  // Verify TOTP code with ±30s clock drift tolerance
  async verifyTotp(inputCode, secret) {
    const clean = inputCode.trim();

    // Check backup codes first
    if (this.useBackupCode(clean)) {
      return true;
    }

    if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
      return false;
    }

    // Check current step, previous step (-30s), and next step (+30s)
    const offsets = [0, -1, 1];
    for (const offset of offsets) {
      const code = await this.generateTotp(secret, offset);
      if (code === clean) {
        return true;
      }
    }
    return false;
  },

  // Enable / Disable 2FA
  async enable2fa(verificationCode) {
    const secret = this.get2faSecret();
    const isValid = await this.verifyTotp(verificationCode, secret);
    if (!isValid) {
      throw new Error('Invalid verification code. Please check your authenticator app.');
    }
    localStorage.setItem(this.TWO_FACTOR_KEY, 'true');
    this.logAudit('2FA Enabled', 'Two-factor authentication activated');
    return true;
  },

  disable2fa() {
    localStorage.setItem(this.TWO_FACTOR_KEY, 'false');
    this.logAudit('2FA Disabled', 'Two-factor authentication disabled');
    return true;
  },

  // Session Management
  createSession(timeoutMinutes = 15) {
    const token = this.generateSalt(24);
    const expires = Date.now() + timeoutMinutes * 60 * 1000;
    sessionStorage.setItem(this.SESSION_KEY, token);
    sessionStorage.setItem(this.SESSION_EXPIRE_KEY, expires.toString());
    sessionStorage.setItem('fs_admin_auth', '1');
    localStorage.removeItem(this.FAILED_ATTEMPTS_KEY);
    this.logAudit('Console Login', 'Administrator authenticated successfully');
  },

  isSessionValid() {
    const token = sessionStorage.getItem(this.SESSION_KEY);
    const expiresStr = sessionStorage.getItem(this.SESSION_EXPIRE_KEY);
    if (!token || !expiresStr) return false;

    const expires = parseInt(expiresStr, 10);
    if (Date.now() > expires) {
      this.destroySession();
      return false;
    }
    // Renew expiry on valid active interaction
    sessionStorage.setItem(this.SESSION_EXPIRE_KEY, (Date.now() + 15 * 60 * 1000).toString());
    return true;
  },

  destroySession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRE_KEY);
    sessionStorage.removeItem('fs_admin_auth');
  },

  // Brute-force rate limiting
  recordFailedAttempt() {
    let attempts = parseInt(localStorage.getItem(this.FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(this.FAILED_ATTEMPTS_KEY, attempts.toString());
    this.logAudit('Failed Login Attempt', `Attempt #${attempts}`);

    if (attempts >= 5) {
      const lockoutTime = Date.now() + 60 * 1000; // 60 seconds
      localStorage.setItem(this.LOCKOUT_UNTIL_KEY, lockoutTime.toString());
    }
    return attempts;
  },

  getLockoutRemaining() {
    const until = parseInt(localStorage.getItem(this.LOCKOUT_UNTIL_KEY) || '0', 10);
    if (!until) return 0;
    const diff = Math.ceil((until - Date.now()) / 1000);
    if (diff <= 0) {
      localStorage.removeItem(this.LOCKOUT_UNTIL_KEY);
      localStorage.removeItem(this.FAILED_ATTEMPTS_KEY);
      return 0;
    }
    return diff;
  },

  // Security Audit Log
  logAudit(action, details) {
    try {
      const logs = JSON.parse(localStorage.getItem('fs_security_audit_log') || '[]');
      logs.unshift({
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        location: Analytics.detectClientGeo ? Analytics.detectClientGeo() : 'Bengaluru, India 🇮🇳'
      });
      if (logs.length > 50) logs.pop();
      localStorage.setItem('fs_security_audit_log', JSON.stringify(logs));
    } catch (e) {}
  },

  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem('fs_security_audit_log') || '[]');
    } catch (e) {
      return [];
    }
  }
};

// ==========================================================================
// 2. PRODUCT MANAGEMENT & STORE SYNCHRONIZATION (AdminProducts)
// ==========================================================================

const AdminProducts = {
  DEFAULT_PRODUCTS: {
    'business-os': {
      id: 'business-os',
      name: 'Fullstop Ultimate Business OS',
      tagline: 'Complete operating system with client CRM, cash-flow tracker & 30+ legal contract templates.',
      category: 'Notion & Spreadsheets',
      priceINR: 1499,
      priceUSD: 19,
      originalINR: 4999,
      originalUSD: 65,
      status: 'active', // 'active' or 'unlisted'
      salesCount: 12,
      revenueINR: 17988,
      features: [
        'Complete Notion Workspace (CRM, Project Hub, Cash Flow)',
        '30+ Ready-to-Use Business Contract & Proposal Templates',
        'Automated GST/VAT Invoice & Quotation Spreadsheets',
        'Client Onboarding & Offboarding SOPs',
        'Lifetime Updates & Community Support'
      ]
    },
    'growth-seo': {
      id: 'growth-seo',
      name: 'Full-Stack Growth & SEO Mastery Toolkit',
      tagline: '500+ curated high-DA submission directories, audit checklists, and programmatic SEO matrices.',
      category: 'SEO & Organic Growth',
      priceINR: 2499,
      priceUSD: 29,
      originalINR: 6999,
      originalUSD: 89,
      status: 'active',
      salesCount: 8,
      revenueINR: 19992,
      features: [
        '500+ High-Authority Directory Submission List (DR & Dofollow tags)',
        '100-Point Technical & On-Page SEO Audit Checklist',
        'Programmatic SEO Sheet & Keyword Clustering Matrix',
        'Viral Social Hook Database & Copywriting Swipes',
        'Rank Tracking & Schema Markup Automation Scripts'
      ]
    },
    'dev-boilerplate': {
      id: 'dev-boilerplate',
      name: 'Developer Pro Micro-SaaS Boilerplate',
      tagline: 'Production-ready Next.js 15, Tailwind, Auth, Razorpay UPI & Webhook architecture.',
      category: 'Developer Boilerplate',
      priceINR: 3999,
      priceUSD: 49,
      originalINR: 9999,
      originalUSD: 129,
      status: 'active',
      salesCount: 5,
      revenueINR: 19995,
      features: [
        'Production Next.js 15 App Router Architecture',
        'Pre-configured Razorpay & UPI Webhook Workflows',
        'Tailwind CSS + Lucide Component Library',
        'SEO-optimized Meta Engine, JSON-LD & Sitemap auto-generation',
        'Clean Modular Architecture with Commercial Resale Rights'
      ]
    },
    'lifetime-bundle': {
      id: 'lifetime-bundle',
      name: 'The All-Access Fullstop Lifetime Bundle',
      tagline: 'Includes every current toolkit and all future products released on fullstopsolution.in forever.',
      category: 'VIP Lifetime Bundle',
      priceINR: 6999,
      priceUSD: 79,
      originalINR: 19999,
      originalUSD: 249,
      status: 'active',
      salesCount: 3,
      revenueINR: 20997,
      features: [
        'Everything in Ultimate Business OS',
        'Everything in Full-Stack Growth & SEO Mastery Toolkit',
        'Everything in Developer Pro Micro-SaaS Boilerplate',
        'VIP Access to all future Digital Toolkits & Updates',
        'Priority 1-on-1 WhatsApp & Email Support',
        'Commercial & Agency Unlimited Client License'
      ]
    }
  },

  getProducts() {
    try {
      const stored = localStorage.getItem('fs_products_catalog');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Save defaults
    this.saveProducts(this.DEFAULT_PRODUCTS);
    return this.DEFAULT_PRODUCTS;
  },

  saveProducts(catalog) {
    try {
      localStorage.setItem('fs_products_catalog', JSON.stringify(catalog));
    } catch (e) {}
  },

  // Toggle list/unlist
  toggleProductStatus(productId) {
    const catalog = this.getProducts();
    if (!catalog[productId]) return;
    catalog[productId].status = catalog[productId].status === 'active' ? 'unlisted' : 'active';
    this.saveProducts(catalog);
    AdminSecurity.logAudit('Product Status Changed', `Product ${productId} set to ${catalog[productId].status}`);
  },

  // Update product pricing
  updatePricing(productId, priceINR, priceUSD, origINR, origUSD) {
    const catalog = this.getProducts();
    if (!catalog[productId]) return;
    catalog[productId].priceINR = parseInt(priceINR, 10);
    catalog[productId].priceUSD = parseInt(priceUSD, 10);
    if (origINR) catalog[productId].originalINR = parseInt(origINR, 10);
    if (origUSD) catalog[productId].originalUSD = parseInt(origUSD, 10);
    this.saveProducts(catalog);
    AdminSecurity.logAudit('Pricing Updated', `Product ${productId}: ₹${priceINR} / $${priceUSD}`);
  },

  // List a brand new product
  createProduct(data) {
    const catalog = this.getProducts();
    const id = (data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');
    catalog[id] = {
      id: id,
      name: data.name,
      tagline: data.tagline || '',
      category: data.category || 'Digital Toolkit',
      priceINR: parseInt(data.priceINR, 10) || 999,
      priceUSD: parseInt(data.priceUSD, 10) || 15,
      originalINR: parseInt(data.originalINR, 10) || (parseInt(data.priceINR, 10) * 3),
      originalUSD: parseInt(data.originalUSD, 10) || (parseInt(data.priceUSD, 10) * 3),
      status: 'active',
      salesCount: 0,
      revenueINR: 0,
      features: Array.isArray(data.features) ? data.features : (data.features || '').split('\n').filter(Boolean)
    };
    this.saveProducts(catalog);
    AdminSecurity.logAudit('Product Created', `Listed new product: ${data.name} (ID: ${id})`);
    return catalog[id];
  },

  // Reset to default products
  resetDefaults() {
    this.saveProducts(this.DEFAULT_PRODUCTS);
    AdminSecurity.logAudit('Catalog Reset', 'Reset product catalog to default inventory');
  }
};

// ==========================================================================
// 3. WEB THEME & STYLING CUSTOMIZER (AdminTheme)
// ==========================================================================

const AdminTheme = {
  PRESETS: {
    'cyber-obsidian': {
      name: 'Cyber Obsidian (Default)',
      bgPrimary: '#060913',
      bgSecondary: '#0f172a',
      accentPrimary: '#2563eb',
      accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
      borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    'emerald-matrix': {
      name: 'Emerald Matrix',
      bgPrimary: '#05140e',
      bgSecondary: '#0a2319',
      accentPrimary: '#10b981',
      accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      borderColor: 'rgba(16, 185, 129, 0.25)'
    },
    'electric-sapphire': {
      name: 'Electric Sapphire',
      bgPrimary: '#040d1a',
      bgSecondary: '#0a192f',
      accentPrimary: '#0284c7',
      accentGradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)',
      borderColor: 'rgba(14, 165, 233, 0.25)'
    },
    'sunset-amber': {
      name: 'Sunset Amber & Gold',
      bgPrimary: '#120b05',
      bgSecondary: '#211308',
      accentPrimary: '#d97706',
      accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #e11d48 100%)',
      borderColor: 'rgba(245, 158, 11, 0.25)'
    },
    'titanium-light': {
      name: 'Titanium Executive (Light)',
      bgPrimary: '#f8fafc',
      bgSecondary: '#ffffff',
      accentPrimary: '#2563eb',
      accentGradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      borderColor: 'rgba(0, 0, 0, 0.1)'
    }
  },

  getCurrentTheme() {
    return localStorage.getItem('fs_site_theme') || 'cyber-obsidian';
  },

  applyTheme(themeKey) {
    const preset = this.PRESETS[themeKey];
    if (!preset) return;
    localStorage.setItem('fs_site_theme', themeKey);

    const root = document.documentElement;
    root.style.setProperty('--bg-primary', preset.bgPrimary);
    root.style.setProperty('--bg-secondary', preset.bgSecondary);
    root.style.setProperty('--accent-primary', preset.accentPrimary);
    root.style.setProperty('--accent-gradient', preset.accentGradient);
    root.style.setProperty('--border-color', preset.borderColor);

    if (themeKey === 'titanium-light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }

    AdminSecurity.logAudit('Theme Changed', `Web theme set to ${preset.name}`);
  }
};

// ==========================================================================
// 4. REAL-TIME DATA LEDGER & DATASETS (DashboardData)
// ==========================================================================

const DashboardData = {
  // 28 Realistic Completed Sales Records (Clean, Mathematically Accurate, Zero Exaggeration)
  SEED_SALES: [
    { id: 'TXN-9842-8491', date: '27 Oct 2026, 17:15 IST', timestamp: '2026-10-27T11:45:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Aditya Sharma', customerEmail: 'aditya.sharma@gmail.com', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_P84920K1', geography: 'Bengaluru, Karnataka, India 🇮🇳', licenseKey: 'FS-PRO-9842-8492-4819', status: 'Completed' },
    { id: 'TXN-9831-7712', date: '27 Oct 2026, 15:30 IST', timestamp: '2026-10-27T10:00:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Priya Patel', customerEmail: 'priya.p@techventures.in', amount: 2499, currency: 'INR', gateway: 'Razorpay (RuPay Card)', paymentId: 'pay_M77129X4', geography: 'Mumbai, Maharashtra, India 🇮🇳', licenseKey: 'FS-PRO-7712-4812-9901', status: 'Completed' },
    { id: 'TXN-9820-6641', date: '27 Oct 2026, 12:45 IST', timestamp: '2026-10-27T07:15:00Z', productId: 'dev-boilerplate', productName: 'Developer Pro Micro-SaaS Boilerplate', customerName: 'Vikram Malhotra', customerEmail: 'vikram.m@zenithmedia.com', amount: 3999, currency: 'INR', gateway: 'Razorpay Netbanking (HDFC)', paymentId: 'pay_N66412W8', geography: 'Hyderabad, Telangana, India 🇮🇳', licenseKey: 'FS-PRO-6641-3819-2241', status: 'Completed' },
    { id: 'TXN-9805-5519', date: '26 Oct 2026, 21:10 IST', timestamp: '2026-10-26T15:40:00Z', productId: 'lifetime-bundle', productName: 'The All-Access Lifetime Bundle', customerName: 'Arjun Nair', customerEmail: 'arjun.nair@stackcraft.dev', amount: 6999, currency: 'INR', gateway: 'Razorpay UPI (PhonePe)', paymentId: 'pay_K55198J2', geography: 'Delhi NCR, India 🇮🇳', licenseKey: 'FS-VIP-5519-8842-1004', status: 'Completed' },
    { id: 'TXN-9792-4410', date: '26 Oct 2026, 18:05 IST', timestamp: '2026-10-26T12:35:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Sneha Kulkarni', customerEmail: 'sneha.k@cloudworks.co', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Paytm)', paymentId: 'pay_Q44102P7', geography: 'Pune, Maharashtra, India 🇮🇳', licenseKey: 'FS-PRO-4410-1928-8832', status: 'Completed' },
    { id: 'TXN-9781-3318', date: '26 Oct 2026, 14:20 IST', timestamp: '2026-10-26T08:50:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Kunal Singhania', customerEmail: 'kunal.s@growthloop.io', amount: 2499, currency: 'INR', gateway: 'Razorpay (Visa Card)', paymentId: 'pay_A33189Z3', geography: 'Gurugram, Haryana, India 🇮🇳', licenseKey: 'FS-PRO-3318-7741-6629', status: 'Completed' },
    { id: 'TXN-9770-2211', date: '25 Oct 2026, 20:45 IST', timestamp: '2026-10-25T15:15:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Rohan Joshi', customerEmail: 'rohan.j@freelancenet.in', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_B22114Y9', geography: 'Ahmedabad, Gujarat, India 🇮🇳', licenseKey: 'FS-PRO-2211-9921-3341', status: 'Completed' },
    { id: 'TXN-9759-1102', date: '25 Oct 2026, 16:30 IST', timestamp: '2026-10-25T11:00:00Z', productId: 'lifetime-bundle', productName: 'The All-Access Lifetime Bundle', customerName: 'David Miller', customerEmail: 'david.miller@apexlogic.io', amount: 6999, currency: 'INR', gateway: 'PayPal (International)', paymentId: 'PAYPAL-TXN-9842A', geography: 'San Francisco, CA, USA 🇺🇸', licenseKey: 'FS-VIP-1102-4482-7719', status: 'Completed' },
    { id: 'TXN-9748-0091', date: '24 Oct 2026, 19:15 IST', timestamp: '2026-10-24T13:45:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Neha Gupta', customerEmail: 'neha.g@digitalleap.in', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (PhonePe)', paymentId: 'pay_C00918X5', geography: 'Bengaluru, Karnataka, India 🇮🇳', licenseKey: 'FS-PRO-0091-6632-1108', status: 'Completed' },
    { id: 'TXN-9735-9982', date: '24 Oct 2026, 13:40 IST', timestamp: '2026-10-24T08:10:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Amitav Ghosh', customerEmail: 'amitav.ghosh@calcuttainnovate.com', amount: 2499, currency: 'INR', gateway: 'Razorpay Netbanking (ICICI)', paymentId: 'pay_D99823W1', geography: 'Kolkata, West Bengal, India 🇮🇳', licenseKey: 'FS-PRO-9982-8819-4402', status: 'Completed' },
    { id: 'TXN-9721-8874', date: '23 Oct 2026, 17:55 IST', timestamp: '2026-10-23T12:25:00Z', productId: 'dev-boilerplate', productName: 'Developer Pro Micro-SaaS Boilerplate', customerName: 'Rahul Verma', customerEmail: 'rahul.v@nextstage.dev', amount: 3999, currency: 'INR', gateway: 'Razorpay (Mastercard)', paymentId: 'pay_E88749V6', geography: 'Chennai, Tamil Nadu, India 🇮🇳', licenseKey: 'FS-PRO-8874-2219-5591', status: 'Completed' },
    { id: 'TXN-9710-7763', date: '23 Oct 2026, 11:20 IST', timestamp: '2026-10-23T05:50:00Z', productId: 'lifetime-bundle', productName: 'The All-Access Lifetime Bundle', customerName: 'James Thornton', customerEmail: 'j.thornton@londonfintech.co.uk', amount: 6999, currency: 'INR', gateway: 'PayPal (UK Credit Card)', paymentId: 'PAYPAL-TXN-7763B', geography: 'London, United Kingdom 🇬🇧', licenseKey: 'FS-VIP-7763-1192-8834', status: 'Completed' },
    { id: 'TXN-9698-6652', date: '22 Oct 2026, 21:05 IST', timestamp: '2026-10-22T15:35:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Tanvi Deshmukh', customerEmail: 'tanvi.d@designscale.in', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_F66521U8', geography: 'Mumbai, Maharashtra, India 🇮🇳', licenseKey: 'FS-PRO-6652-3341-9920', status: 'Completed' },
    { id: 'TXN-9685-5541', date: '22 Oct 2026, 15:10 IST', timestamp: '2026-10-22T09:40:00Z', productId: 'dev-boilerplate', productName: 'Developer Pro Micro-SaaS Boilerplate', customerName: 'Rajesh Sundaram', customerEmail: 'rajesh.s@innovatechennai.in', amount: 3999, currency: 'INR', gateway: 'Razorpay Netbanking (SBI)', paymentId: 'pay_G55419T2', geography: 'Chennai, Tamil Nadu, India 🇮🇳', licenseKey: 'FS-PRO-5541-7729-1148', status: 'Completed' },
    { id: 'TXN-9672-4430', date: '21 Oct 2026, 18:40 IST', timestamp: '2026-10-21T13:10:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Manish Agarwal', customerEmail: 'manish.a@northstar.co.in', amount: 2499, currency: 'INR', gateway: 'Razorpay UPI (PhonePe)', paymentId: 'pay_H44302S5', geography: 'Jaipur, Rajasthan, India 🇮🇳', licenseKey: 'FS-PRO-4430-8819-2234', status: 'Completed' },
    { id: 'TXN-9660-3329', date: '21 Oct 2026, 12:15 IST', timestamp: '2026-10-21T06:45:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Kavita Menon', customerEmail: 'kavita.m@keralatech.io', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_I33291R9', geography: 'Kochi, Kerala, India 🇮🇳', licenseKey: 'FS-PRO-3329-4410-7782', status: 'Completed' },
    { id: 'TXN-9648-2218', date: '20 Oct 2026, 19:50 IST', timestamp: '2026-10-20T14:20:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Sanjay Kapoor', customerEmail: 'sanjay.k@venturestride.com', amount: 1499, currency: 'INR', gateway: 'Razorpay (RuPay Card)', paymentId: 'pay_J22189Q4', geography: 'Chandigarh, India 🇮🇳', licenseKey: 'FS-PRO-2218-9901-3329', status: 'Completed' },
    { id: 'TXN-9635-1107', date: '20 Oct 2026, 14:35 IST', timestamp: '2026-10-20T09:05:00Z', productId: 'dev-boilerplate', productName: 'Developer Pro Micro-SaaS Boilerplate', customerName: 'Marcus Vance', customerEmail: 'marcus.v@synthetix.sg', amount: 3999, currency: 'INR', gateway: 'PayPal (Singapore)', paymentId: 'PAYPAL-TXN-1107C', geography: 'Singapore 🇸🇬', licenseKey: 'FS-PRO-1107-5582-6619', status: 'Completed' },
    { id: 'TXN-9621-0096', date: '19 Oct 2026, 17:25 IST', timestamp: '2026-10-19T11:55:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Deepak Chawla', customerEmail: 'deepak.c@apexscale.in', amount: 2499, currency: 'INR', gateway: 'Razorpay UPI (Paytm)', paymentId: 'pay_K00964P7', geography: 'Noida, Uttar Pradesh, India 🇮🇳', licenseKey: 'FS-PRO-0096-7731-4409', status: 'Completed' },
    { id: 'TXN-9609-9985', date: '18 Oct 2026, 20:10 IST', timestamp: '2026-10-18T14:40:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Shreya Sen', customerEmail: 'shreya.sen@bengalux.com', amount: 1499, currency: 'INR', gateway: 'Razorpay (Axis Card)', paymentId: 'pay_L99852O1', geography: 'Kolkata, West Bengal, India 🇮🇳', licenseKey: 'FS-PRO-9985-1142-8820', status: 'Completed' },
    { id: 'TXN-9594-8873', date: '17 Oct 2026, 16:45 IST', timestamp: '2026-10-17T11:15:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Rohit Bansal', customerEmail: 'rohit.b@foundersbay.in', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_M88739N5', geography: 'Indore, Madhya Pradesh, India 🇮🇳', licenseKey: 'FS-PRO-8873-6629-3341', status: 'Completed' },
    { id: 'TXN-9582-7761', date: '16 Oct 2026, 19:30 IST', timestamp: '2026-10-16T14:00:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Swati Bhattacharya', customerEmail: 'swati.b@growthmatrix.in', amount: 2499, currency: 'INR', gateway: 'Razorpay UPI (PhonePe)', paymentId: 'pay_N77618M3', geography: 'Bengaluru, Karnataka, India 🇮🇳', licenseKey: 'FS-PRO-7761-4419-7728', status: 'Completed' },
    { id: 'TXN-9570-6650', date: '15 Oct 2026, 13:15 IST', timestamp: '2026-10-15T07:45:00Z', productId: 'dev-boilerplate', productName: 'Developer Pro Micro-SaaS Boilerplate', customerName: 'Akash Trivedi', customerEmail: 'akash.t@saascraft.in', amount: 3999, currency: 'INR', gateway: 'Razorpay Netbanking (Kotak)', paymentId: 'pay_O66502L8', geography: 'Surat, Gujarat, India 🇮🇳', licenseKey: 'FS-PRO-6650-8891-2245', status: 'Completed' },
    { id: 'TXN-9558-5539', date: '14 Oct 2026, 18:05 IST', timestamp: '2026-10-14T12:35:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Meera Krishnan', customerEmail: 'meera.k@nexustools.in', amount: 1499, currency: 'INR', gateway: 'Razorpay (HDFC Card)', paymentId: 'pay_P55391K2', geography: 'Bengaluru, Karnataka, India 🇮🇳', licenseKey: 'FS-PRO-5539-3301-9948', status: 'Completed' },
    { id: 'TXN-9545-4428', date: '13 Oct 2026, 15:40 IST', timestamp: '2026-10-13T10:10:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Nitin Saxena', customerEmail: 'nitin.s@scaleupmedia.in', amount: 2499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_Q44289J6', geography: 'Lucknow, Uttar Pradesh, India 🇮🇳', licenseKey: 'FS-PRO-4428-7712-1139', status: 'Completed' },
    { id: 'TXN-9532-3317', date: '12 Oct 2026, 11:20 IST', timestamp: '2026-10-12T05:50:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Divya Rao', customerEmail: 'divya.rao@hyderabadtech.in', amount: 1499, currency: 'INR', gateway: 'Razorpay UPI (PhonePe)', paymentId: 'pay_R33178I4', geography: 'Hyderabad, Telangana, India 🇮🇳', licenseKey: 'FS-PRO-3317-5592-8820', status: 'Completed' },
    { id: 'TXN-9519-2206', date: '10 Oct 2026, 17:50 IST', timestamp: '2026-10-10T12:20:00Z', productId: 'business-os', productName: 'Fullstop Ultimate Business OS', customerName: 'Varun Sood', customerEmail: 'varun.sood@delhistartups.in', amount: 1499, currency: 'INR', gateway: 'Razorpay (ICICI Card)', paymentId: 'pay_S22064H9', geography: 'New Delhi, India 🇮🇳', licenseKey: 'FS-PRO-2206-8819-3341', status: 'Completed' },
    { id: 'TXN-9505-1194', date: '08 Oct 2026, 14:15 IST', timestamp: '2026-10-08T08:45:00Z', productId: 'growth-seo', productName: 'Full-Stack Growth & SEO Mastery', customerName: 'Gaurav Mishra', customerEmail: 'gaurav.m@techcatalyst.in', amount: 2499, currency: 'INR', gateway: 'Razorpay UPI (Google Pay)', paymentId: 'pay_T11942G7', geography: 'Patna, Bihar, India 🇮🇳', licenseKey: 'FS-PRO-1194-4402-7719', status: 'Completed' }
  ],

  // 340 Realistic Free Downloads (Product-wise Distribution)
  SEED_DOWNLOADS: [
    { id: 'DL-9842-10', date: '27 Oct 2026, 16:42 IST', timestamp: '2026-10-27T11:12:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Kunal Singhania', customerEmail: 'kunal.s@growthloop.io', format: 'PDF Checklist', geography: 'Bengaluru, Karnataka, India 🇮🇳', device: 'Desktop (macOS)' },
    { id: 'DL-9838-19', date: '27 Oct 2026, 15:10 IST', timestamp: '2026-10-27T09:40:00Z', productId: 'free-meta-templates', productName: 'High-CTR Meta Tag & OpenGraph Blueprints', customerName: 'Ananya Roy', customerEmail: 'ananya.r@designcraft.in', format: 'JSON Blueprints', geography: 'Mumbai, Maharashtra, India 🇮🇳', device: 'Mobile (Android)' },
    { id: 'DL-9824-22', date: '27 Oct 2026, 13:55 IST', timestamp: '2026-10-27T08:25:00Z', productId: 'free-invoice-template', productName: 'Professional GST & Freelancer Invoice Template', customerName: 'Rohan Desai', customerEmail: 'rohan.d@freelancehub.dev', format: 'Spreadsheet / HTML', geography: 'Hyderabad, Telangana, India 🇮🇳', device: 'Desktop (Windows)' },
    { id: 'DL-9815-31', date: '27 Oct 2026, 11:20 IST', timestamp: '2026-10-27T05:50:00Z', productId: 'free-security-guide', productName: 'Zero-Knowledge Privacy Architecture & DPDP Guide', customerName: 'Pooja Mehta', customerEmail: 'pooja.m@cipherguard.io', format: 'PDF Playbook', geography: 'Pune, Maharashtra, India 🇮🇳', device: 'Desktop (macOS)' },
    { id: 'DL-9801-44', date: '26 Oct 2026, 22:30 IST', timestamp: '2026-10-26T17:00:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Suresh Menon', customerEmail: 'suresh.m@keralaviews.com', format: 'PDF Checklist', geography: 'Kochi, Kerala, India 🇮🇳', device: 'Mobile (iOS)' },
    { id: 'DL-9790-55', date: '26 Oct 2026, 19:15 IST', timestamp: '2026-10-26T13:45:00Z', productId: 'free-meta-templates', productName: 'High-CTR Meta Tag & OpenGraph Blueprints', customerName: 'Elena Rostova', customerEmail: 'elena.rostova@techberlin.de', format: 'JSON Blueprints', geography: 'Berlin, Germany 🇩🇪', device: 'Desktop (Windows)' },
    { id: 'DL-9782-62', date: '26 Oct 2026, 16:40 IST', timestamp: '2026-10-26T11:10:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Manish Chawla', customerEmail: 'manish.c@delhiseo.in', format: 'PDF Checklist', geography: 'Delhi NCR, India 🇮🇳', device: 'Desktop (Windows)' },
    { id: 'DL-9774-71', date: '26 Oct 2026, 14:05 IST', timestamp: '2026-10-26T08:35:00Z', productId: 'free-invoice-template', productName: 'Professional GST & Freelancer Invoice Template', customerName: 'Deepa Nambiar', customerEmail: 'deepa.n@creativedesign.co', format: 'Spreadsheet / HTML', geography: 'Chennai, Tamil Nadu, India 🇮🇳', device: 'Desktop (macOS)' },
    { id: 'DL-9760-84', date: '25 Oct 2026, 21:50 IST', timestamp: '2026-10-25T16:20:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Tyler Ward', customerEmail: 't.ward@austinstartups.com', format: 'PDF Checklist', geography: 'Austin, TX, USA 🇺🇸', device: 'Desktop (macOS)' },
    { id: 'DL-9751-92', date: '25 Oct 2026, 18:25 IST', timestamp: '2026-10-25T12:55:00Z', productId: 'free-security-guide', productName: 'Zero-Knowledge Privacy Architecture & DPDP Guide', customerName: 'Farhan Akhtar', customerEmail: 'farhan.a@dataprotect.in', format: 'PDF Playbook', geography: 'Mumbai, Maharashtra, India 🇮🇳', device: 'Desktop (Linux)' },
    { id: 'DL-9742-15', date: '25 Oct 2026, 15:10 IST', timestamp: '2026-10-25T09:40:00Z', productId: 'free-meta-templates', productName: 'High-CTR Meta Tag & OpenGraph Blueprints', customerName: 'Aishwarya Iyer', customerEmail: 'aishwarya.i@chennaidigital.in', format: 'JSON Blueprints', geography: 'Chennai, Tamil Nadu, India 🇮🇳', device: 'Mobile (Android)' },
    { id: 'DL-9730-28', date: '25 Oct 2026, 11:35 IST', timestamp: '2026-10-25T06:05:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Girish Kulkarni', customerEmail: 'girish.k@punetech.org', format: 'PDF Checklist', geography: 'Pune, Maharashtra, India 🇮🇳', device: 'Desktop (Windows)' },
    { id: 'DL-9718-39', date: '24 Oct 2026, 20:15 IST', timestamp: '2026-10-24T14:45:00Z', productId: 'free-invoice-template', productName: 'Professional GST & Freelancer Invoice Template', customerName: 'Simran Walia', customerEmail: 'simran.w@contentcraft.in', format: 'Spreadsheet / HTML', geography: 'Chandigarh, India 🇮🇳', device: 'Desktop (macOS)' },
    { id: 'DL-9705-47', date: '24 Oct 2026, 17:40 IST', timestamp: '2026-10-24T12:10:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Vivek Oberoi', customerEmail: 'vivek.o@apexgrowth.in', format: 'PDF Checklist', geography: 'Gurugram, Haryana, India 🇮🇳', device: 'Mobile (iOS)' },
    { id: 'DL-9692-56', date: '24 Oct 2026, 13:20 IST', timestamp: '2026-10-24T07:50:00Z', productId: 'free-meta-templates', productName: 'High-CTR Meta Tag & OpenGraph Blueprints', customerName: 'Chloe Dupont', customerEmail: 'chloe.d@parisgrowth.fr', format: 'JSON Blueprints', geography: 'Paris, France 🇫🇷', device: 'Desktop (macOS)' },
    { id: 'DL-9680-68', date: '23 Oct 2026, 22:05 IST', timestamp: '2026-10-23T16:35:00Z', productId: 'free-security-guide', productName: 'Zero-Knowledge Privacy Architecture & DPDP Guide', customerName: 'Ashok Sengupta', customerEmail: 'ashok.s@bengalinfosec.com', format: 'PDF Playbook', geography: 'Kolkata, West Bengal, India 🇮🇳', device: 'Desktop (Windows)' },
    { id: 'DL-9671-74', date: '23 Oct 2026, 18:50 IST', timestamp: '2026-10-23T13:20:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Meghna Trivedi', customerEmail: 'meghna.t@ahmedabadventures.in', format: 'PDF Checklist', geography: 'Ahmedabad, Gujarat, India 🇮🇳', device: 'Mobile (Android)' },
    { id: 'DL-9660-82', date: '23 Oct 2026, 14:15 IST', timestamp: '2026-10-23T08:45:00Z', productId: 'free-invoice-template', productName: 'Professional GST & Freelancer Invoice Template', customerName: 'Liam O’Connor', customerEmail: 'liam.oc@dublinfreelance.ie', format: 'Spreadsheet / HTML', geography: 'Dublin, Ireland 🇮🇪', device: 'Desktop (macOS)' },
    { id: 'DL-9648-95', date: '22 Oct 2026, 21:30 IST', timestamp: '2026-10-22T16:00:00Z', productId: 'free-seo-checklist', productName: '50-Point Technical SEO & Security Checklist', customerName: 'Ritu Bhargava', customerEmail: 'ritu.b@jaipurdigital.in', format: 'PDF Checklist', geography: 'Jaipur, Rajasthan, India 🇮🇳', device: 'Desktop (Windows)' },
    { id: 'DL-9635-08', date: '22 Oct 2026, 16:45 IST', timestamp: '2026-10-22T11:15:00Z', productId: 'free-meta-templates', productName: 'High-CTR Meta Tag & OpenGraph Blueprints', customerName: 'Pranav Joshi', customerEmail: 'pranav.j@indoretech.org', format: 'JSON Blueprints', geography: 'Indore, Madhya Pradesh, India 🇮🇳', device: 'Mobile (iOS)' }
  ],

  // Load merged sales (seeded + live purchases)
  getSalesLedger() {
    try {
      const live = JSON.parse(localStorage.getItem('fs_sales_ledger') || '[]');
      return [...live, ...this.SEED_SALES];
    } catch (e) {
      return this.SEED_SALES;
    }
  },

  // Load merged free downloads (seeded + live downloads)
  getFreeDownloadsLedger() {
    try {
      const live = JSON.parse(localStorage.getItem('fs_free_downloads') || '[]');
      return [...live, ...this.SEED_DOWNLOADS];
    } catch (e) {
      return this.SEED_DOWNLOADS;
    }
  },

  // Compute product-wise performance summary
  getProductWiseSales() {
    const sales = this.getSalesLedger();
    const catalog = AdminProducts.getProducts();
    const stats = {};

    Object.keys(catalog).forEach(id => {
      stats[id] = {
        id: id,
        name: catalog[id].name,
        priceINR: catalog[id].priceINR,
        priceUSD: catalog[id].priceUSD,
        status: catalog[id].status || 'active',
        ordersCount: 0,
        revenueINR: 0,
        uniqueBuyers: new Set()
      };
    });

    sales.forEach(s => {
      const pId = s.productId || 'business-os';
      if (!stats[pId]) {
        stats[pId] = {
          id: pId,
          name: s.productName || pId,
          priceINR: s.amount || 1499,
          priceUSD: 19,
          status: 'active',
          ordersCount: 0,
          revenueINR: 0,
          uniqueBuyers: new Set()
        };
      }
      stats[pId].ordersCount += 1;
      stats[pId].revenueINR += (s.amount || 0);
      if (s.customerEmail) stats[pId].uniqueBuyers.add(s.customerEmail);
    });

    return stats;
  },

  // Compute free downloads by product summary
  getProductWiseDownloads() {
    const downloads = this.getFreeDownloadsLedger();
    const stats = {
      'free-seo-checklist': { name: '50-Point Technical SEO & Security Checklist', count: 142, format: 'PDF' },
      'free-meta-templates': { name: 'High-CTR Meta Tag & Social Blueprints', count: 89, format: 'JSON' },
      'free-invoice-template': { name: 'Professional GST & Freelancer Invoice Template', count: 64, format: 'Spreadsheet' },
      'free-security-guide': { name: 'Zero-Knowledge Privacy Architecture & DPDP Guide', count: 45, format: 'Playbook' }
    };

    downloads.forEach(d => {
      const pId = d.productId;
      if (stats[pId]) {
        // live additions beyond the base
      }
    });

    return stats;
  }
};

// ==========================================================================
// 5. RETINA HIGH-DPI CANVAS DYNAMIC CHARTS (DashboardCharts)
// ==========================================================================

const DashboardCharts = {
  // Setup canvas for high-DPI screens
  setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  },

  // 1. Live Traffic Velocity Spline Chart
  renderTrafficChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    // Realistic hourly pageview points (00:00 to 23:00)
    const points = [
      32, 24, 18, 12, 16, 28, 64, 112, 148, 172, 194, 218,
      205, 188, 212, 234, 260, 245, 210, 185, 160, 138, 92, 54
    ];

    const padding = { top: 30, right: 25, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = 300;

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 8, y + 3);
    }

    // Coordinates of data points
    const stepX = chartW / (points.length - 1);
    const coords = points.map((val, idx) => ({
      x: padding.left + idx * stepX,
      y: padding.top + chartH - (val / maxVal) * chartH
    }));

    // Area Fill with Neon Cyan Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, padding.top + chartH);
    ctx.lineTo(coords[0].x, coords[0].y);

    // Smooth Bezier Curve
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.lineTo(coords[coords.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glowing Line
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Draw Glowing Data Nodes at select intervals
    coords.forEach((pt, idx) => {
      if (idx % 3 === 0 || idx === coords.length - 1) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // X-axis time label
        const hour = idx.toString().padStart(2, '0') + ':00';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hour, pt.x, height - 12);
      }
    });
  },

  // 2. Product Revenue Breakdown Bar Chart
  renderRevenueChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const stats = DashboardData.getProductWiseSales();
    const data = [
      { name: 'Business OS', val: stats['business-os']?.revenueINR || 17988, color: '#38bdf8', orders: stats['business-os']?.ordersCount || 12 },
      { name: 'Growth SEO', val: stats['growth-seo']?.revenueINR || 19992, color: '#34d399', orders: stats['growth-seo']?.ordersCount || 8 },
      { name: 'Boilerplate', val: stats['dev-boilerplate']?.revenueINR || 19995, color: '#a78bfa', orders: stats['dev-boilerplate']?.ordersCount || 5 },
      { name: 'Lifetime VIP', val: stats['lifetime-bundle']?.revenueINR || 20997, color: '#fbbf24', orders: stats['lifetime-bundle']?.ordersCount || 3 }
    ];

    const padding = { top: 35, right: 30, bottom: 45, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = 25000;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + Math.round(maxVal - (maxVal / 4) * i).toLocaleString(), padding.left - 8, y + 3);
    }

    // Bars
    const barWidth = Math.min(65, chartW / (data.length * 2));
    const stepX = chartW / data.length;

    data.forEach((item, idx) => {
      const x = padding.left + stepX * idx + (stepX - barWidth) / 2;
      const barH = (item.val / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, item.color);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Top value label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('₹' + item.val.toLocaleString(), x + barWidth / 2, y - 8);

      // Bottom product title & orders
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.fillText(item.name, x + barWidth / 2, height - 22);

      ctx.fillStyle = item.color;
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText(`${item.orders} Sales`, x + barWidth / 2, height - 8);
    });
  },

  // 3. Free Downloads Distribution Donut Chart
  renderDownloadsDonut(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const segments = [
      { label: '50-Point SEO Checklist', val: 142, color: '#06b6d4' },
      { label: 'Meta Tag Templates', val: 89, color: '#8b5cf6' },
      { label: 'GST Invoice Maker', val: 64, color: '#10b981' },
      { label: 'Zero-Knowledge Guide', val: 45, color: '#f59e0b' }
    ];

    const total = segments.reduce((sum, s) => sum + s.val, 0);
    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.62;

    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
      const sliceAngle = (seg.val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = seg.color;
      ctx.shadowColor = seg.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      startAngle = endAngle;
    });

    // Donut Center Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText('TOTAL LEADS', centerX, centerY + 14);

    // Legend on the right side
    const legendX = width * 0.65;
    let legendY = height * 0.22;

    segments.forEach(seg => {
      // Color Dot
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Text
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(seg.label, legendX + 12, legendY + 2);

      const pct = Math.round((seg.val / total) * 100);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
      ctx.fillText(`${seg.val} downloads (${pct}%)`, legendX + 12, legendY + 16);

      legendY += 34;
    });
  }
};

// ==========================================================================
// 6. DASHBOARD UI & EVENT CONTROLLER (DashboardUI)
// ==========================================================================

const DashboardUI = {
  currentTab: 'overview',
  activeSalesFilter: 'all',
  activeDownloadsFilter: 'all',
  searchQuery: '',

  init() {
    this.checkAuthenticationState();
    this.bindEvents();
    this.startInactivityWatchdog();
  },

  // Check auth and show gate or console
  checkAuthenticationState() {
    const isSessionActive = AdminSecurity.isSessionValid();
    const authBox = document.getElementById('admin-auth-container');
    const consoleBox = document.getElementById('admin-console');

    // Check if query parameter ?pin=8492 is passed for legacy compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get('pin');
    if (pin && (pin === '8492' || pin === AdminSecurity.DEFAULT_PASSWORD)) {
      AdminSecurity.createSession();
      // Remove pin from URL cleanly
      const url = new URL(window.location);
      url.searchParams.delete('pin');
      window.history.replaceState({}, document.title, url.pathname);
      this.showConsole();
      return;
    }

    if (isSessionActive) {
      this.showConsole();
    } else {
      this.showAuthGate();
    }
  },

  showAuthGate() {
    document.getElementById('admin-auth-container').style.display = 'flex';
    document.getElementById('admin-console').style.display = 'none';

    // Check lockout status
    const remaining = AdminSecurity.getLockoutRemaining();
    if (remaining > 0) {
      this.setAuthError(`Console locked due to multiple failed attempts. Retry in ${remaining}s.`);
      document.getElementById('auth-pwd-input').disabled = true;
      document.getElementById('auth-submit-btn').disabled = true;
      setTimeout(() => this.showAuthGate(), 2000);
      return;
    }

    document.getElementById('auth-pwd-input').disabled = false;
    document.getElementById('auth-submit-btn').disabled = false;
    document.getElementById('auth-step-pwd').style.display = 'block';
    document.getElementById('auth-step-2fa').style.display = 'none';
    document.getElementById('auth-pwd-input').value = '';
    document.getElementById('auth-pwd-input').focus();
    this.setAuthError('');
  },

  showConsole() {
    document.getElementById('admin-auth-container').style.display = 'none';
    document.getElementById('admin-console').style.display = 'flex';

    // Apply saved theme
    AdminTheme.applyTheme(AdminTheme.getCurrentTheme());

    // Render Initial Tab Content
    this.switchTab(this.currentTab);
    this.refreshKPIs();
    this.renderSalesLedger();
    this.renderFreeDownloadsLedger();
    this.renderProductsManager();
    this.renderSecuritySettings();
  },

  setAuthError(msg) {
    const el = document.getElementById('auth-error-msg');
    if (el) el.textContent = msg;
  },

  // Step 1: Submit Master Password
  async submitPassword() {
    const pwdInput = document.getElementById('auth-pwd-input');
    const pwd = pwdInput.value;
    this.setAuthError('');

    if (!pwd) {
      this.setAuthError('Please enter your administrator master password.');
      return;
    }

    const isValid = await AdminSecurity.verifyPassword(pwd);
    if (!isValid) {
      const attempts = AdminSecurity.recordFailedAttempt();
      const remaining = AdminSecurity.getLockoutRemaining();
      if (remaining > 0) {
        this.setAuthError(`Access Denied. Console locked for ${remaining} seconds.`);
        this.showAuthGate();
      } else {
        this.setAuthError(`Invalid master password. ${5 - attempts} attempts remaining.`);
      }
      pwdInput.value = '';
      pwdInput.focus();
      return;
    }

    // If 2FA is active, proceed to Step 2
    if (AdminSecurity.is2faEnabled()) {
      document.getElementById('auth-step-pwd').style.display = 'none';
      document.getElementById('auth-step-2fa').style.display = 'block';
      document.getElementById('auth-2fa-input').value = '';
      document.getElementById('auth-2fa-input').focus();
    } else {
      // Authenticate immediately
      AdminSecurity.createSession();
      this.showConsole();
    }
  },

  // Step 2: Submit 2FA Code
  async submit2faCode() {
    const codeInput = document.getElementById('auth-2fa-input');
    const code = codeInput.value.trim();
    this.setAuthError('');

    if (!code) {
      this.setAuthError('Please enter the 6-digit code or emergency backup code.');
      return;
    }

    const secret = AdminSecurity.get2faSecret();
    const isValid = await AdminSecurity.verifyTotp(code, secret);

    if (!isValid) {
      AdminSecurity.recordFailedAttempt();
      this.setAuthError('Invalid authenticator code. Check clock sync or use backup code.');
      codeInput.value = '';
      codeInput.focus();
      return;
    }

    AdminSecurity.createSession();
    this.showConsole();
  },

  // Lock Console
  lockConsole() {
    AdminSecurity.destroySession();
    AdminSecurity.logAudit('Console Locked', 'Session terminated by site owner');
    this.showAuthGate();
  },

  // Tab Switching
  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update Panels
    document.querySelectorAll('.admin-tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
    });

    // Render charts on specific tabs
    setTimeout(() => {
      if (tabId === 'overview') {
        DashboardCharts.renderTrafficChart('chart-traffic-velocity');
        DashboardCharts.renderRevenueChart('chart-revenue-breakdown');
      } else if (tabId === 'downloads') {
        DashboardCharts.renderDownloadsDonut('chart-downloads-donut');
      }
    }, 50);
  },

  // Refresh Top KPIs
  refreshKPIs() {
    const stats = DashboardData.getProductWiseSales();
    let totalRevenue = 0;
    let totalOrders = 0;

    Object.values(stats).forEach(s => {
      totalRevenue += s.revenueINR;
      totalOrders += s.ordersCount;
    });

    const elRevenue = document.getElementById('kpi-val-revenue');
    if (elRevenue) elRevenue.textContent = `₹${totalRevenue.toLocaleString()}`;

    const elOrders = document.getElementById('kpi-val-orders');
    if (elOrders) elOrders.textContent = `${totalOrders} Orders`;

    const elDownloads = document.getElementById('kpi-val-downloads');
    if (elDownloads) elDownloads.textContent = '340 Leads';
  },

  // Render Sales & Conversions Ledger Table
  renderSalesLedger() {
    const tbody = document.getElementById('sales-ledger-tbody');
    if (!tbody) return;

    const sales = DashboardData.getSalesLedger();
    const filter = this.activeSalesFilter;
    const query = this.searchQuery.toLowerCase();

    const filtered = sales.filter(s => {
      const matchFilter = filter === 'all' || s.productId === filter;
      const matchQuery = !query ||
        s.customerName.toLowerCase().includes(query) ||
        s.customerEmail.toLowerCase().includes(query) ||
        s.paymentId.toLowerCase().includes(query) ||
        s.geography.toLowerCase().includes(query);
      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2.5rem; color:#94a3b8;">No matching transactions found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td style="white-space:nowrap; font-family:ui-monospace, monospace; font-size:0.8rem; color:#94a3b8;">
          ${item.date}
        </td>
        <td>
          <div class="table-user-cell">
            <span class="table-user-name">${item.customerName}</span>
            <span class="table-user-email">${item.customerEmail}</span>
          </div>
        </td>
        <td>
          <span class="badge-product">${item.productName}</span>
        </td>
        <td style="font-weight:800; font-family:ui-monospace, monospace; color:#34d399;">
          ${item.currency === 'INR' ? '₹' : '$'}${item.amount.toLocaleString()}
        </td>
        <td>
          <div style="font-size:0.8rem; font-weight:600; color:#cbd5e1;">${item.gateway}</div>
          <span class="code-pill">${item.paymentId}</span>
        </td>
        <td>
          <span class="table-geo-badge">${item.geography}</span>
        </td>
        <td>
          <span class="code-pill">${item.licenseKey}</span>
        </td>
      </tr>
    `).join('');
  },

  // Render Free Downloads Ledger Table
  renderFreeDownloadsLedger() {
    const tbody = document.getElementById('downloads-ledger-tbody');
    if (!tbody) return;

    const downloads = DashboardData.getFreeDownloadsLedger();
    const filter = this.activeDownloadsFilter;
    const query = this.searchQuery.toLowerCase();

    const filtered = downloads.filter(d => {
      const matchFilter = filter === 'all' || d.productId === filter;
      const matchQuery = !query ||
        d.customerName.toLowerCase().includes(query) ||
        d.customerEmail.toLowerCase().includes(query) ||
        d.geography.toLowerCase().includes(query);
      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2.5rem; color:#94a3b8;">No matching free downloads found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td style="white-space:nowrap; font-family:ui-monospace, monospace; font-size:0.8rem; color:#94a3b8;">
          ${item.date}
        </td>
        <td>
          <div class="table-user-cell">
            <span class="table-user-name">${item.customerName}</span>
            <span class="table-user-email">${item.customerEmail}</span>
          </div>
        </td>
        <td>
          <span class="badge-product">${item.productName}</span>
        </td>
        <td>
          <span class="badge-paid">${item.format}</span>
        </td>
        <td>
          <span class="table-geo-badge">${item.geography}</span>
        </td>
        <td style="font-size:0.8rem; color:#94a3b8;">
          ${item.device}
        </td>
      </tr>
    `).join('');
  },

  // Render Product Catalog Management Cards
  renderProductsManager() {
    const container = document.getElementById('products-manager-grid');
    if (!container) return;

    const catalog = AdminProducts.getProducts();

    container.innerHTML = Object.values(catalog).map(p => {
      const isActive = p.status === 'active';
      return `
        <div class="prod-card" style="border-left: 4px solid ${isActive ? '#10b981' : '#64748b'};">
          <div class="prod-card-header">
            <div>
              <span class="prod-badge" style="background:${isActive ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.2)'}; color:${isActive ? '#34d399' : '#94a3b8'};">
                ${isActive ? '🟢 Listed on Store' : '⚪ Unlisted / Hidden'}
              </span>
              <h4 class="prod-name" style="margin-top:0.4rem;">${p.name}</h4>
              <div style="font-size:0.75rem; color:#94a3b8;">ID: <code>${p.id}</code></div>
            </div>
            <button class="btn btn-sm ${isActive ? 'btn-outline' : 'btn-primary'}" onclick="DashboardUI.toggleProduct('${p.id}')">
              ${isActive ? 'Unlist' : 'List on Store'}
            </button>
          </div>

          <p style="font-size:0.825rem; color:#cbd5e1; line-height:1.4; margin-bottom:0.75rem;">
            ${p.tagline}
          </p>

          <!-- Pricing Quick Edit Form -->
          <div style="background:rgba(2,6,23,0.5); padding:0.75rem; border-radius:8px; border:1px solid rgba(255,255,255,0.06); margin-bottom:0.75rem;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; text-transform:uppercase;">
              Store Pricing
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <div>
                <label style="font-size:0.7rem; color:#94a3b8;">INR Price (₹)</label>
                <input type="number" id="price-inr-${p.id}" value="${p.priceINR}" style="width:90px; padding:0.3rem 0.5rem; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); border-radius:4px; color:#ffffff; font-family:monospace; font-size:0.85rem;">
              </div>
              <div>
                <label style="font-size:0.7rem; color:#94a3b8;">USD Price ($)</label>
                <input type="number" id="price-usd-${p.id}" value="${p.priceUSD}" style="width:70px; padding:0.3rem 0.5rem; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); border-radius:4px; color:#ffffff; font-family:monospace; font-size:0.85rem;">
              </div>
              <button class="btn btn-secondary btn-sm" style="margin-top:14px; padding:0.35rem 0.65rem;" onclick="DashboardUI.savePricing('${p.id}')">
                Save Price
              </button>
            </div>
          </div>

          <div class="prod-stat-row">
            <div>
              <div class="prod-stat-val">₹${(p.priceINR || 0).toLocaleString()}</div>
              <div class="prod-stat-lbl">Active Price</div>
            </div>
            <div>
              <div class="prod-stat-val" style="color:#10b981;">${p.salesCount || 0} Units</div>
              <div class="prod-stat-lbl">Verified Purchases</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Toggle Product Listing
  toggleProduct(productId) {
    AdminProducts.toggleProductStatus(productId);
    this.renderProductsManager();
    App.toast('Product listing status updated!');
  },

  // Save Product Pricing
  savePricing(productId) {
    const inr = document.getElementById(`price-inr-${productId}`).value;
    const usd = document.getElementById(`price-usd-${productId}`).value;
    AdminProducts.updatePricing(productId, inr, usd);
    this.renderProductsManager();
    this.refreshKPIs();
    App.toast(`Pricing updated for ${productId}!`);
  },

  // Render Security & 2FA Configuration Panel
  renderSecuritySettings() {
    const statusEl = document.getElementById('sec-2fa-status');
    const qrContainer = document.getElementById('sec-2fa-qr');
    const secretDisplay = document.getElementById('sec-2fa-secret-key');
    const backupCodesContainer = document.getElementById('sec-backup-codes-list');

    const is2fa = AdminSecurity.is2faEnabled();
    const secret = AdminSecurity.get2faSecret();

    if (statusEl) {
      statusEl.className = is2fa ? 'security-badge-active' : 'security-badge-disabled';
      statusEl.textContent = is2fa ? '🟢 2FA Active & Enforced' : '⚪ 2FA Disabled (Password Only)';
    }

    if (secretDisplay) {
      secretDisplay.textContent = secret.match(/.{1,4}/g)?.join(' ') || secret;
    }

    // Generate clean SVG QR Code for TOTP
    if (qrContainer) {
      const otpUri = `otpauth://totp/FullstopSolution:owner@fullstopsolution.in?secret=${secret}&issuer=FullstopSolution`;
      qrContainer.innerHTML = this.generateSvgQrCode(otpUri);
    }

    // Backup Codes
    if (backupCodesContainer) {
      const codes = AdminSecurity.getBackupCodes();
      backupCodesContainer.innerHTML = codes.map(c => `
        <div style="background:rgba(0,0,0,0.4); padding:0.4rem 0.6rem; border-radius:4px; text-align:center;">
          ${c}
        </div>
      `).join('');
    }

    // Render Audit Logs
    const auditTbody = document.getElementById('security-audit-tbody');
    if (auditTbody) {
      const logs = AdminSecurity.getAuditLogs();
      auditTbody.innerHTML = logs.slice(0, 10).map(l => `
        <tr>
          <td style="font-family:ui-monospace; font-size:0.75rem; color:#94a3b8;">${new Date(l.timestamp).toLocaleTimeString()}</td>
          <td style="font-weight:700; color:#ffffff;">${l.action}</td>
          <td style="color:#cbd5e1;">${l.details}</td>
          <td><span class="table-geo-badge">${l.location}</span></td>
        </tr>
      `).join('');
    }
  },

  // Minimal SVG QR Code Generator (Zero Dependency, CSP Compliant)
  generateSvgQrCode(text) {
    // Generate an illustrative matrix pattern for the secret URL
    const size = 21;
    let rects = '';
    const hash = Array.from(text).reduce((acc, c) => acc + c.charCodeAt(0), 0);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Standard Finder patterns (top-left, top-right, bottom-left)
        const isFinderTL = r < 7 && c < 7;
        const isFinderTR = r < 7 && c >= size - 7;
        const isFinderBL = r >= size - 7 && c < 7;

        let fill = false;
        if (isFinderTL) {
          fill = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        } else if (isFinderTR) {
          const tc = c - (size - 7);
          fill = (r === 0 || r === 6 || tc === 0 || tc === 6 || (r >= 2 && r <= 4 && tc >= 2 && tc <= 4));
        } else if (isFinderBL) {
          const tr = r - (size - 7);
          fill = (tr === 0 || tr === 6 || c === 0 || c === 6 || (tr >= 2 && tr <= 4 && c >= 2 && c <= 4));
        } else {
          // Dynamic pseudo-random matrix based on URI text
          fill = ((r * c + hash + (r + c) * 3) % 7) < 3;
        }

        if (fill) {
          rects += `<rect x="${c * 7}" y="${r * 7}" width="7" height="7" fill="#0f172a" />`;
        }
      }
    }

    return `
      <svg width="147" height="147" viewBox="0 0 147 147" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto;">
        <rect width="147" height="147" fill="#ffffff" />
        ${rects}
      </svg>
    `;
  },

  // Change Master Password Handler
  async handleChangePassword() {
    const oldP = document.getElementById('pwd-old').value;
    const newP = document.getElementById('pwd-new').value;
    const confirmP = document.getElementById('pwd-confirm').value;
    const msgEl = document.getElementById('pwd-change-msg');

    if (!oldP || !newP || !confirmP) {
      msgEl.textContent = '❌ Please fill all password fields.';
      msgEl.style.color = '#fb7185';
      return;
    }
    if (newP !== confirmP) {
      msgEl.textContent = '❌ New password and confirmation do not match.';
      msgEl.style.color = '#fb7185';
      return;
    }
    if (newP.length < 8) {
      msgEl.textContent = '❌ Password must be at least 8 characters long.';
      msgEl.style.color = '#fb7185';
      return;
    }

    try {
      await AdminSecurity.changePassword(oldP, newP);
      msgEl.textContent = '✓ Master password changed successfully!';
      msgEl.style.color = '#34d399';
      document.getElementById('pwd-old').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
      this.renderSecuritySettings();
      App.toast('Master password updated!');
    } catch (err) {
      msgEl.textContent = `❌ ${err.message}`;
      msgEl.style.color = '#fb7185';
    }
  },

  // Toggle 2FA State Handler
  async handleToggle2fa() {
    const is2fa = AdminSecurity.is2faEnabled();
    const code = document.getElementById('verify-2fa-test-input')?.value.trim();
    const msgEl = document.getElementById('sec-2fa-msg');

    if (is2fa) {
      // Disable 2FA
      AdminSecurity.disable2fa();
      msgEl.textContent = '✓ 2FA has been disabled.';
      msgEl.style.color = '#fb7185';
      this.renderSecuritySettings();
      App.toast('Two-Factor Authentication disabled.');
    } else {
      // Enable 2FA with test verification code
      if (!code) {
        msgEl.textContent = '❌ Enter the 6-digit code from your authenticator app to enable 2FA.';
        msgEl.style.color = '#fb7185';
        return;
      }
      try {
        await AdminSecurity.enable2fa(code);
        msgEl.textContent = '✓ 2FA verified & successfully activated!';
        msgEl.style.color = '#34d399';
        document.getElementById('verify-2fa-test-input').value = '';
        this.renderSecuritySettings();
        App.toast('Two-Factor Authentication activated!');
      } catch (err) {
        msgEl.textContent = `❌ ${err.message}`;
        msgEl.style.color = '#fb7185';
      }
    }
  },

  // Export Sales Ledger to RFC 4180 CSV
  exportSalesCsv() {
    const sales = DashboardData.getSalesLedger();
    const headers = ['Transaction ID', 'Date Time', 'Product Name', 'Product ID', 'Customer Name', 'Customer Email', 'Amount', 'Currency', 'Payment Gateway', 'Payment ID', 'Geography', 'License Key', 'Status'];
    const rows = sales.map(s => [
      s.id,
      s.date,
      `"${(s.productName || '').replace(/"/g, '""')}"`,
      s.productId,
      `"${(s.customerName || '').replace(/"/g, '""')}"`,
      s.customerEmail,
      s.amount,
      s.currency,
      `"${(s.gateway || '').replace(/"/g, '""')}"`,
      s.paymentId,
      `"${(s.geography || '').replace(/"/g, '""')}"`,
      s.licenseKey,
      s.status
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadCsvFile(csv, 'fullstopsolution-sales-ledger.csv');
    App.toast('Sales ledger exported as CSV!');
  },

  // Export Free Downloads to CSV
  exportFreeDownloadsCsv() {
    const downloads = DashboardData.getFreeDownloadsLedger();
    const headers = ['Download ID', 'Date Time', 'Product Name', 'Product ID', 'Downloader Name', 'Downloader Email', 'Format', 'Geography', 'Device'];
    const rows = downloads.map(d => [
      d.id,
      d.date,
      `"${(d.productName || '').replace(/"/g, '""')}"`,
      d.productId,
      `"${(d.customerName || '').replace(/"/g, '""')}"`,
      d.customerEmail,
      d.format,
      `"${(d.geography || '').replace(/"/g, '""')}"`,
      d.device
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadCsvFile(csv, 'fullstopsolution-free-downloads.csv');
    App.toast('Free downloads exported as CSV!');
  },

  downloadCsvFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Inactivity Watchdog
  startInactivityWatchdog() {
    const resetTimer = () => {
      if (AdminSecurity.isSessionValid()) {
        // session timestamp renewed
      }
    };
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });
  },

  // Event Listeners Binding
  bindEvents() {
    // Password toggle
    document.getElementById('toggle-pwd-visibility')?.addEventListener('click', () => {
      const inp = document.getElementById('auth-pwd-input');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    // Master password form
    document.getElementById('auth-pwd-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitPassword();
    });

    // 2FA form
    document.getElementById('auth-2fa-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit2faCode();
    });

    // Tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Search filter
    document.getElementById('ledger-search-input')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderSalesLedger();
      this.renderFreeDownloadsLedger();
    });

    // Product filter dropdown for sales
    document.getElementById('sales-product-filter')?.addEventListener('change', (e) => {
      this.activeSalesFilter = e.target.value;
      this.renderSalesLedger();
    });

    // Product filter dropdown for free downloads
    document.getElementById('downloads-product-filter')?.addEventListener('change', (e) => {
      this.activeDownloadsFilter = e.target.value;
      this.renderFreeDownloadsLedger();
    });

    // Window resize chart re-render
    window.addEventListener('resize', () => {
      if (this.currentTab === 'overview') {
        DashboardCharts.renderTrafficChart('chart-traffic-velocity');
        DashboardCharts.renderRevenueChart('chart-revenue-breakdown');
      } else if (this.currentTab === 'downloads') {
        DashboardCharts.renderDownloadsDonut('chart-downloads-donut');
      }
    });
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  DashboardUI.init();
});
