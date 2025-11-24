"""
Digital Twin RAG Application
Production-ready RAG system combining Upstash Vector search with Groq LLM

Usage:
  - Create a `.env` file with `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`, and `GROQ_API_KEY`.
  - Place your profile/digital twin JSON at `digitaltwin.json` (or adjust JSON_FILE constant).
  - Run: `python digitaltwin_rag.py`

This file provides:
  - Upstash Vector connection and optional data ingestion
  - Querying the vector DB for relevant contexts
  - Prompt construction and Groq-based response generation
  - A simple interactive REPL chat loop
"""

import os
import json
import sys
from dotenv import load_dotenv
from typing import List
import numpy as np

try:
    from upstash_vector import Index
except Exception:
    Index = None

try:
    from groq import Groq
except Exception:
    Groq = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

# Load env
load_dotenv()

JSON_FILE = os.getenv("DIGITALTWIN_JSON", "digitaltwin.json")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# Global embedding model
_embedding_model = None

def get_embedding_model():
    """Lazy load the sentence transformer model"""
    global _embedding_model
    if _embedding_model is None:
        if SentenceTransformer is None:
            print("❌ sentence-transformers not installed")
            return None
        try:
            _embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
            print("✅ Embedding model loaded")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            return None
    return _embedding_model

def setup_groq_client():
    """Initialize Groq client"""
    if Groq is None:
        print("❌ groq package not installed. See requirements.txt")
        return None
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not set in environment")
        return None
    try:
        client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized")
        return client
    except Exception as e:
        print(f"❌ Error initializing Groq client: {e}")
        return None

def setup_vector_database():
    """Connect to Upstash Vector index and optionally load data if empty"""
    if Index is None:
        print("❌ upstash-vector package not installed. See requirements.txt")
        return None

    url = os.getenv("UPSTASH_VECTOR_REST_URL")
    token = os.getenv("UPSTASH_VECTOR_REST_TOKEN")
    if not url or not token:
        print("❌ UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN not set in environment")
        return None

    try:
        index = Index(url=url, token=token)
        info = None
        try:
            info = index.info()
        except Exception:
            info = None

        if info is not None:
            dim = getattr(info, 'dimension', getattr(info, 'dimensions', 'unknown'))
            count = getattr(info, 'vector_count', getattr(info, 'vectorCount', 0))
            print(f"✅ Connected to Upstash Vector (dim={dim}, vectors={count})")
        else:
            print("✅ Connected to Upstash Vector (info unavailable)")

        # If index appears empty, attempt to load from JSON_FILE
        try:
            current_count = 0
            if info is not None:
                current_count = int(getattr(info, 'vector_count', getattr(info, 'vectorCount', 0) or 0))
        except Exception:
            current_count = 0

        if current_count == 0:
            if os.path.exists(JSON_FILE):
                print("📝 No vectors found — attempting to load data from", JSON_FILE)
                try:
                    with open(JSON_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                except Exception as e:
                    print(f"❌ Failed to read {JSON_FILE}: {e}")
                    return index

                # Expecting `content_chunks` list with {id,title,content,metadata}
                chunks = data.get('content_chunks') or data.get('chunks') or []
                if not chunks:
                    print("⚠️ No content chunks found in JSON — skipping ingestion")
                    return index

                vectors = []
                for c in chunks:
                    cid = str(c.get('id') or c.get('uid') or c.get('title', '')[:8])
                    title = c.get('title', '')
                    content = c.get('content') or c.get('text') or ''
                    meta = c.get('metadata', {}) if isinstance(c.get('metadata', {}), dict) else {}
                    meta.update({"title": title})
                    enriched = f"{title}: {content}" if title else content
                    vectors.append((cid, enriched, meta))

                if vectors:
                    try:
                        index.upsert(vectors=vectors)
                        print(f"✅ Uploaded {len(vectors)} vectors to Upstash Vector")
                    except Exception as e:
                        print(f"❌ Failed to upsert vectors: {e}")
            else:
                print(f"⚠️ {JSON_FILE} not found — skip data ingestion")

        return index

    except Exception as e:
        print(f"❌ Error connecting to Upstash Vector: {e}")
        return None

def embed_text(text: str) -> list:
    """Generate embedding for text and pad to 1536 dimensions"""
    model = get_embedding_model()
    if model is None:
        return None
    
    try:
        # Generate embedding (384 dims)
        embedding = model.encode(text)
        
        # Pad to 1536 dimensions
        if len(embedding) < 1536:
            padding = np.zeros(1536 - len(embedding))
            embedding = np.concatenate([embedding, padding])
        
        return embedding.tolist()
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return None

def query_vectors(index, query_text: str, top_k: int = 3):
    """Query Upstash Vector with manual embedding and return list of hits"""
    if index is None:
        return []
    
    # Generate query embedding
    query_embedding = embed_text(query_text)
    if query_embedding is None:
        print("❌ Failed to generate query embedding")
        return []
    
    try:
        # Query with vector instead of text
        res = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
        
        # Normalize results
        hits = []
        if isinstance(res, dict):
            hits = res.get('results') or res.get('matches') or []
        else:
            hits = res if isinstance(res, list) else []

        normalized = []
        for h in hits:
            score = getattr(h, 'score', None) or (h.get('score') if isinstance(h, dict) else None)
            metadata = getattr(h, 'metadata', None) or (h.get('metadata') if isinstance(h, dict) else None) or {}
            text = metadata.get('content') or metadata.get('text') or metadata.get('title', '')
            normalized.append({'score': score, 'metadata': metadata, 'text': text})
        return normalized
    except Exception as e:
        print(f"❌ Error querying vectors: {e}")
        return []

def generate_response_with_groq(client, prompt: str, model: str = DEFAULT_MODEL, temperature: float = 0.2, max_tokens: int = 400):
    """Call Groq to generate a response given a prompt"""
    if client is None:
        return "❌ Groq client not initialized"
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are the digital twin of the user. Answer in first person and only use provided context."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        # SDK returns choices[...] structure
        if hasattr(completion, 'choices'):
            text = completion.choices[0].message.content
        elif isinstance(completion, dict):
            text = completion.get('choices', [{}])[0].get('message', {}).get('content', '')
        else:
            text = str(completion)
        return text.strip()
    except Exception as e:
        return f"❌ Error generating response: {e}"

def rag_query(index, groq_client, question: str, top_k: int = 3):
    """Run a RAG query: retrieve context, build prompt, call LLM"""
    if not question:
        return "Please provide a question."

    hits = query_vectors(index, question, top_k=top_k)
    if not hits:
        return "I couldn't find relevant information in the digital twin." 

    # Build context (concatenate top docs)
    contexts = []
    print("🧠 Retrieved contexts:")
    for h in hits:
        score = h.get('score')
        meta = h.get('metadata') or {}
        text = h.get('text') or meta.get('content') or meta.get('text') or ''
        title = meta.get('title') or meta.get('section') or ''
        print(f" - {title} (score={score})")
        if title:
            contexts.append(f"{title}: {text}")
        else:
            contexts.append(text)

    context_block = "\n\n".join(contexts)

    prompt = f"""Based on the information below from my profile, answer the question in first person.

Context:
{context_block}

Question: {question}

If the context does not contain enough detail, say you don't have enough information. Keep the answer concise and professional."""

    # Call Groq
    answer = generate_response_with_groq(groq_client, prompt)
    return answer

def main():
    print("🚀 Digital Twin RAG - Upstash + Groq")
    print("=" * 50)

    groq_client = setup_groq_client()
    index = setup_vector_database()
    embedding_model = get_embedding_model()

    if not groq_client or not index or not embedding_model:
        print("❌ Initialization failed. Check environment and dependencies.")
        sys.exit(1)

    print("✅ System ready. Type questions or 'exit' to quit.")
    try:
        while True:
            q = input('\nYou: ').strip()
            if not q:
                continue
            if q.lower() in ('exit', 'quit'):
                print('👋 Goodbye!')
                break
            resp = rag_query(index, groq_client, q, top_k=3)
            print('\nDigital Twin:', resp)
    except KeyboardInterrupt:
        print('\n👋 Exiting...')

if __name__ == '__main__':
    main()
"""
Digital Twin RAG Application
Based on Binal's production implementation
- Upstash Vector: Built-in embeddings and vector storage
- Groq: Ultra-fast LLM inference
"""

import os
import json
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq

# Load environment variables
load_dotenv()

# Constants
JSON_FILE = "digitaltwin.json"
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
DEFAULT_MODEL = "llama-3.1-8b-instant"

def setup_groq_client():
    """Setup Groq client"""
    if not GROQ_API_KEY:
        print(" GROQ_API_KEY not found in .env file")
        return None
    
    try:
        client = Groq(api_key=GROQ_API_KEY)
        print(" Groq client initialized successfully!")
        return client
    except Exception as e:
        print(f" Error initializing Groq client: {str(e)}")
        return None

def setup_vector_database():
    """Setup Upstash Vector database with built-in embeddings"""
    print(" Setting up Upstash Vector database...")
    
    try:
        index = Index.from_env()
        print(" Connected to Upstash Vector successfully!")
        
        # Check current vector count
        try:
            info = index.info()
            current_count = getattr(info, 'vector_count', 0)
            print(f" Current vectors in database: {current_count}")
        except:
            current_count = 0
        
        # Load data if database is empty
        if current_count == 0:
            print(" Loading your professional profile...")
            
            try:
                with open(JSON_FILE, "r", encoding="utf-8") as f:
                    profile_data = json.load(f)
            except FileNotFoundError:
                print(f" {JSON_FILE} not found!")
                return None
            
            # Prepare vectors from content chunks
            vectors = []
            content_chunks = profile_data.get('content_chunks', [])
            
            if not content_chunks:
                print(" No content chunks found in profile data")
                return None
            
            for chunk in content_chunks:
                enriched_text = f"{chunk['title']}: {chunk['content']}"
                
                vectors.append((
                    chunk['id'],
                    enriched_text,
                    {
                        "title": chunk['title'],
                        "type": chunk['type'],
                        "content": chunk['content'],
                        "category": chunk.get('metadata', {}).get('category', ''),
                        "tags": chunk.get('metadata', {}).get('tags', [])
                    }
                ))
            
            # Upload vectors
            index.upsert(vectors=vectors)
            print(f" Successfully uploaded {len(vectors)} content chunks!")
        
        return index
        
    except Exception as e:
        print(f" Error setting up database: {str(e)}")
        return None

def query_vectors(index, query_text, top_k=3):
    """Query Upstash Vector for similar vectors"""
    try:
        results = index.query(
            data=query_text,
            top_k=top_k,
            include_metadata=True
        )
        return results
    except Exception as e:
        print(f" Error querying vectors: {str(e)}")
        return None

def generate_response_with_groq(client, prompt, model=DEFAULT_MODEL):
    """Generate response using Groq"""
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI digital twin. Answer questions as if you are the person, speaking in first person about your background, skills, and experience."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return completion.choices[0].message.content.strip()
        
    except Exception as e:
        return f" Error generating response: {str(e)}"

def rag_query(index, groq_client, question):
    """Perform RAG query using Upstash Vector + Groq"""
    try:
        # Step 1: Query vector database
        results = query_vectors(index, question, top_k=3)
        
        if not results or len(results) == 0:
            return "I don't have specific information about that topic."
        
        # Step 2: Extract relevant content
        print("\n Searching your professional profile...")
        
        top_docs = []
        for result in results:
            metadata = result.metadata or {}
            title = metadata.get('title', 'Information')
            content = metadata.get('content', '')
            score = result.score
            
            print(f" Found: {title} (Relevance: {score:.3f})")
            if content:
                top_docs.append(f"{title}: {content}")
        
        if not top_docs:
            return "I found some information but couldn't extract details."
        
        print(f" Generating personalized response...\n")
        
        # Step 3: Generate response with context
        context = "\n\n".join(top_docs)
        prompt = f"""Based on the following information about yourself, answer the question.
Speak in first person as if you are describing your own background.

Your Information:
{context}

Question: {question}

Provide a helpful, professional response:"""
        
        response = generate_response_with_groq(groq_client, prompt)
        return response
    
    except Exception as e:
        return f" Error during query: {str(e)}"

def main():
    """Main application loop"""
    print(" Your Digital Twin - AI Profile Assistant")
    print("=" * 50)
    print(" Vector Storage: Upstash (built-in embeddings)")
    print(f" AI Inference: Groq ({DEFAULT_MODEL})")
    print(" Data Source: Your Professional Profile\n")
    
    # Setup clients
    groq_client = setup_groq_client()
    if not groq_client:
        return
    
    index = setup_vector_database()
    if not index:
        return
    
    print(" Your Digital Twin is ready!\n")
    
    # Interactive chat loop
    print(" Chat with your AI Digital Twin!")
    print("Ask questions about your experience, skills, projects, or career goals.")
    print("Type 'exit' to quit.\n")
    
    print(" Try asking:")
    print("  - 'Tell me about your work experience'")
    print("  - 'What are your technical skills?'")
    print("  - 'Describe your career goals'")
    print()
    
    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            print(" Thanks for chatting with your Digital Twin!")
            break
        
        if question.strip():
            answer = rag_query(index, groq_client, question)
            print(f"\n Digital Twin: {answer}\n")

if __name__ == "__main__":
    main()
