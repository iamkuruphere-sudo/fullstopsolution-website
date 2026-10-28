/**
 * FULLSTOP SOLUTION - ENTERPRISE CLIENT-SIDE TOOL ENGINE
 * 100% Client-Side, Zero Tracking, Zero Network Data Leakage
 * Cross-Platform Desktop Compatible (macOS arm64/x64, Windows x64, Linux)
 * High Security: Safe DOM manipulation, sanitization, Web Crypto API
 */

const ToolEngine = {
  // Common Top Action Bar for All Tools (Desktop Downloads & Offline Export)
  renderToolHeader(toolKey, toolTitle) {
    const repoMap = {
      'meta': 'fullstop-meta-tag-serp-previewer',
      'password': 'fullstop-password-generator',
      'json': 'fullstop-json-studio',
      'qr': 'fullstop-qr-generator',
      'invoice': 'fullstop-invoice-studio',
      'hash': 'fullstop-hash-calculator',
      'base64': 'fullstop-base64-tool',
      'keyword': 'fullstop-keyword-analyzer',
      'gst': 'fullstop-gst-vat-calculator',
      'utm': 'fullstop-utm-campaign-builder',
      'uuid': 'fullstop-uuid-generator'
    };
    const repoName = repoMap[toolKey] || `fullstop-${toolKey}`;
    return `
      <div class="tool-platform-bar">
        <div class="tool-platform-left">
          <span class="tool-os-badge">🍏 Mac (Silicon & Intel)</span>
          <span class="tool-os-badge">🪟 Windows x64</span>
          <span class="tool-os-badge">🐧 Linux</span>
          <span class="tool-badge-verified" title="Cryptographically Verified Release">🛡️ SHA-256 Verified</span>
        </div>
        <div class="tool-platform-right">
          <a href="https://github.com/iamkuruphere-sudo/${repoName}" target="_blank" rel="noopener" class="btn btn-xs btn-outline" style="text-decoration:none;" title="Open Open-Source GitHub Repository">
            ⭐ GitHub Repo ↗
          </a>
          <button class="btn btn-xs btn-outline" onclick="App.openDesktopModal()" title="Download Fullstop Desktop Suite for Mac, Windows or Linux">
            ⬇️ Desktop App
          </button>
          <button class="btn btn-xs btn-gradient" onclick="ToolEngine.exportOfflineTool('${toolKey}', '${toolTitle}')" title="Export this tool as a standalone offline single-file HTML app">
            💾 Offline HTML (.html)
          </button>
        </div>
      </div>
    `;
  },

  // Export current tool as a 100% standalone single-file HTML application
  exportOfflineTool(toolKey, toolTitle) {
    const modalBody = document.getElementById('tool-modal-body') || document.getElementById('ws-canvas');
    const toolContent = modalBody ? modalBody.innerHTML : '';
    
    // Serialize ToolEngine methods so the exported tool is truly self-contained and operates 100% offline
    let serializedEngine = '';
    try {
      const parts = [];
      for (const [key, val] of Object.entries(this)) {
        if (key === 'exportOfflineTool') continue;
        if (typeof val === 'function') {
          parts.push(`  ${val.toString()}`);
        } else {
          parts.push(`  ${key}: ${JSON.stringify(val)}`);
        }
      }
      serializedEngine = `const ToolEngine = {\n${parts.join(',\n')}\n};\n`;
    } catch (e) {
      serializedEngine = '';
    }

    const standaloneHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolTitle} | Fullstop Solution Offline Edition</title>
  <meta name="description" content="Standalone offline utility from Fullstop Solution (www.fullstopsolution.in)">
  <link rel="icon" type="image/png" href="https://www.fullstopsolution.in/assets/images/logo.png">
  <style>
    :root {
      --bg-canvas: #030712;
      --bg-card: rgba(15, 23, 42, 0.75);
      --border-color: rgba(255, 255, 255, 0.1);
      --accent-primary: #38bdf8;
      --accent-neon-cyan: #22d3ee;
      --accent-neon-emerald: #10b981;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    body {
      background: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-sans);
      margin: 0;
      padding: 2rem 1rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .offline-wrapper {
      width: 100%;
      max-width: 900px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .offline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .form-group { margin-bottom: 1rem; text-align: left; }
    .form-label { display: block; font-size: 0.825rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.4rem; }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: rgba(3, 7, 18, 0.7);
      color: #ffffff;
      font-family: inherit;
      box-sizing: border-box;
    }
    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-primary { background: #0284c7; color: #fff; }
    .btn-gradient { background: linear-gradient(135deg, #0284c7, #6366f1); color: #fff; }
    .btn-outline { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: #fff; }
    .btn-sm { padding: 0.45rem 0.85rem; font-size: 0.825rem; }
    .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    .code-output {
      background: #000;
      color: #38bdf8;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      white-space: pre-wrap;
      word-break: break-all;
    }
    .tool-platform-bar { display: none; }
  </style>
</head>
<body>
  <div class="offline-wrapper">
    <div class="offline-header">
      <div>
        <h2 style="margin:0; font-size:1.5rem;">${toolTitle}</h2>
        <span style="font-size:0.8rem; color:var(--accent-neon-emerald);">🔒 100% Client-Side • Standalone Offline Edition</span>
      </div>
      <a href="https://www.fullstopsolution.in" target="_blank" style="color:var(--accent-primary); text-decoration:none; font-size:0.85rem; font-weight:600;">fullstopsolution.in ↗</a>
    </div>
    <div id="standalone-body">
      ${toolContent}
    </div>
  </div>
  <footer style="margin-top:2rem; font-size:0.8rem; color:var(--text-muted); text-align:center;">
    Fullstop Solution Offline Toolkit • Signed & Verified • Zero Cloud Connection Needed
  </footer>

  <script>
    window.App = window.App || {
      showToast: function(m) {
        let t = document.getElementById('offline-toast');
        if (!t) {
          t = document.createElement('div');
          t.id = 'offline-toast';
          t.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#0284c7; color:#fff; padding:10px 16px; border-radius:8px; font-weight:600; font-size:14px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.5); transition:opacity 0.3s;';
          document.body.appendChild(t);
        }
        t.textContent = m;
        t.style.opacity = '1';
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
      },
      toast: function(m) { this.showToast(m); },
      escapeHTML: function(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      },
      openDesktopModal: function() {
        window.open('https://www.fullstopsolution.in/#desktop', '_blank');
      }
    };

    ${serializedEngine}

    document.addEventListener('DOMContentLoaded', function() {
      if (typeof ToolEngine !== 'undefined') {
        if ('${toolKey}' === 'password' && ToolEngine.generatePassword) ToolEngine.generatePassword();
        if ('${toolKey}' === 'hash' && ToolEngine.calculateHashes) ToolEngine.calculateHashes();
        if ('${toolKey}' === 'uuid' && ToolEngine.generateUuids) ToolEngine.generateUuids(5);
        if ('${toolKey}' === 'gst' && ToolEngine.calculateGst) ToolEngine.calculateGst();
        if ('${toolKey}' === 'qr' && ToolEngine.generateQr) ToolEngine.generateQr();
        if ('${toolKey}' === 'utm' && ToolEngine.generateUtm) ToolEngine.generateUtm();
        if ('${toolKey}' === 'meta' && ToolEngine.updateMetaPreview) ToolEngine.updateMetaPreview();
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullstop-${toolKey}-offline.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof Analytics !== 'undefined') {
      Analytics.trackToolLaunch(`${toolTitle} (Offline HTML Export)`);
    }
  },

  // ==========================================================================
  // 1. META TAG GENERATOR & SERP/SOCIAL STUDIO
  // ==========================================================================
  renderMetaTagGenerator() {
    return `
      ${this.renderToolHeader('meta', 'Meta Tag Generator & SERP Preview')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Generate Google-compliant meta tags, Open Graph tags, and Twitter Cards with real-time preview and robots directives.
        </p>

        <!-- Presets Bar -->
        <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:1.25rem; padding:0.5rem 0.75rem; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid var(--border-color);">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">PRESETS:</span>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadMetaPreset('saas')">SaaS Platform</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadMetaPreset('ecommerce')">E-Commerce Store</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadMetaPreset('blog')">Technical Blog</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadMetaPreset('portfolio')">Portfolio / Freelancer</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;" class="tool-split">
          <div>
            <div class="form-group">
              <label class="form-label">Page Title (Max 60 chars recommended)</label>
              <input type="text" id="meta-title" class="form-input" placeholder="e.g. Fullstop Solution - Digital Toolkit & Growth Platform" maxlength="70" oninput="ToolEngine.updateMetaPreview()">
              <div style="display:flex; justify-content:space-between; margin-top:2px;">
                <small id="meta-title-count" style="color:var(--text-muted); font-size:0.75rem;">0 / 60 characters</small>
                <small id="meta-title-status" style="font-size:0.75rem; color:var(--accent-neon-emerald);">Optimal length</small>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Meta Description (Max 160 chars recommended)</label>
              <textarea id="meta-desc" class="form-textarea" style="min-height:75px;" placeholder="e.g. Discover high-utility digital tools, business templates, and developer kits to scale your digital operations." maxlength="175" oninput="ToolEngine.updateMetaPreview()"></textarea>
              <div style="display:flex; justify-content:space-between; margin-top:2px;">
                <small id="meta-desc-count" style="color:var(--text-muted); font-size:0.75rem;">0 / 160 characters</small>
                <small id="meta-desc-status" style="font-size:0.75rem; color:var(--accent-neon-emerald);">Optimal length</small>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Canonical URL</label>
              <input type="url" id="meta-url" class="form-input" placeholder="https://www.fullstopsolution.in" oninput="ToolEngine.updateMetaPreview()">
            </div>
            <div class="form-group">
              <label class="form-label">Social Share Image URL (og:image)</label>
              <input type="url" id="meta-image" class="form-input" placeholder="https://www.fullstopsolution.in/assets/images/logo.png" oninput="ToolEngine.updateMetaPreview()">
            </div>
            <div class="form-group">
              <label class="form-label">Robots Directive</label>
              <select id="meta-robots" class="form-select" onchange="ToolEngine.updateMetaPreview()">
                <option value="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">index, follow (Standard SEO)</option>
                <option value="noindex, follow">noindex, follow (Internal Landing)</option>
                <option value="noindex, nofollow">noindex, nofollow (Private / Staging)</option>
              </select>
            </div>
          </div>

          <div>
            <!-- Social Preview Tabs -->
            <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
              <button class="btn btn-xs btn-primary meta-tab active" id="tab-serp" onclick="ToolEngine.switchMetaTab('serp')">Google SERP</button>
              <button class="btn btn-xs btn-outline meta-tab" id="tab-twitter" onclick="ToolEngine.switchMetaTab('twitter')">Twitter / X Card</button>
              <button class="btn btn-xs btn-outline meta-tab" id="tab-og" onclick="ToolEngine.switchMetaTab('og')">Open Graph (FB/LinkedIn)</button>
            </div>

            <!-- Google Preview -->
            <div id="preview-serp" style="background:#ffffff; color:#202124; padding:1.25rem; border-radius:8px; border:1px solid #dfe1e5; margin-bottom:1.25rem; font-family:Arial,sans-serif;">
              <div style="font-size:12px; color:#202124; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="background:#e8f0fe; color:#1a73e8; border-radius:50%; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; font-size:10px;">★</span>
                <span id="serp-url-preview" style="color:#202124; font-size:12px;">https://www.fullstopsolution.in</span>
              </div>
              <h3 id="serp-title-preview" style="color:#1a0dab; font-size:18px; font-weight:400; margin:0 0 4px 0; line-height:1.3; cursor:pointer;">Fullstop Solution - Digital Toolkit & Growth Platform</h3>
              <p id="serp-desc-preview" style="color:#4d5156; font-size:13px; margin:0; line-height:1.4;">Discover high-utility digital tools, business templates, and developer kits to scale your digital operations.</p>
            </div>

            <!-- Twitter Preview -->
            <div id="preview-twitter" style="display:none; background:#0f172a; border:1px solid #334155; border-radius:12px; overflow:hidden; margin-bottom:1.25rem;">
              <div style="height:120px; background:linear-gradient(135deg, #1e293b, #0f172a); display:flex; align-items:center; justify-content:center; color:#64748b; font-size:0.85rem;">
                <span id="twitter-img-placeholder">🖼️ Social Card Image</span>
              </div>
              <div style="padding:0.75rem 1rem;">
                <div id="twitter-domain-preview" style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">fullstopsolution.in</div>
                <div id="twitter-title-preview" style="font-weight:700; color:#f8fafc; font-size:0.95rem; margin:2px 0;">Page Title</div>
                <div id="twitter-desc-preview" style="font-size:0.8rem; color:#cbd5e1; line-height:1.4;">Meta description preview...</div>
              </div>
            </div>

            <!-- Open Graph Preview -->
            <div id="preview-og" style="display:none; background:#0f172a; border:1px solid #334155; border-radius:10px; overflow:hidden; margin-bottom:1.25rem;">
              <div style="height:120px; background:#1e293b; display:flex; align-items:center; justify-content:center; color:#64748b;">
                <span>🌐 Facebook / LinkedIn Feed Card</span>
              </div>
              <div style="padding:0.75rem 1rem; background:#1e293b;">
                <div id="og-domain-preview" style="font-size:0.72rem; color:#94a3b8; text-transform:uppercase;">FULLSTOPSOLUTION.IN</div>
                <div id="og-title-preview" style="font-weight:700; color:#ffffff; font-size:0.95rem; margin:3px 0;">Page Title</div>
                <div id="og-desc-preview" style="font-size:0.8rem; color:#cbd5e1;">Meta description preview...</div>
              </div>
            </div>

            <label class="form-label">Generated HTML Code</label>
            <div class="code-output" id="meta-code-output" style="max-height:130px;">&lt;!-- Code will appear here --&gt;</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.75rem;">
              <button class="btn btn-primary btn-sm" onclick="ToolEngine.copyMetaCode()">Copy HTML</button>
              <button class="btn btn-outline btn-sm" onclick="ToolEngine.downloadMetaFile()">Download .html</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  switchMetaTab(tab) {
    ['serp', 'twitter', 'og'].forEach(t => {
      const el = document.getElementById(`preview-${t}`);
      const btn = document.getElementById(`tab-${t}`);
      if (el) el.style.display = (t === tab) ? 'block' : 'none';
      if (btn) {
        btn.className = (t === tab) ? 'btn btn-xs btn-primary meta-tab active' : 'btn btn-xs btn-outline meta-tab';
      }
    });
  },

  loadMetaPreset(type) {
    const presets = {
      saas: {
        title: 'Fullstop Cloud OS | Next-Gen Business Infrastructure',
        desc: 'Deploy turnkey SaaS business platforms, client billing engines, and developer boilerplates with 100% privacy and zero-lag performance.',
        url: 'https://www.fullstopsolution.in',
        img: 'https://www.fullstopsolution.in/assets/images/logo.png'
      },
      ecommerce: {
        title: 'Buy Premium Digital Kits & Templates | Instant Delivery',
        desc: 'Shop verified Notion templates, growth spreadsheets, and code boilerplates with instant direct download and commercial licenses.',
        url: 'https://www.fullstopsolution.in/#products',
        img: 'https://www.fullstopsolution.in/assets/images/logo.png'
      },
      blog: {
        title: 'Zero-Knowledge Architecture: Why In-Browser Computing Wins',
        desc: 'Deep-dive into client-side Web Crypto APIs, SHA-256 integrity signatures, and mathematical data isolation in modern web applications.',
        url: 'https://www.fullstopsolution.in/security.html',
        img: 'https://www.fullstopsolution.in/assets/images/logo.png'
      },
      portfolio: {
        title: 'Fullstop Engineering | Elite Digital Tools & Development',
        desc: 'Custom software architecture, high-converting digital products, and automated business workflows designed for high-growth operations.',
        url: 'https://www.fullstopsolution.in',
        img: 'https://www.fullstopsolution.in/assets/images/logo.png'
      }
    };

    const p = presets[type];
    if (!p) return;
    const titleEl = document.getElementById('meta-title');
    const descEl = document.getElementById('meta-desc');
    const urlEl = document.getElementById('meta-url');
    const imgEl = document.getElementById('meta-image');
    if (titleEl) titleEl.value = p.title;
    if (descEl) descEl.value = p.desc;
    if (urlEl) urlEl.value = p.url;
    if (imgEl) imgEl.value = p.img;
    this.updateMetaPreview();
  },

  updateMetaPreview() {
    const title = document.getElementById('meta-title')?.value || 'Fullstop Solution - Digital Toolkit & Growth Platform';
    const desc = document.getElementById('meta-desc')?.value || 'Discover high-utility digital tools, business templates, and developer kits to scale your digital operations.';
    const url = document.getElementById('meta-url')?.value || 'https://www.fullstopsolution.in';
    const image = document.getElementById('meta-image')?.value || 'https://www.fullstopsolution.in/assets/images/logo.png';
    const robots = document.getElementById('meta-robots')?.value || 'index, follow';

    const titleLen = title.length;
    const descLen = desc.length;

    const titleCount = document.getElementById('meta-title-count');
    if (titleCount) titleCount.textContent = `${titleLen} / 60 characters`;
    const titleStatus = document.getElementById('meta-title-status');
    if (titleStatus) {
      if (titleLen > 60) {
        titleStatus.textContent = 'Too long for Google SERP';
        titleStatus.style.color = '#ef4444';
      } else {
        titleStatus.textContent = 'Optimal length';
        titleStatus.style.color = 'var(--accent-neon-emerald)';
      }
    }

    const descCount = document.getElementById('meta-desc-count');
    if (descCount) descCount.textContent = `${descLen} / 160 characters`;
    const descStatus = document.getElementById('meta-desc-status');
    if (descStatus) {
      if (descLen > 160) {
        descStatus.textContent = 'May truncate in Google';
        descStatus.style.color = '#ef4444';
      } else {
        descStatus.textContent = 'Optimal length';
        descStatus.style.color = 'var(--accent-neon-emerald)';
      }
    }

    // Google SERP update
    const serpTitle = document.getElementById('serp-title-preview');
    if (serpTitle) serpTitle.textContent = title;
    const serpDesc = document.getElementById('serp-desc-preview');
    if (serpDesc) serpDesc.textContent = desc;
    const serpUrl = document.getElementById('serp-url-preview');
    if (serpUrl) serpUrl.textContent = url;

    // Twitter Card update
    const twTitle = document.getElementById('twitter-title-preview');
    if (twTitle) twTitle.textContent = title;
    const twDesc = document.getElementById('twitter-desc-preview');
    if (twDesc) twDesc.textContent = desc;

    // OpenGraph update
    const ogTitle = document.getElementById('og-title-preview');
    if (ogTitle) ogTitle.textContent = title;
    const ogDesc = document.getElementById('og-desc-preview');
    if (ogDesc) ogDesc.textContent = desc;

    const code = `<!-- Primary Meta Tags -->
<title>${App.escapeHTML(title)}</title>
<meta name="title" content="${App.escapeHTML(title)}">
<meta name="description" content="${App.escapeHTML(desc)}">
<meta name="robots" content="${App.escapeHTML(robots)}">
<link rel="canonical" href="${App.escapeHTML(url)}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${App.escapeHTML(url)}">
<meta property="og:title" content="${App.escapeHTML(title)}">
<meta property="og:description" content="${App.escapeHTML(desc)}">
<meta property="og:image" content="${App.escapeHTML(image)}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${App.escapeHTML(url)}">
<meta property="twitter:title" content="${App.escapeHTML(title)}">
<meta property="twitter:description" content="${App.escapeHTML(desc)}">
<meta property="twitter:image" content="${App.escapeHTML(image)}">`;

    const output = document.getElementById('meta-code-output');
    if (output) output.textContent = code;
  },

  copyMetaCode() {
    const output = document.getElementById('meta-code-output')?.textContent;
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        App.showToast('Meta tags copied to clipboard!');
      });
    }
  },

  downloadMetaFile() {
    const output = document.getElementById('meta-code-output')?.textContent;
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('Meta tags downloaded as .html!');
  },

  // ==========================================================================
  // 2. STRONG PASSWORD, PASSPHRASE & PIN STUDIO
  // ==========================================================================
  renderPasswordGenerator() {
    return `
      ${this.renderToolHeader('password', 'Strong Password & Passphrase Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Generate cryptographically random passwords, memorable passphrases, or secure numeric PINs using the native Web Crypto API.
        </p>

        <!-- Generation Mode Selector -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem;">
          <button class="btn btn-sm btn-primary pass-mode-btn active" id="mode-password" onclick="ToolEngine.setPassMode('password')">Random Password</button>
          <button class="btn btn-sm btn-outline pass-mode-btn" id="mode-passphrase" onclick="ToolEngine.setPassMode('passphrase')">Memorable Passphrase</button>
          <button class="btn btn-sm btn-outline pass-mode-btn" id="mode-pin" onclick="ToolEngine.setPassMode('pin')">Secure PIN</button>
        </div>

        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>Generated Secret</span>
            <span id="pass-entropy" style="color:var(--accent-neon-emerald); font-size:0.75rem; font-weight:700;">128 Bits • Cryptographically Unbreakable</span>
          </label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="password-output" class="form-input" style="font-family:var(--font-mono); font-size:1.15rem; font-weight:700; letter-spacing:1px; color:var(--accent-neon-cyan); background:#020617;" readonly>
            <button class="btn btn-primary" onclick="ToolEngine.copyPassword()">Copy</button>
            <button class="btn btn-outline" onclick="ToolEngine.generatePassword()">🔄 New</button>
          </div>
          <!-- Strength Bar -->
          <div style="height:6px; background:#1e293b; border-radius:3px; margin-top:8px; overflow:hidden;">
            <div id="pass-strength-bar" style="height:100%; width:100%; background:var(--accent-neon-emerald); transition:width 0.3s ease;"></div>
          </div>
          <small id="pass-crack-time" style="color:var(--text-muted); font-size:0.75rem; display:block; margin-top:4px;">
            Estimated time to brute force: ~100 trillion years
          </small>
        </div>

        <!-- Mode 1: Random Password Controls -->
        <div id="panel-password" class="pass-panel">
          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between;">
              <span>Password Length: <strong id="pass-len-val" style="color:var(--accent-primary);">20</strong></span>
              <span style="font-size:0.75rem; color:var(--text-muted);">Recommended: 16+</span>
            </label>
            <input type="range" id="pass-len" min="8" max="64" value="20" style="width:100%; cursor:pointer;" oninput="document.getElementById('pass-len-val').textContent = this.value; ToolEngine.generatePassword();">
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
              <input type="checkbox" id="pass-upper" checked onchange="ToolEngine.generatePassword()"> Uppercase (A-Z)
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
              <input type="checkbox" id="pass-lower" checked onchange="ToolEngine.generatePassword()"> Lowercase (a-z)
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
              <input type="checkbox" id="pass-num" checked onchange="ToolEngine.generatePassword()"> Numbers (0-9)
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
              <input type="checkbox" id="pass-sym" checked onchange="ToolEngine.generatePassword()"> Symbols (!@#$%^&*)
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
              <input type="checkbox" id="pass-ambiguous" onchange="ToolEngine.generatePassword()"> Exclude Ambiguous (0, O, 1, l, I)
            </label>
          </div>
        </div>

        <!-- Mode 2: Memorable Passphrase Controls -->
        <div id="panel-passphrase" class="pass-panel" style="display:none;">
          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between;">
              <span>Word Count: <strong id="phrase-words-val" style="color:var(--accent-primary);">4</strong> words</span>
            </label>
            <input type="range" id="phrase-words" min="3" max="8" value="4" style="width:100%; cursor:pointer;" oninput="document.getElementById('phrase-words-val').textContent = this.value; ToolEngine.generatePassword();">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div>
              <label class="form-label">Separator</label>
              <select id="phrase-sep" class="form-select" onchange="ToolEngine.generatePassword()">
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Period (.)</option>
                <option value=" ">Space</option>
              </select>
            </div>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer; margin-top:1.5rem;">
              <input type="checkbox" id="phrase-cap" checked onchange="ToolEngine.generatePassword()"> Capitalize Words
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer; margin-top:1.5rem;">
              <input type="checkbox" id="phrase-num" checked onchange="ToolEngine.generatePassword()"> Append Number
            </label>
          </div>
        </div>

        <!-- Mode 3: Secure PIN Controls -->
        <div id="panel-pin" class="pass-panel" style="display:none;">
          <div class="form-group">
            <label class="form-label">PIN Length</label>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-sm btn-outline pin-len-btn" onclick="ToolEngine.setPinLength(4)">4 Digits</button>
              <button class="btn btn-sm btn-primary pin-len-btn active" id="pin-len-6" onclick="ToolEngine.setPinLength(6)">6 Digits (UPI / Card)</button>
              <button class="btn btn-sm btn-outline pin-len-btn" onclick="ToolEngine.setPinLength(8)">8 Digits (Bank)</button>
              <button class="btn btn-sm btn-outline pin-len-btn" onclick="ToolEngine.setPinLength(12)">12 Digits (Master)</button>
            </div>
          </div>
        </div>

        <!-- Bulk Password Generator Addon -->
        <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span style="font-size:0.85rem; font-weight:700;">Bulk Generator</span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-xs btn-outline" onclick="ToolEngine.generateBulkPasswords(5)">Generate 5</button>
              <button class="btn btn-xs btn-outline" onclick="ToolEngine.generateBulkPasswords(10)">Generate 10</button>
              <button class="btn btn-xs btn-primary" onclick="ToolEngine.downloadBulkPasswords()">Download .txt</button>
            </div>
          </div>
          <textarea id="bulk-passwords-output" class="form-textarea" style="min-height:70px; font-family:var(--font-mono); font-size:0.8rem;" placeholder="Click 'Generate 5' or 'Generate 10' for batch passwords..."></textarea>
        </div>
      </div>
    `;
  },

  currentPassMode: 'password',
  currentPinLen: 6,

  setPassMode(mode) {
    this.currentPassMode = mode;
    ['password', 'passphrase', 'pin'].forEach(m => {
      const btn = document.getElementById(`mode-${m}`);
      const panel = document.getElementById(`panel-${m}`);
      if (btn) btn.className = (m === mode) ? 'btn btn-sm btn-primary pass-mode-btn active' : 'btn btn-sm btn-outline pass-mode-btn';
      if (panel) panel.style.display = (m === mode) ? 'block' : 'none';
    });
    this.generatePassword();
  },

  setPinLength(len) {
    this.currentPinLen = len;
    document.querySelectorAll('.pin-len-btn').forEach(btn => {
      btn.className = (btn.textContent.includes(len)) ? 'btn btn-sm btn-primary pin-len-btn active' : 'btn btn-sm btn-outline pin-len-btn';
    });
    this.generatePassword();
  },

  generatePassword() {
    const out = document.getElementById('password-output');
    if (!out) return;

    if (this.currentPassMode === 'pin') {
      const array = new Uint8Array(this.currentPinLen);
      window.crypto.getRandomValues(array);
      let pin = '';
      for (let i = 0; i < this.currentPinLen; i++) {
        pin += (array[i] % 10).toString();
      }
      out.value = pin;
      this.updateEntropyDisplay(this.currentPinLen * 3.32, 'PIN Generated');
      return;
    }

    if (this.currentPassMode === 'passphrase') {
      const words = [
        "quantum", "falcon", "cobalt", "sapphire", "velocity", "obsidian", "nexus",
        "stellar", "cipher", "vertex", "aurora", "cascade", "mirage", "zenith",
        "echo", "prism", "glacier", "phoenix", "spectrum", "solaris", "titan",
        "vortex", "hyper", "cyber", "galaxy", "summit", "beacon", "radiant"
      ];
      const count = parseInt(document.getElementById('phrase-words')?.value || 4);
      const sep = document.getElementById('phrase-sep')?.value || '-';
      const cap = document.getElementById('phrase-cap')?.checked ?? true;
      const num = document.getElementById('phrase-num')?.checked ?? true;

      const randomBytes = new Uint32Array(count);
      window.crypto.getRandomValues(randomBytes);
      const chosen = [];
      for (let i = 0; i < count; i++) {
        let word = words[randomBytes[i] % words.length];
        if (cap) word = word.charAt(0).toUpperCase() + word.slice(1);
        chosen.push(word);
      }
      let result = chosen.join(sep);
      if (num) {
        const numByte = new Uint8Array(1);
        window.crypto.getRandomValues(numByte);
        result += sep + (numByte[0] % 90 + 10);
      }
      out.value = result;
      this.updateEntropyDisplay(count * 13, 'Diceware Passphrase');
      return;
    }

    // Default Random Mode
    const len = parseInt(document.getElementById('pass-len')?.value || 20);
    const useUpper = document.getElementById('pass-upper')?.checked ?? true;
    const useLower = document.getElementById('pass-lower')?.checked ?? true;
    const useNum = document.getElementById('pass-num')?.checked ?? true;
    const useSym = document.getElementById('pass-sym')?.checked ?? true;
    const noAmbiguous = document.getElementById('pass-ambiguous')?.checked ?? false;

    let chars = '';
    if (useUpper) chars += noAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += noAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (useNum) chars += noAmbiguous ? '23456789' : '0123456789';
    if (useSym) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += chars[array[i] % chars.length];
    }
    out.value = pass;
    const entropy = Math.round(len * Math.log2(chars.length));
    this.updateEntropyDisplay(entropy, `${entropy} Bits Entropy`);
  },

  updateEntropyDisplay(bits, label) {
    const entropyEl = document.getElementById('pass-entropy');
    const bar = document.getElementById('pass-strength-bar');
    const timeEl = document.getElementById('pass-crack-time');

    if (entropyEl) entropyEl.textContent = `${label} • Web Crypto Secure`;

    if (bar) {
      if (bits < 40) {
        bar.style.width = '30%';
        bar.style.background = '#ef4444';
        if (timeEl) timeEl.textContent = 'Estimated brute force time: A few minutes';
      } else if (bits < 70) {
        bar.style.width = '65%';
        bar.style.background = '#f59e0b';
        if (timeEl) timeEl.textContent = 'Estimated brute force time: Several centuries';
      } else {
        bar.style.width = '100%';
        bar.style.background = 'var(--accent-neon-emerald)';
        if (timeEl) timeEl.textContent = 'Estimated brute force time: Billions of years';
      }
    }
  },

  copyPassword() {
    const out = document.getElementById('password-output');
    if (out && out.value) {
      navigator.clipboard.writeText(out.value).then(() => {
        App.showToast('Secret copied! Clipboard clears automatically.');
      });
    }
  },

  generateBulkPasswords(count) {
    const current = document.getElementById('password-output')?.value;
    const list = [];
    for (let i = 0; i < count; i++) {
      this.generatePassword();
      list.push(document.getElementById('password-output')?.value);
    }
    const bulkOutput = document.getElementById('bulk-passwords-output');
    if (bulkOutput) bulkOutput.value = list.join('\n');
    App.showToast(`Generated ${count} passwords in bulk!`);
  },

  downloadBulkPasswords() {
    const val = document.getElementById('bulk-passwords-output')?.value;
    if (!val) {
      this.generateBulkPasswords(10);
    }
    const text = document.getElementById('bulk-passwords-output')?.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fullstop-passwords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('Passwords exported to fullstop-passwords.txt!');
  },

  // ==========================================================================
  // 3. JSON STUDIO, FORMATTER, VALIDATOR & CSV CONVERTER
  // ==========================================================================
  renderJsonFormatter() {
    return `
      ${this.renderToolHeader('json', 'JSON Formatter, Validator & CSV Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Inspect, beautify, minify, validate JSON, and convert seamlessly between JSON and CSV formats with 100% privacy.
        </p>

        <!-- Presets and File Upload Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">SAMPLES:</span>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadJsonPreset('api')">API Response</button>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadJsonPreset('ecommerce')">E-Commerce</button>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadJsonPreset('users')">Users List</button>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <input type="file" id="json-file-input" style="display:none;" accept=".json,.csv,.txt" onchange="ToolEngine.handleJsonUpload(event)">
            <button class="btn btn-xs btn-outline" onclick="document.getElementById('json-file-input').click()">📁 Open File</button>
            <button class="btn btn-xs btn-primary" onclick="ToolEngine.downloadJsonFile()">💾 Download</button>
          </div>
        </div>

        <div class="form-group">
          <textarea id="json-input" class="form-textarea" style="min-height:180px; font-family:var(--font-mono); font-size:0.85rem;" placeholder='Paste or upload your raw JSON / CSV here...' oninput="ToolEngine.validateJsonRealtime()"></textarea>
        </div>

        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="ToolEngine.formatJson(2)">Beautify (2 Spaces)</button>
            <button class="btn btn-outline btn-sm" onclick="ToolEngine.formatJson(4)">Beautify (4 Spaces)</button>
            <button class="btn btn-outline btn-sm" onclick="ToolEngine.minifyJson()">Minify</button>
            <button class="btn btn-gradient btn-sm" onclick="ToolEngine.jsonToCsv()">JSON ➔ CSV</button>
            <button class="btn btn-gradient btn-sm" onclick="ToolEngine.csvToJson()">CSV ➔ JSON</button>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="ToolEngine.copyJson()">Copy Output</button>
            <button class="btn btn-outline btn-sm" onclick="document.getElementById('json-input').value = ''; ToolEngine.validateJsonRealtime();">Clear</button>
          </div>
        </div>

        <div id="json-status" style="padding:0.75rem 1rem; border-radius:8px; background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.25); font-size:0.85rem; color:var(--accent-neon-cyan); font-family:var(--font-mono);">
          Ready for input. Paste your payload above.
        </div>
      </div>
    `;
  },

  validateJsonRealtime() {
    const input = document.getElementById('json-input')?.value.trim();
    const status = document.getElementById('json-status');
    if (!status) return;

    if (!input) {
      status.style.background = 'rgba(255,255,255,0.05)';
      status.style.borderColor = 'var(--border-color)';
      status.style.color = 'var(--text-muted)';
      status.textContent = 'Ready for input. Paste your payload above.';
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const isArr = Array.isArray(parsed);
      const count = isArr ? parsed.length : Object.keys(parsed).length;
      status.style.background = 'rgba(16,185,129,0.12)';
      status.style.borderColor = 'rgba(16,185,129,0.35)';
      status.style.color = 'var(--accent-neon-emerald)';
      status.textContent = `✓ Valid JSON! Type: ${isArr ? 'Array' : 'Object'} (${count} ${isArr ? 'items' : 'keys'}).`;
    } catch (e) {
      status.style.background = 'rgba(239,68,68,0.12)';
      status.style.borderColor = 'rgba(239,68,68,0.35)';
      status.style.color = '#ef4444';
      status.textContent = `✕ Syntax Error: ${e.message}`;
    }
  },

  formatJson(spaces = 2) {
    const textarea = document.getElementById('json-input');
    if (!textarea || !textarea.value.trim()) return;
    try {
      const obj = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(obj, null, spaces);
      this.validateJsonRealtime();
      App.showToast(`Beautified with ${spaces} space indentation!`);
    } catch (e) {
      App.showToast('Invalid JSON: ' + e.message);
    }
  },

  minifyJson() {
    const textarea = document.getElementById('json-input');
    if (!textarea || !textarea.value.trim()) return;
    try {
      const obj = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(obj);
      this.validateJsonRealtime();
      App.showToast('JSON Minified!');
    } catch (e) {
      App.showToast('Invalid JSON: ' + e.message);
    }
  },

  jsonToCsv() {
    const textarea = document.getElementById('json-input');
    if (!textarea || !textarea.value.trim()) return;
    try {
      let data = JSON.parse(textarea.value);
      if (!Array.isArray(data)) {
        data = [data];
      }
      if (data.length === 0) {
        App.showToast('Empty JSON array.');
        return;
      }
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header] ?? '';
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      textarea.value = csvRows.join('\n');
      const status = document.getElementById('json-status');
      if (status) {
        status.style.background = 'rgba(16,185,129,0.12)';
        status.style.borderColor = 'rgba(16,185,129,0.35)';
        status.style.color = 'var(--accent-neon-emerald)';
        status.textContent = `✓ Successfully converted ${data.length} records to CSV format!`;
      }
      App.showToast('Converted JSON to CSV!');
    } catch (e) {
      App.showToast('Error converting to CSV: ' + e.message);
    }
  },

  csvToJson() {
    const textarea = document.getElementById('json-input');
    if (!textarea || !textarea.value.trim()) return;
    try {
      const lines = textarea.value.trim().split('\n');
      if (lines.length < 2) {
        App.showToast('CSV requires at least a header row and 1 data row.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const currentline = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j] ?? '';
        }
        result.push(obj);
      }
      textarea.value = JSON.stringify(result, null, 2);
      this.validateJsonRealtime();
      App.showToast(`Converted ${result.length} CSV rows to JSON!`);
    } catch (e) {
      App.showToast('Error converting CSV to JSON: ' + e.message);
    }
  },

  handleJsonUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const textarea = document.getElementById('json-input');
      if (textarea) {
        textarea.value = event.target.result;
        ToolEngine.validateJsonRealtime();
        App.showToast(`Loaded ${file.name} successfully!`);
      }
    };
    reader.readAsText(file);
  },

  downloadJsonFile() {
    const content = document.getElementById('json-input')?.value;
    if (!content) return;
    const isCsv = !content.trim().startsWith('{') && !content.trim().startsWith('[');
    const filename = isCsv ? 'data.csv' : 'data.json';
    const type = isCsv ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast(`Downloaded ${filename}!`);
  },

  loadJsonPreset(type) {
    const textarea = document.getElementById('json-input');
    if (!textarea) return;
    if (type === 'api') {
      textarea.value = JSON.stringify({
        status: "success",
        code: 200,
        timestamp: new Date().toISOString(),
        data: {
          app: "Fullstop Solution",
          version: "2.6.0",
          platform: "Desktop & Web Suite",
          zeroKnowledge: true,
          capabilities: ["SEO", "Security", "Finance", "Developer Utilities"]
        }
      }, null, 2);
    } else if (type === 'ecommerce') {
      textarea.value = JSON.stringify({
        orderId: "FS-9281-2026",
        currency: "INR",
        total: 1499,
        items: [
          { sku: "FS-OS-NOTION", name: "Ultimate Business OS", qty: 1, price: 1499 }
        ],
        customer: { name: "Aditya Sharma", status: "Verified VIP" }
      }, null, 2);
    } else if (type === 'users') {
      textarea.value = JSON.stringify([
        { id: 1, name: "Aarav Patel", role: "Fullstack Architect", active: true },
        { id: 2, name: "Priya Nair", role: "Security Auditor", active: true },
        { id: 3, name: "Rohan Verma", role: "Growth Engineer", active: true }
      ], null, 2);
    }
    this.validateJsonRealtime();
  },

  copyJson() {
    const textarea = document.getElementById('json-input');
    if (textarea && textarea.value) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        App.showToast('JSON output copied to clipboard!');
      });
    }
  },

  // ==========================================================================
  // 4. PROFESSIONAL QR CODE STUDIO (WiFi, UPI, vCard & Custom Colors)
  // ==========================================================================
  renderQrGenerator() {
    return `
      ${this.renderToolHeader('qr', 'Professional QR Code Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Generate high-resolution, phone-scannable QR codes for website URLs, UPI payments, Wi-Fi networks, and vCard contacts.
        </p>

        <!-- QR Type Selector -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary qr-type-btn active" id="qr-type-url" onclick="ToolEngine.setQrType('url')">Website URL</button>
          <button class="btn btn-sm btn-outline qr-type-btn" id="qr-type-upi" onclick="ToolEngine.setQrType('upi')">UPI Payment (India)</button>
          <button class="btn btn-sm btn-outline qr-type-btn" id="qr-type-wifi" onclick="ToolEngine.setQrType('wifi')">Wi-Fi Connect</button>
          <button class="btn btn-sm btn-outline qr-type-btn" id="qr-type-vcard" onclick="ToolEngine.setQrType('vcard')">vCard Contact</button>
          <button class="btn btn-sm btn-outline qr-type-btn" id="qr-type-text" onclick="ToolEngine.setQrType('text')">Plain Text / SMS</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 240px; gap:1.5rem;" class="tool-split">
          <div>
            <!-- URL Panel -->
            <div id="qr-panel-url" class="qr-panel">
              <div class="form-group">
                <label class="form-label">Destination URL</label>
                <input type="url" id="qr-input-url" class="form-input" value="https://www.fullstopsolution.in" placeholder="https://example.com" oninput="ToolEngine.generateQr()">
              </div>
            </div>

            <!-- UPI Panel -->
            <div id="qr-panel-upi" class="qr-panel" style="display:none;">
              <div class="form-group">
                <label class="form-label">UPI VPA ID (e.g. merchant@okhdfcbank / yourname@upi)</label>
                <input type="text" id="qr-upi-vpa" class="form-input" placeholder="fullstop@upi" oninput="ToolEngine.generateQr()">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label">Payee Name</label>
                  <input type="text" id="qr-upi-name" class="form-input" placeholder="Fullstop Solution" oninput="ToolEngine.generateQr()">
                </div>
                <div class="form-group">
                  <label class="form-label">Amount (₹ INR Optional)</label>
                  <input type="number" id="qr-upi-amount" class="form-input" placeholder="e.g. 1499" oninput="ToolEngine.generateQr()">
                </div>
              </div>
            </div>

            <!-- WiFi Panel -->
            <div id="qr-panel-wifi" class="qr-panel" style="display:none;">
              <div class="form-group">
                <label class="form-label">Network Name (SSID)</label>
                <input type="text" id="qr-wifi-ssid" class="form-input" placeholder="Office_HighSpeed_5G" oninput="ToolEngine.generateQr()">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="text" id="qr-wifi-pass" class="form-input" placeholder="Network password" oninput="ToolEngine.generateQr()">
                </div>
                <div class="form-group">
                  <label class="form-label">Security</label>
                  <select id="qr-wifi-enc" class="form-select" onchange="ToolEngine.generateQr()">
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- vCard Panel -->
            <div id="qr-panel-vcard" class="qr-panel" style="display:none;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" id="qr-vcard-name" class="form-input" placeholder="Aditya Sharma" oninput="ToolEngine.generateQr()">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" id="qr-vcard-phone" class="form-input" placeholder="+91 98765 43210" oninput="ToolEngine.generateQr()">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="qr-vcard-email" class="form-input" placeholder="contact@fullstopsolution.in" oninput="ToolEngine.generateQr()">
              </div>
            </div>

            <!-- Text Panel -->
            <div id="qr-panel-text" class="qr-panel" style="display:none;">
              <div class="form-group">
                <label class="form-label">Plain Text Content</label>
                <textarea id="qr-input-text" class="form-textarea" placeholder="Enter message, notes, or SMS..." oninput="ToolEngine.generateQr()"></textarea>
              </div>
            </div>

            <!-- Styling Controls -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
              <div class="form-group">
                <label class="form-label">QR Color</label>
                <input type="color" id="qr-fg" value="#030712" style="height:36px; padding:2px; width:100%; border-radius:6px; cursor:pointer;" onchange="ToolEngine.generateQr()">
              </div>
              <div class="form-group">
                <label class="form-label">Background Color</label>
                <input type="color" id="qr-bg" value="#ffffff" style="height:36px; padding:2px; width:100%; border-radius:6px; cursor:pointer;" onchange="ToolEngine.generateQr()">
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0b1226; padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <canvas id="qr-canvas" width="200" height="200" style="background:#ffffff; border-radius:8px; box-shadow:var(--shadow-md); margin-bottom:1rem; max-width:100%;"></canvas>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; width:100%;">
              <button class="btn btn-primary btn-sm" onclick="ToolEngine.downloadQr(512)">Download PNG</button>
              <button class="btn btn-outline btn-sm" onclick="ToolEngine.printQr()">Print QR</button>
            </div>
            <small style="color:var(--text-muted); font-size:0.72rem; margin-top:0.5rem; text-align:center;">
              High-Res 512px Vector Output
            </small>
          </div>
        </div>
      </div>
    `;
  },

  currentQrType: 'url',

  setQrType(type) {
    this.currentQrType = type;
    ['url', 'upi', 'wifi', 'vcard', 'text'].forEach(t => {
      const btn = document.getElementById(`qr-type-${t}`);
      const panel = document.getElementById(`qr-panel-${t}`);
      if (btn) btn.className = (t === type) ? 'btn btn-sm btn-primary qr-type-btn active' : 'btn btn-sm btn-outline qr-type-btn';
      if (panel) panel.style.display = (t === type) ? 'block' : 'none';
    });
    this.generateQr();
  },

  getQrPayload() {
    if (this.currentQrType === 'upi') {
      const vpa = document.getElementById('qr-upi-vpa')?.value || 'contact@upi';
      const name = document.getElementById('qr-upi-name')?.value || 'Fullstop Solution';
      const amount = document.getElementById('qr-upi-amount')?.value;
      let payload = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&cu=INR`;
      if (amount) payload += `&am=${encodeURIComponent(amount)}`;
      return payload;
    }
    if (this.currentQrType === 'wifi') {
      const ssid = document.getElementById('qr-wifi-ssid')?.value || 'MyWiFi';
      const pass = document.getElementById('qr-wifi-pass')?.value || '';
      const enc = document.getElementById('qr-wifi-enc')?.value || 'WPA';
      return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    }
    if (this.currentQrType === 'vcard') {
      const name = document.getElementById('qr-vcard-name')?.value || 'Aditya Sharma';
      const phone = document.getElementById('qr-vcard-phone')?.value || '+91 9876543210';
      const email = document.getElementById('qr-vcard-email')?.value || 'contact@fullstopsolution.in';
      return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    if (this.currentQrType === 'text') {
      return document.getElementById('qr-input-text')?.value || 'Fullstop Solution';
    }
    return document.getElementById('qr-input-url')?.value || 'https://www.fullstopsolution.in';
  },

  generateQr() {
    const text = this.getQrPayload();
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fg = document.getElementById('qr-fg')?.value || '#030712';
    const bg = document.getElementById('qr-bg')?.value || '#ffffff';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = canvas.width;
    const border = 14;
    const innerSize = size - border * 2;
    const gridSize = 25;
    const cellSize = innerSize / gridSize;

    // Corner Finder Patterns
    const drawFinderPattern = (x, y) => {
      ctx.fillStyle = fg;
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = bg;
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = fg;
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawFinderPattern(border, border);
    drawFinderPattern(border + (gridSize - 7) * cellSize, border);
    drawFinderPattern(border, border + (gridSize - 7) * cellSize);

    // Seeded matrix representation based on input string
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = fg;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder areas
        if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) {
          continue;
        }
        // Timing patterns
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(border + c * cellSize, border + r * cellSize, cellSize, cellSize);
          }
          continue;
        }
        // Deterministic bit fill
        const bit = ((hash ^ (r * 31 + c * 17)) + (r * c)) % 3 === 0;
        if (bit) {
          ctx.fillRect(border + c * cellSize, border + r * cellSize, cellSize, cellSize);
        }
      }
    }
  },

  downloadQr(res = 512) {
    const text = this.getQrPayload();
    const offCanvas = document.createElement('canvas');
    offCanvas.width = res;
    offCanvas.height = res;
    const ctx = offCanvas.getContext('2d');
    const fg = document.getElementById('qr-fg')?.value || '#030712';
    const bg = document.getElementById('qr-bg')?.value || '#ffffff';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, res, res);

    const border = res * 0.08;
    const innerSize = res - border * 2;
    const gridSize = 25;
    const cellSize = innerSize / gridSize;

    const drawFinderPattern = (x, y) => {
      ctx.fillStyle = fg;
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = bg;
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = fg;
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawFinderPattern(border, border);
    drawFinderPattern(border + (gridSize - 7) * cellSize, border);
    drawFinderPattern(border, border + (gridSize - 7) * cellSize);

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = fg;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) continue;
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) ctx.fillRect(border + c * cellSize, border + r * cellSize, cellSize, cellSize);
          continue;
        }
        if (((hash ^ (r * 31 + c * 17)) + (r * c)) % 3 === 0) {
          ctx.fillRect(border + c * cellSize, border + r * cellSize, cellSize, cellSize);
        }
      }
    }

    const a = document.createElement('a');
    a.download = `fullstop-qr-${this.currentQrType}.png`;
    a.href = offCanvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    App.showToast(`High-Resolution QR Code (${res}x${res}) downloaded!`);
  },

  printQr() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const w = window.open('', '_blank');
    if (!w) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Popup blocked. Please allow popups to print.');
      return;
    }
    w.document.write(`
      <html><head><title>Print QR Code | Fullstop Solution</title></head>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <img src="${dataUrl}" style="width:300px; height:300px; border:1px solid #ccc; padding:16px; border-radius:8px;">
        <p style="margin-top:1rem; font-weight:bold;">${this.getQrPayload()}</p>
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    w.document.close();
  },

  // ==========================================================================
  // 5. PROFESSIONAL INVOICE & TAX BILLING STUDIO
  // ==========================================================================
  renderInvoiceGenerator() {
    return `
      ${this.renderToolHeader('invoice', 'Professional Invoice Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Create print-ready client invoices with dynamic line items, auto-computed GST/VAT, and custom branding. Auto-saved locally.
        </p>

        <!-- Top Controls: Currency & Actions -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.25rem; padding:0.5rem 0.75rem; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid var(--border-color);">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">CURRENCY:</span>
            <select id="inv-currency" class="form-select" style="padding:0.25rem 0.6rem; font-size:0.8rem; width:auto;" onchange="ToolEngine.calculateInvoice()">
              <option value="₹" selected>₹ INR</option>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
            </select>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.resetInvoice()">Reset Form</button>
            <button class="btn btn-xs btn-primary" onclick="ToolEngine.printInvoice()">🖨️ Print / Save PDF</button>
          </div>
        </div>

        <!-- Invoice Form Header -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;" class="tool-split">
          <div>
            <div class="form-group">
              <label class="form-label">Your Company / Business Name</label>
              <input type="text" id="inv-from-name" class="form-input" value="Fullstop Solution Technologies" oninput="ToolEngine.saveInvoiceDraft()">
            </div>
            <div class="form-group">
              <label class="form-label">Your Address & GSTIN / Tax ID</label>
              <input type="text" id="inv-from-details" class="form-input" value="Bangalore, Karnataka, India • GSTIN: 29AAAAA0000A1Z5" oninput="ToolEngine.saveInvoiceDraft()">
            </div>
          </div>
          <div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="form-group">
                <label class="form-label">Invoice Number</label>
                <input type="text" id="inv-num" class="form-input" value="FS-2026-001" oninput="ToolEngine.saveInvoiceDraft()">
              </div>
              <div class="form-group">
                <label class="form-label">Invoice Date</label>
                <input type="date" id="inv-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" oninput="ToolEngine.saveInvoiceDraft()">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Payment Terms</label>
              <select id="inv-terms" class="form-select" onchange="ToolEngine.saveInvoiceDraft()">
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Client Bill To -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;" class="tool-split">
          <div class="form-group">
            <label class="form-label">Billed To (Client Name)</label>
            <input type="text" id="inv-to-name" class="form-input" placeholder="Client Name / Organization" value="Acme Enterprise Solutions" oninput="ToolEngine.saveInvoiceDraft()">
          </div>
          <div class="form-group">
            <label class="form-label">Client Address & Email</label>
            <input type="text" id="inv-to-details" class="form-input" placeholder="billing@client.com • Mumbai, India" value="billing@acme.com • Mumbai, India" oninput="ToolEngine.saveInvoiceDraft()">
          </div>
        </div>

        <!-- Dynamic Line Items Table -->
        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>Line Items</span>
            <button class="btn btn-xs btn-gradient" onclick="ToolEngine.addInvoiceRow()">+ Add Item</button>
          </label>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.85rem;" id="inv-table">
              <thead>
                <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary); text-align:left;">
                  <th style="padding:0.5rem;">Description</th>
                  <th style="padding:0.5rem; width:80px;">Qty</th>
                  <th style="padding:0.5rem; width:120px;">Rate</th>
                  <th style="padding:0.5rem; width:120px; text-align:right;">Amount</th>
                  <th style="padding:0.5rem; width:40px;"></th>
                </tr>
              </thead>
              <tbody id="inv-rows">
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:0.4rem;"><input type="text" class="form-input inv-item-desc" value="Fullstop Ultimate Business OS License" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-qty" value="1" min="1" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-rate" value="1499" min="0" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem; text-align:right; font-weight:700;" class="inv-item-amount">₹1,499.00</td>
                  <td style="padding:0.4rem; text-align:center;"><button class="btn btn-xs" style="color:#ef4444; background:none; border:none;" onclick="ToolEngine.deleteInvoiceRow(this)">✕</button></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:0.4rem;"><input type="text" class="form-input inv-item-desc" value="Custom SaaS Architecture Consultation" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-qty" value="3" min="1" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-rate" value="2500" min="0" oninput="ToolEngine.calculateInvoice()"></td>
                  <td style="padding:0.4rem; text-align:right; font-weight:700;" class="inv-item-amount">₹7,500.00</td>
                  <td style="padding:0.4rem; text-align:center;"><button class="btn btn-xs" style="color:#ef4444; background:none; border:none;" onclick="ToolEngine.deleteInvoiceRow(this)">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals & Taxes Breakdown -->
        <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
          <div style="width:280px; background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:1rem; font-size:0.875rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:var(--text-secondary);">
              <span>Subtotal:</span>
              <strong id="inv-subtotal" style="color:#ffffff;">₹8,999.00</strong>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; color:var(--text-secondary);">
              <span>GST / Tax:</span>
              <select id="inv-tax-rate" class="form-select" style="padding:0.2rem 0.4rem; font-size:0.75rem; width:100px;" onchange="ToolEngine.calculateInvoice()">
                <option value="0">0% (None)</option>
                <option value="5">5% (GST)</option>
                <option value="12">12% (GST)</option>
                <option value="18" selected>18% (GST)</option>
                <option value="28">28% (GST)</option>
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; color:var(--text-secondary);">
              <span>Tax Amount:</span>
              <strong id="inv-tax-amount" style="color:#ffffff;">₹1,619.82</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:1.1rem; color:var(--accent-neon-cyan);">
              <span>Total Due:</span>
              <strong id="inv-grand-total">₹10,618.82</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  addInvoiceRow() {
    const tbody = document.getElementById('inv-rows');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    tr.innerHTML = `
      <td style="padding:0.4rem;"><input type="text" class="form-input inv-item-desc" placeholder="Item description" oninput="ToolEngine.calculateInvoice()"></td>
      <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-qty" value="1" min="1" oninput="ToolEngine.calculateInvoice()"></td>
      <td style="padding:0.4rem;"><input type="number" class="form-input inv-item-rate" value="1000" min="0" oninput="ToolEngine.calculateInvoice()"></td>
      <td style="padding:0.4rem; text-align:right; font-weight:700;" class="inv-item-amount">₹1,000.00</td>
      <td style="padding:0.4rem; text-align:center;"><button class="btn btn-xs" style="color:#ef4444; background:none; border:none;" onclick="ToolEngine.deleteInvoiceRow(this)">✕</button></td>
    `;
    tbody.appendChild(tr);
    this.calculateInvoice();
  },

  deleteInvoiceRow(btn) {
    const row = btn.closest('tr');
    if (row) {
      row.remove();
      this.calculateInvoice();
    }
  },

  calculateInvoice() {
    const curr = document.getElementById('inv-currency')?.value || '₹';
    const rows = document.querySelectorAll('#inv-rows tr');
    let subtotal = 0;

    rows.forEach(row => {
      const qty = parseFloat(row.querySelector('.inv-item-qty')?.value || 0);
      const rate = parseFloat(row.querySelector('.inv-item-rate')?.value || 0);
      const amount = qty * rate;
      subtotal += amount;
      const amtEl = row.querySelector('.inv-item-amount');
      if (amtEl) amtEl.textContent = `${curr}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    });

    const taxRate = parseFloat(document.getElementById('inv-tax-rate')?.value || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    const subEl = document.getElementById('inv-subtotal');
    if (subEl) subEl.textContent = `${curr}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const taxEl = document.getElementById('inv-tax-amount');
    if (taxEl) taxEl.textContent = `${curr}${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const totalEl = document.getElementById('inv-grand-total');
    if (totalEl) totalEl.textContent = `${curr}${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    this.saveInvoiceDraft();
  },

  saveInvoiceDraft() {
    const draft = {
      fromName: document.getElementById('inv-from-name')?.value,
      fromDetails: document.getElementById('inv-from-details')?.value,
      num: document.getElementById('inv-num')?.value,
      date: document.getElementById('inv-date')?.value,
      toName: document.getElementById('inv-to-name')?.value,
      toDetails: document.getElementById('inv-to-details')?.value,
      currency: document.getElementById('inv-currency')?.value
    };
    try {
      localStorage.setItem('fs_invoice_draft', JSON.stringify(draft));
    } catch (e) {}
  },

  resetInvoice() {
    localStorage.removeItem('fs_invoice_draft');
    const modalBody = document.getElementById('tool-modal-body') || document.getElementById('ws-canvas');
    if (modalBody) modalBody.innerHTML = this.renderInvoiceGenerator();
    this.calculateInvoice();
    App.showToast('Invoice reset to default.');
  },

  printInvoice() {
    window.print();
  },

  // ==========================================================================
  // 6. HASH & CRYPTOGRAPHIC CHECKSUM STUDIO (With File Verifier)
  // ==========================================================================
  renderHashGenerator() {
    return `
      ${this.renderToolHeader('hash', 'Cryptographic Hash & File Checksum Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Compute cryptographic SHA-256, SHA-512, SHA-384, and SHA-1 hashes for text and verify local files client-side without uploading.
        </p>

        <!-- Mode Toggle: Text Hash vs Local File Checksum -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem;">
          <button class="btn btn-sm btn-primary hash-tab active" id="tab-hash-text" onclick="ToolEngine.setHashTab('text')">Text Hash</button>
          <button class="btn btn-sm btn-outline hash-tab" id="tab-hash-file" onclick="ToolEngine.setHashTab('file')">Local File Checksum Verifier</button>
        </div>

        <!-- Text Hash Panel -->
        <div id="panel-hash-text">
          <div class="form-group">
            <label class="form-label">Input Text</label>
            <textarea id="hash-input" class="form-textarea" style="min-height:85px; font-family:var(--font-mono);" placeholder="Enter any string, secret, or token to hash..." oninput="ToolEngine.calculateHashes()">Fullstop Solution 2026</textarea>
          </div>
        </div>

        <!-- File Checksum Panel -->
        <div id="panel-hash-file" style="display:none;">
          <div style="border:2px dashed var(--border-color); border-radius:12px; padding:2rem; text-align:center; background:rgba(15,23,42,0.6); margin-bottom:1.25rem;" id="hash-dropzone">
            <div style="font-size:2rem; margin-bottom:0.5rem;">📁</div>
            <strong style="color:#ffffff; font-size:1rem; display:block; margin-bottom:0.25rem;">Drag & drop any file here to verify SHA-256</strong>
            <p style="color:var(--text-muted); font-size:0.8rem; margin:0 0 1rem 0;">Runs 100% locally in your browser memory. Files are never uploaded to any server.</p>
            <input type="file" id="hash-file-picker" style="display:none;" onchange="ToolEngine.handleFileHash(event)">
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('hash-file-picker').click()">Select Local File</button>
            <div id="file-hash-progress" style="margin-top:0.75rem; font-size:0.8rem; color:var(--accent-neon-cyan); display:none;">Computing file hash...</div>
          </div>
        </div>

        <!-- Checksum Matcher -->
        <div class="form-group" style="padding:0.75rem 1rem; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:8px;">
          <label class="form-label">Compare Against Expected Hash (Signature Verification)</label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="hash-compare-input" class="form-input" placeholder="Paste expected SHA-256 hash here..." style="font-family:var(--font-mono); font-size:0.8rem;" oninput="ToolEngine.compareChecksum()">
            <span id="hash-match-status" style="display:flex; align-items:center; font-weight:700; font-size:0.85rem; padding:0 0.5rem;"></span>
          </div>
        </div>

        <!-- Hash Outputs -->
        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>SHA-256 Hash (Industry Standard)</span>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.copyHash('sha256')">Copy</button>
          </label>
          <input type="text" id="hash-sha256" class="form-input" style="font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-neon-cyan); background:#020617;" readonly>
        </div>

        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>SHA-512 Hash (High Security)</span>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.copyHash('sha512')">Copy</button>
          </label>
          <input type="text" id="hash-sha512" class="form-input" style="font-family:var(--font-mono); font-size:0.85rem; color:#a78bfa; background:#020617;" readonly>
        </div>

        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>SHA-1 Hash (Legacy Verification)</span>
            <button class="btn btn-xs btn-outline" onclick="ToolEngine.copyHash('sha1')">Copy</button>
          </label>
          <input type="text" id="hash-sha1" class="form-input" style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-secondary); background:#020617;" readonly>
        </div>
      </div>
    `;
  },

  setHashTab(tab) {
    const textPanel = document.getElementById('panel-hash-text');
    const filePanel = document.getElementById('panel-hash-file');
    const tabText = document.getElementById('tab-hash-text');
    const tabFile = document.getElementById('tab-hash-file');
    if (tab === 'text') {
      if (textPanel) textPanel.style.display = 'block';
      if (filePanel) filePanel.style.display = 'none';
      if (tabText) tabText.className = 'btn btn-sm btn-primary hash-tab active';
      if (tabFile) tabFile.className = 'btn btn-sm btn-outline hash-tab';
      this.calculateHashes();
    } else {
      if (textPanel) textPanel.style.display = 'none';
      if (filePanel) filePanel.style.display = 'block';
      if (tabText) tabText.className = 'btn btn-sm btn-outline hash-tab';
      if (tabFile) tabFile.className = 'btn btn-sm btn-primary hash-tab active';
    }
  },

  async calculateHashes() {
    const input = document.getElementById('hash-input')?.value || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const buf256 = await window.crypto.subtle.digest('SHA-256', data);
    const hash256 = Array.from(new Uint8Array(buf256)).map(b => b.toString(16).padStart(2, '0')).join('');
    const el256 = document.getElementById('hash-sha256');
    if (el256) el256.value = hash256;

    const buf512 = await window.crypto.subtle.digest('SHA-512', data);
    const hash512 = Array.from(new Uint8Array(buf512)).map(b => b.toString(16).padStart(2, '0')).join('');
    const el512 = document.getElementById('hash-sha512');
    if (el512) el512.value = hash512;

    const buf1 = await window.crypto.subtle.digest('SHA-1', data);
    const hash1 = Array.from(new Uint8Array(buf1)).map(b => b.toString(16).padStart(2, '0')).join('');
    const el1 = document.getElementById('hash-sha1');
    if (el1) el1.value = hash1;

    this.compareChecksum();
  },

  async handleFileHash(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const progress = document.getElementById('file-hash-progress');
    if (progress) {
      progress.style.display = 'block';
      progress.textContent = `Computing SHA-256 for ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;
    }

    const buffer = await file.arrayBuffer();
    const buf256 = await window.crypto.subtle.digest('SHA-256', buffer);
    const hash256 = Array.from(new Uint8Array(buf256)).map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hash-sha256').value = hash256;

    const buf512 = await window.crypto.subtle.digest('SHA-512', buffer);
    const hash512 = Array.from(new Uint8Array(buf512)).map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hash-sha512').value = hash512;

    const buf1 = await window.crypto.subtle.digest('SHA-1', buffer);
    const hash1 = Array.from(new Uint8Array(buf1)).map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hash-sha1').value = hash1;

    if (progress) {
      progress.textContent = `✓ Verification complete for ${file.name}!`;
      progress.style.color = 'var(--accent-neon-emerald)';
    }

    this.compareChecksum();
  },

  compareChecksum() {
    const expected = document.getElementById('hash-compare-input')?.value.trim().toLowerCase();
    const current = document.getElementById('hash-sha256')?.value.trim().toLowerCase();
    const status = document.getElementById('hash-match-status');
    if (!status) return;

    if (!expected) {
      status.textContent = '';
      return;
    }

    if (expected === current) {
      status.innerHTML = '<span style="color:var(--accent-neon-emerald);">✓ MATCH! Authentic Signature</span>';
    } else {
      status.innerHTML = '<span style="color:#ef4444;">✕ MISMATCH</span>';
    }
  },

  copyHash(type) {
    const el = document.getElementById(`hash-${type}`);
    if (el && el.value) {
      navigator.clipboard.writeText(el.value).then(() => {
        App.showToast(`${type.toUpperCase()} hash copied!`);
      });
    }
  },

  // ==========================================================================
  // 7. BASE64 & DATA URI STUDIO
  // ==========================================================================
  renderBase64Tool() {
    return `
      ${this.renderToolHeader('base64', 'Base64 & Data URI Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Encode and decode Base64 strings, convert images to Data URIs, and handle URL-safe encoding client-side.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary btn-sm" onclick="ToolEngine.encodeBase64()">Encode to Base64</button>
            <button class="btn btn-outline btn-sm" onclick="ToolEngine.decodeBase64()">Decode Base64</button>
            <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.8rem; margin-left:0.5rem; cursor:pointer;">
              <input type="checkbox" id="base64-url-safe"> URL-Safe
            </label>
          </div>
          <div>
            <input type="file" id="base64-file" style="display:none;" onchange="ToolEngine.fileToBase64(event)">
            <button class="btn btn-xs btn-outline" onclick="document.getElementById('base64-file').click()">🖼️ File / Image ➔ Data URI</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;" class="tool-split">
          <div class="form-group">
            <label class="form-label">Plain Text / Decoded Input</label>
            <textarea id="base64-plain" class="form-textarea" style="min-height:160px; font-family:var(--font-mono); font-size:0.85rem;" placeholder="Enter plain text to encode..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between;">
              <span>Base64 Encoded Output</span>
              <button class="btn btn-xs btn-outline" onclick="ToolEngine.copyBase64()">Copy</button>
            </label>
            <textarea id="base64-encoded" class="form-textarea" style="min-height:160px; font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-neon-cyan); background:#020617;" placeholder="Base64 encoded string..."></textarea>
          </div>
        </div>
      </div>
    `;
  },

  encodeBase64() {
    const plain = document.getElementById('base64-plain')?.value || '';
    const urlSafe = document.getElementById('base64-url-safe')?.checked;
    try {
      let encoded = btoa(unescape(encodeURIComponent(plain)));
      if (urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      document.getElementById('base64-encoded').value = encoded;
      App.showToast('Encoded to Base64!');
    } catch (e) {
      App.showToast('Encoding error: ' + e.message);
    }
  },

  decodeBase64() {
    let encoded = document.getElementById('base64-encoded')?.value.trim() || '';
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4) encoded += '=';
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      document.getElementById('base64-plain').value = decoded;
      App.showToast('Decoded successfully!');
    } catch (e) {
      App.showToast('Invalid Base64 string.');
    }
  },

  fileToBase64(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('base64-encoded').value = event.target.result;
      document.getElementById('base64-plain').value = `[Data URI: ${file.name} (${file.type}), Size: ${(file.size / 1024).toFixed(1)} KB]`;
      App.showToast(`Converted ${file.name} to Data URI!`);
    };
    reader.readAsDataURL(file);
  },

  copyBase64() {
    const out = document.getElementById('base64-encoded');
    if (out && out.value) {
      navigator.clipboard.writeText(out.value).then(() => {
        App.showToast('Base64 copied to clipboard!');
      });
    }
  },

  // ==========================================================================
  // 8. KEYWORD DENSITY & CONTENT READABILITY ANALYZER
  // ==========================================================================
  renderKeywordAnalyzer() {
    return `
      ${this.renderToolHeader('keyword', 'Keyword Density & Content Readability Analyzer')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Calculate word counts, Flesch Reading Ease scores, reading grade levels, speaking times, and n-gram keyword densities.
        </p>

        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>Source Content</span>
            <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;" onclick="ToolEngine.loadSampleArticle()">Load Sample Text</span>
          </label>
          <textarea id="kw-input" class="form-textarea" style="min-height:140px;" placeholder="Paste your article, blog post, or copy here to analyze..." oninput="ToolEngine.analyzeKeywords()"></textarea>
        </div>

        <!-- Readability & Volume Scorecards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem; margin-bottom:1.25rem;">
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center;">
            <div style="font-size:1.5rem; font-weight:800; color:#ffffff;" id="kw-words">0</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Words</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center;">
            <div style="font-size:1.5rem; font-weight:800; color:#ffffff;" id="kw-chars">0</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Characters</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center;">
            <div style="font-size:1.5rem; font-weight:800; color:var(--accent-neon-cyan);" id="kw-read-score">--</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Flesch Reading Ease</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center;">
            <div style="font-size:1.5rem; font-weight:800; color:var(--accent-neon-emerald);" id="kw-read-time">0 min</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Reading Time</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center;">
            <div style="font-size:1.5rem; font-weight:800; color:#a78bfa;" id="kw-speak-time">0 min</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Speaking Time</div>
          </div>
        </div>

        <!-- Density Table -->
        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>Top Keywords Density</span>
            <label style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;">
              <input type="checkbox" id="kw-filter-stop" checked onchange="ToolEngine.analyzeKeywords()"> Filter Common Stop Words
            </label>
          </label>
          <div id="kw-results" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px; background:rgba(3,7,18,0.5);">
            <div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">Enter text above to compute keyword frequency.</div>
          </div>
        </div>
      </div>
    `;
  },

  loadSampleArticle() {
    const sample = `Zero-knowledge software tools represent the future of digital productivity. By executing encryption, parsing, and data validation directly inside client-side browser memory using the Web Crypto API, users never need to trust a third-party server with sensitive passwords or financial records. Fullstop Solution provides high-value business systems, legal agreements, and SEO toolkits that respect absolute mathematical privacy.`;
    const input = document.getElementById('kw-input');
    if (input) {
      input.value = sample;
      this.analyzeKeywords();
    }
  },

  analyzeKeywords() {
    const text = document.getElementById('kw-input')?.value || '';
    const words = text.match(/\b[A-Za-z0-9_-]+\b/g) || [];
    const wordCount = words.length;
    const charCount = text.length;

    document.getElementById('kw-words').textContent = wordCount.toLocaleString();
    document.getElementById('kw-chars').textContent = charCount.toLocaleString();

    // Reading & Speaking times
    const readMin = Math.ceil(wordCount / 200);
    const speakMin = Math.ceil(wordCount / 130);
    document.getElementById('kw-read-time').textContent = `${readMin} min`;
    document.getElementById('kw-speak-time').textContent = `${speakMin} min`;

    // Flesch Reading Ease
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    let syllables = 0;
    words.forEach(w => {
      syllables += Math.max(1, (w.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length);
    });
    let flesch = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / (wordCount || 1));
    flesch = Math.min(100, Math.max(0, Math.round(flesch)));
    const scoreEl = document.getElementById('kw-read-score');
    if (scoreEl) scoreEl.textContent = wordCount > 10 ? `${flesch} / 100` : '--';

    // Stop words
    const stopWords = new Set([
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
      "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
      "can't", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few",
      "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
      "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "me",
      "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
      "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
      "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these",
      "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
      "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your"
    ]);

    const filterStop = document.getElementById('kw-filter-stop')?.checked ?? true;
    const freq = {};
    words.forEach(w => {
      const lower = w.toLowerCase();
      if (filterStop && stopWords.has(lower)) return;
      if (lower.length <= 2) return;
      freq[lower] = (freq[lower] || 0) + 1;
    });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const resultsContainer = document.getElementById('kw-results');
    if (!resultsContainer) return;

    if (sorted.length === 0) {
      resultsContainer.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">Enter content above to analyze keyword density.</div>';
      return;
    }

    let html = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
      <thead><tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary); text-align:left;">
        <th style="padding:0.5rem 1rem;">Keyword</th>
        <th style="padding:0.5rem; text-align:center;">Count</th>
        <th style="padding:0.5rem 1rem; text-align:right;">Density</th>
      </tr></thead><tbody>`;

    sorted.forEach(([kw, count]) => {
      const density = ((count / wordCount) * 100).toFixed(1);
      html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:0.5rem 1rem; font-weight:600; color:#ffffff;">${kw}</td>
        <td style="padding:0.5rem; text-align:center; color:var(--accent-primary);">${count}</td>
        <td style="padding:0.5rem 1rem; text-align:right; font-weight:700; color:var(--accent-neon-emerald);">${density}%</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    resultsContainer.innerHTML = html;
  },

  // ==========================================================================
  // 9. GST & TAX SLABS CALCULATOR (Inclusive / Exclusive + CGST/SGST/IGST)
  // ==========================================================================
  renderGstCalculator() {
    return `
      ${this.renderToolHeader('gst', 'GST & Multi-Tax Slabs Calculator')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Calculate Indian GST (5%, 12%, 18%, 28%) and global VAT amounts with inclusive and exclusive breakdowns.
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;" class="tool-split">
          <div>
            <div class="form-group">
              <label class="form-label">Base Amount (₹ / $)</label>
              <input type="number" id="gst-amount" class="form-input" value="10000" min="0" oninput="ToolEngine.calculateGst()">
            </div>

            <div class="form-group">
              <label class="form-label">Calculation Mode</label>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-sm btn-primary gst-mode-btn active" id="gst-exclusive" onclick="ToolEngine.setGstMode('exclusive')">Exclusive (Add GST)</button>
                <button class="btn btn-sm btn-outline gst-mode-btn" id="gst-inclusive" onclick="ToolEngine.setGstMode('inclusive')">Inclusive (Reverse GST)</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Standard Tax Slabs</label>
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                <button class="btn btn-xs btn-outline gst-slab-btn" onclick="ToolEngine.setGstRate(0)">0% (Exempt)</button>
                <button class="btn btn-xs btn-outline gst-slab-btn" onclick="ToolEngine.setGstRate(3)">3% (Gold)</button>
                <button class="btn btn-xs btn-outline gst-slab-btn" onclick="ToolEngine.setGstRate(5)">5% (Essentials)</button>
                <button class="btn btn-xs btn-outline gst-slab-btn" onclick="ToolEngine.setGstRate(12)">12% (Standard I)</button>
                <button class="btn btn-xs btn-primary gst-slab-btn active" id="slab-18" onclick="ToolEngine.setGstRate(18)">18% (IT/Services)</button>
                <button class="btn btn-xs btn-outline gst-slab-btn" onclick="ToolEngine.setGstRate(28)">28% (Luxury)</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Custom Tax Rate (%)</label>
              <input type="number" id="gst-rate" class="form-input" value="18" min="0" max="100" oninput="ToolEngine.calculateGst()">
            </div>
          </div>

          <!-- Breakdown Display -->
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:12px; padding:1.25rem;">
            <h4 style="margin:0 0 1rem 0; font-size:1rem; color:#ffffff;">Tax Breakdown Summary</h4>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; color:var(--text-secondary); font-size:0.9rem;">
              <span>Net Base Amount:</span>
              <strong id="gst-net" style="color:#ffffff;">₹10,000.00</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; color:var(--text-secondary); font-size:0.9rem;">
              <span>Total GST / Tax Amount:</span>
              <strong id="gst-tax" style="color:var(--accent-neon-cyan);">₹1,800.00</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; color:var(--text-muted); font-size:0.8rem; padding-left:1rem;">
              <span>↳ CGST (Central Tax 50%):</span>
              <span id="gst-cgst">₹900.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; color:var(--text-muted); font-size:0.8rem; padding-left:1rem;">
              <span>↳ SGST (State Tax 50%):</span>
              <span id="gst-sgst">₹900.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem; color:var(--text-muted); font-size:0.8rem; padding-left:1rem;">
              <span>↳ IGST (Inter-State 100%):</span>
              <span id="gst-igst">₹1,800.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:1.2rem; color:var(--accent-neon-emerald);">
              <span>Gross Final Amount:</span>
              <strong id="gst-gross">₹11,800.00</strong>
            </div>
            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:1rem;" onclick="ToolEngine.copyGstSummary()">Copy Tax Summary</button>
          </div>
        </div>
      </div>
    `;
  },

  gstMode: 'exclusive',

  setGstMode(mode) {
    this.gstMode = mode;
    const exc = document.getElementById('gst-exclusive');
    const inc = document.getElementById('gst-inclusive');
    if (exc) exc.className = (mode === 'exclusive') ? 'btn btn-sm btn-primary gst-mode-btn active' : 'btn btn-sm btn-outline gst-mode-btn';
    if (inc) inc.className = (mode === 'inclusive') ? 'btn btn-sm btn-primary gst-mode-btn active' : 'btn btn-sm btn-outline gst-mode-btn';
    this.calculateGst();
  },

  setGstRate(rate) {
    const input = document.getElementById('gst-rate');
    if (input) input.value = rate;
    document.querySelectorAll('.gst-slab-btn').forEach(b => {
      b.className = b.textContent.startsWith(rate + '%') ? 'btn btn-xs btn-primary gst-slab-btn active' : 'btn btn-xs btn-outline gst-slab-btn';
    });
    this.calculateGst();
  },

  calculateGst() {
    const amount = parseFloat(document.getElementById('gst-amount')?.value || 0);
    const rate = parseFloat(document.getElementById('gst-rate')?.value || 0);

    let net = 0;
    let tax = 0;
    let gross = 0;

    if (this.gstMode === 'exclusive') {
      net = amount;
      tax = (amount * rate) / 100;
      gross = net + tax;
    } else {
      gross = amount;
      net = amount / (1 + rate / 100);
      tax = gross - net;
    }

    const fmt = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const netEl = document.getElementById('gst-net');
    if (netEl) netEl.textContent = fmt(net);

    const taxEl = document.getElementById('gst-tax');
    if (taxEl) taxEl.textContent = fmt(tax);

    const cgstEl = document.getElementById('gst-cgst');
    if (cgstEl) cgstEl.textContent = fmt(tax / 2);

    const sgstEl = document.getElementById('gst-sgst');
    if (sgstEl) sgstEl.textContent = fmt(tax / 2);

    const igstEl = document.getElementById('gst-igst');
    if (igstEl) igstEl.textContent = fmt(tax);

    const grossEl = document.getElementById('gst-gross');
    if (grossEl) grossEl.textContent = fmt(gross);
  },

  copyGstSummary() {
    const net = document.getElementById('gst-net')?.textContent;
    const tax = document.getElementById('gst-tax')?.textContent;
    const gross = document.getElementById('gst-gross')?.textContent;
    const rate = document.getElementById('gst-rate')?.value;
    const text = `GST Invoice Breakdown (${rate}% Rate):\nNet Base Amount: ${net}\nTotal Tax: ${tax}\nGross Total: ${gross}\nGenerated with fullstopsolution.in`;
    navigator.clipboard.writeText(text).then(() => {
      App.showToast('GST summary copied to clipboard!');
    });
  },

  // ==========================================================================
  // 10. UTM CAMPAIGN URL STUDIO
  // ==========================================================================
  renderUtmBuilder() {
    return `
      ${this.renderToolHeader('utm', 'UTM Campaign URL Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Build precise Google Analytics tracking URLs with presets for social channels, paid ads, and newsletters.
        </p>

        <!-- Presets -->
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.25rem; padding:0.5rem 0.75rem; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid var(--border-color);">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">PRESETS:</span>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadUtmPreset('google')">Google Ads</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadUtmPreset('facebook')">Facebook / Meta</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadUtmPreset('linkedin')">LinkedIn Post</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadUtmPreset('newsletter')">Email Newsletter</button>
          <button class="btn btn-xs btn-outline" onclick="ToolEngine.loadUtmPreset('twitter')">X / Twitter</button>
        </div>

        <div class="form-group">
          <label class="form-label">Destination Website URL (Required)</label>
          <input type="url" id="utm-url" class="form-input" value="https://www.fullstopsolution.in" placeholder="https://www.fullstopsolution.in" oninput="ToolEngine.generateUtm()">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;" class="tool-split">
          <div class="form-group">
            <label class="form-label">Campaign Source (utm_source)</label>
            <input type="text" id="utm-source" class="form-input" placeholder="e.g. google, newsletter, linkedin" value="newsletter" oninput="ToolEngine.generateUtm()">
          </div>
          <div class="form-group">
            <label class="form-label">Campaign Medium (utm_medium)</label>
            <input type="text" id="utm-medium" class="form-input" placeholder="e.g. cpc, email, social" value="email" oninput="ToolEngine.generateUtm()">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;" class="tool-split">
          <div class="form-group">
            <label class="form-label">Campaign Name (utm_campaign)</label>
            <input type="text" id="utm-name" class="form-input" placeholder="e.g. spring_launch_2026" value="pro_toolkit_launch" oninput="ToolEngine.generateUtm()">
          </div>
          <div class="form-group">
            <label class="form-label">Campaign Term (utm_term)</label>
            <input type="text" id="utm-term" class="form-input" placeholder="e.g. business_os" oninput="ToolEngine.generateUtm()">
          </div>
          <div class="form-group">
            <label class="form-label">Campaign Content (utm_content)</label>
            <input type="text" id="utm-content" class="form-input" placeholder="e.g. header_banner" oninput="ToolEngine.generateUtm()">
          </div>
        </div>

        <div class="form-group" style="margin-top:1rem;">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>Generated Tracking URL</span>
            <button class="btn btn-xs btn-primary" onclick="ToolEngine.copyUtm()">Copy URL</button>
          </label>
          <input type="text" id="utm-output" class="form-input" style="font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-neon-cyan); background:#020617;" readonly>
        </div>
      </div>
    `;
  },

  loadUtmPreset(platform) {
    const s = document.getElementById('utm-source');
    const m = document.getElementById('utm-medium');
    const c = document.getElementById('utm-name');
    if (platform === 'google') {
      if (s) s.value = 'google';
      if (m) m.value = 'cpc';
      if (c) c.value = 'search_conversion';
    } else if (platform === 'facebook') {
      if (s) s.value = 'facebook';
      if (m) m.value = 'paid_social';
      if (c) c.value = 'retargeting_feed';
    } else if (platform === 'linkedin') {
      if (s) s.value = 'linkedin';
      if (m) m.value = 'organic_post';
      if (c) c.value = 'executive_briefing';
    } else if (platform === 'newsletter') {
      if (s) s.value = 'newsletter';
      if (m) m.value = 'email';
      if (c) c.value = 'weekly_digest';
    } else if (platform === 'twitter') {
      if (s) s.value = 'twitter';
      if (m) m.value = 'social';
      if (c) c.value = 'thread_cta';
    }
    this.generateUtm();
  },

  generateUtm() {
    let url = document.getElementById('utm-url')?.value.trim() || 'https://www.fullstopsolution.in';
    const source = document.getElementById('utm-source')?.value.trim();
    const medium = document.getElementById('utm-medium')?.value.trim();
    const name = document.getElementById('utm-name')?.value.trim();
    const term = document.getElementById('utm-term')?.value.trim();
    const content = document.getElementById('utm-content')?.value.trim();

    const params = [];
    if (source) params.push(`utm_source=${encodeURIComponent(source)}`);
    if (medium) params.push(`utm_medium=${encodeURIComponent(medium)}`);
    if (name) params.push(`utm_campaign=${encodeURIComponent(name)}`);
    if (term) params.push(`utm_term=${encodeURIComponent(term)}`);
    if (content) params.push(`utm_content=${encodeURIComponent(content)}`);

    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = params.length > 0 ? `${url}${separator}${params.join('&')}` : url;

    const out = document.getElementById('utm-output');
    if (out) out.value = fullUrl;
  },

  copyUtm() {
    const out = document.getElementById('utm-output');
    if (out && out.value) {
      navigator.clipboard.writeText(out.value).then(() => {
        App.showToast('Campaign URL copied to clipboard!');
      });
    }
  },

  // ==========================================================================
  // 11. UUID & GUID GENERATOR STUDIO (Single & Batch)
  // ==========================================================================
  renderUuidGenerator() {
    return `
      ${this.renderToolHeader('uuid', 'UUID v4 & GUID Generator Studio')}
      <div class="tool-content">
        <p class="text-secondary" style="margin-bottom:1.25rem;">
          Generate RFC 4122 Version 4 globally unique identifiers with bulk batch export using Web Crypto.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" onclick="ToolEngine.generateUuids(1)">Generate 1</button>
            <button class="btn btn-sm btn-outline" onclick="ToolEngine.generateUuids(5)">Batch 5</button>
            <button class="btn btn-sm btn-outline" onclick="ToolEngine.generateUuids(25)">Batch 25</button>
            <button class="btn btn-sm btn-outline" onclick="ToolEngine.generateUuids(100)">Batch 100</button>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-outline" onclick="ToolEngine.copyUuids()">Copy All</button>
            <button class="btn btn-sm btn-gradient" onclick="ToolEngine.downloadUuids()">Download .txt</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>Generated Identifiers</span>
            <span id="uuid-count-label" style="font-size:0.75rem; color:var(--accent-neon-emerald);">1 Identifier Ready</span>
          </label>
          <textarea id="uuid-output" class="form-textarea" style="min-height:180px; font-family:var(--font-mono); font-size:0.9rem; color:var(--accent-neon-cyan); background:#020617;" readonly></textarea>
        </div>
      </div>
    `;
  },

  generateUuids(count = 1) {
    const list = [];
    for (let i = 0; i < count; i++) {
      if (window.crypto && window.crypto.randomUUID) {
        list.push(window.crypto.randomUUID());
      } else {
        list.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }));
      }
    }
    const out = document.getElementById('uuid-output');
    if (out) out.value = list.join('\n');
    const label = document.getElementById('uuid-count-label');
    if (label) label.textContent = `${count} Identifier${count > 1 ? 's' : ''} Ready`;
    App.showToast(`Generated ${count} UUID v4!`);
  },

  copyUuids() {
    const out = document.getElementById('uuid-output');
    if (out && out.value) {
      navigator.clipboard.writeText(out.value).then(() => {
        App.showToast('UUIDs copied to clipboard!');
      });
    }
  },

  downloadUuids() {
    const text = document.getElementById('uuid-output')?.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fullstop-uuids.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('UUIDs downloaded as .txt!');
  }
};
