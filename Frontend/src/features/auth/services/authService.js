import api from '../../../config/api';
import { API_ENDPOINTS, API_CONFIG } from '../../../config/constan';

export const authService = {
  loginWithFacebook: () => {
    window.location.href = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.FACEBOOK_LOGIN}`;
  },

  refreshToken: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        withCredentials: true // Để gửi cookies
      });
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.GET_ME);
      return response.data;
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  }
};