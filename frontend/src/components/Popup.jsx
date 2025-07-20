import React, { useEffect, useState } from "react";
import "./Popup.css";
import { getTranscript, queryTranscript } from "../services/apis";
import MarkdownResponse from "./MarkdownResponse";


const Popup = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, type: "user" }]);

    try {
      setIsLoading(true);
      const response = await queryTranscript(input);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            text: response.response,
            type: "system",
            timestamps: response.timestamps,
          },
        ]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error while processing your question. Please try again.",
          type: "system",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
            text: "Hi! I'm ready to answer questions about this video. What would you like to know?",
            type: "system",
          },
        ]);
      } else {
        setMessages([
          {
            text: "Sorry, I couldn't load the transcript for this video. Please try another video.",
            type: "system",
            isError: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setMessages([
        {
          text: "Sorry, there was an error loading the video transcript. Please try again later.",
          type: "system",
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
        fetchTranscript(result.videoId);
      }
    });

    const handleStorageChange = (changes, namespace) => {
      if (namespace === "sync" && changes.videoId) {
        console.log("VideoId changed:", changes.videoId.newValue);
        setVideoId(changes.videoId.newValue);
        fetchTranscript(changes.videoId.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  console.log({ messages });

  return (
    <div className="popup">
      <div className="chat-container">
        {isTranscriptLoading ? (
          <div className="loading-container">
            <p>Loading video transcript...</p>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.type === "user" ? "user-message" : "system-message"
                } ${message.isError ? "error-message" : ""}`}
              >
                {message.type === "user" ? (
                  <p>{message.text}</p>
                ) : (
                  <MarkdownResponse
                    text={message.text}
                    timestamps={message.timestamps}
                    videoId={videoId}
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message system-message">
                <p>Thinking...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter your questions"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isTranscriptLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || isTranscriptLoading}
        >
          {isLoading ? "..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default Popup;
