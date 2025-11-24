import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: {
    question?: string;
    query?: string;
  };
  id: number | string;
}

interface MCPResponse {
  jsonrpc: string;
  result?: {
    answer: string;
    sources: Array<{
      title: string;
      relevance: number;
      category?: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
  id: number | string | null;
}

async function queryDigitalTwin(question: string) {
  try {
    // Step 1: Query Upstash Vector for relevant content
    const results = await index.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    });

    if (!results || results.length === 0) {
      return {
        answer: "I don't have specific information about that topic in my profile.",
        sources: [],
      };
    }

    // Step 2: Extract relevant content and build context
    const sources = [];
    const contextParts = [];

    for (const result of results) {
      const metadata = result.metadata as any;
      const title = metadata?.title || 'Information';
      const content = metadata?.content || '';
      const category = metadata?.category || '';
      const score = result.score || 0;

      sources.push({
        title,
        relevance: score,
        category,
      });

      if (content) {
        contextParts.push(`${title}: ${content}`);
      }
    }

    if (contextParts.length === 0) {
      return {
        answer: "I found some information but couldn't extract details.",
        sources,
      };
    }

    // Step 3: Generate response using Groq
    const context = contextParts.join('\n\n');
    const prompt = `Based on the following information about yourself, answer the question.
Speak in first person as if you are describing your own background.

Your Information:
${context}

Question: ${question}

Provide a helpful, professional response:`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI digital twin of Christian Jay Maquiraya. Answer questions as if you are Christian, speaking in first person about your background, skills, and experience. Be honest about strengths (hardware, resilience, hands-on skills) and acknowledge challenges (programming) while emphasizing your growth mindset and willingness to learn.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || 'Unable to generate response.';

    return {
      answer,
      sources,
    };
  } catch (error) {
    console.error('Error in queryDigitalTwin:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json();

    // Validate JSON-RPC 2.0 format
    if (body.jsonrpc !== '2.0') {
      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid JSON-RPC version',
        },
        id: body.id || null,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle different methods
    switch (body.method) {
      case 'ping':
        return NextResponse.json({
          jsonrpc: '2.0',
          result: { status: 'ok', message: 'Digital Twin MCP Server is running' },
          id: body.id,
        });

      case 'query_digital_twin':
      case 'query': {
        const question = body.params?.question || body.params?.query;

        if (!question) {
          const errorResponse: MCPResponse = {
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Invalid params: question is required',
            },
            id: body.id,
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await queryDigitalTwin(question);

        const response: MCPResponse = {
          jsonrpc: '2.0',
          result,
          id: body.id,
        };

        return NextResponse.json(response);
      }

      default: {
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`,
          },
          id: body.id,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    }
  } catch (error) {
    console.error('MCP Server Error:', error);

    const errorResponse: MCPResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      id: null,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Digital Twin MCP Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      mcp: '/api/mcp (POST)',
    },
    methods: ['ping', 'query_digital_twin', 'query'],
    description: 'MCP server for Christian Jay Maquiraya digital twin interview preparation system',
  });
}
