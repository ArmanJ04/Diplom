// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for the user in localStorage when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set user state from localStorage
    } else {
      checkAuth(); // If no user in localStorage, check auth from API
    }
  }, []);

  // Function to check the user auth from the backend (called after loading user from localStorage)
  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/check-auth", {
        withCredentials: true,
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Store the user in localStorage
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (uin, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { uin, password }, { withCredentials: true });
      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user; // ✅ so Login.jsx gets access to role
    } catch (error) {
      return null;
    }
  };
  

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, {
        withCredentials: true,
      });
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const res = await axios.put("http://localhost:5000/api/auth/update", updatedData, {
        withCredentials: true,
      });
  
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser; // ✅ Must return this
    } catch (error) {
      console.error("Profile update failed:", error.response?.data?.message || error.message);
      return null;
    }
  };
  
  const signup = async (userData) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", userData, {
        withCredentials: true,
      });

      const newUser = res.data.user;
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      await login(userData.uin, userData.password);

      return { status: "success", user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      console.error("Sign-up failed:", message);
      return { status: "error", message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signup, login, logout, updateUser, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
