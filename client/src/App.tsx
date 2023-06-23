import ChatWindow from "./components/ChatWindow";

const WEBSOCKET_HOST = process.env.REACT_APP_WEBSOCKET_HOST;
const WEBSOCKET_PORT = process.env.REACT_APP_WEBSOCKET_PORT;
const WEBSOCKET_ENDPOINT = "ws";
const WEBSOCKET_SERVER = `ws://${WEBSOCKET_HOST}:${WEBSOCKET_PORT}/${WEBSOCKET_ENDPOINT}`;

function App() {
  return (
    <div>
      <ChatWindow WEBSOCKET_SERVER={WEBSOCKET_SERVER} />
    </div>
  );
}

export default App;
