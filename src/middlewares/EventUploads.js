const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'uploads/events/',  // Store event images separately
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    file.mimetype.startsWith('image/')
        ? cb(null, true)
        : cb(new Error('Only images are allowed!'), false);
};

// Multer setup for multiple images (Max 5 images)
const eventUpload = multer({
    storage,
    limits: { fileSize: 500 * 1024 }, // 500KB limit per image
    fileFilter,
})

module.exports = eventUpload;
