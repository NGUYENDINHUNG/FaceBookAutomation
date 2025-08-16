import api from "../../../config/api";
import { API_ENDPOINTS } from "../../../config/constan";

export const pageService = {
  getUserPages: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PAGES.GET_USER_PAGES);

      // Cập nhật theo cấu trúc response mới
      if (response.data && response.data.status === 200 && response.data.data) {
        return response.data.data.pages || [];
      }
      return [];
    } catch (error) {
      console.error("Get user pages error:", error);
      throw error;
    }
  },

  getLocalUserPages: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PAGES.GET_LOCAL_PAGES);

      // Cập nhật theo cấu trúc response mới
      if (response.data && response.data.status === 200 && response.data.data) {
        return response.data.data.pages || [];
      }
      return [];
    } catch (error) {
      console.error("Get local user pages error:", error);
      throw error;
    }
  },
};
