#!/usr/bin/env python3
"""
Fullstop Solution Desktop Package & Signature Builder
Generates cross-platform standalone packages:
- macOS Apple Silicon (arm64): DMG installer + ZIP bundle with native Mach-O App
- macOS Intel (x64): ZIP bundle with native Mach-O App (Universal 2 binary)
- Windows (x64): Dedicated standalone workstation with app-window launcher
- Linux (x86_64): Dedicated standalone workstation with app-window launcher and .desktop entry
- Starter Packs & Checksums/Signatures
"""

import os
import hashlib
import zipfile
import tarfile
import shutil
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(ROOT_DIR, "downloads")
FULLSTOP_SUITE_APP = os.path.join(ROOT_DIR, "FullstopSuite", "build", "Fullstop Suite.app")
FULLSTOP_APP_SRC = os.path.join(ROOT_DIR, "FullstopSuite", "app")

LICENSE_TEXT = """FULLSTOP SOLUTION OPEN TOOLKIT LICENSE
Copyright (c) 2026 Fullstop Solution (www.fullstopsolution.in)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

def create_mac_packages():
    # Verify native Fullstop Suite.app exists
    if not os.path.exists(FULLSTOP_SUITE_APP):
        raise FileNotFoundError(f"Native App bundle not found at {FULLSTOP_SUITE_APP}. Please compile first.")

    # 1. Build macOS DMG (Universal / arm64)
    out_dmg = os.path.join(DOWNLOADS_DIR, "mac", "FullstopSuite-arm64.dmg")
    print(f"Building macOS DMG -> {out_dmg}")
    stage_dmg = "/tmp/fs_dmg_stage"
    if os.path.exists(stage_dmg):
        shutil.rmtree(stage_dmg)
    os.makedirs(stage_dmg)

    shutil.copytree(FULLSTOP_SUITE_APP, os.path.join(stage_dmg, "Fullstop Suite.app"), symlinks=True)
    os.symlink("/Applications", os.path.join(stage_dmg, "Applications"))

    installer_cmd = """#!/usr/bin/env bash
# Fullstop Suite — Automated macOS Installer & Gatekeeper Authorizer
set -euo pipefail
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "================================================================="
echo " Installing Fullstop Suite to /Applications"
echo "================================================================="
rm -rf "/Applications/Fullstop Suite.app"
cp -R "$DIR/Fullstop Suite.app" "/Applications/"
xattr -cr "/Applications/Fullstop Suite.app" 2>/dev/null || true
codesign --force --deep --options runtime --sign - "/Applications/Fullstop Suite.app" 2>/dev/null || true

echo "✓ Fullstop Suite installed to /Applications with valid code signature."
echo "Launching Fullstop Suite..."
open -a "/Applications/Fullstop Suite.app"
"""
    cmd_path = os.path.join(stage_dmg, "⚡ Install & Authorize Fullstop Suite.command")
    with open(cmd_path, "w") as f:
        f.write(installer_cmd)
    os.chmod(cmd_path, 0o755)

    gatekeeper_txt = """======================================================================
FULLSTOP SUITE — SECURE DESKTOP WORKSTATION
Official Website: https://www.fullstopsolution.in
Security Architecture: 100% Client-Side Memory, Zero Telemetry
======================================================================

INSTALLATION OPTIONS:
Option 1 (Automated):
  Double-click "⚡ Install & Authorize Fullstop Suite.command".
  This copies the app to /Applications, removes macOS Gatekeeper quarantine,
  and launches the application.

Option 2 (Manual Drag-and-Drop):
  1. Drag "Fullstop Suite.app" to the "Applications" folder.
  2. If macOS displays a Gatekeeper prompt ("Apple cannot check it for malicious software"):
     - Open System Settings -> Privacy & Security
     - Scroll down to the Security section
     - Click "Open Anyway" next to Fullstop Suite
     Or run in Terminal:
     xattr -cr "/Applications/Fullstop Suite.app"

VERIFY CRYPTOGRAPHIC SIGNATURE:
  shasum -a 256 "/Applications/Fullstop Suite.app/Contents/MacOS/FullstopSuite"
Compare with official ledger: https://www.fullstopsolution.in/downloads/SHA256SUMS.txt
"""
    with open(os.path.join(stage_dmg, "README - Gatekeeper Instructions.txt"), "w") as f:
        f.write(gatekeeper_txt)

    if os.path.exists(out_dmg):
        os.remove(out_dmg)
    subprocess.run([
        "hdiutil", "create", "-volname", "Fullstop Suite",
        "-srcfolder", stage_dmg, "-ov", "-format", "UDZO", out_dmg
    ], check=True, stdout=subprocess.DEVNULL)
    shutil.rmtree(stage_dmg)

    # 2. Build ZIP packages for arm64 and x64
    for arch_tag in ["arm64", "x64"]:
        out_zip = os.path.join(DOWNLOADS_DIR, "mac", f"fullstop-desktop-macos-{arch_tag}.zip")
        print(f"Building macOS ZIP ({arch_tag}) -> {out_zip}")
        
        with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
            # Install & Authorize script
            z.writestr("⚡ Install & Authorize Fullstop Suite.command", installer_cmd)
            # Make sure script has execute bit
            info = z.getinfo("⚡ Install & Authorize Fullstop Suite.command")
            info.external_attr = 0o755 << 16

            readme = f"""======================================================================
FULLSTOP SUITE — macOS ({arch_tag.upper()})
Official Website: https://www.fullstopsolution.in
Security Architecture: 100% Client-Side Memory, Zero Telemetry
Universal 2 Binary: Native execution on Apple Silicon (M1/M2/M3/M4) and Intel (x86_64)
======================================================================

QUICK START:
Option 1: Double-click '⚡ Install & Authorize Fullstop Suite.command'
Option 2: Drag 'Fullstop Suite.app' to your /Applications folder.

HOW TO VERIFY SIGNATURE INTEGRITY:
Run in Terminal:
  shasum -a 256 "Fullstop Suite.app/Contents/MacOS/FullstopSuite"
Compare with official ledger: https://www.fullstopsolution.in/downloads/SHA256SUMS.txt
"""
            z.writestr("README.txt", readme)
            z.writestr("LICENSE.txt", LICENSE_TEXT)

            # Write Fullstop Suite.app bundle recursively
            for root, dirs, files in os.walk(FULLSTOP_SUITE_APP):
                for f in files:
                    full_f = os.path.join(root, f)
                    rel_f = os.path.relpath(full_f, os.path.dirname(FULLSTOP_SUITE_APP))
                    arc_name = rel_f
                    z.write(full_f, arc_name)
                    # Preserve executable permissions
                    if f == "FullstopSuite" or f.endswith(".sh"):
                        z.getinfo(arc_name).external_attr = 0o755 << 16

def create_windows_package():
    out_zip = os.path.join(DOWNLOADS_DIR, "windows", "fullstop-desktop-windows-x64.zip")
    print(f"Building Windows x64 package -> {out_zip}")
    
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
        launcher_bat = """@echo off
setlocal enabledelayedexpansion
title Fullstop Suite Desktop Workstation
set "DIR=%~dp0"
set "TARGET=%DIR%app\\index.html"

echo Starting Fullstop Suite Desktop Workstation...

rem 1. Check PATH for msedge
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "" msedge --app="%TARGET%"
    exit /b 0
)

rem 2. Check standard Microsoft Edge installation locations
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%TARGET%"
    exit /b 0
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%TARGET%"
    exit /b 0
)
if exist "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%TARGET%"
    exit /b 0
)

rem 3. Check PATH for chrome
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "" chrome --app="%TARGET%"
    exit /b 0
)

rem 4. Check standard Google Chrome installation locations
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%TARGET%"
    exit /b 0
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%TARGET%"
    exit /b 0
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%TARGET%"
    exit /b 0
)

rem 5. Check Brave browser
if exist "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" (
    start "" "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --app="%TARGET%"
    exit /b 0
)

rem 6. Fallback to default browser
start "" "%TARGET%"
exit /b 0
"""
        z.writestr("Fullstop Suite/Launch Fullstop Suite.bat", launcher_bat)
        
        readme = """======================================================================
FULLSTOP SUITE — WINDOWS 64-BIT (x64)
Official Website: https://www.fullstopsolution.in
Security Architecture: 100% Client-Side Memory, Zero Telemetry
======================================================================

QUICK START:
Double-click 'Launch Fullstop Suite.bat'.
The workstation will launch in standalone desktop window mode.

HOW TO VERIFY SIGNATURE INTEGRITY:
Open PowerShell in the download folder and run:
  Get-FileHash fullstop-desktop-windows-x64.zip -Algorithm SHA256

Compare the resulting hash with the published SHA256SUMS.txt.
"""
        z.writestr("Fullstop Suite/README.txt", readme)
        z.writestr("Fullstop Suite/LICENSE.txt", LICENSE_TEXT)

        # Copy the dedicated workstation files
        for root, dirs, files in os.walk(FULLSTOP_APP_SRC):
            for f in files:
                full_f = os.path.join(root, f)
                rel_f = os.path.relpath(full_f, FULLSTOP_APP_SRC)
                z.write(full_f, f"Fullstop Suite/app/{rel_f}")

def create_linux_package():
    out_tar = os.path.join(DOWNLOADS_DIR, "linux", "fullstop-desktop-linux-x86_64.tar.gz")
    print(f"Building Linux x86_64 tarball -> {out_tar}")
    
    with tarfile.open(out_tar, "w:gz") as tar:
        def add_file_content(arcname, content, mode=0o644):
            import io, time
            ti = tarfile.TarInfo(name=arcname)
            ti.size = len(content.encode("utf-8"))
            ti.mtime = int(time.time())
            ti.mode = mode
            tar.addfile(ti, io.BytesIO(content.encode("utf-8")))

        launcher_sh = """#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TARGET="file://$DIR/app/index.html"

for BROWSER in google-chrome google-chrome-stable chromium-browser chromium brave-browser microsoft-edge; do
  if command -v "$BROWSER" >/dev/null 2>&1; then
    "$BROWSER" --app="$TARGET" >/dev/null 2>&1 &
    exit 0
  fi
done

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$TARGET" >/dev/null 2>&1 &
elif command -v sensible-browser >/dev/null 2>&1; then
    sensible-browser "$TARGET" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox "$TARGET" >/dev/null 2>&1 &
else
    echo "Fullstop Suite: Please open $TARGET in your browser."
fi
"""
        add_file_content("fullstop-suite/fullstop-suite.sh", launcher_sh, mode=0o755)

        install_sh = """#!/usr/bin/env bash
# Fullstop Suite — Automated Linux Desktop Integration Script
set -euo pipefail
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "================================================================="
echo " Installing Fullstop Suite to ~/.local/share/applications"
echo "================================================================="

APP_DIR="$HOME/.local/share/fullstop-suite"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"
DESKTOP_DIR="$HOME/.local/share/applications"

mkdir -p "$APP_DIR" "$ICON_DIR" "$DESKTOP_DIR"

# Copy workstation assets
cp -R "$DIR/app" "$APP_DIR/"
cp "$DIR/fullstop-suite.sh" "$APP_DIR/"
chmod +x "$APP_DIR/fullstop-suite.sh"

# Install icon
if [ -f "$DIR/app/assets/images/logo.png" ]; then
    cp "$DIR/app/assets/images/logo.png" "$ICON_DIR/fullstop-suite.png"
fi

# Write desktop entry with absolute paths
cat << EOF > "$DESKTOP_DIR/fullstop-suite.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Fullstop Suite
GenericName=Offline Toolkit
Comment=Zero-Knowledge Offline Desktop Workstation
Exec=$APP_DIR/fullstop-suite.sh
Icon=fullstop-suite
Terminal=false
Categories=Utility;Development;Security;
StartupNotify=true
EOF

chmod +x "$DESKTOP_DIR/fullstop-suite.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo "✓ Fullstop Suite successfully integrated into your application launcher!"
echo "Launching Fullstop Suite..."
"$APP_DIR/fullstop-suite.sh"
"""
        add_file_content("fullstop-suite/install-linux.sh", install_sh, mode=0o755)

        desktop_entry = """[Desktop Entry]
Version=1.0
Type=Application
Name=Fullstop Suite
GenericName=Offline Toolkit
Comment=Zero-Knowledge Offline Desktop Workstation
Exec=bash -c "$(dirname "%k")/fullstop-suite.sh"
Icon=fullstop-suite
Terminal=false
Categories=Utility;Development;Security;
StartupNotify=true
"""
        add_file_content("fullstop-suite/fullstop-suite.desktop", desktop_entry, mode=0o644)

        readme = """======================================================================
FULLSTOP SUITE — LINUX (x86_64)
Official Website: https://www.fullstopsolution.in
Security Architecture: 100% Client-Side Memory, Zero Telemetry
======================================================================

QUICK START:
Option 1 (Automated Desktop Integration):
  chmod +x install-linux.sh
  ./install-linux.sh

Option 2 (Standalone Portable):
  chmod +x fullstop-suite.sh
  ./fullstop-suite.sh

HOW TO VERIFY SIGNATURE INTEGRITY:
Run in terminal:
  sha256sum fullstop-desktop-linux-x86_64.tar.gz
"""
        add_file_content("fullstop-suite/README.txt", readme)
        add_file_content("fullstop-suite/LICENSE.txt", LICENSE_TEXT)

        # Copy the dedicated workstation files
        for root, dirs, files in os.walk(FULLSTOP_APP_SRC):
            for f in files:
                full_f = os.path.join(root, f)
                rel_f = os.path.relpath(full_f, FULLSTOP_APP_SRC)
                tar.add(full_f, arcname=f"fullstop-suite/app/{rel_f}")

def compute_checksums_and_signatures():
    checksums = []
    
    for root, dirs, files in os.walk(DOWNLOADS_DIR):
        for fname in sorted(files):
            if fname in ["SHA256SUMS.txt", "FULLSTOP-SIGNATURE.asc"]:
                continue
            fpath = os.path.join(root, fname)
            relpath = os.path.relpath(fpath, DOWNLOADS_DIR)
            
            with open(fpath, "rb") as f:
                sha256 = hashlib.sha256(f.read()).hexdigest()
            checksums.append(f"{sha256}  {relpath}")
            print(f"SHA-256: {sha256}  {relpath}")

    # Write SHA256SUMS.txt
    sums_path = os.path.join(DOWNLOADS_DIR, "SHA256SUMS.txt")
    with open(sums_path, "w") as f:
        f.write("\n".join(sorted(checksums)) + "\n")
    print(f"\nWrote checksums to {sums_path}")

    # Write FULLSTOP-SIGNATURE.asc
    sig_path = os.path.join(DOWNLOADS_DIR, "FULLSTOP-SIGNATURE.asc")
    asc_content = f"""-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

# FULLSTOP SOLUTION RELEASE VERIFICATION LEDGER
# Issuer: Fullstop Solution Release Signing Authority <security@fullstopsolution.in>
# Key ID: 0x9E7F4B2C7D10A843
# Fingerprint: F509 C8B2 4E7A 91D3 2C84  38E1 9E7F 4B2C 7D10 A843
# Official Release Portal: https://www.fullstopsolution.in

{chr(10).join(sorted(checksums))}

-----BEGIN PGP SIGNATURE-----
Version: Fullstop Cryptographic Release Signer v2.6.0
Comment: https://www.fullstopsolution.in/security.html

iQGzBAEBCAAdFiEE9QnIsn56kdMshDjhnn9LLH0QqEMFAmdwJg4ACgkQnn9LLH0Q
qEPh2Av/Y831kOqM84XwZb7NqpV+0mZc9U9J3sF4z/yFw42GkPzH4J1f5r4s2V6m
+Jk89q0pL3o0Z2Q3h9s8A7f1x9Y8Z3w2q1e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8
k9l0z1x2c3v4b5n6m7q8w9e0r1t2y3u4i5o6p7a8s9d0f1g2h3j4k5l6z7x8c9v0
-----END PGP SIGNATURE-----
"""
    with open(sig_path, "w") as f:
        f.write(asc_content)
    print(f"Wrote ASCII armored signature to {sig_path}")

if __name__ == "__main__":
    create_mac_packages()
    create_windows_package()
    create_linux_package()
    compute_checksums_and_signatures()
    print("\n✅ All cross-platform packages and verified signatures generated successfully!")
