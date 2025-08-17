import { useLocation, useNavigate } from 'react-router-dom';
import PostForm from '../features/posts/components/PostForm';
import Button from '../components/common/Button';
import { ROUTES } from '../config/constan';
const CreatePost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = location.state;

  if (!pageInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            {/* Error Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Không tìm thấy thông tin page
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Vui lòng chọn một Facebook page từ danh sách để tạo bài viết mới.
            </p>

            <Button
              onClick={() => navigate('/pages')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách pages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handlePostSuccess = (postData) => {
    console.log('Post created successfully:', postData);
    setTimeout(() => {
      navigate(ROUTES.POSTS); // Sử dụng constant thay vì hardcode
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo bài viết mới
            </h1>
            <p className="text-gray-600">
              Tạo nội dung cho Facebook page: <span className="font-medium">{pageInfo.pageName}</span>
            </p>
          </div>

          <Button
            onClick={() => navigate('/pages')}
            variant="outline"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </Button>
        </div>
      </div>

      {/* Post Form */}
      <div className="max-w-4xl mx-auto">
        <PostForm
          pageInfo={pageInfo}
          onSuccess={handlePostSuccess}
        />
      </div>
    </div>
  );
};

export default CreatePost;