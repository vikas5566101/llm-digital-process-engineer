import { motion } from "framer-motion";
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

  const [chatHistory, setChatHistory] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [mode, setMode] = useState(
      "Process Optimization"
    );
  
  const [activePDF, setActivePDF] = useState("");

  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // create typing function
  const typeMessage = async (fullText, sources = []) => {

    let currentText = "";

    const aiMessage = {
      role: "assistant",
      text: "",
      sources: sources
    };

    setMessages((prev) => [...prev, aiMessage]);

    for (let i = 0; i < fullText.length; i++) {

      currentText += fullText[i];

      setMessages((prev) => {

        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "assistant",
          text: currentText,
          sources: sources
        };

        return updated;
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 10)
      );
    }
  };

  const uploadPDF = async (event) => {

      const file = event.target.files[0];

      if (!file) return;

      const formData = new FormData();

      formData.append("file", file);

      try {

        setLoading(true);

        const res = await axios.post(
          "https://llm-digital-process-engineer.onrender.com/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );

        const uploadMessage = {
          role: "assistant",
          text: `✅ PDF Uploaded Successfully\n\nFile: ${res.data.filename}\nChunks Created: ${res.data.total_chunks}`
        };
        setDocuments((prev) => [
          ...prev,
          res.data.filename
        ]);

        setActivePDF(res.data.filename);

        setMessages((prev) => [
          ...prev,
          uploadMessage
        ]);

      } catch (error) {

        const errorMessage = {
          role: "assistant",
          text: "❌ PDF Upload Failed"
        };

        setMessages((prev) => [
          ...prev,
          errorMessage
        ]);
      }

      setLoading(false);
    };

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        text: currentMessage
      }
    ]);

    

    setMessage("");

    setLoading(true);

    try {

      const res = await axios.post(
        "https://llm-digital-process-engineer.onrender.com/chat",
        {
          message: currentMessage,
          mode : mode,
          history: chatHistory
        }
      );

      await typeMessage(
        res.data.response || res.data.error,
        res.data.sources || []
      );

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.response || res.data.error
        }
      ]);

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

        <label className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold p-4 rounded-2xl cursor-pointer text-center transition duration-300 shadow-lg">

          Upload PDF

          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={uploadPDF}
          />

        </label>

        <div className="mt-8">

          <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-4">
            Knowledge Base
          </h3>

          <div className="space-y-3">

            {documents.length === 0 ? (

              <div className="text-slate-500 text-sm">
                No PDFs Uploaded
              </div>

            ) : (

              documents.map((doc, index) => (

                <div
                  key={index}
                  onClick={() => setActivePDF(doc)}
                  className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 truncate"
                >
                  📄 {doc}
                </div>

              ))
            )}

          </div>

        </div>

        <div className="space-y-4">

          {[
            "Process Optimization",
            "Safety Analysis",
            "Equipment Diagnostics"
          ].map((item) => (

            <div
              key={item}
              // onClick={() => setMode(item)}
              className={`p-4 rounded-2xl cursor-pointer border shadow-lg transition duration-300 ${
                mode === item
                  ? "bg-emerald-400 text-black border-emerald-300"
                  : "bg-slate-800/70 hover:bg-slate-700 border-slate-700 text-white"
              }`}
            >
              {item}
            </div>

          ))}

        </div>

      </div>

      {/* Main Area */}

      {/* Main Area */}

      <div className="flex-1 flex">
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

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.4
              }}
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

                {
                  msg.sources && msg.sources.length > 0 && (

                    <details className="mt-5">

                      <summary className="cursor-pointer text-emerald-400 font-semibold">
                        View Process Logic
                      </summary>

                      <div className="mt-4 space-y-4">

                        {msg.sources.map((source, index) => (

                          <div
                            key={index}
                            className="bg-slate-900 border border-slate-700 p-4 rounded-2xl text-sm text-slate-300 leading-7"
                          >
                            <div className="text-emerald-400 text-xs mb-3">

                              Source: {source.source}

                              <br />

                              Chunk: {source.chunk}

                              <br />

                              Relevance: {source.score}

                            </div>

                            <div>
                              {source.text}
                            </div>
                          </div>

                        ))}

                      </div>

                    </details>
                  )
                }

              </div>

            </motion.div>

          ))}

          {/* Loading Animation */}

          {loading && (

            <motion.div
              
              onClick={() => setActivePDF(doc)}
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              className="flex justify-start"
            >

              <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-3xl flex gap-2">

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"></div>

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></div>

                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></div>

              </div>

            </motion.div>

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

        {/* Knowledge Panel */}

        <div className="w-96 border-l border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 flex flex-col">

          <h2 className="text-2xl font-bold text-emerald-400 mb-8">
            Knowledge Hub
          </h2>

          {/* System Status */}

          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mb-6">

            <h3 className="text-lg font-semibold mb-4">
              System Status
            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  AI Engine
                </span>

                <span className="text-emerald-400">
                  Online
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Documents
                </span>

                <span>
                  {documents.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Vector DB
                </span>

                <span className="text-emerald-400">
                  Local Only
                </span>
              </div>

            </div>

          </div>

          {/* Active Documents */}

          <div className="flex-1">

            <h3 className="text-lg font-semibold mb-4">
              Active Documents
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">

              {documents.length === 0 ? (

                <div className="text-slate-500 text-sm">
                  No documents loaded
                </div>

              ) : (

                documents.map((doc, index) => (

                  <motion.div
                    key={index}
                    onClick={() => setActivePDF(doc)}
                    initial={{
                      opacity: 0,
                      x: 20
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                        📄
                      </div>

                      <div className="truncate text-sm">
                        {doc}
                      </div>

                    </div>

                  </motion.div>

                ))
              )}

            </div>

          </div>

          {/* PDF Preview */}

          <div className="mt-8">

            <h3 className="text-lg font-semibold mb-4">
              PDF Preview
            </h3>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden h-[400px]">

              {activePDF ? (

                <iframe
                  src={`https://llm-digital-process-engineer.onrender.com/uploads/${activePDF}`}
                  title="PDF Preview"
                  className="w-full h-full"
                />

              ) : (

                <div className="h-full flex items-center justify-center text-slate-500">
                  No PDF Selected
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default App;