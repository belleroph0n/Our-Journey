import { google } from 'googleapis';

// Initialize Google Drive client with service account
function getDriveClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured');
  }

  let parsedCredentials;
  try {
    parsedCredentials = JSON.parse(credentials);
  } catch (e) {
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY - ensure it contains valid JSON');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

export function getFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured');
  }
  return folderId;
}

export function isGoogleDriveConfigured(): boolean {
  return !!(process.env.GOOGLE_DRIVE_FOLDER_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}

// List files in the configured folder
export async function listDriveFiles(): Promise<{ id: string; name: string; mimeType: string }[]> {
  const drive = getDriveClient();
  const folderId = getFolderId();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 1000,
  });

  return (response.data.files || []) as { id: string; name: string; mimeType: string }[];
}

// Get file metadata by name
export async function getFileByName(filename: string): Promise<{ id: string; name: string; mimeType: string } | null> {
  const drive = getDriveClient();
  const folderId = getFolderId();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and name = '${filename.replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 1,
  });

  const files = response.data.files;
  return files && files.length > 0 ? files[0] as { id: string; name: string; mimeType: string } : null;
}

// Download file content as buffer
export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

// Stream file content (for large files like videos)
export async function streamFile(fileId: string): Promise<NodeJS.ReadableStream> {
  const drive = getDriveClient();

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return response.data as NodeJS.ReadableStream;
}

// Find the memories spreadsheet file (xlsx, xls, or csv)
export async function findMemoriesFile(): Promise<{ id: string; name: string; mimeType: string } | null> {
  const files = await listDriveFiles();
  
  // Look for spreadsheet files
  const spreadsheetExtensions = ['.xlsx', '.xls', '.csv'];
  const spreadsheetMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.google-apps.spreadsheet'
  ];

  for (const file of files) {
    const name = file.name.toLowerCase();
    const isSpreadsheet = spreadsheetExtensions.some(ext => name.endsWith(ext)) ||
                          spreadsheetMimeTypes.includes(file.mimeType);
    if (isSpreadsheet) {
      return file;
    }
  }

  return null;
}

// Get all media files (photos, videos, audio)
export async function getMediaFiles(): Promise<{ id: string; name: string; mimeType: string }[]> {
  const files = await listDriveFiles();
  
  const mediaExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif',
    // Videos
    '.mp4', '.mov', '.avi', '.webm', '.m4v', '.mkv',
    // Audio
    '.mp3', '.wav', '.m4a', '.aac'
  ];

  return files.filter(file => {
    const name = file.name.toLowerCase();
    return mediaExtensions.some(ext => name.endsWith(ext));
  });
}

// Test connection to Google Drive
export async function testDriveConnection(): Promise<{ success: boolean; fileCount: number; files?: string[]; error?: string }> {
  try {
    const files = await listDriveFiles();
    return { 
      success: true, 
      fileCount: files.length,
      files: files.slice(0, 10).map(f => f.name) // Show first 10 file names
    };
  } catch (error: any) {
    return { success: false, fileCount: 0, error: error.message };
  }
}
