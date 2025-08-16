import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";
import { environment } from "../config/environment.js";

const validateFile = (file) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif"];
  const videoTypes = ["video/mp4", "video/quicktime"]; // mp4, mov

  if (
    !imageTypes.includes(file.mimetype) &&
    !videoTypes.includes(file.mimetype)
  ) {
    return {
      status: 400,
      message: "Chỉ hỗ trợ file ảnh (JPG, PNG, GIF) và video (MP4, MOV)",
    };
  }

  // Check size
  if (imageTypes.includes(file.mimetype)) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return {
        status: 400,
        message: "Ảnh không được lớn hơn 5MB",
      };
    }
  }

  if (videoTypes.includes(file.mimetype)) {
    if (file.size > 100 * 1024 * 1024) {
      // 100MB
      throw new Error("Video không được lớn hơn 100MB");
    }
  }

  return file.mimetype.startsWith("image/") ? "image" : "video";
};

const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.]/g, "-") // Thay thế ký tự đặc biệt bằng dấu -
    .replace(/--+/g, "-") // Thay nhiều dấu - liên tiếp thành một dấu
    .toLowerCase(); // Chuyển về chữ thường
};

export const uploadSingleFile = async (file) => {
  const fileType = validateFile(file);

  let extName = path.extname(file.name);
  let baseName = path.basename(file.name, extName);
  let finalName = `${sanitizeFileName(baseName)}-${Date.now()}${extName}`;

  const params = {
    Bucket: environment.AWS_BUCKET_NAME,
    Key: `uploads/${fileType}s/${finalName}`,
    Body: file.data,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const fileUrl = `https://${environment.AWS_BUCKET_NAME}.s3.${environment.AWS_REGION}.amazonaws.com/uploads/${finalName}`;

    return {
      status: 201,
      path: fileUrl,
      type: fileType,
      error: null,
    };
  } catch (error) {
    return {
      status: 500,
      path: null,
      error: JSON.stringify(error),
    };
  }
};

export const uploadMultipleFiles = async (filesArr) => {
  try {
    // Validate: Không cho phép upload cả ảnh và video cùng lúc
    const hasImage = filesArr.some((f) => f.mimetype.startsWith("image/"));
    const hasVideo = filesArr.some((f) => f.mimetype.startsWith("video/"));

    if (hasImage && hasVideo) {
      return {
        status: 400,
        message: "Không thể upload cả ảnh và video cùng lúc",
      };
    }

    // Nếu là video chỉ cho upload 1 file
    if (hasVideo && filesArr.length > 1) {
      return {
        status: 400,
        message: "Chỉ có thể upload 1 video",
      };
    }

    let resultArr = [];
    for (let i = 0; i < filesArr.length; i++) {
      const file = filesArr[i];
      const fileType = validateFile(file);
      let extName = path.extname(file.name);
      let baseName = path.basename(file.name, extName);
      let finalName = `${baseName}-${Date.now()}${extName}`;

      const params = {
        Bucket: environment.AWS_BUCKET_NAME,
        Key: `uploads/${fileType}s/${finalName}`,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const fileUrl = `https://${environment.AWS_BUCKET_NAME}.s3.${environment.AWS_REGION}.amazonaws.com/uploads/${fileType}s/${finalName}`;

        resultArr.push({
          status: 201,
          path: fileUrl,
          type: fileType,
          fileName: filesArr[i].name,
          error: null,
        });
      } catch (err) {
        resultArr.push({
          status: 500,
          path: null,
          type: fileType,
          fileName: filesArr[i].name,
          error: JSON.stringify(err),
        });
      }
    }
    return {
      status: 201,
      data: resultArr,
    };
  } catch (error) {
    return {
      status: 500,
      data: [],
      error: JSON.stringify(error),
    };
  }
};
