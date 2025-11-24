"""
Digital Twin Embedding - Using local embeddings compatible with 1536 dims
"""

import os
import json
import numpy as np
from dotenv import load_dotenv
from upstash_vector import Index

load_dotenv()

print("\n" + "="*60)
print("🤖 Digital Twin Embedding - Simple Method")
print("="*60)

# Connect to Upstash
try:
    index = Index(
        url=os.getenv("UPSTASH_VECTOR_REST_URL"),
        token=os.getenv("UPSTASH_VECTOR_REST_TOKEN")
    )
    print("✅ Connected to Upstash Vector Database!")
    info = index.info()
    print(f"📊 Index: {info.dimension} dimensions, {info.vector_count} vectors\n")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# Check/install required packages
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("Installing sentence-transformers...")
    import subprocess
    subprocess.check_call(["pip", "install", "-q", "sentence-transformers"])
    from sentence_transformers import SentenceTransformer

# Load embedding model
print("🔄 Loading embedding model...")
# Using a model and padding to 1536 dimensions
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("✅ Model loaded!\n")

# Load profile
try:
    with open("data/profile.json", "r") as f:
        profile = json.load(f)
    print("✅ Loaded profile.json\n")
except FileNotFoundError:
    print("❌ data/profile.json not found")
    exit(1)

# Process chunks
vectors = []
id_counter = 1

def create_embedding(text):
    """Create 1536-dim embedding by padding"""
    emb = model.encode(text)
    # Pad to 1536 dimensions
    if len(emb) < 1536:
        emb = np.pad(emb, (0, 1536 - len(emb)), mode='constant')
    return emb[:1536].tolist()

def add_chunk(category, content, section=""):
    global id_counter
    
    # Convert to readable text
    if isinstance(content, dict):
        parts = []
        for k, v in content.items():
            if isinstance(v, (list, dict)):
                parts.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
            else:
                parts.append(f"{k}: {v}")
        text = f"{category}\n" + "\n".join(parts)
    else:
        text = f"{category}: {content}"
    
    # Create embedding
    embedding = create_embedding(text)
    
    vectors.append({
        "id": f"chunk_{id_counter}",
        "vector": embedding,
        "metadata": {
            "text": text[:500],
            "category": category,
            "section": section
        }
    })
    
    id_counter += 1
    return len(text)

# Create chunks
print("🔄 Creating embeddings...")

chunks = []
chunks.append(("Personal", profile.get("personal", {}), "personal"))
chunks.append(("Career Goals", profile.get("career_goals", {}), "career"))

for exp in profile.get("experience", []):
    chunks.append((f"Experience - {exp.get('title')}", exp, "experience"))

chunks.append(("Skills", profile.get("skills", {}), "skills"))
chunks.append(("Education", profile.get("education", {}), "education"))
chunks.append(("Interview Prep", profile.get("interview_prep", {}), "interview"))

for cat, content, section in chunks:
    size = add_chunk(cat, content, section)
    print(f"  ✓ {cat} ({size} chars)")

# Upload
print(f"\n🚀 Uploading {len(vectors)} vectors...")

try:
    print("🔄 Resetting index...")
    index.reset()
    
    print("⬆️  Uploading...")
    index.upsert(vectors=vectors)
    
    info = index.info()
    print(f"\n🎉 Success! {info.vector_count} vectors uploaded")
    print("✅ Your Digital Twin is ready!")
    print("\n" + "="*60)
    
except Exception as e:
    print(f"❌ Upload failed: {e}")
    import traceback
    traceback.print_exc()
