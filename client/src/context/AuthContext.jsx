import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { closeSocket } from '../services/socket.js';
import { clearAccessToken, getAccessToken, setAccessToken } from '../services/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        if (getAccessToken()) {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } finally {
        setBooting(false);
      }
    }
    loadUser();
  }, []);

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAccessToken();
      closeSocket();
      setUser(null);
    }
  }

  const value = useMemo(() => ({ user, booting, login, register, logout, setUser }), [user, booting]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
