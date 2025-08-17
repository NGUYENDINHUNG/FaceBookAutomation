import TokenDebug from '../features/auth/components/TokenDebug';
import RefreshTokenTest from '../features/auth/components/RefreshTokenTest';
import { useAuth } from '../features/auth';

const Debug = () => {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Auth State</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="space-y-2 text-sm">
                <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                <div><strong>User:</strong></div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Token Debug</h2>
            <TokenDebug />
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Refresh Token Test</h2>
          <RefreshTokenTest />
        </div>
      </div>
    </div>
  );
};

export default Debug;
