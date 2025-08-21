import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

const Prediction = () => {
  const { user } = useAuth();
  const [inputData, setInputData] = useState({
    birthdate: "",
    gender: "male",
    height: "",
    weight: "",
    systolicBP: "",
    diastolicBP: "",
    cholesterol: "",
    glucose: "",
    smoking: false,
    alcoholIntake: false,
    physicalActivity: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (user) {
      setInputData((prev) => ({
        ...prev,
        birthdate: formatDateForInput(user.birthdate),
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "male",
        physicalActivity: user.physicalActivity > 15,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateAgeInDays = (birthdate) => {
    const birthDate = new Date(birthdate);
    const currentDate = new Date();
    const ageInMilliseconds = currentDate - birthDate;
    return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setFeedback("");

    if (!inputData.cholesterol || !inputData.glucose) {
      toast.error("Please select both cholesterol and glucose levels.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const ageInDays = calculateAgeInDays(inputData.birthdate);

      const formattedData = {
        features: [
          ageInDays,
          inputData.gender === "male" ? 1 : 0,
          parseFloat(inputData.height),
          parseFloat(inputData.weight),
          parseInt(inputData.systolicBP),
          parseInt(inputData.diastolicBP),
          parseInt(inputData.cholesterol),
          parseInt(inputData.glucose),
          inputData.smoking ? 1 : 0,
          inputData.alcoholIntake ? 1 : 0,
          inputData.physicalActivity ? 1 : 0,
        ],
medicalInputs: {
  birthdate: inputData.birthdate,
  gender: inputData.gender,
  height: inputData.height,
  weight: inputData.weight,
  systolicBP: inputData.systolicBP,
  diastolicBP: inputData.diastolicBP,
  cholesterol: inputData.cholesterol,
  glucose: inputData.glucose,
  smoking: inputData.smoking,
  alcoholIntake: inputData.alcoholIntake,
  physicalActivity: inputData.physicalActivity,
}

      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Prediction API Error: ${response.status}`
        );
      }

      const data = await response.json();

      const saveResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/prediction/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          uin: user.uin,
          prediction: data.prediction,
          medicalInputs: formattedData.medicalInputs,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(
          errorData.message || `Save Prediction API Error: ${saveResponse.status}`
        );
      }

      setResult(data);

      const saveData = await saveResponse.json();
      const fb = typeof saveData.data.feedback === "string"
        ? saveData.data.feedback
        : saveData.data.feedback?.content || "No feedback available";
const boldedFeedback = fb.replace(
  /(This is an AI-generated summary[^.]*\.)/gi,
  (match) => `<strong>${match}</strong>`
);

setFeedback(boldedFeedback);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getRiskLevel = (value) => {
    if (value >= 0.7) return "High Risk";
    if (value >= 0.4) return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="page-container">
      <h2 className="text-3xl font-bold text-center" style={{ color: "var(--color-primary)" }}>
        Cardiovascular Risk Prediction
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8" aria-label="Prediction Form">
        <div>
          <label htmlFor="birthdate" className="tooltip" data-tip="Your date of birth to calculate your age.">Birthdate</label>
          <input
            id="birthdate"
            type="date"
            name="birthdate"
            value={inputData.birthdate}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="height" className="tooltip" data-tip="Your height in centimeters.">Height (cm)</label>
            <input
              id="height"
              type="number"
              name="height"
              value={inputData.height}
              onChange={handleChange}
              min="30"
              max="300"
              placeholder="e.g. 170"
              required
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="weight" className="tooltip" data-tip="Your weight in kilograms.">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              name="weight"
              value={inputData.weight}
              onChange={handleChange}
              min="20"
              max="500"
              placeholder="e.g. 70"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="gender" className="tooltip" data-tip="Select your biological sex.">Gender</label>
          <select id="gender" name="gender" value={inputData.gender} onChange={handleChange} required>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="systolicBP" className="tooltip" data-tip="Systolic blood pressure (pressure when your heart beats).">Systolic BP</label>
            <input
              id="systolicBP"
              type="number"
              name="systolicBP"
              value={inputData.systolicBP}
              onChange={handleChange}
              min="50"
              max="300"
              placeholder="e.g. 120"
              required
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="diastolicBP" className="tooltip" data-tip="Diastolic blood pressure (pressure between heartbeats).">Diastolic BP</label>
            <input
              id="diastolicBP"
              type="number"
              name="diastolicBP"
              value={inputData.diastolicBP}
              onChange={handleChange}
              min="30"
              max="300"
              placeholder="e.g. 80"
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="cholesterol" className="tooltip" data-tip="Your cholesterol level: Normal, Above Normal, or Well Above Normal.">Cholesterol</label>
            <select
              id="cholesterol"
              name="cholesterol"
              value={inputData.cholesterol}
              onChange={handleChange}
              required
            >
<option value="" disabled>Select Cholesterol Level</option>
  <option value="1">Normal — less than 200 mg/dL</option>
  <option value="2">Above Normal — 200–239 mg/dL</option>
  <option value="3">Well Above Normal — 240+ mg/dL</option>
            </select>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="glucose" className="tooltip" data-tip="Your blood glucose level.">Glucose</label>
            <select
              id="glucose"
              name="glucose"
              value={inputData.glucose}
              onChange={handleChange}
              required
            >
  <option value="" disabled>Select Glucose Level</option>
  <option value="1">Normal — less than 100 mg/dL (fasting)</option>
  <option value="2">Above Normal — 100–125 mg/dL (pre-diabetes)</option>
  <option value="3">Well Above Normal — 126+ mg/dL (possible diabetes)</option>
            </select>
          </div>
        </div>

        <fieldset aria-label="Lifestyle factors" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label className="flex items-center cursor-pointer" data-tip="Check if you currently smoke.">
            <input type="checkbox" name="smoking" checked={inputData.smoking} onChange={handleChange} />
            Smoking
          </label>
          <label className="flex items-center cursor-pointer" data-tip="Check if you regularly consume alcohol.">
            <input type="checkbox" name="alcoholIntake" checked={inputData.alcoholIntake} onChange={handleChange} />
            Alcohol Consumption
          </label>
          <label className="flex items-center cursor-pointer" data-tip="Check if you engage in physical activity more than 15 hours per week.">
            <input type="checkbox" name="physicalActivity" checked={inputData.physicalActivity} onChange={handleChange} />
            Physical Activity &gt; 15 hrs/week
          </label>
        </fieldset>

        <button type="submit" disabled={loading} aria-busy={loading} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2 justify-center" aria-live="polite">
              <LoaderCircle className="animate-spin" size={20} /> Predicting...
            </span>
          ) : (
            "Predict Risk"
          )}
        </button>
      </form>

      {result && (
        <section
          aria-live="polite"
          aria-atomic="true"
          style={{ marginTop: "48px", padding: "24px", borderRadius: "20px", backgroundColor: "var(--color-bg-alt)" }}
        >
          <h3 style={{ color: "var(--color-primary)", fontWeight: "700", marginBottom: "16px" }}>
            Prediction Result
          </h3>
          {result.error ? (
            <p style={{ color: "var(--color-error)", fontWeight: "700" }}>{result.error}</p>
          ) : (
            <>
              <p style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
                Risk: <strong>{(result.prediction * 100).toFixed(2)}%</strong>
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontWeight: "600" }}>
                Level: <strong>{getRiskLevel(result.prediction)}</strong>
              </p>
            </>
          )}
        </section>
      )}

      {feedback && (
        <section
          aria-live="polite"
          aria-atomic="true"
          style={{
            marginTop: "24px",
            padding: "20px",
            borderRadius: "16px",
            backgroundColor: "var(--color-bg-alt)",
            color: "var(--color-text-primary)",
          }}
        >
          <h4 style={{ fontWeight: "700", marginBottom: "12px" }}>Health Feedback</h4>
<p dangerouslySetInnerHTML={{ __html: feedback }} />
        </section>
      )}
    </div>
  );
};

export default Prediction;
