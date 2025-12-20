import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { 
  initializeStorage, 
  saveMemoriesFile, 
  getMemoriesFilePath,
  saveMediaFile, 
  getMediaFilePath,
  listMediaFiles,
  deleteMediaFile 
} from "./file-storage";
import { parseMemoriesFile, parseMemoriesBuffer } from "./memory-parser";
import {
  isCloudStorageConfigured,
  uploadToCloudStorage,
  streamFromCloudStorage,
  listCloudStorageFiles,
  uploadMemoriesFileToCloud,
  getMemoriesFileFromCloud,
  migrateLocalFilesToCloud
} from "./cloud-storage";
import {
  isGoogleDriveConfigured,
  testDriveConnection,
  listDriveFiles,
  findMemoriesFile,
  getMediaFiles,
  downloadFile,
  streamFile,
  getFileByName
} from "./google-drive";

// Convert HEIC buffer to JPEG buffer
async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    const outputBuffer = await heicConvert({
      buffer: buffer,
      format: 'JPEG',
      quality: 0.9
    });
    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error('HEIC conversion failed, trying sharp:', error);
    // Fallback to sharp if heic-convert fails
    return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
  }
}

// Initialize storage on startup
initializeStorage();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB limit per file
    files: 100 // Up to 100 files at once
  }
});

// Access code from environment variable (required)
const ACCESS_CODE = process.env.ACCESS_CODE;
if (!ACCESS_CODE) {
  throw new Error('ACCESS_CODE environment variable is required');
}

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { code, rememberDevice } = req.body;

      if (code === ACCESS_CODE) {
        req.session.isAuthenticated = true;
        if (rememberDevice) {
          req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
        }
        res.json({ success: true, message: 'Authentication successful' });
      } else {
        res.status(401).json({ success: false, error: 'Invalid access code' });
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Authentication failed' 
      });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ success: false, error: 'Logout failed' });
      } else {
        res.json({ success: true, message: 'Logout successful' });
      }
    });
  });

  app.get("/api/auth/status", async (req, res) => {
    res.json({ 
      success: true, 
      isAuthenticated: !!req.session.isAuthenticated 
    });
  });

  // Download Excel template
  app.get("/api/download/template", (req, res) => {
    const templatePath = path.join(process.cwd(), 'server', 'public', 'Our_Journey_Template.xlsx');
    res.download(templatePath, 'Our_Journey_Template.xlsx', (err) => {
      if (err) {
        console.error("Error downloading template:", err);
        res.status(404).json({ success: false, error: 'Template file not found' });
      }
    });
  });

  // Upload memories Excel/CSV file (requires authentication)
  app.post("/api/upload/memories", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // Parse and validate from buffer directly (no local file dependency)
      const memories = parseMemoriesBuffer(req.file.buffer, req.file.originalname);
      
      // Save to local storage
      saveMemoriesFile(req.file.buffer, req.file.originalname);
      
      // Also upload to cloud storage if configured
      if (isCloudStorageConfigured()) {
        try {
          await uploadMemoriesFileToCloud(req.file.buffer, req.file.originalname);
          console.log('Memories file also uploaded to cloud storage');
        } catch (cloudError) {
          console.error('Failed to upload memories to cloud storage:', cloudError);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to upload memories to cloud storage. Please try again.' 
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: 'Memories file uploaded successfully',
        count: memories.length 
      });
    } catch (error: any) {
      console.error("Error uploading memories file:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to upload memories file' 
      });
    }
  });

  // Upload media files (requires authentication)
  app.post("/api/upload/media", requireAuth, upload.array('files', 100), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }

      const uploadedFiles: string[] = [];
      const cloudConfigured = isCloudStorageConfigured();
      
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        let finalFilename = file.originalname;
        let finalBuffer = file.buffer;
        let contentType = file.mimetype || 'application/octet-stream';
        
        // Convert HEIC/HEIF files to JPEG
        if (ext === '.heic' || ext === '.heif') {
          try {
            console.log(`Converting ${file.originalname} from HEIC to JPEG...`);
            const jpegBuffer = await convertHeicToJpeg(file.buffer);
            finalFilename = file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
            finalBuffer = jpegBuffer;
            contentType = 'image/jpeg';
            console.log(`Successfully converted ${file.originalname} to ${finalFilename}`);
          } catch (convError) {
            console.error(`Failed to convert ${file.originalname}:`, convError);
          }
        }
        
        // Save to local storage
        saveMediaFile(finalFilename, finalBuffer);
        uploadedFiles.push(finalFilename);
        
        // Also upload to cloud storage if configured
        if (cloudConfigured) {
          try {
            await uploadToCloudStorage(finalFilename, finalBuffer, contentType);
          } catch (cloudError) {
            console.error(`Failed to upload ${finalFilename} to cloud:`, cloudError);
          }
        }
      }

      res.json({ 
        success: true, 
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error: any) {
      console.error("Error uploading media files:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to upload media files' 
      });
    }
  });

  // Get all memories (requires authentication)
  app.get("/api/memories", requireAuth, async (req, res) => {
    try {
      // Try cloud storage first if configured
      if (isCloudStorageConfigured()) {
        const cloudFile = await getMemoriesFileFromCloud();
        if (cloudFile) {
          const memories = parseMemoriesBuffer(cloudFile.buffer, cloudFile.filename);
          return res.json({ success: true, memories });
        }
      }

      // Fall back to local storage
      const memoriesPath = getMemoriesFilePath();
      if (!memoriesPath) {
        return res.json({ success: true, memories: [] });
      }

      const memories = parseMemoriesFile(memoriesPath);
      res.json({ success: true, memories });
    } catch (error: any) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch memories' 
      });
    }
  });

  // Get media file (requires authentication)
  app.get("/api/media/:filename", requireAuth, async (req, res) => {
    try {
      const { filename } = req.params;
      let actualFilename = filename;

      // If HEIC/HEIF file requested, try the converted JPG version first
      const reqExt = path.extname(filename).toLowerCase();
      if (reqExt === '.heic' || reqExt === '.heif') {
        actualFilename = filename.replace(/\.(heic|heif)$/i, '.jpg');
      }

      // Try cloud storage first if configured
      if (isCloudStorageConfigured()) {
        let cloudResult = await streamFromCloudStorage(actualFilename);
        
        // If not found and we tried jpg, try original filename
        if (!cloudResult && actualFilename !== filename) {
          cloudResult = await streamFromCloudStorage(filename);
          if (cloudResult) {
            actualFilename = filename;
          }
        }

        if (cloudResult) {
          res.setHeader('Content-Type', cloudResult.contentType);
          res.setHeader('Content-Length', cloudResult.size);
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          cloudResult.stream.pipe(res);
          return;
        }
      }

      // Fall back to local storage
      let filePath = getMediaFilePath(actualFilename);
      if (!filePath && actualFilename !== filename) {
        filePath = getMediaFilePath(filename);
        if (filePath) {
          actualFilename = filename;
        }
      }

      if (!filePath) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      const ext = path.extname(actualFilename).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.heic': 'image/heic',
        '.heif': 'image/heif',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
      };

      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.sendFile(filePath);
    } catch (error: any) {
      console.error("Error serving media file:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to serve media file' 
      });
    }
  });

  // List all media files (requires authentication)
  app.get("/api/media", requireAuth, async (req, res) => {
    try {
      // Try cloud storage first if configured
      if (isCloudStorageConfigured()) {
        const cloudFiles = await listCloudStorageFiles();
        if (cloudFiles.length > 0) {
          return res.json({ success: true, files: cloudFiles });
        }
      }

      // Fall back to local storage
      const files = listMediaFiles();
      res.json({ success: true, files });
    } catch (error: any) {
      console.error("Error listing media files:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to list media files' 
      });
    }
  });

  // Batch convert all HEIC files to JPG (requires authentication)
  app.post("/api/convert-heic", requireAuth, async (req, res) => {
    try {
      const files = listMediaFiles();
      const heicFiles = files.filter(f => 
        f.toLowerCase().endsWith('.heic') || f.toLowerCase().endsWith('.heif')
      );

      if (heicFiles.length === 0) {
        return res.json({ success: true, message: 'No HEIC files to convert', converted: 0 });
      }

      let converted = 0;
      const errors: string[] = [];

      for (const filename of heicFiles) {
        try {
          const filePath = getMediaFilePath(filename);
          if (!filePath) continue;

          const buffer = fs.readFileSync(filePath);
          console.log(`Converting ${filename}...`);
          const jpegBuffer = await convertHeicToJpeg(buffer);
          const newFilename = filename.replace(/\.(heic|heif)$/i, '.jpg');
          saveMediaFile(newFilename, jpegBuffer);
          
          // Delete original HEIC file
          deleteMediaFile(filename);
          converted++;
          console.log(`Converted ${filename} to ${newFilename}`);
        } catch (err: any) {
          console.error(`Failed to convert ${filename}:`, err.message);
          errors.push(`${filename}: ${err.message}`);
        }
      }

      res.json({ 
        success: true, 
        message: `Converted ${converted} of ${heicFiles.length} HEIC files`,
        converted,
        total: heicFiles.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error("Error batch converting HEIC files:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to convert HEIC files' 
      });
    }
  });

  // Delete media file (requires authentication)
  app.delete("/api/media/:filename", requireAuth, async (req, res) => {
    try {
      const { filename } = req.params;
      const deleted = deleteMediaFile(filename);

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      res.json({ success: true, message: 'File deleted successfully' });
    } catch (error: any) {
      console.error("Error deleting media file:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to delete media file' 
      });
    }
  });

  // Migrate local files to cloud storage (requires authentication)
  app.post("/api/migrate-to-cloud", requireAuth, async (req, res) => {
    try {
      if (!isCloudStorageConfigured()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cloud storage is not configured' 
        });
      }

      console.log('Starting migration to cloud storage...');
      const result = await migrateLocalFilesToCloud();
      
      console.log(`Migration complete: ${result.migrated.length} files migrated, ${result.errors.length} errors`);
      
      res.json({ 
        success: true, 
        message: `Migrated ${result.migrated.length} files to cloud storage`,
        migrated: result.migrated,
        errors: result.errors.length > 0 ? result.errors : undefined
      });
    } catch (error: any) {
      console.error("Error migrating to cloud storage:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to migrate to cloud storage' 
      });
    }
  });

  // Test Google Drive connection (requires authentication)
  app.get("/api/google-drive/test", requireAuth, async (req, res) => {
    try {
      if (!isGoogleDriveConfigured()) {
        return res.json({ 
          success: false, 
          configured: false,
          error: 'Google Drive is not configured. Please add GOOGLE_DRIVE_FOLDER_ID and GOOGLE_SERVICE_ACCOUNT_KEY secrets.' 
        });
      }

      const result = await testDriveConnection();
      res.json({ 
        configured: true,
        ...result
      });
    } catch (error: any) {
      console.error("Error testing Google Drive connection:", error);
      res.status(500).json({ 
        success: false, 
        configured: true,
        error: error.message || 'Failed to test Google Drive connection' 
      });
    }
  });

  // Check cloud storage status (requires authentication)
  app.get("/api/cloud-status", requireAuth, async (req, res) => {
    try {
      const configured = isCloudStorageConfigured();
      let cloudFileCount = 0;
      
      if (configured) {
        const cloudFiles = await listCloudStorageFiles();
        cloudFileCount = cloudFiles.length;
      }

      const localFiles = listMediaFiles();
      
      res.json({ 
        success: true,
        cloudStorageConfigured: configured,
        cloudFileCount,
        localFileCount: localFiles.length
      });
    } catch (error: any) {
      console.error("Error checking cloud status:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to check cloud status' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
