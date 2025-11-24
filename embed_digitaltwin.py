#!/usr/bin/env python3
"""
Embed Digital Twin data into Upstash Vector Database
This script reads digitaltwin.json and creates searchable embeddings
"""

import json
import os
from dotenv import load_dotenv
from upstash_vector import Index

# Load environment variables
load_dotenv()

UPSTASH_URL = os.getenv("UPSTASH_VECTOR_REST_URL")
UPSTASH_TOKEN = os.getenv("UPSTASH_VECTOR_REST_TOKEN")

if not UPSTASH_URL or not UPSTASH_TOKEN:
    raise ValueError("Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN in .env")

# Initialize Upstash Vector with automatic embeddings
index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)

def load_digital_twin_data():
    """Load and parse digitaltwin.json"""
    with open("digitaltwin.json", "r", encoding="utf-8") as f:
        return json.load(f)

def create_embeddings():
    """Create text chunks for embedding"""
    data = load_digital_twin_data()
    
    chunks = []
    
    # Personal Information
    personal = data.get("personal", {})
    chunks.append({
        "id": "personal-info",
        "text": f"""
Name: {personal.get('name', 'Christian Jay Maquiraya')}
Age: 21 years old
Height: 5'11"
Email: christianjaymaquiraya@gmail.com
LinkedIn: https://www.linkedin.com/in/christian-jay-maquiraya-54073b39a/
Title: {personal.get('title', 'IT Student')}
Location: {personal.get('location', 'Tuguegarao City, Cagayan')}
Summary: {personal.get('summary', '')}
Elevator Pitch: {personal.get('elevator_pitch', '')}

I'm a 21-year-old IT student with a passion for hardware, mechanics, and aviation. While web development is my academic focus, my heart is in technical systems and hands-on work.
        """.strip(),
        "category": "Personal Information",
        "title": "About Christian Jay Maquiraya"
    })
    
    # Technical Skills
    skills = data.get("skills", {}).get("technical", {})
    hardware_skills = ", ".join(skills.get("hardware_skills", []))
    programming = skills.get("programming_languages", [])
    prog_text = ", ".join([f"{p.get('language')} ({p.get('proficiency')})" for p in programming])
    
    chunks.append({
        "id": "technical-skills",
        "text": f"""
Technical Skills:
- Hardware: {hardware_skills}
- Programming: {prog_text}
- Systems: Windows OS, PC Assembly, Troubleshooting, System Maintenance
- Tools: VS Code, Git (Basic)

Strengths: Hardware systems, troubleshooting, hands-on technical work
Learning: Web development, programming fundamentals
        """.strip(),
        "category": "Technical Skills",
        "title": "Technical Skills & Expertise"
    })
    
    # Soft Skills
    soft_skills = data.get("skills", {}).get("soft_skills", [])
    soft_text = "\n".join([f"- {skill}" for skill in soft_skills])
    
    chunks.append({
        "id": "soft-skills",
        "text": f"""
Soft Skills & Personal Qualities:
{soft_text}

Key Traits: Resilience, Growth Mindset, Honesty about limitations, Willingness to learn
Known for: Strong work ethic, ability to learn from mistakes, persistence
        """.strip(),
        "category": "Soft Skills",
        "title": "Soft Skills & Work Style"
    })
    
    # Experience
    experience = data.get("experience", [])
    exp_text = ""
    for exp in experience:
        company = exp.get("company", "")
        title = exp.get("title", "")
        duration = exp.get("duration", "")
        tech_skills = ", ".join(exp.get("technical_skills_used", []))
        exp_text += f"\n{title} at {company} ({duration})\nSkills used: {tech_skills}\n"
    
    chunks.append({
        "id": "work-experience",
        "text": f"""
Work Experience & Education:
{exp_text}

Currently studying BSIT - Web Development at Saint Paul University Philippines
Expected graduation: 2025
        """.strip(),
        "category": "Experience",
        "title": "Work Experience & Education"
    })
    
    # Career Goals
    career_goals = data.get("career_goals", {})
    
    chunks.append({
        "id": "career-goals",
        "text": f"""
Career Goals:
Short-term: {career_goals.get('short_term', 'Find IT Support or Technical Specialist job')}
Long-term: {career_goals.get('long_term', 'Pursue Aviation/Pilot training or become an IT Specialist')}

Preferred Roles: IT Support, Hardware Technician, Technical Specialist, Systems Administrator
Industries: Aviation, Technology, IT Operations

Looking for entry-level roles where I can learn and contribute with hands-on experience.
        """.strip(),
        "category": "Career Goals",
        "title": "Career Goals & Aspirations"
    })
    
    # Projects
    projects = data.get("projects_portfolio", [])
    proj_text = ""
    for proj in projects:
        name = proj.get("name", "")
        desc = proj.get("description", "")
        tech = ", ".join(proj.get("technologies", []))
        impact = proj.get("impact", "")
        proj_text += f"\n{name}: {desc}\nTechnologies: {tech}\nImpact: {impact}\n"
    
    chunks.append({
        "id": "projects",
        "text": f"""
Projects & Portfolio:
{proj_text}

Portfolio: https://github.com/christianjaymaquiraya-ui/portfolio-maquiraya
        """.strip(),
        "category": "Projects",
        "title": "Projects & Work Samples"
    })
    
    return chunks

def main():
    print("🚀 Embedding Digital Twin data into Upstash Vector...\n")
    
    # Create chunks
    chunks = create_embeddings()
    
    print(f"📦 Created {len(chunks)} text chunks for embedding\n")
    
    # Reset index (delete all existing vectors)
    print("🗑️  Clearing existing vectors...")
    try:
        info = index.info()
        print(f"   Current vectors: {info.get('vectorCount', 0)}")
        index.reset()
        print("   ✅ Index cleared\n")
    except Exception as e:
        print(f"   ⚠️  Could not clear index: {e}\n")
    
    # Upsert vectors with automatic embedding
    print("📤 Uploading vectors to Upstash...")
    for i, chunk in enumerate(chunks, 1):
        try:
            # Upstash will automatically generate embeddings
            index.upsert(
                vectors=[
                    {
                        "id": chunk["id"],
                        "data": chunk["text"],  # Upstash auto-embeds this
                        "metadata": {
                            "text": chunk["text"],
                            "category": chunk["category"],
                            "title": chunk["title"]
                        }
                    }
                ]
            )
            print(f"   ✅ [{i}/{len(chunks)}] {chunk['title']}")
        except Exception as e:
            print(f"   ❌ [{i}/{len(chunks)}] Failed: {e}")
    
    # Verify
    print("\n📊 Verifying upload...")
    info = index.info()
    vector_count = info.get('vectorCount', 0)
    print(f"   Total vectors in database: {vector_count}")
    
    if vector_count > 0:
        print("\n✅ Digital Twin data successfully embedded!")
        print("🤖 Your chatbot is now ready to answer questions!")
    else:
        print("\n⚠️  Warning: No vectors found in database")
        print("   Please check your Upstash configuration")
    
    print("\n💡 Test your chatbot at: http://localhost:3000")

if __name__ == "__main__":
    main()
