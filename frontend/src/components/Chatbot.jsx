import React, { useState, useRef, useEffect } from "react";
import { FiMic } from "react-icons/fi";
import { IoSend } from "react-icons/io5";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hi! I'm HealthAdviser 🤖. How can I assist you today?", sender: "bot" },
  ]);

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();
      const botMsg = { text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);

      // Voice output
      const speak = (text) => {
        if (!text || typeof text !== "string") return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(
          (v) => v.lang === "en-IN" || v.lang === "en-US"
        );
        if (selectedVoice) utterance.voice = selectedVoice;

        setTimeout(() => window.speechSynthesis.speak(utterance), 250);
      };

      speak(data.reply);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsg = {
        text: "Sorry, I couldn't connect to the server.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  let isListening = false;

  const startListening = () => {
    if (!isListening) {
      recognition.start();
      isListening = true;
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };

  recognition.onend = () => {
    isListening = false;
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {open ? (
        <div className="w-[350px] h-[480px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div
            className="bg-blue-600 text-white text-center py-3 font-semibold cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Health Advisor 🤖
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                  msg.sender === "bot"
                    ? "bg-indigo-100 self-start text-gray-800"
                    : "bg-blue-100 self-end text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="p-3 border-t border-gray-300 bg-white">
            <div className="flex items-center gap-0.00001">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 outline-none text-gray-700 text-[15px]"
              />

              <button
                onClick={startListening}
                title="Voice input"
                className="flex items-center justify-center p-1 bg-gray-100 rounded-full text-blue-600 hover:scale-110 transition-transform"
              >
                <FiMic size={20} />
              </button>

              <button
                onClick={handleSend}
                title="Send message"
                className="flex items-center justify-center p-2 bg-gray-100 rounded-full text-blue-600 hover:scale-110 transition-transform"
              >
                <IoSend size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white rounded-full px-4 py-3 text-[20px] shadow-lg hover:bg-blue-700 transition"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default Chatbot;
