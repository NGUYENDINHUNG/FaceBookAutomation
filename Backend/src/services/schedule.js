import schedule from "node-schedule";
import Post from "../models/post.js";
import { publishPost } from "./facebook.js";

const scheduledJobs = new Map();

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
        const currentPost = await Post.findById(postId).populate("pageId");
        if (!currentPost) {
          console.error(`Không tìm thấy post ${postId}`);
          return;
        }
        const result = await publishPost(post, page);
        return result;
      } catch (err) {
        console.error(`Lỗi khi đăng post ${postId}:`, err);
      } finally {
        scheduledJobs.delete(postId);
      }
    });

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
export const initScheduledPosts = async () => {
  try {
    const scheduledPosts = await Post.find({
      status: "scheduled",
      scheduledTime: { $gt: new Date() },
    }).populate("pageId", "pageId pageName pageAccessToken");

    for (const post of scheduledPosts) {
      await schedulePost(post, post.pageId);
    }

    console.log(`Đã khởi tạo ${scheduledPosts.length} post theo lịch`);
  } catch (err) {
    console.error("Lỗi khi khởi tạo các post hẹn giờ:", err.message);
  }
};
export const cancelScheduledPost = (postId) => {
  if (scheduledJobs.has(postId)) {
    scheduledJobs.get(postId).cancel();
    scheduledJobs.delete(postId);
    return true;
  }
  return false;
};
