import Post from "../models/post.js";
import Page from "../models/page.js";
import aqp from "api-query-params";
import { uploadMultipleFiles } from "./file.js";
import { deletePostFromFacebook, publishPost } from "./facebook.js";
import { schedulePost } from "./schedule.js";

export const createPostService = async (userId, postData) => {
  try {
    const page = await Page.findOne({
      userId,
      pageId: postData.pageId,
    });

    if (!page) {
      return {
        status: 404,
        message: "Không tìm thấy page",
        data: null,
      };
    }

    let uploadedFiles = [];
    if (postData.files?.length > 0) {
      const uploadResult = await uploadMultipleFiles(postData.files);
      uploadedFiles = uploadResult.data;
    }

    const post = await Post.create({
      userId: userId,
      pageId: page._id,
      content: postData.content || "",
      media: uploadedFiles.map((file) => ({
        type: file.type, // Sử dụng type đã được xác định từ file service
        url: file.path,
      })),
      status: "draft",
    });

    // Populate page info cho response
    await post.populate("pageId", "_id pageName pageImage");

    return {
      status: 200,
      message: "Tạo bài post thành công",
      data: post,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Lỗi server khi tạo post",
      data: null,
      error: error.message,
    };
  }
};
export const schedulePostService = async (postId, scheduledTime) => {
  try {
    // 1. Tìm post và page
    const post = await Post.findById(postId).populate(
      "pageId",
      "_id pageName pageAccessToken pageImage"
    );
    if (!post) {
      return {
        status: 404,
        message: "Không tìm thấy bài post",
        data: null,
      };
    }

    // 2. Kiểm tra trạng thái
    if (post.status === "published") {
      return {
        status: 400,
        message: "Bài post đã được đăng",
        data: null,
      };
    }

    // 3. Validate thời gian
    if (new Date(scheduledTime) <= new Date()) {
      return {
        status: 400,
        message: "Thời gian lên lịch phải lớn hơn thời gian hiện tại",
        data: null,
      };
    }

    // 4. Cập nhật post
    post.scheduledTime = new Date(scheduledTime);
    post.status = "scheduled";
    await post.save();

    const postWithPage = await Post.findById(post._id).populate(
      "pageId",
      "pageId pageName pageAccessToken  "
    );
    // 5. Tạo job lên lịch bằng service có sẵn
    await schedulePost(postWithPage, postWithPage.pageId);

    return {
      status: 200,
      message: "Lên lịch đăng bài thành công",
      data: {
        _id: post._id,
        content: post.content,
        status: post.status,
        scheduledTime: post.scheduledTime,
        pageId: post.pageId._id,
        pageName: post.pageId.pageName,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Lỗi server khi lên lịch đăng bài",
      data: null,
      error: error.message,
    };
  }
};
export const updatePostService = async (userId, postId, postData) => {
  try {
    const post = await Post.findOne({
      _id: postId,
      status: { $in: ["draft", "scheduled"] },
    });
    if (!post) {
      return {
        status: 400,
        message: "Bài post đã được đăng hoặc không có quyền sửa",
        data: null,
      };
    }

    let uploadedFiles = [];
    if (postData.files?.length > 0) {
      try {
        const uploadResult = await uploadMultipleFiles(postData.files);

        uploadedFiles = uploadResult.data.map((file) => ({
          type: file.type,
          url: file.path,
        }));
      } catch (uploadError) {
        return {
          status: 500,
          message: "Lỗi khi upload files",
          data: null,
          error: uploadError.message,
        };
      }
    }

    const updateData = {};

    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.privacy !== undefined) updateData.privacy = postData.privacy;
    if (postData.status) updateData.status = postData.status;

    if (postData.media !== undefined) {
      try {
        const mediaArray =
          typeof postData.media === "string"
            ? JSON.parse(postData.media)
            : postData.media;

        updateData.media = [...mediaArray, ...uploadedFiles];
      } catch (error) {
        console.log(error);
        updateData.media = uploadedFiles;
      }
    } else if (uploadedFiles.length > 0) {
      updateData.media = uploadedFiles;
    }
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      updateData,
      { new: true }
    ).populate("pageId", "pageName pageImage pageId");

    return {
      status: 200,
      message: "Cập nhật bài post thành công",
      data: updatedPost,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Lỗi server khi cập nhật bài post",
      error: error.message,
    };
  }
};
export const deletePostService = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("pageId");
    if (!post) {
      return {
        status: 404,
        message: "Bài post không tồn tại",
        data: null,
      };
    }
    if (post.status === "published" && post.facebookPostId) {
      await deletePostFromFacebook(post.pageId, post);
    }
    await post.deleteOne();
    return {
      status: 200,
      message: "Xóa bài post thành công",
      data: null,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Lỗi server khi xóa bài post",
      data: null,
      error: error.message,
    };
  }
};
export const publishToFacebookService = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("pageId");
    if (!post) {
      return {
        status: 404,
        message: "Không tìm thấy bài post",
        data: null,
      };
    }

    if (post.status === "published") {
      return {
        status: 400,
        message: "Bài post đã được đăng trước đó",
        data: null,
      };
    }

    await publishPost(post, post.pageId);

    post.status = "published";
    await post.save();

    return {
      status: 200,
      message: "Đăng bài thành công",
      data: post,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Lỗi khi đăng bài lên Facebook",
      data: null,
      error: error.message,
    };
  }
};
export const getAllPostsService = async (userId, currentPage, limit, qs) => {
  const { filter, sort } = aqp(qs);

  delete filter.currentPage;
  delete filter.limit;

  let offset = (+currentPage - 1) * +limit;
  let defaultLimit = +limit ? +limit : 10;

  const queryFilter = {
    ...filter,
    userId: userId,
  };

  const totalItems = await Post.countDocuments(queryFilter);
  const totalPages = Math.ceil(totalItems / defaultLimit);

  const posts = await Post.find(queryFilter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort)
    .populate("pageId", "pageName pageImage pageId")
    .exec();

  return {
    meta: {
      current: currentPage, //trang hiện tại
      pageSize: limit, //số lượng bản ghi đã lấy
      pages: totalPages, //tổng số trang với điều kiện query
      total: totalItems, // tổng số phần tử (số bản ghi)
    },
    result: posts, //kết quả query
  };
};
export const getPostByIdService = async (postId) => {
  const post = await Post.findById(postId).populate(
    "pageId",
    "pageName pageImage pageId"
  );
  if (!post) {
    return {
      status: 404,
      message: "Không tìm thấy bài post",
      data: null,
    };
  }
  return {
    status: 200,
    message: "Lấy bài post thành công",
    data: post,
  };
};
export const getPostByPageIdService = async (pageId) => {
  const posts = await Post.find({ pageId: pageId });
  if (!posts) {
    return {
      status: 404,
      message: "Không tìm thấy bài post",
      data: null,
    };
  }
  return {
    status: 200,
    message: "Lấy bài post thành công",
    data: posts,
  };
};
