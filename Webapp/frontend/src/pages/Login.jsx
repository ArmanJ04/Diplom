import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useContext(AuthContext); // Добавим setUser для обновления контекста
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(uin, password);

      if (result === "success") {
        const storedUser = JSON.parse(localStorage.getItem("user")); // Загружаем пользователя из localStorage

        if (storedUser.role === "doctor" && !storedUser.doctorApproved) {
          window.alert("Your doctor account is not approved yet. Please wait for admin confirmation.");
          return;
        }

        // Обновляем контекст с новым пользователем
        setUser(storedUser);

        window.alert("Login successful!");
        setUin("");
        setPassword("");

        if (storedUser.role === "doctor") {
          navigate("/doctorPage"); // Навигация на страницу доктора
        } else {
          navigate("/dashboard"); // Навигация на панель пациента
        }
      } else {
        window.alert(result);
      }
    } catch (error) {
      window.alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="UIN"
          value={uin}
          onChange={(e) => setUin(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}

export default Login;
