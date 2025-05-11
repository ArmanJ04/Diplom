// Redesigned Prediction.jsx (Step-by-Step Medical Form)
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LoaderCircle } from "lucide-react";

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

      const response = await fetch("http://localhost:5000/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();

      await fetch("http://localhost:5000/api/prediction/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uin: user.uin, prediction: data.prediction }),
      });

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getRiskLevel = (value) => {
    if (value >= 0.7) return "High Risk";
    if (value >= 0.4) return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Cardiovascular Risk Prediction</h2>
      <form className="space-y-4">
        <div>
          <label className="font-medium">Birthdate</label>
          <input type="date" name="birthdate" value={inputData.birthdate} onChange={handleChange} className="input" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Height (cm)</label>
            <input type="number" name="height" value={inputData.height} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="font-medium">Weight (kg)</label>
            <input type="number" name="weight" value={inputData.weight} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="font-medium">Gender</label>
          <select name="gender" value={inputData.gender} onChange={handleChange} className="input">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Systolic BP</label>
            <input type="number" name="systolicBP" value={inputData.systolicBP} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="font-medium">Diastolic BP</label>
            <input type="number" name="diastolicBP" value={inputData.diastolicBP} onChange={handleChange} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Cholesterol</label>
            <select name="cholesterol" value={inputData.cholesterol} onChange={handleChange} className="input">
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Glucose</label>
            <select name="glucose" value={inputData.glucose} onChange={handleChange} className="input">
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label><input type="checkbox" name="smoking" checked={inputData.smoking} onChange={handleChange} /> Smoking</label>
          <label><input type="checkbox" name="alcoholIntake" checked={inputData.alcoholIntake} onChange={handleChange} /> Alcohol Consumption</label>
          <label><input type="checkbox" name="physicalActivity" checked={inputData.physicalActivity} onChange={handleChange} /> Physical Activity &gt; 15 hrs/week</label>
        </div>

        <button type="button" onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700">
          {loading ? <span className="flex justify-center items-center gap-2"><LoaderCircle className="animate-spin" /> Predicting...</span> : "Predict Risk"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Prediction Result</h3>
          <p className="text-lg">Risk: <span className="font-bold">{(result.prediction * 100).toFixed(2)}%</span></p>
          <p className="text-base text-gray-600">Level: <span className="font-semibold">{getRiskLevel(result.prediction)}</span></p>
        </div>
      )}
    </div>
  );
};

export default Prediction;
