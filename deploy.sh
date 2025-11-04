#!/bin/bash

# =================================================================
# 🚀 BREAKOUT SCANNER - QUICK DEPLOYMENT SCRIPT
# =================================================================
# Run this script on your DigitalOcean droplet to set up everything
# 
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      🚀 Breakout Scanner Deployment Script                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# =================================================================
# Step 1: System Update
# =================================================================
echo "📦 Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# =================================================================
# Step 2: Install Node.js
# =================================================================
echo ""
echo "📦 Step 2: Installing Node.js 18.x..."

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js already installed: $NODE_VERSION"
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
    sudo apt install -y nodejs
    echo "   ✅ Node.js installed: $(node --version)"
fi

# =================================================================
# Step 3: Install PM2
# =================================================================
echo ""
echo "📦 Step 3: Installing PM2..."

if command -v pm2 &> /dev/null; then
    echo "   ✅ PM2 already installed: $(pm2 --version)"
else
    sudo npm install -g pm2
    echo "   ✅ PM2 installed: $(pm2 --version)"
fi

# =================================================================
# Step 4: Create Project Directory
# =================================================================
echo ""
echo "📁 Step 4: Setting up project directory..."

PROJECT_DIR="/root/breakout-scanner"

if [ -d "$PROJECT_DIR" ]; then
    echo "   ⚠️  Directory already exists: $PROJECT_DIR"
    read -p "   Do you want to overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
        mkdir -p "$PROJECT_DIR"
    fi
else
    mkdir -p "$PROJECT_DIR"
    echo "   ✅ Created directory: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# =================================================================
# Step 5: Copy Files
# =================================================================
echo ""
echo "📄 Step 5: Copying scanner files..."

# Check if breakout-scanner.js exists in current directory
if [ -f "./breakout-scanner.js" ]; then
    echo "   ✅ breakout-scanner.js found"
else
    echo "   ❌ ERROR: breakout-scanner.js not found!"
    echo "   Please upload breakout-scanner.js to $(pwd)"
    exit 1
fi

# Copy package.json if exists
if [ -f "./package.scanner.json" ]; then
    cp package.scanner.json package.json
    echo "   ✅ package.json created"
elif [ ! -f "./package.json" ]; then
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "breakout-scanner",
  "version": "1.0.0",
  "main": "breakout-scanner.js",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "dotenv": "^16.3.1"
  }
}
EOF
    echo "   ✅ package.json created"
fi

# =================================================================
# Step 6: Configure Environment
# =================================================================
echo ""
echo "🔑 Step 6: Configuring environment variables..."

if [ -f ".env" ]; then
    echo "   ✅ .env file already exists"
else
    echo "   Creating .env file..."
    cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Scanner Configuration
SCAN_INTERVAL_MS=30000
BATCH_SIZE=10
TOP_N_STOCKS=250
MIN_CONFIDENCE_TO_SAVE=0.60
EOF
    
    echo "   ⚠️  Please edit .env file with your Supabase credentials:"
    echo "   nano .env"
    echo ""
    read -p "   Press Enter after editing .env file..."
fi

# Set proper permissions
chmod 600 .env
echo "   ✅ .env permissions set to 600"

# =================================================================
# Step 7: Install Dependencies
# =================================================================
echo ""
echo "📦 Step 7: Installing npm dependencies..."
npm install
echo "   ✅ Dependencies installed"

# =================================================================
# Step 8: Test Configuration
# =================================================================
echo ""
echo "🧪 Step 8: Testing configuration..."

# Test environment variables
if grep -q "your-project.supabase.co" .env; then
    echo "   ⚠️  WARNING: .env file still has default values!"
    echo "   Please update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "   ✅ Environment configuration looks good"

# =================================================================
# Step 9: PM2 Setup
# =================================================================
echo ""
echo "🚀 Step 9: Setting up PM2..."

# Stop existing process if running
pm2 delete breakout-scanner 2>/dev/null || true

# Start with PM2
pm2 start breakout-scanner.js --name "breakout-scanner"

# Configure auto-start on reboot
pm2 startup systemd -u root --hp /root

# Save PM2 process list
pm2 save

echo "   ✅ PM2 configured and scanner started"

# =================================================================
# Step 10: Verify Deployment
# =================================================================
echo ""
echo "✅ Step 10: Verifying deployment..."

sleep 3

pm2 status

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      ✅ DEPLOYMENT COMPLETE!                              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Useful Commands:"
echo "   • View logs:      pm2 logs breakout-scanner"
echo "   • Monitor:        pm2 monit"
echo "   • Restart:        pm2 restart breakout-scanner"
echo "   • Stop:           pm2 stop breakout-scanner"
echo ""
echo "📍 Project Location: $PROJECT_DIR"
echo ""
echo "🎯 Next Steps:"
echo "   1. Check logs: pm2 logs breakout-scanner"
echo "   2. Verify signals in Supabase breakout_signals table"
echo "   3. Monitor for 1-2 days to ensure stability"
echo ""
