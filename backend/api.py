from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

# Import utility modules
from utils import setup_console_encoding
from youtube_utils import create_youtube_transcript_api, get_transcript_safely
from vector_store_utils import get_relevant_transcript_chunks, store_documents_in_vector_db
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
        
    # Get transcript from YouTube
    result = get_transcript_safely(video_id, languages, ytt_api)
    
    if not result.get('success'):
        return jsonify(result)
    
    # Store documents in vector database
    docs = result.get('docs', [])
    if docs:
        storage_success = store_documents_in_vector_db(docs, api_key)
        if storage_success:
            result['chunks_processed'] = len(docs)
        else:
            result['warning'] = "Failed to store in vector database"
    
    # Remove non-serializable docs from result before returning
    if 'docs' in result:
        del result['docs']
    
    # Generate quick questions if transcript was successfully processed
    if result.get('success') and result.get('data'):
        try:
            # Get relevant chunks from vector database for question generation
            broad_query = "main topics discussed content overview summary"
            relevant_chunks = get_relevant_transcript_chunks(broad_query, api_key)
            
            # Generate questions using AI
            quick_questions = generate_quick_questions(relevant_chunks, api_key)
            result['quick-questions'] = quick_questions
            
        except Exception as e:
            print(f"Error generating quick questions: {str(e)}")
            # Continue without questions if generation fails
            result['quick-questions'] = []
    
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

        user_query = data['query']
        
        # Get relevant chunks from vector database
        relevant_chunks = get_relevant_transcript_chunks(user_query, api_key)
        
        # Generate AI response
        response_data = get_ai_response(user_query, relevant_chunks, api_key)
        
        return jsonify({
            "success": True,
            "response": response_data["content"],
            "timestamps": response_data["timestamps"]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True) 
    