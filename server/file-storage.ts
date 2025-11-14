import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MEMORIES_FILE = path.join(UPLOAD_DIR, 'memories.csv');
const MEDIA_DIR = path.join(UPLOAD_DIR, 'media');

// Ensure directories exist
export function initializeStorage() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }
}

export function saveMemoriesFile(fileBuffer: Buffer) {
  fs.writeFileSync(MEMORIES_FILE, fileBuffer);
}

export function getMemoriesFilePath() {
  return fs.existsSync(MEMORIES_FILE) ? MEMORIES_FILE : null;
}

export function saveMediaFile(filename: string, fileBuffer: Buffer) {
  const filePath = path.join(MEDIA_DIR, filename);
  fs.writeFileSync(filePath, fileBuffer);
  return filePath;
}

export function getMediaFilePath(filename: string) {
  const filePath = path.join(MEDIA_DIR, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

export function listMediaFiles() {
  if (!fs.existsSync(MEDIA_DIR)) {
    return [];
  }
  return fs.readdirSync(MEDIA_DIR);
}

export function deleteMediaFile(filename: string) {
  const filePath = path.join(MEDIA_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
