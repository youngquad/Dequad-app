import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://student-connect-46.preview.emergentagent.com';
export const API_URL = BACKEND_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api`;
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('session_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
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
      console.log(`API ${method} ${endpoint} - Using stored token:`, authToken ? authToken.substring(0, 20) + '...' : 'none');
    }
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
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
