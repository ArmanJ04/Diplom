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
    cholesterol: "",
    glucose: "",
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

    if (!inputData.cholesterol || !inputData.glucose) {
      alert("Please select both cholesterol and glucose levels.");
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
          systolicBP: inputData.systolicBP,
          diastolicBP: inputData.diastolicBP,
          cholesterol: inputData.cholesterol,
          glucose: inputData.glucose,
          smoking: inputData.smoking,
          alcoholIntake: inputData.alcoholIntake,
          physicalActivity: inputData.physicalActivity,
        },
      };

      const response = await fetch("http://localhost:5000/api/ai/predict", {
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

      const saveResponse = await fetch("http://localhost:5000/api/prediction/save", {
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
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
        Cardiovascular Risk Prediction
      </h2>
      <form className="space-y-6" aria-label="Prediction Form">
        <div>
          <label
            htmlFor="birthdate"
            className="tooltip"
            data-tip="Your date of birth to calculate your age."
          >
            Birthdate
          </label>
          <input
            id="birthdate"
            type="date"
            name="birthdate"
            value={inputData.birthdate}
            onChange={handleChange}
            aria-required="true"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="height"
              className="tooltip"
              data-tip="Your height in centimeters."
            >
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              name="height"
              value={inputData.height}
              onChange={handleChange}
              aria-required="true"
              min="30"
              max="300"
              placeholder="e.g. 170"
            />
          </div>
          <div>
            <label
              htmlFor="weight"
              className="tooltip"
              data-tip="Your weight in kilograms."
            >
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              name="weight"
              value={inputData.weight}
              onChange={handleChange}
              aria-required="true"
              min="20"
              max="500"
              placeholder="e.g. 70"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="gender"
            className="tooltip"
            data-tip="Select your biological sex."
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={inputData.gender}
            onChange={handleChange}
            aria-required="true"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="systolicBP"
              className="tooltip"
              data-tip="Systolic blood pressure (pressure when your heart beats)."
            >
              Systolic BP
            </label>
            <input
              id="systolicBP"
              type="number"
              name="systolicBP"
              value={inputData.systolicBP}
              onChange={handleChange}
              aria-required="true"
              min="50"
              max="250"
              placeholder="e.g. 120"
            />
          </div>
          <div>
            <label
              htmlFor="diastolicBP"
              className="tooltip"
              data-tip="Diastolic blood pressure (pressure between heartbeats)."
            >
              Diastolic BP
            </label>
            <input
              id="diastolicBP"
              type="number"
              name="diastolicBP"
              value={inputData.diastolicBP}
              onChange={handleChange}
              aria-required="true"
              min="30"
              max="150"
              placeholder="e.g. 80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="cholesterol"
              className="tooltip"
              data-tip="Your cholesterol level: Normal, Above Normal, or Well Above Normal."
            >
              Cholesterol
            </label>
            <select
              id="cholesterol"
              name="cholesterol"
              value={inputData.cholesterol}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="" disabled>
                Select Cholesterol Level
              </option>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="glucose"
              className="tooltip"
              data-tip="Your blood glucose level."
            >
              Glucose
            </label>
            <select
              id="glucose"
              name="glucose"
              value={inputData.glucose}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="" disabled>
                Select Glucose Level
              </option>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-3" role="group" aria-label="Lifestyle factors">
          <label className="tooltip" data-tip="Check if you currently smoke.">
            <input
              type="checkbox"
              name="smoking"
              checked={inputData.smoking}
              onChange={handleChange}
              aria-checked={inputData.smoking}
            />{" "}
            Smoking
          </label>
          <label className="tooltip" data-tip="Check if you regularly consume alcohol.">
            <input
              type="checkbox"
              name="alcoholIntake"
              checked={inputData.alcoholIntake}
              onChange={handleChange}
              aria-checked={inputData.alcoholIntake}
            />{" "}
            Alcohol Consumption
          </label>
          <label
            className="tooltip"
            data-tip="Check if you engage in physical activity more than 15 hours per week."
          >
            <input
              type="checkbox"
              name="physicalActivity"
              checked={inputData.physicalActivity}
              onChange={handleChange}
              aria-checked={inputData.physicalActivity}
            />{" "}
            Physical Activity &gt; 15 hrs/week
          </label>
        </div>

        <button type="button" onClick={handleSubmit} disabled={loading} aria-busy={loading}>
          {loading ? (
            <span className="flex justify-center items-center gap-2" aria-live="polite">
              <LoaderCircle className="animate-spin" /> Predicting...
            </span>
          ) : (
            "Predict Risk"
          )}
        </button>
      </form>

      {result && (
        <div
          className="mt-8 p-6 rounded text-center"
          style={{ backgroundColor: "var(--color-bg-alt)" }}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Prediction Result</h3>
          {result.error ? (
            <p className="text-red-600 font-semibold">{result.error}</p>
          ) : (
            <>
              <p className="text-lg">
                Risk: <span className="font-bold">{(result.prediction * 100).toFixed(2)}%</span>
              </p>
              <p className="text-base text-gray-600">
                Level: <span className="font-semibold">{getRiskLevel(result.prediction)}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Prediction;
