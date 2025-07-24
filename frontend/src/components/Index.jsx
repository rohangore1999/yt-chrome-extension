import { useState, useEffect } from "react";

// Components
import { ApiKeyScreen } from "@/components/ApiKeyScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import Popup from "@/components/Popup";

// Storage utilities
import {
  getStorageValue,
  setStorageValue,
  removeStorageValue,
  STORAGE_KEYS,
} from "@/lib/storage";

// Styles
import "./Index.css";

const Index = () => {
  const [apiKey, setApiKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for stored API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      const storedApiKey = await getStorageValue(STORAGE_KEYS.API_KEY);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    };

    loadApiKey();
  }, []);

  const handleApiKeySubmit = async (key) => {
    setIsProcessing(true);

    // Store API key in Chrome storage
    await setStorageValue(STORAGE_KEYS.API_KEY, key);
    console.log("API key saved to Chrome storage");

    // Simulate data ingestion time
    setTimeout(() => {
      setIsProcessing(false);
      setApiKey(key);
    }, 3000);
  };

  const handleApiKeyChange = async () => {
    // Clear API key from Chrome storage
    await removeStorageValue(STORAGE_KEYS.API_KEY);
    console.log("API key removed from Chrome storage");

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
