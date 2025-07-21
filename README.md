# YouTube Video Assistant Chrome Extension

A powerful Chrome extension that helps users interact with YouTube video content through AI-powered transcript analysis and smart timestamps.

## 🌟 Features

- **Real-time Video Analysis**: Automatically fetches and processes video transcripts
- **AI-Powered Responses**: Get intelligent answers about video content
- **Smart Timestamps**: Clickable timestamps that jump to specific video moments
- **Bilingual Support**: Handles both English and original language transcripts
- **Interactive Chat Interface**: User-friendly chat-like interface for questions

## 🛠️ Technical Architecture

### Frontend (Chrome Extension)

- Built with React + Vite
- Components:
  - `Popup.jsx`: Main extension popup interface
  - `content.js`: Content script for YouTube page interaction
  - `background.js`: Background script for extension management
  - `services/apis.js`: API service layer

### Backend (Python)

- Flask-based API server
- Features:
  - Transcript retrieval and processing
  - AI model integration (Gemini Pro)
  - Text analysis and summarization

## 🔧 Project Structure

```
chrome-extension/
├── backend/
│   ├── api.py              # Main Flask API endpoints
│   ├── retrieval.py        # Transcript processing logic
│   ├── requirements.txt    # Python dependencies
│   └── docker-compose.yml  # Docker configuration
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── content.js      # Content script
│   │   └── background.js   # Background script
│   ├── manifest.json       # Extension manifest
│   └── package.json        # Node dependencies
```

## 💻 Key Components

### Background Script (`background.js`)

- Manages extension lifecycle
- Handles YouTube tab detection
- Maintains video state across sessions

### Content Script (`content.js`)

- Injects into YouTube pages
- Extracts video information
- Communicates with popup

### Popup Component (`Popup.jsx`)

- Main user interface
- Chat-like interaction
- Timestamp processing
- Real-time video updates

## 🔄 Data Flow

1. **Video Detection**

   - Content script detects YouTube video
   - Extracts video ID and metadata
   - Stores in Chrome storage

2. **Transcript Processing**

   - Backend fetches video transcript
   - Processes and segments content
   - Prepares for AI analysis

3. **User Interaction**

   - User asks questions in popup
   - Questions sent to backend API
   - AI processes and returns responses

4. **Response Handling**
   - Responses formatted with timestamps
   - Timestamps converted to clickable links
   - Links jump to specific video moments

## 🎯 Features in Detail

### Timestamp Navigation

- Format: `[XXX.XXXs]`
- Clickable links in responses
- Opens video at exact moment
- Styled for visibility and interaction

### AI Response Processing

- Context-aware responses
- Timestamp integration
- Summarized content
- Relevant video segments

### User Interface

- Clean, modern design
- Real-time response indicators
- Error handling
- Loading states

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Chrome Browser

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Required: Google API Key for Gemini AI
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Proxy Configuration (for bypassing YouTube IP bans)
PROXY_HTTP_URL=http://username:password@proxy.example.com:port
PROXY_HTTPS_URL=https://username:password@proxy.example.com:port
```

#### Proxy Configuration Details

If YouTube has blocked your system IP, you can configure proxy settings to bypass the restriction:

- **Format**: `http://username:password@proxy.example.com:port`
- **Popular Services**: ProxyMesh, Bright Data, Smartproxy, etc.
- **Recommendation**: Use services that automatically rotate proxy IPs for maximum reliability
- **Note**: You can configure either HTTP, HTTPS, or both proxy URLs

Example proxy configurations:

```bash
# HTTP only
PROXY_HTTP_URL=http://user:pass@proxy.example.com:8080

# HTTPS only  
PROXY_HTTPS_URL=https://user:pass@proxy.example.com:8080

# Both (recommended)
PROXY_HTTP_URL=http://user:pass@proxy.example.com:8080
PROXY_HTTPS_URL=https://user:pass@proxy.example.com:8080
```

### Starting the Backend

```bash
python api.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run build
```

### Loading Extension

1. Open Chrome Extensions page
2. Enable Developer Mode
3. Load unpacked extension
4. Select built frontend directory

## 🔧 Troubleshooting

### YouTube IP Ban Issues

If you encounter errors like "Video unavailable" or "Transcripts disabled", your IP might be blocked by YouTube. Try these solutions:

1. **Configure Proxy**: Set up `PROXY_HTTP_URL` and `PROXY_HTTPS_URL` environment variables
2. **Check Proxy Connectivity**: Ensure your proxy service is active and accessible
3. **Rotate Proxy IPs**: Use a proxy service that automatically rotates IP addresses
4. **Monitor Logs**: Check backend console output for proxy configuration status

### Common Error Messages

- **"TranscriptsDisabled"**: Video has no available transcripts
- **"VideoUnavailable"**: Video might be private, deleted, or region-blocked
- **"NoTranscriptFound"**: No transcripts in supported languages
- **"Failed to configure proxy"**: Check proxy URL format and credentials

### Proxy Debugging

The backend will log proxy configuration status:

```
Configuring YouTube Transcript API with proxy:
  HTTP Proxy: proxy.example.com:8080
  HTTPS Proxy: proxy.example.com:8080
Proxy configuration successful.
```

If proxy fails, it will fall back to direct connection automatically.

## 🚀 API Request Management

### Automatic Request Cancellation

The application now includes smart request management to prevent race conditions and improve user experience:

#### Features:
- **Auto-cancellation**: Previous requests are automatically cancelled when new ones are made
- **Race condition prevention**: Only the latest request results are processed
- **Clean error handling**: Cancelled requests don't show error messages to users
- **Resource optimization**: Prevents unnecessary network usage and processing

#### How it works:

1. **Transcript Requests**: When a new video is loaded, any pending transcript request is cancelled
2. **Query Requests**: When a user sends a new question, any pending AI query is cancelled
3. **Component Cleanup**: All pending requests are cancelled when the popup is closed

#### API Functions Available:

```javascript
import { 
  getTranscript, 
  queryTranscript, 
  cancelAllRequests,
  getRequestStatus,
  hasPendingRequests 
} from '../services/apis';

// Cancel all pending requests manually
cancelAllRequests();

// Check current request status
const status = getRequestStatus();
console.log(status.hasTranscriptRequest); // boolean
console.log(status.currentQuery); // string or null

// Check if any requests are pending
if (hasPendingRequests()) {
  console.log("Requests in progress...");
}
```

#### Benefits:
- **Better UX**: Users see results from their latest action, not older requests
- **Performance**: Reduces server load and unnecessary processing
- **Reliability**: Prevents confusing responses from out-of-order request completion
