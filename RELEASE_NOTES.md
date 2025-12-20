# Our Journey - Release Notes

## Version 1.0.0 - Initial Release
**Release Date:** 20 December 2025

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
