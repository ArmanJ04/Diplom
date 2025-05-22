// ChatWidget.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { MessageCircle, Send, Check, CheckCheck, X } from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import "../styles/chat.css";

function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiverId, setReceiverId] = useState(null);
  const [assignedClients, setAssignedClients] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef();

  useEffect(() => {
    if (!user) return;
    if (user.role === "doctor") {
      axios.get(`${API_BASE_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(res => setAssignedClients(res.data)).catch(() => setAssignedClients([]));
    } else {
      const targetId = user.assignedDoctorId?._id || user.assignedDoctorId;
      setReceiverId(targetId);
      fetchMessages(targetId);
      const interval = setInterval(() => fetchMessages(targetId), 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (receiverId && user?.role === "doctor") {
      fetchMessages(receiverId);
      const interval = setInterval(() => fetchMessages(receiverId), 5000);
      return () => clearInterval(interval);
    }
  }, [receiverId]);

  const fetchMessages = async (targetId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/${targetId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setMessages(data);
      const unread = data.filter(
        (msg) => msg.receiverId === user._id && !msg.read
      ).length;
      setUnreadCount(unread);
      await axios.put(`${API_BASE_URL}/api/chat/${targetId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !receiverId) return;
    try {
      await axios.post(`${API_BASE_URL}/api/chat`, { receiverId, message: input }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInput("");
      fetchMessages(receiverId);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user) return null;

  return (
    <>
<button
  className="chat-toggle-btn fixed bottom-6 right-6 z-50"
  onClick={() => setIsOpen(!isOpen)}
>
  <MessageCircle className="w-6 h-6" />
</button>


      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>Чат</span>
            <button
              onClick={() => setIsOpen(false)}
              className="chat-close"
              title="Закрыть чат"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {user.role === "doctor" && (
            <div className="chat-select">
              <select
                className="w-full text-sm p-2 border rounded-md"
                value={receiverId || ""}
                onChange={(e) => setReceiverId(e.target.value)}
              >
                <option value="" disabled>Выберите пациента</option>
                {assignedClients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div ref={scrollRef} className="chat-messages">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user._id;
              const time = new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`chat-bubble ${isMe ? "you" : "other"}`}>
                    <p>{msg.message}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                      <span>{time}</span>
                      {isMe && (
                        <span className="text-white ml-2">
                          {msg.read ? <CheckCheck className="inline w-4 h-4" /> : <Check className="inline w-4 h-4" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-input">
            <input
              placeholder="Напишите сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              title="Отправить"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
