from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import os
import time


# Import utility modules
from utils import setup_console_encoding
from youtube_utils import create_youtube_transcript_api, get_transcript_safely
from vector_store_utils import get_relevant_transcript_chunks, store_documents_in_vector_db, get_collection_point_count
from ai_utils import get_ai_response, generate_quick_questions

# Load environment variables
load_dotenv()

# Set console encoding to UTF-8
setup_console_encoding()

# Initialize YouTube Transcript API
ytt_api = create_youtube_transcript_api()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize text splitter with optimized settings for sliding window
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,  # Increased for better context
    chunk_overlap=625,  # 25% overlap for continuity
    length_function=len,
)

@app.route('/api/debug', methods=['GET'])
def debug_connection():
    """
    Debug endpoint to test Qdrant connectivity from Railway
    """
    try:
        import os
        import requests
        from vector_store_utils import QDRANT_URL, test_qdrant_connection
        
        debug_info = {
            "environment_vars": {
                "QDRANT_URL": os.getenv('QDRANT_URL'),
                "RAILWAY_QDRANT_URL": os.getenv('RAILWAY_QDRANT_URL'),
            },
            "computed_url": QDRANT_URL,
            "connection_test": None,
            "http_test": None,
            "error": None
        }
        
        # Test basic HTTP connection
        try:
            response = requests.get(f"{QDRANT_URL}/", timeout=10)
            debug_info["http_test"] = {
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "response_preview": str(response.text)[:200] if response.text else None
            }
        except Exception as e:
            debug_info["http_test"] = {
                "error": str(e),
                "error_type": type(e).__name__
            }
        
        # Test Qdrant connection
        debug_info["connection_test"] = test_qdrant_connection()
        
        return jsonify({
            "success": True,
            "debug_info": debug_info
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }), 500

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    """
    Extract transcript from YouTube video and process it for RAG system
    """
    video_id = request.args.get('video_id')
    languages = request.args.get('languages')
    api_key = request.headers.get('X-API-Key')
    
    if not video_id:
        return jsonify({
            "success": False,
            "error": "Missing video_id parameter"
        }), 400
    
    if not api_key:
        return jsonify({
            "success": False,
            "error": "Missing API key in X-API-Key header"
        }), 400
        
    # Early exit if collection already populated
    collection_name = video_id
    overall_start = time.perf_counter()
    try:
        count_start = time.perf_counter()
        existing_points = get_collection_point_count(collection_name)
        count_ms = int((time.perf_counter() - count_start) * 1000)
        print(f"⏱️ Existing collection count check took {count_ms} ms (count={existing_points})", flush=True)
    except Exception as e:
        print(f"Count check failed: {str(e)}", flush=True)
        existing_points = 0

    if existing_points > 0:
        # Skip transcript fetch/storage; generate quick-questions directly
        try:
            broad_query = "main topics discussed content overview summary"
            quick_ss_start = time.perf_counter()
            relevant_chunks = get_relevant_transcript_chunks(broad_query, api_key, collection_name, k=2)
            quick_similarity_ms = int((time.perf_counter() - quick_ss_start) * 1000)
            print(f"⏱️ Quick similarity search for questions took {quick_similarity_ms} ms (skip-ingest path)", flush=True)

            qq_start = time.perf_counter()
            quick_questions = generate_quick_questions(relevant_chunks, api_key)
            qq_ms = int((time.perf_counter() - qq_start) * 1000)
            print(f"⏱️ Quick questions generation took {qq_ms} ms (skip-ingest path)", flush=True)

            total_ms = int((time.perf_counter() - overall_start) * 1000)
            print(f"⏱️ /api/transcript total time {total_ms} ms (skip-ingest path)", flush=True)

            return jsonify({
                "success": True,
                "detected_lang": None,
                "quick-questions": quick_questions,
                "timings": {
                    "existing_collection_count_ms": count_ms,
                    "quick_similarity_search_ms": quick_similarity_ms,
                    "quick_question_generation_ms": qq_ms,
                    "total_endpoint_ms": total_ms,
                    "skipped_ingest": True
                }
            })
        except Exception as e:
            # Fall back to normal path if anything fails
            print(f"Skip-ingest path failed: {str(e)}; proceeding to fetch transcript", flush=True)

    # Get transcript from YouTube (normal path)
    result = get_transcript_safely(video_id, languages, ytt_api)
    
    if not result.get('success'):
        return jsonify(result)
    
    # Store documents in vector database using video_id as collection name
    docs = result.get('docs', [])
    if docs:
        storage_start = time.perf_counter()
        storage_success = store_documents_in_vector_db(docs, api_key, collection_name)
        storage_ms = int((time.perf_counter() - storage_start) * 1000)
        print(f"⏱️ Vector DB storage took {storage_ms} ms", flush=True)
        if storage_success:
            result['chunks_processed'] = len(docs)
        else:
            result['warning'] = "Failed to store in vector database"
        # Attach timings
        result.setdefault('timings', {})['vector_store_storage_ms'] = storage_ms
    
    # Remove non-serializable docs from result before returning
    if 'docs' in result:
        del result['docs']
    
    # Generate quick questions if transcript was successfully processed
    if result.get('success') and result.get('data'):
        try:
            # Get relevant chunks from vector database for question generation
            broad_query = "main topics discussed content overview summary"
            quick_ss_start = time.perf_counter()
            relevant_chunks = get_relevant_transcript_chunks(broad_query, api_key, collection_name, k=2)
            quick_similarity_ms = int((time.perf_counter() - quick_ss_start) * 1000)
            print(f"⏱️ Quick similarity search for questions took {quick_similarity_ms} ms", flush=True)
            
            # Generate questions using AI
            qq_start = time.perf_counter()
            quick_questions = generate_quick_questions(relevant_chunks, api_key)
            qq_ms = int((time.perf_counter() - qq_start) * 1000)
            print(f"⏱️ Quick questions generation took {qq_ms} ms", flush=True)
            result['quick-questions'] = quick_questions
            # Attach timings
            timings = result.setdefault('timings', {})
            timings['quick_similarity_search_ms'] = quick_similarity_ms
            timings['quick_question_generation_ms'] = qq_ms
            
        except Exception as e:
            print(f"Error generating quick questions: {str(e)}")
            # Continue without questions if generation fails
            result['quick-questions'] = []
    
    # Remove data from result before returning
    if 'data' in result:
        del result['data']
    
    # Finalize timings
    total_ms = int((time.perf_counter() - overall_start) * 1000)
    result.setdefault('timings', {})['total_endpoint_ms'] = total_ms
    print(f"⏱️ /api/transcript total time {total_ms} ms", flush=True)
    return jsonify(result)

@app.route('/api/query', methods=['POST'])
def query_transcript():
    """
    Query the processed transcript using RAG system
    """
    try:
        data = request.get_json()
        api_key = request.headers.get('X-API-Key')
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Missing query in request body"
            }), 400
        
        if not api_key:
            return jsonify({
                "success": False,
                "error": "Missing API key in X-API-Key header"
            }), 400

        # Get video_id from request body to determine which collection to query
        video_id = data.get('video_id')
        if not video_id:
            return jsonify({
                "success": False,
                "error": "Missing video_id in request body"
            }), 400

        # Get model from request body (default to gemini-flash if not provided)
        model = data.get('model', 'gemini-flash')
        print(f"Using model: {model}", flush=True)

        user_query = data['query']
        collection_name = video_id
        
        # Get relevant chunks from vector database
        ss_start = time.perf_counter()
        relevant_chunks = get_relevant_transcript_chunks(user_query, api_key, collection_name)
        ss_ms = int((time.perf_counter() - ss_start) * 1000)
        print(f"⏱️ Query similarity search took {ss_ms} ms", flush=True)
        
        # Generate AI response with the specified model
        ai_start = time.perf_counter()
        response_data = get_ai_response(user_query, relevant_chunks, api_key, model=model)
        ai_ms = int((time.perf_counter() - ai_start) * 1000)
        print(f"⏱️ AI response generation took {ai_ms} ms with model {model}", flush=True)
        
        return jsonify({
            "success": True,
            "response": response_data["content"],
            "timestamps": response_data["timestamps"],
            "timings": {
                "similarity_search_ms": ss_ms,
                "ai_generation_ms": ai_ms
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True) 
    