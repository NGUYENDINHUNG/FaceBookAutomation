import { useState, useEffect } from 'react';
import { parseJwt, isTokenExpired } from '../../../utils/tokenUtils';
import { STORAGE_KEYS } from '../../../config/constan';

const TokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      const parsed = parseJwt(token);
      const expired = isTokenExpired(token);
      
      setTokenInfo({
        token: token.substring(0, 50) + '...',
        parsed,
        expired,
        currentTime: Date.now() / 1000,
        expirationTime: parsed?.exp
      });
    }
  }, []);

  if (!tokenInfo) {
    return <div>No token found</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Token Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Token:</strong> {tokenInfo.token}</div>
        <div><strong>Expired:</strong> {tokenInfo.expired ? 'Yes' : 'No'}</div>
        <div><strong>Current Time:</strong> {tokenInfo.currentTime}</div>
        <div><strong>Expiration Time:</strong> {tokenInfo.expirationTime}</div>
        
        <div className="mt-4">
          <strong>Parsed Data:</strong>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(tokenInfo.parsed, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TokenDebug;
