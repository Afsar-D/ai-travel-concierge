import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowLeft,
  MapPin,
  Calendar,
  Loader2,
  Compass,
  MessageSquare
} from "lucide-react";
import { sendChatMessage } from "../lib/api";

export default function ChatPage() {
  const location = useLocation();
  const tripState = location.state?.trip || {};

  // Fallback to active trip or Tokyo demo
  const destination = tripState.destination || "Tokyo, Japan";
  const origin = tripState.origin || "Delhi, India";
  const startDate = tripState.startDate || "2026-10-14";
  const endDate = tripState.endDate || "2026-10-20";
  const budget = tripState.budget || "medium";
  const guestCount = tripState.guestCount || 2;

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "ai",
      text: `Hello! I'm your AI Travel Concierge for your upcoming journey to **${destination}**. Ask me anything about your active trip — local dining spots, hidden gems, weather advisories, packing tips, or schedule changes!`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: String(Date.now()),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage({
        message: text,
        origin,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget,
        guest_count: guestCount,
      });

      const replyText =
        res?.reply ||
        "I couldn't retrieve a specific answer right now. Please try again in a moment!";

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      toast.error(err.message || "Failed to reach AI assistant. Is the backend running?");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: "I had trouble connecting to the trip assistant service. Please check your backend connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's the weather forecast for my travel dates?",
    "Suggest 3 must-try local dishes near my stay.",
    "Are there any transit or metro card tips?",
    "What are the best indoor spots if it rains?",
  ];

  return (
    <div className="workspace" style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header & Back navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <Link
          to="/journey"
          className="route-tab"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            height: 36,
            padding: "0 14px",
            fontSize: 13,
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={15} /> Back to Journey
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--muted-foreground)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "var(--foreground)" }}>
            <MapPin size={14} color="#e8533e" /> {destination}
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Calendar size={14} /> {startDate} to {endDate}
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          display: "flex",
          flexDirection: "column",
          height: "72vh",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Chat Banner */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(245, 240, 231, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(232, 83, 62, 0.12)",
                color: "#e8533e",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: 17, margin: 0 }}>Trip Assistant: {destination}</h2>
              <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>
                Clear doubts, adjust plans, and ask about real-time weather & activities
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 20,
              background: "rgba(46, 125, 50, 0.1)",
              color: "#2e7d32",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2e7d32" }} /> Active Trip
          </span>
        </div>

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#f0e9de",
                      color: "#e8533e",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}
                <div>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      background: isUser ? "#e8533e" : "var(--background)",
                      color: isUser ? "#ffffff" : "var(--foreground)",
                      border: isUser ? "none" : "1px solid var(--border)",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    {m.text}
                  </div>
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "var(--muted-foreground)",
                      marginTop: 4,
                      textAlign: isUser ? "right" : "left",
                    }}
                  >
                    {m.time}
                  </span>
                </div>
                {isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#172332",
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "80%" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f0e9de",
                  color: "#e8533e",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px 16px 16px 2px",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  fontSize: 13,
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Loader2 size={15} className="animate-spin" />
                <span>Travel Concierge is analyzing your trip...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--background)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setInput(q);
              }}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 14,
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Compass size={12} color="#e8533e" /> {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <input
            type="text"
            placeholder={`Ask a doubt about ${destination.split(',')[0]} (e.g. food spots, weather, transit)...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              height: 42,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="planner-button"
            style={{
              height: 42,
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              opacity: !input.trim() || loading ? 0.6 : 1,
            }}
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
