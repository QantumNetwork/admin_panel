// src/s3/s3Config.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Set the AWS Region from your .env variables
const REGION = process.env.REACT_APP_AWS_REGION;
const BUCKET = process.env.REACT_APP_S3_BUCKET_NAME;

// Create an S3 client object
export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file from user input directly to S3
 * Keeps the original filename but prefixes with timestamp
 */
export const uploadFileToS3 = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;
  const fileBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(fileBuffer);

  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Body: uint8Array,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

/**
 * Uploads an internally generated/edited image (e.g., Azure signed URL → S3)
 * Sanitizes filename (spaces → underscores)
 */
export const uploadImageToS3 = async (file) => {
  const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const fileBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(fileBuffer);

  const params = {
    Bucket: BUCKET,
    Key: safeFileName,
    Body: uint8Array,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${safeFileName}`;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};
