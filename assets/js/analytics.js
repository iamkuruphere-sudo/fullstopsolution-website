/**
 * FULLSTOP SOLUTION - TRAFFIC & ANALYTICS ENGINE
 * Integrates Google Analytics 4 (GA4), Google Search Console (GSC),
 * and local real-time telemetry monitoring.
 * Domain: www.fullstopsolution.in
 */

const Analytics = {
  // Default or stored keys
  getGaId() {
    return localStorage.getItem('fs_ga_id') || 'G-XXXXXXXXXX';
  },

  setGaId(id) {
    const cleanId = id.trim().toUpperCase();
    localStorage.setItem('fs_ga_id', cleanId);
    this.initGa(cleanId);
    if (typeof App !== 'undefined') App.toast(`Google Analytics ID updated to ${cleanId}!`);
  },

  getGscCode() {
    return localStorage.getItem('fs_gsc_code') || '';
  },

  setGscCode(code) {
    const cleanCode = code.trim();
    localStorage.setItem('fs_gsc_code', cleanCode);
    this.updateGscMeta(cleanCode);
    if (typeof App !== 'undefined') App.toast('Google Search Console verification code updated!');
  },

  init() {
    this.recordPageView();
    const gaId = this.getGaId();
    if (gaId && gaId.startsWith('G-') && gaId !== 'G-XXXXXXXXXX') {
      this.initGa(gaId);
    }
    const gscCode = this.getGscCode();
    if (gscCode) {
      this.updateGscMeta(gscCode);
    }
  },

  // 1. Google Analytics 4 (gtag.js) Dynamic Loader
  initGa(gaId) {
    if (window.gaInitialized && window.currentGaId === gaId) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    // Check if script already exists
    let script = document.getElementById('ga-gtag-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'ga-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);
    } else {
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    }

    window.gaInitialized = true;
    window.currentGaId = gaId;
  },

  // 2. Google Search Console Verification Meta Tag
  updateGscMeta(code) {
    let meta = document.querySelector('meta[name="google-site-verification"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      document.head.appendChild(meta);
    }
    meta.content = code;
  },

  // 3. Event Dispatchers (Dispatches to GA4 and Local Telemetry)
  trackEvent(eventName, params = {}) {
    // Dispatch to GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    // Update local telemetry
    this.recordLocalEvent(eventName, params);
  },

  trackToolLaunch(toolName) {
    this.trackEvent('tool_launch', {
      tool_name: toolName,
      engagement_time_msec: 100
    });
  },

  trackToolCompleted(toolName) {
    this.trackEvent('tool_completed', {
      tool_name: toolName
    });
  },

  trackLeadDownload() {
    this.trackEvent('generate_lead', {
      lead_type: '50_point_seo_checklist',
      value: 0
    });
  },

  trackCheckoutStart(product) {
    this.trackEvent('begin_checkout', {
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: Commerce.currency === 'INR' ? product.priceINR : product.priceUSD
      }]
    });
  },

  trackPurchaseSuccess(product, license, amount, gateway) {
    this.trackEvent('purchase', {
      transaction_id: license,
      value: amount,
      currency: Commerce.currency,
      payment_type: gateway,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: amount
      }]
    });
  },

  // 4. Local Privacy-Preserving Traffic Telemetry
  getMetrics() {
    try {
      return JSON.parse(localStorage.getItem('fs_traffic_metrics') || '{}');
    } catch(e) {
      return {};
    }
  },

  saveMetrics(metrics) {
    try {
      localStorage.setItem('fs_traffic_metrics', JSON.stringify(metrics));
    } catch(e) {}
  },

  recordPageView() {
    const metrics = this.getMetrics();
    const today = new Date().toISOString().split('T')[0];

    metrics.pageviews = (metrics.pageviews || 0) + 1;
    metrics.dailyViews = metrics.dailyViews || {};
    metrics.dailyViews[today] = (metrics.dailyViews[today] || 0) + 1;

    // Track session
    if (!sessionStorage.getItem('fs_session_active')) {
      metrics.uniqueSessions = (metrics.uniqueSessions || 0) + 1;
      sessionStorage.setItem('fs_session_active', '1');
    }

    this.saveMetrics(metrics);
  },

  recordLocalEvent(eventName, params) {
    const metrics = this.getMetrics();
    metrics.events = metrics.events || {};
    metrics.events[eventName] = (metrics.events[eventName] || 0) + 1;

    if (eventName === 'tool_launch' && params.tool_name) {
      metrics.toolUsage = metrics.toolUsage || {};
      metrics.toolUsage[params.tool_name] = (metrics.toolUsage[params.tool_name] || 0) + 1;
    }

    this.saveMetrics(metrics);
  }
};

// Initialize Analytics on load
document.addEventListener('DOMContentLoaded', () => {
  Analytics.init();
});
