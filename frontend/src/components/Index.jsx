import { useState, useEffect } from "react";

// Components
import { ApiKeyScreen } from "@/components/ApiKeyScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import Popup from "@/components/Popup";

// Styles
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

  // Determine current app state
  const getCurrentState = () => {
    if (isProcessing) return "PROCESSING";
    if (!apiKey) return "NO_API_KEY";
    return "READY";
  };

  // Render component based on current state
  const renderContent = () => {
    switch (getCurrentState()) {
      case "PROCESSING":
        return (
          <div style={{ height: "100vh", width: "400px" }}>
            <LoadingScreen type="ingestion" />
          </div>
        );
      case "NO_API_KEY":
        return <ApiKeyScreen onApiKeySubmit={handleApiKeySubmit} />;
      case "READY":
        return <Popup onApiKeyChange={handleApiKeyChange} />;
      default:
        return <ApiKeyScreen onApiKeySubmit={handleApiKeySubmit} />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-card">{renderContent()}</div>
    </div>
  );
};

export default Index;
