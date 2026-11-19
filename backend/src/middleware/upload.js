const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|csv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedExtensions.test(ext)) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type! Allowed formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, CSV'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: fileFilter
});

module.exports = upload;
