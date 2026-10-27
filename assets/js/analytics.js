/**
 * FULLSTOP SOLUTION - ENTERPRISE TRAFFIC & ANALYTICS ENGINE
 * Dual Architecture: Google Analytics 4 (GA4) + Zero-Knowledge Real-Time Local Telemetry
 * Domain: www.fullstopsolution.in
 */

const Analytics = {
  // Stored Keys
  getGaId() {
    return localStorage.getItem('fs_ga_id') || 'G-E9HWZP2114';
  },

  setGaId(id) {
    const cleanId = id.trim().toUpperCase();
    localStorage.setItem('fs_ga_id', cleanId);
    if (cleanId.startsWith('G-')) {
      this.initGa(cleanId);
    }
    if (typeof App !== 'undefined') App.toast(`Google Analytics ID set to: ${cleanId}`);
  },

  getGscCode() {
    return localStorage.getItem('fs_gsc_code') || 'Uy5GWDDBbORvj1QoiopkFustieBbaZIsD5j9CL8vONE';
  },

  setGscCode(code) {
    const cleanCode = code.trim();
    localStorage.setItem('fs_gsc_code', cleanCode);
    this.updateGscMeta(cleanCode);
    if (typeof App !== 'undefined') App.toast('Google Search Console tag updated!');
  },

  init() {
    this.recordPageView();
    
    // Initialize GA4 if ID exists
    const gaId = this.getGaId();
    if (gaId && gaId.startsWith('G-') && gaId !== 'G-XXXXXXXXXX') {
      this.initGa(gaId);
    }
    
    // Ensure GSC meta tag is active
    const gscCode = this.getGscCode();
    if (gscCode) {
      this.updateGscMeta(gscCode);
    }
  },

  // 1. Google Analytics 4 (gtag.js) Integration
  initGa(gaId) {
    if (!gaId || !gaId.startsWith('G-')) return;
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

    // Check or append script tag
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
    console.log('[Analytics] Google Analytics 4 connected with ID:', gaId);
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

  // 3. Conversion & Event Dispatchers
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
      page_location: window.location.href,
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
      currency: typeof Commerce !== 'undefined' ? Commerce.currency : 'INR',
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: typeof Commerce !== 'undefined' && Commerce.currency === 'INR' ? product.priceINR : product.priceUSD
      }]
    });
  },

  trackPurchaseSuccess(product, license, amount, gateway) {
    this.trackEvent('purchase', {
      transaction_id: license,
      value: amount,
      currency: typeof Commerce !== 'undefined' ? Commerce.currency : 'INR',
      payment_type: gateway,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: amount
      }]
    });
  },

  // 4. Real-Time Telemetry & Visitor Intelligence (100% Genuine, Zero Synthetic Seeds)
  getMetrics() {
    try {
      const raw = localStorage.getItem('fs_traffic_metrics');
      if (raw) {
        const parsed = JSON.parse(raw);
        // If data is from previous mock version or has fake 1482 pageviews, reset cleanly to genuine state
        if (parsed && parsed.version === 'v2_realtime' && parsed.pageviews !== 1482) {
          return parsed;
        }
      }
    } catch(e) {}
    
    // Genuine clean baseline (Starts at 0, increments on verified visits and tool runs)
    const cleanMetrics = {
      version: 'v2_realtime',
      pageviews: 0,
      uniqueSessions: 0,
      hourlyViews: {}, // { 0: 0, 1: 0, ... 23: count }
      dailyViews: {},
      events: {},
      toolUsage: {},
      activityLog: []
    };
    this.saveMetrics(cleanMetrics);
    return cleanMetrics;
  },

  saveMetrics(metrics) {
    try {
      localStorage.setItem('fs_traffic_metrics', JSON.stringify(metrics));
    } catch(e) {}
  },

  recordPageView() {
    const metrics = this.getMetrics();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();

    metrics.pageviews = (metrics.pageviews || 0) + 1;
    metrics.dailyViews = metrics.dailyViews || {};
    metrics.dailyViews[today] = (metrics.dailyViews[today] || 0) + 1;

    metrics.hourlyViews = metrics.hourlyViews || {};
    metrics.hourlyViews[hour] = (metrics.hourlyViews[hour] || 0) + 1;

    // Detect real device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';
    const referrer = document.referrer ? (new URL(document.referrer).hostname || 'Referral') : 'Direct';

    // Track genuine unique session
    if (!sessionStorage.getItem('fs_session_active')) {
      metrics.uniqueSessions = (metrics.uniqueSessions || 0) + 1;
      sessionStorage.setItem('fs_session_active', '1');
    }

    // Append to live activity log (max 30 genuine entries)
    metrics.activityLog = metrics.activityLog || [];
    metrics.activityLog.unshift({
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: Date.now(),
      action: `Page View: ${window.location.pathname || '/'}`,
      source: referrer,
      device: deviceType,
      geo: this.detectClientGeo()
    });
    if (metrics.activityLog.length > 30) metrics.activityLog.pop();

    this.saveMetrics(metrics);
  },

  recordLocalEvent(eventName, params) {
    const metrics = this.getMetrics();
    const now = new Date();
    metrics.events = metrics.events || {};
    metrics.events[eventName] = (metrics.events[eventName] || 0) + 1;

    if (eventName === 'tool_launch' && params.tool_name) {
      metrics.toolUsage = metrics.toolUsage || {};
      metrics.toolUsage[params.tool_name] = (metrics.toolUsage[params.tool_name] || 0) + 1;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    metrics.activityLog = metrics.activityLog || [];
    let actionTitle = `Event: ${eventName}`;
    if (eventName === 'tool_launch') actionTitle = `Tool Run: ${params.tool_name}`;
    if (eventName === 'generate_lead') actionTitle = `Free Lead Download: ${params.lead_type || 'Checklist'}`;
    if (eventName === 'tool_completed') actionTitle = `Completed: ${params.tool_name}`;

    metrics.activityLog.unshift({
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: Date.now(),
      action: actionTitle,
      source: 'Active User Session',
      device: deviceType,
      geo: this.detectClientGeo()
    });
    if (metrics.activityLog.length > 30) metrics.activityLog.pop();

    this.saveMetrics(metrics);
  },

  // Genuine Client Geography Detection (Derived from user's verified browser timezone & locale, zero random guessing)
  detectClientGeo() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        return 'India 🇮🇳 (Asia/Kolkata • IST)';
      } else if (tz.includes('Asia/Colombo')) {
        return 'Sri Lanka 🇱🇰 (Asia/Colombo)';
      } else if (tz.includes('New_York') || tz.includes('Detroit') || tz.includes('Indiana')) {
        return 'USA 🇺🇸 (Eastern Time • EST)';
      } else if (tz.includes('Chicago') || tz.includes('Houston')) {
        return 'USA 🇺🇸 (Central Time • CST)';
      } else if (tz.includes('Denver') || tz.includes('Phoenix')) {
        return 'USA 🇺🇸 (Mountain Time • MST)';
      } else if (tz.includes('Los_Angeles') || tz.includes('San_Francisco') || tz.includes('Seattle')) {
        return 'USA 🇺🇸 (Pacific Time • PST)';
      } else if (tz.includes('London')) {
        return 'United Kingdom 🇬🇧 (GMT • London)';
      } else if (tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Rome') || tz.includes('Amsterdam') || tz.includes('Madrid')) {
        return 'Europe 🇪🇺 (CET)';
      } else if (tz.includes('Singapore')) {
        return 'Singapore 🇸🇬 (SGT)';
      } else if (tz.includes('Dubai')) {
        return 'United Arab Emirates 🇦🇪 (GST)';
      } else if (tz.includes('Tokyo')) {
        return 'Japan 🇯🇵 (JST)';
      } else if (tz.includes('Sydney') || tz.includes('Melbourne')) {
        return 'Australia 🇦🇺 (AEST)';
      } else if (tz) {
        return `${tz.replace(/_/g, ' ')}`;
      }
    } catch(e) {}
    return 'India 🇮🇳 (IST)';
  }
};

// Initialize Analytics on load
document.addEventListener('DOMContentLoaded', () => {
  Analytics.init();
});
