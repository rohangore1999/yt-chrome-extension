import google.generativeai as genai
import ast
import re
from utils import format_timestamp

def get_ai_response(query: str, chunks, api_key: str):
    """
    Get AI response based on the query and relevant transcript chunks using Gemini.
    """
    genai.configure(api_key=api_key)
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
    1. Start DIRECTLY with your analysis - do not use conversational preambles like "Of course", "Sure", "Here is", etc.
    2. Structure your response with clear sections (e.g., ### Overview, ### Details)
    3. Use bullet points for clarity
    4. ALWAYS include timestamps in [MM:SS] format (not parentheses)
    5. Keep responses concise and focused
    6. Format timestamps consistently as [MM:SS] or [HH:MM:SS] for longer videos
    7. Place timestamps at the end of each point in square brackets, like: [MM:SS]
    8. Make sure each point has a unique and accurate timestamp
    
    Example format:
    ### Overview
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

def generate_quick_questions(relevant_chunks, api_key: str):
    """
    Generate quick questions based on video content using Gemini.
    """
    try:
        if not relevant_chunks:
            return []
            
        # Configure Gemini for question generation
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-pro')
        
        # Format chunks for context
        formatted_chunks = []
        for chunk in relevant_chunks:
            timestamp = chunk.metadata.get('start_time', 0)
            translated_text = chunk.page_content
            
            formatted_chunks.append(f"""
            [{format_timestamp(timestamp)}]
            Content: {translated_text}
            """)
        
        # Create prompt for generating quick questions
        questions_prompt = f"""
        You are an expert content analyzer who creates engaging questions based on video content.
        
        Based on the provided video transcript content, generate exactly 3 quick questions that:
        1. Cover different aspects/topics of the video
        2. Are interesting and engaging for viewers
        3. Help users understand the main content
        4. Are specific enough to be answerable from the video
        5. Vary in complexity (some simple, some deeper)
        
        IMPORTANT: 
        - Return ONLY a list of exactly 3 questions
        - Each question should be a string
        - Do not include any other text, explanations, or formatting
        - The response should be valid list syntax
        
        Example format:
        ["Question 1?", "Question 2?", "Question 3?"]
        
        Available Video Content:
        {chr(10).join(formatted_chunks)}
        
        Generate exactly 3 diverse, engaging questions about this video content:
        """
        
        # Generate questions using Gemini
        questions_response = model.generate_content(questions_prompt)
        
        try:
            # Parse the response as a list
            questions_text = questions_response.text.strip()
            
            # Remove any markdown formatting if present
            if questions_text.startswith('```') and questions_text.endswith('```'):
                lines = questions_text.split('\n')
                questions_text = '\n'.join(lines[1:-1])
            
            # Safely evaluate the list
            questions_list = ast.literal_eval(questions_text)
            
            # Validate the result
            if isinstance(questions_list, list):
                # Ensure we have at most 3 questions
                if len(questions_list) > 3:
                    questions_list = questions_list[:3]
                
                # Ensure all items are strings
                return [str(q).strip() for q in questions_list if str(q).strip()]
                
        except (ValueError, SyntaxError) as e:
            # Fallback: try to extract questions manually if parsing fails
            response_text = questions_response.text
            
            # Try to find questions (sentences ending with ?)
            questions = re.findall(r'"([^"]*\?)"', response_text)
            
            if not questions:
                # Alternative pattern for questions without quotes
                questions = re.findall(r'([^.!?]*\?)', response_text)
                questions = [q.strip() for q in questions if len(q.strip()) > 10]
            
            # Limit to 3 questions
            return questions[:3]
            
    except Exception as e:
        print(f"Error generating quick questions: {str(e)}")
        return [] 