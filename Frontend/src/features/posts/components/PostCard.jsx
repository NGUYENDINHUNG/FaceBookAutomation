import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import SchedulePostModal from './SchedulePostModal';
import { postService } from '../services/postService';
import { showToast } from '../../../utils/toastHelpers';
import { useConfirm } from '../../../hooks/useConfirm';
import { ROUTES } from '../../../config/constan';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();


  const formatShortTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'Đã đăng';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'draft':
        return 'Bản nháp';
      default:
        return 'Không xác định';
    }
  };

  const handlePublishNow = async () => {
    const confirmed = await confirm({
      title: 'Đăng bài ngay',
      message: 'Bạn có chắc muốn đăng bài này ngay bây giờ?',
      confirmText: 'Đăng ngay',
      cancelText: 'Hủy',
      type: 'info'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await postService.publishPost(post._id);
      if (response.status === 200) {
        showToast.publish('Đăng bài thành công!');
        onUpdate && onUpdate();
      } else {
        showToast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Publish error:', error);
      showToast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng bài');
    } finally {
      setLoading(false);
    }
  };

  // Function xử lý xóa với cảnh báo thông minh
  const handleDelete = async () => {
    let successMessage = '';
    let confirmTitle = '';
    let confirmMessage = '';

    // Xác định message dựa trên status
    if (post.status === 'published') {
      confirmTitle = 'Xóa bài viết đã đăng';
      confirmMessage = 'Bài viết này đã được đăng lên Facebook.\nBạn có chắc chắn muốn xóa bài viết này khỏi Facebook?';
      successMessage = 'Xóa bài viết thành công (cả từ Facebook)';
    } else if (post.status === 'scheduled') {
      confirmTitle = 'Xóa bài viết đã lên lịch';
      confirmMessage = 'Bài viết này đã được lên lịch đăng.\nBạn có chắc chắn muốn xóa bài viết này?';
      successMessage = 'Xóa bài viết thành công';
    } else {
      confirmTitle = 'Xóa bài viết';
      confirmMessage = 'Bạn có chắc chắn muốn xóa bài viết này?';
      successMessage = 'Xóa bài viết thành công';
    }

    const confirmed = await confirm({
      title: confirmTitle,
      message: confirmMessage,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await postService.deletePost(post._id);
      if (response.status === 200) {
        showToast.delete(successMessage);
        onDelete && onDelete(post._id);
      } else {
        showToast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Thêm function xử lý sửa bài viết
  const handleEditPost = () => {
    navigate(`${ROUTES.EDIT_POST}/${post._id}`);
  };

  const isScheduled = post.status === 'scheduled';
  const isPublished = post.status === 'published';

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.pageId?.pageImage || post.pageImage || '/default-avatar.png'}
              alt={post.pageId?.pageName || post.pageName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {post.pageId?.pageName || post.pageName}
              </h3>
              <p className="text-sm text-gray-500">
                {formatShortTime(post.createdAt)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </span>
        </div>

        {/* Content with Image */}
        <div className="mb-4">
          <div className="flex space-x-4">
            {/* Text Content */}
            <div className="flex-1">
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {post.content}
              </p>
            </div>

            {/* Image Preview - Small corner */}
            {post.media && post.media.length > 0 && (
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={post.media[0].url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', post.media[0].url);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback khi ảnh lỗi */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Overlay cho nhiều ảnh */}
                  {post.media.length > 1 && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">+{post.media.length - 1}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Info - Compact */}
        {isScheduled && post.scheduledTime && (
          <div className="mb-4 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Sẽ đăng: {formatShortTime(post.scheduledTime)}
              </span>
            </div>
          </div>
        )}

        {isPublished && post.publishedAt && (
          <div className="mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Đã đăng: {formatShortTime(post.publishedAt)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Edit Button */}
            <button
              onClick={handleEditPost}
              disabled={isPublished}
              className={`group relative p-2.5 rounded-lg border transition-all duration-200 ${isPublished
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                }`}
              title={isPublished ? 'Không thể sửa bài viết đã đăng' : 'Sửa bài viết'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Schedule Button */}
            {!isPublished && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {isScheduled ? 'Đổi lịch' : 'Lên lịch'}
                </span>
              </button>
            )}

            {/* Publish Button */}
            {!isPublished && (
              <button
                onClick={handlePublishNow}
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                    <span>Đang đăng...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Đăng ngay</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm">Xóa</span>
              </>
            )}
          </button>
        </div>
      </div>

      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        post={post}
        onSuccess={() => {
          setShowScheduleModal(false);
          onUpdate && onUpdate();
        }}
      />
      <ConfirmModal />
    </>
  );
};

export default PostCard;
