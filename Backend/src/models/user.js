import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    avatar: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    facebookId: {
      type: String,
      unique: true,
    },
    fbAccessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
