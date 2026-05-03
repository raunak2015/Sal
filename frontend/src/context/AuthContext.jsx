import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sal_library_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const data = await loginApi(email, password, role);
      setUser(data.user);
      localStorage.setItem('sal_library_user', JSON.stringify({ ...data.user, token: data.token }));
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerApi(name, email, password);
      setUser(data.user);
      localStorage.setItem('sal_library_user', JSON.stringify({ ...data.user, token: data.token }));
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sal_library_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
