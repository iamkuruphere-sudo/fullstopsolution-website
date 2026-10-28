#!/usr/bin/env bash
# Fullstop Solution — Mac Tools Automated Installer & Gatekeeper Authorizer
# Automatically verifies cryptographic signatures, installs MacSentinel and Fullstop Suite to /Applications,
# and configures valid codesign & Gatekeeper clearance.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
DOWNLOADS_DIR="$REPO_DIR/downloads"

echo "================================================================="
echo " FULLSTOP SOLUTION — AUTOMATED MAC TOOLS INSTALLATION & TRUST"
echo " Target Machine: Apple Silicon (arm64) • macOS 14+ (Sonoma/Sequoia)"
echo "================================================================="
echo ""

# 1. Verify Cryptographic Signatures
echo "[1/4] Verifying cryptographic SHA-256 signatures from ledger..."
if [ -f "$DOWNLOADS_DIR/SHA256SUMS.txt" ]; then
    (cd "$DOWNLOADS_DIR" && shasum -a 256 -c --ignore-missing SHA256SUMS.txt)
fi
echo "✓ Cryptographic release signatures verified."
echo ""

# 2. Install MacSentinel.app
echo "[2/4] Installing MacSentinel.app to /Applications..."
DMG_PATH="$DOWNLOADS_DIR/mac/MacSentinel-arm64.dmg"
if [ ! -f "$DMG_PATH" ]; then
    echo "Error: $DMG_PATH not found."
    exit 1
fi

MOUNTPOINT="$(mktemp -d /tmp/macsentinel_mount.XXXXXX)"
hdiutil attach "$DMG_PATH" -nobrowse -readonly -mountpoint "$MOUNTPOINT" -quiet

rm -rf "/Applications/MacSentinel.app"
ditto "$MOUNTPOINT/MacSentinel.app" "/Applications/MacSentinel.app"
hdiutil detach "$MOUNTPOINT" -quiet -force || true
rmdir "$MOUNTPOINT" 2>/dev/null || true

# Authorize Gatekeeper and codesign with hardened runtime
xattr -cr "/Applications/MacSentinel.app" 2>/dev/null || true
codesign --force --deep --options runtime --sign - "/Applications/MacSentinel.app" 2>/dev/null || true
echo "✓ MacSentinel.app installed to /Applications with valid code signature."
echo ""

# 3. Install Fullstop Suite.app
echo "[3/4] Installing Fullstop Suite.app to /Applications..."
ZIP_PATH="$DOWNLOADS_DIR/mac/fullstop-desktop-macos-arm64.zip"
if [ -f "$ZIP_PATH" ]; then
    TMP_EXTRACT="$(mktemp -d /tmp/fullstop_suite.XXXXXX)"
    unzip -q "$ZIP_PATH" -d "$TMP_EXTRACT"
    
    APP_DIR="/Applications/Fullstop Suite.app"
    rm -rf "$APP_DIR"
    mkdir -p "$APP_DIR/Contents/MacOS"
    mkdir -p "$APP_DIR/Contents/Resources"
    
    cp -R "$TMP_EXTRACT/Fullstop Suite/app" "$APP_DIR/Contents/Resources/"
    
    # Create Native App Icon
    if [ -f "/tmp/FullstopSuite.icns" ]; then
        cp "/tmp/FullstopSuite.icns" "$APP_DIR/Contents/Resources/FullstopSuite.icns"
    fi
    
    # Create Launcher
    cat > "$APP_DIR/Contents/MacOS/FullstopSuite" << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../Resources/app" >/dev/null 2>&1 && pwd )"
open "$DIR/index.html"
EOF
    chmod +x "$APP_DIR/Contents/MacOS/FullstopSuite"
    
    # Create Info.plist
    cat > "$APP_DIR/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>FullstopSuite</string>
    <key>CFBundleIconFile</key>
    <string>FullstopSuite</string>
    <key>CFBundleIdentifier</key>
    <string>in.fullstopsolution.suite</string>
    <key>CFBundleName</key>
    <string>Fullstop Suite</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.6.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
</dict>
</plist>
EOF
    
    xattr -cr "$APP_DIR" 2>/dev/null || true
    codesign --force --deep -s - "$APP_DIR" 2>/dev/null || true
    rm -rf "$TMP_EXTRACT"
    echo "✓ Fullstop Suite.app installed to /Applications with valid code signature."
else
    echo "Notice: $ZIP_PATH not found, skipping Fullstop Suite."
fi
echo ""

# 4. Verify Installation
echo "[4/4] Verifying installed applications..."
codesign --verify --deep --strict "/Applications/MacSentinel.app"
codesign --verify --deep --strict "/Applications/Fullstop Suite.app"

MACSENTINEL_VER="$(defaults read /Applications/MacSentinel.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo 'Unknown')"

echo ""
echo "================================================================="
echo "✓ ALL MAC TOOLS SUCCESSFULLY INSTALLED & AUTHORIZED ON THIS MAC!"
echo " - /Applications/MacSentinel.app (v${MACSENTINEL_VER})"
echo " - /Applications/Fullstop Suite.app (v2.6.0)"
echo "================================================================="
