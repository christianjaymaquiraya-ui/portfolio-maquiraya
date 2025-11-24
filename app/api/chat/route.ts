import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support both simple chat format and MCP JSON-RPC format
    const isSimpleChat = body.message !== undefined;
    const isMCPFormat = body.jsonrpc === '2.0';

    let question: string;
    const conversationHistory = body.history || [];

    if (isSimpleChat) {
      // Simple chat format: { message: "..." }
      question = body.message;
      
      if (!question) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }
    } else if (isMCPFormat) {
      // MCP JSON-RPC format
      const { method, params, id } = body;

      if (method === 'query_digital_twin') {
        question = params?.question || params?.query;

        if (!question) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Missing question parameter' },
            id,
          });
        }
      } else {
        return NextResponse.json({
          jsonrpc: '2.0',
          error: { code: -32601, message: 'Method not found' },
          id,
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Query vector database
    const results = await vectorIndex.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    });

    // Check if the question is relevant to Christian's portfolio
    const relevanceThreshold = 0.5; // Minimum similarity score
    const hasRelevantResults = results.some(r => r.score && r.score >= relevanceThreshold);

    // Build context
    const context = results
      .map((r, idx) => {
        const text = r.metadata?.text || '';
        const category = r.metadata?.category || 'Unknown';
        return `[Context ${idx + 1} - ${category}]\n${text}`;
      })
      .join('\n\n');

    // Generate response with Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are Christian Jay Maquiraya's chill and fun AI assistant! Talk like you're chatting with a friend - be yourself, be real, and keep it light!

Core Info:
- Name: Christian Jay Maquiraya
- Age: 21 years old
- Height: 5'11"
- Email: christianjaymaquiraya@gmail.com
- LinkedIn: https://www.linkedin.com/in/christian-jay-maquiraya-54073b39a/
- Location: Tuguegarao City, Cagayan
- Student at Saint Paul University Philippines (BSIT - Web Development)

Vibe Check:
- Talk casually like texting a friend - use contractions (I'm, you're, it's)
- Be enthusiastic but not over the top
- Throw in some humor when appropriate
- Don't be afraid to admit when things are tough ("Coding can be a pain sometimes, not gonna lie")
- Show genuine excitement about tech, hardware, and aviation
- Keep it real - mix professional info with personality
- NO EMOJIS - keep it text-based and natural
- If something's cool, say it's cool! If it's challenging, say that too!

IMPORTANT RULES:
1. ONLY answer questions about Christian's portfolio, skills, experience, education, or career
2. If asked random stuff (weather, food, etc.), be playful but redirect:
   - "Haha, that's not really my thing! I'm here to chat about Christian's work and skills though. What would you like to know?"
   - "That's outside my wheelhouse! But I can tell you all about Christian's projects and experience if you're interested?"
   - "Not gonna lie, I can't help with that one. But I know everything about Christian's portfolio! Want to know more?"
3. For greetings, be warm and fun: "Hey! I'm Christian's AI buddy. Ask me anything about his skills, projects, or what he's working on!"

${!hasRelevantResults ? '\nNOTE: No relevant context found - this seems off-topic. Redirect playfully to portfolio topics!' : ''}

Keep it conversational, friendly, and real. You're not a robot - you're Christian's digital twin with personality!`,
        },
        {
          role: 'user',
          content: `Context from my profile:\n${context}\n\nQuestion: ${question}\n\nRespond as Christian in a friendly, natural way:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated';

    // Return response in the appropriate format
    if (isSimpleChat) {
      return NextResponse.json({
        reply: answer,
        sources: results.map(r => ({
          category: r.metadata?.category,
          relevance: r.score,
        })),
      });
    } else {
      // MCP format
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          answer,
          sources: results.map(r => ({
            category: r.metadata?.category,
            relevance: r.score,
          })),
        },
        id: body.id,
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}