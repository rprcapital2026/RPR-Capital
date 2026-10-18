import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'rpr_capital_session_v6';

export function AuthProvider({ children }) {
  const { users = [] } = useData() || {};
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.role) {
          return {
            ...parsed,
            branch: 'Jamawaramgarh Branch, Jaipur'
          };
        }
      }
    } catch (e) {
      console.warn('RPR session parse safely recovered:', e);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
    }
    // Default to null (unauthenticated guest) until user explicitly logs in
    return null;
  });

  // Keep session safely synced with live data and immediately kick out blocked/revoked accounts
  useEffect(() => {
    if (currentUser && Array.isArray(users)) {
      const updatedUser = users.find((u) => u && u.id === currentUser.id);
      if (updatedUser) {
        if (updatedUser.status === 'Blocked' || updatedUser.status === 'Revoked' || updatedUser.status === 'Suspended/Frozen') {
          console.warn('[Security Guard] Current session user has been blocked/revoked by Admin. Terminating session.');
          setCurrentUser(null);
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch {}
          return;
        }
        setCurrentUser(updatedUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        } catch {}
      }
    }
  }, [users, currentUser?.id]);

  const login = async (email, password) => {
    if (!email || typeof email !== 'string') {
      return { success: false, message: 'Please enter your registered email address.' };
    }
    if (!password || typeof password !== 'string') {
      return { success: false, message: 'Please enter your account password.' };
    }

    // 1. First attempt authentication via MongoDB Atlas API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        if (data.user.status === 'Blocked' || data.user.status === 'Revoked' || data.user.status === 'Suspended/Frozen') {
          return { success: false, message: 'This account has been blocked/revoked by Executive Admin Rohit Meena. Access is strictly restricted.' };
        }
        setCurrentUser(data.user);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        } catch {}
        return { success: true, user: data.user };
      } else if (data && !data.success && res.status !== 404 && res.status !== 500) {
        return { success: false, message: data.message };
      }
    } catch {
      // Backend starting or proxy syncing, fallback to local users
    }

    // 2. Safe local authentication fallback
    const trimmedEmail = email.trim().toLowerCase();
    const safeUsers = Array.isArray(users) ? users : [];
    
    // Direct match or admin match
    let found = safeUsers.find((u) => u && typeof u.email === 'string' && u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      if (trimmedEmail === 'rprcapital2624@gmail.com' || trimmedEmail.startsWith('admin@') || trimmedEmail.startsWith('rohit@')) {
        found = safeUsers.find((u) => u.role === 'admin');
      } else if (trimmedEmail.startsWith('staff@') || trimmedEmail.startsWith('pooja@')) {
        found = safeUsers.find((u) => u.role === 'staff');
      } else if (trimmedEmail.startsWith('vikram@')) {
        found = safeUsers.find((u) => u.role === 'customer');
      }
    }

    if (!found) {
      return {
        success: false,
        message: 'No account found with this email. Please check your credentials or register a new customer account.'
      };
    }

    if (found.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      };
    }

    if (found.status === 'Blocked' || found.status === 'Revoked' || found.status === 'Suspended/Frozen') {
      return {
        success: false,
        message: 'This staff/employee account has been blocked or revoked by Executive Admin Rohit Meena. Access Denied.'
      };
    }

    setCurrentUser(found);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      console.warn('Could not save session to storage:', e);
    }
    return { success: true, user: found };
  };

  const loginAsPreset = (role) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const presetUser = safeUsers.find((u) => u && u.role === role);
    if (presetUser) {
      setCurrentUser(presetUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(presetUser));
      } catch {}
      return { success: true, user: presetUser };
    }
    return { success: false, message: `No active ${role} profile found.` };
  };

  const updateCurrentUser = (fields) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginAsPreset,
        logout,
        updateCurrentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
