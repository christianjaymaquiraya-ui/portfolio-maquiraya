# Digital Twin MCP Server Project Instructions

## Project Overview
Build an MCP server to create a digital twin assistant that answers questions about Christian Jay Maquiraya's professional profile using RAG (Retrieval-Augmented Generation). This server enables AI assistants (GitHub Copilot, Claude) to access personalized professional data for interview preparation and career guidance.

## Reference Implementation
- **Python RAG Logic**: `digitaltwin_rag.py` in this project
  - Uses Upstash Vector for semantic search with built-in embeddings
  - Groq LLaMA for response generation
  - This exact logic must be replicated in Next.js server actions

## Core Functionality
- MCP server accepts user questions about Christian's professional background
- Create server actions that search Upstash Vector database and return RAG results
- Search logic must match the Python version exactly
- Responses should be in first person as Christian Jay Maquiraya

## Environment Variables (.env.local)
```
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url_here
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token_here
GROQ_API_KEY=your_groq_api_key_here
```

## Technical Requirements
- **Framework**: Next.js 15.5.3+ (use latest available)
- **Package Manager**: Always use pnpm (never npm or yarn)
- **Commands**: Always use Windows PowerShell commands
- **Type Safety**: Enforce strong TypeScript type safety throughout
- **Architecture**: Always use server actions where possible
- **Styling**: Use globals.css instead of inline styling
- **UI Framework**: ShadCN with dark mode theme
- **Focus**: Prioritize MCP functionality over UI - UI is primarily for MCP server configuration

## Installed Dependencies (Already Available)
```json
{
  "@upstash/vector": "^1.2.2",
  "groq-sdk": "^0.36.0"
}
```

## Upstash Vector Integration

### Key Documentation
- Getting Started: https://upstash.com/docs/vector/overall/getstarted
- Embedding Models: https://upstash.com/docs/vector/features/embeddingmodels
- TypeScript SDK: https://upstash.com/docs/vector/sdks/ts/getting-started

### Implementation Pattern
```typescript
import { Index } from "@upstash/vector"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

// RAG search example
const results = await index.query({
  data: "What are Christian's technical skills?",
  topK: 3,
  includeMetadata: true,
})
```

## Groq Integration

### Key Documentation
- Groq API Docs: https://console.groq.com/docs
- TypeScript SDK: https://github.com/groq/groq-typescript

### Implementation Pattern
```typescript
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: "You are an AI digital twin of Christian Jay Maquiraya..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.7,
  max_tokens: 500
})
```

## MCP Server Requirements

### API Endpoint Structure
- **Endpoint**: `/api/mcp`
- **Method**: POST
- **Request Format**: JSON-RPC 2.0
- **Response Format**: JSON-RPC 2.0

### Example MCP Request/Response
```json
// Request
{
  "jsonrpc": "2.0",
  "method": "query_digital_twin",
  "params": {
    "question": "What are your technical skills?"
  },
  "id": 1
}

// Response
{
  "jsonrpc": "2.0",
  "result": {
    "answer": "I have experience with...",
    "sources": [
      {"title": "Technical Skills", "relevance": 0.95}
    ]
  },
  "id": 1
}
```

## RAG Implementation Steps

1. **Query Upstash Vector**: Search for relevant content chunks
2. **Extract Top Results**: Get top 3 most relevant chunks with metadata
3. **Build Context**: Combine content from relevant chunks
4. **Generate Response**: Use Groq with context to generate personalized answer
5. **Return Result**: Format response with answer and source information

## Data Structure
The `digitaltwin.json` file contains:
- Personal information and professional identity
- Salary expectations and location preferences
- Work experience and educational background
- Technical and soft skills
- Projects and portfolio work
- Career goals and aspirations
- Interview preparation content
- **content_chunks**: 12 structured chunks optimized for RAG search

Each content chunk has:
- `id`: Unique identifier
- `type`: Category (personal_info, skills_technical, etc.)
- `title`: Descriptive title
- `content`: Rich text content
- `metadata`: Category and tags for filtering

## Error Handling
- Gracefully handle API failures
- Provide fallback responses when vector search returns no results
- Log errors for debugging
- Return user-friendly error messages

## Testing Requirements
- Test MCP endpoint directly with curl/Postman
- Verify RAG pipeline produces accurate, personalized responses
- Test with various interview question types (behavioral, technical, situational)
- Ensure responses are in first person as Christian
- Validate source attribution in responses

## UI Components (Optional)
If building a UI:
- Dashboard showing MCP server status
- Test interface for querying the digital twin
- Display of vector database statistics
- Configuration panel for API keys
- Dark mode support with ShadCN components

## Additional Resources
- MCP Protocol Specification: https://modelcontextprotocol.io/
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- ShadCN Installation: https://ui.shadcn.com/docs/installation/next

---

**Note**: This file provides context for GitHub Copilot to generate accurate, project-specific code suggestions. Keep it updated as requirements evolve.

## Implementation Priority
1. Create `/app/api/mcp/route.ts` with JSON-RPC 2.0 endpoint
2. Implement RAG query function matching Python logic
3. Add proper error handling and logging
4. Test with various interview questions
5. Optimize response quality and speed
