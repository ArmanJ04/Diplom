import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/prediction/history?uin=${user.uin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data.history || []);
    };

    fetchHistory();
  }, []);

  const riskTrendData = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    risk: +(h.prediction * 100).toFixed(2),
  }));

  const doctors = [
    {
      name: "Dr. Ali Tursyn",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      age: 45,
      experience: "20 years in cardiology",
      education: "MD, Harvard Medical School",
    },
    {
      name: "Dr. Aiman Ryskul",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      age: 39,
      experience: "15 years in heart surgery",
      education: "MD, Nazarbayev University",
    },
    {
      name: "Dr. Yerbol Zhaksylyk",
      image: "https://randomuser.me/api/portraits/men/50.jpg",
      age: 50,
      experience: "25 years in internal medicine",
      education: "MD, Karaganda Medical University",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
  };

  return (
    <div className="page-container" style={{ padding: "40px" }}>
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Welcome to Your Dashboard</h1>

      {/* CVD Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-gray-700">🫀 About Cardiovascular Disease</h2>
        <p className="text-gray-600 text-lg">
          Cardiovascular disease (CVD) refers to disorders of the heart and blood vessels, such as coronary artery disease,
          arrhythmia, and congenital heart defects. Risk factors include high blood pressure, cholesterol, smoking, obesity, and diabetes.
        </p>
      </section>

      {/* Prevention Tips */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-gray-700">💊 Prevention Tips</h2>
        <ul className="list-disc list-inside text-gray-600 text-lg">
          <li>Exercise regularly – even 30 minutes a day helps.</li>
          <li>Eat more fruits, vegetables, and omega-3-rich foods.</li>
          <li>Reduce salt and sugar intake.</li>
          <li>Avoid smoking and excessive alcohol.</li>
          <li>Manage stress and monitor your vitals regularly.</li>
        </ul>
      </section>

      {/* Risk Trend Line Chart */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">📈 Risk Score Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={riskTrendData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Glossary */}
      <section className="my-8 p-6 bg-blue-50 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">📘 What is a Prediction Score?</h3>
        <p className="text-gray-700">
          Your prediction score shows your estimated cardiovascular disease risk.
          <br />— <span className="text-green-600">0–30%</span>: Low Risk
          <br />— <span className="text-yellow-600">30–70%</span>: Moderate Risk
          <br />— <span className="text-red-600">70–100%</span>: High Risk
        </p>
      </section>

      {/* Prediction History Timeline */}
      <section className="my-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🕒 Recent Predictions</h3>
        <ul className="space-y-4">
          {history.slice(0, 3).map((item, i) => (
            <li key={i} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <strong>Date:</strong> {new Date(item.timestamp).toLocaleDateString()}
                </div>
                <div>
                  <strong>Score:</strong>{" "}
                  <span className={item.prediction < 0.3 ? "text-green-600" : item.prediction < 0.7 ? "text-yellow-600" : "text-red-600"}>
                    {(item.prediction * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              {item.feedback && <p className="text-sm mt-1 text-gray-600"><strong>Feedback:</strong> {item.feedback}</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* Doctor Info Slider */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">👨‍⚕️ Meet Our Doctors</h2>
        <Slider {...sliderSettings}>
          {doctors.map((doc, i) => (
            <div key={i} className="p-4">
              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center p-6 h-full">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-blue-800">{doc.name}</h3>
                <p className="text-gray-600">🎂 Age: {doc.age}</p>
                <p className="text-gray-600">🧑‍⚕️ Experience: {doc.experience}</p>
                <p className="text-gray-600">🎓 Education: {doc.education}</p>
              </div>
            </div>
          ))}
        </Slider>
      </section>
    </div>
  );
}

export default Dashboard;
