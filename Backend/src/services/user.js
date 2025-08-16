import User from "../models/user.js";

export const UpdateUserRefreshToken = async (userId, refreshToken) => {
  try {
    const result = await User.findByIdAndUpdate(
      userId,
      { refreshToken: refreshToken },
      { new: true }
    );
    return result;
  } catch (error) {
    console.log("««««« error »»»»»", error);
    return null;
  }
};
export const FindUserByToken = async (refreshToken) => {
  try {
    const UserByToken = await User.findOne({ refreshToken });
    return UserByToken;
  } catch (error) {
    console.log("««««« error »»»»»", error);
    return null;
  }
};
