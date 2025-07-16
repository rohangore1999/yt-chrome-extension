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
