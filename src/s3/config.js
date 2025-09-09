// src/s3/s3Config.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Set the AWS Region from your .env variables
const REGION = process.env.REACT_APP_AWS_REGION;

// Create an S3 client object
export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload a file to S3
export const uploadFileToS3 = async (file) => {
    const fileName = `${Date.now()}-${file.name}`; // Unique file name
    console.log("Hi",process.env.REACT_APP_AWS_REGION);
    
  
    // Read file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer); // Convert to Uint8Array
  
    const params = {
      Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,  // Pass as Uint8Array
      ContentType: file.type,
    };
  
    try {
      await s3Client.send(new PutObjectCommand(params));
      return `https://${process.env.REACT_APP_S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  };
  
