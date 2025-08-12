from app.extensions import llama_model
from app.llm.model import generate_response
from typing import Optional
from flask import current_app
import json
import logging

class BaseAgent:
    def __init__(self, system_prompt: str, max_tokens: int = 512):
        self.system_prompt = system_prompt.strip()
        self.max_tokens = max_tokens

    def generate_response(self, user_query: str, context: Optional[str] = None) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        
        user_content = user_query
        if context:
            user_content = f"Context: {context}\n\nQuestion: {user_query}"
        
        messages.append({"role": "user", "content": user_content})
        
        try:
            return generate_response(messages, max_tokens=self.max_tokens)
        except Exception as e:
            current_app.logger.error(f"Agent error: {e}")
            return self.fallback_response()

    def fallback_response(self) -> str:
        return "I'm here to help with your learning. Could you please rephrase your question?"

class LearningAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are an educational AI assistant. Help students with learning concepts, "
            "study strategies, and academic questions. Provide clear, encouraging responses."
        )
        super().__init__(system_prompt)

class FlashcardAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a flashcard generator. Create educational flashcards in JSON format. "
            "Always respond with a JSON array of objects with 'question' and 'answer' keys."
        )
        super().__init__(system_prompt, max_tokens=1024)

    def generate(self, topic: str, num_cards: int = 5) -> list[dict]:
        prompt = f"Generate exactly {num_cards} flashcards about: {topic}. Return only valid JSON array format: [{{\"question\": \"...\", \"answer\": \"...\"}}]"
        
        try:
            response = self.generate_response(prompt)
            
            # Clean and extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']')
            
            if json_start != -1 and json_end != -1:
                json_string = response[json_start:json_end + 1]
                
                # Clean common JSON issues
                json_string = json_string.replace('\n', ' ').replace('\r', '')
                json_string = json_string.replace('\\\'', '\"')
                
                try:
                    cards = json.loads(json_string)
                except json.JSONDecodeError:
                    # Try to fix common issues and parse again
                    json_string = json_string.replace(',}', '}').replace(',]', ']')
                    cards = json.loads(json_string)
                
                # Validate format
                validated = []
                for card in cards:
                    if isinstance(card, dict) and 'question' in card and 'answer' in card:
                        validated.append({
                            "question": str(card['question']).strip()[:500],  # Limit length
                            "answer": str(card['answer']).strip()[:500]
                        })
                
                return validated[:num_cards] if validated else self._fallback_cards(topic, num_cards)
                
        except Exception as e:
            current_app.logger.error(f"Flashcard generation error: {e}")
        
        return self._fallback_cards(topic, num_cards)
    
    def _fallback_cards(self, topic: str, num_cards: int) -> list[dict]:
        """Generate simple fallback cards when AI generation fails"""
        return [
            {"question": f"What is {topic}?", "answer": f"A concept related to {topic}. Please regenerate for better content."},
            {"question": f"Why is {topic} important?", "answer": f"{topic} is important for learning. Please regenerate for detailed content."}
        ][:num_cards]

class StudyAgent(BaseAgent):
    def __init__(self):
        system_prompt = (
            "You are a study coach. Help students with study techniques, time management, "
            "and learning strategies. Provide practical, actionable advice."
        )
        super().__init__(system_prompt)

# Agent instances
AGENTS = {
    "learning": LearningAgent(),
    "flashcard": FlashcardAgent(),
    "study": StudyAgent()
}