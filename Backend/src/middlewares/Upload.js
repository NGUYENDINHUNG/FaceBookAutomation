export const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File quá lớn! Tối đa 10MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};
