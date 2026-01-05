// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  verify: async () => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
  }
};

export const employeeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/employees`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  create: async (name) => {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  update: async (id, name) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return response.json();
  },

  updateStatus: async (id, isActive) => {
    const response = await fetch(`${API_URL}/employees/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ isActive }),
    });
    return response.json();
  },

  markComplete: async (id, type) => {
    const response = await fetch(`${API_URL}/employees/${id}/complete/${type}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return response.json();
  }
};

export const historyAPI = {
  get: async (type) => {
    const response = await fetch(`${API_URL}/history/${type}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  exportCSV: async (type) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/export/csv/${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-history.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
