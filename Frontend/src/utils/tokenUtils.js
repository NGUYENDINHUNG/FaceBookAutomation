// Utility functions để xử lý JWT tokens

export const parseJwt = (token) => {
  try {
    // Xóa tất cả console.log
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const result = JSON.parse(jsonPayload);
    return result;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpirationTime = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

export const getTimeUntilExpiration = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return 0;
  }
  
  const currentTime = new Date();
  return Math.max(0, expirationTime.getTime() - currentTime.getTime());
};

export const shouldRefreshToken = (token, bufferMinutes = 5) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  const bufferMs = bufferMinutes * 60 * 1000;
  
  return timeUntilExpiration <= bufferMs;
};
