import { useState, useRef, useEffect } from "react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import MarkdownResponse from "@/components/MarkdownResponse";

// Icons
import {
  Youtube,
  Send,
  UserCircle,
  Bot,
  Sparkles,
  KeyRound,
  X,
  BrainCog,
  ChevronDown,
} from "lucide-react";

// Styles
import "./Popup.css";

// Services
import {
  getTranscript,
  queryTranscript,
  cancelAllRequests,
} from "../../services/apis";

// Storage
import {
  setStorageValue,
  getStorageValue,
  STORAGE_KEYS,
  MODELS,
  DEFAULT_MODEL,
} from "../../lib/storage.js";

const Popup = ({ onApiKeyChange }) => {
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
  const [videoId, setVideoId] = useState("");
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current && messages.at(-1).isUser) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
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
      model: DEFAULT_MODEL,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await queryTranscript(
        textToSend,
        videoId,
        DEFAULT_MODEL
      );

      if (response.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
          timestamps: response.timestamps,
          model: DEFAULT_MODEL,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      // Don't show error message if request was cancelled (user sent new message)
      if (error.message === "Request cancelled") {
        return; // Exit early, don't show error or update loading state
      }

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
    // Call the parent function to handle API key change
    onApiKeyChange();
  };

  const handleModelChange = async (model, messageId = null) => {
    setSelectedModel(model);
    setOpenDropdownId(null);
    await setStorageValue(STORAGE_KEYS.MODEL, model);

    // If a messageId is provided, append a new user message with the same text
    // and then append the AI response for the selected model
    if (messageId) {
      const targetMessage = messages.find(
        (msg) => msg.id === messageId && msg.isUser
      );

      if (!targetMessage) {
        return;
      }

      const newUserMessage = {
        id: Date.now().toString(),
        text: targetMessage.text,
        isUser: true,
        timestamp: new Date(),
        model,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      try {
        setIsLoading(true);
        const response = await queryTranscript(
          targetMessage.text,
          videoId,
          model
        );

        if (response.success) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            text: response.response,
            isUser: false,
            timestamp: new Date(),
            timestamps: response.timestamps,
            model,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error(response.error || "Failed to get response");
        }
      } catch (error) {
        if (error.message !== "Request cancelled") {
          console.error("Error getting response:", error);
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error while processing your question. Please try again.",
            isUser: false,
            timestamp: new Date(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchTranscript = async (videoId) => {
    try {
      // Cancel any pending requests before starting new transcript fetch
      cancelAllRequests();

      setIsTranscriptLoading(true);
      setMessages([]);

      const transcript = await getTranscript(videoId);

      if (transcript.success) {
        setMessages([
          {
            id: "1",
            text: "Hi! I'm ready to answer questions about this video. What would you like to know?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setQuickQuestions(transcript["quick-questions"]);
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
      // Don't show error message if request was cancelled (new video loaded)
      if (error.message === "Request cancelled") {
        return; // Exit early, don't show error or update loading state
      }

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
    // Load video ID and model preference from storage
    chrome.storage.sync.get(
      [STORAGE_KEYS.VIDEO_ID, STORAGE_KEYS.MODEL],
      (result) => {
        if (result[STORAGE_KEYS.VIDEO_ID]) {
          setVideoId(result[STORAGE_KEYS.VIDEO_ID]);
          fetchTranscript(result[STORAGE_KEYS.VIDEO_ID]);
        }

        if (result[STORAGE_KEYS.MODEL]) {
          setSelectedModel(result[STORAGE_KEYS.MODEL]);
        }
      }
    );

    const handleStorageChange = (changes, namespace) => {
      if (namespace === "sync" && changes.videoId) {
        const newVideoId = changes.videoId.newValue;
        const oldVideoId = changes.videoId.oldValue;

        // Only fetch transcript if the video ID actually changed
        if (newVideoId !== oldVideoId && newVideoId !== videoId) {
          setVideoId(newVideoId);
          fetchTranscript(newVideoId);
        } else {
          setVideoId(newVideoId);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      // Cancel any pending requests when component unmounts
      cancelAllRequests();
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
          {/* Suggested Questions */}
          {quickQuestions && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <Badge variant="secondary" className="suggestions-badge">
                  <Sparkles className="suggestions-icon" />
                  Quick Questions
                </Badge>
              </div>

              <div className="suggestions-grid">
                {quickQuestions.map((suggestion, index) => (
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

          {messages.map((message) => (
            <>
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
                    <UserCircle className="avatar-icon" />
                  </div>
                )}
              </div>

              {message.isUser && (
                <div
                  className="message-model"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    marginRight: "8px",
                    marginTop: "4px",
                    position: "relative",
                  }}
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === message.id ? null : message.id
                    )
                  }
                >
                  <BrainCog size={16} className="model-icon" />
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    {message.model === MODELS.GEMINI_FLASH || !message.model
                      ? "gemini flash"
                      : "gemini pro"}
                  </span>
                  <ChevronDown size={14} style={{ opacity: 0.7 }} />
                  {openDropdownId === message.id && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "24px",
                        right: "0",
                        background: "var(--background)",
                        border: "1px solid rgba(255, 0, 0, 0.2)",
                        borderRadius: "8px",
                        padding: "4px",
                        zIndex: 10,
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        width: "140px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderRadius: "4px",
                          backgroundColor:
                            message.model === MODELS.GEMINI_FLASH ||
                            !message.model
                              ? "rgba(255, 0, 0, 0.1)"
                              : "transparent",
                        }}
                        onClick={() =>
                          handleModelChange(MODELS.GEMINI_FLASH, message.id)
                        }
                      >
                        <span style={{ fontSize: "12px" }}>gemini flash</span>
                        {(message.model === MODELS.GEMINI_FLASH ||
                          !message.model) && <span>✓</span>}
                      </div>
                      <div
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderRadius: "4px",
                          backgroundColor:
                            message.model === MODELS.GEMINI_PRO
                              ? "rgba(255, 0, 0, 0.1)"
                              : "transparent",
                        }}
                        onClick={() =>
                          handleModelChange(MODELS.GEMINI_PRO, message.id)
                        }
                      >
                        <span style={{ fontSize: "12px" }}>gemini pro</span>
                        {message.model === MODELS.GEMINI_PRO && <span>✓</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ))}

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
      </div>
    </div>
  );
};

export default Popup;
