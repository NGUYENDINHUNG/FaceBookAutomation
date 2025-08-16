import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = ({ 
    title = 'Xác nhận', 
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning' // warning, danger, info
  }) => {
    return new Promise((resolve) => {
      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        type
      });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise(false);
  };

  const ConfirmModal = () => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
      switch (config.type) {
        case 'danger':
          return {
            icon: '⚠️',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700',
          };
        case 'info':
          return {
            icon: 'ℹ️',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
          };
        default: // warning
          return {
            icon: '⚠️',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          };
      }
    };

    const styles = getTypeStyles();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-96 max-w-md mx-4 shadow-2xl">
          {/* Icon */}
          <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-2xl">{styles.icon}</span>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {config.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              {config.cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-xl transition-colors font-medium ${styles.confirmBg}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmModal };
};
