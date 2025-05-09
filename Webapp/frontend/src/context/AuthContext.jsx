// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Always check auth with backend on initial load
  useEffect(() => {
    const verifyAuth = async () => {
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
    verifyAuth();
  }, []);

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
        return { status: "success", user: userData }; // Return user data
      } else {
        // This case might not be hit if server sends non-200 for errors
        return { status: "error", message: res.data.message || "Login failed." };
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      return { status: "error", message: error.response?.data?.message || "Invalid credentials. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Still proceed to clear client-side state even if server call fails
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const res = await axios.put("http://localhost:5000/api/auth/update", updatedData, {
        withCredentials: true,
      });
      // Assuming the backend returns the updated user object in res.data.user
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return { status: "success", user: res.data.user };
    } catch (error) {
      console.error("Profile update failed:", error.response?.data?.message || error.message);
      throw error; // Re-throw the error so the component can catch it
    }
  };

  const signup = async (userData) => {
    try {
      // This assumes your backend /register route will set the auth cookie upon successful registration
      const res = await axios.post("http://localhost:5000/api/auth/register", userData, {
        withCredentials: true,
      });

      const newUser = res.data.user;
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      // No need to call login() if register sets the auth cookie and returns the user
      return { status: "success", user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      console.error("Sign-up failed:", message);
      return { status: "error", message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signup, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
