/**
 * Fullstop Solution — Real-Time Release Auto-Updater
 * www.fullstopsolution.in
 *
 * Automatically fetches the latest published releases from official GitHub repositories
 * (MacSentinel & Fullstop Desktop Suite), caching results in sessionStorage to preserve
 * GitHub API quotas while ensuring visitors always get zero-delay access to new builds.
 *
 * Zero telemetry, zero external trackers, 100% privacy-compliant.
 */
(function() {
  'use strict';

  var CACHE_KEY = 'fullstop_releases_cache_v2';
  var CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  var REPOS = {
    macsentinel: 'iamkuruphere-sudo/MacSentinel',
    desktopSuite: 'iamkuruphere-sudo/fullstop-desktop-suite'
  };

  function getCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var now = Date.now();
      var valid = {};
      for (var k in parsed) {
        if (parsed[k] && parsed[k].timestamp && (now - parsed[k].timestamp) < CACHE_TTL_MS) {
          valid[k] = parsed[k];
        }
      }
      return valid;
    } catch (e) {
      return {};
    }
  }

  function setCache(key, data) {
    try {
      var cache = getCache();
      cache[key] = {
        timestamp: Date.now(),
        data: data
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // Storage quota or private mode fallback
    }
  }

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    var mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MiB';
  }

  function extractSha256(bodyText) {
    if (!bodyText) return null;
    // Look for explicit sha256: <hash> or 64 hex characters
    var match = bodyText.match(/(?:sha256[:\s]+)?([0-9a-f]{64})/i);
    return match ? match[1].toLowerCase() : null;
  }

  function fetchLatestRelease(repoName, callback) {
    var cache = getCache();
    if (cache[repoName] && cache[repoName].data) {
      callback(null, cache[repoName].data);
      return;
    }

    var url = 'https://api.github.com/repos/' + repoName + '/releases/latest';
    fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(function(res) {
      if (!res.ok) {
        throw new Error('Release query returned status ' + res.status);
      }
      return res.json();
    })
    .then(function(data) {
      setCache(repoName, data);
      callback(null, data);
    })
    .catch(function(err) {
      callback(err, null);
    });
  }

  function updateMacSentinel(release) {
    if (!release || !release.tag_name) return;

    var tag = release.tag_name;
    var htmlUrl = release.html_url || ('https://github.com/' + REPOS.macsentinel + '/releases/tag/' + tag);
    var dmgAsset = null;

    if (Array.isArray(release.assets)) {
      for (var i = 0; i < release.assets.length; i++) {
        var asset = release.assets[i];
        if (asset.name && asset.name.toLowerCase().endsWith('.dmg')) {
          dmgAsset = asset;
          break;
        }
      }
    }

    var assetUrl = dmgAsset ? dmgAsset.browser_download_url : 'downloads/mac/MacSentinel-arm64.dmg';
    var sizeStr = dmgAsset ? formatBytes(dmgAsset.size) : '1.91 MiB';
    var sha256 = extractSha256(release.body);

    // 1. Target: macsentinel.html Hero Version Tag
    var versionTagEl = document.getElementById('macsentinel-version-tag');
    if (versionTagEl) {
      versionTagEl.textContent = 'MacSentinel ' + tag + ' (Apple Silicon)';
    }

    // 2. Target: macsentinel.html Main Download Button
    var dlBtnEl = document.getElementById('macsentinel-download-btn');
    if (dlBtnEl) {
      dlBtnEl.href = assetUrl;
      dlBtnEl.innerHTML = '⬇️ Download MacSentinel-arm64.dmg (' + sizeStr + ')';
    }

    // 3. Target: macsentinel.html Release Link
    var relLinkEl = document.getElementById('macsentinel-release-link');
    if (relLinkEl) {
      relLinkEl.href = htmlUrl;
      relLinkEl.textContent = 'GitHub Release ' + tag + ' ↗';
    }

    // 4. Target: macsentinel.html Bottom Download Button
    var bottomBtnEl = document.getElementById('macsentinel-bottom-btn');
    if (bottomBtnEl) {
      bottomBtnEl.href = assetUrl;
      bottomBtnEl.innerHTML = '⬇️ Download MacSentinel ' + tag + ' (.dmg)';
    }

    // 5. Target: macsentinel.html Checksum box
    var checksumEl = document.getElementById('macsentinel-checksum');
    if (checksumEl && sha256) {
      checksumEl.textContent = sha256;
    }

    // 6. Target: index.html Star Feature Version Badge
    var indexVersionEl = document.getElementById('macsentinel-index-version');
    if (indexVersionEl) {
      indexVersionEl.textContent = '📦 ' + tag + ' (Apple Silicon DMG • ' + sizeStr + ')';
    }

    // 7. Target: index.html Star Feature Release Link
    var indexRelLinkEl = document.getElementById('macsentinel-index-release-link');
    if (indexRelLinkEl) {
      indexRelLinkEl.href = htmlUrl;
      indexRelLinkEl.textContent = 'GitHub Release ' + tag + ' ↗';
    }

    // 8. Target: index.html Star Feature Download Button
    var indexDlBtnEl = document.getElementById('macsentinel-index-download-btn');
    if (indexDlBtnEl) {
      indexDlBtnEl.href = assetUrl;
      indexDlBtnEl.innerHTML = '⬇️ Download DMG Free (' + tag + ')';
    }

    // 9. Target: index.html Star Feature Checksum Box
    var indexChecksumEl = document.getElementById('macsentinel-index-checksum');
    if (indexChecksumEl && sha256) {
      indexChecksumEl.textContent = 'SHA-256: ' + sha256.substring(0, 8) + '...' + sha256.substring(58);
      indexChecksumEl.setAttribute('title', sha256);
    }
  }

  function updateDesktopSuite(release) {
    if (!release || !Array.isArray(release.assets)) return;

    var shaMap = {};
    if (release.body) {
      var lines = release.body.split('\n');
      for (var l = 0; l < lines.length; l++) {
        var m = lines[l].match(/([0-9a-f]{64})\s+([a-zA-Z0-9_\-\.]+)/i);
        if (m) {
          shaMap[m[2].toLowerCase()] = m[1].toLowerCase();
        }
      }
    }

    release.assets.forEach(function(asset) {
      var name = asset.name.toLowerCase();
      var dlUrl = asset.browser_download_url;

      if (name.includes('arm64') && (name.endsWith('.zip') || name.endsWith('.dmg'))) {
        var btn = document.getElementById('platform-dl-mac-arm64');
        if (btn) btn.href = dlUrl;
        var shaEl = document.getElementById('platform-sha-mac-arm64');
        if (shaEl && shaMap[name]) shaEl.textContent = 'SHA-256: ' + shaMap[name];
      } else if ((name.includes('x64') || name.includes('x86_64')) && name.includes('mac')) {
        var btn = document.getElementById('platform-dl-mac-x64');
        if (btn) btn.href = dlUrl;
        var shaEl = document.getElementById('platform-sha-mac-x64');
        if (shaEl && shaMap[name]) shaEl.textContent = 'SHA-256: ' + shaMap[name];
      } else if (name.includes('win') || name.endsWith('.exe')) {
        var btn = document.getElementById('platform-dl-windows');
        if (btn) btn.href = dlUrl;
        var shaEl = document.getElementById('platform-sha-windows');
        if (shaEl && shaMap[name]) shaEl.textContent = 'SHA-256: ' + shaMap[name];
      } else if (name.includes('linux') || name.endsWith('.tar.gz') || name.endsWith('.appimage')) {
        var btn = document.getElementById('platform-dl-linux');
        if (btn) btn.href = dlUrl;
        var shaEl = document.getElementById('platform-sha-linux');
        if (shaEl && shaMap[name]) shaEl.textContent = 'SHA-256: ' + shaMap[name];
      }
    });
  }

  function init() {
    // 1. Sync MacSentinel latest release
    fetchLatestRelease(REPOS.macsentinel, function(err, release) {
      if (!err && release) {
        updateMacSentinel(release);
      }
    });

    // 2. Sync Fullstop Desktop Suite if releases exist
    fetchLatestRelease(REPOS.desktopSuite, function(err, release) {
      if (!err && release) {
        updateDesktopSuite(release);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
