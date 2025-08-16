import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { ROUTES } from '../../../config/constan';
import { useConfirm } from '../../../hooks/useConfirm';
import { toastPromise } from '../../../utils/toastHelpers';

// Component Countdown Timer
const CountdownTimer = ({ scheduledTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledTime).getTime();
      const difference = scheduled - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [scheduledTime]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 5;
  const isVeryUrgent = timeLeft.hours === 0 && timeLeft.minutes < 1;
  
  let timeString = '';
  if (timeLeft.hours > 0) {
    timeString = `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  } else {
    timeString = `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className={`flex items-center space-x-1 text-xs font-medium ${
      isVeryUrgent ? 'text-red-600 animate-pulse' : 
      isUrgent ? 'text-red-600' : 'text-yellow-600'
    }`}>
      <svg className={`w-3 h-3 ${isVeryUrgent ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={isVeryUrgent ? 'animate-pulse' : ''}>
        {isUrgent ? `Còn ${timeString} sẽ đăng` : `Đăng sau ${timeString}`}
      </span>
    </div>
  );
};

const PostList = ({ onStatsChange }) => {
  const navigate = useNavigate();
  const { confirm, ConfirmModal } = useConfirm();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ draft: 0, scheduled: 0, published: 0 });
  const [actionLoading, setActionLoading] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        currentPage,
        limit: 10,
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await postService.getPosts(params);
      
      // Kiểm tra và xử lý dữ liệu trả về
      if (response?.data?.result) {
        setPosts(response.data.result);
        setTotalPages(response.data.meta?.pages || 1);
        
        // Cập nhật stats
        const newStats = {
          draft: response.data.result.filter(post => post.status === 'draft').length,
          scheduled: response.data.result.filter(post => post.status === 'scheduled').length,
          published: response.data.result.filter(post => post.status === 'published').length
        };
        setStats(newStats);
        onStatsChange && onStatsChange(newStats);
      } else if (response?.result) {
        setPosts(response.result);
        setTotalPages(response.meta?.pages || 1);
        
        // Cập nhật stats  
        const newStats = {
          draft: response.result.filter(post => post.status === 'draft').length,
          scheduled: response.result.filter(post => post.status === 'scheduled').length,
          published: response.result.filter(post => post.status === 'published').length
        };
        setStats(newStats);
        onStatsChange && onStatsChange(newStats);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, onStatsChange]);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, currentPage, fetchPosts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'scheduled': return 'Đã lên lịch';
      case 'published': return 'Đã đăng';
      default: return status;
    }
  };

  // Handler functions
  const handlePublishNow = async (postId) => {
    const confirmed = await confirm({
      title: 'Đăng bài ngay',
      message: 'Bạn có chắc muốn đăng bài này ngay bây giờ?',
      confirmText: 'Đăng ngay',
      cancelText: 'Hủy',
      type: 'info'
    });
    
    if (!confirmed) return;

    setActionLoading(prev => ({ ...prev, [postId]: 'publishing' }));
    
    try {
      await toastPromise(
        postService.publishPost(postId),
        {
          loading: 'Đang đăng bài...',
          success: 'Đăng bài thành công!',
          error: 'Có lỗi xảy ra khi đăng bài',
          successIcon: '🚀',
          loadingIcon: '📤'
        }
      );
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error('Publish error:', error);
      // Error được handle bởi toastPromise
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = await confirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger'
    });
    
    if (!confirmed) return;

    setActionLoading(prev => ({ ...prev, [postId]: 'deleting' }));
    
    try {
      await toastPromise(
        postService.deletePost(postId),
        {
          loading: 'Đang xóa bài viết...',
          success: 'Xóa bài viết thành công!',
          error: 'Có lỗi xảy ra khi xóa bài viết',
          successIcon: '🗑️',
          loadingIcon: '⏳'
        }
      );
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const handleSchedulePost = (postId) => {
    setSelectedPostId(postId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (scheduledTime) => {
    if (!selectedPostId) return;

    setActionLoading(prev => ({ ...prev, [selectedPostId]: 'scheduling' }));
    
    try {
      await toastPromise(
        postService.schedulePost(selectedPostId, scheduledTime),
        {
          loading: 'Đang lên lịch đăng bài...',
          success: 'Lên lịch đăng bài thành công!',
          error: 'Có lỗi xảy ra khi lên lịch',
          successIcon: '⏰',
          loadingIcon: '📅'
        }
      );
      setShowScheduleModal(false);
      setSelectedPostId(null);
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error('Schedule error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedPostId]: null }));
    }
  };

  const handleCancelSchedule = async (postId) => {
    const confirmed = await confirm({
      title: 'Hủy lịch đăng bài',
      message: 'Bạn có chắc muốn hủy lịch đăng bài này?',
      confirmText: 'Hủy lịch',
      cancelText: 'Không',
      type: 'warning'
    });
    
    if (!confirmed) return;

    setActionLoading(prev => ({ ...prev, [postId]: 'canceling' }));
    
    try {
      await toastPromise(
        postService.updatePost(postId, { 
          status: 'draft',
          scheduledTime: null 
        }),
        {
          loading: 'Đang hủy lịch đăng bài...',
          success: 'Hủy lịch thành công!',
          error: 'Có lỗi xảy ra khi hủy lịch',
          successIcon: '❌',
          loadingIcon: '⏳'
        }
      );
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error('Cancel schedule error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const handleEditPost = (postId) => {
    navigate(`${ROUTES.EDIT_POST}/${postId}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 mb-4">
        <div className="flex space-x-1">
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('all')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>Tất cả</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {stats.draft + stats.scheduled + stats.published}
              </span>
            </div>
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'draft'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('draft')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>Nháp</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === 'draft' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {stats.draft}
              </span>
            </div>
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('scheduled')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>Lên lịch</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                {stats.scheduled}
              </span>
            </div>
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'published'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('published')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>Đã đăng</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === 'published' ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-700'}`}>
                {stats.published}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có bài viết nào</h3>
          <p className="text-gray-500">Bắt đầu tạo bài viết mới ngay</p>
        </div>
      )}



      {/* Posts list */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {post.pageId?.pageImage ? (
                        <img 
                          src={post.pageId.pageImage} 
                          alt={post.pageId.pageName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {post.pageId?.pageName || 'Untitled Page'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                      {/* Countdown Timer cho bài viết đã lên lịch */}
                      {post.status === 'scheduled' && post.scheduledTime && (
                        <div className="mt-1">
                          <CountdownTimer scheduledTime={post.scheduledTime} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {/* Edit button - disabled for published posts */}
                      {post.status !== 'published' ? (
                        <button 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                          title="Chỉnh sửa"
                          onClick={() => handleEditPost(post._id)}
                          disabled={actionLoading[post._id]}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : (
                        <div 
                          className="p-1.5 text-gray-300 cursor-not-allowed" 
                          title="Không thể chỉnh sửa bài viết đã đăng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Delete button - disabled for published posts */}
                      {post.status !== 'published' ? (
                        <button 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" 
                          title="Xóa"
                          onClick={() => handleDeletePost(post._id)}
                          disabled={actionLoading[post._id]}
                        >
                          {actionLoading[post._id] === 'deleting' ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <div 
                          className="p-1.5 text-gray-300 cursor-not-allowed" 
                          title="Không thể xóa bài viết đã đăng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Media preview - compact */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3">
                    <div className="flex space-x-2 overflow-x-auto">
                      {post.media.slice(0, 3).map((media, index) => (
                        <div key={index} className="flex-shrink-0">
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                      {post.media.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{post.media.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer - compact */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {post.scheduledTime && (
                      <CountdownTimer scheduledTime={post.scheduledTime} />
                    )}
                    <span>ID: {post._id.slice(-6)}</span>
                  </div>
                  
                  {post.status === 'draft' && (
                    <div className="flex items-center space-x-2">
                      <button 
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        onClick={() => handlePublishNow(post._id)}
                        disabled={actionLoading[post._id]}
                      >
                        {actionLoading[post._id] === 'publishing' ? (
                          <>
                            <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Đang đăng...</span>
                          </>
                        ) : (
                          <span>Đăng ngay</span>
                        )}
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        onClick={() => handleSchedulePost(post._id)}
                        disabled={actionLoading[post._id]}
                      >
                        Lên lịch
                      </button>
                    </div>
                  )}
                  
                  {post.status === 'scheduled' && (
                    <div className="flex items-center space-x-2">
                      <button 
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        onClick={() => handlePublishNow(post._id)}
                        disabled={actionLoading[post._id]}
                      >
                        {actionLoading[post._id] === 'publishing' ? (
                          <>
                            <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Đang đăng...</span>
                          </>
                        ) : (
                          <span>Đăng ngay</span>
                        )}
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        onClick={() => handleCancelSchedule(post._id)}
                        disabled={actionLoading[post._id]}
                      >
                        {actionLoading[post._id] === 'canceling' ? (
                          <>
                            <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
                            <span>Đang hủy...</span>
                          </>
                        ) : (
                          <span>Hủy lịch</span>
                        )}
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Lên lịch đăng bài</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const scheduledTime = formData.get('scheduledTime');
              if (scheduledTime) {
                handleScheduleSubmit(new Date(scheduledTime).toISOString());
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn thời gian đăng bài
                </label>
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  required
                  min={(() => {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() + 5);
                    return now.toISOString().slice(0, 16);
                  })()}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thời gian tối thiểu: 5 phút từ bây giờ
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedPostId(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading[selectedPostId]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {actionLoading[selectedPostId] === 'scheduling' ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Đang lên lịch...</span>
                    </>
                  ) : (
                    <span>Lên lịch đăng</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal />
    </div>
  );
};

export default PostList;
