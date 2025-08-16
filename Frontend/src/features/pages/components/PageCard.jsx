import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../posts/services/postService';
import Button from '../../../components/common/Button';

const PageCard = ({ page }) => {
  const navigate = useNavigate();
  const [pageStats, setPageStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchPageStats();
  }, [page.id]);

  const fetchPageStats = async () => {
    try {
      setLoadingStats(true);
      const postsResponse = await postService.getPosts({ pageId: page.id });
      
      let totalPosts = 0;
      let scheduledPosts = 0;
      
      if (postsResponse?.data?.result) {
        const posts = postsResponse.data.result;
        totalPosts = posts.length;
        scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
      } else if (postsResponse?.result) {
        const posts = postsResponse.result;
        totalPosts = posts.length;
        scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
      }
      
      setPageStats({
        totalPosts,
        scheduledPosts
      });
    } catch (error) {
      console.error('Error fetching page stats:', error);
      setPageStats({
        totalPosts: 0,
        scheduledPosts: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreatePost = () => {
    navigate('/create-post', {
      state: {
        _id: page.id,
        pageName: page.pageName,
        pageId: page.pageId,
        pageImage: page.pageImage
      }
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-6">
          {/* Page Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-0.5 shadow-sm">
              {page.pageImage ? (
                <img
                  src={page.pageImage}
                  alt={page.pageName}
                  className="w-full h-full rounded-2xl object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm">
              <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Page Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {page.pageName}
            </h3>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                ID: {page.pageId?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mx-auto"></div>
              ) : (
                pageStats.totalPosts
              )}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Bài viết</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent mx-auto"></div>
              ) : (
                pageStats.scheduledPosts
              )}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Đã lên lịch</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleCreatePost}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo bài viết
          </Button>

          <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
        <div className="w-full h-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full" />
      </div>
    </div>
  );
};

PageCard.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.string.isRequired,        // MongoDB ObjectId
    pageId: PropTypes.string.isRequired,    // Facebook Page ID
    pageName: PropTypes.string.isRequired,
    pageImage: PropTypes.string
  }).isRequired
};

export default PageCard;