import { useState } from "react";
import { ApiKeyScreen } from "@/components/ApiKeyScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import Popup from "@/components/Popup";
import "./Index.css";

const Index = () => {
  const [apiKey, setApiKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApiKeySubmit = (key) => {
    setIsProcessing(true);
    // Simulate data ingestion time
    setTimeout(() => {
      setIsProcessing(false);
      setApiKey(key);
    }, 3000);
  };

  const handleApiKeyChange = () => {
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
          <Popup />
        )}
      </div>
    </div>
  );
};

export default Index;
