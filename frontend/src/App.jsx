import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello Engineer. How can I assist you today?"
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // create typing function
  const typeMessage = async (fullText) => {

  let currentText = "";

  const aiMessage = {
    role: "assistant",
    text: ""
  };

  setMessages((prev) => [...prev, aiMessage]);

  for (let i = 0; i < fullText.length; i++) {

    currentText += fullText[i];

    setMessages((prev) => {

      const updated = [...prev];

      updated[updated.length - 1] = {
        role: "assistant",
        text: currentText
      };

      return updated;
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 10)
    );
  }
};

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;

    setMessage("");

    setLoading(true);

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: currentMessage
        }
      );

      await typeMessage(
        res.data.response || res.data.error
      );

    } catch (error) {

      const errorMessage = {
        role: "assistant",
        text: "System error occurred."
      };

      setMessages((prev) => [...prev, errorMessage]);

    }

    setLoading(false);
  };

  return (

    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}

      <div className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 p-5 flex flex-col">

        <h1 className="text-3xl font-bold text-emerald-400 mb-10 tracking-wide">
          Process AI
        </h1>

        <div className="space-y-4">

          <div className="bg-slate-800/70 hover:bg-slate-700 transition duration-300 p-4 rounded-2xl cursor-pointer border border-slate-700 shadow-lg">
            Process Optimization
          </div>

          <div className="bg-slate-800/70 hover:bg-slate-700 transition duration-300 p-4 rounded-2xl cursor-pointer border border-slate-700 shadow-lg">
            Safety Analysis
          </div>

          <div className="bg-slate-800/70 hover:bg-slate-700 transition duration-300 p-4 rounded-2xl cursor-pointer border border-slate-700 shadow-lg">
            Equipment Diagnostics
          </div>

        </div>

      </div>

      {/* Main Area */}

      <div className="flex-1 flex flex-col">

        {/* Header */}

        <div className="border-b border-slate-800 p-6 bg-slate-950/70 backdrop-blur-xl">

          <h2 className="text-4xl font-bold tracking-wide">
            LLM Digital Process Engineer
          </h2>

        </div>

        {/* Messages */}

        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-4xl px-6 py-5 rounded-3xl shadow-2xl whitespace-pre-wrap leading-8 text-[15px] ${
                  msg.role === "user"
                    ? "bg-emerald-400 text-black"
                    : "bg-slate-800/80 backdrop-blur-xl border border-slate-700 text-slate-100"
                }`}
              >

                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>

              </div>

            </div>

          ))}

          {/* Loading Animation */}

          {loading && (

            <div className="flex justify-start">

              <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-3xl flex gap-2">

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"></div>

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></div>

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></div>

              </div>

            </div>

          )}

          <div ref={messagesEndRef}></div>

        </div>

        {/* Input */}

        <div className="border-t border-slate-800 p-6 bg-slate-950/80 backdrop-blur-xl">

          <div className="flex gap-4">

            <input
              type="text"
              placeholder="Ask process-related questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl px-6 py-5 text-lg outline-none focus:border-emerald-400 transition"
            />

            <button
              onClick={sendMessage}
              className="bg-emerald-400 hover:bg-emerald-300 transition duration-300 text-black font-bold px-10 rounded-2xl shadow-lg"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default App;