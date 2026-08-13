#!/bin/bash

# Survival Preparedness Strategist — Environment Setup Script
# This script sets up the development environment for the project

set -e  # Exit on error

echo "🚀 Setting up Survival Preparedness Strategist environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp config/.env.example .env
    echo "✅ .env file created. Please configure it with your settings."
else
    echo "✅ .env file already exists"
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Create cache directory
mkdir -p .cache
echo "✅ Cache directory created"

# Install development dependencies if package.json exists
if [ -f package.json ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "ℹ️  No package.json found, skipping dependency installation"
fi

# Set up Git hooks if .git directory exists
if [ -d .git ]; then
    echo "🪝 Setting up Git hooks..."
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run linting and tests before commit
echo "Running pre-commit checks..."
npm run lint || true
npm run test || true
echo "Pre-commit checks complete"
EOF
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks set up"
fi

# Create development tracking
mkdir -p .development
echo "✅ Development tracking directory created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in .env"
echo "2. Run 'npm run dev' to start development server (if available)"
echo "3. Run 'npm test' to run tests"
echo ""
echo "📚 For more information, see README.md"
