import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import fs from 'fs';
import { Memory } from '@shared/schema';

export function parseMemoriesFile(filePath: string): Memory[] {
  const fileContent = fs.readFileSync(filePath);
  const ext = filePath.toLowerCase();

  // Try parsing as Excel first
  if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
    return parseExcel(fileContent);
  } 
  
  // Try parsing as CSV
  if (ext.endsWith('.csv')) {
    return parseCSV(fileContent.toString());
  }

  throw new Error('Unsupported file format. Please upload .xlsx, .xls, or .csv file');
}

function parseExcel(buffer: Buffer): Memory[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'dd/mm/yy' });

  return data.map((row: any) => convertRowToMemory(row));
}

function parseCSV(content: string): Memory[] {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data.map((row: any) => convertRowToMemory(row));
}

function convertRowToMemory(row: any): Memory {
  // Parse comma-separated file lists
  const photoFiles = row.photo_files || row.photoFiles || row.photos || '';
  const videoFiles = row.video_files || row.videoFiles || row.videos || '';
  const audioFiles = row.audio_files || row.audioFiles || row.audio || '';
  const tags = row.tags || '';

  return {
    id: row.id?.toString() || '',
    title: row.title || '',
    country: row.country || '',
    city: row.city || '',
    latitude: parseFloat(row.latitude) || 0,
    longitude: parseFloat(row.longitude) || 0,
    date: row.date || '',
    description: row.description || '',
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    photoFiles: photoFiles ? photoFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    videoFiles: videoFiles ? videoFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    audioFiles: audioFiles ? audioFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
  };
}
