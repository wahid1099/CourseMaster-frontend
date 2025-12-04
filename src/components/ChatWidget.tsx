import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Admin ID - In a real app, this might be dynamic or a support group
  // For now, we'll assume the first admin user is the support agent
  // You might need to fetch this or hardcode a specific support ID
  const [supportId, setSupportId] = useState<string>("");

  useEffect(() => {
    if (user && user._id) {
      // Initialize socket connection
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
        setIsConnected(true);
        newSocket.emit("join_chat", user._id);
      });

      newSocket.on("receive_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
        if (!isOpen) {
          // Could show a notification badge here
        }
      });

      newSocket.on("message_sent", (_message: Message) => {
        // Update local message with server confirmation if needed
        // For now we just append it locally for instant feedback
      });

      setSocket(newSocket);

      // Fetch support agent ID (admin)
      fetchSupportAgent();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && supportId) {
      fetchChatHistory();
    }
  }, [isOpen, supportId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const fetchSupportAgent = async () => {
    try {
      // Fetch available support agents (admins/instructors)
      const response = await axios.get("/api/chat/support-agents", {
        withCredentials: true,
      });
      if (response.data.agents && response.data.agents.length > 0) {
        // Use the first available agent
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !supportId) return;

    const messageData = {
      sender: user?._id || "",
      receiver: supportId,
      message: newMessage,
    };

    socket.emit("send_message", messageData);

    // Optimistically add message
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ]);

    setNewMessage("");
  };

  if (!user || user.role === "admin") return null; // Admins use the dashboard

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
              <span
                className={`status-dot ${isConnected ? "online" : "offline"}`}
              ></span>
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
