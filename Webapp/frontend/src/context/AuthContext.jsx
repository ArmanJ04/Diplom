import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    try {
      const storedUser = raw ? JSON.parse(raw) : null;
      if (storedUser) {
        setUser(storedUser);
        setLoading(false);
      } else {
        checkAuth();
      }
    } catch {
      setUser(null);
      localStorage.removeItem("user");
      checkAuth();
    }
  }, []);

  // Axios Interceptor to include token in requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token"); // Fetch token from localStorage
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`; // Add token to headers
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/check-auth", {
        withCredentials: true,
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (uin, password) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { uin, password },
        { withCredentials: true }
      );

      if (res.status === 200 && res.data.user) {
        const userData = res.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", res.data.token); // Store token here
        return userData;
      } else {
        return res.data.message || "Login failed.";
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      return error.response?.data?.message || "Invalid credentials. Please try again.";
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, {
        withCredentials: true,
      });
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token"); // Remove token on logout

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
      return updatedUser;
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
