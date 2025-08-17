import { useCallback } from 'react';
import { authService } from '../index';
import { showToast } from '../../../utils/toastHelpers';

export const useRefreshToken = () => {
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      
      if (response.EC === 0 && response.accessToken) {
        // Lưu token mới
        localStorage.setItem('token', response.accessToken);
        
        // Parse user info từ token mới
        try {
          const base64Url = response.accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const userData = JSON.parse(jsonPayload);
          const user = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            token: response.accessToken
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          return { success: true, user, token: response.accessToken };
        } catch (parseError) {
          console.error('Error parsing new token:', parseError);
          return { success: false, error: 'Invalid token format' };
        }
      } else {
        return { success: false, error: response.EM || 'Refresh token failed' };
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false, error: error.message || 'Refresh token failed' };
    }
  }, []);

  return { refreshToken };
};
