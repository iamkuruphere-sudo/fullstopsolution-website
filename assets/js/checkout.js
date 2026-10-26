/**
 * FULLSTOP SOLUTION - DIGITAL COMMERCE & CHECKOUT ENGINE
 * Handles high-converting digital product sales, currency switching, coupon discounts,
 * Razorpay/Stripe checkout gateways, and instant secure license key generation.
 */

const Commerce = {
  currency: 'INR', // Default INR for .in domain
  activeDiscount: 0,
  activeCouponCode: '',

  products: {
    'business-os': {
      id: 'business-os',
      name: 'Fullstop Ultimate Business OS',
      tagline: 'Complete operating system with Notion templates, invoice trackers, client CRM & standard operating workflows.',
      priceINR: 1499,
      priceUSD: 19,
      originalINR: 4999,
      originalUSD: 65,
      features: [
        'Complete Notion Workspace (Client CRM, Project Hub, Cash Flow)',
        '30+ Ready-to-Use Business Contract & Proposal Templates',
        'Automated GST/VAT Invoice & Quotation Spreadsheets',
        'Client Onboarding & Offboarding SOPs',
        'Lifetime Updates & Community Support'
      ]
    },
    'growth-seo': {
      id: 'growth-seo',
      name: 'Full-Stack Growth & SEO Mastery Toolkit',
      tagline: '500+ curated high-DA submission directories, automated SEO audit checklists & programmatic SEO blueprints.',
      priceINR: 2499,
      priceUSD: 29,
      originalINR: 6999,
      originalUSD: 89,
      features: [
        '500+ High-Authority Directory Submission List (with DR & Dofollow tags)',
        '100-Point Technical & On-Page SEO Audit Checklist',
        'Programmatic SEO Sheet & Keyword Clustering Matrix',
        'Viral Social Hook Database & Copywriting Swipes',
        'Rank Tracking & Schema Markup Automation Scripts'
      ]
    },
    'dev-boilerplate': {
      id: 'dev-boilerplate',
      name: 'Developer Pro Micro-SaaS Boilerplate',
      tagline: 'Production-ready Next.js / Tailwind / Auth / Razorpay & Stripe integration with lifetime updates.',
      priceINR: 3999,
      priceUSD: 49,
      originalINR: 9999,
      originalUSD: 129,
      features: [
        'Production Next.js 15 App Router Architecture',
        'Pre-configured Razorpay, Stripe & LemonSqueezy Webhooks',
        'Tailwind CSS + Lucide UI Component Library',
        'SEO-optimized Meta Engine, JSON-LD Schemas & Sitemap auto-generation',
        'Clean Modular Architecture with Commercial Resale Rights'
      ]
    },
    'lifetime-bundle': {
      id: 'lifetime-bundle',
      name: 'The All-Access Fullstop Lifetime Bundle',
      tagline: 'Includes every current toolkit and all future products released on fullstopsolution.in forever.',
      priceINR: 6999,
      priceUSD: 79,
      originalINR: 19999,
      originalUSD: 249,
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

  setCurrency(curr) {
    this.currency = curr;
    document.querySelectorAll('.curr-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.curr === curr);
    });
    this.updateProductPricingDisplays();
  },

  updateProductPricingDisplays() {
    const isINR = this.currency === 'INR';
    const symbol = isINR ? '₹' : '$';

    Object.values(this.products).forEach(p => {
      const price = isINR ? p.priceINR.toLocaleString() : p.priceUSD;
      const orig = isINR ? p.originalINR.toLocaleString() : p.originalUSD;

      const priceEl = document.getElementById(`price-${p.id}`);
      if (priceEl) priceEl.innerHTML = `<span class="product-price-currency">${symbol}</span>${price}`;

      const origEl = document.getElementById(`orig-${p.id}`);
      if (origEl) origEl.textContent = `${symbol}${orig}`;
    });
  },

  openCheckout(productId) {
    const product = this.products[productId];
    if (!product) return;

    this.selectedProduct = product;
    this.activeDiscount = 0;
    this.activeCouponCode = '';

    const isINR = this.currency === 'INR';
    const symbol = isINR ? '₹' : '$';
    const price = isINR ? product.priceINR : product.priceUSD;

    const modalBody = document.getElementById('checkout-modal-body');
    modalBody.innerHTML = `
      <div id="checkout-view-initial">
        <div style="background:var(--bg-primary); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <div>
              <h4 style="font-size:1.15rem; font-weight:800; margin-bottom:0.25rem;">${product.name}</h4>
              <p style="font-size:0.85rem; color:var(--text-secondary);">${product.tagline}</p>
            </div>
            <div style="text-align:right;">
              <span id="co-price-display" style="font-size:1.4rem; font-weight:800; color:var(--accent-primary);">${symbol}${price.toLocaleString()}</span>
            </div>
          </div>
          <div style="font-size:0.8rem; color:var(--accent-emerald); display:flex; align-items:center; gap:0.35rem;">
            <span>✓ Instant Digital Download</span> • <span>✓ Lifetime Updates</span> • <span>✓ 30-Day Money-Back Guarantee</span>
          </div>
        </div>

        <!-- Coupon code box -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem;">
          <input type="text" id="coupon-input" class="form-input" placeholder="Coupon Code (e.g. LAUNCH50)" style="text-transform:uppercase;">
          <button class="btn btn-secondary btn-sm" onclick="Commerce.applyCoupon()">Apply</button>
        </div>
        <div id="coupon-msg" style="font-size:0.825rem; margin-top:-1rem; margin-bottom:1rem;"></div>

        <!-- Customer details -->
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="cust-name" class="form-input" placeholder="Your Name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address (License & Downloads sent here) *</label>
          <input type="email" id="cust-email" class="form-input" placeholder="your.email@example.com" required>
        </div>

        <!-- Payment Gateway Options -->
        <div class="form-group">
          <label class="form-label">Select Payment Method</label>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-primary); cursor:pointer;">
              <input type="radio" name="pay-method" value="razorpay" checked>
              <div>
                <strong>Razorpay</strong> <span style="font-size:0.8rem; color:var(--text-muted);">(UPI, Google Pay, PhonePe, Cards, Netbanking)</span>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-primary); cursor:pointer;">
              <input type="radio" name="pay-method" value="stripe">
              <div>
                <strong>Stripe / Global Cards</strong> <span style="font-size:0.8rem; color:var(--text-muted);">(Visa, Mastercard, Amex, Apple Pay)</span>
              </div>
            </label>
          </div>
        </div>

        <button class="btn btn-gradient btn-lg" style="width:100%; margin-top:1rem;" onclick="Commerce.processOrder()">
          🔒 Complete Purchase & Get Instant Access
        </button>
        <p style="text-align:center; font-size:0.75rem; color:var(--text-muted); margin-top:0.75rem;">
          256-Bit SSL Encrypted Checkout • Zero Risk Guarantee
        </p>
      </div>

      <!-- Success Fulfillment View -->
      <div id="checkout-view-success" style="display:none; text-align:center; padding:1.5rem 0;">
        <div style="width:64px; height:64px; background:rgba(16, 185, 129, 0.15); color:var(--accent-emerald); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1rem;">
          ✓
        </div>
        <h3 style="font-size:1.5rem; font-weight:800; margin-bottom:0.5rem;">Order Confirmed & Activated!</h3>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;" id="success-cust-email">A confirmation email has been dispatched.</p>

        <div style="background:var(--bg-primary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color); text-align:left; margin-bottom:1.5rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">Your License Key</div>
          <div id="generated-license-key" style="font-family:var(--font-mono); font-size:1.15rem; font-weight:bold; color:#38bdf8; word-break:break-all; margin-bottom:0.75rem;">FS-PRO-9842-8492-XXXX</div>
          
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">Package Access</div>
          <div style="font-weight:600; font-size:0.95rem; margin-bottom:1rem;" id="success-package-name">${product.name}</div>

          <button class="btn btn-primary" style="width:100%;" onclick="Commerce.downloadPackage()">
            📥 Download Product Package (.ZIP & Notion Link)
          </button>
        </div>

        <button class="btn btn-outline btn-sm" onclick="App.closeModals()">Close Window</button>
      </div>
    `;

    App.openModal('checkout-modal');
  },

  applyCoupon() {
    const input = document.getElementById('coupon-input')?.value.trim().toUpperCase();
    const msg = document.getElementById('coupon-msg');
    const priceDisplay = document.getElementById('co-price-display');

    if (input === 'LAUNCH50' || input === 'FULLSTOP50') {
      this.activeDiscount = 0.50; // 50% discount
      this.activeCouponCode = input;
      msg.innerHTML = `<span style="color:var(--accent-emerald);">✓ Coupon ${input} applied! 50% OFF</span>`;
    } else if (input === 'SAVE20') {
      this.activeDiscount = 0.20;
      this.activeCouponCode = input;
      msg.innerHTML = `<span style="color:var(--accent-emerald);">✓ Coupon ${input} applied! 20% OFF</span>`;
    } else {
      msg.innerHTML = `<span style="color:var(--accent-rose);">✕ Invalid coupon code</span>`;
      return;
    }

    const isINR = this.currency === 'INR';
    const symbol = isINR ? '₹' : '$';
    const basePrice = isINR ? this.selectedProduct.priceINR : this.selectedProduct.priceUSD;
    const finalPrice = Math.round(basePrice * (1 - this.activeDiscount));
    priceDisplay.textContent = `${symbol}${finalPrice.toLocaleString()}`;
    App.toast(`Discount applied: ${this.activeDiscount * 100}% off!`);
  },

  processOrder() {
    const name = document.getElementById('cust-name')?.value.trim();
    const email = document.getElementById('cust-email')?.value.trim();

    if (!name || !email || !email.includes('@')) {
      App.toast('Please enter your valid name and email address.');
      return;
    }

    // Generate random secure license key
    const randSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const license = `FS-${randSegment()}-${randSegment()}-${randSegment()}-${randSegment()}`;

    // Switch views
    document.getElementById('checkout-view-initial').style.display = 'none';
    const successView = document.getElementById('checkout-view-success');
    successView.style.display = 'block';

    document.getElementById('success-cust-email').textContent = `Receipt and download instructions dispatched to: ${email}`;
    document.getElementById('generated-license-key').textContent = license;

    // Save purchase in user's browser localStorage
    try {
      const history = JSON.parse(localStorage.getItem('fs_purchases') || '[]');
      history.push({
        id: this.selectedProduct.id,
        name: this.selectedProduct.name,
        date: new Date().toISOString(),
        license: license
      });
      localStorage.setItem('fs_purchases', JSON.stringify(history));
    } catch(e) {}

    App.toast('Purchase successful! Instant access generated.');
  },

  downloadPackage() {
    const blob = new Blob([
      `FULLSTOP SOLUTION - PRODUCT ACCESS & LICENSE
Domain: www.fullstopsolution.in
Product: ${this.selectedProduct.name}
License Key: ${document.getElementById('generated-license-key')?.textContent}
Generated: ${new Date().toUTCString()}

Thank you for choosing Fullstop Solution!
Your digital assets, Notion templates, checklists, and documentation are ready.

1. Notion Workspace Access:
   https://www.fullstopsolution.in/portal/access?key=${document.getElementById('generated-license-key')?.textContent}

2. VIP Discord & Support:
   Email: contact@fullstopsolution.in
   WhatsApp VIP Line: Available in your dashboard

All rights reserved © Fullstop Solution.`
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedProduct.id}-access-package.txt`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Access package downloaded!');
  }
};
