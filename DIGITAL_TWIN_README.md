# Digital Twin MCP Server - Enterprise Interview Preparation System

An enterprise-ready AI system for interview preparation featuring a Digital Twin RAG (Retrieval-Augmented Generation) system with MCP (Model Context Protocol) integration.

## 🎯 Project Overview

This system creates a personalized AI digital twin that can answer questions about Christian Jay Maquiraya's professional profile, skills, experience, and career goals. It's designed for comprehensive interview preparation with realistic recruiter simulations.

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15.2.4 with React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.9 with ShadCN UI components
- **Vector Database**: Upstash Vector (serverless) with built-in embeddings
- **LLM**: Groq Cloud API (llama-3.1-8b-instant)
- **MCP Protocol**: JSON-RPC 2.0 for AI assistant integration
- **Package Manager**: pnpm

### System Components

1. **Digital Twin Data** (`digitaltwin.json`)
   - 12 structured content chunks optimized for RAG
   - Personal, professional, and interview preparation content
   - STAR-format achievements and behavioral examples

2. **Python RAG System** (`digitaltwin_rag.py`)
   - Standalone CLI for testing and profile validation
   - Direct Upstash Vector + Groq integration
   - Interactive chat interface

3. **MCP Server** (`app/api/mcp/route.ts`)
   - JSON-RPC 2.0 compliant API endpoint
   - Integrates with GitHub Copilot and Claude Desktop
   - Production-ready with error handling

4. **Interview Simulation** (`job-postings/`)
   - Real job posting analysis
   - Multi-persona interview practice
   - Comprehensive feedback system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+ (for CLI tool)
- Upstash Vector Database account
- Groq API key

### Installation

1. **Install Node.js dependencies**:
```powershell
pnpm install
```

2. **Install Python dependencies**:
```powershell
pip install upstash-vector groq python-dotenv
```

3. **Configure environment variables** (`.env` or `.env.local`):
```env
UPSTASH_VECTOR_REST_URL=your_upstash_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token
GROQ_API_KEY=your_groq_api_key
```

4. **Embed your digital twin data**:
```powershell
python digitaltwin_rag.py
```
On first run, this will automatically upload your profile to Upstash Vector.

### Running the Application

**Development server**:
```powershell
pnpm dev
```
Server runs at: http://localhost:3000

**Test MCP endpoint**:
```powershell
curl -X GET http://localhost:3000/api/mcp
```

**Test RAG query**:
```powershell
curl -X POST http://localhost:3000/api/mcp -H "Content-Type: application/json" -d '{\"jsonrpc\":\"2.0\",\"method\":\"query_digital_twin\",\"params\":{\"question\":\"What are your technical skills?\"},\"id\":1}'
```

**Python CLI**:
```powershell
python digitaltwin_rag.py
```

## 🧪 Testing the System

### 1. Test Python RAG System
```powershell
python digitaltwin_rag.py
```
Try questions:
- "What are your technical skills?"
- "Tell me about your career goals"
- "How do you handle programming challenges?"

### 2. Test MCP Server

**Start Next.js dev server**:
```powershell
pnpm dev
```

**Test with VS Code**:
1. Open VS Code Insiders
2. Ensure `.vscode/mcp.json` is configured
3. Use GitHub Copilot with: `@workspace What are my technical skills using the digital twin MCP server?`

**Test with Claude Desktop**:
1. Add to Claude Desktop MCP configuration:
```json
{
  "mcpServers": {
    "digital-twin": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```
2. Restart Claude Desktop
3. Ask questions about your profile

### 3. Interview Simulation

1. **Add a real job posting**:
   - Find a job on Seek.com.au or similar
   - Copy content to `job-postings/job1.md`

2. **Run interview simulation**:
```
@workspace You are a senior recruiter conducting a comprehensive interview simulation using the job posting in job-postings/job1.md and my digital twin MCP server data...
```

3. **Test different personas**:
   - HR Recruiter (cultural fit)
   - Technical Interviewer (skills assessment)
   - Hiring Manager (role fit)
   - Project Manager (collaboration)

## 📁 Project Structure

```
v0-minimalist-portfolio/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Chatbot API (existing)
│   │   └── mcp/route.ts           # MCP Server API (new)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Portfolio page with chatbot
├── components/
│   ├── chat-bot.tsx               # Chatbot UI component
│   └── theme-provider.tsx
├── data/
│   └── profile.json               # Original profile data
├── job-postings/
│   └── job1.md                    # Job posting for simulation
├── .vscode/
│   └── mcp.json                   # VS Code MCP configuration
├── agents.md                      # GitHub Copilot instructions
├── digitaltwin.json               # Enhanced profile with content_chunks
├── digitaltwin_rag.py             # Python RAG CLI tool
├── embed_simple.py                # Legacy embedding script
├── test_rag.py                    # Legacy test script
├── .env                           # Environment variables
└── package.json                   # Node.js dependencies
```

## 🔧 Configuration Files

### `.vscode/mcp.json`
Configures MCP server for GitHub Copilot integration in VS Code.

### `agents.md`
Provides context to GitHub Copilot for code generation and assistance.

### `digitaltwin.json`
Contains 12 structured content chunks:
1. Personal Information & Professional Identity
2. Salary Expectations & Location Preferences
3. Work Experience & Educational Background
4. Technical Skills & Expertise
5. Soft Skills & Personal Strengths
6. Projects & Portfolio Work
7. Career Goals & Professional Aspirations
8. Behavioral Interview Preparation
9. Technical Interview Preparation
10. Situational Interview Preparation
11. Professional Development & Continuous Learning
12. Unique Value Proposition & Personal Brand

## 🎓 Usage Scenarios

### Scenario 1: Profile Review
**Objective**: Understand your professional profile comprehensively

**Python CLI**:
```powershell
python digitaltwin_rag.py
```
Ask: "Give me a complete overview of my background and strengths"

**VS Code Copilot**:
```
@workspace Using my digital twin, what are my strongest selling points for an IT Support role?
```

### Scenario 2: Interview Preparation
**Objective**: Practice for a specific job posting

1. Add job posting to `job-postings/job1.md`
2. Use comprehensive interview simulation prompt
3. Get detailed feedback on suitability
4. Identify gaps and improvement areas
5. Update `digitaltwin.json` with missing information
6. Re-run embedding: `python digitaltwin_rag.py`
7. Test again with updated profile

### Scenario 3: Salary Negotiation Prep
**VS Code Copilot**:
```
@workspace Based on my digital twin profile, help me prepare for salary negotiation. What's a reasonable range for my experience level in Manila?
```

### Scenario 4: Behavioral Interview Practice
**Claude Desktop** (with MCP):
```
Can you ask me behavioral interview questions based on my background and help me structure my answers using the STAR method?
```

## 🚢 Deployment

### Deploy to Vercel

1. **Build test**:
```powershell
pnpm build
```

2. **Create GitHub repository**:
```powershell
git init
git add .
git commit -m "Digital Twin MCP Server - Enterprise Interview Prep System"
git remote add origin https://github.com/YOUR_USERNAME/digital-twin-mcp.git
git push -u origin main
```

3. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables:
     - `UPSTASH_VECTOR_REST_URL`
     - `UPSTASH_VECTOR_REST_TOKEN`
     - `GROQ_API_KEY`
   - Deploy

4. **Update MCP configuration** to use production URL:
```json
{
  "servers": {
    "digital-twin-production": {
      "type": "http",
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

## 📊 API Endpoints

### GET `/api/mcp`
Returns server information and available methods.

### POST `/api/mcp`
JSON-RPC 2.0 endpoint for querying the digital twin.

**Supported methods**:
- `ping` - Health check
- `query_digital_twin` - Query with semantic search
- `query` - Alias for query_digital_twin

**Example request**:
```json
{
  "jsonrpc": "2.0",
  "method": "query_digital_twin",
  "params": {
    "question": "What are your technical skills?"
  },
  "id": 1
}
```

**Example response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "answer": "I have experience with HTML/CSS (1 year, Basic proficiency)...",
    "sources": [
      {
        "title": "Technical Skills & Expertise",
        "relevance": 0.95,
        "category": "technical_competencies"
      }
    ]
  },
  "id": 1
}
```

## 🔒 Security Considerations

- ✅ API keys stored in environment variables
- ✅ `.env` excluded from version control
- ✅ Production deployment uses Vercel environment variables
- ✅ MCP server validates JSON-RPC 2.0 format
- ✅ Error messages don't expose sensitive information

## 📝 Maintenance

### Updating Your Profile

1. Edit `digitaltwin.json` to add new experiences, skills, or achievements
2. Re-run embedding: `python digitaltwin_rag.py`
3. Test updated profile: Ask questions via CLI or MCP
4. Commit changes: `git add digitaltwin.json && git commit -m "Update profile"`
5. Deploy: `git push origin main` (Vercel auto-deploys)

### Adding New Interview Scenarios

1. Create new file: `job-postings/job2.md`
2. Paste job posting content
3. Run interview simulation referencing `job-postings/job2.md`
4. Collect feedback and update profile accordingly

## 🐛 Troubleshooting

### Python RAG not connecting to Upstash
- Verify `.env` file exists with correct credentials
- Check internet connection
- Test credentials at https://console.upstash.com

### MCP server not responding
- Ensure dev server is running: `pnpm dev`
- Check `.vscode/mcp.json` configuration
- Verify localhost:3000 is accessible
- Restart VS Code Insiders

### No results from queries
- Confirm vectors are embedded: Check Upstash console
- Re-run embedding: `python digitaltwin_rag.py`
- Test with simple question: "What is your name?"

### Build errors
- Run `pnpm lint` to check for TypeScript errors
- Verify all dependencies installed: `pnpm install`
- Check Node.js version: `node --version` (should be 18+)

## 🎯 Best Practices

1. **Profile Maintenance**: Update `digitaltwin.json` quarterly or after major achievements
2. **STAR Format**: Use Situation-Task-Action-Result for all achievements
3. **Quantify Results**: Include specific metrics and outcomes
4. **Honesty**: Be transparent about strengths and weaknesses
5. **Regular Testing**: Practice with various interview personas weekly
6. **Continuous Learning**: Update based on interview simulation feedback

## 📚 Additional Resources

- [Upstash Vector Documentation](https://upstash.com/docs/vector)
- [Groq API Documentation](https://console.groq.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [STAR Method Guide](https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique)

## 👤 Author

**Christian Jay Maquiraya**
- IT Student | Hardware & Aviation Enthusiast
- Saint Paul University Philippines, BSIT
- Email: christianjaymaquiraya@gmail.com
- GitHub: [@christianjaymaquiraya-ui](https://github.com/christianjaymaquiraya-ui)

## 📄 License

This project is for personal interview preparation and portfolio demonstration.

---

**Built with**: Next.js • TypeScript • Upstash Vector • Groq • MCP Protocol
**Last Updated**: November 2024
