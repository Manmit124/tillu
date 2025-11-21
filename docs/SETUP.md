# Buddy Setup Guide

## Prerequisites

Before you begin, make sure you have:

- **macOS 11+** (Buddy is optimized for Apple Silicon)
- **Node.js 18+** (check with `node --version`)
- **16GB RAM** (8GB minimum)
- **5-6GB free disk space**
- **Chrome Browser**

## Step 1: Install Ollama

Ollama is the local AI runtime that powers Buddy.

1. Visit [https://ollama.ai](https://ollama.ai)
2. Download Ollama for macOS
3. Open the downloaded `.dmg` file
4. Drag Ollama to your Applications folder
5. Open Ollama (it will appear in your menu bar)

**Verify installation:**
```bash
ollama --version
```

## Step 2: Download AI Model

Choose one of these models:

### Option A: Llama 3.2 (3B) - Recommended
Smaller, faster, good for most tasks. Uses ~4GB RAM.

```bash
ollama pull llama3.2
```

### Option B: Llama 3 (8B) - More Powerful
Better writing quality. Uses ~7GB RAM.

```bash
ollama pull llama3
```

**Test the model:**
```bash
ollama run llama3.2 "Say hello"
```

## Step 3: Setup Backend

1. Navigate to the backend folder:
```bash
cd /Users/manmit/Dev/idea/buddy/backend
```

2. Install dependencies:
```bash
npm install
```

3. Verify the `.env` file exists and has correct settings:
```bash
cat .env
```

Should show:
```
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

4. Start the backend server:
```bash
npm run dev
```

You should see:
```
🚀 Buddy Backend Server Started!
================================
📍 Server: http://localhost:3000
🤖 Ollama: http://localhost:11434
🧠 Model: llama3.2
```

## Step 4: Test the Backend

Open a new terminal and test the endpoints:

**Health check:**
```bash
curl http://localhost:3000/health
```

**Test Ollama connection:**
```bash
curl http://localhost:3000/api/test
```

**Test chat:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your name?"}'
```

## Troubleshooting

### Ollama not running
```bash
# Check if Ollama is running
curl http://localhost:11434

# If not, open Ollama from Applications
```

### Model not found
```bash
# List installed models
ollama list

# Pull the model if missing
ollama pull llama3.2
```

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or change PORT in .env
```

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Once the backend is running successfully:
1. Proceed to Phase 2: Data Storage & RAG
2. Add your personal information
3. Build the Chrome extension

## Quick Start Script

For convenience, use the provided script:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Install Ollama and model
./scripts/install-ollama.sh

# Start development environment
./scripts/start-dev.sh
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Verify all prerequisites are met
4. Check that Ollama is running in the menu bar

