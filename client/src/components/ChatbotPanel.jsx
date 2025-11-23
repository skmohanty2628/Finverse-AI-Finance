import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { message: input });
      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error contacting Gemini API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-[#f8f9fa] border rounded-xl shadow-xl w-96">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-t-xl font-semibold text-lg">
        💬 FinServe Assistant
      </div>

      {/* Message Window */}
      <div className="p-3 h-72 overflow-y-auto flex flex-col space-y-2 bg-white">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded-xl break-words ${
              msg.role === "user"
                ? "self-end bg-blue-600 text-white max-w-[80%]"
                : "self-start bg-gray-200 text-gray-900 max-w-[80%]"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 italic self-start">Thinking...</div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex border-t bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about savings or finance..."
          className="flex-1 p-2 outline-none text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 hover:bg-blue-700 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
