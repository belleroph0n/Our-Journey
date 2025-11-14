import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
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

// Initialize storage on startup
initializeStorage();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload memories Excel/CSV file
  app.post("/api/upload/memories", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      saveMemoriesFile(req.file.buffer);
      
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

  // Upload media files
  app.post("/api/upload/media", upload.array('files', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }

      const uploadedFiles = files.map(file => {
        saveMediaFile(file.originalname, file.buffer);
        return file.originalname;
      });

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

  // Get all memories
  app.get("/api/memories", async (req, res) => {
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

  // Get media file
  app.get("/api/media/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = getMediaFilePath(filename);

      if (!filePath) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
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

  // List all media files
  app.get("/api/media", async (req, res) => {
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

  // Delete media file
  app.delete("/api/media/:filename", async (req, res) => {
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
