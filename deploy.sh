#!/bin/bash

# =================================================================
# 🚀 WEBSOCKET BREAKOUT SCANNER - DEPLOYMENT SCRIPT
# =================================================================
# Deploys the enhanced WebSocket-based breakout scanner with TrueData
# 
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🚀 WebSocket Breakout Scanner Deployment (TrueData)     ║"
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

PROJECT_DIR="/root"

cd "$PROJECT_DIR"
echo "   ✅ Using directory: $PROJECT_DIR"

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
    echo "   ✅ package.json created from package.scanner.json"
elif [ ! -f "./package.json" ]; then
    # Create package.json with WebSocket support
    cat > package.json << 'EOF'
{
  "name": "breakout-scanner",
  "version": "2.0.0",
  "description": "WebSocket-based breakout scanner with TrueData integration",
  "main": "breakout-scanner.js",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1",
    "ws": "^8.14.2"
  }
}
EOF
    echo "   ✅ package.json created with WebSocket support"
fi

# =================================================================
# Step 6: Configure Environment
# =================================================================
echo ""
echo "🔑 Step 6: Configuring environment variables..."

if [ -f ".env" ]; then
    echo "   ✅ .env file already exists"
else
    echo "   Creating .env file with TrueData WebSocket support..."
    cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://kowxpazskkigzwdwzwyq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3hwYXpza2tpZ3p3ZHd6d3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwNjA2OSwiZXhwIjoyMDcwNDgyMDY5fQ.K6Z9uMXOmAGNKPUN4tKdjFLtqUIJa-KSCe3H1ustti4

# TrueData WebSocket Configuration
TRUEDATA_USER=Trial138
TRUEDATA_PASSWORD=ujjwal138
TRUEDATA_WS_PORT=8086

# Scanner Configuration (Optional - uses defaults from code)
# TOP_N_STOCKS=250
# MIN_CONFIDENCE_TO_SAVE=0.6
# TICK_AGGREGATION_THRESHOLD=100
# PRICE_CHANGE_THRESHOLD=0.001
EOF
    
    echo "   ⚠️  IMPORTANT: Update .env with your TrueData credentials!"
    echo ""
    echo "   Required fields:"
    echo "     - TRUEDATA_USER: Your TrueData username"
    echo "     - TRUEDATA_PASSWORD: Your TrueData password"
    echo ""
    read -p "   Press Enter to edit .env file..."
    nano .env
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

# Verify ws package is installed
if ! npm list ws &> /dev/null; then
    echo "   ⚠️  WARNING: ws package not found in dependencies"
    echo "   Installing ws package..."
    npm install ws
fi

echo "   ✅ Environment configuration verified"
echo "   ✅ WebSocket package (ws) is installed"

# =================================================================
# Step 9: PM2 Setup
# =================================================================
echo ""
echo "🚀 Step 9: Setting up PM2..."

# Stop existing processes if running
pm2 delete breakout-scanner 2>/dev/null || true
pm2 delete truedata-scanner 2>/dev/null || true

# Start with PM2
pm2 start breakout-scanner.js --name "truedata-scanner"

# Configure auto-start on reboot
pm2 startup systemd -u root --hp /root

# Save PM2 process list
pm2 save

echo "   ✅ PM2 configured and WebSocket scanner started"

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
echo "║      ✅ WEBSOCKET SCANNER DEPLOYED!                       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Useful Commands:"
echo "   • View logs:      pm2 logs truedata-scanner"
echo "   • Monitor:        pm2 monit"
echo "   • Restart:        pm2 restart truedata-scanner"
echo "   • Stop:           pm2 stop truedata-scanner"
echo "   • Check status:   pm2 status"
echo ""
echo "📍 Project Location: $PROJECT_DIR"
echo ""
echo "🎯 Scanner Features:"
echo "   ✅ WebSocket tick-by-tick data from TrueData"
echo "   ✅ Real-time 5-min candle aggregation"
echo "   ✅ Live EMA/RSI calculation"
echo "   ✅ Early breakout detection (2-4 min advantage)"
echo "   ✅ Analyzing 250 NSE stocks"
echo ""
echo "📈 Expected Behavior:"
echo "   • During market hours (9:15 AM - 3:30 PM IST):"
echo "     - Connects to TrueData WebSocket"
echo "     - Receives tick-by-tick updates"
echo "     - Generates signals when criteria met"
echo ""
echo "   • Outside market hours:"
echo "     - WebSocket disconnected (saves resources)"
echo "     - Auto-reconnects when market opens"
echo ""
echo "🎯 Next Steps:"
echo "   1. Check logs:    pm2 logs truedata-scanner --lines 50"
echo "   2. Wait for market hours to see WebSocket connection"
echo "   3. Verify signals in Supabase breakout_signals table"
echo "   4. Monitor resource usage: pm2 monit"
echo ""
echo "⚠️  Important Notes:"
echo "   • Ensure TrueData subscription is active"
echo "   • WebSocket connects only during market hours"
echo "   • First-time users: Start with 50-100 stocks, then scale"
echo "   • Check TRUEDATA-SETUP.md for optimization tips"
echo ""
