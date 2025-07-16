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

# Load environment variables
load_dotenv()

# Configure Google API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
translator = GoogleTranslator(source='auto', target='en')

ytt_api = YouTubeTranscriptApi()

# Set console encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# Initialize Gemini embeddings for semantic search
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GOOGLE_API_KEY,
)

# Connect to existing Qdrant collection
retrieval = QdrantVectorStore.from_existing_collection(
    url="http://localhost:6333",
    collection_name="yt-rag",
    embedding=embeddings,
)

def get_relevant_transcript_chunks(query: str):
    """
    Retrieve semantically relevant chunks of the video transcript based on the query.
    """
    return retrieval.similarity_search(query=query)

def get_ai_response(query: str, chunks):
    """
    Get AI response based on the query and relevant transcript chunks using Gemini.
    Provides a summarized response with timestamps.
    """
    # Configure the model
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Format chunks to include translated text and timestamps
    formatted_chunks = []
    for chunk in chunks:
        timestamp = chunk.metadata.get('start_time', 0)
        duration = chunk.metadata.get('duration', 0)
        translated_text = chunk.page_content
        
        formatted_chunks.append(f"""
        [Timestamp: {timestamp}s, Duration: {duration}s]
        Content: {translated_text}
        """)
    
    system_prompt = f"""
    You are an expert content analyzer who helps users understand video content. Your responses should:

    1. ANALYSIS:
    - Provide clear, concise summaries of relevant video segments
    - Focus only on information directly related to the question
    - Include timestamps for each key point
    - Maintain a logical flow of information

    2. COMMUNICATION:
    - Be brief but informative
    - Use bullet points for clarity when appropriate
    - Provide direct answers
    - Include timestamps for reference

    Available Context:
    {formatted_chunks}

    This Context contains transcript segments with timestamps. Your response should:
    1. Directly answer the user's question
    2. Reference specific timestamps for key points
    3. Provide a concise summary of relevant information
    4. Focus on the most important details
    5. Use clear formatting with timestamps

    Format your response as:
    [Timestamp: Xs]
    Key Point/Summary
    
    [Timestamp: Ys]
    Next Key Point/Summary
    
    Brief conclusion if needed...

    User Question: {query}
    """

    # Generate response
    response = model.generate_content(system_prompt)
    return response.text

def detect_and_translate(text: str) -> tuple[str, str]:
    """
    Detect language and translate to English if Hindi
    """
    try:
        detected_lang = detect(text)
        if detected_lang == 'hi':
            try:
                return translator.translate(text), detected_lang
            except Exception as e:
                print(f"Translation error: {e}")
                return text, detected_lang
        return text, detected_lang
    except Exception as e:
        print(f"Language detection error: {e}")
        return text, 'unknown'

def get_transcript_safely(video_id, languages):
    try:
        transcript_list = ytt_api.list(video_id)
        print("Available transcripts:", transcript_list)
        
        # Initialize list to store transcript data
        transcript_data = []
        detected_lang = None  # Will store the detected language
        
        for transcript in transcript_list:
            # fetch the actual transcript data
            data = transcript.fetch()
            
            # Detect language only from the first entry
            if data and not detected_lang:
                try:
                    detected_lang = detect(data[0].text)
                    print(f"Detected language: {detected_lang}")
                except Exception as e:
                    print(f"Language detection error: {e}")
                    detected_lang = 'unknown'
            
            # Process all entries based on the detected language
            for entry in data:
                original_text = entry.text
                # Translate only if Hindi was detected
                if detected_lang == 'hi':
                    try:
                        processed_text = translator.translate(original_text)
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
        
        # Create Document objects directly from transcript entries
        docs = [
            Document(
                page_content=f"{entry['text']}",
                metadata={
                    'start_time': entry['start_time'],
                    'duration': entry['duration'],
                    'video_id': video_id,
                    'original_text': entry['original_text'],
                    'detected_language': detected_lang
                }
            ) for entry in transcript_data
        ]
        
        # Split documents if they're too long
        split_docs = text_splitter.split_documents(documents=docs)
        
        print("split_docs: ", split_docs)
        
        # Initialize vector store with Gemini embeddings
        vector_store = QdrantVectorStore.from_documents(
            documents=[],
            url="http://localhost:6333",
            collection_name="yt-rag",
            embedding=embeddings,
        )
        
        vector_store.add_documents(documents=split_docs)
        print("Ingestion Done!")
        
        return {
            'success': True,
            'data': transcript_data
        }
        
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable) as e:
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
        
        # Get relevant chunks
        relevant_chunks = get_relevant_transcript_chunks(user_query)
        
        # Get AI response
        response = get_ai_response(user_query, relevant_chunks)
        
        return jsonify({
            "success": True,
            "response": response,
            "chunks": [
                {
                    "text": chunk.page_content,
                    "metadata": chunk.metadata
                } for chunk in relevant_chunks
            ]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True) 
    