import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../config/constan';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug user state
  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);
  const dropdownRef = useRef(null);
  const isAuthenticated = localStorage.getItem('token');
  
  // Debug authentication
  useEffect(() => {
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('Token value:', localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          const response = await authService.getMe();
          console.log('User response:', response);
          console.log('User object:', response.user);
          setUser(response.user);
        } catch (error) {
          console.error('Error fetching user:', error);
          setError('Không thể tải thông tin người dùng');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const handleLogin = () => {
    authService.loginWithFacebook();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Metaconnex</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Trang chủ
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to={ROUTES.PAGES}
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Trang của tôi
                  </Link>
                  <Link 
                    to={ROUTES.POSTS}
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Quản lý bài viết
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {loading ? (
                  <div className="flex items-center space-x-3 border-l pl-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center space-x-3 border-l pl-4">
                    <div className="text-red-500 flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : user && (
                  <div className="flex items-center space-x-3 border-l pl-4 relative" ref={dropdownRef}>
                    <div 
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                        {user.avatar && user.avatar.trim() !== '' ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name || 'Avatar'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{user.name || 'Người dùng'}</span>
                      <svg 
                        className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <>
                        {/* Backdrop để đóng dropdown khi click outside */}
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-gray-100 z-50 transform transition-all duration-200 ease-out">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'Người dùng'}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email || 'Không có email'}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Hồ sơ</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Cài đặt</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                      </>
                    )}
                  </div>
                )}
                </>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Đăng nhập Facebook</span>
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

                {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {isAuthenticated && user && (
                                    <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {user.avatar && user.avatar.trim() !== '' ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'Avatar'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{user.name || 'Người dùng'}</span>
                  </div>
                )}

                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Trang chủ
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={ROUTES.PAGES}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Trang của tôi
                    </Link>
                    <Link
                      to={ROUTES.POSTS}
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Quản lý bài viết
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="w-full mt-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Đăng nhập Facebook</span>
                  </Button>
                )}
              </div>
            </div>
          )}
    </header>
  );
};

export default Header;