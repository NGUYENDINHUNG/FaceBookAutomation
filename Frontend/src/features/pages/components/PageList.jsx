import { useState, useEffect } from 'react';
import { pageService } from '../services/pageService';
import PageCard from './PageCard';
import Button from '../../../components/common/Button';
import { API_CONFIG, API_ENDPOINTS } from '../../../config/constan';

const PageList = ({ onRefresh }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const pagesData = await pageService.getUserPages();
      // Service đã trả về array pages, không cần xử lý thêm
      setPages(Array.isArray(pagesData) ? pagesData : []);
      setError(null);
      
      // Gọi onRefresh để cập nhật thống kê
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError('Không thể tải danh sách trang');
      console.error('Error fetching pages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchPages}>Thử lại</Button>
      </div>
    );
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          {/* Illustration */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Chưa kết nối Facebook Pages
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Kết nối Facebook pages để bắt đầu tạo và lên lịch đăng bài. 
            Bạn có thể quản lý nhiều trang từ một bảng điều khiển.
          </p>
          
          <Button 
            onClick={() => window.location.href = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.FACEBOOK_LOGIN}`}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Kết nối Facebook Page
          </Button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>✓ Kết nối OAuth bảo mật</p>
            <p>✓ Không lưu trữ dữ liệu cá nhân</p>
            <p>✓ Thu hồi quyền truy cập bất cứ lúc nào</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
    </div>
  );
};

export default PageList;