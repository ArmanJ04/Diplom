import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  UserCircle2,
  CalendarDays,
  Activity,
  Flame,
  Ruler,
  Weight,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  CreditCard,
  Droplet,
  User,
} from "lucide-react";

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedIds, setExpandedIds] = useState([]);

  const [formData, setFormData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return (
      storedUser || {
        firstName: "",
        lastName: "",
        email: "",
        uin: "",
        role: "",
        birthdate: "",
        height: "",
        weight: "",
        gender: "",
        smoking: false,
        alcohol: false,
        physicalActivity: "",
      }
    );
  });

  useEffect(() => {
    if (!user) return navigate("/login");
    setFormData({ ...user, birthdate: formatDateForInput(user.birthdate) });
    fetchHistory(user.uin);
  }, [user, navigate]);

  const fetchHistory = async (uin) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prediction/history?uin=${uin}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch {
      setHistory([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleExpanded = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const updated = { ...formData, birthdate: formatDateForInput(formData.birthdate) };
    const updatedUser = await updateUser(updated);
    if (!updatedUser) {
      alert("Failed to update profile. Please try again.");
      return;
    }
    setFormData({
      ...updatedUser,
      birthdate: formatDateForInput(updatedUser.birthdate),
    });
    setEditable(false);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const getColor = (p) => {
    const percent = parseFloat(p) * 100;
    if (percent < 30) return "text-green-600";
    if (percent < 70) return "text-yellow-600";
    return "text-red-600";
  };
  const calculateAgeInYears = (birthdate) => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const calculateAgeInDays = (birthdate) => {
  const birth = new Date(birthdate);
  const today = new Date();
  return Math.floor((today - birth) / (1000 * 60 * 60 * 24));
};

const exportPredictionToPDF = (entryId) => {
  const entry = history.find((e, idx) => (e._id || idx) === entryId);
  if (!entry) return;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addLabelBlock = (label, text, labelSize = 11, textSize = 11, spacing = 6) => {
    if (y + spacing > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(labelSize);
    pdf.text(label, margin, y);
    y += spacing;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(textSize);
    const wrapped = pdf.splitTextToSize(text, maxWidth);
    wrapped.forEach(line => {
      if (y + spacing > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += spacing;
    });
    y += 2;
  };

  const addHeader = (text, size = 14, spacing = 9) => {
    if (y + spacing > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(size);
    pdf.text(text, margin, y);
    y += spacing;
  };

  addHeader("Prediction Report");

  addLabelBlock("Date:", new Date(entry.timestamp).toLocaleString());
  addLabelBlock("Risk Score:", `${(entry.prediction * 100).toFixed(2)}%`);
  if (entry.status) addLabelBlock("Prediction Status:", entry.status);
  if (entry.feedback) addLabelBlock("Doctor's Feedback:", entry.feedback);

  addHeader("Medical Inputs:", 12, 8);

  Object.entries(entry.medicalInputs || {}).forEach(([key, value]) => {
    addLabelBlock(`${key}:`, String(value), 10, 10, 5);
  });

  pdf.save(`prediction-${entryId}.pdf`);
};

  const filteredHistory = history
    .filter((entry) =>
      new Date(entry.timestamp).toLocaleDateString("en-GB").includes(searchTerm)
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    });

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.9s ease" }}>
      <h1 className="text-3xl font-bold text-center" style={{ color: "var(--color-primary)" }}>
        My Profile
      </h1>

      {editable ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
        >
          {/* Inputs same as before */}
          <div><label htmlFor="firstName">First Name</label><input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required/></div>
          <div><label htmlFor="lastName">Last Name</label><input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required/></div>
          <div><label htmlFor="email">Email</label><input id="email" name="email" value={formData.email} disabled /></div>
          <div><label htmlFor="uin">UIN</label><input id="uin" name="uin" value={formData.uin} disabled /></div>
          <div><label htmlFor="birthdate">Birthdate</label><input id="birthdate" type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required/></div>
          <div><label htmlFor="height">Height (cm)</label><input id="height" name="height" value={formData.height} onChange={handleChange} /></div>
          <div><label htmlFor="weight">Weight (kg)</label><input id="weight" name="weight" value={formData.weight} onChange={handleChange} /></div>
          <div>
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="smoking" name="smoking" checked={formData.smoking} onChange={handleChange} />
            <label htmlFor="smoking">Smoking</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="alcohol" name="alcohol" checked={formData.alcohol} onChange={handleChange} />
            <label htmlFor="alcohol">Alcohol</label>
          </div>
          <div><label htmlFor="physicalActivity">Physical Activity (hrs/week)</label><input id="physicalActivity" name="physicalActivity" value={formData.physicalActivity} onChange={handleChange} /></div>

          <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <button type="submit" className="btn-primary" style={{ width: "200px" }}>
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            marginTop: "40px",
          }}
        >
          {/* Card style for each info */}
          <InfoCard icon={<UserCircle2 size={36} color="#2563eb" />} label="Name" value={`${formData.firstName} ${formData.lastName}`} />
          <InfoCard icon={<Mail size={36} color="#2563eb" />} label="Email" value={formData.email} />
          <InfoCard icon={<CreditCard size={36} color="#2563eb" />} label="UIN" value={formData.uin} />
          <InfoCard icon={<CalendarDays size={36} color="#2563eb" />} label="Birthdate" value={formData.birthdate} />
          <InfoCard icon={<User size={36} color="#2563eb" />} label="Gender" value={formData.gender} />
          <InfoCard icon={<Ruler size={36} color="#2563eb" />} label="Height" value={`${formData.height} cm`} />
          <InfoCard icon={<Weight size={36} color="#2563eb" />} label="Weight" value={`${formData.weight} kg`} />
          <InfoCard icon={<Flame size={36} color="#2563eb" />} label="Smoking" value={formData.smoking ? "Yes" : "No"} />
          <InfoCard icon={<Droplet size={36} color="#2563eb" />} label="Alcohol" value={formData.alcohol ? "Yes" : "No"} />
          <InfoCard icon={<Activity size={36} color="#2563eb" />} label="Physical Activity" value={`${formData.physicalActivity} hrs/week`} />
          <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <button className="btn-primary" style={{ width: "200px" }} onClick={() => setEditable(true)}>
              Edit Profile
            </button>
          </div>
        </section>
      )}

      {/* History Section (unchanged - keep your liked version) */}
      <div style={{ marginTop: "48px" }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          aria-expanded={showHistory}
          className="btn-outline"
          style={{ width: "100%", maxWidth: "320px", marginBottom: "24px" }}
        >
          {showHistory ? "Hide Prediction History ▲" : "Show Prediction History ▼"}
        </button>

{showHistory && (
  <section
    aria-label="Prediction History"
    style={{
      marginTop: "32px",
      maxWidth: "700px",
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flexGrow: 1, minWidth: 200, display: "flex", alignItems: "center", gap: "8px" }}>
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by date (DD/MM/YYYY)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search prediction history by date"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1.5px solid #d1d5db",
            fontSize: "1rem",
          }}
        />
      </div>

      <button
        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        aria-label={`Sort predictions by date ${sortOrder === "asc" ? "ascending" : "descending"}`}
        style={{
          padding: "10px 20px",
          fontWeight: "600",
          fontSize: "1rem",
          borderRadius: "20px",
          border: "none",
          backgroundColor: "var(--color-primary)",
          color: "white",
          cursor: "pointer",
          minWidth: 140,
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a3aa8")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
      >
        Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
      </button>
    </div>

    {filteredHistory.length === 0 ? (
      <p style={{ color: "var(--color-text-secondary)", textAlign: "center", fontSize: "1rem" }}>
        No predictions found.
      </p>
    ) : (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
        {filteredHistory.map((entry, idx) => {
          const id = entry._id || idx;
          const isExpanded = expandedIds.includes(id);
          return (
            <li
              key={id}
              style={{
                background: "var(--color-bg-alt)",
                padding: "24px",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                cursor: "pointer",
                userSelect: "none",
                transition: "transform 0.3s ease",
                transform: isExpanded ? "scale(1.02)" : "none",
              }}
              onClick={() => toggleExpanded(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleExpanded(id);
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-controls={`prediction-details-${id}`}
              aria-label={`Toggle details for prediction dated ${new Date(entry.timestamp).toLocaleDateString()}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <HeartPulse size={28} color="#ec4899" aria-hidden="true" />
                  <strong style={{ fontSize: "1.25rem" }}>
                    Risk Score:{" "}
<span
  style={{
    fontWeight: "700",
    color:
      entry.prediction * 100 < 30
        ? "#16a34a" // green-600
        : entry.prediction * 100 < 70
        ? "#ca8a04" // yellow-600
        : "#dc2626", // red-600
  }}
>
  {(entry.prediction * 100).toFixed(2)}%
</span>

                  </strong>
                </div>
                <span style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {isExpanded && (
                <div
                  id={`prediction-details-${id}`}
                  style={{ marginTop: "16px", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}
                >
                  <p>
                    <strong>Date:</strong> {new Date(entry.timestamp).toLocaleString()}
                  </p>
{entry.feedback && (
  <p>
    <strong>Doctor's Feedback:</strong>{" "}
    <span
      dangerouslySetInnerHTML={{
        __html: entry.feedback.replace(
          /(This is an AI-generated summary[^.]*\.)/gi,
          (match) => `<strong>${match}</strong>`
        ),
      }}
    />
  </p>
)}

                  {entry.status && (
                    <p>
                      <strong>Prediction Status:</strong> {entry.status} 
                    </p>
                  )}
                  <p>
                    <strong>Medical Inputs:</strong>
                  </p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                      {entry.medicalInputs.birthdate && (
    <li>
      <strong>Birthdate:</strong> {new Date(entry.medicalInputs.birthdate).toLocaleDateString()}<br />
      <strong>Age:</strong> {calculateAgeInYears(entry.medicalInputs.birthdate)} years, {calculateAgeInDays(entry.medicalInputs.birthdate)} days
    </li>
  )}
{Object.entries(entry.medicalInputs || {}).map(([key, value]) => {
  if (key === "birthdate") return null;
  return (
    <li key={key}>
      <strong>{key}:</strong> {String(value)}
    </li>
  );
})}

                    <button
  onClick={() => exportPredictionToPDF(id)}
  className="btn-outline"
  style={{ marginTop: "16px", padding: "10px 16px", borderRadius: "10px", fontSize: "0.95rem" }}
>
  Export as PDF
</button>

                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </section>
)}

      </div>
    </div>
  );
  
}

const InfoCard = ({ icon, label, value }) => (
  <article
    tabIndex={0}
    style={{
      background: "var(--color-bg-alt)",
      padding: "24px",
      borderRadius: "20px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      cursor: "default",
      transition: "transform 0.3s ease",
    }}
    onFocus={e => e.currentTarget.style.transform = "scale(1.03)"}
    onBlur={e => e.currentTarget.style.transform = "scale(1)"}
  >
    <div>{icon}</div>
    <div>
      <h4 style={{ margin: 0, color: "var(--color-primary)", fontWeight: "700" }}>{label}</h4>
      <p style={{ margin: 0, color: "var(--color-text-secondary)", fontWeight: "600", fontSize: "1.05rem" }}>{value}</p>
    </div>
  </article>
);


export default Profile;
