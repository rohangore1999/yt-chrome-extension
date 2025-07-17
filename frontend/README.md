# YouTube Transcript AI Assistant Chrome Extension

A Chrome extension that enhances YouTube videos with an AI-powered chat interface for interacting with video transcripts. Built with React, Vite, and modern web technologies.

## Features

- **AI-Powered Transcript Analysis**: Interact with video content through natural language questions
- **Interactive Timestamps**: Clickable timestamps that link directly to specific moments in the video
- **Real-time Video Integration**: Automatically loads transcripts for currently playing YouTube videos
- **Responsive Chat Interface**: Clean and intuitive chat UI with support for both user and system messages

## Technical Architecture

### Frontend Components

#### Popup Component (`src/components/Popup.jsx`)

The main interface component with the following key features:

1. **State Management**:

```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [videoId, setVideoId] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
```

2. **Timestamp Processing**:

- Converts MM:SS format timestamps to seconds
- Creates clickable YouTube timestamp URLs
- Handles timestamp extraction and rendering

```javascript
// Timestamp format: [MM:SS]
const convertTimestampToSeconds = (timestampText) => {
  const parts = timestampText.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return null;
};
```

3. **Message Structure**:

```typescript
interface Message {
  text: string;
  type: "user" | "system";
  timestamps?: Array<{
    text: string;
    time: string;
  }>;
  isError?: boolean;
}
```

4. **Backend Integration**:

- Handles API calls through `services/apis.js`
- Processes responses with timestamps
- Error handling and loading states

### API Response Format

The backend returns responses in the following format:

```javascript
{
  "response": "Formatted text with [MM:SS] timestamps",
  "success": boolean,
  "timestamps": [
    {
      "text": "Transcript text at this timestamp",
      "time": "MM:SS"
    }
    // ... additional timestamps
  ]
}
```

### Chrome Extension Integration

1. **Storage Sync**:

```javascript
chrome.storage.sync.get(["videoId"], (result) => {
  if (result.videoId) {
    setVideoId(result.videoId);
    fetchTranscript(result.videoId);
  }
});
```

2. **Storage Change Listener**:

```javascript
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.videoId) {
    setVideoId(changes.videoId.newValue);
    fetchTranscript(changes.videoId.newValue);
  }
});
```

## Technical Architecture

### Backend Implementation (`backend/api.py`)

#### Transcript Processing with Sliding Window

The backend uses an advanced sliding window approach with overlapping chunks to maintain context continuity when processing video transcripts:

1. **Text Splitting Configuration**:

```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,  # Optimized chunk size for context
    chunk_overlap=625,  # 25% overlap for continuity
    length_function=len,
)
```

2. **Sliding Window Implementation**:

```python
def process_transcript_entries(transcript_data, video_id, detected_lang):
    combined_entries = []
    TARGET_CHUNK_SIZE = 2500

    # Metadata structure for each chunk
    current_metadata = {
        'start_time': 0,
        'duration': 0,
        'segments': [],
        'video_id': video_id,
        'detected_language': detected_lang
    }

    # Process entries with overlap
    for entry in transcript_data:
        # Add entry to current chunk
        current_chunk.append(entry['text'])

        # Update metadata with timing information
        if not current_metadata['segments']:
            current_metadata['start_time'] = entry['start_time']

        current_metadata['duration'] += entry['duration']
        current_metadata['segments'].append({
            'text': entry['text'],
            'start_time': entry['start_time'],
            'duration': entry['duration']
        })

        # Create document when chunk size is reached
        if len(' '.join(current_chunk)) >= TARGET_CHUNK_SIZE:
            # Keep overlap for context continuity
            overlap_segments = current_metadata['segments'][-2:]
```

3. **Vector Store Integration**:

```python
def get_vector_store():
    return QdrantVectorStore(
        client=qdrant_client,
        collection_name="yt-rag",
        embedding=embeddings,
    )
```

#### Semantic Search and Response Generation

1. **Chunk Retrieval**:

```python
def get_relevant_transcript_chunks(query: str):
    vector_store = get_vector_store()
    return vector_store.similarity_search(query=query)
```

2. **AI Response Generation**:

```python
def get_ai_response(query: str, chunks):
    model = genai.GenerativeModel('gemini-2.5-pro')

    # Format chunks with timestamps
    formatted_chunks = [
        f"[{format_timestamp(chunk.metadata['start_time'])}] {chunk.page_content}"
        for chunk in chunks
    ]
```

### Backend Architecture Details

#### 1. Transcript Processing Pipeline

The backend implements a sophisticated transcript processing pipeline:

1. **Initial Transcript Fetching**:

   - Uses `youtube_transcript_api` to fetch raw transcripts
   - Handles multiple language support
   - Automatic language detection and translation if needed

2. **Chunk Processing with Context**:

   - Implements sliding window with 25% overlap
   - Maintains temporal information for each chunk
   - Preserves original text and translations

3. **Vector Storage**:
   - Uses Qdrant for vector storage
   - Stores embeddings with metadata
   - Enables efficient semantic search

#### 2. Context Preservation Techniques

The system uses several techniques to maintain context quality:

1. **Overlapping Windows**:

   - 25% overlap between chunks (625 tokens)
   - Prevents context loss at chunk boundaries
   - Maintains conversation flow across segments

2. **Metadata Preservation**:

   ```python
   metadata = {
       'start_time': chunk_start,
       'duration': total_duration,
       'segments': [{
           'text': text,
           'start_time': timestamp,
           'duration': duration
       }],
       'video_id': video_id,
       'detected_language': language
   }
   ```

3. **Timestamp Management**:
   - Preserves original timestamps
   - Maintains segment boundaries
   - Enables accurate video positioning

#### 3. Response Generation

The backend uses a structured approach for generating responses:

1. **Context Assembly**:

   - Gathers relevant chunks using semantic search
   - Maintains temporal order of information
   - Preserves timestamp information

2. **Response Formatting**:

   ```python
   {
       "success": true,
       "response": "Formatted response with [MM:SS] timestamps",
       "timestamps": [
           {
               "time": "MM:SS",
               "text": "Contextual segment"
           }
       ]
   }
   ```

3. **Error Handling**:
   - Graceful handling of missing transcripts
   - Language detection fallbacks
   - Translation error recovery

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Popup.jsx        # Main chat interface
│   │   └── Popup.css        # Styles for chat interface
│   ├── services/
│   │   └── apis.js          # API integration
│   ├── background.js        # Chrome extension background script
│   ├── content.js           # Content script for YouTube integration
│   └── main.jsx            # Entry point
├── public/                  # Static assets
└── manifest.json           # Chrome extension manifest
```