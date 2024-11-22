// src/services/AuthService.js
class AuthService {
  async startAuth() {
    window.location.href = '/auth/google';
  }
  
  async checkAuthStatus() {
    const response = await fetch('/auth/status', {
      credentials: 'include'
    });
    return response.json();
  }
}

export default AuthService;