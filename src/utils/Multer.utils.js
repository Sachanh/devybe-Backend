const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// we are only taking images 
const fileFilter = (req, file, cb) => {
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images are allowed!'), false);
};

// 100kb limit done
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 },
    fileFilter,
});

// if size is more then it will resize autometically
const processImage = async (req, res, next) => {
    if (!req.file) return next();

    const { path: filePath, filename } = req.file;
    const newPath = path.join('uploads', `resized-${filename}`);

    try {
        await sharp(filePath).resize({ width: 1024, height: 1024, fit: 'inside' }).toFile(newPath);
        fs.unlinkSync(filePath); // it will remove origial file after resizing that
        req.file.path = newPath;
        next();
    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ msg: 'Error processing image' });
    }
};

module.exports = { upload, processImage };
