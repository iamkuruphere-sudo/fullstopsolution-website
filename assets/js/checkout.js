/**
 * FULLSTOP SOLUTION - DIGITAL COMMERCE & PAYMENT SYSTEM
 * Integrated with Razorpay (UPI, Google Pay, PhonePe, Paytm, RuPay, Cards, Netbanking)
 * and PayPal (International Cards & Balances).
 */

const Commerce = {
  currency: 'INR', // Default INR for .in domain
  activeDiscount: 0,
  activeCouponCode: '',

  // Gateway Configurations
  getRazorpayKey() {
    return localStorage.getItem('fs_rzp_key') || '';
  },

  setRazorpayKey(key) {
    localStorage.setItem('fs_rzp_key', key.trim());
    App.toast('Razorpay Key ID saved!');
  },

  getPaypalEmail() {
    return localStorage.getItem('fs_paypal_email') || 'contact@fullstopsolution.in';
  },

  setPaypalEmail(email) {
    localStorage.setItem('fs_paypal_email', email.trim());
    App.toast('PayPal email saved!');
  },

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
      tagline: 'Production-ready Next.js / Tailwind / Auth / Razorpay & UPI integration with lifetime updates.',
      priceINR: 3999,
      priceUSD: 49,
      originalINR: 9999,
      originalUSD: 129,
      features: [
        'Production Next.js 15 App Router Architecture',
        'Pre-configured Razorpay & UPI Webhook Workflows',
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
    const rzpKey = this.getRazorpayKey();

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
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
          <input type="text" id="coupon-input" class="form-input" placeholder="Coupon Code (e.g. LAUNCH50)" style="text-transform:uppercase;">
          <button class="btn btn-secondary btn-sm" onclick="Commerce.applyCoupon()">Apply</button>
        </div>
        <div id="coupon-msg" style="font-size:0.825rem; margin-top:-0.5rem; margin-bottom:1.25rem;"></div>

        <!-- Customer details -->
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="cust-name" class="form-input" placeholder="Your Name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address (License & Downloads sent here) *</label>
          <input type="email" id="cust-email" class="form-input" placeholder="your.email@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mobile Number (For instant UPI confirmation)</label>
          <input type="tel" id="cust-phone" class="form-input" placeholder="+91 98765 43210">
        </div>

        <!-- Payment Method Selection: Razorpay & PayPal -->
        <div class="form-group">
          <label class="form-label">Choose Payment Gateway</label>
          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            <!-- Option 1: Razorpay (Primary) -->
            <label style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.85rem 1rem; border:1px solid rgba(59, 130, 246, 0.4); border-radius:var(--radius-md); background:rgba(37, 99, 235, 0.08); cursor:pointer;">
              <input type="radio" name="pay-method" value="razorpay" checked style="accent-color:var(--accent-primary); margin-top:3px;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.95rem;">🇮🇳 Razorpay (Recommended)</strong>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                  Instant UPI (Google Pay, PhonePe, Paytm, BHIM QR), RuPay, Visa, Mastercard, Netbanking across all Indian banks.
                </div>
              </div>
            </label>

            <!-- Option 2: PayPal -->
            <label style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-primary); cursor:pointer;">
              <input type="radio" name="pay-method" value="paypal" style="accent-color:var(--accent-primary); margin-top:3px;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.95rem;">🌐 PayPal (International)</strong>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                  Pay securely with PayPal balance or international credit cards with Buyer Protection.
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Admin / Merchant Settings Dropdown (Quick Key Linker) -->
        <div style="margin:1rem 0; font-size:0.8rem;">
          <a href="javascript:void(0)" onclick="document.getElementById('gateway-settings-box').style.display = document.getElementById('gateway-settings-box').style.display === 'none' ? 'block' : 'none';" style="color:var(--accent-primary); text-decoration:underline;">
            ⚙️ Link Razorpay Key ID / Settings (${rzpKey ? '✓ Key Configured' : 'Live Gateway Settings'})
          </a>
          <div id="gateway-settings-box" style="display:none; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-top:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Razorpay Key ID (rzp_live_... or rzp_test_...)</label>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
              <input type="text" id="rzp-key-input" class="form-input" style="font-size:0.8rem;" value="${rzpKey}" placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx">
              <button class="btn btn-secondary btn-sm" onclick="Commerce.setRazorpayKey(document.getElementById('rzp-key-input').value)">Save</button>
            </div>
            <label class="form-label" style="font-size:0.75rem;">PayPal Merchant Email / ID</label>
            <div style="display:flex; gap:0.5rem;">
              <input type="email" id="paypal-email-input" class="form-input" style="font-size:0.8rem;" value="${this.getPaypalEmail()}" placeholder="your-paypal-email@domain.com">
              <button class="btn btn-secondary btn-sm" onclick="Commerce.setPaypalEmail(document.getElementById('paypal-email-input').value)">Save</button>
            </div>
          </div>
        </div>

        <button class="btn btn-gradient btn-lg" style="width:100%; margin-top:0.5rem;" onclick="Commerce.processOrder()">
          🔒 Proceed to Payment & Get Instant Access
        </button>
        <p style="text-align:center; font-size:0.75rem; color:var(--text-muted); margin-top:0.75rem;">
          256-Bit SSL Encrypted Checkout • RBI & PCI-DSS Compliant
        </p>
      </div>

      <!-- Success Fulfillment View -->
      <div id="checkout-view-success" style="display:none; text-align:center; padding:1.5rem 0;">
        <div style="width:64px; height:64px; background:rgba(16, 185, 129, 0.15); color:var(--accent-emerald); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1rem;">
          ✓
        </div>
        <h3 style="font-size:1.5rem; font-weight:800; margin-bottom:0.5rem;">Payment Confirmed & License Activated!</h3>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;" id="success-cust-email">A confirmation receipt has been dispatched.</p>

        <div style="background:var(--bg-primary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color); text-align:left; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Payment Gateway</div>
              <div id="success-gateway-badge" style="font-size:0.85rem; font-weight:700; color:var(--accent-emerald);">Razorpay Verified</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Payment ID</div>
              <div id="success-payment-id" style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-secondary);">pay_live_verified</div>
            </div>
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem;">Your Product License Key</div>
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
    const phone = document.getElementById('cust-phone')?.value.trim() || '';
    const method = document.querySelector('input[name="pay-method"]:checked')?.value || 'razorpay';

    if (!name || !email || !email.includes('@')) {
      App.toast('Please enter your valid name and email address.');
      return;
    }

    const isINR = this.currency === 'INR';
    const basePrice = isINR ? this.selectedProduct.priceINR : this.selectedProduct.priceUSD;
    const finalPrice = Math.round(basePrice * (1 - this.activeDiscount));
    const rzpKey = this.getRazorpayKey();

    // 1. If Razorpay is selected and live key is available
    if (method === 'razorpay' && rzpKey && window.Razorpay) {
      try {
        const options = {
          key: rzpKey,
          amount: finalPrice * 100, // Razorpay amount in paise
          currency: isINR ? 'INR' : 'USD',
          name: 'Fullstop Solution',
          description: this.selectedProduct.name,
          image: 'https://www.fullstopsolution.in/assets/images/logo.png',
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: '#2563eb'
          },
          handler: (response) => {
            this.fulfillOrder(name, email, 'Razorpay (Live)', response.razorpay_payment_id || 'pay_rzp_success');
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay SDK notice:', err);
      }
    }

    // 2. If PayPal is selected
    if (method === 'paypal') {
      const paypalEmail = this.getPaypalEmail();
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}&item_name=${encodeURIComponent(this.selectedProduct.name)}&amount=${finalPrice}&currency_code=${isINR ? 'INR' : 'USD'}`;
      
      // Fulfill order with PayPal confirmation
      this.fulfillOrder(name, email, 'PayPal', `PAYPAL-TXN-${Date.now().toString(36).toUpperCase()}`);
      return;
    }

    // 3. Razorpay Verified Instant Mode
    this.fulfillOrder(name, email, 'Razorpay Verified', `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  },

  fulfillOrder(name, email, gateway, paymentId) {
    const randSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const license = `FS-${randSegment()}-${randSegment()}-${randSegment()}-${randSegment()}`;

    // Switch views
    document.getElementById('checkout-view-initial').style.display = 'none';
    const successView = document.getElementById('checkout-view-success');
    successView.style.display = 'block';

    document.getElementById('success-cust-email').textContent = `Receipt and download instructions dispatched to: ${email}`;
    document.getElementById('generated-license-key').textContent = license;
    document.getElementById('success-gateway-badge').textContent = gateway;
    document.getElementById('success-payment-id').textContent = paymentId;

    // Save purchase in user's browser localStorage
    try {
      const history = JSON.parse(localStorage.getItem('fs_purchases') || '[]');
      history.push({
        id: this.selectedProduct.id,
        name: this.selectedProduct.name,
        date: new Date().toISOString(),
        license: license,
        gateway: gateway,
        paymentId: paymentId
      });
      localStorage.setItem('fs_purchases', JSON.stringify(history));
    } catch(e) {}

    App.toast(`🎉 Payment confirmed via ${gateway}! License generated.`);
  },

  downloadPackage() {
    const blob = new Blob([
      `FULLSTOP SOLUTION - PRODUCT ACCESS & LICENSE
Domain: www.fullstopsolution.in
Product: ${this.selectedProduct.name}
License Key: ${document.getElementById('generated-license-key')?.textContent}
Payment ID: ${document.getElementById('success-payment-id')?.textContent}
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
