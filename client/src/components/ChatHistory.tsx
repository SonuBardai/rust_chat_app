import { MessageRender } from "../types/Message";

const ChatHistory: React.FC<{
  username: string;
  messages: MessageRender[];
}> = ({ username: my_username, messages }) => {
  return (
    <ul className="p-4 h-[400px] overflow-y-auto">
      {messages.map((message, index) => (
        <li
          key={index}
          className={
            message.user === my_username ? "mb-2 text-right" : "mb-2 text-left"
          }
        >
          <div className="font-bold">{message.user}:</div> {message.message}
        </li>
      ))}
    </ul>
  );
};

export default ChatHistory;
