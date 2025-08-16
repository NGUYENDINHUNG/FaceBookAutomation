import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pageId: {
      type: String,
      required: true,
    },
    pageName: {
      type: String,
      required: true,
    },
    pageAccessToken: {
      type: String,
      required: true,
    },
    pageImage: {
      type: String,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

pageSchema.index({ userId: 1, pageId: 1 });
pageSchema.index({ pageId: 1 });
const Page = mongoose.model("Page", pageSchema);
export default Page;
