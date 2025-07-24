from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams
import os
import time
import requests

# Initialize Qdrant client with environment variable support
# For Railway deployment, use the internal service URL
QDRANT_URL = os.getenv('QDRANT_URL') or os.getenv('RAILWAY_QDRANT_URL') or 'http://localhost:6333'
print(f"Connecting to Qdrant at: {QDRANT_URL}", flush=True)

def test_qdrant_connection():
    """Test if Qdrant service is reachable"""
    try:
        print("Testing Qdrant connection...", flush=True)
        print(f"Attempting to connect to: {QDRANT_URL}", flush=True)
        print(f"Environment variables:", flush=True)
        print(f"  QDRANT_URL: {os.getenv('QDRANT_URL')}", flush=True)
        print(f"  RAILWAY_QDRANT_URL: {os.getenv('RAILWAY_QDRANT_URL')}", flush=True)
        
        # Try a simple HTTP request first - Qdrant doesn't have /health, use / instead
        if QDRANT_URL.startswith('http'):
            try:
                print("Testing HTTP connection...", flush=True)
                response = requests.get(f"{QDRANT_URL}/", timeout=10)
                print(f"Root endpoint response status: {response.status_code}", flush=True)
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if 'title' in data and 'qdrant' in data['title'].lower():
                            print(f"✅ Qdrant service responding: {data.get('title', 'Unknown')} v{data.get('version', 'Unknown')}", flush=True)
                        else:
                            print(f"✅ Service responding but might not be Qdrant: {data}", flush=True)
                    except:
                        print("✅ Service responding but response not JSON", flush=True)
                else:
                    print(f"❌ Root endpoint failed with status: {response.status_code}", flush=True)
            except requests.exceptions.RequestException as e:
                print(f"❌ HTTP request failed: {str(e)}", flush=True)
                return False
        
        # Test collections endpoint specifically
        try:
            print("Testing collections endpoint...", flush=True)
            response = requests.get(f"{QDRANT_URL}/collections", timeout=10)
            print(f"Collections endpoint response status: {response.status_code}", flush=True)
            if response.status_code == 200:
                data = response.json()
                print(f"Collections response: {data}", flush=True)
            else:
                print(f"Collections endpoint failed with status: {response.status_code}", flush=True)
        except Exception as e:
            print(f"Collections endpoint test failed: {str(e)}", flush=True)
        
        # Try Qdrant client connection with collections endpoint
        print("Testing QdrantClient connection...", flush=True)
        test_client = QdrantClient(url=QDRANT_URL, timeout=30)  # Increased timeout
        print("QdrantClient created, testing get_collections...", flush=True)
        collections = test_client.get_collections()
        print(f"✅ Successfully connected to Qdrant. Collections: {len(collections.collections)}", flush=True)
        return True
        
    except Exception as e:
        print(f"❌ Qdrant connection test failed: {str(e)}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)
        import traceback
        print(f"Full traceback: {traceback.format_exc()}", flush=True)
        return False

# Test connection on import
test_qdrant_connection()

# Simple configuration for local development
try:
    # Try different client configurations for Railway compatibility
    if QDRANT_URL.startswith('https://'):
        print("Using HTTPS configuration for QdrantClient", flush=True)
        # For HTTPS, we might need different configuration
        qdrant_client = QdrantClient(
            url=QDRANT_URL, 
            timeout=60,  # Increased timeout for Railway
            # Add any additional HTTPS-specific config here if needed
        )
    else:
        print("Using HTTP configuration for QdrantClient", flush=True)
        qdrant_client = QdrantClient(url=QDRANT_URL, timeout=30)
    
    print("✅ Qdrant client initialized successfully", flush=True)
except Exception as e:
    print(f"❌ Failed to initialize Qdrant client: {str(e)}", flush=True)
    qdrant_client = None

def get_embeddings(api_key):
    """
    Initialize Gemini embeddings with the provided API key
    """
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=api_key,
    )

def ensure_collection_exists(collection_name: str, embedding_size: int = 768, recreate: bool = True):
    """
    Ensures that the Qdrant collection exists, creates it if it doesn't.
    If recreate is True, it will delete and recreate the collection.
    """
    if qdrant_client is None:
        print("❌ Qdrant client not initialized, cannot ensure collection exists", flush=True)
        return False
        
    try:
        print(f"Checking if collection '{collection_name}' exists...", flush=True)
        
        # Check if collection exists
        collection_exists = False
        try:
            print(f"Getting collection info for '{collection_name}'...", flush=True)
            collection_info = qdrant_client.get_collection(collection_name)
            collection_exists = True
            print(f"Collection '{collection_name}' exists", flush=True)
        except UnexpectedResponse as e:
            print(f"Collection '{collection_name}' does not exist: {e}", flush=True)
            collection_exists = False
        except Exception as e:
            print(f"Error checking collection existence: {str(e)}", flush=True)
            return False

        # Handle recreation if needed
        if collection_exists and recreate:
            print(f"Deleting existing collection {collection_name}", flush=True)
            qdrant_client.delete_collection(collection_name)
            collection_exists = False
            print(f"Successfully deleted collection {collection_name}", flush=True)
        
        # Create collection if it doesn't exist
        if not collection_exists:
            print(f"Creating collection '{collection_name}' with size {embedding_size}...", flush=True)
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=embedding_size,
                    distance=Distance.COSINE
                )
            )
            print(f"Successfully created collection: {collection_name}", flush=True)
        else:
            print(f"Using existing collection: {collection_name}", flush=True)
        
        return True
            
    except Exception as e:
        print(f"Error in ensure_collection_exists: {str(e)}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)
        return False

def get_vector_store(api_key, recreate: bool = True):
    """
    Get or create vector store for the collection.
    If recreate is True, it will create a fresh collection.
    """
    if qdrant_client is None:
        raise Exception("Qdrant client not initialized - check QDRANT_URL environment variable")
        
    try:
        # Try to ensure collection exists
        if not ensure_collection_exists("yt-rag", recreate=recreate):
            raise Exception("Failed to create or verify collection")
        
        # Initialize vector store with provided API key
        embeddings = get_embeddings(api_key)
        return QdrantVectorStore(
            client=qdrant_client,
            collection_name="yt-rag",
            embedding=embeddings,
        )
    except Exception as e:
        print(f"Error in get_vector_store: {str(e)}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)
        raise

def get_relevant_transcript_chunks(query: str, api_key: str):
    """
    Retrieve semantically relevant chunks of the video transcript based on the query.
    """
    try:
        # Use existing vector store (transcript should already be processed)
        vector_store = get_vector_store(api_key, recreate=False)
        return vector_store.similarity_search(query=query)
    except Exception as e:
        print(f"Error during similarity search: {e}")
        # Return empty list if no vector store exists yet
        return []

def store_documents_in_vector_db(docs, api_key):
    """
    Store documents in vector database
    """
    try:
        print(f"\n=== Storing in Vector Database ===")
        vector_store = get_vector_store(api_key, recreate=True)
        vector_store.add_documents(documents=docs)
        print(f"Successfully stored {len(docs)} documents in vector database")
        return True
    except Exception as e:
        print(f"Vector store error: {str(e)}", flush=True)
        return False 