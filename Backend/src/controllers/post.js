import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getPostByIdService,
  publishToFacebookService,
  schedulePostService,
  updatePostService,
} from "../services/post.js";

export const createPost = async (req, res) => {
  try {
    let files = [];
    if (req.files && req.files.media) {
      if (!Array.isArray(req.files.media)) {
        files = [req.files.media];
      } else {
        files = req.files.media;
      }
    }

    const { pageId } = req.body;
    const content = req.body.content || "";

    // Validate input
    if (!pageId) {
      return res.status(400).json({
        status: 400,
        message: "Thiếu pageId",
        data: null,
      });
    }

    if (!files.length && !content.trim()) {
      return res.status(400).json({
        status: 400,
        message: "Vui lòng nhập nội dung hoặc đính kèm media",
        data: null,
      });
    }
    const result = await createPostService(req.user._id, {
      content,
      pageId,
      files,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Lỗi server khi tạo bài đăng",
      data: null,
    });
  }
};
export const updatePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const postData = req.body || {};

    if (req.files && req.files.media) {
      postData.files = Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media];
    }
    const result = await updatePostService(userId, postId, postData);

    return res.status(result.status).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Lỗi controller update post:", error);
    return res.status(500).json({
      status: 500,
      message: "Lỗi server khi xử lý cập nhật bài leo",
      error: error.message,
    });
  }
};
export const deletePostController = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await deletePostService(postId);
    return res.status(result.status).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Delete Post Controller Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Lỗi server khi xóa bài post",
      data: null,
      error: error.message,
    });
  }
};
export const schedulePost = async (req, res) => {
  try {
    const result = await schedulePostService(
      req.params.postId,
      req.body.scheduledTime
    );
    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Schedule Post Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Có lỗi xảy ra khi lên lịch đăng bài",
      data: null,
      error: error.message,
    });
  }
};
export const publishToFacebook = async (req, res) => {
  try {
    const result = await publishToFacebookService(req.params.postId);
    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Publish To Facebook Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Có lỗi xảy ra khi đăng bài lên Facebook",
      data: null,
      error: error.message,
    });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const currentPage = req.query.currentPage;
    const limit = req.query.limit;
    const result = await getAllPostsService(
      Number(currentPage),
      Number(limit),
      req.query
    );

    return res.json({
      status: 200,
      message: "Lấy danh sách bài đăng thành công",
      data: result,
    });
  } catch (error) {
    console.error("Get All Posts Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Có lỗi xảy ra khi lấy danh sách bài đăng",
      data: null,
    });
  }
};
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await getPostByIdService(postId);
    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Get Post By Id Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Có lỗi xảy ra khi lấy bài đăng",
      data: null,
    });
  }
};
