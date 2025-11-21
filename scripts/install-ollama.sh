#!/bin/bash

# Script to install Ollama and download the AI model

echo "======================================"
echo "Buddy - Ollama Installation Script"
echo "======================================"
echo ""

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed!"
    ollama --version
    echo ""
else
    echo "📥 Ollama not found. Please install it manually:"
    echo ""
    echo "1. Visit: https://ollama.ai"
    echo "2. Download Ollama for macOS"
    echo "3. Install the .dmg file"
    echo "4. Run this script again"
    echo ""
    exit 1
fi

# Check if Ollama is running
echo "🔍 Checking if Ollama is running..."
if curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo "✅ Ollama is running!"
else
    echo "⚠️  Ollama is not running. Starting Ollama..."
    echo "   (Ollama should auto-start after installation)"
    echo ""
fi

echo ""
echo "======================================"
echo "Downloading AI Model"
echo "======================================"
echo ""
echo "Choose a model:"
echo "1. Llama 3.2 (3B) - Recommended (2GB, faster)"
echo "2. Llama 3 (8B) - More powerful (4.7GB, better quality)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        MODEL="llama3.2"
        echo ""
        echo "📥 Downloading Llama 3.2 (3B)..."
        echo "   This will take 5-10 minutes depending on your internet speed."
        ollama pull llama3.2
        ;;
    2)
        MODEL="llama3"
        echo ""
        echo "📥 Downloading Llama 3 (8B)..."
        echo "   This will take 10-15 minutes depending on your internet speed."
        ollama pull llama3
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "Testing Model"
echo "======================================"
echo ""
echo "🧪 Testing $MODEL..."
echo ""

ollama run $MODEL "Say 'Hello, Buddy is ready!'" --verbose

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "Your model: $MODEL"
echo "Ollama host: http://localhost:11434"
echo ""

