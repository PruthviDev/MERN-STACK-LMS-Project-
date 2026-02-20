require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);

// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("Configured Cloud Name:", cloudinary.config().cloud_name);

// Option A: Function to upload from file path (for disk storage)
const uploadMediaToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Cloudinary upload successful:");
    return result;
    
  } catch (error) {
    console.error("Cloudinary upload error (path):", error);
    throw new Error("Error uploading to Cloudinary: " + error.message);
  }
};

// Option B: NEW Function to upload from buffer (for memory storage) - RECOMMENDED
const uploadBufferToCloudinary = async (buffer, fileInfo) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'course-videos',
        public_id: `video_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        chunk_size: 6000000, // 6MB chunks for better video uploads
        timeout: 120000, // 2 minute timeout for large files
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary stream upload error:", error);
          reject(new Error("Cloudinary upload failed: " + error.message));
        } else {
          console.log("Cloudinary upload successful:", {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes
          });
          resolve(result);
        }
      }
    );

    // Create a readable stream from buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
    
    // Handle stream errors
    bufferStream.on('error', (error) => {
      console.error("Buffer stream error:", error);
      reject(new Error("Stream error: " + error.message));
    });
    
    uploadStream.on('error', (error) => {
      console.error("Upload stream error:", error);
      reject(new Error("Upload stream error: " + error.message));
    });
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete asset from Cloudinary: " + error.message);
  }
};

module.exports = { 
  uploadMediaToCloudinary, 
  uploadBufferToCloudinary, 
  deleteMediaFromCloudinary 
};
