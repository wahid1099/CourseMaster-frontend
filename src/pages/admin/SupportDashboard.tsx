import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FiSearch, FiSend, FiCheck, FiMessageSquare } from "react-icons/fi";
import axios from "axios";
import { RootState } from "../../store/store";
import "./SupportDashboard.css";

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const SupportDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeChats, setActiveChats] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const chatsPollingRef = useRef<number | null>(null);

  // Fetch active chats periodically
  useEffect(() => {
    if (user) {
      fetchActiveChats();

      // Poll for new chats every 5 seconds
      chatsPollingRef.current = window.setInterval(() => {
        fetchActiveChats();
      }, 5000);
    }

    return () => {
      if (chatsPollingRef.current) {
        clearInterval(chatsPollingRef.current);
      }
    };
  }, [user]);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory(selectedUser._id);
      markAsRead(selectedUser._id);

      // Poll for new messages every 2 seconds
      pollingIntervalRef.current = window.setInterval(() => {
        fetchChatHistory(selectedUser._id);
      }, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchActiveChats = async () => {
    try {
      const response = await axios.get("/api/chat/recent", {
        withCredentials: true,
      });
      setActiveChats(response.data.recentChats);
    } catch (error) {
      console.error("Failed to fetch active chats", error);
    }
  };

  const fetchChatHistory = async (userId: string) => {
    try {
      const response = await axios.get(`/api/chat/history/${userId}`, {
        withCredentials: true,
      });
      setMessages(response.data.chats);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  const markAsRead = async (userId: string) => {
    try {
      await axios.put(
        `/api/chat/read/${userId}`,
        {},
        { withCredentials: true }
      );
      setActiveChats((prev) =>
        prev.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(
        "/api/chat/send",
        {
          receiver: selectedUser._id,
          message: newMessage,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.chat]);
        setNewMessage("");
        fetchActiveChats(); // Refresh chat list
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const filteredChats = activeChats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="support-dashboard">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list">
          {filteredChats.length === 0 ? (
            <div className="empty-list">
              <p>No active conversations</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${
                  selectedUser?._id === chat._id ? "active" : ""
                }`}
                onClick={() => setSelectedUser(chat)}
              >
                <div className="chat-avatar">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
                <div className="chat-info">
                  <div className="chat-name-time">
                    <h4>{chat.name}</h4>
                    <span className="time">
                      {new Date(chat.lastMessageDate).toLocaleDateString() ===
                      new Date().toLocaleDateString()
                        ? new Date(chat.lastMessageDate).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : new Date(chat.lastMessageDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="last-message">{chat.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="main-header">
              <div className="user-details">
                <h3>{selectedUser.name}</h3>
                <span className="user-email">{selectedUser.email}</span>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble ${
                    msg.sender === user?._id ? "sent" : "received"
                  }`}
                >
                  <div className="bubble-content">
                    <p>{msg.message}</p>
                    <span className="bubble-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.sender === user?._id && (
                        <span className="read-status">
                          {msg.isRead ? (
                            <FiCheck className="read" />
                          ) : (
                            <FiCheck />
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <FiSend />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="placeholder-content">
              <FiMessageSquare size={48} />
              <h3>Select a conversation</h3>
              <p>Choose a student from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
