// AuthContext.js  — replace the existing file content

import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(undefined);
  const [language, setLanguageSt] = useState('en'); // 'en' | 'ta'

  useEffect(() => {
    loadUser();
    loadLanguage();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  };

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('appLanguage');
      if (stored) setLanguageSt(stored);
    } catch {}
  };

  const setLanguage = async (lang) => {
    await AsyncStorage.setItem('appLanguage', lang);
    setLanguageSt(lang);
  };

  const updateUser = async (partialUpdate) => {
    const updated = { ...user, ...partialUpdate };
    await AsyncStorage.setItem('userData', JSON.stringify(updated));
    setUser(updated);
  };

  const login = async (userData) => {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);