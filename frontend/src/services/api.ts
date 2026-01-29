const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://mood-tracker-289.preview.emergentagent.com';
export const API_URL = BACKEND_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api`;
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

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
