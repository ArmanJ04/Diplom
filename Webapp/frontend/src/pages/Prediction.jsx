import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Prediction = () => {
  const { user } = useAuth();
  const [inputData, setInputData] = useState({
    birthdate: "",
    gender: "male",
    height: "",
    weight: "",
    systolicBP: "",
    diastolicBP: "",
    cholesterol: "1",
    glucose: "1",
    smoking: false,
    alcoholIntake: false,
    physicalActivity: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (user) {
      setInputData((prevState) => ({
        ...prevState,
        birthdate: user.birthdate || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "male",
        physicalActivity: user.physicalActivity > 15,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateAgeInDays = (birthdate) => {
    const birthDate = new Date(birthdate);
    const currentDate = new Date();
    const ageInMilliseconds = currentDate - birthDate;
    const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
    return ageInDays;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

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
      };

      console.log("Submitting Data:", formattedData);

      // Fetch Prediction
      const response = await fetch("http://localhost:5000/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      console.log("Prediction Result:", data);

      // Save Prediction to History
      const saveResponse = await fetch("http://localhost:5000/api/prediction/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email, // ✅ Using email instead of userId
          prediction: data.prediction,
        }),
      });

      const saveResult = await saveResponse.json();
      console.log("Save Prediction Response:", saveResult);

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability) => {
    if (probability >= 0.7) return "High";
    if (probability >= 0.4) return "Moderate";
    return "Low";
  };

  return (
    <div className="prediction-container">
      <h2>Cardiovascular Disease Prediction</h2>

      <label>Birthdate:</label>
      <input type="date" name="birthdate" value={inputData.birthdate} onChange={handleChange} placeholder="Enter your birthdate" />

      <label>Height (cm):</label>
      <input type="number" name="height" value={inputData.height} onChange={handleChange} placeholder="Enter your height in cm" />

      <label>Weight (kg):</label>
      <input type="number" name="weight" value={inputData.weight} onChange={handleChange} placeholder="Enter your weight in kg" />

      <label>Gender:</label>
      <select name="gender" value={inputData.gender} onChange={handleChange}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <label>Systolic Blood Pressure:</label>
      <input type="number" name="systolicBP" value={inputData.systolicBP} onChange={handleChange} placeholder="Enter systolic BP" />

      <label>Diastolic Blood Pressure:</label>
      <input type="number" name="diastolicBP" value={inputData.diastolicBP} onChange={handleChange} placeholder="Enter diastolic BP" />

      <label>Cholesterol Level:</label>
      <select name="cholesterol" value={inputData.cholesterol} onChange={handleChange}>
        <option value="1">Normal (Total &lt; 200 mg/dL)</option>
        <option value="2">Above Normal (Total 200-239 mg/dL)</option>
        <option value="3">Well Above Normal (Total ≥ 240 mg/dL)</option>
      </select>

      <label>Glucose Level:</label>
      <select name="glucose" value={inputData.glucose} onChange={handleChange}>
        <option value="1">Normal (70-100 mg/dL)</option>
        <option value="2">Above Normal (100-125 mg/dL)</option>
        <option value="3">Well Above Normal (≥ 126 mg/dL)</option>
      </select>

      <label>Smoking:</label>
      <input type="checkbox" name="smoking" checked={inputData.smoking} onChange={handleChange} />

      <label>Alcohol Intake:</label>
      <input type="checkbox" name="alcoholIntake" checked={inputData.alcoholIntake} onChange={handleChange} />

      <label>Physical Activity (More than 15 hours/week):</label>
      <input type="checkbox" name="physicalActivity" checked={inputData.physicalActivity} onChange={handleChange} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Predict Risk"}
      </button>

      {loading && <p>Loading...</p>}

      {result && (
        <div className="prediction-result">
          <h3>Prediction Result:</h3>
          <p>Risk Percentage: {(result.prediction * 100).toFixed(2)}%</p>
          <p>Risk Level: <strong>{getRiskLevel(result.prediction)}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Prediction;
