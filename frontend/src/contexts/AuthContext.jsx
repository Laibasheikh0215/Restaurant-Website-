import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
} from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

 const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    
    toast.success('Login successful!');
    
    // ⚠️ Temporary - redirect hatao
    // window.location.href = user.role === 'admin' ? '/admin' : '/';
    
    return true;
  } catch (error) {
    toast.error(error.response?.data?.error || 'Login failed');
    return false;
  }
};
  
  const register = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData,
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
      return false;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { email, displayName, uid } = result.user;

      const response = await axios.post(
        "http://localhost:5000/api/auth/social-login",
        {
          email: email,
          full_name: displayName || email.split("@")[0],
          provider: "google",
          provider_id: uid,
        },
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      toast.success(`Welcome ${user.full_name}!`);

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed");
    }
  };

  // Facebook Login
  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const { email, displayName, uid } = result.user;

      const response = await axios.post(
        "http://localhost:5000/api/auth/social-login",
        {
          email: email,
          full_name: displayName || email.split("@")[0],
          provider: "facebook",
          provider_id: uid,
        },
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      toast.success(`Welcome ${user.full_name}!`);

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast.error("Facebook login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Also update localStorage if needed
    const token = localStorage.getItem("token");
    if (token && updatedUser) {
      // User data is already updated in state
    }
  };

  // Make sure to include updateUser in context value
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        loginWithGoogle,
        loginWithFacebook,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
