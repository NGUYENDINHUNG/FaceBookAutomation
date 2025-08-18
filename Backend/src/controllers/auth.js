import ms from "ms";
import {
  RefreshToken,
  FacebookLogin,
  LogoutService,
  GetMe,
} from "../services/auth.js";

export const loginFaceBook = async (req, res) => {
  try {
    const data = await FacebookLogin(req.user);

    if (data.EC === 0) {
      res.cookie("refresh_token", data.refreshToken, {
        httpOnly: true,
        maxAge: ms(process.env.JWT_REFRESH_EXPIRE),
      });
      // Normalize frontend origin to ensure absolute redirect
      const rawOrigin = (process.env.CORS_ORIGIN || "").trim().replace(/\/+$/, "");
      const isAbsolute = /^https?:\/\//i.test(rawOrigin);
      const appOrigin = isAbsolute ? rawOrigin : `https://${rawOrigin}`;
      const redirectUrl = `${appOrigin}?accessToken=${data.accessToken}`;
      return res.redirect(redirectUrl);
    } else {
      const rawOrigin = (process.env.CORS_ORIGIN || "").trim().replace(/\/+$/, "");
      const isAbsolute = /^https?:\/\//i.test(rawOrigin);
      const appOrigin = isAbsolute ? rawOrigin : `https://${rawOrigin}`;
      return res.redirect(
        `${appOrigin}/login?error=${encodeURIComponent(data.EM)}`
      );
    }
  } catch (err) {
    console.error("Lỗi đăng nhập Facebook:", err);
    const rawOrigin = (process.env.CORS_ORIGIN || "").trim().replace(/\/+$/, "");
    const isAbsolute = /^https?:\/\//i.test(rawOrigin);
    const appOrigin = isAbsolute ? rawOrigin : `https://${rawOrigin}`;
    return res.redirect(
      `${appOrigin}/login?error=${encodeURIComponent("Đăng nhập thất bại")}`
    );
  }
};
export const RefreshTokenUser = async (req, res) => {
  const refreshToken = req.cookies["refresh_token"];
  const result = await RefreshToken(refreshToken, res);
  return res.status(200).json(result);
};
export const getAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Không tìm thấy thông tin người dùng hoặc token đã hết hạn",
      });
    }
    const userId = req.user._id;
    const user = await GetMe(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Lấy thông tin người dùng thành công",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies["refresh_token"];
    const result = await LogoutService(refreshToken, res);

    if (result.success) {
      return res.status(200).json({
        statusCode: 200,
        message: result.message,
      });
    } else {
      return res.status(401).json({
        statusCode: 401,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Đăng xuất thất bại.",
      error: error.message,
    });
  }
};
