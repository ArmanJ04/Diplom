import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  CreditCard,  // instead of Id
  Droplet,
    User,   // Add this
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
        `http://localhost:5000/api/prediction/history?uin=${uin}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("API Error");
      }

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
    <div className="page-container">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">My Profile</h1>

      <div className="space-y-4">
        {editable ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="input"
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="input"
            />
            <input name="email" value={formData.email} disabled className="input" />
            <input name="uin" value={formData.uin} disabled className="input" />
            <input
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              className="input"
            />
            <input
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height (cm)"
              className="input"
            />
            <input
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Weight (kg)"
              className="input"
            />
            <select name="gender" value={formData.gender} onChange={handleChange} className="input">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="smoking"
                checked={formData.smoking}
                onChange={handleChange}
              />{" "}
              Smoking
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="alcohol"
                checked={formData.alcohol}
                onChange={handleChange}
              />{" "}
              Alcohol
            </label>
            <input
              name="physicalActivity"
              value={formData.physicalActivity}
              onChange={handleChange}
              placeholder="Physical Activity (hrs/week)"
              className="input"
            />
          </div>
        ) : (
          <div className="space-y-1 text-gray-700">
            <p>
              <UserCircle2 className="inline w-5 h-5 mr-2" /> <strong>Name:</strong> {formData.firstName}{" "}
              {formData.lastName}
            </p>
            <p>
              <Mail className="inline w-5 h-5 mr-2" /> <strong>Email:</strong> {formData.email}
            </p>
            <p>
  <CreditCard className="inline w-5 h-5 mr-2" /> <strong>UIN:</strong> {formData.uin}
            </p>
            <p>
              <CalendarDays className="inline w-5 h-5 mr-2" /> <strong>Birthdate:</strong>{" "}
              {formData.birthdate}
            </p>
            <p>
  <User className="inline w-5 h-5 mr-2" /> <strong>Gender:</strong> {formData.gender}
            </p>
            <p>
              <Ruler className="inline w-5 h-5 mr-2" /> <strong>Height:</strong> {formData.height} cm
            </p>
            <p>
              <Weight className="inline w-5 h-5 mr-2" /> <strong>Weight:</strong> {formData.weight} kg
            </p>
            <p>
              <Flame className="inline w-5 h-5 mr-2" /> <strong>Smoking:</strong> {formData.smoking ? "Yes" : "No"}
            </p>
            <p>
  <Droplet className="inline w-5 h-5 mr-2" /> <strong>Alcohol:</strong> {formData.alcohol ? "Yes" : "No"}
            </p>
            <p>
              <Activity className="inline w-5 h-5 mr-2" /> <strong>Physical Activity:</strong>{" "}
              {formData.physicalActivity} hrs/week
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        {editable ? (
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditable(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-2 px-3 py-1 rounded-lg border border-blue-400 hover:bg-blue-100 transition"
          aria-expanded={showHistory}
        >
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <span className="ml-1 font-semibold">{showHistory ? "Hide Prediction History" : "Show Prediction History"}</span>
        </button>

        {showHistory && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search by date (DD/MM/YYYY)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
                aria-label="Search prediction history by date"
              />
              <button
                className="text-sm text-blue-600 underline px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                aria-label={`Sort predictions by date ${sortOrder === "asc" ? "ascending" : "descending"}`}
              >
                Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
              </button>
            </div>
            {filteredHistory.length === 0 ? (
              <p className="text-gray-500">No predictions found.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {filteredHistory.map((entry, idx) => {
                  const isExpanded = expandedIds.includes(entry._id || idx);
                  return (
                    <li
                      key={entry._id || idx}
                      className="bg-slate-100 p-4 rounded-lg shadow-sm"
                    >
                      <p
                        onClick={() => toggleExpanded(entry._id || idx)}
                        className="cursor-pointer flex justify-between items-center"
                        aria-expanded={isExpanded}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") toggleExpanded(entry._id || idx);
                        }}
                        role="button"
                        aria-controls={`prediction-details-${entry._id || idx}`}
                      >
                        <span>
                          <HeartPulse className="inline w-5 h-5 mr-1 text-pink-600" />
                          <strong>Risk Score:</strong>{" "}
                          <span className={`font-bold ${getColor(entry.prediction)}`}>
                            {(entry.prediction * 100).toFixed(2)}%
                          </span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </p>

                      {isExpanded && (
                        <div
                          id={`prediction-details-${entry._id || idx}`}
                          className="mt-3 text-sm text-gray-700"
                        >
                          <p>Date: {new Date(entry.timestamp).toLocaleString()}</p>
                          {entry.feedback && (
                            <p>
                              <strong>Doctor's Feedback:</strong> {entry.feedback}
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
                          <ul className="list-disc ml-6">
                            {Object.entries(entry.medicalInputs || {}).map(([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
