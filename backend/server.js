const express = require("express");
const multer = require('multer');
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();
const app = express();
const path = require('path');
const { uploadBufferToS3 } = require('./utils/s3Utils');

// Serve static files from the 'docs' directory
app.use('/docs', express.static(path.join(__dirname, 'docs')));
// Temporary serve of uploaded files - will be removed once S3 integration is complete
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Configure multer to use memory storage (instead of disk)
// This allows us to access the buffer and upload it to S3
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

// S3 upload middleware
const s3UploadMiddleware = (fieldName) => {
  return (req, res, next) => {
    const multerSingle = upload.single(fieldName);
    
    multerSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          status: false, 
          message: `File upload error: ${err.message}` 
        });
      }
      
      if (!req.file) {
        // No file uploaded, just continue
        return next();
      }
      
      try {
        // Upload the file to S3
        const s3FileName = await uploadBufferToS3(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        
        // Store S3 filename in request
        req.file.filename = s3FileName;
        req.file.s3Key = s3FileName;
        
        next();
      } catch (error) {
        console.error('Error uploading to S3:', error);
        return res.status(500).json({ 
          status: false, 
          message: `Error uploading to S3: ${error.message}` 
        });
      }
    });
  };
};

//routes
const AllRoutes = require('./routes/item.routes');
const OrderRouter = require('./routes/order.routes');
const AuthRouter = require('./routes/auth.routes');

app.use('/api/', AllRoutes(s3UploadMiddleware));
app.use('/order/', OrderRouter);
app.use('/api/auth/', AuthRouter);

const PORT = process.env.PORT || 8070;

app.listen(PORT, () => {
    console.log(`🚀 :: Server is up and running on PORT: ${PORT}`);
});