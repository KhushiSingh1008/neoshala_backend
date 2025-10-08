import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const courseImagesDir = path.join(__dirname, '../uploads/course-images');
if (!fs.existsSync(courseImagesDir)) {
  fs.mkdirSync(courseImagesDir, { recursive: true });
}
const certificatesDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // route determines target dir via req.uploadTarget
    const target = req.uploadTarget === 'certificate' ? certificatesDir : courseImagesDir;
    cb(null, target);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Pre-router to set target dir based on query ?target=certificate
router.use((req, res, next) => {
  req.uploadTarget = req.query.target === 'certificate' ? 'certificate' : 'image';
  next();
});

// Upload course image or certificate
router.post('/', upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the full URL for the uploaded file
    const base = req.uploadTarget === 'certificate' ? '/uploads/certificates' : '/uploads/course-images';
    const fileUrl = `${base}/${req.file.filename}`;
    console.log('File uploaded successfully:', fileUrl);
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 