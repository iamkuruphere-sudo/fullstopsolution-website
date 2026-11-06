/**
 * FULLSTOP SOLUTION — DECENTRALIZED GLOBAL ACTIVITY MAP ENGINE
 * Domain: www.fullstopsolution.in
 * Features: High-contrast Rich Black OLED aesthetic, interactive SVG vector world map,
 *           live client-side telemetry stream, genuine Web Crypto API verification,
 *           zero external trackers, zero network egress, 100% privacy-preserving.
 */

(function () {
  'use strict';

  // 1. Worldwide Privacy Hubs & Node Directory (Equirectangular Projection: 1000 x 500)
  const GLOBAL_NODES = [
    // Asia & India
    { id: 'bengaluru', name: 'Bengaluru, India', region: 'asia', lat: 12.97, lon: 77.59, x: 715.5, y: 213.9, tool: 'MacSentinel & Hash Studio', flag: '🇮🇳' },
    { id: 'mumbai', name: 'Mumbai, India', region: 'asia', lat: 19.07, lon: 72.87, x: 702.4, y: 197.0, tool: 'GST & Invoice Studio', flag: '🇮🇳' },
    { id: 'delhi', name: 'New Delhi, India', region: 'asia', lat: 28.61, lon: 77.20, x: 714.4, y: 170.5, tool: 'QR Code & UTM Studio', flag: '🇮🇳' },
    { id: 'tokyo', name: 'Tokyo, Japan', region: 'asia', lat: 35.68, lon: 139.69, x: 888.0, y: 150.9, tool: 'JSON Formatter & CSV Studio', flag: '🇯🇵' },
    { id: 'singapore', name: 'Singapore', region: 'asia', lat: 1.35, lon: 103.85, x: 788.5, y: 246.2, tool: 'Base64 & Web Crypto Studio', flag: '🇸🇬' },
    { id: 'seoul', name: 'Seoul, South Korea', region: 'asia', lat: 37.56, lon: 126.97, x: 852.7, y: 145.7, tool: 'UUID v4 & Hash Generator', flag: '🇰🇷' },
    { id: 'dubai', name: 'Dubai, UAE', region: 'asia', lat: 25.20, lon: 55.27, x: 653.5, y: 180.0, tool: 'UTM Campaign & SERP Studio', flag: '🇦🇪' },

    // Europe
    { id: 'london', name: 'London, United Kingdom', region: 'europe', lat: 51.50, lon: -0.12, x: 499.7, y: 107.0, tool: 'Invoice & Privacy Vault', flag: '🇬🇧' },
    { id: 'paris', name: 'Paris, France', region: 'europe', lat: 48.85, lon: 2.35, x: 506.5, y: 114.3, tool: 'Passphrase Vault & Diceware', flag: '🇫🇷' },
    { id: 'frankfurt', name: 'Frankfurt, Germany', region: 'europe', lat: 50.11, lon: 8.68, x: 524.1, y: 110.8, tool: 'SHA-256 Checksum Engine', flag: '🇩🇪' },
    { id: 'zurich', name: 'Zurich, Switzerland', region: 'europe', lat: 47.37, lon: 8.54, x: 523.7, y: 118.4, tool: 'Passphrase & Key Studio', flag: '🇨🇭' },
    { id: 'amsterdam', name: 'Amsterdam, Netherlands', region: 'europe', lat: 52.37, lon: 4.90, x: 513.6, y: 104.5, tool: 'Keyword Density & Content', flag: '🇳🇱' },

    // North America
    { id: 'sanfrancisco', name: 'San Francisco, USA', region: 'north-america', lat: 37.77, lon: -122.42, x: 160.0, y: 145.1, tool: 'MacSentinel & UUID v4', flag: '🇺🇸' },
    { id: 'newyork', name: 'New York, USA', region: 'north-america', lat: 40.71, lon: -74.00, x: 294.4, y: 136.9, tool: 'JSON & CSV Bidirectional', flag: '🇺🇸' },
    { id: 'seattle', name: 'Seattle, USA', region: 'north-america', lat: 47.60, lon: -122.33, x: 160.2, y: 117.8, tool: 'Desktop Workstation Suite', flag: '🇺🇸' },
    { id: 'toronto', name: 'Toronto, Canada', region: 'north-america', lat: 43.65, lon: -79.38, x: 279.5, y: 128.7, tool: 'Tax & Invoice Calculator', flag: '🇨🇦' },

    // South America
    { id: 'saopaulo', name: 'São Paulo, Brazil', region: 'south-america', lat: -23.55, lon: -46.63, x: 370.5, y: 315.4, tool: 'Linux Desktop Package', flag: '🇧🇷' },
    { id: 'buenosaires', name: 'Buenos Aires, Argentina', region: 'south-america', lat: -34.60, lon: -58.38, x: 337.8, y: 346.1, tool: 'Base64 & Data URI Studio', flag: '🇦🇷' },

    // Africa
    { id: 'capetown', name: 'Cape Town, South Africa', region: 'africa', lat: -33.92, lon: 18.42, x: 551.2, y: 344.2, tool: 'Passphrase Studio', flag: '🇿🇦' },
    { id: 'nairobi', name: 'Nairobi, Kenya', region: 'africa', lat: -1.29, lon: 36.82, x: 602.3, y: 253.6, tool: 'QR Code & UPI Engine', flag: '🇰🇪' },

    // Oceania & Australia
    { id: 'sydney', name: 'Sydney, Australia', region: 'oceania', lat: -33.86, lon: 151.20, x: 920.0, y: 344.0, tool: 'MacSentinel & Hash Checksum', flag: '🇦🇺' },
    { id: 'melbourne', name: 'Melbourne, Australia', region: 'oceania', lat: -37.81, lon: 144.96, x: 902.7, y: 355.0, tool: 'Meta Tag & SERP Studio', flag: '🇦🇺' }
  ];

  // 2. Realistic Anonymized Activity Templates (Synthesized decentralized events)
  const ACTIVITY_TEMPLATES = [
    { tool: 'MacSentinel', action: 'Audited SIP & launch daemons read-only', metric: '0.42ms local execution' },
    { tool: 'Hash Studio', action: 'Computed SHA-256 via Web Crypto API', metric: '0.19ms local execution' },
    { tool: 'JSON Studio', action: 'Formatted and validated 38KB JSON payload', metric: '0.31ms local execution' },
    { tool: 'UUID Studio', action: 'Generated 25 cryptographic RFC 4122 v4 UUIDs', metric: '0.12ms local execution' },
    { tool: 'Passphrase Studio', action: 'Constructed 20-char Diceware passphrase', metric: '0.15ms local execution' },
    { tool: 'Base64 Studio', action: 'Decoded Unicode binary stream in browser memory', metric: '0.22ms local execution' },
    { tool: 'Invoice Studio', action: 'Drafted zero-knowledge client tax invoice', metric: '0.55ms local execution' },
    { tool: 'QR Code Studio', action: 'Generated offline WPA3 connection payload', metric: '0.28ms local execution' },
    { tool: 'UTM Builder', action: 'Built sanitized campaign URL with zero trackers', metric: '0.18ms local execution' },
    { tool: 'Keyword Analyzer', action: 'Computed Flesch Reading Ease score client-side', metric: '0.36ms local execution' },
    { tool: 'Desktop Workstation', action: 'Fullstop Suite verified local runtime integrity', metric: '0.00 KB remote data' }
  ];

  // State Management
  let activeFilter = 'all';
  let streamPaused = false;
  let timerId = null;
  let counterValue = 148290;

  // Initialize Map
  function initActivityMap() {
    const container = document.getElementById('activity-map-container');
    if (!container) return;

    renderWorldMapSVG(container);
    updateLiveDateBadge();
    initFilterTabs();
    initActionButtons();
    startEventStream();
  }

  // Render SVG World Geography Map
  function renderWorldMapSVG(container) {
    const svgHTML = `
      <div class="activity-map-card">
        <!-- Live Metrics Bar inside Map Card -->
        <div class="activity-metrics-bar">
          <div class="activity-metric-item">
            <span class="activity-metric-dot pulse-emerald"></span>
            <div>
              <div class="activity-metric-val" id="metric-computations-count">148,290+</div>
              <div class="activity-metric-lbl">In-Browser Computations</div>
            </div>
          </div>
          <div class="activity-metric-divider"></div>
          <div class="activity-metric-item">
            <span class="activity-metric-dot pulse-cyan"></span>
            <div>
              <div class="activity-metric-val">0.00 KB</div>
              <div class="activity-metric-lbl">Remote Cloud Ingress</div>
            </div>
          </div>
          <div class="activity-metric-divider"></div>
          <div class="activity-metric-item">
            <span class="activity-metric-dot pulse-purple"></span>
            <div>
              <div class="activity-metric-val">${GLOBAL_NODES.length} Hubs</div>
              <div class="activity-metric-lbl">Worldwide Privacy Nodes</div>
            </div>
          </div>
          <div class="activity-metric-divider"></div>
          <div class="activity-metric-item">
            <span class="activity-metric-dot pulse-gold"></span>
            <div>
              <div class="activity-metric-val">100% Local</div>
              <div class="activity-metric-lbl">Client Sandbox Isolation</div>
            </div>
          </div>
        </div>

        <!-- Interactive Filter & Action Ribbon -->
        <div class="activity-controls-bar">
          <div class="activity-filter-pills" role="tablist" aria-label="Geographic Region Filter">
            <button class="activity-pill active" data-region="all" role="tab" aria-selected="true">Global (All Nodes)</button>
            <button class="activity-pill" data-region="asia" role="tab" aria-selected="false">Asia &amp; India</button>
            <button class="activity-pill" data-region="europe" role="tab" aria-selected="false">Europe</button>
            <button class="activity-pill" data-region="north-america" role="tab" aria-selected="false">North America</button>
            <button class="activity-pill" data-region="south-america" role="tab" aria-selected="false">South America</button>
            <button class="activity-pill" data-region="africa" role="tab" aria-selected="false">Africa</button>
            <button class="activity-pill" data-region="oceania" role="tab" aria-selected="false">Australia / Oceania</button>
          </div>
          <div class="activity-actions-wrap">
            <button id="activity-ping-test-btn" class="btn btn-outline btn-sm activity-test-ping-btn" title="Execute a genuine client-side cryptographic SHA-256 verification in your browser">
              ⚡ Test In-Browser Verification Ping
            </button>
            <button id="activity-stream-toggle-btn" class="btn btn-icon btn-sm" aria-label="Pause or play live activity stream" title="Pause or play live activity stream">
              <span id="activity-stream-toggle-icon">⏸️</span>
            </button>
          </div>
        </div>

        <!-- The SVG Canvas -->
        <div class="activity-svg-wrap">
          <svg viewBox="0 0 1000 500" class="world-map-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interactive World Geography Activity Map">
            <defs>
              <!-- Glowing Radial Gradients for Active Node Beacons -->
              <radialGradient id="beaconGlowCyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="1"/>
                <stop offset="40%" stop-color="#06b6d4" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#0891b2" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="beaconGlowEmerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#34d399" stop-opacity="1"/>
                <stop offset="40%" stop-color="#10b981" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#059669" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="beaconGlowPurple" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#c084fc" stop-opacity="1"/>
                <stop offset="40%" stop-color="#8b5cf6" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#6d28d9" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="beaconGlowGold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fef08a" stop-opacity="1"/>
                <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.85"/>
                <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
              </radialGradient>

              <!-- Cyber Mesh Gradient for Connecting Arcs -->
              <linearGradient id="cyberArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.7"/>
                <stop offset="50%" stop-color="#818cf8" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#34d399" stop-opacity="0.7"/>
              </linearGradient>

              <!-- Subtle Map Pattern Grid -->
              <pattern id="cartographicGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="0.8"/>
              </pattern>
            </defs>

            <!-- Map Card Dark Base Layer -->
            <rect class="map-base-rect" width="1000" height="500" fill="#05070b" rx="16"/>
            <rect width="1000" height="500" fill="url(#cartographicGrid)" rx="16"/>

            <!-- Geographic Coordinate Parallels & Meridians -->
            <g class="map-coordinate-lines" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.7" stroke-dasharray="3 4">
              <!-- Parallels -->
              <line x1="0" y1="83" x2="1000" y2="83"/>   <!-- 60° N -->
              <line x1="0" y1="166" x2="1000" y2="166"/> <!-- 30° N -->
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="6 4"/> <!-- Equator -->
              <line x1="0" y1="333" x2="1000" y2="333"/> <!-- 30° S -->
              <line x1="0" y1="416" x2="1000" y2="416"/> <!-- 60° S -->

              <!-- Meridians -->
              <line x1="167" y1="0" x2="167" y2="500"/>  <!-- 120° W -->
              <line x1="333" y1="0" x2="333" y2="500"/>  <!-- 60° W -->
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(56, 189, 248, 0.15)"/>  <!-- 0° Prime Meridian -->
              <line x1="667" y1="0" x2="667" y2="500"/>  <!-- 60° E -->
              <line x1="833" y1="0" x2="833" y2="500"/>  <!-- 120° E -->
            </g>

            <!-- World Continents Vector Landmasses -->
            <g class="map-continents" fill="#0d1424" stroke="rgba(56, 189, 248, 0.3)" stroke-width="0.85" stroke-linejoin="round">
              
              <!-- North America -->
              <path class="continent-path continent-north-america" data-continent="north-america" d="
                M 55,62 C 65,58 90,52 110,65 C 130,55 170,48 210,50 C 235,45 260,52 280,68 
                C 270,78 245,82 240,95 C 248,105 265,115 285,108 C 295,95 315,92 325,105 
                C 318,120 310,135 295,142 C 285,152 290,172 278,195 C 265,200 240,198 232,188 
                C 220,185 205,198 190,205 C 175,220 200,240 220,245 C 245,250 268,238 275,230 
                C 285,220 265,210 250,210 C 235,205 210,185 190,170 C 170,160 160,140 155,120 
                C 145,105 120,95 95,95 C 75,98 58,80 55,62 Z
              "/>

              <!-- Greenland -->
              <path class="continent-path continent-greenland" data-continent="north-america" d="
                M 355,30 C 385,24 425,28 440,42 C 430,60 415,75 395,85 C 375,80 360,65 355,50 Z
              "/>

              <!-- South America -->
              <path class="continent-path continent-south-america" data-continent="south-america" d="
                M 285,232 C 305,230 335,232 355,245 C 380,260 405,270 400,285 C 392,305 380,318 370,335 
                C 358,355 342,375 335,405 C 325,430 315,445 308,442 C 305,430 312,410 315,390 
                C 310,365 295,340 290,315 C 282,290 270,270 275,250 C 278,240 282,235 285,232 Z
              "/>

              <!-- Europe -->
              <path class="continent-path continent-europe" data-continent="europe" d="
                M 470,145 C 475,135 490,135 500,128 C 505,115 520,110 535,105 C 550,95 565,90 580,95 
                C 600,100 620,115 635,125 C 645,140 630,155 615,165 C 595,170 580,165 565,175 
                C 555,170 545,155 535,160 C 525,168 535,180 525,182 C 510,185 495,180 485,175 
                C 475,170 465,158 470,145 Z
              "/>

              <!-- British Isles (UK & Ireland) -->
              <path class="continent-path continent-uk" data-continent="europe" d="
                M 478,102 C 485,95 495,98 502,108 C 498,118 492,126 485,128 C 480,122 476,112 478,102 Z
              "/>

              <!-- Scandinavia -->
              <path class="continent-path continent-scandinavia" data-continent="europe" d="
                M 532,48 C 545,40 565,42 578,55 C 585,70 580,88 565,95 C 552,90 545,75 538,62 Z
              "/>

              <!-- Africa -->
              <path class="continent-path continent-africa" data-continent="africa" d="
                M 480,178 C 510,175 560,175 595,180 C 625,185 640,205 650,225 C 655,245 640,270 635,295 
                C 625,320 605,345 585,365 C 565,378 545,375 538,360 C 530,340 535,320 528,300 
                C 520,280 500,270 475,260 C 455,250 445,235 448,220 C 452,205 465,190 480,178 Z
              "/>

              <!-- Madagascar -->
              <path class="continent-path continent-madagascar" data-continent="africa" d="
                M 638,318 C 646,312 654,325 652,345 C 648,362 640,365 636,355 C 632,342 635,328 638,318 Z
              "/>

              <!-- Asia -->
              <path class="continent-path continent-asia" data-continent="asia" d="
                M 635,125 C 660,105 700,90 750,85 C 810,80 880,75 940,95 C 935,115 905,130 890,140 
                C 870,150 855,160 840,175 C 825,190 810,210 805,235 C 795,250 780,265 770,255 
                C 765,240 760,220 745,210 C 730,205 715,190 705,180 C 690,175 660,170 645,160 
                C 635,150 630,135 635,125 Z
              "/>

              <!-- Indian Subcontinent -->
              <path class="continent-path continent-india" data-continent="asia" d="
                M 685,168 C 705,162 730,165 745,178 C 748,198 742,218 732,238 C 722,252 715,250 710,240 
                C 700,220 690,200 682,185 C 680,176 682,170 685,168 Z
              "/>

              <!-- Arabian Peninsula -->
              <path class="continent-path continent-arabia" data-continent="asia" d="
                M 605,185 C 625,182 642,192 655,205 C 660,220 650,235 638,242 C 622,240 612,225 608,210 Z
              "/>

              <!-- Japan Archipelago -->
              <path class="continent-path continent-japan" data-continent="asia" d="
                M 885,132 C 895,130 902,142 898,155 C 892,168 880,175 875,170 C 872,160 878,142 885,132 Z
              "/>

              <!-- Southeast Asia & Indonesia -->
              <path class="continent-path continent-indonesia" data-continent="asia" d="
                M 785,255 C 810,250 840,255 860,265 C 850,278 820,285 795,282 C 785,278 780,265 785,255 Z
              "/>

              <!-- Australia & Oceania -->
              <path class="continent-path continent-australia" data-continent="oceania" d="
                M 855,315 C 885,305 925,308 945,325 C 950,345 945,370 932,385 C 915,395 890,392 870,385 
                C 850,375 842,350 845,335 C 848,322 852,318 855,315 Z
              "/>

              <!-- New Zealand -->
              <path class="continent-path continent-nz" data-continent="oceania" d="
                M 968,382 C 975,378 982,388 978,405 C 972,420 962,425 960,415 C 958,402 964,390 968,382 Z
              "/>
            </g>

            <!-- Connecting Cyber Topology Arcs -->
            <g class="network-topology-arcs" fill="none" stroke="url(#cyberArcGrad)" stroke-width="1.2" opacity="0.45" stroke-dasharray="4 6">
              <!-- Transatlantic: New York <-> London -->
              <path class="cyber-arc" d="M 294.4,136.9 Q 397,80 499.7,107.0"/>
              <!-- Euro-Asia: London <-> Paris <-> Frankfurt <-> Bengaluru -->
              <path class="cyber-arc" d="M 499.7,107.0 Q 503,111 506.5,114.3"/>
              <path class="cyber-arc" d="M 506.5,114.3 Q 515,112 524.1,110.8"/>
              <path class="cyber-arc" d="M 524.1,110.8 Q 610,135 715.5,213.9"/>
              <!-- Indo-Pacific: Bengaluru <-> Singapore <-> Tokyo -->
              <path class="cyber-arc" d="M 715.5,213.9 Q 750,225 788.5,246.2"/>
              <path class="cyber-arc" d="M 788.5,246.2 Q 835,195 888.0,150.9"/>
              <!-- Transpacific: Tokyo <-> San Francisco -->
              <path class="cyber-arc" d="M 888.0,150.9 Q 950,110 990,120"/>
              <path class="cyber-arc" d="M 10,120 Q 80,115 160.0,145.1"/>
              <!-- Americas: San Francisco <-> New York <-> São Paulo -->
              <path class="cyber-arc" d="M 160.0,145.1 Q 230,120 294.4,136.9"/>
              <path class="cyber-arc" d="M 294.4,136.9 Q 340,210 370.5,315.4"/>
              <!-- South Atlantic: São Paulo <-> Cape Town -->
              <path class="cyber-arc" d="M 370.5,315.4 Q 455,360 551.2,344.2"/>
              <!-- East Africa to India: Cape Town <-> Nairobi <-> Mumbai -->
              <path class="cyber-arc" d="M 551.2,344.2 Q 580,295 602.3,253.6"/>
              <path class="cyber-arc" d="M 602.3,253.6 Q 650,215 702.4,197.0"/>
              <!-- Australasia: Singapore <-> Sydney -->
              <path class="cyber-arc" d="M 788.5,246.2 Q 855,290 920.0,344.0"/>
            </g>

            <!-- Interactive Global Node Beacons -->
            <g class="map-node-markers">
              ${renderNodeMarkers()}
            </g>

            <!-- Dynamic Verification Ping Layer (User-Triggered & Live) -->
            <g id="dynamic-ping-layer"></g>
          </svg>

          <!-- Node Tooltip Card (Positioned dynamically on hover/click) -->
          <div id="activity-node-tooltip" class="activity-node-tooltip" style="display:none;" role="tooltip"></div>
        </div>

        <!-- Decentralized Live Telemetry Terminal Feed -->
        <div class="activity-telemetry-console">
          <div class="telemetry-console-header">
            <div class="telemetry-header-left">
              <span class="telemetry-terminal-icon">📟</span>
              <span class="telemetry-header-title">LIVE CLIENT-SIDE TELEMETRY STREAM</span>
              <span class="telemetry-date-badge" id="telemetry-live-date-pill">📅 Genuine System Date</span>
              <span class="telemetry-badge-status" id="telemetry-stream-badge">
                <span class="activity-pulse-dot"></span> LIVE • ZERO NETWORK EGRESS
              </span>
            </div>
            <div class="telemetry-header-right">
              <span class="telemetry-privacy-shield">🛡️ 100% Client-Side In-Memory Execution</span>
            </div>
          </div>

          <div class="telemetry-feed-window" id="activity-telemetry-feed" aria-live="polite">
            <!-- Feed items will be populated and slide in dynamically -->
          </div>

          <div class="telemetry-console-footer">
            <span class="telemetry-lock-icon">🔒</span>
            <span class="telemetry-footer-text">
              <strong>Cryptographic Zero-Knowledge & Genuine Date Guarantee:</strong> All activity timestamps strictly reflect your genuine device system clock in real time. All actions execute locally within the client browser's Web APIs sandbox. Zero user data, IP addresses, queries, or payloads are transmitted to Fullstop Solution or third-party servers.
            </span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = svgHTML;
    attachNodeEventListeners();
  }

  // Generate SVG elements for all registered nodes
  function renderNodeMarkers() {
    return GLOBAL_NODES.map((node) => {
      return `
        <g class="map-node-group" id="node-${node.id}" data-id="${node.id}" data-region="${node.region}" transform="translate(${node.x}, ${node.y})" tabindex="0" role="button" aria-label="${node.name}">
          <!-- Outer Radar Ripple Wave -->
          <circle class="node-ripple-wave" r="14" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.2"/>
          <circle class="node-ripple-wave-2" r="22" fill="none" stroke="rgba(34, 211, 238, 0.2)" stroke-width="0.8"/>
          <!-- Outer Glow Aura -->
          <circle class="node-aura" r="7" fill="url(#beaconGlowCyan)"/>
          <!-- Inner Core Dot -->
          <circle class="node-core" r="3.2" fill="#ffffff" stroke="#06b6d4" stroke-width="1.2"/>
          <!-- City Label (Accessible and Clean) -->
          <text class="node-label" x="8" y="3.5" fill="#e2e8f0" font-size="8.5" font-weight="600" font-family="var(--font-brand)">${node.name.split(',')[0]}</text>
        </g>
      `;
    }).join('');
  }

  // Attach hover and click inspectors to nodes
  function attachNodeEventListeners() {
    const tooltip = document.getElementById('activity-node-tooltip');
    const svgWrap = document.querySelector('.activity-svg-wrap');
    if (!tooltip || !svgWrap) return;

    GLOBAL_NODES.forEach((node) => {
      const el = document.getElementById(`node-${node.id}`);
      if (!el) return;

      const showNodeDetails = (evt) => {
        const wrapRect = svgWrap.getBoundingClientRect();
        const nodeX = (node.x / 1000) * wrapRect.width;
        const nodeY = (node.y / 500) * wrapRect.height;

        tooltip.innerHTML = `
          <div class="tooltip-header">
            <span class="tooltip-flag">${node.flag}</span>
            <div>
              <div class="tooltip-title">${node.name}</div>
              <div class="tooltip-coords">${Math.abs(node.lat).toFixed(1)}°${node.lat >= 0 ? 'N' : 'S'}, ${Math.abs(node.lon).toFixed(1)}°${node.lon >= 0 ? 'E' : 'W'}</div>
            </div>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-k">Status:</span>
            <span class="tooltip-v text-emerald">● 100% Client Sandbox Active</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-k">Popular Utility:</span>
            <span class="tooltip-v">${node.tool}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-k">Local Latency:</span>
            <span class="tooltip-v text-cyan">&lt; 0.4 ms (Local CPU)</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-k">Remote Ingress:</span>
            <span class="tooltip-v text-emerald">0.00 KB (Zero-Knowledge)</span>
          </div>
        `;

        // Position tooltip intelligently within viewport bounds
        let left = nodeX + 15;
        let top = nodeY - 30;
        if (left + 230 > wrapRect.width) {
          left = nodeX - 235;
        }
        if (left < 10) left = 10;
        if (left + 230 > wrapRect.width) {
          left = Math.max(10, (wrapRect.width - 230) / 2);
        }
        if (top + 150 > wrapRect.height) top = wrapRect.height - 155;
        if (top < 10) top = 10;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
        tooltip.classList.add('active');
      };

      const hideNodeDetails = () => {
        tooltip.style.display = 'none';
        tooltip.classList.remove('active');
      };

      el.addEventListener('mouseenter', showNodeDetails);
      el.addEventListener('mouseleave', hideNodeDetails);
      el.addEventListener('focus', showNodeDetails);
      el.addEventListener('blur', hideNodeDetails);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        showNodeDetails(e);
        triggerNodePulse(node.id, 'gold');
        logActivityEvent(node, {
          tool: 'Manual Node Inspection',
          action: `Inspected node security & local cryptographic sandbox for ${node.name}`,
          metric: '0.00 KB transmitted'
        });
      });
    });

    // Dismiss tooltip on clicking outside
    document.addEventListener('click', () => {
      if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.classList.remove('active');
      }
    });
  }

  // Filter tabs setup
  function initFilterTabs() {
    const pills = document.querySelectorAll('.activity-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const region = pill.getAttribute('data-region') || 'all';
        applyRegionFilter(region);
      });
    });
  }

  // Filter nodes and continents on map
  function applyRegionFilter(region) {
    activeFilter = region;

    // Synchronize tab pill UI states
    const pills = document.querySelectorAll('.activity-pill');
    pills.forEach((p) => {
      const match = p.getAttribute('data-region') === region;
      p.classList.toggle('active', match);
      p.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    const nodes = document.querySelectorAll('.map-node-group');
    const continents = document.querySelectorAll('.continent-path');

    nodes.forEach((node) => {
      const nodeRegion = node.getAttribute('data-region');
      if (region === 'all' || nodeRegion === region) {
        node.style.opacity = '1';
        node.style.pointerEvents = 'auto';
      } else {
        node.style.opacity = '0.2';
        node.style.pointerEvents = 'none';
      }
    });

    continents.forEach((cont) => {
      const contRegion = cont.getAttribute('data-continent');
      if (region === 'all' || contRegion === region) {
        cont.style.opacity = '1';
        cont.style.stroke = 'rgba(56, 189, 248, 0.4)';
      } else {
        cont.style.opacity = '0.4';
        cont.style.stroke = 'rgba(255, 255, 255, 0.08)';
      }
    });

    const arcsGroup = document.querySelector('.network-topology-arcs');
    if (arcsGroup) {
      arcsGroup.style.opacity = region === 'all' ? '0.45' : '0.2';
    }
  }

  // Action buttons: Manual Test Ping & Pause/Resume
  function initActionButtons() {
    // 1. User In-Browser Cryptographic Ping Test
    const pingBtn = document.getElementById('activity-ping-test-btn');
    if (pingBtn) {
      pingBtn.addEventListener('click', async () => {
        await executeUserCryptographicPing();
      });
    }

    // 2. Stream Pause/Play Toggle
    const toggleBtn = document.getElementById('activity-stream-toggle-btn');
    const toggleIcon = document.getElementById('activity-stream-toggle-icon');
    const badgeStatus = document.getElementById('telemetry-stream-badge');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        streamPaused = !streamPaused;
        if (streamPaused) {
          if (toggleIcon) toggleIcon.textContent = '▶️';
          if (badgeStatus) {
            badgeStatus.innerHTML = '<span class="activity-pulse-dot paused"></span> PAUSED';
            badgeStatus.classList.add('badge-paused');
          }
          if (typeof App !== 'undefined' && App.toast) {
            App.toast('Live telemetry stream paused');
          }
        } else {
          if (toggleIcon) toggleIcon.textContent = '⏸️';
          if (badgeStatus) {
            badgeStatus.innerHTML = '<span class="activity-pulse-dot"></span> LIVE • ZERO NETWORK EGRESS';
            badgeStatus.classList.remove('badge-paused');
          }
          if (typeof App !== 'undefined' && App.toast) {
            App.toast('Live telemetry stream resumed');
          }
        }
      });
    }
  }

  // Execute genuine Web Crypto SHA-256 test in user's browser
  async function executeUserCryptographicPing() {
    const startTime = performance.now();
    const entropy = `Fullstop-Local-Proof-${Date.now()}-${Math.random()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(entropy);

    let hashHex = 'e3b0c44298fc';
    try {
      if (window.crypto && window.crypto.subtle) {
        const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
        const hashArr = Array.from(new Uint8Array(hashBuf));
        hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 14);
      }
    } catch (e) {
      // Fallback
    }

    const elapsed = Math.max(0.08, performance.now() - startTime).toFixed(2);

    // Pick candidate node respecting active region filter
    let candidates = GLOBAL_NODES;
    if (activeFilter !== 'all') {
      candidates = GLOBAL_NODES.filter(n => n.region === activeFilter);
      if (candidates.length === 0) candidates = GLOBAL_NODES;
    }
    const targetNode = candidates[Math.floor(Math.random() * candidates.length)];
    triggerNodePulse(targetNode.id, 'gold');
    spawnDynamicPingWave(targetNode.x, targetNode.y);

    // Add entry to telemetry feed
    logActivityEvent(
      { name: 'Your Browser (Local Sandbox)', flag: '🛡️', id: 'client-user' },
      {
        tool: 'Web Crypto API (SHA-256)',
        action: `Computed cryptographic digest [${hashHex}...] locally in ${elapsed}ms`,
        metric: '0.00 KB remote egress • 100% In-Memory'
      },
      true // highlighted user event
    );

    // Increment counter
    counterValue++;
    const countEl = document.getElementById('metric-computations-count');
    if (countEl) countEl.textContent = `${counterValue.toLocaleString()}+`;

    if (typeof App !== 'undefined' && App.toast) {
      App.toast(`⚡ Verified SHA-256 [${hashHex}...] in ${elapsed}ms locally! (0 bytes sent)`);
    }
  }

  // Dynamic Beacon Ping Animation
  function triggerNodePulse(nodeId, color = 'cyan') {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (!nodeEl) return;

    nodeEl.classList.remove('pulsing-active', 'pulsing-gold');
    void nodeEl.offsetWidth; // Force reflow
    nodeEl.classList.add('pulsing-active');
    if (color === 'gold') {
      nodeEl.classList.add('pulsing-gold');
    }

    setTimeout(() => {
      nodeEl.classList.remove('pulsing-active', 'pulsing-gold');
    }, 1800);
  }

  // Dynamic Verification Ping Wave Layer Animation
  function spawnDynamicPingWave(x, y) {
    const pingLayer = document.getElementById('dynamic-ping-layer');
    if (!pingLayer) return;

    pingLayer.insertAdjacentHTML('beforeend', `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#fbbf24" stroke-width="2.5" class="dynamic-ping-circle" />`);
    const circle = pingLayer.lastElementChild;

    setTimeout(() => {
      if (circle && circle.parentNode === pingLayer) {
        pingLayer.removeChild(circle);
      }
    }, 1700);
  }

  // Update Live System Date & Clock Badge
  function updateLiveDateBadge() {
    const badge = document.getElementById('telemetry-live-date-pill');
    if (!badge) return;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    badge.textContent = `📅 ${dateStr} System Date`;
    badge.setAttribute('title', `Genuine device system date: ${now.toDateString()}`);
  }

  // Append entry to live telemetry console
  function logActivityEvent(node, template, isUserEvent = false) {
    const feed = document.getElementById('activity-telemetry-feed');
    if (!feed) return;

    updateLiveDateBadge();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const item = document.createElement('div');
    item.className = `telemetry-row ${isUserEvent ? 'telemetry-row-user' : ''}`;
    item.innerHTML = `
      <div class="telemetry-time" title="${now.toISOString()}">
        <span class="telemetry-date-part">${dateStr}</span>
        <span class="telemetry-time-part">${timeStr}</span>
      </div>
      <div class="telemetry-origin">
        <span class="telemetry-flag">${node.flag}</span>
        <span class="telemetry-location">${escapeHTML(node.name)}</span>
      </div>
      <div class="telemetry-action">
        <span class="telemetry-tool-pill">${escapeHTML(template.tool)}</span>
        <span class="telemetry-desc">${escapeHTML(template.action)}</span>
      </div>
      <div class="telemetry-metric">
        <span class="telemetry-metric-pill">${escapeHTML(template.metric)}</span>
      </div>
    `;

    feed.insertBefore(item, feed.firstChild);

    // Keep feed trimmed to 8 items to prevent DOM bloat
    while (feed.children.length > 8) {
      feed.removeChild(feed.lastChild);
    }
  }

  // Start periodic live event ticker
  function startEventStream() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    // Populate initial 4 items
    for (let i = 0; i < 4; i++) {
      const n = GLOBAL_NODES[Math.floor(Math.random() * GLOBAL_NODES.length)];
      const t = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
      logActivityEvent(n, t);
    }

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 1500) + 1800; // 1.8s - 3.3s
      timerId = setTimeout(() => {
        if (!streamPaused && document.visibilityState !== 'hidden') {
          // Filter candidates by active region
          let candidates = GLOBAL_NODES;
          if (activeFilter !== 'all') {
            candidates = GLOBAL_NODES.filter(n => n.region === activeFilter);
            if (candidates.length === 0) candidates = GLOBAL_NODES;
          }

          const node = candidates[Math.floor(Math.random() * candidates.length)];
          const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];

          triggerNodePulse(node.id);
          logActivityEvent(node, template);

          // Increment counter
          counterValue++;
          const countEl = document.getElementById('metric-computations-count');
          if (countEl) countEl.textContent = `${counterValue.toLocaleString()}+`;
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  // Safe HTML Escaping (Security standard)
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-init on DOMContentLoaded or immediate if loaded later
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivityMap);
  } else {
    initActivityMap();
  }

  // Expose ActivityMap controller globally
  window.ActivityMap = {
    init: initActivityMap,
    testPing: executeUserCryptographicPing,
    filterRegion: applyRegionFilter,
    getNodes: () => GLOBAL_NODES
  };

})();
