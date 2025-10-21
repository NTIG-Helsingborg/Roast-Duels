const API_URL = 'https://roastbattles-backend.azurewebsites.net';

export const auth = {
  async register(username, password) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('userId', data.userId);
    return data;
  },

  async login(username, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('userId', data.userId);
    return data;
  },

  async verify() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        this.logout();
        return null;
      }
      
      const data = await response.json();
      localStorage.setItem('userId', data.userId);
      return data;
    } catch {
      this.logout();
      return null;
    }
  },

  async updateUsername(newUsername) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/auth/update-username`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newUsername })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUsername() {
    return localStorage.getItem('username');
  },

  getUserId() {
    return parseInt(localStorage.getItem('userId'));
  }
};

