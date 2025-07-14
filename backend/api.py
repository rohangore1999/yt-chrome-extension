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
translator = GoogleTranslator(source='auto', target='en')  # Changed source to 'auto' for flexibility

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

def detect_and_translate(text: str) -> tuple[str, str]:
    """
    Detect language and translate to English if Hindi
    
    Args:
        text (str): Text to analyze and potentially translate
        
    Returns:
        tuple[str, str]: (processed_text, detected_language)
    """
    try:
        # Detect language
        detected_lang = detect(text)
        
        # If Hindi, translate to English
        if detected_lang == 'hi':
            try:
                return translator.translate(text), detected_lang
            except Exception as e:
                print(f"Translation error: {e}")
                return text, detected_lang
        
        # If already English or other language, return as is
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
        
        # Initialize Gemini embeddings
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",  # Gemini's embedding model
            google_api_key=GOOGLE_API_KEY,
        )
        
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
    