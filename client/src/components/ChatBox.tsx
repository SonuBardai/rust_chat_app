import React, { useState } from "react";

const ChatBox: React.FC<{ onSendMessage: (message: string) => void }> = ({
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="flex p-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow px-4 py-2 rounded-l-md border border-r-0 focus:outline-none focus:ring"
      />
      <button
        type="submit"
        onClick={handleSendMessage}
        className="px-4 py-2 rounded-r-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring"
      >
        Send
      </button>
    </div>
  );
};

export default ChatBox;
