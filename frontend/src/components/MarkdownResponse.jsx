import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";
import "./MarkdownResponse.css";

const MarkdownResponse = ({ text, videoId }) => {
  console.log("MarkdownResponse rendered with:", { text, videoId });

  // Function to convert timestamp text to seconds
  const convertTimestampToSeconds = (timestampText) => {
    // Handle both [MM:SS] and (MM:SS) formats
    const timeMatch = timestampText.match(/\d{2}:\d{2}/);
    if (timeMatch) {
      const [minutes, seconds] = timeMatch[0]
        .split(":")
        .map((num) => parseInt(num, 10));
      return minutes * 60 + seconds;
    }
    return null;
  };

  // Function to create YouTube timestamp URL
  const createTimestampUrl = (seconds) => {
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
  };

  // Function to create timestamp link component
  const TimestampLink = ({ time }) => {
    const seconds = convertTimestampToSeconds(time);
    if (seconds !== null) {
      return (
        <a
          href={createTimestampUrl(seconds)}
          rel="noopener noreferrer"
          className="timestamp-link"
          onClick={(e) => {
            e.preventDefault();
            const url = createTimestampUrl(seconds);
            console.log("Navigating to:", url);
            // As we are using chrome extension, Use Chrome's API to update the current tab's URL
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]) {
                chrome.tabs.update(tabs[0].id, { url: url });
              }
            });
          }}
        >
          [{time}]
        </a>
      );
    }
    return `[${time}]`;
  };

  // Function to process text and convert timestamps to links
  const processText = (text) => {
    if (typeof text !== "string") {
      console.log("Received non-string text:", text);
      return text;
    }

    const parts = text.split(/(\[\d{2}:\d{2}\])/g);
    return parts.map((part, index) => {
      const timeMatch = part.match(/\[(\d{2}:\d{2})\]/);
      if (timeMatch) {
        return <TimestampLink key={index} time={timeMatch[1]} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Function to process children that might be an array of elements
  const processChildren = (children) => {
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (typeof child === "string") {
          return processText(child);
        }
        return child;
      });
    }
    return processText(children);
  };

  // Custom renderers for different node types
  const customRenderers = {
    text: ({ children }) => {
      return processText(children);
    },
    p: ({ children }) => {
      return <p>{processChildren(children)}</p>;
    },
    li: ({ children }) => {
      console.log("List item children:", children);
      return <li>{processChildren(children)}</li>;
    },
    strong: ({ children }) => {
      return <strong>{processChildren(children)}</strong>;
    },
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownResponse;
