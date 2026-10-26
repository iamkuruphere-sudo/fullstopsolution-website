#!/usr/bin/env bash
# ==============================================================================
# FULLSTOP SOLUTION - AUTOMATED MULTI-TARGET DEPLOYMENT SCRIPT
# Domain: www.fullstopsolution.in
# ==============================================================================

set -e

PROJECT_DIR="/Users/kuruphere/.gemini/antigravity/scratch/fullstopsolution-website"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🚀 Fullstop Solution (www.fullstopsolution.in) Deployer"
echo "=========================================================="

# 1. Ensure Git commit is clean and up to date
echo "[1/4] Checking repository state..."
if [ -d ".git" ]; then
  git add .
  if ! git diff-index --quiet HEAD --; then
    git commit -m "Automated update: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    echo "✓ New changes committed to Git."
  else
    echo "✓ Repository working tree clean."
  fi
fi

# 2. Package production zip for direct cPanel / Hostinger upload
echo "[2/4] Generating production distribution zip..."
zip -q -r "fullstopsolution-production.zip" . -x "*.git*" "*.DS_Store*" "fullstopsolution-production.zip"
echo "✓ Generated: fullstopsolution-production.zip"

# 3. Target Deployment
TARGET="${1:-all}"

case "$TARGET" in
  github)
    echo "[3/4] Deploying to GitHub..."
    if ! gh auth status &>/dev/null; then
      echo "Notice: Logging into GitHub..."
      gh auth login
    fi
    gh repo create "fullstopsolution-website" --public --source=. --push || git push -u origin main
    echo "✓ GitHub Pages pipeline triggered!"
    ;;

  vercel)
    echo "[3/4] Deploying to Vercel..."
    npx --yes vercel --prod --yes
    ;;

  netlify)
    echo "[3/4] Deploying to Netlify..."
    npx --yes netlify deploy --prod --dir=.
    ;;

  cloudflare)
    echo "[3/4] Deploying to Cloudflare Pages..."
    npx --yes wrangler pages deploy . --project-name="fullstopsolution"
    ;;

  *)
    echo "[3/4] Ready for deployment!"
    echo "Options: ./deploy.sh github | ./deploy.sh vercel | ./deploy.sh netlify | ./deploy.sh cloudflare"
    ;;
esac

echo "=========================================================="
echo "🎉 Deployment package ready for www.fullstopsolution.in"
echo "=========================================================="
