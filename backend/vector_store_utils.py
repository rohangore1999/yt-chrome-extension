from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams
import os
import time
import requests
import json

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
        
        # Try multiple configuration approaches for HTTPS
        qdrant_client = None
        
        # Attempt 1: Standard HTTPS configuration
        try:
            print("Attempting standard HTTPS connection...", flush=True)
            qdrant_client = QdrantClient(
                url=QDRANT_URL, 
                timeout=60,
                # Try with explicit HTTPS settings
                prefer_grpc=False  # Force HTTP API instead of gRPC
            )
            # Test the connection immediately
            test_collections = qdrant_client.get_collections()
            print("✅ Standard HTTPS connection successful", flush=True)
        except Exception as e:
            print(f"Standard HTTPS failed: {str(e)}", flush=True)
            qdrant_client = None
        
        # Attempt 2: If standard fails, try with port specification
        if qdrant_client is None:
            try:
                print("Attempting HTTPS with port 443...", flush=True)
                # Railway HTTPS is on port 443
                url_with_port = QDRANT_URL.replace('.app', '.app:443')
                qdrant_client = QdrantClient(
                    url=url_with_port,
                    timeout=60,
                    prefer_grpc=False
                )
                test_collections = qdrant_client.get_collections()
                print("✅ HTTPS with port 443 successful", flush=True)
            except Exception as e:
                print(f"HTTPS with port failed: {str(e)}", flush=True)
                qdrant_client = None
        
        # Attempt 3: Try HTTP instead of HTTPS (Railway might redirect)
        if qdrant_client is None:
            try:
                print("Attempting HTTP fallback (Railway auto-redirects)...", flush=True)
                http_url = QDRANT_URL.replace('https://', 'http://')
                qdrant_client = QdrantClient(
                    url=http_url,
                    timeout=60,
                    prefer_grpc=False
                )
                test_collections = qdrant_client.get_collections()
                print("✅ HTTP fallback successful", flush=True)
            except Exception as e:
                print(f"HTTP fallback failed: {str(e)}", flush=True)
                qdrant_client = None
                
    else:
        print("Using HTTP configuration for QdrantClient", flush=True)
        qdrant_client = QdrantClient(url=QDRANT_URL, timeout=30)
    
    if qdrant_client is not None:
        print("✅ Qdrant client initialized successfully", flush=True)
    else:
        print("❌ All QdrantClient connection attempts failed, will use HTTP fallback", flush=True)
        
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

def create_collection_via_http(collection_name: str, embedding_size: int = 768):
    """
    Create collection using direct HTTP requests as fallback when qdrant-client fails
    """
    try:
        # Check if collection exists
        response = requests.get(f"{QDRANT_URL}/collections/{collection_name}", timeout=10)
        
        if response.status_code == 200:
            print(f"Collection '{collection_name}' already exists (via HTTP)", flush=True)
            return True
        elif response.status_code == 404:
            # Collection doesn't exist, create it
            print(f"Creating collection '{collection_name}' via HTTP API...", flush=True)
            
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
                print(f"✅ Successfully created collection '{collection_name}' via HTTP", flush=True)
                return True
            else:
                print(f"❌ Failed to create collection via HTTP: {create_response.status_code} - {create_response.text}", flush=True)
                return False
        else:
            print(f"❌ Unexpected response checking collection: {response.status_code}", flush=True)
            return False
            
    except Exception as e:
        print(f"❌ HTTP collection creation failed: {str(e)}", flush=True)
        return False

def ensure_collection_exists(collection_name: str, embedding_size: int = 768, recreate: bool = False):
    """
    Ensures that the Qdrant collection exists, creates it if it doesn't.
    If recreate is True, it will delete and recreate the collection.
    """
    if qdrant_client is None:
        print("❌ Qdrant client not initialized, trying HTTP fallback...", flush=True)
        return create_collection_via_http(collection_name, embedding_size)
        
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
            print(f"Trying HTTP fallback for collection check...", flush=True)
            return create_collection_via_http(collection_name, embedding_size)

        # Handle recreation if needed
        if collection_exists and recreate:
            print(f"Deleting existing collection {collection_name}", flush=True)
            try:
                qdrant_client.delete_collection(collection_name)
                collection_exists = False
                print(f"Successfully deleted collection {collection_name}", flush=True)
            except Exception as e:
                print(f"Error deleting collection, trying HTTP: {str(e)}", flush=True)
                # Try HTTP delete
                delete_response = requests.delete(f"{QDRANT_URL}/collections/{collection_name}", timeout=10)
                if delete_response.status_code in [200, 404]:
                    collection_exists = False
                    print(f"Successfully deleted collection via HTTP", flush=True)
        
        # Create collection if it doesn't exist
        if not collection_exists:
            print(f"Creating collection '{collection_name}' with size {embedding_size}...", flush=True)
            try:
                qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=embedding_size,
                        distance=Distance.COSINE
                    )
                )
                print(f"Successfully created collection: {collection_name}", flush=True)
            except Exception as e:
                print(f"Error creating collection via client, trying HTTP: {str(e)}", flush=True)
                return create_collection_via_http(collection_name, embedding_size)
        else:
            print(f"Using existing collection: {collection_name}", flush=True)
        
        return True
            
    except Exception as e:
        print(f"Error in ensure_collection_exists: {str(e)}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)
        print(f"Trying HTTP fallback...", flush=True)
        return create_collection_via_http(collection_name, embedding_size)

def get_vector_store(api_key, collection_name="yt-rag", recreate: bool = False):
    """
    Get or create vector store for the collection.
    If recreate is True, it will delete and create a fresh collection.
    If recreate is False (default), it will use existing collection or create if doesn't exist.
    """
    if qdrant_client is None:
        raise Exception("Qdrant client not initialized - check QDRANT_URL environment variable")
        
    try:
        # Try to ensure collection exists
        if not ensure_collection_exists(collection_name, recreate=recreate):
            raise Exception("Failed to create or verify collection")
        
        # Initialize vector store with provided API key
        embeddings = get_embeddings(api_key)
        return QdrantVectorStore(
            client=qdrant_client,
            collection_name=collection_name,
            embedding=embeddings,
        )
    except Exception as e:
        print(f"Error in get_vector_store: {str(e)}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)
        raise

def get_relevant_transcript_chunks(query: str, api_key: str, collection_name: str):
    """
    Retrieve semantically relevant chunks of the video transcript based on the query.
    """
    try:
        # Use existing vector store (transcript should already be processed)
        vector_store = get_vector_store(api_key, collection_name, recreate=False)
        return vector_store.similarity_search(query=query)
    except Exception as e:
        print(f"Error during similarity search: {e}")
        # Return empty list if no vector store exists yet
        return []

def store_documents_in_vector_db(docs, api_key, collection_name):
    """
    Store documents in vector database
    """
    try:
        print(f"\n=== Storing in Vector Database ===")
        print(f"Collection name: {collection_name}")
        
        # Use existing collection if it exists, don't recreate
        vector_store = get_vector_store(api_key, collection_name, recreate=False)
        
        # Check if collection already has documents
        try:
            existing_docs = vector_store.similarity_search("", k=1)
            if existing_docs:
                print(f"Collection {collection_name} already has {len(existing_docs)} document(s), appending new documents")
            else:
                print(f"Collection {collection_name} is empty, adding documents")
        except Exception as e:
            print(f"Could not check existing documents: {str(e)}")
        
        vector_store.add_documents(documents=docs)
        print(f"Successfully stored {len(docs)} documents in vector database")
        return True
    except Exception as e:
        print(f"Vector store error: {str(e)}", flush=True)
        return False 