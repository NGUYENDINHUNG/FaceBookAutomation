// services/page.js
import axios from "axios";
import User from "../models/user.js";
import Page from "../models/page.js";
import { APIError } from "../constans/APIError.js";
import { environment } from "../config/environment.js";

export const getUserPages = async (userId) => {
  try {
    //case 11
    const user = await User.findById(userId);
    if (!user) {
      return APIError.AUTH.USER_NOT_FOUND;
    }
    //case2
    const response = await axios.get(
      environment.FACEBOOK_API_URL + "/me/accounts",
      {
        params: {
          access_token: user.fbAccessToken,
          fields: "id,name,access_token,picture",
        },
      }
    );
    //case3
    const pages = await Promise.all(
      response.data.data.map(async (page) => {
        return await Page.findOneAndUpdate(
          {
            userId: user._id,
            pageId: page.id,
          },
          {
            pageName: page.name,
            pageAccessToken: page.access_token,
            pageImage: page.picture?.data?.url,
          },
          { upsert: true, new: true }
        );
      })
    );

    return {
      status: 200,
      message: "Lấy danh sách page thành công",
      data: {
        pages: pages.map((page) => ({
          id: page._id,
          pageId: page.pageId,
          pageName: page.pageName,
          pageImage: page.pageImage,
        })),
      },
    };
  } catch (error) {
    console.error("Get user pages error:", error);
    return {
      status: 500,
      message: "Lấy danh sách page thất bại",
      error: error.message,
    };
  }
};
