// src/services/AuthService.js
class AuthService {
  startAuth() {
    window.location.href = '/auth/google';
  }

  async getUser() {
    const response = await fetch('/auth/user', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    return response.json();
  }

  async logout() {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  }
}

export default AuthService;