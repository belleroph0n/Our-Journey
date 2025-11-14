import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
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

export function saveMemoriesFile(fileBuffer: Buffer, originalFilename: string) {
  // Clear any existing memories files first
  const files = fs.readdirSync(UPLOAD_DIR);
  files.forEach(file => {
    if (file.startsWith('memories.')) {
      fs.unlinkSync(path.join(UPLOAD_DIR, file));
    }
  });

  // Get the file extension from original filename
  const ext = path.extname(originalFilename);
  const memoriesFile = path.join(UPLOAD_DIR, `memories${ext}`);
  fs.writeFileSync(memoriesFile, fileBuffer);
}

export function getMemoriesFilePath(): string | null {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return null;
  }
  
  // Look for any file starting with 'memories.'
  const files = fs.readdirSync(UPLOAD_DIR);
  const memoriesFile = files.find(file => file.startsWith('memories.'));
  
  if (memoriesFile) {
    return path.join(UPLOAD_DIR, memoriesFile);
  }
  
  return null;
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
