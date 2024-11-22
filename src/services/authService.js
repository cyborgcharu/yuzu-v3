// src/services/authService.js
class AuthService {
  constructor() {
    this.googleAuth = new GoogleAuthService();
  }

  async startAuth(req, res) {
    const authUrl = this.googleAuth.generateAuthUrl();
    res.redirect(authUrl);
  }

  async handleCallback(req, res) {
    const { code } = req.query;
    const tokens = await this.googleAuth.getTokens(code);
    const userInfo = await this.googleAuth.getUserInfo(tokens);
    
    req.session.user = userInfo;
    req.session.tokens = tokens;
    
    res.redirect('/dashboard'); // Direct to frontend route
  }

  async getUser(req) {
    return req.session.user || null;
  }
}