// src/services/AuthService.js
class AuthService {
  async getUser() {
    try {
      const response = await fetch('/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  startAuth() {
    try {
      return window.location.href = '/auth/google';
    } catch (error) {
      throw new Error('Failed to start authentication');
    }
  }

  async logout() {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;