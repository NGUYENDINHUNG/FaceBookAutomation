import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { pageService } from '../features/pages/services/pageService';
import PostList from '../features/posts/components/PostList';

const Posts = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ draft: 0, scheduled: 0, published: 0 });
  const [pages, setPages] = useState([]);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPages();
    }
  }, [isAuthenticated]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const pagesData = await pageService.getUserPages();
      setPages(Array.isArray(pagesData) ? pagesData : []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleCreatePost = (page) => {
    setShowPageDropdown(false);
    navigate('/create-post', {
      state: {
        _id: page.id,
        pageName: page.pageName,
        pageId: page.pageId,
        pageImage: page.pageImage
      }
    });
  };

  const handleRefresh = () => {
    fetchPages();
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
                Quản lý bài viết
              </h1>
              <p className="text-gray-600">
                Quản lý nội dung và lên lịch đăng bài cho các trang Facebook của bạn
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={loadingPages}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className={`w-5 h-5 mr-2 ${loadingPages ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loadingPages ? 'Đang tải...' : 'Làm mới'}
              </button>

              {/* Dropdown Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowPageDropdown(!showPageDropdown)}
                  disabled={loadingPages || pages.length === 0}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo bài viết mới
                  <svg className={`w-4 h-4 ml-2 transition-transform ${showPageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showPageDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Chọn trang để tạo bài viết
                      </h3>
                      
                      {pages.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            Chưa có trang nào được kết nối
                          </p>
                          <button
                            onClick={() => {
                              setShowPageDropdown(false);
                              window.location.href = 'http://localhost:8000/api/auth/facebook';
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Kết nối trang ngay
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {pages.map((page) => (
                            <button
                              key={page.id}
                              onClick={() => handleCreatePost(page)}
                              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {page.pageImage ? (
                                  <img 
                                    src={page.pageImage} 
                                    alt={page.pageName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {page.pageName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {page.pageId?.slice(0, 12)}...
                                </p>
                              </div>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
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
                  <p className="text-sm font-medium text-gray-600">Đã lên lịch</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
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
                  <p className="text-sm font-medium text-gray-600">Đã đăng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <PostList onStatsChange={setStats} />
      </div>
    </div>
  );
};

export default Posts;
