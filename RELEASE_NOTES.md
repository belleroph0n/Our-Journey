# Our Journey - Release Notes

## Version 2.1.0 - Food Menu & Category Refinements
**Release Date:** 21 December 2025 (NZDT)

---

### Overview

Version 2.1 introduces a fine dining restaurant-style menu for exploring food memories, along with improvements to category filtering and visual refinements.

---

### New Features

#### Food Sub-Category Menu
- **Restaurant-Style Menu**: Selecting "Food" now displays an elegant fine dining menu interface
- **Menu Categories**: Seven courses to choose from:
  - **Degustation** - Our best dishes for discerning diners
  - **Appetisers** - A selection of tasty snacks
  - **Comfort Food** - Not always healthy, but sure is tasty
  - **Main for Two** - The best meals are always shared
  - **Main for More** - Why not feed the whole family
  - **Dessert** - Sweet treats and cakes
  - **Just Feed Me** - Everything on the menu
- **Identifier-Based Filtering**: Memories can now have an "identifier" field for sub-category filtering
- **Seamless Navigation**: Food → Menu → Memories → back to Menu flow

#### Events Animation Update
- **Sunrise Animation**: Events category now features a sun rising above hills
- **New Caption**: "Shining a light on our memorable events"

---

### Improvements

#### Schema Updates
- **Categories Renamed**: "tags" field renamed to "categories" for clarity
- **New Identifier Field**: Added "identifier" column support for sub-filtering within categories
- **Flexible Column Names**: Parser now accepts multiple column name variations (categories, Categories, tags, Tags, etc.)

#### Visual Refinements
- **Polaroid Borders**: Photo borders now display in white for better visibility against backgrounds
- **Menu Typography**: Handwritten font styling with proper spacing and proportions
- **A4 Proportions**: Menu card uses 1:1.414 aspect ratio like standard stationery

#### Timezone
- **NZ Time**: All server logs now display in New Zealand time (Pacific/Auckland)

---

### Technical Details
- Added `identifier` field to Memory schema
- FoodMenu component with responsive design
- Updated memory parser for flexible column name matching
- Server timezone set to Pacific/Auckland

---

### Spreadsheet Updates Required
If using the identifier feature, add a column named "identifier" to your spreadsheet with values like:
- `degustation`, `appetiser`, `comfort`, `two`, `more`, `dessert`
- Leave blank for memories that should only appear in "Just Feed Me"

---

---

## Version 2.0.0 - Performance & Polish
**Release Date:** 20 December 2025 (NZDT)

---

### Overview

Version 2.0 brings significant performance improvements to the memory viewing experience, with faster photo loading and smarter media handling.

---

### Performance Improvements

#### HEIC Photo Caching
- **Server-Side Cache**: Converted HEIC photos are now cached on the server
- **Instant Repeat Loads**: Previously viewed HEIC images load instantly from cache
- **Secure Storage**: Cache stored in OS temp directory with restricted permissions

#### Smart Media Loading
- **Photo Priority**: Photos now load first before videos and audio
- **Lazy Loading**: Videos and audio only load when scrolled into view
- **Reduced Bandwidth**: Prevents large video files from blocking photo display
- **Loading Indicators**: Smooth loading spinners for videos while they load

---

### Technical Details
- IntersectionObserver API for lazy loading video/audio components
- File-based HEIC cache keyed by Google Drive file ID
- `preload="metadata"` on video/audio elements for faster initial render

---

---

## Version 1.3.0 - Google Drive Integration
**Release Date:** 20 December 2025 (NZDT)

---

### Overview

This update migrates the storage backend from Replit Object Storage to Google Drive, allowing you to manage all memories and media files directly from your own Google Drive folder.

---

### New Features

#### Google Drive as Primary Storage
- **Direct Drive Access**: All memories and media files are now read directly from your Google Drive folder
- **Service Account Authentication**: Secure server-side access using Google Cloud service account credentials
- **Automatic File Discovery**: The app automatically finds your spreadsheet (xlsx, xls, csv, or Google Sheets) and media files
- **Google Sheets Support**: Native support for Google Sheets - automatically exported to xlsx format for parsing

#### Simplified Admin Panel
- **Read-Only Dashboard**: View memories and media synced from Google Drive
- **Connection Status**: Real-time Google Drive connection status and file counts
- **Refresh Button**: One-click sync to pull latest changes from Drive
- **File Management Guidance**: Clear instructions for managing files directly in Google Drive

#### Media Streaming
- **Direct Streaming**: Photos, videos, and audio stream directly from Google Drive
- **Efficient Caching**: Long cache headers (1 year) for optimal performance
- **Format Support**: All existing formats supported (JPEG, PNG, MP4, MOV, MP3, etc.)

---

### Breaking Changes
- **Upload Functionality Removed**: Files are no longer uploaded through the Admin panel
- **File Management in Drive**: All file additions, edits, and deletions happen in Google Drive

---

### Configuration Required
Two secrets must be configured:
- `GOOGLE_DRIVE_FOLDER_ID`: The ID of your Google Drive folder containing memories
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON credentials for your Google Cloud service account

---

### Technical Details
- Google Drive API v3 for file access
- Service account with drive.readonly scope
- Fallback chain: Google Drive → Replit Object Storage → Local storage
- Startup connection test with logging

---

---

## Version 1.2.0 - Production Session Fix
**Release Date:** 20 December 2025 (NZDT)

---

### Overview

This update fixes session persistence issues in production deployments, ensuring users stay logged in when navigating between pages.

---

### Bug Fixes

#### Session Persistence
- **Reverse Proxy Support**: Added trust proxy configuration for Replit's production infrastructure
- **Cookie Configuration**: Added `sameSite: 'lax'` attribute for proper cross-page session handling
- **Admin Panel Access**: Fixed issue where navigating to /admin would redirect to login screen

---

### Technical Details
- Express now trusts the first proxy in production (`trust proxy: 1`)
- Session cookies properly persist across page navigation and direct URL access

---

---

## Version 1.1.0 - Cloud Storage Integration
**Release Date:** 20 December 2025 (NZDT)

---

### Overview

This update adds persistent cloud storage integration to ensure memories and media files are available in production deployments.

---

### New Features

#### Cloud Storage Integration
- **Dual-Write Pattern**: All uploads now save to both local storage (for development) and cloud storage (for production)
- **Automatic Cloud Sync**: New uploads are immediately available in production without manual migration
- **Cloud-First Reads**: Production serves files from cloud storage first, with local fallback
- **Buffer-Based Validation**: Memory files are validated directly from upload buffer for improved reliability

#### Admin Panel Enhancements
- **Cloud Storage Status Section**: New panel showing cloud vs local file counts
- **Migration Button**: One-click migration of existing local files to cloud storage
- **Sync Status Indicator**: Visual confirmation of files synced to cloud
- **Migration Warning**: Alert when local files haven't been synced to cloud

---

### Technical Improvements
- Removed local file dependency for memory validation
- Cloud upload failures now return proper error responses for retry handling
- HEIC conversion completes before cloud upload for consistency

---

### Upgrade Notes
- Existing local files can be migrated using the "Migrate to Cloud Storage" button in the Admin panel
- New uploads require no additional action—they sync automatically

---

---

## Version 1.0.0 - Initial Release
**Release Date:** 20 December 2025 (NZDT)

---

### Overview

"Our Journey" is an interactive memory exploration web application designed as a heartfelt digital gift. It features an immersive 3D globe experience powered by Mapbox, where cherished memories are visualised as custom pin markers on a world map. The design aesthetic draws inspiration from hand-drawn travel journals and scrapbooks, creating a warm, intimate digital experience.

---

### Features

#### Authentication & Security
- **Access Code Protection**: Secure entry with a memorable access code
- **Device Authorisation**: "Remember this device" functionality for trusted devices (up to 1 year)
- **Session Management**: Persistent sessions with configurable duration

#### Interactive Map Experience
- **3D Globe Visualisation**: Stunning Mapbox GL JS-powered globe centred on New Zealand
- **Custom Pin Markers**: Hand-drawn style markers in signature pink (#FF327F)
- **Smooth Animations**: Fly-to animations when navigating between memories
- **Fog & Atmosphere Effects**: Atmospheric rendering for depth and immersion

#### Category Landing Page
Six beautifully illustrated category tiles with hand-drawn whimsical style:
- **Music** (Jukebox icon): Musical memories and special songs
- **Family & Friends** (Photo frame icon): Cherished moments with loved ones
- **Travel** (Desk globe icon): Adventures and destinations explored together
- **Food** (Cooking pot icon): Memorable meals and culinary experiences
- **Events** (Whale tail icon): Special occasions and celebrations
- **Random** (Rolling dice icon): Surprise selection of memories

#### Category Loading Animations
Each category features a unique 3-second loading animation:
- **Music**: Bouncing musical notes
- **Family & Friends**: Wiggling family figures
- **Travel**: Spinning globe with continents on tilted axis
- **Food**: Bubbling pot with steam rising
- **Events**: Whale tail slapping water with splash droplets
- **Random**: Rolling dice with cycling face values

#### Memory Detail View
- **Polaroid-Style Photo Gallery**: Photos displayed in elegant frames with authentic proportions (5x bottom border)
- **Multimedia Support**: Photos, videos, and audio recordings
- **Carousel Navigation**: Smooth navigation through media collections
- **Handwritten Typography**: Caveat and Patrick Hand fonts for titles
- **Serif Content Font**: Crimson Text for descriptions

#### Media Management
- **Batch Upload Support**: Upload up to 100 files at once
- **Large File Support**: Files up to 500MB per upload
- **Format Support**:
  - Images: JPEG, PNG, GIF, WebP, HEIC, HEIF (with automatic JPEG conversion)
  - Videos: MP4, MOV, AVI, WebM
  - Audio: MP3, WAV, M4A, AAC
- **HEIC/HEIF Conversion**: Automatic conversion to JPEG for broad compatibility
- **Batch Conversion**: Admin panel option to convert previously uploaded HEIC files

#### Admin Panel
- **Memory Data Upload**: Support for Excel (.xlsx, .xls) and CSV files
- **Media File Management**: Organised upload system for photos, videos, and audio
- **Google Drive Integration**: Optional import from Google Drive
- **Batch HEIC Conversion**: One-click conversion of existing HEIC files

#### Design & Aesthetics
- **Hand-Drawn Style**: Whimsical watercolour textures and illustrations
- **Warm Pastel Palette**: Carefully selected colours evoking nostalgia
- **Typewriter Aesthetic**: Courier font elements throughout
- **Responsive Layout**: 2 columns on mobile, 3 columns on desktop
- **Dark/Light Mode Support**: Full theme support

#### Localisation
- **New Zealand English**: All text uses NZ English spelling and conventions

#### Sorting & Organisation
- **Date-Based Sorting**: Memories sorted from most recent to oldest
- **Category Filtering**: Travel and Random categories preserve original order
- **Tag System**: Flexible tagging for memory organisation

---

### Technical Specifications

#### Frontend
- React 18 with TypeScript
- Vite build system
- Tailwind CSS with custom theming
- Framer Motion animations
- TanStack Query for data fetching
- Wouter for routing
- Radix UI component primitives

#### Backend
- Express.js server
- Session-based authentication
- Multer for file uploads
- Sharp for image processing
- XLSX and PapaParse for data parsing

#### Map Integration
- Mapbox GL JS v3.0.1
- Globe projection with fog effects
- Custom marker styling

---

### Known Limitations
- Maximum 100 files per batch upload
- Maximum 500MB per individual file
- HEIC conversion requires server processing time
- Map requires internet connection for tiles

---

### Acknowledgements
Built with love for Alex, to treasure our journey together.

---

*"Every memory is a step on our journey together."*
