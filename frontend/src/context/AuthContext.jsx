import React, { createContext, useState, useEffect, useContext } from 'react';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    import('../services/socket').then(({ default: socket, connectSocket }) => {
        if (user) {
            connectSocket();
            socket.emit('identify', user.id);
            
            const handleAward = (data) => {
                import('react-hot-toast').then(({ toast }) => {
                    if (data.winnerId === user.id) {
                        toast.success(`🎉 Your bid has been accepted for ${data.rfqName}!`);
                    } else {
                        toast(`Auction closed. Another bidder was selected for ${data.rfqName}.`, { icon: 'ℹ️' });
                    }
                });
            };

            socket.on('BID_AWARDED', handleAward);
            
            return () => {
                socket.off('BID_AWARDED', handleAward);
            };
        }
    });
  }, [user]);

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const { token: newToken, ...userData } = data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return data;
  };

  const signup = async (name, email, password, role) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    const { token: newToken, ...userData } = data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isBuyer: user?.role === 'BUYER',
    isBidder: user?.role === 'BIDDER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
