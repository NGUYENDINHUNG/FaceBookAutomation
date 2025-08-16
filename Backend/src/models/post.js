import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    content: {
      type: String,
    },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
        },
        url: String,
      },
    ],
    scheduledTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "published", "failed", "draft"],
      default: "scheduled",
    },
    facebookPostId: String,
    publishedAt: {
      type: Date,
      required: false,
    },
    error: String,
  },
  {
    timestamps: true,
  }
);

// Chỉ cần index cho pageId và scheduledTime
postSchema.index({ pageId: 1 });
postSchema.index({ scheduledTime: 1, status: 1 });

export default mongoose.model("Post", postSchema);
