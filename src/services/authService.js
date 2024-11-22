// src/services/authService.js
class AuthService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL;
  }

  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/auth/status`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false };
    }
  }

  async logout() {
    try {
      await fetch(`${this.apiUrl}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();