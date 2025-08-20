import google.generativeai as genai
import ast
import re
import time
from utils import format_timestamp

def _extract_text_from_gemini_response(response):
    """
    Safely extract text from a Gemini response. Returns a tuple of
    (text, finish_reason, prompt_feedback).
    """
    finish_reason = None
    prompt_feedback = getattr(response, "prompt_feedback", None)
    # Try quick accessor first, but guard against exceptions when no Parts are present
    try:
        if getattr(response, "text", None):
            return response.text, finish_reason, prompt_feedback
    except Exception:
        # Fall through to manual extraction
        pass

    # Manual extraction from candidates → content.parts
    text_parts = []
    try:
        for candidate in getattr(response, "candidates", []) or []:
            finish_reason = getattr(candidate, "finish_reason", finish_reason)
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) if content is not None else None
            if not parts:
                continue
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    text_parts.append(part_text)
    except Exception:
        # If anything goes wrong, return empty string and whatever metadata we have
        return "", finish_reason, prompt_feedback

    return "\n".join(text_parts).strip(), finish_reason, prompt_feedback


def get_ai_response(query: str, chunks, api_key: str, model="gemini-flash"):
    """
    Get AI response based on the query and relevant transcript chunks using Gemini.
    """
    genai.configure(api_key=api_key)
    
    # Map frontend model names to actual Gemini model names
    # Note: gemini-2.5-pro can be gated; include a fallback path to public models
    model_mapping = {
        'gemini-flash': 'gemini-1.5-flash',
        'gemini-pro': 'gemini-2.5-pro',
    }

    # Preserve the requested model name for behavior/style decisions
    requested_model_name = model

    # Use the specified model or default to a stable public model
    gemini_model_name = model_mapping.get(requested_model_name, 'gemini-1.5-pro')
    print(f"Using Gemini model: {gemini_model_name}", flush=True)

    generative_model = genai.GenerativeModel(gemini_model_name)
    
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
    
    # Style instructions based on selected model name (avoid shadowing the model object)
    if requested_model_name == 'gemini-flash':
        style_instructions = (
            "Respond in a compact, highly concise way: 3-5 bullets maximum. "
            "Each bullet must be a single short sentence that surfaces only the most important information. "
            "No introductions or conclusions."
        )
    else:  # gemini-pro and others
        style_instructions = (
            "Provide a brief explanation (2-3 short paragraphs) summarizing the answer, "
            "then include up to 5 clear bullet points with key takeaways. Keep it succinct overall."
        )

    system_prompt = f"""
    You are an expert content analyzer who helps users understand video content.

    {style_instructions}

    Timestamps policy (must follow exactly):
    - ALWAYS include timestamps, in square brackets only, using [MM:SS] or [HH:MM:SS] for longer videos.
    - Put the timestamp at the END of each bullet point.
    - Provide EXACTLY ONE timestamp per line. Never include more than one timestamp in any line.
    - Do NOT include timestamps in headings.

    Example format:
    ### Overview
    * This is a point about the video [12:34]
    * Another important point from a different part [15:20]

    Available Context:
    {formatted_chunks}

    User Question: {query}
    """

    gen_start = time.perf_counter()
    response = generative_model.generate_content(system_prompt)
    gen_ms = int((time.perf_counter() - gen_start) * 1000)
    print(f"⏱️ Gemini answer generation took {gen_ms} ms with model {gemini_model_name}", flush=True)

    # Safely extract text. If empty, try a single fallback to a public model
    processed_response, finish_reason, prompt_feedback = _extract_text_from_gemini_response(response)

    if not processed_response:
        print(f"⚠️ No text returned (finish_reason={finish_reason}). Retrying with fallback model.", flush=True)
        fallback_model_name = 'gemini-1.5-pro' if gemini_model_name != 'gemini-1.5-pro' else 'gemini-1.5-flash'
        try:
            fallback_model = genai.GenerativeModel(fallback_model_name)
            fb_start = time.perf_counter()
            fb_response = fallback_model.generate_content(system_prompt)
            fb_ms = int((time.perf_counter() - fb_start) * 1000)
            print(f"⏱️ Fallback generation took {fb_ms} ms with model {fallback_model_name}", flush=True)
            processed_response, finish_reason, prompt_feedback = _extract_text_from_gemini_response(fb_response)
        except Exception as fb_e:
            print(f"Fallback generation error: {str(fb_e)}", flush=True)

    if not processed_response:
        # Surface a clear, actionable error to the caller
        raise ValueError(
            f"Model returned no text. finish_reason={finish_reason} prompt_feedback={prompt_feedback}"
        )
    
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
        "timestamps": found_timestamps,
        "timings": {
            "gemini_generation_ms": gen_ms
        }
    }

def generate_quick_questions(relevant_chunks, api_key: str):
    """
    Generate quick questions based on video content using Gemini.
    """
    try:
        if not relevant_chunks:
            return []
            
        # Configure Gemini for question generation (faster model)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Format trimmed chunks for context (limit to first 2 chunks, truncate text)
        formatted_chunks = []
        MAX_CHUNKS = 2
        MAX_CHARS = 800
        for chunk in relevant_chunks[:MAX_CHUNKS]:
            timestamp = chunk.metadata.get('start_time', 0)
            translated_text = chunk.page_content[:MAX_CHARS]
            formatted_chunks.append(f"[{format_timestamp(timestamp)}] {translated_text}")
        
        # Create prompt for generating quick questions focused on best/key/"aha" moments
        questions_prompt = (
            "From the context, generate exactly 3 short, engaging questions that point to the video's best highlights: "
            "key moments, aha moments, biggest takeaways/surprises, or critical advice.\n"
            "Guidelines:\n"
            "- Be specific about the topic.\n"
            "- Do NOT include any timestamps.\n"
            "- Keep each question under 120 characters.\n"
            "Return ONLY a valid JSON list of strings (no extra text).\n"
            f"Context:\n{chr(10).join(formatted_chunks)}\n"
        )
        
        # Generate questions using Gemini
        gen_start = time.perf_counter()
        questions_response = model.generate_content(questions_prompt)
        gen_ms = int((time.perf_counter() - gen_start) * 1000)
        print(f"⏱️ Gemini quick-questions generation took {gen_ms} ms", flush=True)
        
        try:
            # Parse the response as a list
            # Safely extract text
            questions_text, _, _ = _extract_text_from_gemini_response(questions_response)
            questions_text = (questions_text or "").strip()
            
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

                # Normalize questions: remove any bracketed timestamps and trim whitespace
                cleaned_questions = []
                for q in questions_list:
                    text = str(q)
                    # Remove [MM:SS] or [HH:MM:SS] anywhere in the string
                    text = re.sub(r"\[(?:\d{1,2}:)?\d{2}:\d{2}\]", "", text)
                    text = re.sub(r"\s+", " ", text).strip()
                    if text:
                        cleaned_questions.append(text)
                return cleaned_questions
                
        except (ValueError, SyntaxError) as e:
            # Fallback: try to extract questions manually if parsing fails
            response_text, _, _ = _extract_text_from_gemini_response(questions_response)
            response_text = response_text or ""
            
            # Try to find questions (sentences ending with ?)
            questions = re.findall(r'"([^"]*\?)"', response_text)
            
            if not questions:
                # Alternative pattern for questions without quotes
                questions = re.findall(r'([^.!?]*\?)', response_text)
                questions = [q.strip() for q in questions if len(q.strip()) > 10]
            
            # Limit to 3 questions and strip any bracketed timestamps
            cleaned_fallback = []
            for q in questions[:3]:
                text = re.sub(r"\[(?:\d{1,2}:)?\d{2}:\d{2}\]", "", q)
                text = re.sub(r"\s+", " ", text).strip()
                if text:
                    cleaned_fallback.append(text)
            return cleaned_fallback
            
    except Exception as e:
        print(f"Error generating quick questions: {str(e)}")
        return [] 