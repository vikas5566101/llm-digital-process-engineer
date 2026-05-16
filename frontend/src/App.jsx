import { useState } from "react";
import axios from "axios";

function App() {

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: message
        }
      );

      console.log("FULL RESPONSE:", res.data);

      // Show complete backend response
      setResponse(JSON.stringify(res.data, null, 2));

    } catch (error) {

      console.log("ERROR:", error);

      setResponse("Something went wrong");

    }
  };

  return (

    <div
      style={{
        padding: "40px",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white"
      }}
    >

      <h1
        style={{
          fontSize: "50px",
          marginBottom: "40px"
        }}
      >
        LLM Process Engineer Assistant
      </h1>

      <input
        type="text"
        placeholder="Ask something..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "400px",
          padding: "12px",
          marginRight: "10px",
          fontSize: "18px"
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: "12px 20px",
          cursor: "pointer"
        }}
      >
        Send
      </button>

      <div style={{ marginTop: "40px" }}>

        <h2>AI Response:</h2>

        <pre
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
            color: "white"
          }}
        >
          {response}
        </pre>

      </div>

    </div>
  );
}

export default App;