// Locallie API client service
const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(response);
    },
    register: async (username, email, password, role) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      return handleResponse(response);
    },
    getUserProfile: async (id) => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      return handleResponse(response);
    }
  },

  // File Upload → Cloudinary (via backend /api/upload)
  upload: {
    file: async (file, folder = 'locallie/issues') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      // Note: Do NOT set Content-Type; browser auto-adds multipart boundary
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      return handleResponse(response); // returns { url, publicId, width, height, format, size }
    }
  },

  // Issues
  issues: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.lat) params.append('lat', filters.lat);
      if (filters.lng) params.append('lng', filters.lng);
      if (filters.radius) params.append('radius', filters.radius);

      const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`);
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`);
      return handleResponse(response);
    },
    create: async (issueData) => {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      });
      return handleResponse(response);
    },
    checkAI: async (issueData) => {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...issueData, checkOnly: true })
      });
      return handleResponse(response);
    },
    vote: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return handleResponse(response);
    },
    comment: async (id, username, text) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text })
      });
      return handleResponse(response);
    },
    claim: async (id, userId) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return handleResponse(response);
    },
    resolve: async (id, userId, afterImage) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, afterImage })
      });
      return handleResponse(response);
    }
  },

  // NGO volunteer drives
  drives: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/drives`);
      return handleResponse(response);
    },
    create: async (driveData) => {
      const response = await fetch(`${API_BASE_URL}/drives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveData)
      });
      return handleResponse(response);
    },
    join: async (id, username) => {
      const response = await fetch(`${API_BASE_URL}/drives/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      return handleResponse(response);
    }
  },

  // Analytics
  analytics: {
    getSummary: async () => {
      const response = await fetch(`${API_BASE_URL}/analytics`);
      return handleResponse(response);
    },
    getLeaderboard: async () => {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      return handleResponse(response);
    }
  },

  // AI Chatbot
  chatbot: {
    sendMessage: async (query) => {
      const response = await fetch(`${API_BASE_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return handleResponse(response);
    }
  }
};
