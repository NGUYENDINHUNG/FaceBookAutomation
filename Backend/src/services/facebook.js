import axios from "axios";
import { environment } from "../config/environment.js";
import Post from "../models/post.js";

const postTextToFacebook = async (page, message) => {
  try {
    const response = await axios.post(
      environment.FACEBOOK_API_URL + `/${page.pageId}/feed`,
      { message },
      { params: { access_token: page.pageAccessToken } }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Lỗi khi đăng text: ${error.message}`);
  }
};

const postPhotosToFacebook = async (page, message, imageUrls) => {
  try {
    const uploadPromises = imageUrls.map(async (imgUrl) => {
      const encodedUrl = encodeURI(imgUrl);
      const response = await axios({
        method: "POST",
        url: environment.FACEBOOK_API_URL + `/${page.pageId}/photos`,
        data: {
          url: encodedUrl,
          published: false,
          caption: message,
          access_token: page.pageAccessToken,
        },
      });
      return response;
    });

    const photoResponses = await Promise.all(uploadPromises);
    const attachedMedia = photoResponses.map((res) => ({
      media_fbid: res.data.id,
    }));

    const postRes = await axios({
      method: "POST",
      url: environment.FACEBOOK_API_URL + `/${page.pageId}/feed`,
      data: {
        message,
        attached_media: attachedMedia,
        access_token: page.pageAccessToken,
      },
    });
    return postRes.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Lỗi khi đăng ảnh: ${error.message}`);
  }
};

const postVideoToFacebook = async (page, message, videoUrl) => {
  try {
    const encodedUrl = encodedUrl(videoUrl);
    const response = await axios({
      method: "POST",
      url: environment.FACEBOOK_API_URL + `/${page.pageId}/videos`,
      data: {
        description: message,
        file_url: encodedUrl,
        access_token: page.pageAccessToken,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Lỗi khi đăng video: ${error.message}`);
  }
};

export const publishPost = async (post, page) => {
  try {
    let fbResponse;

    if (post.media?.length > 0) {
      if (post.media[0].type === "image") {
        fbResponse = await postPhotosToFacebook(
          page,
          post.content,
          post.media.map((m) => m.url)
        );
      } else if (post.media[0].type === "video") {
        fbResponse = await postVideoToFacebook(
          page,
          post.content,
          post.media[0].url
        );
      }
    } else {
      fbResponse = await postTextToFacebook(page, post.content);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      post._id,
      {
        status: "published",
        facebookPostId: fbResponse.id,
        publishedAt: new Date(),
      },
      { new: true }
    );

    return {
      status: 200,
      message: "Đăng bài thành công",
      data: updatedPost,
    };
  } catch (error) {
    return {
      status: 400,
      message: "Đăng bài thất bại",
      data: null,
      error: error.message,
    };
  }
};
