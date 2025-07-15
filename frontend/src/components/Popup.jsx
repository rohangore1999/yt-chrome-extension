import React, { useEffect, useState } from "react";
import "./Popup.css";
import { YoutubeTranscript } from "youtube-transcript";
import { getTranscript } from "../services/apis";

const Popup = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    // Add user message
    setMessages([...messages, { text: input, type: "user" }]);

    // Simulate AI response (you can replace this with actual API call later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "This is a sample AI response",
          type: "system",
        },
      ]);
    }, 1000);

    setInput("");
  };

  useEffect(() => {
    chrome.storage.sync.get(["videoId"], (result) => {
      console.log({ result });
    });
  }, []);

  useEffect(() => {
    const fetchTranscript = async () => {
      // const transcript = await getTranscript("pUJTx5JpiHw");
      // console.log({ transcript });
    };

    fetchTranscript();
  }, [messages]);

  return (
    <div className="popup">
      <h1>Youtube Persona Chatbot</h1>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.type === "user" ? "user-message" : "system-message"
              }`}
            >
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter your questions"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Popup;
