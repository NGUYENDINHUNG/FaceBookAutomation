import { getUserPages } from "../services/page.js";

export const getUserPagesController = async (req, res) => {
  const userId = req.user._id;
  const result = await getUserPages(userId);
  return res.status(200).json(result);
};
