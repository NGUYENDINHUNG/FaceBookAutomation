import { S3Client } from "@aws-sdk/client-s3";
import { environment } from "./environment.js";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
  },
  region: environment.AWS_REGION,
});

export default s3Client;
