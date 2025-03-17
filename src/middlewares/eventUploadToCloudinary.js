const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const eventUploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'At least one event image is required' });
        }

        const imageUrls = [];

        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'event_images',
                resource_type: 'image'
            });

            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path); // Remove local file
        }

        req.imageUrls = imageUrls; // Attach Cloudinary URLs to request
        next();
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ msg: 'Error uploading images to Cloudinary' });
    }
};

module.exports = eventUploadToCloudinary;
