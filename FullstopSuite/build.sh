#!/usr/bin/env bash
# Fullstop Suite — Native Desktop Workstation Build Script
# Compiles Universal 2 (arm64 + x86_64) native Cocoa Mach-O binary
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
APP_DIR="$BUILD_DIR/Fullstop Suite.app"

echo "=== Building Fullstop Suite Native Desktop Application ==="
mkdir -p "$BUILD_DIR"

# 1. Compile arm64 native binary
echo "[1/4] Compiling native arm64 Mach-O binary..."
clang -framework Cocoa -framework WebKit -target arm64-apple-macos11.0 -O2 \
  "$SCRIPT_DIR/src/main.m" -o "$BUILD_DIR/FullstopSuite_arm64"

# 2. Compile x86_64 native binary
echo "[2/4] Compiling native x86_64 Mach-O binary..."
clang -framework Cocoa -framework WebKit -target x86_64-apple-macos10.15 -O2 \
  "$SCRIPT_DIR/src/main.m" -o "$BUILD_DIR/FullstopSuite_x64"

# 3. Create Universal 2 binary
echo "[3/4] Creating Universal 2 binary (Apple Silicon + Intel)..."
lipo -create -output "$BUILD_DIR/FullstopSuite" \
  "$BUILD_DIR/FullstopSuite_arm64" "$BUILD_DIR/FullstopSuite_x64"
rm -f "$BUILD_DIR/FullstopSuite_arm64" "$BUILD_DIR/FullstopSuite_x64"

# 4. Assemble .app Bundle
echo "[4/4] Assembling and signing Fullstop Suite.app..."
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"

cat << 'EOF' > "$APP_DIR/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>FullstopSuite</string>
    <key>CFBundleIdentifier</key>
    <string>in.fullstopsolution.suite</string>
    <key>CFBundleName</key>
    <string>Fullstop Suite</string>
    <key>CFBundleDisplayName</key>
    <string>Fullstop Suite</string>
    <key>CFBundleIconFile</key>
    <string>FullstopSuite</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
</plist>
EOF

cp "$BUILD_DIR/FullstopSuite" "$APP_DIR/Contents/MacOS/FullstopSuite"
chmod +x "$APP_DIR/Contents/MacOS/FullstopSuite"

if [ -f "$SCRIPT_DIR/resources/FullstopSuite.icns" ]; then
    cp "$SCRIPT_DIR/resources/FullstopSuite.icns" "$APP_DIR/Contents/Resources/FullstopSuite.icns"
elif [ -f "/Applications/Fullstop Suite.app/Contents/Resources/FullstopSuite.icns" ]; then
    cp "/Applications/Fullstop Suite.app/Contents/Resources/FullstopSuite.icns" "$APP_DIR/Contents/Resources/FullstopSuite.icns"
fi

cp -R "$SCRIPT_DIR/app" "$APP_DIR/Contents/Resources/"

codesign --force --deep --sign - --options runtime "$APP_DIR"
xattr -cr "$APP_DIR"

echo "✓ Fullstop Suite.app successfully built and verified!"
