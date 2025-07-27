# AI Video Assistant - Technical Architecture & Flow Documentation

## System Overview

This is a Chrome extension that enables users to have AI-powered conversations with YouTube videos using a RAG (Retrieval-Augmented Generation) system. The system extracts video transcripts, processes them through vector embeddings, and provides contextual AI responses.

## Architecture Components

### Frontend (Chrome Extension)

- **Manifest V3 Chrome Extension** with React UI
- **Service Worker** (background script) for extension logic
- **Content Script** for YouTube page interaction
- **React Application** for user interface
- **API Service Layer** for backend communication

### Backend (Python Flask)

- **Flask API Server** for handling requests
- **YouTube Transcript Extraction** using YouTube Transcript API
- **Vector Database** (Qdrant) for semantic search
- **AI Processing** using Google Gemini for embeddings and responses
- **RAG System** for contextual query processing

---

## Detailed Frontend Flow

### 1. Extension Initialization Flow

![extension-flow](./media/extension-init.png "Extension Flow")

**Execution Order:**

1. **Background Script** (`background.js`) - Starts immediately when extension loads
2. **Content Script** (`content.js`) - Injected when user visits any webpage
3. **React App** - Loaded on-demand when user clicks extension

### 2. Content Script Detailed Flow

**File: `frontend/src/content.js`**

![extension-content](./media/extension-contentjs.png "Extension Content Script")

**Key Functions:**

1. **saveVideoId()**:

   - Extracts video ID from `window.location.search`
   - Stores in `chrome.storage.sync`
   - Triggered on page load and URL changes

2. **createPopupOverlay()**:

   - Creates fixed-position div overlay
   - Inserts iframe with React app
   - Applies styling for proper positioning

3. **Message Handling**:
   - Listens for messages from background script
   - Handles popup toggle, close, and video seeking
   - Manages communication with React app

### 3. Background Script Flow

**File: `frontend/src/background.js`**

![extension-background](./media/extension-backgroundjs.png "Extension Background Script")

**Responsibilities:**

- Handle extension icon clicks
- Manage communication between components
- Maintain message channel integrity
- Route messages between content script and React app

### 4. React Application Flow

**File: `frontend/src/App.jsx`**

![frontend flow](./media/appjs.png "Frontend Flow")

**Component Hierarchy:**

```
App.jsx
├── LoadingScreen/
├── ApiKeyScreen/
│   ├── Input components
│   └── Validation logic
└── ChatScreen/
    ├── Chat interface
    ├── Message history
    ├── Quick questions
    └── MarkdownResponse/
        ├── Markdown rendering
        └── Timestamp links
```

### 5. API Service Layer Flow

**File: `frontend/src/services/apis.js`**

![frontend-service-layer](./media/frontend-service-layer.png "Frontend Service Layer")

**Key Features:**

- **Request Cancellation**: Uses AbortController to cancel previous requests
- **Error Handling**: Comprehensive error management and user feedback
- **API Key Management**: Secure header-based authentication
- **Response Processing**: Formats backend responses for UI consumption

---

## Detailed Backend Flow

### 1. Flask Application Initialization

**Initialization Components:**

- Environment variables loading (API keys, URLs)
- YouTube Transcript API client setup
- CORS configuration for frontend communication
- Text splitter with optimized chunking parameters
- Qdrant vector database connection testing

### 2. Transcript Processing Flow

**Endpoint: `/api/transcript`**

![backend-transcript](./media/backend-transcript.png "Backend - Transcript API")

**Detailed Steps:**

1. **Input Validation**:

   ```python
   video_id = request.args.get('video_id')
   api_key = request.headers.get('X-API-Key')
   # Validate both parameters exist
   ```

2. **Transcript Extraction**:

   ```python
   result = get_transcript_safely(video_id, languages, ytt_api)
   # Handles multiple language preferences
   # Manages API errors and fallbacks
   ```

3. **Document Processing**:

   ```python
   # Text splitting with overlap for context continuity
   text_splitter = RecursiveCharacterTextSplitter(
       chunk_size=2500,
       chunk_overlap=625,  # 25% overlap
   )
   ```

4. **Vector Storage**:

   ```python
   storage_success = store_documents_in_vector_db(docs, api_key, collection_name)
   # Uses video_id as collection name for isolation
   ```

5. **Quick Question Generation**:
   ```python
   quick_questions = generate_quick_questions(relevant_chunks, api_key)
   # AI-generated conversation starters
   ```

### 3. Query Processing Flow

**Endpoint: `/api/query`**

![backend-query](./media/backend-query.png "Backend - Query API")

**Processing Pipeline:**

1. **Input Processing**:

   ```python
   data = request.get_json()
   user_query = data['query']
   video_id = data.get('video_id')
   collection_name = video_id  # Collection per video
   ```

2. **Semantic Search**:

   ```python
   relevant_chunks = get_relevant_transcript_chunks(
       user_query, api_key, collection_name
   )
   # Vector similarity search in Qdrant
   ```

3. **AI Response Generation**:
   ```python
   response_data = get_ai_response(user_query, relevant_chunks, api_key)
   # Contextual response with timestamp extraction
   ```

### 4. Vector Database Operations

**File: `backend/vector_store_utils.py`**

![Qdrant Store Flow](./media/qdrant-store-flow.png "Qdrant Store Flow")

**Key Operations:**

1. **Collection Management**:

   ```python
   def ensure_collection_exists(collection_name, embedding_size=768):
       # Creates collection if doesn't exist
       # Uses video_id as collection name for isolation
   ```

2. **Embedding Generation**:

   ```python
   embeddings = GoogleGenerativeAIEmbeddings(
       model="models/embedding-001",
       google_api_key=api_key,
   )
   ```

3. **Vector Storage**:

   ```python
   vector_store.add_documents(documents=docs)
   # Stores chunked transcript with embeddings
   ```

4. **Similarity Search**:
   ```python
   vector_store.similarity_search(query=query)
   # Returns most relevant chunks for user query
   ```

### 5. AI Processing Pipeline

**File: `backend/ai_utils.py`**

**Response Generation Process:**

1. **Context Assembly**:

   ```python
   formatted_chunks = [
       f"[{chunk.metadata.get('start_time', 'Unknown')}] {chunk.page_content}"
       for chunk in relevant_chunks
   ]
   ```

2. **Prompt Engineering**:

   ```python
   prompt = f"""Based on the video transcript context: {context}
   Answer this question: {user_query}
   Include relevant timestamps in format: [MM:SS] or [HH:MM:SS]"""
   ```

3. **AI Response Processing**:
   ```python
   response = model.generate_content(prompt)
   timestamps = extract_timestamps_from_response(response.text)
   ```

---

## Complete System Flow Diagram

![System Flow Diagram](./media/system-flow.png "System Flow Diagram")

## Execution Timeline

### Initial Setup (Extension Installation)

1. **Background Script** starts (persistent service worker)
2. **Extension icon** becomes available
3. **Content scripts** remain dormant until page visits

### User Opens YouTube Video

1. **Content script** injected into YouTube page
2. **Video ID extracted** from URL
3. **Chrome storage updated** with current video ID
4. **MutationObserver** watches for navigation changes

### User Clicks Extension Icon

1. **Background script** receives click event
2. **Message sent** to content script on active tab
3. **Popup overlay created** (if doesn't exist)
4. **iframe created** with React app source
5. **React app initializes** inside iframe
6. **Component mounting** and state initialization

### First Query Processing

1. **React app** sends transcript request
2. **API service** makes HTTP call to backend
3. **Flask server** processes transcript extraction
4. **YouTube API** called for transcript data
5. **Text chunking** and embedding generation
6. **Vector storage** in Qdrant database
7. **Quick questions** generated by AI
8. **Response** returned to frontend

### Subsequent Queries

1. **User input** processed by React app
2. **Previous request cancelled** (if still running)
3. **New HTTP request** sent to backend
4. **Vector similarity search** in existing collection
5. **AI response generation** with context
6. **Timestamp extraction** and formatting
7. **Response displayed** in chat interface

## Error Handling & Edge Cases

### Frontend Error Handling

- **Network errors**: Retry logic and user notifications
- **Request cancellation**: Proper AbortController usage
- **Invalid API keys**: Validation and user guidance
- **Component errors**: Error boundaries and fallbacks

### Backend Error Handling

- **YouTube API failures**: Multiple language fallbacks
- **Vector database issues**: HTTP fallback mechanisms
- **AI service errors**: Graceful degradation
- **Rate limiting**: Exponential backoff strategies

### Performance Optimizations

- **Request debouncing**: Prevents rapid-fire queries
- **Vector store reuse**: Collection-per-video strategy
- **Chunking optimization**: Balanced size with overlap
- **Memory management**: Proper cleanup and disposal

This comprehensive flow ensures robust, scalable operation across all system components while maintaining excellent user experience and technical reliability.
