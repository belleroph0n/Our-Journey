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
import { parseMemoriesFile } from "./memory-parser";

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

      saveMemoriesFile(req.file.buffer, req.file.originalname);
      
      // Parse the file to validate it
      const memoriesPath = getMemoriesFilePath();
      if (!memoriesPath) {
        return res.status(500).json({ success: false, error: 'Failed to save file' });
      }

      const memories = parseMemoriesFile(memoriesPath);
      
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
      
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Convert HEIC/HEIF files to JPEG
        if (ext === '.heic' || ext === '.heif') {
          try {
            console.log(`Converting ${file.originalname} from HEIC to JPEG...`);
            const jpegBuffer = await convertHeicToJpeg(file.buffer);
            const newFilename = file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
            saveMediaFile(newFilename, jpegBuffer);
            uploadedFiles.push(newFilename);
            console.log(`Successfully converted ${file.originalname} to ${newFilename}`);
          } catch (convError) {
            console.error(`Failed to convert ${file.originalname}:`, convError);
            // Save original if conversion fails
            saveMediaFile(file.originalname, file.buffer);
            uploadedFiles.push(file.originalname);
          }
        } else {
          saveMediaFile(file.originalname, file.buffer);
          uploadedFiles.push(file.originalname);
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
      let filePath = getMediaFilePath(filename);

      // If HEIC/HEIF file not found, try the converted JPG version
      let actualFilename = filename;
      if (!filePath) {
        const reqExt = path.extname(filename).toLowerCase();
        if (reqExt === '.heic' || reqExt === '.heif') {
          const jpgFilename = filename.replace(/\.(heic|heif)$/i, '.jpg');
          filePath = getMediaFilePath(jpgFilename);
          if (filePath) {
            actualFilename = jpgFilename;
          }
        }
      }

      if (!filePath) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      // Determine content type based on actual file being served
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

  const httpServer = createServer(app);

  return httpServer;
}
