# Privacy Policy - AI Video Assistant Chrome Extension

**Last Updated:** January 22, 2025  
**Effective Date:** January 22, 2025  
**Version:** 1.0

---

## Important Notice

This extension is designed with privacy in mind. We collect only the minimal data necessary to provide AI-powered conversations with YouTube video content, and we do not sell, share, or misuse your data.

## 1. Information We Collect

### Data We DO Collect:

#### 🔑 Authentication Information

- **What:** Your Google Gemini API key
- **How:** Stored locally in your browser's localStorage and Chrome sync storage
- **Why:** Required to enable AI functionality for analyzing YouTube video content
- **Code Reference:** `localStorage.getItem("gemini_api_key")` in apis.js
- **Your Control:** You can delete this anytime by clearing the extension's storage or removing the extension

#### 📺 Video Identification Data

- **What:** YouTube video IDs from videos you visit
- **How:** Extracted from URL parameters and stored temporarily in Chrome storage
- **Why:** To identify which video you want to discuss with the AI assistant
- **Code Reference:** `urlParams.get("v")` in content.js
- **Scope:** Only the video ID (e.g., "dQw4w9WgXcQ"), not your full browsing history

#### 💬 User Queries and Interactions

- **What:** Questions you ask about video content and timestamp interactions
- **How:** Sent to our backend API for processing with your AI responses
- **Why:** To generate relevant AI responses about the video content
- **Code Reference:** `queryTranscript(query)` function in apis.js
- **Processing:** Used only for generating AI responses, not stored permanently

#### 📝 Video Content Data

- **What:** YouTube video transcript data and AI-generated responses
- **How:** Retrieved from YouTube's public transcript API and processed through Google's Gemini AI
- **Why:** To enable intelligent question-answering about video content
- **Code Reference:** `/api/transcript` endpoint processing
- **Source:** Only publicly available transcript data from YouTube

### Data We DO NOT Collect:

❌ **Personal Identity:** No names, email addresses, phone numbers, or personal identifiers  
❌ **Browsing History:** No tracking of your general web browsing outside of YouTube video identification  
❌ **Location Data:** No GPS coordinates, IP addresses, or geographic information  
❌ **Health Information:** No medical, health, or biometric data  
❌ **Financial Data:** No credit card numbers, payment information, or financial records  
❌ **Personal Communications:** No emails, text messages, or private communications  
❌ **Device Information:** No device fingerprinting or detailed system information

## 2. How We Use Your Information

**Single Purpose Use:** All collected data is used exclusively for the extension's core functionality - enabling AI-powered conversations with YouTube video content.

### Specific Uses:

- **API Key:** Authenticate with Google Gemini AI service using your personal API key
- **Video IDs:** Identify which YouTube video to analyze and retrieve transcripts for
- **User Queries:** Generate contextual AI responses about video content
- **Transcript Data:** Process video content to enable intelligent question-answering
- **Timestamps:** Enable navigation to specific moments in videos based on AI responses

## 3. Data Storage and Security

### Local Storage:

- **API Keys:** Stored securely in your browser's local storage and Chrome sync storage
- **Video Context:** Temporarily stored in browser storage for session continuity
- **No Server Storage:** We do not permanently store your personal data on our servers

### Data Processing:

- **Local Processing:** Most data processing happens locally in your browser
- **API Processing:** Queries are sent to our backend API and Google's Gemini AI for response generation
- **Temporary Processing:** Server-side data is processed temporarily and not stored permanently

## 4. Data Sharing and Third Parties

### ⚠️ We do NOT sell, rent, or share your data with third parties for marketing or commercial purposes.

### Limited Third-Party Interactions:

- **Google Gemini AI:** Your queries are sent to Google's AI service using your personal API key
- **YouTube API:** We access publicly available transcript data from YouTube
- **No Data Brokers:** We do not work with data brokers or advertising networks
- **No Analytics:** We do not use third-party analytics services that track users

## 5. User Rights and Control

### Your Rights:

- **Access:** You can view all data stored by the extension in your browser's developer tools
- **Deletion:** Remove your API key and stored data by clearing the extension's storage
- **Modification:** Update your API key anytime through the extension settings
- **Uninstall:** Completely remove all data by uninstalling the extension

### How to Delete Your Data:

1. **API Key:** Open the extension, go to settings, and clear the API key field
2. **Stored Data:** Right-click the extension icon → "Manage Extension" → "Storage" → Clear data
3. **Complete Removal:** Uninstall the extension from Chrome's extension manager

## 6. Data Retention

- **API Keys:** Stored until you manually remove them or uninstall the extension
- **Video IDs:** Stored temporarily for session continuity, cleared when you navigate away
- **Query Data:** Processed temporarily for response generation, not permanently stored
- **No Long-term Storage:** We do not maintain long-term databases of user activity

## 7. Children's Privacy

This extension is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have it removed.

## 8. Security Measures

- **Local Storage Security:** Data is stored using Chrome's secure storage APIs
- **HTTPS Communication:** All API communications use encrypted HTTPS connections
- **No Public Exposure:** Your API keys and personal data are never publicly exposed
- **Minimal Data Principle:** We collect only the minimum data necessary for functionality

## 9. Changes to This Policy

We may update this privacy policy periodically to reflect changes in our practices or for legal compliance. We will notify users of significant changes through the extension's update mechanism or by posting the updated policy with a new effective date.

## 10. Legal Compliance

This extension complies with:

- **Chrome Web Store Developer Program Policies**
- **General Data Protection Regulation (GDPR)** for EU users
- **California Consumer Privacy Act (CCPA)** for California users
- **Other applicable privacy laws** based on user location

## 11. Technical Implementation

**Code Transparency:** Our data collection is implemented through the following technical mechanisms:

- **Chrome Storage API:** `chrome.storage.sync.set()` for storing video IDs
- **Local Storage API:** `localStorage.setItem()` for API key storage
- **URL Parameter Extraction:** `URLSearchParams` for video ID detection
- **Message Passing:** `chrome.runtime.sendMessage()` for component communication
- **Content Script Injection:** `chrome.scripting.executeScript()` for YouTube integration

## Contact Information

If you have questions, concerns, or requests regarding this privacy policy or your data, please contact us:

- **Email:** [Your Email Address]
- **GitHub:** [Your GitHub Repository URL]
- **Extension Support:** Available through Chrome Web Store listing
- **Response Time:** We aim to respond to privacy inquiries within 48 hours

---

**Developer:** [Your Name]  
**Extension:** AI Video Assistant - Chrome Extension  
**Version:** 1.0  
**Repository:** [GitHub Repository URL]
