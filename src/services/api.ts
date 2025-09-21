import axios from 'axios';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Services utilisateurs
export const userService = {
  getAll: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Services classes
export const classService = {
  getAll: async (params?: any) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (classData: any) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  update: async (id: string, classData: any) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  addStudent: async (classId: string, studentId: string) => {
    const response = await api.post(`/classes/${classId}/students`, { studentId });
    return response.data;
  },

  removeStudent: async (classId: string, studentId: string) => {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  }
};

// Services cours
export const courseService = {
  getAll: async (params?: any) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  create: async (courseData: any) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  update: async (id: string, courseData: any) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

// Services emploi du temps
export const scheduleService = {
  getAll: async (params?: any) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  create: async (scheduleData: any) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  update: async (id: string, scheduleData: any) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  }
};

// Services notes
export const gradeService = {
  getAll: async (params?: any) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  create: async (gradeData: any) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  update: async (id: string, gradeData: any) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  }
};

// Services présences
export const attendanceService = {
  getAll: async (params?: any) => {
    const response = await api.get('/attendances', { params });
    return response.data;
  },

  create: async (attendanceData: any) => {
    const response = await api.post('/attendances', attendanceData);
    return response.data;
  },

  update: async (id: string, attendanceData: any) => {
    const response = await api.put(`/attendances/${id}`, attendanceData);
    return response.data;
  },

  bulkCreate: async (attendancesData: any[]) => {
    const response = await api.post('/attendances/bulk', { attendances: attendancesData });
    return response.data;
  }
};

// Services messages
export const messageService = {
  getAll: async (params?: any) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  create: async (messageData: any) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }
};

// Services paiements
export const paymentService = {
  getAll: async (params?: any) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  create: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id: string, paymentData: any) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  }
};

export default api;