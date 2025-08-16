import { useState } from 'react';
import Button from '../../../components/common/Button';
import SchedulePostModal from './SchedulePostModal';
import { postService } from '../services/postService';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    if (!confirm('Bạn có chắc muốn đăng bài này ngay bây giờ?')) return;

    setLoading(true);
    try {
      const response = await postService.publishPost(post._id);
      if (response.status === 200) {
        alert('Đăng bài thành công!');
        onUpdate && onUpdate();
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng bài');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    setLoading(true);
    try {
      const response = await postService.deletePost(post._id);
      if (response.status === 200) {
        alert('Xóa bài viết thành công!');
        onDelete && onDelete(post._id);
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết');
    } finally {
      setLoading(false);
    }
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
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {post.pageId?.pageName || post.pageName}
              </h3>
              <p className="text-sm text-gray-500">
                Tạo: {formatDateTime(post.createdAt)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.media.length} ảnh đính kèm
            </div>
          </div>
        )}

        {/* Schedule Info */}
        {isScheduled && post.scheduledTime && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Sẽ đăng vào: {formatDateTime(post.scheduledTime)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {/* Schedule Button */}
            {!isPublished && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowScheduleModal(true)}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isScheduled ? 'Đổi lịch' : 'Lên lịch'}
              </Button>
            )}

            {/* Publish Now Button */}
            {!isPublished && (
              <Button
                size="sm"
                onClick={handlePublishNow}
                loading={loading}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Đăng ngay
              </Button>
            )}
          </div>

          {/* Delete Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa
          </Button>
        </div>
      </div>

      {/* Schedule Modal */}
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        post={post}
        onSuccess={() => {
          setShowScheduleModal(false);
          onUpdate && onUpdate();
        }}
      />
    </>
  );
};

export default PostCard;
