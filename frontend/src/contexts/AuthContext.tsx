import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { api, API_URL } from '../services/api';
import { syncPurchasesIdentity } from '../services/iap';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  interests: string[];
  university?: string;
  age?: number;
  study_style?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string, confirmStudent?: boolean) => Promise<{ requiresVerification: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sessionToken: string | null;
  setAdminSession: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processSessionId = useCallback(async (sessionId: string) => {
    try {
      const response = await api.post('/auth/session', { session_id: sessionId });
      
      if (response.user && response.session_token) {
        setUser(response.user);
        setSessionToken(response.session_token);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('session_token', response.session_token);
        
        // Also store in localStorage for web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          localStorage.setItem('session_token', response.session_token);
        }
        
      }
    } catch (error) {
      console.error('Session exchange error:', error);
    }
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      let token = await AsyncStorage.getItem('session_token');
      
      // On web, also check localStorage
      if (!token && Platform.OS === 'web' && typeof window !== 'undefined') {
        token = localStorage.getItem('session_token');
      }
      
      if (token) {
        setSessionToken(token);
        const userData = await api.get('/auth/me', token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Session check error:', error);
      await AsyncStorage.removeItem('session_token');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
      }
      setSessionToken(null);
      setUser(null);
    }
  }, []);

  // Handle URL callback
  useEffect(() => {
    const handleUrl = async (url: string) => {
      // Parse session_id from hash or query
      let sessionId = null;
      
      if (url.includes('#session_id=')) {
        sessionId = url.split('#session_id=')[1]?.split('&')[0];
      } else if (url.includes('?session_id=')) {
        sessionId = url.split('?session_id=')[1]?.split('&')[0];
      } else if (url.includes('session_id=')) {
        sessionId = url.split('session_id=')[1]?.split('&')[0];
      }
      
      if (sessionId) {
        setIsLoading(true);
        await processSessionId(sessionId);
        setIsLoading(false);
      }
    };

    // Cold start check
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
      }
    };

    // Web platform check - run immediately on mount
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      const hash = window.location.hash;
      const search = window.location.search;
      
      if (hash.includes('session_id=') || search.includes('session_id=') || fullUrl.includes('session_id=')) {
        handleUrl(fullUrl).then(() => {
          // Clean URL after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      }
    }

    checkInitialUrl();

    // Listen for URL events
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [processSessionId]);

  // Check existing session on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkExistingSession();
      setIsLoading(false);
    };
    init();
  }, [checkExistingSession]);

  // Keep RevenueCat's identity in sync with whichever login path set `user`
  // (OAuth callback, restored token, email login/register, admin session) —
  // one effect here instead of instrumenting every call site.
  useEffect(() => {
    syncPurchasesIdentity(user?.user_id ?? null);
  }, [user?.user_id]);

  const _persistSession = async (sessionToken: string, userData: User) => {
    setUser(userData);
    setSessionToken(sessionToken);
    try {
      await AsyncStorage.setItem('session_token', sessionToken);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem('session_token', sessionToken);
      }
    } catch (e) {
      console.error('Token persist error:', e);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await api.post('/auth/email-login', {
      email: email.trim().toLowerCase(),
      password,
    });
    if (!res?.session_token || !res?.user) {
      throw new Error('Login failed — no session returned.');
    }
    await _persistSession(res.session_token, res.user);
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    name?: string,
    confirmStudent?: boolean,
  ): Promise<{ requiresVerification: boolean }> => {
    const res = await api.post('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      name,
      confirm_student: !!confirmStudent,
    });

    // New flow: backend now requires OTP email verification before issuing a
    // session. Surface that to the caller so the login screen can redirect to
    // /verify-email instead of trying to enter the app.
    if (res?.email_verification_required) {
      return { requiresVerification: true };
    }

    // Legacy path — pre-OTP rollout: backend returned a session immediately.
    if (!res?.session_token || !res?.user) {
      throw new Error('Sign-up failed — no session returned.');
    }
    await _persistSession(res.session_token, res.user);
    return { requiresVerification: false };
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await api.post('/auth/verify-email', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });
    if (!res?.session_token || !res?.user) {
      throw new Error('Verification failed — no session returned.');
    }
    await _persistSession(res.session_token, res.user);
  };

  const resendVerification = async (email: string) => {
    return api.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
  };

  const login = async () => {
    try {
      // For web, use the current origin (user's actual domain)
      const redirectUrl = Platform.OS === 'web'
        ? window.location.origin + '/'
        : Linking.createURL('/');
      
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          // Parse session_id from result URL
          let sessionId = null;
          const url = result.url;
          
          if (url.includes('#session_id=')) {
            sessionId = url.split('#session_id=')[1]?.split('&')[0];
          } else if (url.includes('?session_id=')) {
            sessionId = url.split('?session_id=')[1]?.split('&')[0];
          } else if (url.includes('session_id=')) {
            sessionId = url.split('session_id=')[1]?.split('&')[0];
          }
          
          if (sessionId) {
            await processSessionId(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    // Capture token before clearing state
    const currentToken = sessionToken;

    // Clear state immediately for instant UI update
    setUser(null);
    setSessionToken(null);

    // Clear all stored tokens
    try {
      await AsyncStorage.removeItem('session_token');
      await AsyncStorage.removeItem('admin_session_token');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
        localStorage.removeItem('admin_session_token');
        localStorage.clear();
      }
    } catch (storageError) {
      console.error('Storage clear error:', storageError);
    }

    // Fire the backend invalidation in the background — do NOT await it. We
    // already cleared local state, so the user is logged-out from their
    // perspective regardless of whether the backend call succeeds. Awaiting it
    // here used to race the protected-route effect with the location.href
    // assignment and produced the "logout needs a second click / page refresh"
    // bug reported in production.
    if (currentToken) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        credentials: 'omit',
        // keepalive lets the request finish even after the page navigates away
        keepalive: true,
      }).catch((error) => {
        console.error('Logout API error (non-fatal):', error);
      });
    }

    // Force navigation immediately. window.location.replace avoids leaving the
    // protected route in the browser's history.
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  const refreshUser = async () => {
    if (sessionToken) {
      try {
        const userData = await api.get('/auth/me', sessionToken);
        setUser(userData);
      } catch (error) {
        console.error('Refresh user error:', error);
      }
    }
  };

  const setAdminSession = (token: string, userData: User) => {
    setSessionToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithEmail,
        registerWithEmail,
        verifyEmail,
        resendVerification,
        logout,
        refreshUser,
        sessionToken,
        setAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
