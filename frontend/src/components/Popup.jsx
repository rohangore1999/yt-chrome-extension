import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Send,
  Settings,
  MessageCircle,
  Bot,
  Sparkles,
  KeyRound,
  X,
} from "lucide-react";

import { LoadingScreen } from "./LoadingScreen";
import { getTranscript, queryTranscript } from "../services/apis";
import MarkdownResponse from "./MarkdownResponse";
import "./Popup.css";

const SUGGESTED_QUESTIONS = [
  "What is this video about?",
  "Summarize the key points",
  "What are the main takeaways?",
  "Explain the most important concept",
  "What tools or resources are mentioned?",
  "Can you break down the tutorial steps?",
];

const Popup = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hi! I'm ready to help you understand this YouTube video. Click on a suggestion below or ask me anything!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [videoId, setVideoId] = useState("");
  const [videoTitle, setVideoTitle] = useState("YouTube Video");
  const [videoUrl, setVideoUrl] = useState("");

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await queryTranscript(textToSend);

      if (response.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
          timestamps: response.timestamps,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your question. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ action: "closePopup" }, "*");
    } else {
      window.close();
    }
  };

  const handleKeyChange = () => {
    // goto api key screen
    window.location.href =
      "chrome-extension://" + chrome.runtime.id + "/index.html";
  };

  const fetchTranscript = async (videoId) => {
    try {
      setIsTranscriptLoading(true);
      setMessages([]);

      const transcript = await getTranscript(videoId);
      console.log({ transcript });

      if (transcript.success) {
        setMessages([
          {
            id: "1",
            text: "Hi! I'm ready to answer questions about this video. What would you like to know?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setShowSuggestions(true);
      } else {
        setMessages([
          {
            id: "1",
            text: "Sorry, I couldn't load the transcript for this video. Please try another video.",
            isUser: false,
            timestamp: new Date(),
            isError: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setMessages([
        {
          id: "1",
          text: "Sorry, there was an error loading the video transcript. Please try again later.",
          isUser: false,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  useEffect(() => {
    chrome.storage.sync.get(["videoId"], (result) => {
      console.log("Initial videoId:", result);
      if (result.videoId) {
        setVideoId(result.videoId);
        setVideoUrl(`https://youtube.com/watch?v=${result.videoId}`);
        fetchTranscript(result.videoId);
      }
    });

    const handleStorageChange = (changes, namespace) => {
      if (namespace === "sync" && changes.videoId) {
        console.log("VideoId changed:", changes.videoId.newValue);
        setVideoId(changes.videoId.newValue);
        setVideoUrl(`https://youtube.com/watch?v=${changes.videoId.newValue}`);
        fetchTranscript(changes.videoId.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  if (isTranscriptLoading) {
    return (
      <div className="popup-container">
        <LoadingScreen type="ingestion" />
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <div className="header-content">
          <div className="header-left">
            <div className="youtube-icon-container">
              <div className="icon-glow"></div>
              <div className="icon-wrapper">
                <Youtube className="youtube-icon" />
              </div>
            </div>

            <div className="header-info">
              <h2 className="header-title">YouTube RAG</h2>
            </div>
          </div>

          <div className="header-right">
            <Button variant="outline" size="sm" onClick={handleKeyChange}>
              <KeyRound className="close-icon" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleClose}
              className="close-button"
            >
              <X className="close-icon" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container" ref={scrollAreaRef}>
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.isUser ? "user-message" : "bot-message"
              }`}
            >
              {!message.isUser && (
                <div className="message-avatar bot-avatar">
                  <Bot className="avatar-icon" />
                </div>
              )}

              <div
                className={`message-bubble ${
                  message.isError ? "error-message" : ""
                }`}
              >
                <div className="message-content">
                  {message.isUser ? (
                    message.text
                  ) : (
                    <MarkdownResponse
                      text={message.text}
                      timestamps={message.timestamps}
                      videoId={videoId}
                    />
                  )}
                </div>

                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {message.isUser && (
                <div className="message-avatar user-avatar">
                  <MessageCircle className="avatar-icon" />
                </div>
              )}
            </div>
          ))}

          {/* Suggested Questions */}
          {showSuggestions && messages.length === 1 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <Badge variant="secondary" className="suggestions-badge">
                  <Sparkles className="suggestions-icon" />
                  Quick Questions
                </Badge>
              </div>
              <div className="suggestions-grid">
                {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    <div className="suggestion-content">
                      <div className="suggestion-dot"></div>
                      <span className="suggestion-text">{suggestion}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="loading-message">
              <LoadingScreen type="retrieval" />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="input-section">
        <div className="input-container">
          <div className="input-wrapper">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the video..."
              className="message-input"
              disabled={isLoading}
            />
            <div className="input-icon">
              <Sparkles className="sparkles-icon" />
            </div>
          </div>

          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            <div className="button-glow"></div>
            <Send className="send-icon" />
          </Button>
        </div>

        <div className="input-hint">
          <span>Press Enter to send</span>
          {inputValue.length > 0 && (
            <span className="character-count">{inputValue.length}/500</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
