import { useState, useEffect } from "react";
import { ApiKeyScreen } from "@/components/ApiKeyScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import Popup from "@/components/Popup";
import "./Index.css";

const Index = () => {
  const [apiKey, setApiKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for stored API key on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");

    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key) => {
    setIsProcessing(true);

    // Store API key in localStorage
    localStorage.setItem("gemini_api_key", key);

    // Simulate data ingestion time
    setTimeout(() => {
      setIsProcessing(false);
      setApiKey(key);
    }, 3000);
  };

  const handleApiKeyChange = () => {
    // Clear API key from localStorage
    localStorage.removeItem("gemini_api_key");
    
    setApiKey(null);
    setIsProcessing(false);
  };

  return (
    <div className="app-container">
      <div className="app-card">
        {isProcessing ? (
          <LoadingScreen type="ingestion" />
        ) : !apiKey ? (
          <ApiKeyScreen onApiKeySubmit={handleApiKeySubmit} />
        ) : (
          <Popup onApiKeyChange={handleApiKeyChange} />
        )}
      </div>
    </div>
  );
};

export default Index;
