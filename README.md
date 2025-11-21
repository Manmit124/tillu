# Tillu - Your Personal AI Assistant

> **"Your AI companion that truly knows you"**

Tillu is a 100% local, privacy-first AI assistant that permanently remembers everything about you. Built for anyone who values privacy and wants a truly personalized AI experience without compromising their data.

## 🎯 What Tillu Does

- **Remembers Everything**: Your resume, skills, contact information, preferences - stored locally forever
- **Intelligent Conversations**: Answers questions using YOUR personal context and information
- **Personalized Responses**: Generates content tailored to your experience and writing style
- **100% Private**: All data stays on your machine, AI runs locally with no cloud dependency
- **Semantic Search**: Understands meaning, not just keywords - finds relevant information intelligently

## ✨ Key Features

### 🔒 Privacy First
- **Zero Cloud Dependency**: Everything runs on your local machine
- **No Data Transmission**: Your information never leaves your computer
- **Open Source**: Audit the code yourself - complete transparency
- **You Own Your Data**: Full control over your personal information

### 🧠 Intelligent Context
- **Semantic Understanding**: Finds relevant information based on meaning
- **RAG (Retrieval-Augmented Generation)**: AI responses grounded in your actual data
- **Vector Search**: Fast, accurate retrieval of contextual information
- **Persistent Memory**: Never repeat yourself - Tillu remembers

### ⚡ Performance
- **Fast Responses**: < 3 seconds for most queries
- **Efficient Search**: < 100ms semantic search
- **Lightweight**: Runs smoothly on modern hardware
- **Local Processing**: No network latency

## 🚀 Quick Start


### Installation

```bash
# 1. Clone the repository
git clone git@github.com:Manmit124/tillu.git
cd tillu

# 2. Install Ollama (Local AI Runtime)
# Download from https://ollama.ai and install
# Or use the provided script:
./scripts/install-ollama.sh

# 3. Download AI model
ollama pull llama3.2

# 4. Install backend dependencies
cd backend
npm install

# 5. Set up your personal data
# Edit files in data/personal/ with your information:
# - basic.json (name, contact, location)
# - professional.json (LinkedIn, GitHub, portfolio)
# - preferences.json (job preferences, interests)

# 6. Ingest your data into the vector database
npm run ingest

# 7. Start the backend server
npm run dev
```



## 📚 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Your Computer                      │
│                                                      │
│  ┌──────────────┐      ┌─────────────────────────┐ │
│  │   Frontend   │◄────►│   Backend Server        │ │
│  │  (Coming     │      │   (Node.js/Express)     │ │
│  │   Soon)      │      │                         │ │
│  └──────────────┘      │  ┌──────────────────┐   │ │
│                        │  │  RAG Pipeline    │   │ │
│                        │  │  - Semantic      │   │ │
│                        │  │    Search        │   │ │
│                        │  │  - Context       │   │ │
│                        │  │    Building      │   │ │
│                        │  │  - Response      │   │ │
│                        │  │    Generation    │   │ │
│                        │  └──────────────────┘   │ │
│                        │                         │ │
│                        │  ┌──────────────────┐   │ │
│                        │  │  Vector Database │   │ │
│                        │  │  (SQLite + vss)  │   │ │
│                        │  └──────────────────┘   │ │
│                        └─────────────────────────┘ │
│                                 │                   │
│                                 ▼                   │
│                        ┌─────────────────────────┐ │
│                        │   Ollama (Local AI)     │ │
│                        │   - Llama 3.2 Model     │ │
│                        │   - Embeddings          │ │
│                        └─────────────────────────┘ │
│                                                      │
│  All processing happens locally   │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend
- **Node.js + Express**: Fast, lightweight API server
- **TypeScript**: Type-safe development
- **SQLite + sqlite-vss**: Vector similarity search
- **Transformers.js**: Local embeddings (all-MiniLM-L6-v2)
- **Ollama**: Local AI model runtime

#### AI Layer
- **Llama 3.2 (3B)**: Fast, efficient language model
- **RAG Pipeline**: Retrieval-Augmented Generation
- **Semantic Search**: 384-dimensional vector embeddings
- **Context Building**: Intelligent information retrieval

#### Frontend (Coming Soon)
- Chrome Extension for browser integration
- React + TypeScript for UI
- TailwindCSS for styling

## 🎯 Use Cases

### Personal Knowledge Base
- Store and retrieve your personal information instantly
- Never forget important details about yourself
- Quick access to your resume, skills, and experience

### Job Applications (Planned)
- Auto-fill job application forms
- Generate personalized cover letters
- Answer job-specific questions using your experience

### Personal Assistant
- Answer questions about yourself
- Maintain context across conversations
- Learn and adapt to your preferences

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation instructions
- **[Implementation Plan](docs/PLAN.md)** - Complete development roadmap
- **[Vector Storage](docs/VECTOR-STORAGE.md)** - How semantic search works
- **[API Documentation](docs/IMPLEMENTATION-SUMMARY.md)** - API endpoints and usage



## 🔐 Privacy & Security

### What We Collect
**Nothing.** Tillu doesn't collect, transmit, or store any data externally. All your personal information stays on your machine.

### Where Your Data Lives
- **Local SQLite Database**: `data/buddy.db`
- **Personal Files**: `data/personal/*.json`
- **Vector Embeddings**: Generated and stored locally

### Internet Usage
- **Setup Only**: Internet required to download AI models (~2GB) and dependencies
- **After Setup**: All processing happens locally - your data and conversations stay on your machine
- **No Cloud Services**: Unlike ChatGPT or other cloud AI, your information never gets sent to external servers

### Local Processing
After initial setup (which requires internet to download models), all AI processing happens on your machine. Your conversations and personal data never leave your computer.

### Open Source
Audit the entire codebase. No hidden telemetry, no analytics, no tracking.

## 🚧 Current Status

### ✅ Completed (Phase 1 & 2)
- [x] Backend server with Express
- [x] Ollama integration
- [x] Vector database (SQLite + vss)
- [x] Local embeddings (Transformers.js)
- [x] Semantic search
- [x] RAG pipeline
- [x] Data ingestion
- [x] API endpoints
- [x] Documentation

### 🚀 Coming Soon (Phase 3+)
- [ ] Chrome extension
- [ ] Browser integration
- [ ] Form auto-fill
- [ ] Cover letter generation
- [ ] Multi-resume support
- [ ] Job tracking
- [ ] UI improvements

## 🤝 Contributing

Contributions are welcome! This is an open-source project built for privacy-conscious individuals.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute this software. No attribution required, though appreciated!

## 🙏 Acknowledgments

Built with:
- [Ollama](https://ollama.ai) - Local AI runtime
- [Transformers.js](https://huggingface.co/docs/transformers.js) - Local embeddings
- [sqlite-vss](https://github.com/asg017/sqlite-vss) - Vector similarity search
- [LangChain](https://js.langchain.com/) - RAG framework inspiration

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Manmit124/tillu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Manmit124/tillu/discussions)

## 🌟 Why Tillu?

In a world where AI assistants send your data to the cloud, Tillu takes a different approach:

- **Your data is yours** - No company has access to your personal information
- **Privacy by design** - Built from the ground up with privacy as the core principle
- **Truly personalized** - AI that knows YOU, not generic responses
- **Open and transparent** - Audit every line of code
- **No subscription** - Free forever, runs on your hardware

---

**Built with ❤️ for privacy-conscious individuals who want a truly personal AI assistant.**

*Note: Tillu is currently in active development. Phase 1 & 2 are complete. Chrome extension and advanced features coming soon!*
