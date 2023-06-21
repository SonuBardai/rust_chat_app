import React, { useState } from "react";
import { Message } from "../types/Message";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";
import UsernamePrompt from "./UsernamePrompt";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [showPrompt, setShowPrompt] = useState(true);

  const handleSetUsername = (username: string) => {
    setUsername(username);
    setShowPrompt(false);
  };

  const handleSendMessage = (message: string) => {
    setMessages((messages) => [...messages, { user: username, message }]);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-md">
      {showPrompt && (
        <UsernamePrompt
          username={username}
          setUsername={setUsername}
          handleSetUsername={handleSetUsername}
        />
      )}
      <ChatHistory username={username} messages={messages} />
      <ChatBox onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
