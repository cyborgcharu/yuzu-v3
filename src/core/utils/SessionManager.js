// src/utils/SessionManager.js
class SessionManager {
  constructor() {
    this.sessionPrefix = 'session.id';
  }

  createSession() {
    console.log('[SessionManager] Creating new session');
    const sessionId = this.generateUniqueSessionId();
    console.log(`[SessionManager] Generated session ID: ${sessionId}`);
    this.storeSessionId(sessionId);
    console.log(`[SessionManager] Stored session ID in cookie`);
    return sessionId;
  }

  getSessionId() {
    console.log('[SessionManager] Retrieving session ID from cookies');
    const cookies = document.cookie.split(';').find((cookie) => cookie.trim().startsWith(`${this.sessionPrefix}=`));
    if (cookies) {
      const sessionId = cookies.split('=')[1];
      console.log(`[SessionManager] Retrieved session ID: ${sessionId}`);
      return sessionId;
    } else {
      console.log('[SessionManager] Session cookie not found');
      return null;
    }
  }

  storeSessionId(sessionId) {
    console.log(`[SessionManager] Storing session ID: ${sessionId}`);
    // Store the session ID in a cookie
    document.cookie = `${this.sessionPrefix}=${sessionId}; HttpOnly; Secure; SameSite=Strict`;
  }

  saveUserAndTokens(sessionId, user, tokens) {
    console.log(`[SessionManager] Saving user and tokens to session with ID: ${sessionId}`);
    // Store the user and tokens in the session storage
    this.getSessionStorage(sessionId).user = user;
    this.getSessionStorage(sessionId).tokens = tokens;
  }

  getUserAndTokensFromSession(sessionId) {
    console.log(`[SessionManager] Retrieving user and tokens from session with ID: ${sessionId}`);
    const sessionStorage = this.getSessionStorage(sessionId);
    return {
      user: sessionStorage.user || null,
      tokens: sessionStorage.tokens || null,
    };
  }

  destroySession(sessionId) {
    console.log(`[SessionManager] Destroying session with ID: ${sessionId}`);
    // Remove the session and associated data
    this.getSessionStorage(sessionId).user = null;
    this.getSessionStorage(sessionId).tokens = null;
    this.clearSessionId(sessionId);
  }

  clearSessionId(sessionId) {
    console.log(`[SessionManager] Clearing session ID: ${sessionId}`);
    // Remove the session ID from the cookie
    document.cookie = `${this.sessionPrefix}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  getSessionStorage(sessionId) {
    console.log(`[SessionManager] Accessing session storage for ID: ${sessionId}`);
    // Implement a session storage mechanism, e.g., in-memory storage or a database
    if (!global.sessionStorage) {
      console.log('[SessionManager] Creating global session storage');
      global.sessionStorage = {};
    }
    if (!global.sessionStorage[sessionId]) {
      console.log(`[SessionManager] Creating session storage for ID: ${sessionId}`);
      global.sessionStorage[sessionId] = {};
    }
    return global.sessionStorage[sessionId];
  }

  generateUniqueSessionId() {
    console.log('[SessionManager] Generating unique session ID');
    return `session-${Math.random().toString(36).substring(2, 10)}`;
  }
}

export default SessionManager;