import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/user.js";
import { environment } from "../config/environment.js";
import { APIError } from "../constans/APIError.js";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(APIError.AUTH.TOKEN_MISSING.status)
      .json(APIError.AUTH.TOKEN_MISSING);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, environment.JWT_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(APIError.AUTH.USER_NOT_FOUND.status)
        .json(APIError.AUTH.USER_NOT_FOUND);
    }

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
      phoneNumber: decoded.phoneNumber,
      avatar: decoded.avatar,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(APIError.AUTH.TOKEN_EXPIRED.status)
        .json(APIError.AUTH.TOKEN_EXPIRED);
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(APIError.AUTH.TOKEN_INVALID.status)
        .json(APIError.AUTH.TOKEN_INVALID);
    }

    return res
      .status(APIError.AUTH.AUTH_FAILED.status)
      .json(APIError.AUTH.AUTH_FAILED);
  }
};

export { verifyToken };
