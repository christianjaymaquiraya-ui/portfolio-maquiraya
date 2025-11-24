#!/usr/bin/env node

/**
 * Digital Twin MCP Server - stdio implementation
 * 
 * This is a proper MCP server that communicates via stdin/stdout
 * for integration with VS Code, Claude Desktop, and other MCP clients.
 */

import { config } from 'dotenv';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';
import * as readline from 'readline';

// Load environment variables from .env
config();

// Environment variables (loaded from .env)
const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!UPSTASH_URL || !UPSTASH_TOKEN || !GROQ_API_KEY) {
  console.error(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32603,
      message: 'Missing environment variables. Please check .env file.',
    },
    id: null,
  }));
  process.exit(1);
}

const index = new Index({
  url: UPSTASH_URL,
  token: UPSTASH_TOKEN,
});

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: {
    question?: string;
    query?: string;
    name?: string;
  };
  id: number | string;
}

interface MCPResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
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

async function handleRequest(request: MCPRequest): Promise<MCPResponse> {
  try {
    // Validate JSON-RPC 2.0
    if (request.jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"',
        },
        id: request.id || null,
      };
    }

    // Handle different MCP methods
    switch (request.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'digital-twin-mcp',
              version: '1.0.0',
            },
          },
          id: request.id,
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'query_digital_twin',
                description: 'Query Christian Jay Maquiraya\'s digital twin to get information about his professional background, skills, experience, and career goals.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    question: {
                      type: 'string',
                      description: 'The question to ask about Christian\'s professional profile',
                    },
                  },
                  required: ['question'],
                },
              },
            ],
          },
          id: request.id,
        };

      case 'tools/call':
        const toolName = request.params?.name;
        
        if (toolName === 'query_digital_twin') {
          const question = request.params?.question || request.params?.query;
          
          if (!question) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32602,
                message: 'Invalid params: question is required',
              },
              id: request.id,
            };
          }

          const result = await queryDigitalTwin(question);

          return {
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: result.answer,
                },
              ],
              isError: false,
            },
            id: request.id,
          };
        }

        return {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`,
          },
          id: request.id,
        };

      case 'ping':
        return {
          jsonrpc: '2.0',
          result: { status: 'ok' },
          id: request.id,
        };

      default:
        return {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`,
          },
          id: request.id,
        };
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: error instanceof Error ? error.stack : undefined,
      },
      id: request.id || null,
    };
  }
}

// Setup stdio communication
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  try {
    const request: MCPRequest = JSON.parse(line);
    const response = await handleRequest(request);
    console.log(JSON.stringify(response));
  } catch (error) {
    const errorResponse: MCPResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error: Invalid JSON',
        data: error instanceof Error ? error.message : undefined,
      },
      id: null,
    };
    console.log(JSON.stringify(errorResponse));
  }
});

// Handle process signals
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Log startup (to stderr to not interfere with JSON-RPC)
console.error('Digital Twin MCP Server started (stdio mode)');
