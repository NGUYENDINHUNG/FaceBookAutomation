import toast from 'react-hot-toast';

export const toastPromise = async (promise, options = {}) => {
  const {
    loading: loadingText = 'Đang xử lý...',
    success: successText = 'Thành công!',
    error: errorText = 'Có lỗi xảy ra!',
    successIcon = '✅',
    errorIcon = '❌',
    loadingIcon = '⏳'
  } = options;

  // Show loading toast
  const loadingToast = toast.loading(loadingText, {
    icon: loadingIcon,
  });

  try {
    const result = await promise;
    
    // Dismiss loading and show success
    toast.dismiss(loadingToast);
    toast.success(
      typeof successText === 'function' ? successText(result) : successText,
      { 
        icon: successIcon,
        duration: 3000,
      }
    );
    
    return result;
  } catch (error) {
    // Dismiss loading and show error
    toast.dismiss(loadingToast);
    toast.error(
      typeof errorText === 'function' ? errorText(error) : (error.response?.data?.message || errorText),
      { 
        icon: errorIcon,
        duration: 4000,
      }
    );
    
    throw error; // Re-throw để caller có thể handle
  }
};

export const showToast = {
  success: (message, icon = '✅') => toast.success(message, { icon }),
  error: (message, icon = '❌') => toast.error(message, { icon }),
  loading: (message, icon = '⏳') => toast.loading(message, { icon }),
  
  // Specific actions
  publish: (message = 'Đăng bài thành công!') => toast.success(message, { icon: '🚀' }),
  delete: (message = 'Xóa thành công!') => toast.success(message, { icon: '🗑️' }),
  schedule: (message = 'Lên lịch thành công!') => toast.success(message, { icon: '⏰' }),
  cancel: (message = 'Hủy thành công!') => toast.success(message, { icon: '❌' }),
  save: (message = 'Lưu thành công!') => toast.success(message, { icon: '💾' }),
  update: (message = 'Cập nhật thành công!') => toast.success(message, { icon: '✏️' }),
};
