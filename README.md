# YouTube RAG Assistant - Chrome Extension

A sophisticated Chrome extension that leverages **Retrieval Augmented Generation (RAG)** to enable intelligent conversations with YouTube video content. The system combines modern web technologies, AI/ML models, and advanced vector databases to provide context-aware responses with precise timestamp navigation.

## 🏗️ Architecture Overview

### **System Design Pattern**

- **Microservices Architecture**: Separation of frontend (Chrome extension) and backend (Python API)
- **Event-Driven Communication**: Chrome extension APIs for inter-component messaging
- **RAG (Retrieval Augmented Generation)**: Vector similarity search + Large Language Model
- **Real-time Processing**: Streaming transcript processing with sliding window chunking

### **Technology Stack**

#### **Frontend Technologies**

- **React 19.1.0** - Component-based UI framework
- **Vite 7.0.4** - Modern build tool with HMR (Hot Module Replacement)
- **Chrome Extension Manifest V3** - Latest extension architecture
- **Tailwind CSS equivalent** - Custom CSS-in-JS approach
- **Radix UI** - Headless component library for accessibility
- **TypeScript Support** - Type-safe development

#### **Backend Technologies**

- **Flask** - Lightweight Python web framework
- **Google Generative AI (Gemini)** - Large Language Model integration
- **LangChain** - AI application framework
- **Qdrant Vector Database** - High-performance vector similarity search
- **YouTube Transcript API** - Video content extraction
- **Deep Translator** - Multi-language support

## 🔧 Detailed Technical Implementation

### **1. Chrome Extension Architecture**

#### **Manifest V3 Configuration**

```json
{
  "manifest_version": 3,
  "permissions": ["scripting", "activeTab", "storage"],
  "background": {
    "service_worker": "src/background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content.js"]
    }
  ]
}
```

**Technical Approach:**

- **Service Worker Pattern**: Background script runs as isolated service worker
- **Content Script Injection**: Dynamic script injection into YouTube pages
- **Cross-Origin Resource Sharing**: Configured for API communication
- **Storage API**: Chrome sync storage for persistent data

#### **Communication Architecture**

```javascript
// Background Script → Content Script
chrome.tabs.sendMessage(tab.id, { action: "togglePopup" });

// Content Script → Background Script
chrome.runtime.sendMessage({ action: "popupClosed" });

// Popup → Content Script (via iframe messaging)
window.parent.postMessage({ action: "closePopup" }, "*");
```

**Technical Features:**

- **Message Passing API**: Secure communication between contexts
- **Event-Driven Architecture**: Listener-based message handling
- **Iframe Sandboxing**: Isolated popup rendering
- **DOM Manipulation**: YouTube video element control

### **2. Frontend React Architecture**

#### **Component Hierarchy & Design Patterns**

```
App.jsx (Root)
├── Index.jsx (State Manager)
│   ├── ApiKeyScreen.jsx (Authentication)
│   ├── LoadingScreen.jsx (Async States)
│   └── Popup.jsx (Main Interface)
│       ├── MarkdownResponse.jsx (Content Rendering)
│       └── UI Components/
│           ├── Button.jsx (Radix Slot Pattern)
│           ├── Input.jsx (Controlled Components)
│           ├── Card.jsx (Layout Components)
│           └── Badge.jsx (Status Indicators)
```

#### **State Management Approach**

```javascript
// Local State with Hooks
const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// Chrome Storage Integration
chrome.storage.sync.get(["videoId"], (result) => {
  if (result.videoId) {
    setVideoId(result.videoId);
    fetchTranscript(result.videoId);
  }
});

// Storage Change Listeners
chrome.storage.onChanged.addListener(handleStorageChange);
```

**Technical Patterns:**

- **React Hooks**: useState, useEffect, useRef for state management
- **Controlled Components**: Form inputs with validation
- **Event Delegation**: Efficient DOM event handling
- **Component Composition**: Radix UI slot pattern for flexibility
- **CSS-in-JS**: Scoped styling with CSS modules approach

#### **Advanced UI Features**

```javascript
// Auto-scrolling Chat
useEffect(() => {
  if (scrollAreaRef.current) {
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }
}, [messages]);

// Timestamp Link Generation
const TimestampLink = ({ time }) => {
  const seconds = convertTimestampToSeconds(time);
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "seekToTimestamp",
          seconds: seconds,
        });
      }}
    >
      [{time}]
    </a>
  );
};
```

### **3. Backend API Architecture**

#### **Flask Application Structure**

```python
app = Flask(__name__)
CORS(app)  # Cross-Origin Resource Sharing

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    # Video transcript retrieval and processing

@app.route('/api/query', methods=['POST'])
def query_transcript():
    # RAG-based question answering
```

**Technical Implementation:**

- **RESTful API Design**: Resource-based endpoints
- **CORS Configuration**: Cross-origin request handling
- **Error Handling**: Comprehensive exception management
- **Request Validation**: Input sanitization and validation
- **Header-based Authentication**: API key in X-API-Key header

#### **YouTube Transcript Processing**

```python
def create_youtube_transcript_api():
    """
    Proxy configuration for IP ban circumvention
    """
    proxy_config = GenericProxyConfig(
        http_url=proxy_http_url,
        https_url=proxy_https_url,
    )
    return YouTubeTranscriptApi(proxy_config=proxy_config)

def get_transcript_safely(video_id, languages, api_key):
    # Language detection with langdetect
    detected_lang = detect(data[0].text)

    # Translation with Deep Translator
    if detected_lang == 'hi':
        processed_text = translator.translate(original_text)

    return transcript_data
```

**Technical Features:**

- **Proxy Support**: HTTP/HTTPS proxy configuration for geo-restrictions
- **Language Detection**: Automatic language identification
- **Translation Pipeline**: Hindi to English translation
- **Error Recovery**: Fallback mechanisms for failed requests
- **Request Cancellation**: AbortController for race condition prevention

### **4. RAG (Retrieval Augmented Generation) Implementation**

#### **Vector Database Architecture**

```python
# Qdrant Vector Store Configuration
qdrant_client = QdrantClient(url="http://localhost:6333")

def ensure_collection_exists(collection_name: str, embedding_size: int = 768):
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=embedding_size,
            distance=Distance.COSINE
        )
    )
```

**Technical Approach:**

- **Vector Similarity Search**: Cosine distance for semantic matching
- **Embedding Model**: Google Gemini embedding-001 (768 dimensions)
- **Collection Management**: Dynamic collection creation and validation
- **Persistence**: Docker-based Qdrant deployment

#### **Document Chunking Strategy**

```python
# Sliding Window Approach
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,        # Optimal context window
    chunk_overlap=625,      # 25% overlap for continuity
    length_function=len,
)

def process_transcript_entries(transcript_data, video_id, detected_lang):
    # Combine entries with metadata preservation
    for entry in combined_entries:
        current_metadata = {
            'start_time': entry['start_time'],
            'duration': entry['duration'],
            'video_id': video_id,
            'detected_language': detected_lang,
            'segments': []  # Granular timestamp tracking
        }
```

**Technical Features:**

- **Sliding Window Chunking**: Maintains context across chunk boundaries
- **Metadata Preservation**: Timestamp and video information retention
- **Adaptive Segmentation**: Content-aware chunk boundaries
- **Overlap Strategy**: Prevents information loss at boundaries

#### **Semantic Search Implementation**

```python
def get_relevant_transcript_chunks(query: str, api_key: str):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=api_key,
    )

    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name="yt-rag",
        embedding=embeddings,
    )

    return vector_store.similarity_search(query=query)
```

### **5. AI Integration & Prompt Engineering**

#### **Google Gemini Integration**

```python
def get_ai_response(query: str, chunks, api_key: str):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-pro')

    # Context formatting with timestamps
    formatted_chunks = []
    for chunk in chunks:
        timestamp = chunk.metadata.get('start_time', 0)
        formatted_chunks.append(f"""
        [{format_timestamp(timestamp)}]
        Content: {chunk.page_content}
        """)

    system_prompt = f"""
    You are an expert content analyzer...
    Available Context: {formatted_chunks}
    User Question: {query}
    """

    response = model.generate_content(system_prompt)
    return response.text
```

**Technical Features:**

- **Prompt Engineering**: Structured system prompts for consistent responses
- **Context Window Management**: Optimal chunk selection for LLM input
- **Timestamp Integration**: Seamless timestamp embedding in responses
- **Response Formatting**: Structured markdown output with clickable links

### **6. Build System & Development Tools**

#### **Vite Configuration**

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";

export default defineConfig({
  plugins: [
    react(), // React JSX transformation
    crx({ manifest }), // Chrome extension building
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Path aliasing
    },
  },
});
```

**Technical Approach:**

- **ESBuild**: Fast JavaScript/TypeScript compilation
- **Hot Module Replacement**: Development server with live reload
- **Chrome Extension Plugin**: Automated manifest processing
- **Path Resolution**: Absolute imports with @ alias
- **Asset Optimization**: Automatic asset bundling and optimization

#### **Development Workflow**

```bash
# Frontend Development
npm run dev      # Development server with HMR
npm run build    # Production build for extension
npm run lint     # ESLint code quality checks

# Backend Development
python api.py    # Flask development server
docker-compose up  # Qdrant vector database
```

### **7. Advanced Request Management**

#### **Race Condition Prevention**

```javascript
// Global request controllers
let currentTranscriptController = null;
let currentQueryController = null;

export const getTranscript = async (videoId) => {
  // Cancel previous request
  if (currentTranscriptController) {
    currentTranscriptController.abort();
  }

  // Create new controller
  const controller = new AbortController();
  currentTranscriptController = controller;

  // Fetch with cancellation support
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { "X-API-Key": apiKey },
  });
};
```

**Technical Benefits:**

- **Memory Efficiency**: Prevents memory leaks from pending requests
- **User Experience**: Latest action always takes precedence
- **Network Optimization**: Reduces unnecessary server load
- **Error Handling**: Clean cancellation without error propagation

### **8. Container Orchestration**

#### **Docker Configuration**

```yaml
# docker-compose.yml
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - 6333:6333
    volumes:
      - qdrant_storage:/qdrant/storage
```

**Technical Approach:**

- **Containerization**: Isolated database deployment
- **Port Mapping**: Localhost accessibility
- **Volume Persistence**: Data persistence across container restarts
- **Development Environment**: Consistent setup across machines

## 🔄 Data Flow Architecture

### **Complete Request Lifecycle**

1. **Video Detection & Processing**

   ```
   YouTube Page → Content Script → Chrome Storage → Popup Component
   ↓
   Video ID Extraction → Transcript API → Language Detection → Translation
   ↓
   Chunking Strategy → Vector Embeddings → Qdrant Storage
   ```

2. **Question Processing Pipeline**

   ```
   User Query → Popup Interface → API Service → Flask Endpoint
   ↓
   Vector Similarity Search → Chunk Retrieval → Context Assembly
   ↓
   Gemini AI Processing → Response Generation → Markdown Rendering
   ↓
   Timestamp Extraction → Link Generation → UI Update
   ```

3. **Timestamp Navigation Flow**
   ```
   Markdown Response → Timestamp Link Click → Chrome Message API
   ↓
   Content Script → YouTube Video Element → currentTime Update
   ```

## 🚀 Performance Optimizations

### **Frontend Optimizations**

- **Component Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: Efficient large message list handling
- **Debounced Input**: Reduced API calls during typing
- **Asset Lazy Loading**: Reduced initial bundle size
- **Chrome Storage Caching**: Persistent data across sessions

### **Backend Optimizations**

- **Connection Pooling**: Efficient database connections
- **Vector Index Optimization**: HNSW algorithm for fast similarity search
- **Chunk Size Tuning**: Optimal balance between context and performance
- **Request Cancellation**: Prevents resource waste
- **Streaming Responses**: Real-time response delivery

### **Database Optimizations**

- **Cosine Distance**: Efficient similarity calculation
- **Index Configuration**: Optimized for query performance
- **Memory Management**: Efficient vector storage
- **Concurrent Access**: Multi-user support

## 🔧 Configuration & Environment

### **Environment Variables**

```bash
# Required
GOOGLE_API_KEY=your_gemini_api_key

# Optional Proxy Configuration
PROXY_HTTP_URL=http://user:pass@proxy.example.com:8080
PROXY_HTTPS_URL=https://user:pass@proxy.example.com:8080

# Development
FLASK_ENV=development
FLASK_DEBUG=true
```

### **Chrome Extension Permissions**

```json
{
  "permissions": [
    "scripting", // Content script injection
    "activeTab", // Current tab access
    "storage" // Chrome storage API
  ],
  "host_permissions": ["<all_urls>"] // Universal site access
}
```

## 🎯 Advanced Features

### **Multi-language Support**

- **Language Detection**: Automatic content language identification
- **Translation Pipeline**: Real-time translation capabilities
- **Unicode Handling**: Proper text encoding throughout pipeline
- **Cultural Context**: Language-aware response generation

### **Error Handling & Resilience**

- **Graceful Degradation**: Fallback mechanisms for failures
- **Retry Logic**: Intelligent request retry strategies
- **User Feedback**: Clear error communication
- **Logging System**: Comprehensive debugging information

### **Security Measures**

- **API Key Protection**: Secure credential storage
- **Input Validation**: SQL injection and XSS prevention
- **CORS Configuration**: Controlled cross-origin access
- **Content Security Policy**: Extension security hardening

