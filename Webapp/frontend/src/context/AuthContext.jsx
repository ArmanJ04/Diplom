import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-auth`, {
        withCredentials: true,
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

const login = async (uin, password) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      { uin, password },
      { withCredentials: true }
    );

    if (res.status === 200 && res.data.user) {
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.data.token);
      return userData;
    } else {
      throw new Error(res.data.message || "Login failed.");
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Invalid credentials. Please try again."
    );
  }
};


  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}
  };

  const updateUser = async (updatedData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update`, updatedData, {
        withCredentials: true,
      });
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch {
      return null;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData, {
        withCredentials: true,
      });
      const newUser = res.data.user;
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Registration successful! Please complete your profile.");
      await login(userData.uin, userData.password);
      return { status: "success", user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, signup, login, logout, updateUser, checkAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
