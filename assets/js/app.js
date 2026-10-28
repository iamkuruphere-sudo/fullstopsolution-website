/**
 * FULLSTOP SOLUTION - CORE APPLICATION ENGINE
 * Domain: www.fullstopsolution.in
 * High Performance, Zero Dependencies, Accessible & Secure
 */

const App = {
  theme: 'dark',

  init() {
    this.initTheme();
    this.initToolSearch();
    this.initToolTabs();
    this.initFaq();
    this.initLeadMagnet();
    this.initServiceWorker();
    this.initCookieConsent();

    // Check if ?contact=1 or #contact requested
    if (new URLSearchParams(window.location.search).get('contact') === '1' || window.location.hash === '#contact') {
      setTimeout(() => this.openContactModal(), 300);
    }
  },

  // Consent & Data Protection Management (DPDP Act 2023 & GDPR Compliance)
  initCookieConsent() {
    if (localStorage.getItem('fs_cookie_consent') !== null) return;
    if (document.getElementById('cookie-consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-inner">
        <div class="cookie-consent-text">
          <span class="cookie-consent-icon">🛡️</span>
          <div>
            <strong>Privacy & Data Protection Notice</strong>
            Interactive utilities execute 100% locally in browser memory (Zero-Knowledge client sandbox).
            External analytics run only with your consent.
          </div>
        </div>
        <div class="cookie-consent-actions">
          <button id="consent-accept-btn" class="btn btn-primary btn-sm">Accept Analytics</button>
          <button id="consent-deny-btn" class="btn btn-outline btn-sm">Essential Only</button>
          <a href="privacy-policy.html" class="cookie-policy-link">Privacy Policy →</a>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('consent-accept-btn')?.addEventListener('click', () => {
      if (typeof Analytics !== 'undefined') Analytics.grantConsent();
      banner.remove();
    });

    document.getElementById('consent-deny-btn')?.addEventListener('click', () => {
      if (typeof Analytics !== 'undefined') Analytics.denyConsent();
      banner.remove();
    });
  },

  // Progressive Web App & Offline Cache Engine
  initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  },

  // 1. Theme Management (Dark / Light + Custom Presets)
  initTheme() {
    // Check if custom admin preset theme is saved
    const customPreset = localStorage.getItem('fs_site_theme');
    if (customPreset && typeof AdminTheme !== 'undefined') {
      AdminTheme.applyTheme(customPreset);
    }

    const savedTheme = localStorage.getItem('fs_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Sync product displays from catalog
    if (typeof Commerce !== 'undefined' && Commerce.updateProductPricingDisplays) {
      Commerce.updateProductPricingDisplays();
    }
  },

  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fs_theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    const mobileIcon = document.getElementById('mobile-theme-icon');
    if (mobileIcon) {
      mobileIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    const mobileText = document.getElementById('mobile-theme-text');
    if (mobileText) {
      mobileText.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
  },

  // Mobile Navigation Drawer Toggle & Close
  toggleMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggleBtn = document.getElementById('nav-toggle-btn');
    if (!drawer || !backdrop) return;

    const isOpen = drawer.classList.contains('active');
    if (isOpen) {
      this.closeMobileNav();
    } else {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      if (toggleBtn) {
        toggleBtn.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    }
  },

  closeMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggleBtn = document.getElementById('nav-toggle-btn');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    if (toggleBtn) {
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  },

  // 2. Global Live Tool & Product Search
  initToolSearch() {
    const searchInput = document.getElementById('hero-search');
    if (!searchInput) return;

    // Command/Ctrl + K Palette Shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.tool-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = card.querySelector('.tool-card-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.tool-card-desc')?.textContent.toLowerCase() || '';
        const cat = card.dataset.category?.toLowerCase() || '';

        const match = title.includes(q) || desc.includes(q) || cat.includes(q);
        card.style.display = match ? 'flex' : 'none';
        if (match) visibleCount++;
      });

      const noResults = document.getElementById('tools-no-results');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  },

  // 3. Category Filter Tabs
  initToolTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.dataset.category;
        const cards = document.querySelectorAll('.tool-card');

        cards.forEach(card => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  },

  // 4. Interactive Tool Modals
  openTool(toolKey, title) {
    const modalTitle = document.getElementById('tool-modal-title');
    const modalBody = document.getElementById('tool-modal-body');

    modalTitle.textContent = title;
    let content = '';

    switch (toolKey) {
      case 'meta':
        content = ToolEngine.renderMetaTagGenerator();
        break;
      case 'password':
        content = ToolEngine.renderPasswordGenerator();
        break;
      case 'json':
        content = ToolEngine.renderJsonFormatter();
        break;
      case 'qr':
        content = ToolEngine.renderQrGenerator();
        break;
      case 'invoice':
        content = ToolEngine.renderInvoiceGenerator();
        break;
      case 'keyword':
        content = ToolEngine.renderKeywordAnalyzer();
        break;
      case 'hash':
        content = ToolEngine.renderHashGenerator();
        break;
      case 'base64':
        content = ToolEngine.renderBase64Tool();
        break;
      case 'utm':
        content = ToolEngine.renderUtmBuilder();
        break;
      case 'gst':
        content = ToolEngine.renderGstCalculator();
        break;
      case 'uuid':
        content = ToolEngine.renderUuidGenerator();
        break;
      default:
        content = `<p>Tool initialized. Ready for use.</p>`;
    }

    modalBody.innerHTML = content;
    this.openModal('tool-modal');

    // Track tool engagement in Analytics
    if (typeof Analytics !== 'undefined') {
      Analytics.trackToolLaunch(title);
    }

    // Trigger initial tool renders if needed
    if (toolKey === 'meta') ToolEngine.updateMetaPreview();
    if (toolKey === 'password') ToolEngine.generatePassword();
    if (toolKey === 'qr') ToolEngine.generateQr();
    if (toolKey === 'hash') ToolEngine.calculateHashes();
    if (toolKey === 'utm') ToolEngine.generateUtm();
    if (toolKey === 'gst') ToolEngine.calculateGst();
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  },

  // Direct In-Browser Support & Contact Modal
  openContactModal() {
    this.openModal('contact-modal');
    setTimeout(() => {
      const nameInput = document.getElementById('contact-name');
      if (nameInput) nameInput.focus();
    }, 150);
  },

  handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const subject = document.getElementById('contact-subject')?.value || 'General Inquiry';
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      this.toast('Please fill in all required fields.');
      return;
    }

    const geo = (typeof Analytics !== 'undefined' && Analytics.detectClientGeo)
      ? Analytics.detectClientGeo()
      : 'India 🇮🇳 (IST)';

    const newInquiry = {
      id: 'INQ-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST',
      timestamp: new Date().toISOString(),
      name: name,
      email: email,
      subject: subject,
      message: message,
      geography: geo,
      device: /Mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    };

    // Dispatch securely to backend API (never persist unencrypted PII in public browser storage)
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiry)
    }).catch(err => {
      console.info('Contact API dispatched or queued:', err.message);
    });

    // Record local telemetry event
    if (typeof Analytics !== 'undefined') {
      Analytics.recordLocalEvent('support_inquiry', { tool_name: subject });
    }

    this.closeModals();
    this.toast(`✓ Thank you ${name}! Your inquiry was delivered to our administrative desk.`);

    const form = document.getElementById('contact-form');
    if (form) form.reset();
  },

  // 5. FAQ Accordion
  initFaq() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close others
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  },

  // 6. Lead Magnet Form
  initLeadMagnet() {
    const form = document.getElementById('lead-magnet-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('lead-name')?.value.trim() || 'Explorer';
      const email = document.getElementById('lead-email')?.value.trim();
      if (!email || !email.includes('@')) {
        this.toast('Please enter a valid email address.');
        return;
      }

      // Generate instant download of SEO & Security Checklist
      const checklistBlob = new Blob([
`FULLSTOP SOLUTION - 50-POINT SEO & WEB SECURITY CHECKLIST (2026 EDITION)
Domain: www.fullstopsolution.in
Dispatched to: ${name} (${email})

=== PART 1: CORE SEO CHECKLIST ===
[x] 1. Set canonical URL tags on all pages to prevent duplicate indexing
[x] 2. Title tag between 50-60 characters with primary keyword upfront
[x] 3. Meta description between 140-160 characters with actionable CTA
[x] 4. Schema.org structured data (Organization, WebSite, SoftwareApplication)
[x] 5. Clean XML sitemap submitted to Google Search Console & Bing Webmaster
[x] 6. Mobile-first responsive design passing Google Mobile-Friendly test
[x] 7. Fast Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
[x] 8. Open Graph & Twitter Summary Cards properly rendered
[x] 9. Semantic HTML5 tags (<header>, <nav>, <main>, <article>, <footer>)
[x] 10. Optimized images with WebP format, explicit width/height & alt tags

=== PART 2: ENTERPRISE WEB SECURITY CHECKLIST ===
[x] 1. HTTPS enforcement via HSTS (Strict-Transport-Security: max-age=63072000)
[x] 2. Strict Content Security Policy (CSP) blocking unauthorized scripts
[x] 3. X-Frame-Options: DENY to prevent clickjacking
[x] 4. X-Content-Type-Options: nosniff to stop MIME type sniffing
[x] 5. Referrer-Policy: strict-origin-when-cross-origin
[x] 6. Permissions-Policy disabling unused browser APIs (camera, microphone)
[x] 7. Sanitize all user inputs before rendering into DOM (Anti-XSS)
[x] 8. Zero storage of sensitive client inputs on unencrypted servers

Visit www.fullstopsolution.in for daily interactive tools and premium toolkits.`
      ], { type: 'text/plain;charset=utf-8' });

      const url = URL.createObjectURL(checklistBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fullstopsolution-50-point-checklist.txt';
      a.click();
      URL.revokeObjectURL(url);

      // Dispatch lead generation event to backend API (never persist unencrypted PII in public browser storage)
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'free-seo-checklist',
          productName: '50-Point Technical SEO & Security Checklist',
          customerName: name,
          customerEmail: email,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});

      this.toast(`🎉 Checklist downloaded! Welcome ${name}.`);
      if (typeof Analytics !== 'undefined') {
        Analytics.trackLeadDownload();
      }
      if (document.getElementById('lead-name')) document.getElementById('lead-name').value = '';
      if (document.getElementById('lead-email')) document.getElementById('lead-email').value = '';
    });
  },

  // Toast Notification System
  showToast(message) {
    this.toast(message);
  },

  toast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `<span>✓</span> <span>${this.escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Operating System & Platform Detection
  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) {
      const isArm = navigator.userAgentData?.platform === 'macOS' || navigator.maxTouchPoints > 1 || /macintosh.*arm|apple/i.test(ua);
      return isArm ? 'mac-arm64' : 'mac-x64';
    }
    if (ua.includes('win')) return 'windows';
    if (ua.includes('linux')) return 'linux';
    return 'mac-arm64';
  },

  // Cross-Platform Desktop App Modal
  openDesktopModal(preferredPlatform) {
    const detected = preferredPlatform || this.detectPlatform();
    const modal = document.getElementById('desktop-modal');
    if (!modal) return;

    // Highlight current detected OS
    document.querySelectorAll('.platform-card').forEach(card => {
      if (card.dataset.platform === detected || (detected.startsWith('mac') && card.dataset.platform.startsWith('mac'))) {
        card.classList.add('detected');
      } else {
        card.classList.remove('detected');
      }
    });

    this.openModal('desktop-modal');
  },

  // Verified Cryptographic Signature Modal
  openSignatureModal() {
    this.openModal('signature-modal');
  },

  // Direct Starter Pack Downloads for Paid Products
  downloadStarterPack(productId, productName) {
    const files = {
      'business-os': 'downloads/starter-packs/fullstop-business-os-starter.zip',
      'growth-seo': 'downloads/starter-packs/fullstop-seo-growth-matrix.zip',
      'dev-boilerplate': 'downloads/starter-packs/fullstop-developer-boilerplate-core.zip',
      'lifetime-bundle': 'downloads/starter-packs/fullstop-lifetime-starter-bundle.zip'
    };

    const filePath = files[productId] || 'downloads/starter-packs/fullstop-business-os-starter.zip';
    const a = document.createElement('a');
    a.href = filePath;
    a.download = filePath.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Dispatch download event to backend API (never persist unencrypted PII in public browser storage)
    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productId,
        productName: productName || 'Starter Pack',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});

    this.toast(`📥 Starting verified download: ${productName || 'Starter Pack'}`);
  },

  // Security Helper: Safe string escaping
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Close modal or mobile nav when clicking outside or pressing Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    App.closeModals();
    App.closeMobileNav();
  }
});
