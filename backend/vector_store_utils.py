from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams
import os
import requests
import json

# Initialize Qdrant client with environment variable support
QDRANT_URL = os.getenv('QDRANT_URL') or os.getenv('RAILWAY_QDRANT_URL') or 'http://localhost:6333'
print(f"Connecting to Qdrant at: {QDRANT_URL}", flush=True)

# Initialize Qdrant client (may fail on Railway HTTPS)
try:
    qdrant_client = QdrantClient(url=QDRANT_URL, timeout=30, prefer_grpc=False)
    print("✅ Qdrant client initialized", flush=True)
except Exception as e:
    print(f"❌ Qdrant client failed, will use HTTP fallback: {str(e)}", flush=True)
    qdrant_client = None

def get_embeddings(api_key):
    """Initialize Gemini embeddings with the provided API key"""
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=api_key,
    )

def create_collection_via_http(collection_name: str, embedding_size: int = 768):
    """Create collection using HTTP API when qdrant-client fails"""
    try:
        # Check if collection exists
        response = requests.get(f"{QDRANT_URL}/collections/{collection_name}", timeout=10)
        
        if response.status_code == 200:
            print(f"Collection '{collection_name}' already exists", flush=True)
            return True
        elif response.status_code == 404:
            # Create collection
            collection_config = {
                "vectors": {
                    "size": embedding_size,
                    "distance": "Cosine"
                }
            }
            
            create_response = requests.put(
                f"{QDRANT_URL}/collections/{collection_name}",
                json=collection_config,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if create_response.status_code in [200, 201]:
                print(f"✅ Created collection '{collection_name}' via HTTP", flush=True)
                return True
            else:
                print(f"❌ Failed to create collection: {create_response.status_code}", flush=True)
                return False
        else:
            print(f"❌ Unexpected response: {response.status_code}", flush=True)
            return False
            
    except Exception as e:
        print(f"❌ HTTP collection creation failed: {str(e)}", flush=True)
        return False

def ensure_collection_exists(collection_name: str, embedding_size: int = 768, recreate: bool = True):
    """Ensure Qdrant collection exists, using HTTP fallback if needed"""
    
    # If no client, use HTTP fallback
    if qdrant_client is None:
        return create_collection_via_http(collection_name, embedding_size)
        
    try:
        # Try using qdrant-client first
        collection_exists = False
        try:
            qdrant_client.get_collection(collection_name)
            collection_exists = True
            print(f"Collection '{collection_name}' exists", flush=True)
        except UnexpectedResponse:
            collection_exists = False
        except Exception:
            # Client failed, fallback to HTTP
            return create_collection_via_http(collection_name, embedding_size)

        # Handle recreation
        if collection_exists and recreate:
            try:
                qdrant_client.delete_collection(collection_name)
                collection_exists = False
                print(f"Deleted collection {collection_name}", flush=True)
            except Exception:
                # Try HTTP delete
                requests.delete(f"{QDRANT_URL}/collections/{collection_name}", timeout=10)
                collection_exists = False
        
        # Create if needed
        if not collection_exists:
            try:
                qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=embedding_size, distance=Distance.COSINE)
                )
                print(f"✅ Created collection: {collection_name}", flush=True)
            except Exception:
                return create_collection_via_http(collection_name, embedding_size)
        
        return True
            
    except Exception:
        return create_collection_via_http(collection_name, embedding_size)

def get_vector_store(api_key, recreate: bool = True):
    """Get or create vector store for the collection"""
    if qdrant_client is None:
        raise Exception("Qdrant client not initialized - check QDRANT_URL environment variable")
        
    try:
        # Ensure collection exists (may use HTTP fallback)
        if not ensure_collection_exists("yt-rag", recreate=recreate):
            raise Exception("Failed to create or verify collection")
        
        # Initialize vector store
        embeddings = get_embeddings(api_key)
        return QdrantVectorStore(
            client=qdrant_client,
            collection_name="yt-rag",
            embedding=embeddings,
        )
    except Exception as e:
        print(f"Error in get_vector_store: {str(e)}", flush=True)
        raise

def get_relevant_transcript_chunks(query: str, api_key: str):
    """Retrieve semantically relevant chunks from the transcript"""
    try:
        vector_store = get_vector_store(api_key, recreate=False)
        return vector_store.similarity_search(query=query)
    except Exception as e:
        print(f"Error during similarity search: {e}")
        return []

def store_documents_in_vector_db(docs, api_key):
    """Store documents in vector database"""
    try:
        print(f"\n=== Storing in Vector Database ===")
        vector_store = get_vector_store(api_key, recreate=True)
        vector_store.add_documents(documents=docs)
        print(f"Successfully stored {len(docs)} documents in vector database")
        return True
    except Exception as e:
        print(f"Vector store error: {str(e)}", flush=True)
        return False 