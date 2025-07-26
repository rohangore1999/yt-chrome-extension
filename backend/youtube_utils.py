import os
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from youtube_transcript_api.proxies import GenericProxyConfig, WebshareProxyConfig
from langchain_core.documents import Document
from deep_translator import GoogleTranslator
from langdetect import detect

# Initialize translator
translator = GoogleTranslator(source='auto', target='en')

def create_youtube_transcript_api():
    """
    Create YouTubeTranscriptApi instance with Webshare proxy configuration.
    
    This function helps bypass YouTube IP bans by using Webshare rotating residential proxies.
    
    Environment Variables for Webshare Configuration:
    - WEBSHARE_PROXY_USERNAME: Webshare proxy username (defaults to configured value)
    - WEBSHARE_PROXY_PASSWORD: Webshare proxy password (defaults to configured value)
    - WEBSHARE_FILTER_IP_LOCATIONS: Comma-separated list of country codes (e.g., "us,de,gb")
    
    Examples:
    - WEBSHARE_FILTER_IP_LOCATIONS=us,de (only use IPs from US and Germany)
    - WEBSHARE_FILTER_IP_LOCATIONS=us (only use US IPs for lower latency)
    
    For fallback, also supports generic proxy configuration:
    - PROXY_URL: Generic proxy URL (format: http://username:password@proxy.example.com:port)
    """
    # First, try Webshare proxy configuration
    webshare_username = os.getenv('WEBSHARE_PROXY_USERNAME')
    webshare_password = os.getenv('WEBSHARE_PROXY_PASSWORD')
    filter_locations = os.getenv('WEBSHARE_FILTER_IP_LOCATIONS')
    
    if webshare_username and webshare_password:
        print("Configuring YouTube Transcript API with Webshare rotating residential proxies")
        print(f"  Username: {webshare_username}")
        
        try:
            # Configure Webshare proxy
            webshare_config_params = {
                "proxy_username": webshare_username,
                "proxy_password": webshare_password,
            }
            
            # Add IP location filtering if specified
            if filter_locations:
                location_list = [loc.strip().lower() for loc in filter_locations.split(',')]
                webshare_config_params["filter_ip_locations"] = location_list
                print(f"  Filtering IPs to locations: {location_list}")
            
            proxy_config = WebshareProxyConfig(**webshare_config_params)
            print("Webshare proxy configuration successful.")
            return YouTubeTranscriptApi(proxy_config=proxy_config)
            
        except Exception as e:
            print(f"Warning: Failed to configure Webshare proxy: {str(e)}")
            print("Falling back to generic proxy configuration...")
    
    # Fallback to generic proxy configuration
    proxy_url = os.getenv('PROXY_URL')
    proxy_http_url = os.getenv('PROXY_HTTP_URL')
    proxy_https_url = os.getenv('PROXY_HTTPS_URL')
    
    # If PROXY_URL is set, use it for both HTTP and HTTPS
    if proxy_url:
        proxy_http_url = proxy_url
        proxy_https_url = proxy_url
        print(f"Using single proxy URL for both HTTP and HTTPS: {proxy_url.split('@')[1] if '@' in proxy_url else proxy_url}")
    
    if proxy_http_url or proxy_https_url:
        print(f"Configuring YouTube Transcript API with generic proxy:")
        if proxy_http_url:
            # Hide password in logs for security
            safe_http_url = proxy_http_url.split('@')[1] if '@' in proxy_http_url else proxy_http_url
            print(f"  HTTP Proxy: {safe_http_url}")
        if proxy_https_url:
            # Hide password in logs for security
            safe_https_url = proxy_https_url.split('@')[1] if '@' in proxy_https_url else proxy_https_url
            print(f"  HTTPS Proxy: {safe_https_url}")
        
        try:
            proxy_config = GenericProxyConfig(
                http_url=proxy_http_url,
                https_url=proxy_https_url,
            )
            print("Generic proxy configuration successful.")
            return YouTubeTranscriptApi(proxy_config=proxy_config)
        except Exception as e:
            error_msg = str(e).lower()
            print(f"Warning: Failed to configure generic proxy: {str(e)}")
            
            # If it's an HTTPS proxy error and we have HTTP proxy, try using HTTP for both
            if ("https" in error_msg or "ssl" in error_msg or "wrong_version_number" in error_msg) and proxy_http_url:
                print("Detected HTTPS proxy issue. Trying HTTP proxy for both HTTP and HTTPS connections...")
                try:
                    fallback_config = GenericProxyConfig(
                        http_url=proxy_http_url,
                        https_url=proxy_http_url,  # Use HTTP proxy for HTTPS as well
                    )
                    print("Fallback proxy configuration successful.")
                    return YouTubeTranscriptApi(proxy_config=fallback_config)
                except Exception as fallback_e:
                    print(f"Fallback proxy configuration also failed: {str(fallback_e)}")
            
            print("Falling back to direct connection...")
            return YouTubeTranscriptApi()
    else:
        print("No proxy configuration found. Using direct connection.")
        return YouTubeTranscriptApi()

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

def get_transcript_safely(video_id, languages, ytt_api):
    """
    Safely retrieve transcript from YouTube video
    """
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
        
        return {
            'success': True,
            'data': transcript_data,
            'docs': docs,
            'detected_lang': detected_lang
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