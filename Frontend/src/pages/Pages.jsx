import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { pageService } from '../features/pages/services/pageService';
import { postService } from '../features/posts/services/postService';
import PageList from '../features/pages/components/PageList';

const Pages = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    connectedPages: 0,
    totalPosts: 0,
    scheduledPosts: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Lấy danh sách pages
      const pages = await pageService.getUserPages();
      const connectedPages = Array.isArray(pages) ? pages.length : 0;
      
      // Lấy thống kê posts
      const postsResponse = await postService.getPosts();
      let totalPosts = 0;
      let scheduledPosts = 0;
      
      if (postsResponse?.data?.result) {
        const posts = postsResponse.data.result;
        totalPosts = posts.length;
        scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
      } else if (postsResponse?.result) {
        const posts = postsResponse.result;
        totalPosts = posts.length;
        scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
      }
      
      setStats({
        connectedPages,
        totalPosts,
        scheduledPosts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        connectedPages: 0,
        totalPosts: 0,
        scheduledPosts: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Facebook Pages của bạn
              </h1>
              <p className="text-gray-600">
                Quản lý và tạo nội dung cho các Facebook pages của bạn
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={loadingStats}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className={`w-5 h-5 mr-2 ${loadingStats ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loadingStats ? 'Đang tải...' : 'Làm mới'}
              </button>

              <button
                onClick={() => window.location.href = 'http://localhost:8000/api/auth/facebook'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Kết nối trang
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connected Pages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? (
                      <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                      stats.connectedPages
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? (
                      <div className="w-8 h-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                    ) : (
                      stats.totalPosts
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? (
                      <div className="w-8 h-8 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
                    ) : (
                      stats.scheduledPosts
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pages List */}
        <PageList onRefresh={fetchStats} />
      </div>
    </div>
  );
};

export default Pages;