import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Preview/dev env vars take precedence; production builds and local `expo start`
// (where .env is absent) fall back to the URL baked into app.json extra.
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  '';
export const API_URL = BACKEND_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api`;
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      // On web, try localStorage first as it's more reliable
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const webToken = window.localStorage.getItem('session_token');
        if (webToken) {
          return webToken;
        }
      }
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem('session_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      // Store in both localStorage (for web) and AsyncStorage (for mobile)
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('session_token', token);
      }
      await AsyncStorage.setItem('session_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async clearToken(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('session_token');
      }
      await AsyncStorage.removeItem('session_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    token?: string | null
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use provided token or fall back to stored token
    let authToken = token;
    if (!authToken) {
      authToken = await this.getStoredToken();
    }
    
    // Also check for admin_session_token if regular token not found
    if (!authToken && Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      authToken = window.localStorage.getItem('admin_session_token');
    }
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      // Auth is via Bearer token in the Authorization header — cookies aren't used.
      // Sending `credentials: 'include'` triggers a CORS preflight that fails when
      // the response sets `Access-Control-Allow-Origin: *`. Use 'omit' so the request
      // is treated as non-credentialed and works through any proxy/CDN.
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // FastAPI's `detail` is usually a plain string, but some endpoints
        // (e.g. the weekly-like-limit rejection) send a structured object
        // like { message, limit, upgrade_required }. Passing that object
        // straight into `Error()` stringifies it to the useless
        // "[object Object]" — pull out `.message` instead.
        const detail = errorData.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : detail?.message || `HTTP error ${response.status}`;
        const err = new Error(message) as Error & { detail?: unknown };
        if (detail && typeof detail === 'object') {
          err.detail = detail;
        }
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error(`API ${method} ${endpoint} error:`, error);
      throw error;
    }
  }

  async get(endpoint: string, token?: string | null) {
    return this.request('GET', endpoint, undefined, token);
  }

  async post(endpoint: string, data: any, token?: string | null) {
    return this.request('POST', endpoint, data, token);
  }

  async put(endpoint: string, data: any, token?: string | null) {
    return this.request('PUT', endpoint, data, token);
  }

  async delete(endpoint: string, token?: string | null) {
    return this.request('DELETE', endpoint, undefined, token);
  }
}

export const api = new ApiService();
