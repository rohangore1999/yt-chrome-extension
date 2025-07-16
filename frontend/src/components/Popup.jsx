import React, { useEffect, useState } from "react";
import "./Popup.css";
import { YoutubeTranscript } from "youtube-transcript";
import { getTranscript, queryTranscript } from "../services/apis";

const Popup = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  // Function to convert timestamp text to seconds
  const convertTimestampToSeconds = (timestampText) => {
    // Extract just the number from the timestamp
    const match = timestampText.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.floor(parseFloat(match[1])) : null;
  };

  // Function to create YouTube timestamp URL
  const createTimestampUrl = (seconds) => {
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
  };

  // Function to process message text and make timestamps clickable
  const processMessageText = (text) => {
    // Match timestamps in format [123.456s] or similar
    const timestampRegex = /\[(\d+(?:\.\d+)?s)\]/g;
    const parts = text.split(timestampRegex);

    if (parts.length <= 1) return <p>{text}</p>;

    const elements = [];
    let i = 0;

    const matches = text.match(timestampRegex) || [];
    matches.forEach((fullMatch, index) => {
      // Add text before timestamp
      if (parts[i]) {
        elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }

      // Extract the timestamp value
      const seconds = convertTimestampToSeconds(fullMatch);
      if (seconds !== null) {
        elements.push(
          <a
            key={`timestamp-${i}`}
            href={createTimestampUrl(seconds)}
            target="_blank"
            rel="noopener noreferrer"
            className="timestamp-link"
            onClick={(e) => {
              e.preventDefault();
              window.open(createTimestampUrl(seconds), "_blank");
            }}
          >
            {fullMatch}
          </a>
        );
      }

      i += 2; // Move to next text part
    });

    // Add remaining text
    if (parts[i]) {
      elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
    }

    return <p>{elements}</p>;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return; // Don't submit empty messages

    // Add user message
    setMessages([...messages, { text: input, type: "user" }]);

    try {
      setIsLoading(true);
      // Get AI response
      const response = await queryTranscript(input);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            text: response.response,
            type: "system",
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
      e.preventDefault(); // Prevent default to avoid new line in input
      handleSubmit();
    }
  };

  const fetchTranscript = async (videoId) => {
    try {
      setIsTranscriptLoading(true);
      // Clear existing messages when video changes
      setMessages([]);

      const transcript = await getTranscript(videoId);
      console.log({ transcript });

      if (transcript.success) {
        // Add welcome message for new video
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
    // Initial load of videoId
    chrome.storage.sync.get(["videoId"], (result) => {
      console.log("Initial videoId:", result);
      if (result.videoId) {
        setVideoId(result.videoId);
        fetchTranscript(result.videoId);
      }
    });

    // Add listener for storage changes
    const handleStorageChange = (changes, namespace) => {
      if (namespace === "sync" && changes.videoId) {
        console.log("VideoId changed:", changes.videoId.newValue);
        setVideoId(changes.videoId.newValue);
        fetchTranscript(changes.videoId.newValue);
      }
    };

    // Add the listener
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup: remove listener when component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []); // Empty dependency array since we want this to run once on mount

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
                {processMessageText(message.text)}
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
