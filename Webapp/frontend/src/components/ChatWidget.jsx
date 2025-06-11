import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { MessageCircle, Send, Check, CheckCheck, X, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../constants/api";
import "../styles/chat.css";

function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [assignedClients, setAssignedClients] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef();

  useEffect(() => {
    if (!user) return;
    if (user.role === "doctor") {
      axios
        .get(`${API_BASE_URL}/api/doctor/patients`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setAssignedClients(res.data))
        .catch(() => setAssignedClients([]));
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
  // 🛡 Exit early if no user or token
  const token = localStorage.getItem("token");
  if (!user || !token || !targetId) return;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/chat/${targetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = Array.isArray(res.data) ? res.data : [];
    setMessages(data);

    const unread = data.filter((msg) => msg.receiverId === user._id && !msg.read).length;
    setUnreadCount(unread);

    await axios.put(`${API_BASE_URL}/api/chat/${targetId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 401) {
      console.warn("Unauthorized or forbidden access to chat.");
    } else {
      console.error("Failed to fetch messages:", err);
      toast.error("Failed to load messages");
    }
    setMessages([]);
  }
};


  const allowedExtensions = ["doc", "pdf", "jpg", "jpeg", "png"];

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      alert(`Only files with extensions ${allowedExtensions.join(", ")} are allowed.`);
      e.target.value = null;
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!receiverId) return;

    const formData = new FormData();
    formData.append("receiverId", receiverId);
    formData.append("message", input);
    if (file) formData.append("file", file);

    try {
      await axios.post(`${API_BASE_URL}/api/chat`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setInput("");
      setFile(null);
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

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) return null;

  return (
    <>
      <button
        className="chat-toggle-btn fixed bottom-6 right-6 z-50 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="chat-popup" role="dialog" aria-modal="true" aria-label="Chat window">
          <div className="chat-header">
            <span>Чат</span>
            <button
              onClick={() => setIsOpen(false)}
              className="chat-close"
              title="Закрыть чат"
              aria-label="Close chat"
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
                aria-label="Select patient to chat"
              >
                <option value="" disabled>
                  Выберите пациента
                </option>
                {assignedClients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

<div ref={scrollRef} className="chat-messages" tabIndex={0} aria-live="polite">
  {messages.length === 0 ? (
    <div className="no-messages" style={{ textAlign: "center", padding: "1rem", color: "#888" }}>
      Нет сообщений
    </div>
  ) : (
    messages.map((msg, i) => {
      const isMe = msg.senderId === user._id;
      const messageDate = new Date(msg.timestamp || msg.createdAt);
      const time = messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const currentDateStr = formatDate(messageDate);

      let showDateSeparator = false;
      if (i === 0) {
        showDateSeparator = true;
      } else {
        const prevMessageDate = new Date(messages[i - 1].timestamp || messages[i - 1].createdAt);
        const prevDateStr = formatDate(prevMessageDate);
        if (currentDateStr !== prevDateStr) {
          showDateSeparator = true;
        }
      }

      return (
        <div key={msg._id || i}>
          {showDateSeparator && (
            <div className="chat-date-separator" aria-label={`Date: ${currentDateStr}`}>
              <span>{currentDateStr}</span>
            </div>
          )}
          <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`chat-bubble ${isMe ? "you" : "other"}`}>
              {msg.message && <p>{msg.message}</p>}
              {msg.file && (
                <p>
                  <a
                    href={`${API_BASE_URL.replace("/api", "")}/uploads/${msg.file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-file-link"
                  >
                    📎 {msg.file.originalname}
                  </a>
                </p>
              )}
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>{time}</span>
                {isMe && (
                  <span className="text-white ml-2">
                    {msg.read ? (
                      <CheckCheck className="inline w-4 h-4" />
                    ) : (
                      <Check className="inline w-4 h-4" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    })
  )}
</div>


          <div className="chat-input" style={{ display: "flex", alignItems: "center" }}>
            <input
              placeholder="Напишите сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              aria-label="Chat message input"
              style={{ flexGrow: 1 }}
            />

            {!file && (
              <>
                <label
                  htmlFor="file-upload"
                  className="file-upload-label"
                  title="Attach a file"
                >
                  +
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    const allowedExtensions = ["doc", "pdf", "jpg", "jpeg", "png"];
                    const ext = selectedFile.name.split(".").pop().toLowerCase();
                    if (!allowedExtensions.includes(ext)) {
                      alert(`Only files with extensions ${allowedExtensions.join(", ")} are allowed.`);
                      e.target.value = null;
                      return;
                    }
                    setFile(selectedFile);
                  }}
                  accept=".doc,.pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  aria-label="Attach file input"
                />
              </>
            )}

            {file && (
              <div className="selected-file-container">
                <span className="selected-file-name" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Remove selected file"
                  className="remove-file-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleSend}
              title="Отправить"
              aria-label="Send message"
              style={{ marginLeft: 8 }}
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
