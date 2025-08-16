import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PostForm from '../features/posts/components/PostForm';
import Button from '../components/common/Button';
import { postService } from '../features/posts/services/postService';

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postService.getPostById(postId);
        
        if (response.status === 200 && response.data) {
          setPost(response.data);
        } else {
          setError('Không tìm thấy bài viết');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handlePostUpdate = (postData) => {
    console.log('Post updated successfully:', postData);
    setTimeout(() => {
      navigate('/posts');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
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
              {error || 'Không tìm thấy bài viết'}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bài viết có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </p>
            
            <Button
              onClick={() => navigate('/posts')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách bài viết
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chỉnh sửa bài viết
            </h1>
            <p className="text-gray-600">
              Cập nhật nội dung cho Facebook page: <span className="font-medium">{post.pageId?.pageName}</span>
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/posts')}
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
        {post.status === 'published' ? (
          // Read-only view for published posts
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bài viết đã được đăng
              </h3>
              <p className="text-gray-600 mb-6">
                Bài viết này đã được đăng lên Facebook và không thể chỉnh sửa.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Nội dung bài viết:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                {post.media && post.media.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Media đính kèm:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {post.media.map((media, index) => (
                        <img
                          key={index}
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Editable form for draft and scheduled posts
          <PostForm
            pageInfo={{
              _id: post.pageId?._id,
              pageName: post.pageId?.pageName,
              pageId: post.pageId?.pageId,
              pageImage: post.pageId?.pageImage
            }}
            postData={post}
            isEditing={true}
            onSuccess={handlePostUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default EditPost;
