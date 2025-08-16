// constants/apiError.js
export const APIError = {
  AUTH: {
    TOKEN_MISSING: {
      status: 401,
      message: "Vui lòng đăng nhập để truy cập",
    },
    TOKEN_INVALID: {
      status: 401,
      message: "Token không hợp lệ",
    },
    TOKEN_EXPIRED: {
      status: 401,
      message: "Token đã hết hạn, vui lòng đăng nhập lại",
    },
    USER_NOT_FOUND: {
      status: 404,
      message: "Không tìm thấy người dùng",
    },
  },
  USER: {
    NOT_FOUND: {
      status: 404,
      message: "Không tìm thấy người dùng",
    },
    INVALID_INPUT: {
      status: 400,
      message: "Dữ liệu không hợp lệ",
    },
  },
  PAGE: {
    NOT_FOUND: {
      status: 404,
      message: "Không tìm thấy trang",
    },
    PERMISSION_DENIED: {
      status: 403,
      message: "Không có quyền truy cập trang này",
    },
  },
  POST: {
    CREATE_FAILED: {
      status: 500,
      message: "Tạo bài đăng thất bại",
    },
  },
  SERVER: {
    INTERNAL_ERROR: {
      status: 500,
      message: "Lỗi server",
    },
  },
};
