from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_marshmallow import Marshmallow
from llama_cpp import Llama
from pymilvus import MilvusClient
from sentence_transformers import SentenceTransformer
import pathlib
import logging

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
jwt_blacklist = set()
socketio = SocketIO(cors_allowed_origins="*")
ma = Marshmallow()

llama_model = None

db_path = "./milvus_rag.db"
collection_name = "ultra_learning_collection"
embedding_dim = 384
embed_model = None # Global variable for embedding model

# Global variables (initialized as None)
_milvus_client = None



def init_llama_model(
    model_path, n_ctx=4096, n_gpu_layers=0, verbose=False
):
    global llama_model
    if llama_model is None:
        try:
            llama_model = Llama(
                model_path=model_path,
                n_ctx=n_ctx,
                n_gpu_layers=n_gpu_layers,
                verbose=verbose,
            )
            logging.info(f"Llama model loaded from {model_path} with context {n_ctx}")
        except Exception as e:
            logging.error(f"Failed to load Llama model: {e}")
            raise RuntimeError(f"Error loading Llama model: {e}")
    return llama_model

def init_embed_model(model_name="all-MiniLM-L6-v2"): # A common small, fast model
    """
    Initializes and returns the global embedding model.
    """
    global embed_model
    if embed_model is None:
        try:
            embed_model = SentenceTransformer(model_name)
            logging.info(f"Embedding model '{model_name}' loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load embedding model '{model_name}': {e}")
            raise RuntimeError(f"Error loading embedding model: {e}")
    return embed_model

def init_milvus_client(db_path=db_path, collection=collection_name, dim=embedding_dim):
    """
    Initialize and return the global MilvusClient singleton.
    Only creates the collection if it does not exist.
    """
    global _milvus_client
    if _milvus_client is None:
        # Ensure directory exists
        pathlib.Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        _milvus_client = MilvusClient(db_path)

        try:
            _milvus_client.create_collection(
                collection_name=collection,
                dimension=dim,
            )
        except Exception as e:
            # Ignore error if collection already exists
            if "already exists" not in str(e).lower():
                raise e

    return _milvus_client

def get_milvus_client():
    """
    Return the initialized MilvusClient instance.
    Raises RuntimeError if not initialized.
    """
    global _milvus_client
    if _milvus_client is None:
        raise RuntimeError(
            "Milvus client not initialized. "
            "Did you forget to call init_milvus_client() in your app factory?"
        )
    return _milvus_client

def insert_documents(docs: list):
    """
    Insert documents into Milvus collection.
    docs: List of dict where each dict should have keys: 'id', 'text', 'subject'.
          Vectors will be generated from 'text' using embed_model.
    """
    global _milvus_client
    if _milvus_client is None:
        raise ValueError("Milvus client not initialized")
    if embed_model is None:
        raise ValueError("Embedding model not initialized to embed documents.")

    # Prepare data for insertion: add vectors
    data_to_insert = []
    for doc in docs:
        if 'text' not in doc:
            raise ValueError("Document must contain 'text' field for embedding.")
        doc_vector = embed_model.encode(doc['text']).tolist() # Convert numpy array to list
        new_doc = {
            "id": doc.get('id'), # Milvus will assign if not provided
            "text": doc['text'],
            "subject": doc.get('subject', 'general'),
            "vector": doc_vector
        }
        data_to_insert.append(new_doc)

    return _milvus_client.insert(collection_name=collection_name, data=data_to_insert)

def search_vectors(query_embedding: list, top_k=5, filter_expr=None):
    """
    Search similar vectors.
    query_embedding: a single vector (list of floats) representing the query.
    filter_expr: string filter expression, e.g. "subject == 'history'"
    """
    global _milvus_client
    if _milvus_client is None:
        raise ValueError("Milvus client not initialized")

    return _milvus_client.search(
        collection_name=collection_name,
        data=[query_embedding], # MilvusClient.search expects a list of query vectors
        filter=filter_expr,
        limit=top_k,
        output_fields=["text", "subject"]
    )

def query_documents(filter_expr=None):
    """
    Query documents by filter expression (no vector similarity).
    """
    global milvus_client
    if not milvus_client:
        raise ValueError("Milvus client not initialized")

    return milvus_client.query(
        collection_name=collection_name,
        filter=filter_expr,
        output_fields=["text", "subject"]
    )

def delete_documents(filter_expr=None):
    """
    Delete documents matching filter expression.
    """
    global milvus_client
    if not milvus_client:
        raise ValueError("Milvus client not initialized")

    return milvus_client.delete(
        collection_name=collection_name,
        filter=filter_expr,
    )
