// Project Phase 3 Part A  "Store Files in Cloud"

const cloudinary = require("cloudinary").v2;

const  { CloudinaryStorage } = require("multer-storage-cloudinary");

// Config i.e. Verify our Cloud Credentials

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Create a new Schema of our Cloudinary Folder

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "Travelrent_Listings",

        allowedFormats: ["png", "jpg", "jpeg"]
    }
});

// Export Cloudinary and Folder Schema Variable name.

module.exports = {
    cloudinary,
    storage
};

// Import in "01_listings_routes.js"

















