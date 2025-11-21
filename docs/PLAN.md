# Buddy - Detailed Implementation Plan

## Project Overview

Building a 100% local, privacy-first AI assistant that permanently remembers everything about Manmit Tiwade. No more repeating information, no more manual form filling, no more generic AI responses.

---

## Phase 1: Foundation Setup (Day 1 - 30 minutes)

### Goal

Get Ollama running locally and create the basic project structure with a working Node.js backend that can communicate with the AI.

### What We're Building

- Local AI runtime (Ollama) with Llama model
- Basic Node.js/Express backend server
- Project folder structure
- Test connection between backend and Ollama

### Tech Stack & Why

**Ollama (Local AI Runtime)**

- WHY: Runs AI models locally on your Mac, 100% private
- WHY NOT cloud APIs: Your data never leaves your computer
- ALTERNATIVE: Could use OpenAI API but sacrifices privacy
- SIZE: ~500MB installation + 2-4GB for model

**Llama 3.2 (3B parameters) or Llama 3 (8B)**

- WHY: Open source, runs fast on Apple Silicon
- WHY 3B: Smaller, faster, good for most tasks (2GB)
- WHY 8B: More powerful, better writing quality (4.7GB)
- ALTERNATIVE: Mistral 7B (similar to Llama 8B)

**Node.js + Express (Backend)**

- WHY: You know it (full stack dev), fast to build
- WHY: JavaScript/TypeScript everywhere (backend + extension)
- WHY Express: Simple, lightweight, perfect for local API
- ALTERNATIVE: Could use Python/FastAPI but adds language complexity

**TypeScript**

- WHY: Type safety, better IDE support, fewer bugs
- WHY: Same language for backend and Chrome extension
- ALTERNATIVE: Plain JavaScript but loses type safety

### Step-by-Step Implementation

**Step 1.1: Install Ollama**

- Download Ollama for macOS from ollama.ai
- Install the .dmg file (drag to Applications)
- Verify installation by opening Terminal
- Check Ollama is running (it auto-starts)
- RESULT: Ollama icon appears in menu bar

**Step 1.2: Download AI Model**

- Open Terminal
- Run command to download Llama 3.2 (3B) - takes 5-10 minutes
- Model downloads to ~/.ollama/models/
- Test the model works by sending a test prompt
- RESULT: AI responds to "Hello, who are you?"

**Step 1.3: Create Project Structure**

- Navigate to /Users/manmit/Dev/idea/buddy/
- Create main folders: backend/, extension/, data/, scripts/, docs/
- Create .gitignore to exclude node_modules and data/
- Create README.md with project description
- RESULT: Clean project structure ready for code

**Step 1.4: Initialize Backend**

- Navigate to backend/ folder
- Initialize npm project (creates package.json)
- Install dependencies: express, cors, dotenv
- Install dev dependencies: typescript, ts-node, nodemon, @types packages
- Create tsconfig.json for TypeScript configuration
- RESULT: Backend ready to write code

**Step 1.5: Create Basic Server**

- Create src/server.ts file
- Set up Express app with basic routes
- Add /health endpoint to check server is running
- Add /api/test endpoint to test Ollama connection
- Configure CORS for Chrome extension
- RESULT: Server starts on http://localhost:3000

**Step 1.6: Connect to Ollama**

- Install ollama package for Node.js
- Create src/services/ollama.ts
- Write function to send prompts to Ollama
- Test with simple prompt: "Say hello"
- Add error handling for when Ollama isn't running
- RESULT: Backend can talk to Ollama AI

**Step 1.7: Test End-to-End**

- Start Ollama (if not running)
- Start backend server with npm run dev
- Send HTTP request to /api/test
- Verify AI response comes back
- Check response time (should be 1-3 seconds)
- RESULT: Complete pipeline working

### Folder Structure After Phase 1

```
buddy/
├── .gitignore
├── README.md
├── PLAN.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── src/
│   │   ├── server.ts          # Express server setup
│   │   ├── config.ts          # Configuration (port, Ollama URL)
│   │   └── services/
│   │       └── ollama.ts      # Ollama integration
│   └── node_modules/
│
├── data/                      # Empty for now, will store your info
├── scripts/                   # Empty for now
└── docs/                      # Empty for now
```

### Success Criteria

- Ollama running and accessible
- Backend server starts without errors
- Can send prompt to Ollama and get response
- Response time under 5 seconds
- No data sent to internet (verify with network monitor)

---

## Phase 2: Data Storage & RAG System (Day 2-3 - 2-3 hours)

### Goal

Store Manmit's personal information in a vector database and implement RAG (Retrieval-Augmented Generation) so the AI can find and use relevant information.

### What We're Building

- Vector database to store your data as embeddings
- Data ingestion pipeline (upload resume, parse, store)
- Semantic search (find relevant info based on meaning)
- RAG pipeline (retrieve context + generate response)
- API endpoints to store and search data

### Tech Stack & Why

**ChromaDB (Vector Database)**

- WHY: Lightweight, runs locally, no external service
- WHY: Built for embeddings and semantic search
- WHY: JavaScript/TypeScript support via chromadb package
- ALTERNATIVE: Pinecone (cloud, costs money), Weaviate (heavier)
- SIZE: ~100MB for your personal data

**LangChain.js (RAG Framework)**

- WHY: Industry standard for building RAG applications
- WHY: Handles chunking, embeddings, retrieval automatically
- WHY: Works with Ollama and ChromaDB out of the box
- ALTERNATIVE: Build from scratch (too much work), LlamaIndex (Python-focused)

**nomic-embed-text (Embedding Model)**

- WHY: Small, fast, runs locally via Ollama
- WHY: Designed for semantic search
- WHY: Free and open source
- SIZE: ~274MB

**pdf-parse (PDF Parser)**

- WHY: Extract text from resume PDFs
- WHY: Simple, no external dependencies
- ALTERNATIVE: pdfjs (heavier), manual copy-paste (tedious)

### Step-by-Step Implementation

**Step 2.1: Install Dependencies**

- Install chromadb package for vector database
- Install langchain package for RAG
- Install pdf-parse for reading PDFs
- Install uuid for generating IDs
- RESULT: All tools ready for data storage

**Step 2.2: Set Up ChromaDB**

- Create src/services/vectorDB.ts
- Initialize ChromaDB client (local mode)
- Create collection called "manmit_context"
- Configure to use Ollama embeddings
- Test: Store simple text and retrieve it
- RESULT: Vector database working locally

**Step 2.3: Create Data Schemas**

- Create data/personal/basic.json for name, address, email, phone
- Create data/personal/professional.json for LinkedIn, GitHub
- Create data/personal/preferences.json for job preferences
- Define TypeScript interfaces in src/types/index.ts
- RESULT: Structured way to store your info

**Step 2.4: Build Data Ingestion**

- Create src/services/dataManager.ts
- Write function to read JSON files from data/ folder
- Write function to parse PDF resume
- Chunk text into smaller pieces (500 characters each)
- Generate embeddings for each chunk
- Store in ChromaDB with metadata
- RESULT: Can upload your data to vector DB

**Step 2.5: Implement Semantic Search**

- Create src/services/search.ts
- Write function to search ChromaDB by query
- Convert query to embedding
- Find top 5 most relevant chunks
- Return results with similarity scores
- Test: "What's my email?" should find email from data
- RESULT: Can search your data by meaning

**Step 2.6: Build RAG Pipeline**

- Create src/services/rag.ts
- Step 1: Analyze user query (what info is needed?)
- Step 2: Search vector DB for relevant context
- Step 3: Build prompt with context + query
- Step 4: Send to Ollama for generation
- Step 5: Return AI response
- RESULT: AI answers using YOUR data

**Step 2.7: Create API Endpoints**

- POST /api/store - Upload new data
- POST /api/search - Search for information
- POST /api/chat - Chat with Buddy (uses RAG)
- GET /api/data - List all stored data
- DELETE /api/data/:id - Remove data
- RESULT: Backend API complete

**Step 2.8: Add Your Personal Data**

- Create data/personal/basic.json with your name, address, email, phone
- Create data/resumes/developer.pdf (your actual resume)
- Run ingestion script to load into vector DB
- Test search: "What's my name?" → "Manmit Tiwade"
- Test search: "What are my skills?" → Lists from resume
- RESULT: Buddy knows about you

### Folder Structure After Phase 2

```
buddy/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── config.ts
│   │   ├── routes/
│   │   │   ├── chat.ts        # POST /api/chat
│   │   │   ├── store.ts       # POST /api/store
│   │   │   └── search.ts      # POST /api/search
│   │   ├── services/
│   │   │   ├── ollama.ts      # Ollama integration
│   │   │   ├── vectorDB.ts    # ChromaDB operations
│   │   │   ├── rag.ts         # RAG pipeline
│   │   │   ├── dataManager.ts # Data CRUD
│   │   │   └── search.ts      # Semantic search
│   │   ├── utils/
│   │   │   ├── pdf.ts         # PDF parsing
│   │   │   └── embeddings.ts  # Generate embeddings
│   │   └── types/
│   │       └── index.ts       # TypeScript types
│   └── package.json
│
├── data/
│   ├── .gitignore             # NEVER commit this folder
│   ├── personal/
│   │   ├── basic.json         # Name, address, phone, email
│   │   ├── professional.json  # LinkedIn, GitHub, portfolio
│   │   └── preferences.json   # Job prefs, writing style
│   ├── resumes/
│   │   └── developer.pdf      # Your resume
│   └── vector-db/
│       └── chroma.sqlite3     # ChromaDB storage (auto-generated)
```

### Success Criteria

- Your personal data stored in vector database
- Search "What's my email?" returns correct email
- Search "What are my Node.js skills?" finds info from resume
- RAG pipeline returns contextual responses
- All data stored locally (check data/ folder)
- No internet requests (verify with network monitor)

---

## Phase 3: Chrome Extension - Basic (Day 4-5 - 2-3 hours)

### Goal

Build a Chrome extension that lives in your browser, provides a chat interface, and can communicate with the local backend.

### What We're Building

- Chrome extension with side panel UI
- Chat interface to talk with Buddy
- Background service worker (connects to backend)
- Content scripts (will read webpages)
- Settings page to manage data

### Tech Stack & Why

**Chrome Extension Manifest V3**

- WHY: Latest Chrome extension standard (V2 deprecated)
- WHY: Better security, service workers instead of background pages
- ALTERNATIVE: Firefox extension (different API), Safari extension (requires Swift)

**React (UI Framework)**

- WHY: You know it, fast to build UI
- WHY: Component-based, reusable
- WHY: Great for interactive chat interface
- ALTERNATIVE: Vue, Svelte, or vanilla JS

**Vite (Build Tool)**

- WHY: Fast development, hot reload
- WHY: Built-in TypeScript support
- WHY: Simple configuration for Chrome extensions
- ALTERNATIVE: Webpack (more complex), Rollup (manual setup)

**TailwindCSS (Styling)**

- WHY: Fast to style, utility-first
- WHY: No CSS files to manage
- WHY: Responsive by default
- ALTERNATIVE: CSS Modules, Styled Components, plain CSS

**Chrome APIs**

- chrome.sidePanel: For side panel UI
- chrome.tabs: To detect current webpage
- chrome.scripting: To inject content scripts
- chrome.storage: To save settings locally

### Step-by-Step Implementation

**Step 3.1: Initialize Extension Project**

- Create extension/ folder
- Initialize npm project
- Install React, Vite, TypeScript
- Install TailwindCSS
- Install Chrome types (@types/chrome)
- Configure Vite for Chrome extension build
- RESULT: Extension project ready

**Step 3.2: Create Manifest.json**

- Create public/manifest.json (Manifest V3)
- Define extension name, version, description
- Request permissions: sidePanel, activeTab, storage, scripting
- Define background service worker
- Define content scripts
- Set side panel default path
- RESULT: Chrome recognizes as valid extension

**Step 3.3: Build Side Panel UI**

- Create src/sidepanel/App.tsx (main component)
- Create header with Buddy logo and title
- Create chat interface (messages list + input box)
- Create settings button
- Style with TailwindCSS (modern, clean design)
- RESULT: Beautiful side panel UI

**Step 3.4: Implement Chat Interface**

- Create src/sidepanel/Chat.tsx component
- Display messages (user messages + Buddy responses)
- Add input field with send button
- Handle Enter key to send message
- Show loading indicator while waiting
- Auto-scroll to latest message
- RESULT: Can type and see messages

**Step 3.5: Create Background Service Worker**

- Create src/background/index.ts
- Listen for extension installation
- Set up side panel on extension icon click
- Create API client to connect to backend (http://localhost:3000)
- Handle messages from side panel
- RESULT: Extension can communicate with backend

**Step 3.6: Connect Chat to Backend**

- When user sends message, forward to background worker
- Background worker sends POST to /api/chat
- Receive AI response from backend
- Send response back to side panel
- Display in chat interface
- Handle errors (backend not running)
- RESULT: Can chat with Buddy in browser

**Step 3.7: Add Content Scripts**

- Create src/content/index.ts
- Inject into all web pages
- Add function to read page content (title, URL, text)
- Add function to detect input fields
- Listen for messages from background worker
- RESULT: Extension can see webpage content

**Step 3.8: Build and Load Extension**

- Run Vite build command
- Output goes to extension/dist/
- Open Chrome → chrome://extensions/
- Enable Developer mode
- Click "Load unpacked" → select dist/ folder
- Pin extension to toolbar
- RESULT: Buddy appears in Chrome

**Step 3.9: Test End-to-End**

- Start backend server (npm run dev in backend/)
- Click Buddy icon → side panel opens
- Type "What's my name?" in chat
- Buddy responds "Manmit Tiwade"
- Type "What are my skills?" → Lists from resume
- RESULT: Complete system working

### Folder Structure After Phase 3

```
buddy/
├── extension/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # TailwindCSS config
│   │
│   ├── public/
│   │   ├── manifest.json      # Extension manifest
│   │   ├── icons/
│   │   │   ├── icon16.png
│   │   │   ├── icon48.png
│   │   │   └── icon128.png
│   │   └── sidepanel.html     # Side panel HTML
│   │
│   ├── src/
│   │   ├── sidepanel/
│   │   │   ├── App.tsx        # Main UI component
│   │   │   ├── Chat.tsx       # Chat interface
│   │   │   ├── Settings.tsx   # Settings page
│   │   │   ├── index.tsx      # Entry point
│   │   │   └── styles.css     # Global styles
│   │   │
│   │   ├── background/
│   │   │   ├── index.ts       # Service worker
│   │   │   ├── api.ts         # Backend API client
│   │   │   └── storage.ts     # Chrome storage helpers
│   │   │
│   │   ├── content/
│   │   │   └── index.ts       # Content script (basic)
│   │   │
│   │   └── shared/
│   │       ├── types.ts       # Shared TypeScript types
│   │       └── constants.ts   # Constants
│   │
│   ├── dist/                  # Built extension (gitignored)
│   └── node_modules/
│
├── backend/                   # (from Phase 2)
└── data/                      # (from Phase 2)
```

### Success Criteria

- Extension loads in Chrome without errors
- Side panel opens when clicking icon
- Chat interface is responsive and looks good
- Can send message and receive AI response
- Response uses your personal data (name, skills)
- Backend connection works
- No console errors

---

## Phase 4: Form Detection & Auto-Fill (Day 6-8 - 3-4 hours)

### Goal

Make Buddy intelligent enough to detect forms on websites, understand what information is needed, and automatically fill them with your data.

### What We're Building

- Intelligent form detector (finds all input fields)
- Field classifier (determines what each field wants)
- Auto-fill engine (maps your data to fields)
- UI to preview and confirm before filling
- Support for common job sites (LinkedIn, Indeed, Greenhouse, Lever)

### Tech Stack & Why

**DOM Manipulation (Vanilla JS)**

- WHY: Direct access to webpage elements
- WHY: Fast, no library overhead
- WHY: Works on all websites
- ALTERNATIVE: jQuery (outdated), Puppeteer (for automation, not extensions)

**Field Detection Heuristics**

- WHY: Analyze field names, labels, placeholders, types
- WHY: Machine learning would be overkill and require training data
- ALTERNATIVE: AI to classify fields (slower, less reliable)

**MutationObserver API**

- WHY: Detect when forms appear dynamically (SPAs)
- WHY: Handle multi-step forms
- ALTERNATIVE: Polling (inefficient), manual refresh (bad UX)

### Step-by-Step Implementation

**Step 4.1: Build Form Detector**

- Enhance src/content/index.ts
- Create function to scan page for forms
- Find all input, textarea, select elements
- Group fields by parent form
- Detect dynamically loaded forms (MutationObserver)
- RESULT: Can find all forms on any page

**Step 4.2: Classify Field Types**

- Create src/content/fieldClassifier.ts
- Analyze field attributes (name, id, placeholder, type, autocomplete)
- Classify as: firstName, lastName, email, phone, address, city, state, zip, country, linkedin, github, resume, coverLetter, customText
- Use heuristics (e.g., name contains "email" → email field)
- Handle edge cases (different naming conventions)
- RESULT: Knows what each field wants

**Step 4.3: Create Field Mapping**

- Create src/content/fieldMapper.ts
- Map classified fields to your data
- firstName → "Manmit"
- lastName → "Tiwade"
- email → your email from data/personal/basic.json
- phone → your phone
- address → your full address
- linkedin → your LinkedIn URL
- RESULT: Can map your data to form fields

**Step 4.4: Build Auto-Fill Engine**

- Create src/content/formFiller.ts
- Function to fill text inputs (set value, trigger events)
- Function to select dropdowns (find matching option)
- Function to check checkboxes/radio buttons
- Function to upload files (resume PDF)
- Trigger change/input events (for React forms)
- RESULT: Can actually fill forms

**Step 4.5: Add UI Overlay**

- When form detected, show floating button "Fill with Buddy"
- Click button → show preview modal
- Preview shows: Field name → Value to fill
- Allow editing values before filling
- Add "Fill All" and "Fill Selected" buttons
- RESULT: User control over auto-fill

**Step 4.6: Handle Complex Forms**

- Detect multi-step forms (Next button)
- Save progress between steps
- Handle conditional fields (appear based on previous answers)
- Handle file uploads (resume, cover letter)
- Handle custom questions (use AI to generate answer)
- RESULT: Works on complex job applications

**Step 4.7: Add Smart Text Generation**

- For text areas (cover letter, "Why are you interested?")
- Send field label/placeholder to backend
- Backend uses RAG to generate personalized answer
- Uses your resume, skills, experience
- Insert generated text into field
- Allow editing before submitting
- RESULT: AI writes personalized responses

**Step 4.8: Test on Real Sites**

- Test on LinkedIn job application
- Test on Indeed application
- Test on Greenhouse (common ATS)
- Test on Lever (common ATS)
- Test on company career pages
- Fix site-specific issues
- RESULT: Works on major job sites

### Folder Structure After Phase 4

```
buddy/
├── extension/
│   ├── src/
│   │   ├── content/
│   │   │   ├── index.ts           # Main content script
│   │   │   ├── formDetector.ts    # Find forms on page
│   │   │   ├── fieldClassifier.ts # Classify field types
│   │   │   ├── fieldMapper.ts     # Map data to fields
│   │   │   ├── formFiller.ts      # Fill form fields
│   │   │   ├── ui.ts              # Overlay UI (button, modal)
│   │   │   └── sites/             # Site-specific handlers
│   │   │       ├── linkedin.ts
│   │   │       ├── indeed.ts
│   │   │       ├── greenhouse.ts
│   │   │       └── lever.ts
│   │   │
│   │   └── sidepanel/
│   │       └── FormPreview.tsx    # Preview form data
│   │
│   └── public/
│       └── content.css            # Styles for overlay UI
│
├── backend/
│   ├── src/
│   │   └── routes/
│   │       └── fill.ts            # POST /api/fill (get form data)
│   │       └── generate.ts        # POST /api/generate (text for fields)
```

### Success Criteria

- Buddy detects forms on LinkedIn, Indeed, Greenhouse
- Correctly classifies 90%+ of fields
- "Fill with Buddy" button appears
- Preview shows correct data mapping
- One click fills entire form
- Generated text (cover letter) is personalized
- Can edit values before submitting
- Works on multi-step forms

---

## Phase 5: AI Writing Assistant (Day 9-10 - 2-3 hours)

### Goal

Make Buddy an intelligent writing assistant that can generate personalized cover letters, answer job questions, and write emails using YOUR voice and experience.

### What We're Building

- Context-aware prompt builder
- Writing templates (cover letter, answers, emails)
- Job description analyzer
- Personalization engine (matches your skills to job)
- Multiple writing styles (formal, casual, technical)

### Tech Stack & Why

**Prompt Engineering**

- WHY: Quality of AI output depends on prompt quality
- WHY: Include relevant context from your data
- WHY: Structure prompts for consistent output
- TECHNIQUE: Few-shot learning (show examples)

**Job Description Parser**

- WHY: Extract key requirements from job posting
- WHY: Match your skills to their needs
- WHY: Personalize response to specific role
- ALTERNATIVE: Generic responses (not personalized)

### Step-by-Step Implementation

**Step 5.1: Create Prompt Templates**

- Create backend/src/prompts/ folder
- Create coverLetter.ts template
- Create jobQuestion.ts template (Why are you interested? Why good fit?)
- Create email.ts template (follow-up, thank you)
- Include placeholders for context
- RESULT: Reusable prompt structures

**Step 5.2: Build Job Description Analyzer**

- Create backend/src/services/jobAnalyzer.ts
- Extract key information: role title, required skills, company, responsibilities
- Identify keywords (Node.js, React, leadership, etc.)
- Determine seniority level
- Extract company values/culture
- RESULT: Structured job data

**Step 5.3: Create Skill Matcher**

- Create backend/src/services/skillMatcher.ts
- Compare job requirements to your skills
- Find matching experiences from your resume
- Rank relevance (which projects to mention)
- Generate talking points
- RESULT: Knows what to emphasize

**Step 5.4: Build Context Assembler**

- Create backend/src/services/contextBuilder.ts
- For cover letter: Include relevant experience, matching skills, company research
- For "Why interested?": Include career goals, company values alignment
- For "Why good fit?": Include specific matching skills and projects
- Retrieve from vector DB based on relevance
- RESULT: Perfect context for each writing task

**Step 5.5: Implement Writing Styles**

- Create data/preferences/writing-style.json
- Define tone: professional, friendly, technical, casual
- Define length: concise, detailed, balanced
- Define structure: paragraph style, bullet points
- Include do's and don'ts
- RESULT: AI writes in YOUR style

**Step 5.6: Add Writing Endpoints**

- POST /api/write/cover-letter (job URL or description)
- POST /api/write/answer (question text)
- POST /api/write/email (context, recipient, purpose)
- POST /api/write/custom (custom prompt)
- All use RAG + your writing style
- RESULT: Backend can generate any text

**Step 5.7: Integrate with Extension**

- Add "Generate Cover Letter" button in side panel
- Add "Answer This Question" for text areas
- Add "Write Email" for compose windows
- Show generated text in modal
- Allow editing before inserting
- Add "Regenerate" option
- RESULT: One-click writing in browser

**Step 5.8: Add Learning from Edits**

- Track what user edits in generated text
- Save successful applications (what worked)
- Learn preferred phrasing over time
- Improve future generations
- RESULT: Gets better with use

### Folder Structure After Phase 5

```
buddy/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── write.ts           # Writing endpoints
│   │   │
│   │   ├── services/
│   │   │   ├── jobAnalyzer.ts     # Parse job descriptions
│   │   │   ├── skillMatcher.ts    # Match skills to job
│   │   │   ├── contextBuilder.ts  # Assemble context
│   │   │   └── writer.ts          # Generate text
│   │   │
│   │   └── prompts/
│   │       ├── coverLetter.ts     # Cover letter template
│   │       ├── jobQuestion.ts     # Job question template
│   │       ├── email.ts           # Email template
│   │       └── custom.ts          # Custom prompt
│   │
│   └── data/
│       └── preferences/
│           └── writing-style.json # Your writing preferences
│
├── extension/
│   ├── src/
│   │   └── sidepanel/
│   │       ├── Writer.tsx         # Writing interface
│   │       ├── CoverLetter.tsx    # Cover letter generator
│   │       └── QuestionAnswer.tsx # Answer generator
```

### Success Criteria

- Generate cover letter that mentions YOUR specific projects
- Answer "Why interested?" with YOUR career goals
- Answer "Why good fit?" with YOUR matching skills
- Generated text sounds like YOU wrote it
- Can customize tone (more formal/casual)
- Can regenerate if not satisfied
- Editing improves future generations

---

## Phase 6: Polish & Advanced Features (Ongoing)

### Goal

Transform Buddy from a working prototype into a polished, production-ready personal assistant with advanced features.

### What We're Building

- Beautiful, intuitive UI
- Advanced features (multiple resumes, job tracking)
- Performance optimizations
- Error handling and recovery
- Documentation and tutorials

### Step-by-Step Implementation

**Step 6.1: UI/UX Improvements**

- Redesign side panel with modern UI
- Add dark mode support
- Add keyboard shortcuts (Cmd+K to open, Cmd+Enter to send)
- Add animations and transitions
- Improve loading states
- Add success/error notifications
- RESULT: Professional, polished interface

**Step 6.2: Multiple Resume Support**

- Allow uploading multiple resume versions
- Tag resumes (developer, manager, frontend, backend)
- Auto-select best resume based on job description
- Switch resume in settings
- RESULT: Different resume for different jobs

**Step 6.3: Job Application Tracking**

- Track where you applied (company, role, date)
- Track application status (applied, interview, rejected, offer)
- Show application history in side panel
- Add notes per application
- Export to CSV
- RESULT: Never lose track of applications

**Step 6.4: Advanced Context Features**

- Add project portfolio with descriptions
- Add custom Q&A (your own questions and answers)
- Add company research notes
- Add interview preparation
- RESULT: Comprehensive personal knowledge base

**Step 6.5: Performance Optimizations**

- Cache frequently used data
- Lazy load AI model (only when needed)
- Optimize vector search (index tuning)
- Reduce memory usage
- Faster response times
- RESULT: Snappy, responsive experience

**Step 6.6: Error Handling**

- Handle Ollama not running (show helpful message)
- Handle backend not running (auto-start or guide)
- Handle network errors gracefully
- Add retry logic
- Add fallback responses
- RESULT: Robust, reliable system

**Step 6.7: Data Management**

- Export all data (backup)
- Import data (restore)
- Delete specific data
- Clear all data (reset)
- Data encryption (optional)
- RESULT: Full control over your data

**Step 6.8: Documentation**

- Write setup guide (step-by-step with screenshots)
- Write usage guide (how to use each feature)
- Write troubleshooting guide (common issues)
- Create video tutorials
- Add in-app help
- RESULT: Easy for anyone to use

### Success Criteria

- UI looks professional and modern
- All features work reliably
- Fast response times (under 3 seconds)
- Comprehensive documentation
- Easy to set up and use
- Ready to share with others (optional)

---

## Technology Stack Summary

### Frontend (Chrome Extension)

- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- TailwindCSS - Styling
- Chrome Extension APIs - Browser integration

### Backend (Local Server)

- Node.js 18+ - Runtime
- Express - Web framework
- TypeScript - Type safety
- LangChain.js - RAG framework
- ChromaDB - Vector database
- pdf-parse - PDF parsing

### AI Layer

- Ollama - Local AI runtime
- Llama 3.2 (3B) or Llama 3 (8B) - Language model
- nomic-embed-text - Embedding model

### Development Tools

- npm - Package manager
- ts-node - TypeScript execution
- nodemon - Auto-restart server
- ESLint - Code linting
- Prettier - Code formatting

### Why This Stack

- 100% Local - Privacy first, no cloud
- JavaScript/TypeScript - One language everywhere
- Modern - Latest tools and best practices
- Proven - Battle-tested in production
- Fast - Optimized for development speed
- Flexible - Easy to extend and customize

---

## Complete Folder Structure

```
buddy/
├── README.md                      # Project overview
├── PLAN.md                        # This detailed plan
├── package.json                   # Root package (scripts)
├── .gitignore                     # Git ignore rules
│
├── extension/                     # Chrome Extension
│   ├── manifest.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   │
│   ├── public/
│   │   ├── manifest.json
│   │   ├── icons/
│   │   ├── sidepanel.html
│   │   └── content.css
│   │
│   ├── src/
│   │   ├── sidepanel/             # Side Panel UI
│   │   │   ├── App.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Writer.tsx
│   │   │   ├── FormPreview.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── content/               # Content Scripts
│   │   │   ├── index.ts
│   │   │   ├── formDetector.ts
│   │   │   ├── fieldClassifier.ts
│   │   │   ├── fieldMapper.ts
│   │   │   ├── formFiller.ts
│   │   │   ├── ui.ts
│   │   │   └── sites/
│   │   │
│   │   ├── background/            # Background Worker
│   │   │   ├── index.ts
│   │   │   ├── api.ts
│   │   │   └── storage.ts
│   │   │
│   │   └── shared/
│   │       ├── types.ts
│   │       └── constants.ts
│   │
│   └── dist/                      # Built extension
│
├── backend/                       # Local Server
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   │
│   ├── src/
│   │   ├── server.ts              # Express app
│   │   ├── config.ts
│   │   │
│   │   ├── routes/                # API Routes
│   │   │   ├── chat.ts
│   │   │   ├── store.ts
│   │   │   ├── search.ts
│   │   │   ├── fill.ts
│   │   │   └── write.ts
│   │   │
│   │   ├── services/              # Business Logic
│   │   │   ├── ollama.ts
│   │   │   ├── vectorDB.ts
│   │   │   ├── rag.ts
│   │   │   ├── dataManager.ts
│   │   │   ├── search.ts
│   │   │   ├── jobAnalyzer.ts
│   │   │   ├── skillMatcher.ts
│   │   │   ├── contextBuilder.ts
│   │   │   └── writer.ts
│   │   │
│   │   ├── prompts/               # Prompt Templates
│   │   │   ├── coverLetter.ts
│   │   │   ├── jobQuestion.ts
│   │   │   ├── email.ts
│   │   │   └── custom.ts
│   │   │
│   │   ├── utils/                 # Utilities
│   │   │   ├── pdf.ts
│   │   │   ├── embeddings.ts
│   │   │   └── logger.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   └── dist/                      # Built backend
│
├── data/                          # Personal Data (LOCAL)
│   ├── .gitignore                 # NEVER commit
│   │
│   ├── personal/
│   │   ├── basic.json
│   │   ├── professional.json
│   │   └── preferences.json
│   │
│   ├── resumes/
│   │   ├── developer.pdf
│   │   ├── fullstack.pdf
│   │   └── manager.pdf
│   │
│   ├── skills/
│   │   ├── technical.json
│   │   ├── experience.json
│   │   └── projects.json
│   │
│   ├── answers/
│   │   ├── why-good-fit.md
│   │   ├── strengths.md
│   │   └── cover-letter-template.md
│   │
│   └── vector-db/
│       └── chroma.sqlite3
│
├── scripts/                       # Utility Scripts
│   ├── setup.sh
│   ├── install-ollama.sh
│   ├── start-dev.sh
│   └── build.sh
│
└── docs/                          # Documentation
    ├── SETUP.md
    ├── USAGE.md
    ├── API.md
    └── ARCHITECTURE.md
```

---

## Implementation Timeline

### Week 1: Core Foundation

- Day 1: Phase 1 (Ollama + Backend)
- Day 2-3: Phase 2 (Data Storage + RAG)
- Day 4-5: Phase 3 (Chrome Extension)

### Week 2: Features

- Day 6-8: Phase 4 (Form Auto-Fill)
- Day 9-10: Phase 5 (AI Writing)

### Week 3+: Polish

- Ongoing: Phase 6 (UI, Features, Docs)

### Total Time Estimate

- MVP (Phases 1-3): 8-12 hours
- Full Features (Phases 1-5): 15-20 hours
- Production Ready (All Phases): 25-30 hours

---

## Next Steps

1. Review this detailed plan
2. Ask any questions about tech choices or implementation
3. Confirm you're ready to start
4. Begin Phase 1: Foundation Setup

Ready to build Buddy?