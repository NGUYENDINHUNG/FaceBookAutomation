import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth, useAuthCallback } from '../features/auth';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useAuthCallback();

  const handleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Chào mừng đến với{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Metaconnex
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Nền tảng quản lý Facebook pages và tạo nội dung chuyên nghiệp, dễ dàng và hiệu quả
              </p>
            </div>

            {/* CTA Section */}
            <div className="mb-16">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <Button
                    onClick={() => navigate('/pages')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Đến trang của tôi
                  </Button>
                  <p className="text-gray-600 max-w-md mx-auto">
                   Bắt đầu tạo nội dung tuyệt vời cho Facebook pages của bạn
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Kết nối với Facebook
                  </Button>
                  <p className="text-gray-600 max-w-md mx-auto">
                     Kết nối bảo mật OAuth • Không lưu trữ dữ liệu cá nhân
                  </p>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600">Trang đã kết nối</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">10K+</div>
                <div className="text-gray-600">Bài viết đã tạo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">99.9%</div>
                <div className="text-gray-600">Thời gian hoạt động</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-gray-600">Hỗ trợ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tính năng mạnh mẽ cho nhà sáng tạo nội dung
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mọi thứ bạn cần để quản lý sự hiện diện Facebook hiệu quả và chuyên nghiệp
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    Quản lý trang
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Tập trung tất cả Facebook pages của bạn trong một bảng điều khiển trực quan. Chuyển đổi giữa các trang một cách mượt mà và quản lý nhiều thương hiệu một cách dễ dàng.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>Tìm hiểu thêm</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    Lên lịch thông minh
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Lên lịch đăng bài vào thời điểm tương tác tối ưu. Lập kế hoạch lịch nội dung trước nhiều tuần và duy trì lịch đăng bài nhất quán.
                  </p>
                  <div className="flex items-center text-green-600 font-medium">
                    <span>Tìm hiểu thêm</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    Phân tích & Thống kê
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Theo dõi các chỉ số hiệu suất, tỷ lệ tương tác và thông tin khán giả. Đưa ra quyết định dựa trên dữ liệu để tối ưu hóa chiến lược nội dung.
                  </p>
                  <div className="flex items-center text-purple-600 font-medium">
                    <span>Tìm hiểu thêm</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sẵn sàng biến đổi chiến lược Facebook của bạn?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn nhà sáng tạo nội dung tin tưởng Metaconnex để quản lý sự hiện diện Facebook
            </p>

            {!isAuthenticated && (
              <Button
                onClick={handleLogin}
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Bắt đầu miễn phí
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Metaconnex
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Trao quyền cho các nhà sáng tạo xây dựng kết nối có ý nghĩa trên Facebook
            </p>
            <div className="flex items-center justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách bảo mật</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản dịch vụ</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Hỗ trợ</a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Metaconnex. Tất cả quyền được bảo lưu.
            </p>
          </div> 
        </footer>

      </div>
    </div>
  );
};

export default Home;