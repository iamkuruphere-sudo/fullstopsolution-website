#!/usr/bin/env python3
"""
Fullstop Solution — Automated Release Sync Engine
Synchronizes the website assets, checksums, and HTML templates with the latest
releases published across GitHub repositories under iamkuruphere-sudo.

Supported Repositories:
- iamkuruphere-sudo/MacSentinel (arm64 .dmg)
- iamkuruphere-sudo/fullstop-desktop-suite (cross-platform packages)
"""

import os
import sys
import json
import re
import hashlib
import urllib.request
import urllib.error
import argparse
import subprocess

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWNLOADS_DIR = os.path.join(REPO_DIR, "downloads")
SHA256_FILE = os.path.join(DOWNLOADS_DIR, "SHA256SUMS.txt")
INDEX_HTML = os.path.join(REPO_DIR, "index.html")
MACSENTINEL_HTML = os.path.join(REPO_DIR, "macsentinel.html")

MACSENTINEL_REPO = "iamkuruphere-sudo/MacSentinel"
DESKTOP_SUITE_REPO = "iamkuruphere-sudo/fullstop-desktop-suite"

def log(msg):
    print(f"[release-sync] {msg}")

def fetch_json(url, token=None):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Fullstop-Release-Sync/1.0"
    }
    if token:
        headers["Authorization"] = f"token {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        log(f"HTTP error {e.code} fetching {url}: {e.reason}")
        return None
    except Exception as e:
        log(f"Error fetching {url}: {e}")
        return None

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().lower()

def download_file(url, dest_path):
    log(f"Downloading {url} -> {dest_path}")
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    temp_path = dest_path + ".tmp"
    headers = {"User-Agent": "Fullstop-Release-Sync/1.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as resp, open(temp_path, "wb") as out:
        while chunk := resp.read(65536):
            out.write(chunk)
    if os.path.exists(dest_path):
        os.remove(dest_path)
    os.rename(temp_path, dest_path)
    log(f"Download complete: {os.path.getsize(dest_path)} bytes")

def update_sha256sums_file(rel_path, new_hash):
    if not os.path.exists(SHA256_FILE):
        lines = []
    else:
        with open(SHA256_FILE, "r") as f:
            lines = f.readlines()
    
    updated = False
    new_lines = []
    for line in lines:
        parts = line.strip().split(None, 1)
        if len(parts) == 2 and parts[1] == rel_path:
            new_lines.append(f"{new_hash}  {rel_path}\n")
            updated = True
        else:
            new_lines.append(line)
    
    if not updated:
        new_lines.append(f"{new_hash}  {rel_path}\n")
        
    with open(SHA256_FILE, "w") as f:
        f.writelines(new_lines)
    log(f"Updated {SHA256_FILE} for {rel_path} with {new_hash}")

def sync_macsentinel(token=None, force=False):
    log(f"Checking {MACSENTINEL_REPO} for latest release...")
    url = f"https://api.github.com/repos/{MACSENTINEL_REPO}/releases/latest"
    release = fetch_json(url, token)
    if not release:
        log("No release found for MacSentinel.")
        return False

    tag = release.get("tag_name", "")
    html_url = release.get("html_url", "")
    log(f"Latest MacSentinel release is {tag}")

    # Find .dmg asset
    dmg_asset = None
    for asset in release.get("assets", []):
        if asset.get("name", "").endswith(".dmg"):
            dmg_asset = asset
            break

    if not dmg_asset:
        log(f"No .dmg asset found in release {tag}")
        return False

    dmg_url = dmg_asset.get("browser_download_url")
    dmg_size_bytes = dmg_asset.get("size", 0)
    dmg_size_mb = f"{(dmg_size_bytes / (1024 * 1024)):.2f} MiB" if dmg_size_bytes else "1.91 MiB"
    dest_path = os.path.join(DOWNLOADS_DIR, "mac", "MacSentinel-arm64.dmg")

    # Read current version from macsentinel.html
    current_version = None
    if os.path.exists(MACSENTINEL_HTML):
        with open(MACSENTINEL_HTML, "r") as f:
            m = re.search(r'"softwareVersion":\s*"([^"]+)"', f.read())
            if m:
                current_version = m.group(1)

    needs_update = force or (current_version != tag) or not os.path.exists(dest_path)

    if not needs_update:
        log(f"MacSentinel is already up to date ({current_version}).")
        return False

    log(f"Updating MacSentinel: {current_version} -> {tag}")
    download_file(dmg_url, dest_path)
    new_hash = compute_sha256(dest_path)
    log(f"New SHA-256 for MacSentinel-arm64.dmg: {new_hash}")

    # Update SHA256SUMS.txt
    update_sha256sums_file("mac/MacSentinel-arm64.dmg", new_hash)

    # Update macsentinel.html
    if os.path.exists(MACSENTINEL_HTML):
        with open(MACSENTINEL_HTML, "r") as f:
            content = f.read()

        # Update softwareVersion
        content = re.sub(
            r'"softwareVersion":\s*"[^"]+"',
            f'"softwareVersion": "{tag}"',
            content
        )
        # Update version tag div
        content = re.sub(
            r'<div id="macsentinel-version-tag"[^>]*>.*?</div>',
            f'<div id="macsentinel-version-tag" style="font-weight:700; color:#ffffff; font-size:1.05rem;">MacSentinel {tag} (Apple Silicon)</div>',
            content
        )
        # Update download button text
        content = re.sub(
            r'<a id="macsentinel-download-btn"[^>]*>.*?</a>',
            f'<a id="macsentinel-download-btn" href="downloads/mac/MacSentinel-arm64.dmg" download class="btn btn-primary btn-lg" style="width:100%; justify-content:center; font-size:1.05rem;">⬇️ Download MacSentinel-arm64.dmg ({dmg_size_mb})</a>',
            content
        )
        # Update release link
        content = re.sub(
            r'<a id="macsentinel-release-link"[^>]*>.*?</a>',
            f'<a id="macsentinel-release-link" href="{html_url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="flex:1; justify-content:center;">GitHub Release {tag} ↗</a>',
            content
        )
        # Update bottom button
        content = re.sub(
            r'<a id="macsentinel-bottom-btn"[^>]*>.*?</a>',
            f'<a id="macsentinel-bottom-btn" href="downloads/mac/MacSentinel-arm64.dmg" download class="btn btn-primary btn-lg" style="margin: 0 auto; display:inline-flex;">⬇️ Download MacSentinel {tag} (.dmg)</a>',
            content
        )
        # Update checksum
        content = re.sub(
            r'<div id="macsentinel-checksum"[^>]*>.*?</div>',
            f'<div id="macsentinel-checksum" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-neon-cyan); word-break:break-all; overflow-wrap:anywhere;">{new_hash}</div>',
            content
        )

        with open(MACSENTINEL_HTML, "w") as f:
            f.write(content)
        log(f"Updated {MACSENTINEL_HTML}")

    # Update index.html
    if os.path.exists(INDEX_HTML):
        with open(INDEX_HTML, "r") as f:
            content = f.read()

        # Update index badge
        content = re.sub(
            r'<span id="macsentinel-index-version"[^>]*>.*?</span>',
            f'<span id="macsentinel-index-version">📦 {tag} (Apple Silicon DMG • {dmg_size_mb})</span>',
            content
        )
        # Update index checksum
        short_hash = f"{new_hash[:8]}...{new_hash[-5:]}"
        content = re.sub(
            r'<span id="macsentinel-index-checksum"[^>]*>.*?</span>',
            f'<span id="macsentinel-index-checksum" style="font-family:var(--font-mono); background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.08);" title="{new_hash}">SHA-256: {short_hash}</span>',
            content
        )
        # Update index release link
        content = re.sub(
            r'<a id="macsentinel-index-release-link"[^>]*>.*?</a>',
            f'<a id="macsentinel-index-release-link" href="{html_url}" target="_blank" rel="noopener" style="color:var(--accent-neon-cyan); text-decoration:none;">GitHub Release {tag} ↗</a>',
            content
        )
        # Update index download button
        content = re.sub(
            r'<a id="macsentinel-index-download-btn"[^>]*>.*?</a>',
            f'<a id="macsentinel-index-download-btn" href="downloads/mac/MacSentinel-arm64.dmg" download class="btn btn-gradient" style="padding:0.85rem 1.25rem; font-weight:700; font-size:0.95rem; justify-content:center; box-shadow:0 4px 20px rgba(34, 211, 238, 0.3);">⬇️ Download DMG Free ({tag})</a>',
            content
        )

        with open(INDEX_HTML, "w") as f:
            f.write(content)
        log(f"Updated {INDEX_HTML}")

    return True

def sync_desktop_suite(token=None, force=False):
    log(f"Checking {DESKTOP_SUITE_REPO} for releases...")
    url = f"https://api.github.com/repos/{DESKTOP_SUITE_REPO}/releases/latest"
    release = fetch_json(url, token)
    if not release or not release.get("assets"):
        log("No binary release assets found for fullstop-desktop-suite yet.")
        return False

    changed = False
    for asset in release.get("assets", []):
        name = asset.get("name", "")
        url = asset.get("browser_download_url")
        dest_rel = None
        if "arm64" in name and (name.endswith(".zip") or name.endswith(".dmg")):
            dest_rel = "mac/fullstop-desktop-macos-arm64.zip"
        elif ("x64" in name or "x86_64" in name) and "mac" in name:
            dest_rel = "mac/fullstop-desktop-macos-x64.zip"
        elif "win" in name or name.endswith(".exe"):
            dest_rel = "windows/fullstop-desktop-windows-x64.zip"
        elif "linux" in name or name.endswith(".tar.gz") or name.endswith(".AppImage"):
            dest_rel = "linux/fullstop-desktop-linux-x86_64.tar.gz"

        if dest_rel:
            dest_path = os.path.join(DOWNLOADS_DIR, dest_rel)
            download_file(url, dest_path)
            h = compute_sha256(dest_path)
            update_sha256sums_file(dest_rel, h)
            changed = True

    return changed

def git_commit_and_push(msg="chore(releases): auto-sync latest releases from GitHub"):
    try:
        status = subprocess.check_output(["git", "status", "--porcelain"], cwd=REPO_DIR).decode()
        if not status.strip():
            log("No changes detected in git status.")
            return False
        log("Staging modified release files...")
        subprocess.check_call(["git", "add", "downloads/", "macsentinel.html", "index.html"], cwd=REPO_DIR)
        subprocess.check_call(["git", "commit", "-m", msg], cwd=REPO_DIR)
        log("Committed release changes. Pushing to origin main...")
        subprocess.check_call(["git", "push", "origin", "main"], cwd=REPO_DIR)
        log("Successfully pushed to GitHub!")
        return True
    except subprocess.CalledProcessError as e:
        log(f"Git operation failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Fullstop Solution Release Sync Engine")
    parser.add_argument("--force", action="store_true", help="Force re-download even if version matches")
    parser.add_argument("--commit", action="store_true", help="Auto-commit and push if updates were made")
    parser.add_argument("--ci", action="store_true", help="Run in CI mode with auto-commit")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    log("Starting release sync run...")

    updated_mac = sync_macsentinel(token=token, force=args.force)
    updated_desktop = sync_desktop_suite(token=token, force=args.force)

    # Always ensure cryptographic signatures across all platforms are up to date
    try:
        from update_signatures import update_all_signatures
        update_all_signatures()
    except ImportError:
        import subprocess
        sig_script = os.path.join(REPO_DIR, "scripts", "update-signatures.py")
        if os.path.exists(sig_script):
            subprocess.run([sys.executable, sig_script], check=True)

    if (updated_mac or updated_desktop) and (args.commit or args.ci):
        git_commit_and_push()
    else:
        log("Sync check finished.")

if __name__ == "__main__":
    main()
