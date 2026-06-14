import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { api, API_URL } from '../services/api';

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
      console.log('Processing session_id:', sessionId);
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
        
        console.log('Auth successful, user:', response.user.name);
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
        console.log('Restored session for:', userData.name);
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
      console.log('Handling URL:', url);
      
      // Parse session_id from hash or query
      let sessionId = null;
      
      if (url.includes('#session_id=')) {
        sessionId = url.split('#session_id=')[1]?.split('&')[0];
      } else if (url.includes('?session_id=')) {
        sessionId = url.split('?session_id=')[1]?.split('&')[0];
      } else if (url.includes('session_id=')) {
        sessionId = url.split('session_id=')[1]?.split('&')[0];
      }
      
      console.log('Parsed session_id:', sessionId);
      
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
      
      console.log('Web URL check - Full URL:', fullUrl);
      console.log('Hash:', hash, 'Search:', search);
      
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
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
        localStorage.removeItem('admin_session_token');
        localStorage.clear();
      }
    } catch (storageError) {
      console.error('Storage clear error:', storageError);
    }
    
    // Invalidate session on backend using the captured token
    try {
      if (currentToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          credentials: 'omit',
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Force reload on web to ensure clean state
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
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
