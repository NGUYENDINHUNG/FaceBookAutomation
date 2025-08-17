// src/features/posts/components/PostForm.jsx
import { useState } from 'react';
import Button from '../../../components/common/Button';
import { postService } from '../services/postService';
import { showToast } from '../../../utils/toastHelpers';

const PostForm = ({ pageInfo, postData, isEditing = false, onSuccess }) => {
  const [content, setContent] = useState(postData?.content || '');
  const [privacy, setPrivacy] = useState(postData?.privacy || 'EVERYONE');
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState(
    postData?.media?.map(media => ({
      url: media.url,
      name: media.filename || 'existing-image',
      isExisting: true
    })) || []
  );
  const [loading, setLoading] = useState(false);
  const [isScheduled, setIsScheduled] = useState(postData?.status === 'scheduled');
  const [scheduledTime, setScheduledTime] = useState(
    postData?.scheduledTime ? new Date(postData.scheduledTime).toISOString().slice(0, 16) : ''
  );

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      showToast.error('Chỉ chấp nhận file ảnh dưới 5MB', '⚠️');
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          file: file,
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Nếu xóa file mới, cập nhật selectedImages
    if (previews[index]?.file) {
      const newImageIndex = previews.slice(0, index).filter(p => p.file).length;
      setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
  };

  // Giữ nguyên hàm format text
  const formatText = (type) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = '';
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link': {
        const url = prompt('Nhập URL:');
        if (url) formattedText = `[${selectedText || 'link text'}](${url})`;
        break;
      }
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  // Flow: Tạo post trước, lên lịch sau
  const handleSubmit = async (action = 'publish') => {
    // Validate content - cho phép đăng bài khi có text hoặc ảnh
    if (!content.trim() && previews.length === 0) {
      showToast.error('Vui lòng nhập nội dung bài viết hoặc thêm ảnh');
      return;
    }

    // Validate pageInfo
    if (!pageInfo || !pageInfo.pageId) {
      showToast.error('Không tìm thấy thông tin page. Vui lòng thử lại.');
      return;
    }

    if (action === 'schedule' && !scheduledTime) {
      showToast.error('Vui lòng chọn thời gian lên lịch');
      return;
    }

    // Validate thời gian lên lịch
    if (action === 'schedule' && new Date(scheduledTime) <= new Date()) {
      showToast.error('Thời gian lên lịch phải ở tương lai',);
      return;
    }

    setLoading(true);

    try {
      let postId;
      let createResult;

      if (isEditing) {
        // EDITING MODE: Update existing post
        postId = postData._id; // Gán postId từ postData hiện tại
        
        const formData = new FormData();
        formData.append('content', content);
        formData.append('privacy', privacy);
        
        // Gửi thông tin về media hiện tại (sau khi xóa ảnh)
        const currentMedia = previews
          .filter(preview => preview.isExisting)
          .map(preview => ({
            type: 'image',
            url: preview.url
          }));
        formData.append('media', JSON.stringify(currentMedia));
        
        // Gửi file mới
        selectedImages.forEach(image => {
          formData.append('media', image);
        });

        createResult = await postService.updatePost(postId, formData);
      } else {
        // CREATE MODE: Create new post
        console.log('PageInfo being sent:', pageInfo);
        console.log('PageId being sent:', pageInfo.pageId);
        
        const formData = new FormData();
        formData.append('pageId', pageInfo.pageId);
        formData.append('content', content);
        formData.append('privacy', privacy);
        formData.append('status', 'draft'); // Always create as draft first

        // Thêm files
        previews.forEach(preview => {
          if (preview.file) {
            formData.append('media', preview.file);
          }
        });

        createResult = await postService.createPost(formData);

        if (createResult.status !== 200) {
          showToast.error(createResult.message || 'Có lỗi khi tạo bài viết');
          return;
        }

        postId = createResult.data._id;
      }

      // STEP 2: Xử lý theo action
      let finalResult = createResult;
      let message = '';

      if (action === 'schedule') {
        // Lên lịch đăng bài
        const scheduleResult = await postService.schedulePost(
          postId,
          new Date(scheduledTime).toISOString()
        );

        if (scheduleResult.status === 200) {
          finalResult = scheduleResult;
          message = isEditing ? 'Đã cập nhật và lên lịch đăng bài thành công!' : 'Đã lên lịch đăng bài thành công!';
        } else {
          showToast.error(scheduleResult.message || 'Có lỗi khi lên lịch');
          return;
        }
      } else if (action === 'publish') {
        // Đăng ngay
        const publishResult = await postService.publishPost(postId);

        if (publishResult.status === 200) {
          finalResult = publishResult;
          message = isEditing ? 'Đã cập nhật và đăng bài thành công!' : 'Đăng bài thành công!';
        } else {
          showToast.error(publishResult.message || 'Có lỗi khi đăng bài');
          return;
        }
      } else {
        // Draft - đã tạo rồi
        message = isEditing ? 'Đã cập nhật bản nháp thành công!' : 'Đã lưu bản nháp thành công!';
      }

      // Show success toast with appropriate icon
      if (action === 'publish') {
        showToast.publish(message);
      } else if (action === 'schedule') {
        showToast.schedule(message);
      } else {
        showToast.save(message);
      }

      // Reset form
      resetForm();
      onSuccess && onSuccess(finalResult.data);

    } catch (error) {
      console.error('Error processing post:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý bài viết';
      showToast.error(errorMessage, '❌');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setPrivacy('EVERYONE');
    setSelectedImages([]);
    setPreviews([]);
    setIsScheduled(false);
    setScheduledTime('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Page Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-0.5">
              <img
                src={pageInfo.pageImage}
                alt={pageInfo.pageName}
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900">{pageInfo.pageName}</h3>
            <p className="text-sm text-gray-600">Đăng bài với tư cách page này</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Text Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung bài viết
          </label>

          <div className="border border-gray-200 rounded-t-xl p-3 bg-gray-50 flex space-x-2">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => formatText('link')}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              title="Link"
            >
              🔗
            </button>
          </div>

          <textarea
            id="content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì? Chia sẻ nội dung thú vị với khán giả..."
            className="w-full p-4 border-l border-r border-b border-gray-200 rounded-b-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
            rows={6}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thêm ảnh
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 mb-1">Click để chọn ảnh</span>
              <span className="text-xs text-gray-500">Hỗ trợ: JPG, PNG, GIF (Max 5MB mỗi ảnh)</span>
            </label>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="text-xs text-gray-500 mt-2 truncate font-medium">
                    {preview.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Settings - Phần mới thêm */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Lên lịch đăng bài</span>
            </label>

            {isScheduled && (
              <div className="flex-1">
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={(() => {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() + 5);
                    return now.toISOString().slice(0, 16);
                  })()}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thời gian tối thiểu: 5 phút từ bây giờ
                </p>
              </div>
            )}
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex justify-between items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            Hủy
          </Button>

          <div className="flex space-x-3">
            {/* Save Draft */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit('draft')}
              loading={loading}
              disabled={(!content.trim() && previews.length === 0) || loading}
              className="text-gray-700 border-gray-300"
            >
              {isEditing ? 'Cập nhật nháp' : 'Lưu nháp'}
            </Button>

            {/* Schedule Post */}
            {isScheduled && scheduledTime && (
              <Button
                type="button"
                onClick={() => handleSubmit('schedule')}
                loading={loading}
                disabled={(!content.trim() && previews.length === 0) || !scheduledTime || loading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Lên lịch đăng
              </Button>
            )}

            {/* Publish Now */}
            {!isScheduled && (
              <Button
                type="button"
                onClick={() => handleSubmit('publish')}
                loading={loading}
                disabled={(!content.trim() && previews.length === 0) || loading}
              >
                {isEditing ? 'Cập nhật và đăng' : 'Đăng ngay'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;