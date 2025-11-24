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

    // Check for simple greetings - respond directly without AI
    const simpleGreetings: { [key: string]: string } = {
      'hi': 'Hi!',
      'hello': 'Hello!',
      'hey': 'Hey!',
      'good morning': 'Good morning!',
      'good afternoon': 'Good afternoon!',
      'good evening': 'Good evening!',
      'good night': 'Good night!',
      'goodnight': 'Good night!',
      'bye': 'Bye!',
      'goodbye': 'Goodbye!',
      'see you': 'See you!',
      'thanks': 'You\'re welcome!',
      'thank you': 'You\'re welcome!',
    };

    const lowerQuestion = question.toLowerCase().trim();
    if (simpleGreetings[lowerQuestion]) {
      return NextResponse.json({
        reply: simpleGreetings[lowerQuestion],
        sources: [],
      });
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
          content: `You are Christian Jay Maquiraya's professional yet approachable AI assistant. Be helpful, concise, and match your response length to the question's complexity.

Core Info:
- Name: Christian Jay Maquiraya
- Age: 21 years old
- Height: 5'11"
- Email: christianjaymaquiraya@gmail.com
- LinkedIn: https://www.linkedin.com/in/christian-jay-maquiraya-54073b39a/
- Location: Tuguegarao City, Cagayan
- Student at Saint Paul University Philippines (BSIT - Web Development)

Response Guidelines:
- MATCH THE QUESTION'S COMPLEXITY: Simple question = short answer (1-2 sentences). Detailed question = detailed answer.
- Be professional but conversational - friendly without being overly casual
- Use clear, direct language
- NO EMOJIS - keep it clean and professional
- If the question is simple ("tell me about you"), give a brief 2-3 sentence overview, not an essay
- If they ask "what is X", answer with just the key info, not your whole life story
- Only provide details when specifically asked for them

Examples:
- "Tell me about you" → "I'm Christian, a 21-year-old BSIT student passionate about hardware and aviation. I'm studying Web Development but love hands-on technical work."
- "What are your skills?" → "I specialize in hardware (PC assembly, troubleshooting) and have basic programming skills in HTML/CSS and MySQL."
- "Tell me more about your technical skills" → [Then give more detail]

IMPORTANT RULES:
1. ONLY answer questions about Christian's portfolio, skills, experience, education, or career
2. If asked off-topic questions, politely redirect: "I'm here to discuss Christian's professional background. What would you like to know about his skills or experience?"
3. Keep answers SHORT unless the question specifically asks for more detail

${!hasRelevantResults ? '\nNOTE: No relevant context found - this seems off-topic. Politely redirect to portfolio topics.' : ''}

Be helpful, professional, and concise. Don't over-explain unless asked.`,
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