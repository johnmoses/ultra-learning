from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.llm.model import generate_response
from app.extensions import search_vectors, get_milvus_client # Assuming get_milvus_client is needed for user doc embedding
import json
import logging

rag_bp = Blueprint("rag", __name__, url_prefix="/rag")

logger = logging.getLogger(__name__)

# --- Prompt Templates ---
# Define these where you manage your prompt templates (e.g., a new `app/prompts.py` module)
# For now, put them here to keep the example self-contained.

# Llama-only generation template
LLAMA_FLASHCARD_PROMPT_TEMPLATE = """
Generate {num_cards} unique flashcards about "{topic_or_text}".
Each flashcard should consist of a question and an answer.
Provide the output as a JSON array of objects, like this:
[
  {{ "question": "Question 1", "answer": "Answer 1" }},
  {{ "question": "Question 2", "answer": "Answer 2" }}
]
"""

# RAG generation template (for internal or user docs)
RAG_FLASHCARD_PROMPT_TEMPLATE = """
Generate {num_cards} unique flashcards based on the following context.
Each flashcard should consist of a question and an answer.
Context:
{context}

Provide the output as a JSON array of objects, like this:
[
  {{ "question": "Question 1", "answer": "Answer 1" }},
  {{ "question": "Question 2", "answer": "Answer 2" }}
]
"""

# --- Main Flashcard Generation Endpoint ---
@rag_bp.route("/generate_flashcards_multi_source", methods=["POST"])
@jwt_required()
def generate_flashcards_multi_source():
    data = request.json
    source_type = data.get("source_type") # "llama", "rag_internal", "rag_user_doc"
    num_cards = int(data.get("num_cards", 5)) # Default to 5 cards
    user_id = get_jwt_identity() # Current user, useful for logging or future personalization

    context = "" # Context for RAG-based generation

    if source_type == "llama":
        topic_or_text = data.get("topic")
        if not topic_or_text:
            return jsonify({"error": "For 'llama' source_type, 'topic' is required."}), 400
        prompt = LLAMA_FLASHCARD_PROMPT_TEMPLATE.format(num_cards=num_cards, topic_or_text=topic_or_text)

    elif source_type == "rag_internal":
        query = data.get("query")
        if not query:
            return jsonify({"error": "For 'rag_internal' source_type, 'query' is required."}), 400

        # Step 1: Embed the query
        # You need an embedding model. Assuming `embed_model` is accessible globally or instantiated here.
        # This example uses a placeholder. You might put this in `app/extensions.py` too.
        try:
            # Placeholder for your embedding model. You'll need to define `embed_model`.
            # If `embed_model` is a global in `extensions.py`:
            from app.extensions import embed_model # Make sure this is initialized in create_app
            if embed_model is None:
                return jsonify({"error": "Embedding model not initialized."}), 500

            query_embedding = embed_model.embed(query) # Or embed_model.encode([query]) if it's a SentenceTransformer
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            return jsonify({"error": "Failed to embed query for RAG."}), 500

        # Step 2: Search Milvus
        search_results = search_vectors(query_embedding, top_k=5) # Adjust top_k as needed
        context = "\n".join([result['text'] for result in search_results])
        if not context.strip():
            return jsonify({"error": "No relevant internal documents found for the query."}), 404
        prompt = RAG_FLASHCARD_PROMPT_TEMPLATE.format(num_cards=num_cards, context=context)

    elif source_type == "rag_user_doc":
        user_document_text = data.get("user_document_text")
        if not user_document_text:
            return jsonify({"error": "For 'rag_user_doc' source_type, 'user_document_text' is required."}), 400
        context = user_document_text # The user's document IS the context
        prompt = RAG_FLASHCARD_PROMPT_TEMPLATE.format(num_cards=num_cards, context=context)

    else:
        return jsonify({"error": "Invalid 'source_type'. Must be 'llama', 'rag_internal', or 'rag_user_doc'."}), 400

    try:
        # It's crucial that `generate_response` can handle multi-turn/complex instructions
        # to produce the JSON array format reliably. You might need to adjust max_tokens.
        generated_text = generate_response(prompt, max_tokens=1024) # Increased max_tokens for multiple cards

        # Attempt to parse the JSON array
        flashcards_data = json.loads(generated_text)

        # Validate if it's a list of objects with question/answer
        if not isinstance(flashcards_data, list):
            raise ValueError("LLM did not return a JSON array.")
        for card in flashcards_data:
            if not isinstance(card, dict) or "question" not in card or "answer" not in card:
                raise ValueError("LLM returned malformed flashcard data.")

        return jsonify(flashcards_data)

    except json.JSONDecodeError as e:
        logger.error(f"LLM output was not valid JSON: {generated_text[:200]}... Error: {e}")
        return jsonify({"error": "LLM failed to produce valid JSON flashcards. Please try again or refine input."}), 500
    except ValueError as e:
        logger.error(f"LLM output JSON was malformed: {e}. Raw: {generated_text[:200]}...")
        return jsonify({"error": "LLM returned malformed flashcard data. Please try again."}), 500
    except Exception as e:
        logger.error(f"An unexpected error occurred during flashcard generation: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

