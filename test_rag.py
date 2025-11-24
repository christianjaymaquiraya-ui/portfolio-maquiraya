"""
RAG Query System - Test your Digital Twin
Query your embedded profile using Upstash Vector + Groq
"""

import os
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq

load_dotenv()

# Initialize clients
index = Index(
    url=os.getenv("UPSTASH_VECTOR_REST_URL"),
    token=os.getenv("UPSTASH_VECTOR_REST_TOKEN")
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_digital_twin(question, top_k=3):
    """Query the digital twin with RAG"""
    
    print(f"\n{'='*60}")
    print(f"❓ Question: {question}")
    print(f"{'='*60}")
    
    # Step 1: Retrieve relevant context from vector DB
    print("🔍 Searching knowledge base...")
    
    try:
        # For vector DB without auto-embedding, we need to embed the query
        from sentence_transformers import SentenceTransformer
        import numpy as np
        
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        query_embedding = model.encode(question)
        
        # Pad to 1536 dimensions
        if len(query_embedding) < 1536:
            query_embedding = np.pad(query_embedding, (0, 1536 - len(query_embedding)), mode='constant')
        query_embedding = query_embedding[:1536].tolist()
        
        # Search with vector
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        if not results:
            return "❌ No relevant information found"
        
        print(f"✅ Found {len(results)} relevant contexts\n")
        
        # Build context from results
        context_parts = []
        for i, result in enumerate(results, 1):
            text = result.metadata.get('text', '')
            score = result.score
            category = result.metadata.get('category', 'Unknown')
            
            context_parts.append(f"[Context {i} - {category}] (Relevance: {score:.2f})\n{text}")
            print(f"  {i}. {category} (score: {score:.3f})")
        
        context = "\n\n".join(context_parts)
        
        # Step 2: Generate answer with Groq
        print("\n🤖 Generating answer with Groq...")
        
        prompt = f"""Based on the following information about Christian Jay Maquiraya, answer the question.

Context:
{context}

Question: {question}

Instructions:
- Answer based ONLY on the context provided
- Be specific and accurate
- Keep the response concise (2-3 sentences)
- If the context doesn't contain enough information, say so

Answer:"""

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are Christian's AI assistant. Answer questions about Christian using only the provided context."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        answer = completion.choices[0].message.content
        
        print(f"\n💬 Answer:")
        print(f"{answer}")
        print(f"\n{'='*60}")
        
        return answer
        
    except Exception as e:
        return f"❌ Error: {e}"

# Test queries
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 Digital Twin RAG System - Test")
    print("="*60)
    
    test_questions = [
        "What are Christian's technical skills?",
        "What is Christian's educational background?",
        "What are Christian's career goals?",
    ]
    
    for question in test_questions:
        query_digital_twin(question)
        print()
    
    # Interactive mode
    print("\n" + "="*60)
    print("💬 Interactive Mode - Ask anything!")
    print("Type 'quit' to exit")
    print("="*60)
    
    while True:
        try:
            user_question = input("\n❓ Your question: ").strip()
            
            if user_question.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not user_question:
                continue
            
            query_digital_twin(user_question)
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
