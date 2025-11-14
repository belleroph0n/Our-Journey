import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { listFilesInFolder, downloadFile, getFolderInfo } from "./google-drive";

export async function registerRoutes(app: Express): Promise<Server> {
  // Diagnostic route to check folder access
  app.get("/api/drive/folder-info", async (req, res) => {
    try {
      const folderInfo = await getFolderInfo();
      res.json(folderInfo);
    } catch (error: any) {
      console.error("Error getting folder info:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get folder info" 
      });
    }
  });

  // Test route to list files in Google Drive folder
  app.get("/api/drive/files", async (req, res) => {
    try {
      const files = await listFilesInFolder();
      res.json({ success: true, files, count: files.length });
    } catch (error: any) {
      console.error("Error listing files:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to list files" 
      });
    }
  });

  // Test route to download a specific file
  app.get("/api/drive/download/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const fileData = await downloadFile(fileId);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(fileData as ArrayBuffer));
    } catch (error: any) {
      console.error("Error downloading file:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to download file" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
