from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Google API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

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
    This uses Gemini embeddings-based similarity search to find the most relevant parts 
    of the video that match the user's question.
    
    Args:
        query (str): User's question about the video content
        
    Returns:
        List of relevant transcript chunks with timestamps
    """
    return retrieval.similarity_search(query=query)

def get_ai_response(query: str, chunks):
    """
    Get AI response based on the query and relevant transcript chunks using Gemini.
    
    Args:
        query (str): User's question
        chunks: Relevant transcript chunks
    
    Returns:
        str: AI's response
    """
    # Configure the model
    model = genai.GenerativeModel('gemini-2.5-pro')  # Updated model name
    
    # Format chunks to include both translated and original text
    formatted_chunks = []
    for chunk in chunks:
        timestamp = chunk.metadata.get('start_time', 0)
        duration = chunk.metadata.get('duration', 0)
        original_text = chunk.metadata.get('original_text', '')
        translated_text = chunk.page_content
        
        formatted_chunks.append(f"""
        [Timestamp: {timestamp}s, Duration: {duration}s]
        English: {translated_text}
        Original: {original_text}
        """)
    
    system_prompt = f"""
    You are an expert content analyzer who helps users understand video content. Your responses should:

    1. ANALYSIS:
    - Provide clear and accurate information from the video
    - Focus on the specific parts relevant to the question
    - Include timestamps for reference
    - Maintain context and continuity

    2. COMMUNICATION:
    - Clear and concise
    - Well-structured responses
    - Direct answers to questions
    - Include both English translation and original Hindi text when available
    - Include timestamps

    Available Context:
    {formatted_chunks}

    This Context contains transcript of a video with timestamps, including both English translations and original Hindi text. Respond to questions in a way that:
    1. Directly answers the user's question
    2. References specific parts of the video
    3. Includes the relevant starting timestamps
    4. Maintains accuracy and context
    5. Organizes information logically
    6. Includes both English and Hindi text when available

    Format your response as:
    [Timestamp: Xs]
    English: <English text>
    Original: <Original text>
    
    Your detailed response...

    User Question: {query}
    """

    # Generate response
    response = model.generate_content(system_prompt)
    return response.text

def main():
    print("\n🎥 Welcome to the Video Content Assistant! 📺")
    print("Ask any questions about the video content.")
    print("Type 'quit' or 'exit' to end the conversation.\n")

    while True:
        try:
            # Get user input
            user_query = input("\n❓ Your question: ").strip()
            
            # Check for exit command
            if user_query.lower() in ['quit', 'exit']:
                print("\nThank you for using the Video Content Assistant! Goodbye! 👋")
                break
            
            # Skip empty questions
            if not user_query:
                print("Please ask a question!")
                continue
            
            print("\nSearching for relevant information...")
            # Get relevant chunks from the transcript
            relevant_chunks = get_relevant_transcript_chunks(user_query)
            
            print("Generating response...")
            # Get AI response
            response = get_ai_response(user_query, relevant_chunks)
            
            print("\n📝 Assistant's Response:")
            print(response)
            print("\n" + "-"*50)
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("Please try asking your question again.")

if __name__ == "__main__":
    main() 