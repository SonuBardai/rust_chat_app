import React, { useEffect, useState } from "react";
import { MessageRender } from "../types/Message";
import { MessageType } from "../types/MessageType";
import { ServerMessage } from "../types/ServerMessage";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";
import ErrorBox, { ErrorBoxProps } from "./ErrorBox";
import UsernamePrompt from "./UsernamePrompt";

const ChatWindow: React.FC<{ WEBSOCKET_SERVER: string }> = ({
  WEBSOCKET_SERVER,
}) => {
  const [messages, setMessages] = useState<MessageRender[]>([]);
  const [username, setUsername] = useState("");
  const [showPrompt, setShowPrompt] = useState(true);
  const [error, setError] = useState<ErrorBoxProps | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    setSocket(new WebSocket(WEBSOCKET_SERVER));

    return () => {
      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message: ServerMessage = JSON.parse(event.data);
        switch (message.message_type) {
          case MessageType.Error:
            setError({ message: message.payload });
            break;
          case MessageType.NewUser:
            setMessages([
              ...messages,
              {
                message: `New user ${message.payload} has joined the chat! `,
                message_type: message.message_type,
                user: "", // system message
              },
            ]);
            return;
          case MessageType.Text:
            return;
          default:
            return;
        }
      };
      socket.onclose = (event) => {
        setError({ message: "Connection lost with server" });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleSetUsername = (username: string) => {
    setUsername(username);
    setShowPrompt(false);
    socket?.send(
      JSON.stringify({
        message_type: MessageType.UserConnect,
        payload: username,
      })
    );
  };

  const handleSendMessage = (message: string) => {
    setMessages((messages) => [
      ...messages,
      { user: username, message, message_type: MessageType.Text },
    ]);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-md">
      {error && <ErrorBox {...error} />}
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
