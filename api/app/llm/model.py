from app.extensions import init_llama_model

MODEL_PATH = "/Users/johnmoses/.cache/lm-studio/models/MaziyarPanahi/Meta-Llama-3-8B-Instruct-GGUF/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"

_llm_instance = None  # define the singleton variable here

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = init_llama_model(MODEL_PATH)
    return _llm_instance


def generate_response(
    messages: list,
    max_tokens=512,
    temperature=0.7,
    top_p=0.9,
    stop_tokens=None,
):
    model = get_llm()
    stop_tokens = stop_tokens or []

    response = model.create_chat_completion(
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        stop=stop_tokens,
    )
    return response["choices"][0]["message"]["content"].strip()
