import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const headers = [
  'id',
  'title',
  'country',
  'city',
  'latitude',
  'longitude',
  'date',
  'description',
  'tags',
  'photo_files',
  'video_files',
  'audio_files'
];

const sampleData = [
  {
    id: '1',
    title: 'Example Memory',
    country: 'New Zealand',
    city: 'Wellington',
    latitude: -41.2865,
    longitude: 174.7762,
    date: '2024-01-15',
    description: 'A wonderful day in the capital city',
    tags: 'travel, family',
    photo_files: 'photo1.jpg, photo2.jpg',
    video_files: 'video1.mp4',
    audio_files: ''
  }
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });

const columnWidths = [
  { wch: 10 },  // id
  { wch: 30 },  // title
  { wch: 20 },  // country
  { wch: 20 },  // city
  { wch: 12 },  // latitude
  { wch: 12 },  // longitude
  { wch: 12 },  // date
  { wch: 50 },  // description
  { wch: 30 },  // tags
  { wch: 40 },  // photo_files
  { wch: 40 },  // video_files
  { wch: 40 },  // audio_files
];

worksheet['!cols'] = columnWidths;

XLSX.utils.book_append_sheet(workbook, worksheet, 'Memories');

const outputPath = path.join(process.cwd(), 'server', 'public', 'Our_Journey_Template.xlsx');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
XLSX.writeFile(workbook, outputPath);

console.log(`✓ Template generated successfully at: ${outputPath}`);
console.log('\nColumn order:');
headers.forEach((header, index) => {
  console.log(`  ${index + 1}. ${header}`);
});
