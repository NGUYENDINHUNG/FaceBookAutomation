import schedule from "node-schedule";
import Post from "../models/post.js";
import { publishPost } from "./facebook.js";

/**
 * Map lưu các job đang được hẹn giờ
 * Key: postId
 * Value: job object của node-schedule
 */
const scheduledJobs = new Map();

/**
 * Tạo một job đăng bài Facebook vào thời gian định sẵn
 * @param {Object} post - Thông tin bài viết
 * @param {Object} page - Thông tin page cần đăng
 */
export const schedulePost = async (post, page) => {
  const postId = post._id;

  try {
    // Nếu post này đã có job cũ -> hủy để tạo job mới
    if (scheduledJobs.has(postId)) {
      scheduledJobs.get(postId).cancel();
      scheduledJobs.delete(postId);
    }

    // Kiểm tra thời gian hợp lệ
    const scheduledTime = post.scheduledTime;
    if (!scheduledTime || scheduledTime <= new Date()) {
      return {
        status: 400,
        message: "Thời gian lên lịch phải lớn hơn thời gian hiện tại",
        data: null,
      };
    }

    // Tạo job mới
    const job = schedule.scheduleJob(scheduledTime, async () => {
      try {
        await publishPost(post, page);
      } catch (err) {
        console.error(`Lỗi khi đăng post ${postId}:`, err);
      } finally {
        scheduledJobs.delete(postId); // Xóa job sau khi chạy xong
      }
    });

    // Nếu job tạo thành công thì lưu lại
    if (job) {
      scheduledJobs.set(postId, job);
    } else {
      return {
        status: 400,
        message: "Không thể tạo job",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Tạo job thành công",
      data: null,
    };
  } catch (err) {
    console.error(`Lỗi khi tạo lịch cho post ${postId}:`, err.message);
    return {
      status: 500,
      message: "Lỗi server khi tạo lịch cho post",
      data: null,
      error: err.message,
    };
  }
};

/**
 * Khi server khởi động -> Tìm tất cả post có trạng thái 'scheduled'
 * và thời gian hẹn giờ còn ở tương lai để tạo lại job
 */
export const initScheduledPosts = async () => {
  try {
    const scheduledPosts = await Post.find({
      status: "scheduled",
      scheduledTime: { $gt: new Date() },
    }).populate("pageId");

    for (const post of scheduledPosts) {
      await schedulePost(post, post.pageId);
    }

    console.log(`Đã khởi tạo ${scheduledPosts.length} post theo lịch`);
  } catch (err) {
    console.error("Lỗi khi khởi tạo các post hẹn giờ:", err.message);
  }
};

/**
 * Hủy job hẹn giờ của một post
 * @param {string} postId
 * @returns {boolean} - true nếu hủy thành công, false nếu không tìm thấy
 */
export const cancelScheduledPost = (postId) => {
  if (scheduledJobs.has(postId)) {
    scheduledJobs.get(postId).cancel();
    scheduledJobs.delete(postId);
    return true;
  }
  return false;
};
