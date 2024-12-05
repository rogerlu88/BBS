import { useState } from "react";
import "./App.css";
import useWebSocket from "./useWebsocket";

function App() {
  const [topics, setTopics] = useState(new Map());
  const [message, setMessage] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [currentTopic, setCurrentTopic] = useState(null);
  const { websocket, reconnect } = useWebSocket(
    "ws://localhost:8080/",
    (data) => {
      if (data.type === "history") {
        setTopics(prev => new Map(prev).set(data.topic, data.messages));
      } else if (data.type === "message") {
        setTopics(prev => {
          const newMap = new Map(prev);
          const topicMessages = newMap.get(data.topic) || [];
          newMap.set(data.topic, [...topicMessages, data.data]);
          return newMap;
        });
      }
    }
  );

  const joinTopic = (topic) => {
    if (websocket && topic) {
      websocket.send(JSON.stringify({
        type: "join",
        topic: topic
      }));
      setCurrentTopic(topic);
      setNewTopic("");
    }
  };

  const sendMessage = () => {
    if (websocket && currentTopic && message.trim()) {
      websocket.send(JSON.stringify({
        type: "message",
        topic: currentTopic,
        message: message
      }));
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h1>Topic-based Chat</h1>
      <button onClick={reconnect}>Reconnect</button>
      
      <div className="topic-section">
        <h2>Join Topic</h2>
        <div className="topic-input">
          <input
            placeholder="Enter topic name"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                joinTopic(newTopic);
              }
            }}
          />
          <button onClick={() => joinTopic(newTopic)}>Join Topic</button>
        </div>
      </div>

      <div className="topics-list">
        <h2>Your Topics</h2>
        {Array.from(topics.keys()).map((topic) => (
          <button
            key={topic}
            onClick={() => setCurrentTopic(topic)}
            className={currentTopic === topic ? "active" : ""}
          >
            {topic}
          </button>
        ))}
      </div>

      {currentTopic && (
        <div className="chat-section">
          <h2>Chat: {currentTopic}</h2>
          <div className="messages">
            {(topics.get(currentTopic) || []).map((msg, index) => (
              <div key={index} className="message">
                <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <span className="content">{msg.message}</span>
              </div>
            ))}
          </div>
          <div className="input-section">
            <input
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
