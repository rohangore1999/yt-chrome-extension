import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Settings } from "lucide-react";
import "./ChatScreen.css";

export function ChatScreen({ onApiKeyChange }) {
  return (
    <div className="chat-screen">
      <Card className="chat-card">
        <CardHeader className="chat-header">
          <div className="chat-icon-container">
            <MessageSquare className="chat-icon" />
          </div>
          <CardTitle>Chat Screen</CardTitle>
        </CardHeader>
        <CardContent className="chat-content">
          <p className="chat-placeholder">Chat functionality would go here</p>
          <Button
            onClick={onApiKeyChange}
            variant="outline"
            className="change-key-button"
          >
            <Settings className="settings-icon" />
            Change API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
