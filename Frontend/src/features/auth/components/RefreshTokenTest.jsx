import { useState } from 'react';
import { authService } from '../index';
import { showToast } from '../../../utils/toastHelpers';
import Button from '../../../components/common/Button';

const RefreshTokenTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRefreshToken = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await authService.refreshToken();
      setResult(response);
      
      if (response.EC === 0) {
        showToast.success('Refresh token thành công!');
      } else {
        showToast.error(response.EM || 'Refresh token thất bại');
      }
    } catch (error) {
      console.error('Refresh token test error:', error);
      setResult({ error: error.message });
      showToast.error('Refresh token thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Test Refresh Token</h3>
      
      <Button
        onClick={handleRefreshToken}
        loading={loading}
        className="mb-4"
      >
        Test Refresh Token
      </Button>

      {result && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Kết quả:</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RefreshTokenTest;
