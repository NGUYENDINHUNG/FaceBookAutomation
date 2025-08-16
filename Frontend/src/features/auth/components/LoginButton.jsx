import Button from '@components/common/Button';
import { API_ENDPOINTS } from '@config/constan';
import { API_CONFIG } from '../../../config/constan';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.FACEBOOK_LOGIN}`;
  };

  return (
    <Button onClick={handleLogin}>
      Login with Facebook
    </Button>
  );
};

export default LoginButton;
