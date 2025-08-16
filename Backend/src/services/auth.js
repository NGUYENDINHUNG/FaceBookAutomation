import User from "../models/user.js";
import jwt from "jsonwebtoken";
import ms from "ms";
import { environment } from "../config/environment.js";
import { FindUserByToken, UpdateUserRefreshToken } from "./user.js";

export const FacebookLogin = async (profile) => {
  try {
    const facebookId = profile.id;
    const email = profile.emails?.[0]?.value || "";

    const name =
      profile.displayName ||
      `${profile.name?.givenName} ${profile.name?.familyName}`;
    const avatar = profile.photos?.[0]?.value || "";

    const fbAccessToken = profile.accessToken;  
    let user = await User.findOne({ facebookId });
    if (!user) {
      user = await User.create({
        facebookId,
        email,
        name,
        avatar,
        fbAccessToken,
      });
    } else {
      user.fbAccessToken = fbAccessToken;
      await user.save();
    }
    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
    };

    const accessToken = CreateAccessToken(payload);
    const refreshToken = CreateRefreshToken(payload);
    await UpdateUserRefreshToken(user._id, refreshToken);

    return {
      EC: 0,
      EM: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("««««« error »»»»»", error);
    return {
      EC: 500,
      EM: "Đã có lỗi xảy ra, vui lòng thử lại",
    };
  }
};
export const GetMe = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.log("««««« error »»»»»", error);
    return null;
  }
};
export const CreateAccessToken = (payload) => {
  return jwt.sign(payload, environment.JWT_SECRET, {
    expiresIn: environment.JWT_EXPIRES_IN,
  });
};

export const CreateRefreshToken = (payload) => {
  return jwt.sign(payload, environment.JWT_REFRESH_SECRET, {
    expiresIn: environment.JWT_REFRESH_EXPIRE,
  });
};
export const RefreshToken = async (refreshToken, res) => {
  try {
    if (!refreshToken) {
      return {
        EC: 401,
        EM: "Không tìm thấy refresh token",
      };
    }
    const user = await FindUserByToken(refreshToken);
    if (!user) {
      return {
        EC: 401,
        EM: "Không tìm thấy người dùng với token này",
      };
    }

    const { _id, name, email, phoneNumber } = user;
    const newPayload = {
      _id,
      name,
      email,
      phoneNumber,
    };

    const accessToken = CreateAccessToken(newPayload);

    const new_refresh_token = CreateRefreshToken(newPayload);

    res.clearCookie("refresh_token");

    const updateResult = await UpdateUserRefreshToken(
      user._id,
      new_refresh_token
    );
    if (!updateResult) {
      return {
        EC: 500,
        EM: "Không thể cập nhật refresh token",
      };
    }
    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      maxAge: ms(environment.JWT_REFRESH_EXPIRE),
    });
    return {
      EC: 0,
      EM: "Làm mới token thành công",
      accessToken,
    };
  } catch (error) {
    console.log("««««« error »»»»»", error);

    if (error.name === "TokenExpiredError") {
      return {
        EC: 401,
        EM: "Refresh token đã hết hạn, vui lòng đăng nhập lại",
      };
    }

    if (error.name === "JsonWebTokenError") {
      return {
        EC: 401,
        EM: "Refresh token không hợp lệ, vui lòng đăng nhập lại",
      };
    }
    return {
      EC: 500,
      EM: "Đã có lỗi xảy ra: " + error.message,
    };
  }
};
export const LogoutService = async (refreshToken, res) => {
  try {
    if (!refreshToken) {
      res.clearCookie("refresh_token");
      return {
        success: true,
        message: "Không có token, nhưng đã xóa cookie.",
      };
    }

    const user = await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      { refreshToken: null },
      { new: true }
    );

    if (!user) {
      return {
        success: false,
        message: "Không tìm thấy người dùng",
      };
    }

    res.clearCookie("refresh_token");
    return {
      success: true,
      message: "Đăng xuất thành công",
    };
  } catch (error) {
    throw new Error("Lỗi khi đăng xuất: " + error.message);
  }
};
