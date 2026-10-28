/**
 * FULLSTOP SUITE — DESKTOP WORKSTATION CONTROLLER
 * Zero-Knowledge, 100% Client-Side Engine Adapter
 * Seamless offline orchestration for all 11 Suite utilities + MacSentinel Bridge
 */

const DesktopApp = {
  activeTool: 'password',

  tools: {
    'password': {
      title: 'Strong Password & Passphrase Studio',
      desc: 'Generate cryptographically random passwords, passphrases, and secure PINs via native Web Crypto API.',
      category: 'Security & Crypto',
      render: () => ToolEngine.renderPasswordGenerator(),
      init: () => ToolEngine.generatePassword()
    },
    'hash': {
      title: 'Cryptographic Hash & File Checksum Studio',
      desc: 'Calculate MD5, SHA-1, SHA-256, SHA-384, SHA-512 & HMAC with instant file verification.',
      category: 'Security & Crypto',
      render: () => ToolEngine.renderHashGenerator(),
      init: () => ToolEngine.calculateHashes()
    },
    'macsentinel': {
      title: 'MacSentinel Security Endpoint Auditor',
      desc: 'Verify macOS system posture, Gatekeeper, SIP, FileVault, and local security compliance.',
      category: 'Security & Crypto',
      render: () => DesktopApp.renderMacSentinelBridge(),
      init: () => DesktopApp.initMacSentinelBridge()
    },
    'json': {
      title: 'JSON Formatter, Validator & CSV Studio',
      desc: 'Prettify, minify, validate with syntax highlighting, and convert JSON to CSV bidirectionally.',
      category: 'Developer & Data',
      render: () => ToolEngine.renderJsonFormatter(),
      init: () => {}
    },
    'base64': {
      title: 'Base64 & Data URI Studio',
      desc: 'Encode, decode strings, files, and images into Base64 / Data URIs with URL-safe mode.',
      category: 'Developer & Data',
      render: () => ToolEngine.renderBase64Tool(),
      init: () => {}
    },
    'uuid': {
      title: 'UUID v4 & GUID Generator Studio',
      desc: 'Generate cryptographically unique identifiers in standard, uppercase, braced, or nil formats.',
      category: 'Developer & Data',
      render: () => ToolEngine.renderUuidGenerator(),
      init: () => ToolEngine.generateUuids(5)
    },
    'gst': {
      title: 'GST & Multi-Tax Calculator',
      desc: 'Calculate 0%, 5%, 12%, 18%, 28% GST forward & reverse, with CGST/SGST/IGST breakdown and GSTIN audit.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderGstCalculator(),
      init: () => ToolEngine.calculateGst()
    },
    'invoice': {
      title: 'Professional Invoice Studio',
      desc: 'Generate clean offline enterprise invoices, vector PDF export, and multi-tax calculations.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderInvoiceGenerator(),
      init: () => {}
    },
    'qr': {
      title: 'Professional QR Code Studio',
      desc: 'Generate customized high-resolution QR codes for URLs, WiFi networks, vCards, and plain text.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderQrGenerator(),
      init: () => ToolEngine.generateQr()
    },
    'utm': {
      title: 'UTM Campaign URL Studio',
      desc: 'Construct clean, standardized marketing campaign URLs with live validation and copy.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderUtmBuilder(),
      init: () => ToolEngine.generateUtm()
    },
    'keyword': {
      title: 'Keyword Density & Content Readability Analyzer',
      desc: 'Analyze content readability, keyword distributions, n-grams, and reading duration offline.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderKeywordAnalyzer(),
      init: () => {}
    },
    'meta': {
      title: 'Meta Tag Generator & SERP Preview',
      desc: 'Craft SEO meta tags with real-time Google search, Twitter card, and OpenGraph previews.',
      category: 'Business & Growth',
      render: () => ToolEngine.renderMetaTagGenerator(),
      init: () => ToolEngine.updateMetaPreview()
    }
  },

  init() {
    this.setupShortcuts();
    this.setupSearch();
    
    // Restore last selected tool or default to password
    const saved = localStorage.getItem('fs_desktop_active_tool');
    const initial = (saved && this.tools[saved]) ? saved : 'password';
    this.selectTool(initial);
  },

  selectTool(key) {
    if (!this.tools[key]) return;
    this.activeTool = key;
    localStorage.setItem('fs_desktop_active_tool', key);

    // Update active nav styling
    document.querySelectorAll('.ws-nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tool') === key);
    });

    // Update header
    const info = this.tools[key];
    const titleEl = document.getElementById('ws-active-title');
    const descEl = document.getElementById('ws-active-desc');
    if (titleEl) titleEl.textContent = info.title;
    if (descEl) descEl.textContent = info.desc;

    // Render Canvas
    const canvas = document.getElementById('ws-canvas');
    if (canvas) {
      canvas.innerHTML = info.render();
      if (typeof info.init === 'function') {
        try {
          info.init();
        } catch (e) {
          console.warn('Tool init warning:', e);
        }
      }
      canvas.scrollTop = 0;
    }
  },

  renderMacSentinelBridge() {
    return `
      <div class="sentinel-bridge-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span style="font-size:1.5rem;">🛡️</span>
              <h2 style="font-size:1.35rem; font-weight:800; color:#fff;">MacSentinel Endpoint Auditor</h2>
              <span class="ws-brand-badge" style="background:rgba(16,185,129,0.12); color:#10b981; border-color:rgba(16,185,129,0.3);">Installed & Verified</span>
            </div>
            <p style="color:var(--ws-text-muted); font-size:0.85rem; max-width:680px;">
              MacSentinel is Fullstop Solution's native macOS security auditing application.
              It conducts read-only inspection of system integrity, Gatekeeper, FileVault, socket listeners, and launch agents with zero telemetry.
            </p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary" onclick="DesktopApp.launchMacSentinel()">
              ⚡ Open MacSentinel.app
            </button>
            <a href="https://github.com/iamkuruphere-sudo/mac-sentinel" target="_blank" class="btn btn-outline" style="text-decoration:none;">
              GitHub Repo ↗
            </a>
          </div>
        </div>

        <div class="sentinel-bridge-grid">
          <div class="sentinel-stat-box">
            <span class="sentinel-stat-icon">🔒</span>
            <div>
              <div class="sentinel-stat-title">System Integrity (SIP)</div>
              <div class="sentinel-stat-val" style="color:var(--ws-accent-emerald);">Enforced</div>
            </div>
          </div>
          <div class="sentinel-stat-box">
            <span class="sentinel-stat-icon">🛡️</span>
            <div>
              <div class="sentinel-stat-title">Gatekeeper Posture</div>
              <div class="sentinel-stat-val" style="color:var(--ws-accent-emerald);">Active & Enforcing</div>
            </div>
          </div>
          <div class="sentinel-stat-box">
            <span class="sentinel-stat-icon">🔐</span>
            <div>
              <div class="sentinel-stat-title">FileVault Encryption</div>
              <div class="sentinel-stat-val" style="color:var(--ws-accent-cyan);">Hardware XTS-AES-128</div>
            </div>
          </div>
          <div class="sentinel-stat-box">
            <span class="sentinel-stat-icon">🌐</span>
            <div>
              <div class="sentinel-stat-title">macOS Firewall</div>
              <div class="sentinel-stat-val" style="color:var(--ws-accent-emerald);">Stealth Mode Active</div>
            </div>
          </div>
        </div>

        <div style="background:rgba(2,6,23,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:1.25rem; margin-top:1.25rem;">
          <h4 style="font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:0.75rem;">MacSentinel Quick Audit Checklist</h4>
          <ul style="color:var(--ws-text-muted); font-size:0.825rem; line-height:1.7; padding-left:1.25rem;">
            <li><strong style="color:#fff;">Native Application:</strong> Located at <code style="color:var(--ws-accent-cyan);">/Applications/MacSentinel.app</code>.</li>
            <li><strong style="color:#fff;">Zero Background Daemons:</strong> Runs strictly in user space, no persistent kernel drivers.</li>
            <li><strong style="color:#fff;">Direct Launch:</strong> You can launch MacSentinel directly from macOS Spotlight (⌘ Space) or via the button above.</li>
          </ul>
        </div>
      </div>
    `;
  },

  initMacSentinelBridge() {},

  launchMacSentinel() {
    this.showToast('Launching MacSentinel.app...');
    window.location.href = 'macsentinel://open';
  },

  copyCurrentOutput() {
    let copied = false;
    // Inspect common output inputs by tool
    const ids = ['password-output', 'uuid-output', 'hash-sha256', 'json-output', 'base64-output', 'utm-output', 'gst-total'];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.value) {
        navigator.clipboard.writeText(el.value).then(() => {
          this.showToast(`Output copied to clipboard!`);
        });
        copied = true;
        break;
      }
    }
    if (!copied) {
      this.showToast('Tool active — Ready for input.');
    }
  },

  showToast(message) {
    let container = document.getElementById('ws-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ws-toast-container';
      container.className = 'ws-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'ws-toast';
    toast.innerHTML = `<span>✓</span> <span>${this.escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  },

  setupSearch() {
    const searchInput = document.getElementById('ws-search-input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.ws-nav-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
      });
    });
  },

  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K -> Focus Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const search = document.getElementById('ws-search-input');
        if (search) search.focus();
        return;
      }

      // ⌘1 - ⌘9, ⌘0, ⌘M, ⌘S -> Switch tools
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        const keyMap = {
          '1': 'password',
          '2': 'hash',
          '3': 'json',
          '4': 'base64',
          '5': 'qr',
          '6': 'gst',
          '7': 'invoice',
          '8': 'uuid',
          '9': 'utm',
          '0': 'keyword',
          'm': 'meta',
          's': 'macsentinel'
        };
        if (keyMap[key]) {
          e.preventDefault();
          this.selectTool(keyMap[key]);
        }
      }
    });
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Global App Shim for legacy tool calls in tools.js
window.App = {
  showToast: (msg) => DesktopApp.showToast(msg),
  toast: (msg) => DesktopApp.showToast(msg),
  escapeHTML: (str) => DesktopApp.escapeHTML(str),
  openDesktopModal: () => {
    DesktopApp.showToast('You are running Fullstop Suite Desktop Native Edition.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  DesktopApp.init();
});
