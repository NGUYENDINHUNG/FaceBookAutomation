import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../../../config/constan';
import { authService } from '../index';
import { useRefreshToken } from '../hooks/useRefreshToken';
import { parseJwt } from '../../../utils/tokenUtils';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshToken } = useRefreshToken();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);


      if (token && savedUser) {
        try {
          // Thử load user từ localStorage trước (fast path)
          const user = JSON.parse(savedUser);
          setUser(user);
          setLoading(false);

          // Sau đó kiểm tra token có expired không (background check)
          const userData = parseJwt(token);
          if (userData && userData.exp) {
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = userData.exp - currentTime;

            // Nếu token sắp hết hạn (trong vòng 5 phút), refresh
            if (timeUntilExpiry < 300) {
              console.log('Token expiring soon, refreshing in background');
              try {
                const refreshResult = await refreshToken();
                if (refreshResult.success) {
                  setUser(refreshResult.user);
                }
              } catch (refreshError) {
                console.error('Background refresh failed:', refreshError);
              }
            }
          }

          return;
        } catch (error) {
          console.log('Error loading user from localStorage:', error);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }

      if (token) {
        // Fallback: parse token manually
        try {
          const userData = parseJwt(token);
          console.log('Parsed user data:', userData);

          if (!userData) {
            console.log('Failed to parse token, removing from storage');
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setLoading(false);
            return;
          }

          // Kiểm tra token có expired không
          const currentTime = Date.now() / 1000;
          if (userData.exp && userData.exp < currentTime) {
            console.log('Token expired, attempting refresh');
            try {
              const refreshResult = await refreshToken();
              if (refreshResult.success) {
                setUser(refreshResult.user);
                setLoading(false);
                return;
              } else {
                console.log('Refresh token failed, removing from storage');
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                setLoading(false);
                return;
              }
            } catch (refreshError) {
              console.error('Refresh token error:', refreshError);
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER);
              setLoading(false);
              return;
            }
          }

          const user = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            token
          };
          setUser(user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
          console.error('Error parsing token:', error);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [refreshToken]);

  const login = async () => {
    await authService.loginWithFacebook();
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn logout local nếu API call thất bại
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshToken,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
