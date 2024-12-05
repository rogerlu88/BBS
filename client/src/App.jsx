import { useState } from "react";
import "./App.css";
import useWebSocket from "./useWebsocket";

function App() {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const { websocket, reconnect } = useWebSocket(
    "ws://localhost:8080/",
    setData
  );

  return (
    <>
      <h1>Websocket Chat</h1>
      <button onClick={reconnect}>Reconnect</button>
      <div>
        <ul>
          {data.map((data, index) => (
            <li key={index}>{data.message}</li>
          ))}
        </ul>
        <input
          placeholder="Enter message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              websocket.send(
                JSON.stringify({
                  message: message,
                })
              );
              setMessage("");
            }
          }}
        />
        <button
          onClick={() => websocket.send(JSON.stringify({ message: message }))}
        >
          Send
        </button>
      </div>
    </>
  );
}
export default App;
