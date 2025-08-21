# 🩺 Cardiovascular Risk Assessment Web Application (Diploma Project)

A full-stack web application for assessing the risk of cardiovascular diseases (CVD) using a pre-trained AI model. The system is designed for two types of users: **Patients** and **Doctors**.

## 🔍 Overview

Patients can enter their health data (manually or via JSON upload) to get an AI-powered risk evaluation. Doctors can view multiple patients, monitor their risk levels, and provide feedback or preventive recommendations.

The project integrates a PyTorch model (`best_model.pth`) through a Python microservice and communicates with the Node.js backend via internal API requests.

---

## 🛠️ Tech Stack

### Frontend
- **React** with **React Router**
- **Tailwind CSS** or **CSS Modules**
- **React Hook Form** / Formik (optional)
- **Context API** or Redux (optional)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (NoSQL)
- **JWT Authentication**
- **Multer** (for file uploads)

### AI Service
- **Python** with **Flask** or **FastAPI**
- **PyTorch** model (`best_model.pth`)
- REST API for prediction

---

## 🧩 Features

### ✅ Patient Features
- Sign up / Log in
- Fill out health data form manually
- Upload health data via JSON file
- Submit data for AI evaluation
- View risk result (e.g., Low / Medium / High)
- Update personal profile

### 🩺 Doctor Features
- View list of all patients
- Access patient risk history
- Add comments or recommendations
- Filter patients by name or risk level

### ⚙️ Admin Features (Optional)
- View platform statistics
- Manage user accounts
- Upload new AI models

---

## 🧠 AI Model

- Format: `best_model.pth` (PyTorch)
- Exposed via REST API using **Flask** or **FastAPI**
- Accepts structured health data and returns a risk classification
- Prediction is stored in MongoDB with a timestamp

---

## 📁 Example JSON Upload

```json
{
  "age": 52,
  "cholesterol": 210,
  "systolic_bp": 140,
  "diastolic_bp": 90,
  "bmi": 27.5,
  "smoking": true,
  "physical_activity": "low",
  "family_history": true
}
