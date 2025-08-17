import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { postService } from '../services/postService';
import { showToast } from '../../../utils/toastHelpers'; // Thêm import

const SchedulePostModal = ({ isOpen, onClose, post, onSuccess }) => {
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Tính thời gian tối thiểu (5 phút từ bây giờ)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const handleSchedule = async () => {
    if (!scheduledTime) {
      showToast.error('Vui lòng chọn thời gian lên lịch'); // Thay alert
      return;
    }

    const selectedDate = new Date(scheduledTime);
    const now = new Date();
    
    if (selectedDate <= now) {
      showToast.error('Thời gian lên lịch phải ở tương lai'); // Thay alert
      return;
    }

    setLoading(true);

    try {
      const response = await postService.schedulePost(
        post._id, 
        selectedDate.toISOString()
      );

      if (response.status === 200) {
        showToast.schedule('Lên lịch đăng bài thành công!'); // Thay alert
        onSuccess && onSuccess(response.data);
        onClose();
        setScheduledTime('');
      } else {
        showToast.error(response.message || 'Có lỗi xảy ra khi lên lịch'); // Thay alert
      }
    } catch (error) {
      console.error('Schedule error:', error);
      showToast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lên lịch đăng bài'); // Thay alert
    } finally {
      setLoading(false);
    }
  };

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

  const handleClose = () => {
    setScheduledTime('');
    onClose();
  };

  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Lên lịch đăng bài" hideFooter={true}>
      <div className="space-y-6">
        {/* Post Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Nội dung bài viết:</h3>
          <div className="bg-white p-3 rounded border">
            <div className="flex items-center mb-2">
              <img
                src={post.pageId?.pageImage || '/default-avatar.png'}
                alt={post.pageId?.pageName || 'Page'}
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="font-medium text-sm">
                {post.pageId?.pageName || post.pageName || 'Unknown Page'}
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {post.content}
            </p>
            {post.media && post.media.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                📷 {post.media.length} ảnh đính kèm
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-blue-900">
              Trạng thái hiện tại: 
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              post.status === 'scheduled' 
                ? 'bg-yellow-100 text-yellow-800'
                : post.status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {post.status === 'scheduled' ? 'Đã lên lịch' 
               : post.status === 'published' ? 'Đã đăng'
               : 'Bản nháp'}
            </span>
          </div>
          {post.scheduledTime && (
            <div className="text-sm text-blue-700">
              Lịch hiện tại: {formatDateTime(post.scheduledTime)}
            </div>
          )}
        </div>

        {/* Schedule Time Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thời gian đăng bài
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            min={getMinDateTime()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            * Thời gian tối thiểu là 5 phút từ bây giờ
          </p>
        </div>

        {/* Preview Selected Time */}
        {scheduledTime && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Bài viết sẽ được đăng vào:</span>
              <br />
              {formatDateTime(scheduledTime)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSchedule}
            loading={loading}
            disabled={!scheduledTime || loading}
          >
            {loading ? 'Đang lên lịch...' : 'Lên lịch đăng'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SchedulePostModal;
