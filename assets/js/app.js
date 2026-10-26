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
  },

  // 1. Theme Management (Dark / Light)
  initTheme() {
    const savedTheme = localStorage.getItem('fs_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    }
  },

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fs_theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  // 2. Global Live Tool & Product Search
  initToolSearch() {
    const searchInput = document.getElementById('hero-search');
    if (!searchInput) return;

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
      const email = document.getElementById('lead-email')?.value.trim();
      if (!email || !email.includes('@')) {
        this.toast('Please enter a valid email address.');
        return;
      }

      // Generate instant download of SEO & Security Checklist
      const checklistBlob = new Blob([
`FULLSTOP SOLUTION - 50-POINT SEO & WEB SECURITY CHECKLIST (2026 EDITION)
Domain: www.fullstopsolution.in
Dispatched to: ${email}

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

      this.toast('🎉 Checklist downloaded! Welcome to Fullstop Solution.');
      if (typeof Analytics !== 'undefined') {
        Analytics.trackLeadDownload();
      }
      document.getElementById('lead-email').value = '';
    });
  },

  // 7. Toast Notification System
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

// Close modal when clicking outside or pressing Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') App.closeModals();
});
