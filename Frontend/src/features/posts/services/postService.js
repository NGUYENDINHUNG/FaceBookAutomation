import api from "@config/api";
import { API_ENDPOINTS } from "@config/constan";

export const postService = {
  createPost: async (formData) => {
    const response = await api.post(API_ENDPOINTS.POSTS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getPosts: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.POSTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error("Get posts error:", error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.POSTS.GET_BY_ID}/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Get post by ID error:", error);
      throw error;
    }
  },

  schedulePost: async (postId, scheduledTime) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.POSTS.SCHEDULE}/${postId}`, {
        scheduledTime: scheduledTime
      });
      return response.data;
    } catch (error) {
      console.error("Schedule post error:", error);
      throw error;
    }
  },

  updatePost: async (postId, updateData) => {
    try {
      const headers = {};
      
      if (updateData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      const response = await api.put(`${API_ENDPOINTS.POSTS.UPDATE}/${postId}`, updateData, { headers });
      return response.data;
    } catch (error) {
      console.error("Update post error:", error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.POSTS.DELETE}/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Delete post error:", error);
      throw error;
    }
  },

  publishPost: async (postId) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.POSTS.PUBLISH}/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Publish post error:", error);
      throw error;
    }
  },

  // Lấy danh sách posts đã lên lịch
  getScheduledPosts: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.POSTS.GET_ALL, {
        params: { status: 'scheduled' },
      });
      return response.data;
    } catch (error) {
      console.error("Get scheduled posts error:", error);
      throw error;
    }
  },
};
