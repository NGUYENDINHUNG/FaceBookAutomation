import axios from 'axios';
import { API_CONFIG } from './constan';
import { authService } from '../features/auth';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true // Để gửi cookies cho refresh token
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Thử refresh token
                const response = await authService.refreshToken();
                
                if (response.EC === 0 && response.accessToken) {
                    // Lưu token mới
                    localStorage.setItem('token', response.accessToken);
                    
                    // Retry request ban đầu với token mới
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                    return api(originalRequest);
                } else {
                    // Refresh token thất bại, redirect về login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }
            } catch (refreshError) {
                console.log('««««« refreshError »»»»»', refreshError);
                // Refresh token thất bại, redirect về login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;