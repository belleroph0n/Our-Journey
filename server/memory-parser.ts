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

export function parseMemoriesBuffer(buffer: Buffer, filename: string): Memory[] {
  const ext = filename.toLowerCase();

  if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
    return parseExcel(buffer);
  } 
  
  if (ext.endsWith('.csv')) {
    return parseCSV(buffer.toString());
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

// Parse date from various formats (DD/MM/YY, DD/MM/YYYY, or ISO) to ISO format
function parseDate(dateValue: any): string {
  if (!dateValue) return '';
  
  // If it's already a Date object (from cellDates: true)
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  const dateStr = dateValue.toString().trim();
  if (!dateStr) return '';
  
  // Try DD/MM/YY or DD/MM/YYYY format
  const ddmmyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (ddmmyyMatch) {
    const day = parseInt(ddmmyyMatch[1], 10);
    const month = parseInt(ddmmyyMatch[2], 10) - 1; // JS months are 0-indexed
    let year = parseInt(ddmmyyMatch[3], 10);
    // Handle 2-digit years (assume 2000s for years < 50, 1900s otherwise)
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    const date = new Date(year, month, day);
    return date.toISOString();
  }
  
  // Try to parse as-is (might be ISO format already)
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  
  // Return original if we can't parse it
  return dateStr;
}

function convertRowToMemory(row: any): Memory {
  // Parse comma-separated file lists
  const photoFiles = row.photo_files || row.photoFiles || row.photos || '';
  const videoFiles = row.video_files || row.videoFiles || row.videos || '';
  const audioFiles = row.audio_files || row.audioFiles || row.audio || '';
  // Support both 'categories' (new) and 'tags' (legacy) column names - also try case variations
  const categories = row.categories || row.Categories || row.tags || row.Tags || row.category || row.Category || '';
  // New identifier column for sub-filtering within categories
  const identifier = row.identifier || row.Identifier || '';


  return {
    id: row.id?.toString() || '',
    title: row.title || '',
    country: row.country || '',
    city: row.city || '',
    latitude: parseFloat(row.latitude) || 0,
    longitude: parseFloat(row.longitude) || 0,
    date: parseDate(row.date),
    description: row.description || '',
    categories: categories ? categories.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    identifier: identifier ? identifier.trim() : undefined,
    photoFiles: photoFiles ? photoFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    videoFiles: videoFiles ? videoFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    audioFiles: audioFiles ? audioFiles.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
  };
}
