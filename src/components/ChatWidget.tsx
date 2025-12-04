import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FiMessageSquare, FiSend, FiMinimize2 } from "react-icons/fi";
import axios from "axios";
import { RootState } from "../store/store";
import "./ChatWidget.css";

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const ChatWidget: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [supportId, setSupportId] = useState<string>("");
  const pollingIntervalRef = useRef<number | null>(null);

  // Fetch support agent on mount
  useEffect(() => {
    if (user && user._id) {
      fetchSupportAgent();
    }
  }, [user]);

  // Start/stop polling when chat opens/closes
  useEffect(() => {
    if (isOpen && supportId) {
      fetchChatHistory();

      // Start polling for new messages every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchChatHistory();
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, supportId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const fetchSupportAgent = async () => {
    try {
      const response = await axios.get("/api/chat/support-agents", {
        withCredentials: true,
      });
      if (response.data.agents && response.data.agents.length > 0) {
        setSupportId(response.data.agents[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch support agent", error);
    }
  };

  const fetchChatHistory = async () => {
    if (!supportId) return;
    try {
      const response = await axios.get(`/api/chat/history/${supportId}`, {
        withCredentials: true,
      });
      setMessages(response.data.chats);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supportId) return;

    try {
      const response = await axios.post(
        "/api/chat/send",
        {
          receiver: supportId,
          message: newMessage,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Add the new message to the local state immediately
        setMessages((prev) => [...prev, response.data.chat]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (!user || user.role === "admin") return null;

  return (
    <div className={`chat-widget ${isOpen ? "open" : ""}`}>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <FiMessageSquare />
          <span className="chat-tooltip">Need Help?</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <h3>Live Support</h3>
              <span className="status-dot online"></span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FiMinimize2 />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>👋 Hi {user.name}! How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === user._id ? "sent" : "received"
                  }`}
                >
                  <div className="message-content">
                    <p>{msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" disabled={!newMessage.trim()}>
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
