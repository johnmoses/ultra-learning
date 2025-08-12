from flask import current_app
from .agents import AGENTS
import re

# Intent classification keywords
INTENT_KEYWORDS = {
    "flashcard": ["flashcard", "card", "quiz", "test", "review", "memorize"],
    "study": ["study", "learn", "practice", "technique", "method", "strategy", "time"],
    "learning": ["explain", "what", "how", "why", "concept", "understand", "help"]
}

def classify_intent(user_query: str) -> str:
    """Classify user intent based on keywords"""
    if not user_query:
        return "learning"
    
    query_lower = user_query.lower()
    scores = {}
    
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in query_lower)
        scores[intent] = score
    
    # Return intent with highest score, default to learning
    best_intent = max(scores, key=scores.get) if max(scores.values()) > 0 else "learning"
    return best_intent

def supervisor_agent(user_query: str, context: str = "") -> str:
    """Route user query to appropriate agent"""
    try:
        intent = classify_intent(user_query)
        current_app.logger.info(f"Query intent: {intent}")
        
        agent = AGENTS.get(intent, AGENTS["learning"])
        
        if intent == "flashcard" and hasattr(agent, 'generate'):
            # Special handling for flashcard generation
            topic = user_query.replace("flashcard", "").replace("card", "").strip()
            cards = agent.generate(topic)
            return f"Generated {len(cards)} flashcards about {topic}"
        
        return agent.generate_response(user_query, context)
        
    except Exception as e:
        current_app.logger.error(f"Orchestrator error: {e}")
        return "I'm having trouble processing your request. Please try again."

def get_available_agents():
    """Return available agents"""
    return {
        "learning": "General learning assistance",
        "flashcard": "Flashcard generation",
        "study": "Study coaching and techniques"
    }