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

// Function to create timestamp link component
const TimestampLink = ({ time }) => {
  const seconds = convertTimestampToSeconds(time);
  if (seconds !== null) {
    return (
      <a
        href="#"
        rel="noopener noreferrer"
        className="timestamp-link"
        onClick={(e) => {
          e.preventDefault();
          console.log("Seeking to timestamp:", seconds);
          // Send message to content script to seek to timestamp
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  action: "seekToTimestamp",
                  seconds: seconds,
                },
                (response) => {
                  if (response && response.success) {
                    console.log("Successfully seeked to timestamp");
                  } else {
                    console.log("Failed to seek to timestamp");
                  }
                }
              );
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
export const customRenderers = {
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
