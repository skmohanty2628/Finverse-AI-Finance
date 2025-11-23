import React, { useEffect, useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Dynamically load Botpress script
      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.botpressWebChat) {
          window.botpressWebChat.init({
            configUrl:
              "https://files.bpcontent.cloud/2025/11/03/05/20251103053047-P7HC3PWY.json",
          });
        }
      };

      // Cleanup on close to avoid duplicate widgets
      return () => {
        document
          .querySelectorAll('script[src*="botpress.cloud/webchat"]')
          .forEach((s) => s.remove());
        const widget = document.getElementById("bp-web-widget");
        if (widget) widget.remove();
      };
    }
  }, [open]);

  return (
    <>
      {/* 💬 Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712102.png"
          alt="FinVerse Bot"
          className="w-10 h-10 rounded-full border-2 border-white shadow-md"
        />
      </button>

      {/* 💠 Botpress Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[550px] bg-[#0b1020]/95 border border-indigo-700/40 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-50">
          <iframe
            src="https://cdn.botpress.cloud/webchat/v3.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/11/03/05/20251103053047-P7HC3PWY.json"
            title="Botpress Chatbot"
            className="w-full h-full border-none"
            allow="microphone; clipboard-read; clipboard-write"
          ></iframe>
        </div>
      )}
    </>
  );
}
