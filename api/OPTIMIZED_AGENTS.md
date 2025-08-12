# UltraLearning API - Optimized AI Agents

## Streamlined Agent Structure

### 📁 `/app/chat/agents/`
- `agents.py` - All agent classes and instances
- `orchestrator.py` - Intent classification and routing

## Agent Classes

### BaseAgent
- Common functionality for all agents
- Error handling and fallback responses
- Standardized LLM interaction

### LearningAgent
- General educational assistance
- Concept explanations and learning support
- Default agent for unclassified queries

### FlashcardAgent
- Generates educational flashcards
- JSON-formatted output validation
- Integrated with learning routes

### StudyAgent
- Study techniques and time management
- Learning strategies and coaching
- Practical study advice

## Intent Classification

Simple keyword-based routing:
- **flashcard**: "flashcard", "card", "quiz", "test", "review"
- **study**: "study", "learn", "practice", "technique", "method"
- **learning**: "explain", "what", "how", "why", "concept" (default)

## Optimizations Made

### ✅ **Removed Unnecessary Files:**
- `multi_agents.py` (finance-focused, not relevant)
- `qa_agent.py` (merged into BaseAgent)
- `gamification_agent.py` (simple placeholder)
- `flashcard_agent.py` (integrated into agents.py)

### ✅ **Simplified Structure:**
- Single `agents.py` file with all agent classes
- Streamlined orchestrator with learning-focused routing
- Consistent error handling across all agents

### ✅ **Educational Focus:**
- Removed finance-specific agents (account, investment, crypto, etc.)
- Added learning-specific agents (study coaching, flashcards)
- Intent keywords focused on educational activities

### ✅ **Better Integration:**
- Agents work seamlessly with learning routes
- Flashcard generation integrated with pack management
- Consistent response format across all agents

## Usage Examples

### Direct Agent Access
```python
from app.chat.agents.agents import AGENTS

# Generate flashcards
flashcard_agent = AGENTS['flashcard']
cards = flashcard_agent.generate("Python basics", 5)

# Get study advice
study_agent = AGENTS['study']
advice = study_agent.generate_response("How to study effectively?")
```

### Via Orchestrator
```python
from app.chat.agents.orchestrator import supervisor_agent

# Auto-routed based on intent
response = supervisor_agent("Create flashcards about math")
response = supervisor_agent("How should I study for exams?")
response = supervisor_agent("Explain photosynthesis")
```

## Benefits

✅ **Cleaner codebase** - Removed 4 unnecessary files
✅ **Educational focus** - All agents serve learning purposes  
✅ **Better maintainability** - Single file for all agents
✅ **Consistent interface** - Standardized agent behavior
✅ **Optimized routing** - Fast, keyword-based intent classification