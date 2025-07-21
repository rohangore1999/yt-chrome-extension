import { useState } from "react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import { Sparkles, Eye, EyeOff, Shield, Zap } from "lucide-react";

// Styles
import "./ApiKeyScreen.css";

export function ApiKeyScreen({ onApiKeySubmit }) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onApiKeySubmit(apiKey.trim());
    setIsLoading(true);
  };

  return (
    <div className="api-key-screen">
      {/* Animated Header */}
      <div className="api-key-header">
        <h1 className="title">YouTube RAG Assistant</h1>
        <p className="subtitle">Powered by Google Gemini AI</p>
      </div>

      {/* Enhanced Card */}
      <Card className="api-key-card">
        <div className="card-background"></div>
        <div className="card-accent-line"></div>

        <CardHeader className="card-header-center">
          <CardTitle className="card-main-title">Connect with Gemini</CardTitle>

          <CardDescription className="card-description">
            Enter your Gemini API key to unlock AI-powered video analysis
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content-form">
          <form onSubmit={handleSubmit} className="api-form">
            <div className="form-field">
              <Label htmlFor="apiKey" className="form-label">
                <Shield className="label-icon" />
                Gemini API Key
              </Label>

              <div className="input-wrapper">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="api-input"
                />

                <div className="input-icon" onClick={toggleApiKeyVisibility}>
                  {showApiKey ? (
                    <Eye className="sparkles-icon" />
                  ) : (
                    <EyeOff className="sparkles-icon" />
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="submit-button"
              disabled={!apiKey.trim() || isLoading}
            >
              <div className="button-glow"></div>
              {isLoading ? (
                <div className="button-content">
                  <Zap className="loading-icon" />
                  Connecting...
                </div>
              ) : (
                <div className="button-content">
                  <Sparkles className="submit-icon" />
                  Start Chatting
                </div>
              )}
            </Button>
          </form>

          {/* Enhanced Features Section */}
          <div className="features-section">
            <div className="help-section">
              <Badge variant="secondary" className="help-badge">
                New to Gemini?
              </Badge>
              <div className="help-text">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Get your free API key here →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
