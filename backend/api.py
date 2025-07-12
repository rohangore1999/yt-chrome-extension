from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_transcript_safely(video_id, languages="en"):
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[languages])
    text = ""
    for entry in transcript:
        # Ensure proper encoding of Hindi text
        text += " " + entry['text'].strip()
    return text

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
    