import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS, ROUTES } from '../../../config/constan';
import { parseJwt } from '../../../utils/tokenUtils';

export const useAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = () => {
      // Get URL parameters
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      
      if (accessToken) {
        // Remove #_=_ from token if exists
        const cleanToken = accessToken.split('#')[0];
        
        // Save token
        localStorage.setItem(STORAGE_KEYS.TOKEN, cleanToken);
        
        // Parse user data from token
        try {
          const userData = parseJwt(cleanToken);
          if (userData) {
            const user = {
              id: userData._id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar,
              token: cleanToken
            };
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          }
        } catch (error) {
          console.error('Error parsing token in callback:', error);
        }
        
        // Force page reload to update AuthProvider
        window.location.href = ROUTES.PAGES;
      }
    };

    handleAuthCallback();
  }, [location, navigate]);
};
