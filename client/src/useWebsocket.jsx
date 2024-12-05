import { useCallback, useEffect, useState } from "react";

function useWebSocket(url, setData) {
  const [websocket, setWebsocket] = useState(null);
  const connect = useCallback(() => {
    let reconnectAttempts = 0;
    console.log("Connecting to websocket", url);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log("Connected to websocket");
      setWebsocket(ws);
      reconnectAttempts = 0;
    };

    ws.onclose = () => {
      console.log("Disconnected from websocket");
      setWebsocket(null);
      // Only attempt to reconnect if attempts are below 10
      if (reconnectAttempts < 10) {
        reconnectAttempts += 1;

        // Calculate delay based on the attempt number, capping at 1 minute
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 60000);

        console.log(
          `Reconnecting in ${
            delay / 1000
          } seconds... (Attempt ${reconnectAttempts})`
        );
        setTimeout(connect, delay);
      } else {
        console.log(
          "Max reconnect attempts reached. Stopping further attempts."
        );
      }
    };

    ws.onmessage = (event) => {
      console.log("Message received from websocket", event);
      console.log("event.data", event.data);

      if (typeof event.data === "string") {
        const json = JSON.parse(event.data);

        setData((data) => [...data, json]);
      } else {
        // in some cases, the server will send event.data as a Blob, so we need to convert it to a string

        const blob = event.data;
        const reader = new FileReader();
        reader.onload = () => {
          const dataString = reader.result;
          const json = JSON.parse(dataString);
          const data = json.data;
          setData((prev) => [...prev, data]);
        };
        reader.readAsText(blob);
      }
    };
  }, [setData, url]);
  const reconnect = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  return { websocket, reconnect };
}

export default useWebSocket;
