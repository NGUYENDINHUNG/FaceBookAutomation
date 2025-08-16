import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS, ROUTES } from '../../../config/constan';

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
        
        // Redirect to pages
        navigate(ROUTES.PAGES);
      }
    };

    handleAuthCallback();
  }, [location, navigate]);
};
