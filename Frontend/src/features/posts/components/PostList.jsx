import React, { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';
import { ROUTES } from '../../../config/constan';
import { toastPromise } from '../../../utils/toastHelpers';
import PostCard from './PostCard';
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
    <div className={`flex items-center space-x-1 text-xs font-medium ${isVeryUrgent ? 'text-red-600 animate-pulse' :
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 mb-4">
        <div className="flex space-x-1">
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
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
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'draft'
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
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'scheduled'
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
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'published'
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
            <PostCard
              key={post._id}
              post={post}
              onUpdate={fetchPosts}
              onDelete={(postId) => {
                setPosts(posts.filter(p => p._id !== postId));
                fetchPosts(); // Refresh để cập nhật stats
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded ${currentPage === index + 1
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


    </div>
  );
};

export default PostList;
