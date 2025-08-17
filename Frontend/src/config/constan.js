// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    FACEBOOK_LOGIN: "/api/auth/facebook",
    FACEBOOK_CALLBACK: "/api/auth/facebook/callback",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    LOGOUT: "/api/auth/logout",
    GET_ME: "/api/auth/me",
  },
  PAGES: {
    GET_USER_PAGES: "/api/page/user-pages",
    GET_LOCAL_PAGES: "/api/page/local-user-pages",
  },
  POSTS: {
    CREATE: "/api/post/create-post",
    GET_ALL: "/api/post/get-all-posts",
    GET_BY_ID: "/api/post/get-post-by-id",
    UPDATE: "/api/post/update-post",
    DELETE: "/api/post/delete-post",
    SCHEDULE: "/api/post/schedule-post",
    PUBLISH: "/api/post/publish-to-facebook",
  },
};

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PAGES: "/pages",
  POSTS: "/posts",
  CREATE_POST: "/create-post",
  EDIT_POST: "/edit-post",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
};

// API Config - Sử dụng environment variables
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Common constants - Sử dụng environment variables
export const PAGE_SIZES = {
  DEFAULT: parseInt(import.meta.env.VITE_PAGE_SIZE_DEFAULT) || 10,
  LARGE: parseInt(import.meta.env.VITE_PAGE_SIZE_LARGE) || 20,
  SMALL: parseInt(import.meta.env.VITE_PAGE_SIZE_SMALL) || 5,
};
