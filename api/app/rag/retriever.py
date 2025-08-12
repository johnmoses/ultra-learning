from app.extensions import init_embed_model, search_vectors  # Your embedding model init
from typing import Optional

def fetch_context(query: str, patient_id: Optional[int] = None, top_k: int = 3) -> str:
    """
    Retrieve relevant EHR documents as LLM context using vector-based similarity search.
    If patient_id is provided, restrict search to that patient's docs.
    """
    embed_model = init_embed_model()
    embedding = embed_model.encode(query).tolist()

    # Vector search returns list of documents or textual chunks
    results = search_vectors(embedding, top_k=top_k, patient_id=patient_id)  # Implement patient filtering in your search_vectors

    if not results or not results[0]:
        return ""

    # Concatenate textual content from results into single context string
    context = "\n---\n".join(doc['text'] for doc in results[0])
    return context

