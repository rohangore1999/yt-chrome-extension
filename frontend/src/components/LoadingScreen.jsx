import { Youtube, Brain, Zap, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import "./LoadingScreen.css";

export function LoadingScreen({ type }) {
  const isIngestion = type === "ingestion";

  return (
    <div className="loading-screen">
      <Card className="loading-card">
        <div className="loading-card-background" />
        <div className="loading-accent-line" />

        <CardContent className="loading-content">
          {/* Enhanced Animated Icon */}
          <div className="loading-icon-container">
            <div className="loading-icon-circle">
              {isIngestion ? (
                <Youtube className="loading-main-icon" />
              ) : (
                <Brain className="loading-main-icon" />
              )}
            </div>
          </div>

          {/* Loading Text */}
          <div className="loading-text">
            <h3 className="loading-title">
              {isIngestion ? "Processing Video" : "AI Thinking"}
            </h3>
            <p className="loading-description">
              {isIngestion
                ? "Extracting insights from your YouTube video..."
                : "Analyzing content to give you the best answer..."}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="loading-progress">
            <div className="loading-status">
              {isIngestion ? (
                <>
                  <Zap className="status-icon" />
                  <span>Transcribing audio</span>
                </>
              ) : (
                <>
                  <Sparkles className="status-icon" />
                  <span>Processing query</span>
                </>
              )}
            </div>

            {/* Animated Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar"></div>
            </div>
          </div>

          {/* Fun Messages */}
          <div className="loading-messages">
            {isIngestion ? (
              <>
                <p>✨ Creating your personal video assistant</p>
                <p className="message-secondary">
                  🎯 This might take a moment...
                </p>
              </>
            ) : (
              <>
                <p>🧠 Connecting the dots</p>
                <p className="message-secondary">⚡ Almost there...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
