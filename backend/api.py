from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from deep_translator import GoogleTranslator
from langdetect import detect
import google.generativeai as genai
from dotenv import load_dotenv
import os
import sys
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams

# Set console encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# Configure Google API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
translator = GoogleTranslator(source='auto', target='en')
ytt_api = YouTubeTranscriptApi()

# Initialize Qdrant client
qdrant_client = QdrantClient(url="http://localhost:6333")

def ensure_collection_exists(collection_name: str, embedding_size: int = 768, recreate: bool = True):
    """
    Ensures that the Qdrant collection exists, creates it if it doesn't.
    If recreate is True, it will delete and recreate the collection.
    """
    try:
        # Check if collection exists
        collection_exists = False
        try:
            collection_info = qdrant_client.get_collection(collection_name)
            collection_exists = True
        except UnexpectedResponse:
            collection_exists = False

        # Handle recreation if needed
        if collection_exists and recreate:
            print(f"Deleting existing collection {collection_name}")
            qdrant_client.delete_collection(collection_name)
            collection_exists = False
        
        # Create collection if it doesn't exist
        if not collection_exists:
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=embedding_size,
                    distance=Distance.COSINE
                )
            )
            print(f"Successfully created collection: {collection_name}")
        else:
            print(f"Using existing collection: {collection_name}")
        
        return True
            
    except Exception as e:
        print(f"Error in ensure_collection_exists: {str(e)}")
        return False

# Set console encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Initialize text splitter with optimized settings for sliding window
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,  # Increased for better context
    chunk_overlap=625,  # 25% overlap for continuity
    length_function=len,
)

# Initialize Gemini embeddings for semantic search
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GOOGLE_API_KEY,
)

def get_vector_store(recreate: bool = True):
    """
    Get or create vector store for the collection.
    If recreate is True, it will create a fresh collection.
    """
    try:
        # Try to ensure collection exists
        if not ensure_collection_exists("yt-rag", recreate=recreate):
            raise Exception("Failed to create or verify collection")
        
        # Initialize vector store
        return QdrantVectorStore(
            client=qdrant_client,
            collection_name="yt-rag",
            embedding=embeddings,
        )
    except Exception as e:
        print(f"Error in get_vector_store: {str(e)}")
        raise

def get_relevant_transcript_chunks(query: str):
    """
    Retrieve semantically relevant chunks of the video transcript based on the query.
    """
    try:
        # When querying, we don't need to recreate the vector store
        vector_store = get_vector_store(recreate=False)
        return vector_store.similarity_search(query=query)
    except Exception as e:
        print(f"Error during similarity search: {e}")
        return []

def format_timestamp(seconds):
    """
    Format timestamp into clickable format with hours, minutes, and seconds
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"

def get_ai_response(query: str, chunks):
    """
    Get AI response based on the query and relevant transcript chunks using Gemini.
    """
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Format chunks to include translated text and timestamps
    formatted_chunks = []
    for chunk in chunks:
        timestamp = chunk.metadata.get('start_time', 0)
        duration = chunk.metadata.get('duration', 0)
        translated_text = chunk.page_content
        
        formatted_chunks.append(f"""
        [{format_timestamp(timestamp)}]
        Content: {translated_text}
        """)
    
    system_prompt = f"""
    You are an expert content analyzer who helps users understand video content.
    
    When responding:
    1. Structure your response with clear sections (e.g., ### Overview, ### Details)
    2. Use bullet points for clarity
    3. ALWAYS include timestamps in [MM:SS] format (not parentheses)
    4. Keep responses concise and focused
    5. Format timestamps consistently as [MM:SS] or [HH:MM:SS] for longer videos
    6. Place timestamps at the end of each point in square brackets, like: [MM:SS]
    7. Make sure each point has a unique and accurate timestamp
    
    Example format:
    * This is a point about the video [12:34]
    * Another important point from a different part [15:20]
    
    Available Context:
    {formatted_chunks}

    User Question: {query}
    """

    response = model.generate_content(system_prompt)
    
    # Process response to ensure timestamps are properly formatted
    processed_response = response.text
    
    # Extract all timestamps from the response for the timestamps array
    timestamp_pattern = r'\[(\d{2}:\d{2})\]'
    found_timestamps = []
    
    for chunk in chunks:
        timestamp = format_timestamp(chunk.metadata.get('start_time', 0))
        text_preview = chunk.page_content[:100] + "..." if len(chunk.page_content) > 100 else chunk.page_content
        found_timestamps.append({
            "time": timestamp,
            "text": text_preview
        })
    
    # Return structured response with actual timestamps from chunks
    return {
        "content": processed_response,
        "timestamps": found_timestamps
    }

def process_transcript_entries(transcript_data, video_id, detected_lang):
    """
    Process transcript entries to create optimized chunks with sliding window.
    """
    print(f"\n=== Processing Transcript Data ===")
    print(f"Total transcript entries: {len(transcript_data)}")
    print(f"Video ID: {video_id}")
    print(f"Language: {detected_lang}")
    
    # First, combine all transcript entries into a single document with metadata
    combined_entries = []
    TARGET_CHUNK_SIZE = 2500
    
    for entry in transcript_data:
        combined_entries.append({
            'text': entry['text'],
            'start_time': entry['start_time'],
            'duration': entry['duration'],
            'original_text': entry['original_text']
        })
    
    print(f"Combined entries: {len(combined_entries)}")
    
    # Create documents with combined text and preserved metadata
    docs = []
    current_chunk = []
    current_metadata = {
        'start_time': 0,
        'duration': 0,
        'segments': [],
        'video_id': video_id,
        'detected_language': detected_lang
    }
    
    for entry in combined_entries:
        current_chunk.append(entry['text'])
        
        # Update metadata
        if not current_metadata['segments']:
            current_metadata['start_time'] = entry['start_time']
        
        current_metadata['duration'] += entry['duration']
        current_metadata['segments'].append({
            'text': entry['text'],
            'original_text': entry['original_text'],
            'start_time': entry['start_time'],
            'duration': entry['duration']
        })
        
        # Create a document when we have enough text
        combined_text = ' '.join(current_chunk)
        if len(combined_text) >= TARGET_CHUNK_SIZE:
            docs.append(Document(
                page_content=combined_text,
                metadata=current_metadata.copy()
            ))
            print(f"Created chunk {len(docs)} with {len(current_metadata['segments'])} segments")
            
            # Reset for next chunk, keeping overlap
            overlap_segments = current_metadata['segments'][-2:]  # Keep last 2 segments for overlap
            current_chunk = [seg['text'] for seg in overlap_segments]
            current_metadata = {
                'start_time': overlap_segments[0]['start_time'],
                'duration': sum(seg['duration'] for seg in overlap_segments),
                'segments': overlap_segments,
                'video_id': video_id,
                'detected_language': detected_lang
            }
    
    # Add the last chunk if it has content
    if current_chunk:
        docs.append(Document(
            page_content=' '.join(current_chunk),
            metadata=current_metadata.copy()
        ))
        print(f"Created final chunk {len(docs)} with {len(current_metadata['segments'])} segments")
    
    print(f"\nTotal chunks created: {len(docs)}")
    print("=== Processing Complete ===\n")
    return docs

def get_transcript_safely(video_id, languages):
    try:
        print(f"\n=== Fetching Transcript ===")
        print(f"Video ID: {video_id}")
        transcript_list = ytt_api.list(video_id)
        
        # Initialize list to store transcript data
        transcript_data = []
        detected_lang = None
        
        for transcript in transcript_list:
            data = transcript.fetch()
            print(f"Fetched transcript with {len(data) if data else 0} entries")
            
            if data and not detected_lang:
                try:
                    detected_lang = detect(data[0].text)
                    print(f"Detected language: {detected_lang}")
                except Exception as e:
                    print(f"Language detection error: {e}")
                    detected_lang = 'unknown'
            
            for entry in data:
                original_text = entry.text
                if detected_lang == 'hi':
                    try:
                        processed_text = translator.translate(original_text)
                        print("Translated text from Hindi to English")
                    except Exception as e:
                        print(f"Translation error: {e}")
                        processed_text = original_text
                else:
                    processed_text = original_text
                
                transcript_data.append({
                    'text': processed_text,
                    'original_text': original_text,
                    'start_time': entry.start,
                    'duration': entry.duration,
                    'detected_language': detected_lang
                })
        
        if not transcript_data:
            print("No transcript data found")
            return {
                'success': False,
                'error': "No transcript data found"
            }
        
        print(f"Total transcript entries collected: {len(transcript_data)}")
        
        # Process transcript data using sliding window approach
        docs = process_transcript_entries(transcript_data, video_id, detected_lang)
        
        try:
            print("\n=== Storing in Vector Database ===")
            # Get vector store with recreation enabled
            vector_store = get_vector_store(recreate=True)
            print(f"Adding {len(docs)} documents to fresh vector store")
            vector_store.add_documents(documents=docs)
            print("Successfully stored all documents in new collection")
            
            return {
                'success': True,
                'data': transcript_data,
                'chunks_processed': len(docs)
            }
            
        except Exception as e:
            print(f"Vector store error: {str(e)}")
            # Return partial success if we at least got the transcript
            return {
                'success': True,
                'data': transcript_data,
                'warning': f"Failed to store in vector database: {str(e)}"
            }
        
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable) as e:
        print(f"YouTube transcript error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    video_id = request.args.get('video_id')
    languages = request.args.get('languages')
    
    if not video_id:
        return jsonify({
            "success": False,
            "error": "Missing video_id parameter"
        }), 400
        
    result = get_transcript_safely(video_id, languages)
    return jsonify(result)

@app.route('/api/query', methods=['POST'])
def query_transcript():
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Missing query in request body"
            }), 400

        user_query = data['query']
        relevant_chunks = get_relevant_transcript_chunks(user_query)
        response_data = get_ai_response(user_query, relevant_chunks)
        
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
    