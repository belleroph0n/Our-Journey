# Our Journey - Interactive Memory Map

**Version:** 2.5.0  
**Release Date:** 24 December 2025 (NZDT)  
**Custom Domain:** alexndan.com

## Overview

"Our Journey" is an interactive memory mapping application that allows users to visualize and explore shared memories on a global map. The application features a password-protected interface with an immersive 3D globe/map experience powered by Mapbox, where users can view memories as custom pin markers, click to see detailed views with photos, videos, and audio recordings. The design aesthetic is inspired by hand-drawn travel journals and scrapbooks, creating a warm, intimate digital experience.

## User Preferences

Preferred communication style: Simple, everyday language.
Timezone: All dates, times, and logs should use New Zealand time (Pacific/Auckland, NZDT/NZST).

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server. The application uses a component-based architecture with Wouter for client-side routing.

**UI Component System**: shadcn/ui components (Radix UI primitives) with Tailwind CSS for styling. The design system follows a "new-york" style variant with custom theming that supports handwritten fonts (Caveat, Patrick Hand) for titles and serif fonts (Crimson Text) for content, creating a scrapbook aesthetic.

**State Management**: TanStack Query (React Query) for server state management with custom query functions that handle authentication and data fetching. No global state management library is used; component-level state with hooks is sufficient.

**Key Pages**:
- Home page with three view states: authentication, interactive map, and memory detail views
- Admin panel for uploading memory data files and media assets
- 404 not found page

**Design Approach**: Custom aesthetic combining hand-drawn travel journal aesthetics with modern map interfaces. Uses paper textures, handwritten typography, and tactile interaction patterns to evoke nostalgia.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. The server handles file uploads, authentication, and serves both the API and static frontend assets.

**Session Management**: Express-session with a required SESSION_SECRET environment variable. Sessions support "remember device" functionality with configurable cookie durations (30 days default, 1 year for remembered devices).

**Authentication Model**: Simple access code-based authentication (no traditional user accounts). The ACCESS_CODE is stored as an environment variable and checked on login. Protected routes use a requireAuth middleware.

**File Parsing**: Supports Excel (.xlsx, .xls), CSV, and Google Sheets for memory data. Uses XLSX library for Excel parsing and PapaParse for CSV parsing. The memory parser converts spreadsheet rows into standardized Memory objects with flexible column name mapping.

### Data Storage Solutions

**Primary Storage**: Google Drive is the primary storage backend. All memories and media files are read directly from a configured Google Drive folder using the Google Drive API v3 with service account authentication.

**Storage Priority Chain**: 
1. Google Drive (primary) - requires GOOGLE_DRIVE_FOLDER_ID and GOOGLE_SERVICE_ACCOUNT_KEY secrets
2. Replit Object Storage (fallback) - for legacy deployments
3. Local filesystem (development fallback)

**Memory Data Structure**: Each memory contains: id, title, country, city, latitude, longitude, date, description, categories (array), identifier (optional string for sub-filtering), photoFiles (array), videoFiles (array), audioFiles (array).

**Schema Validation**: Zod schemas define the shape of Memory objects and form inputs, ensuring type safety across the stack.

### External Dependencies

**Mapbox GL JS**: Interactive map and 3D globe visualization (v3.0.1). Requires VITE_MAPBOX_TOKEN environment variable. Provides custom styling, globe projection, fog effects, and marker management.

**Google Drive Integration**: Primary storage integration using Google Drive API v3. Uses service account authentication (not OAuth) with drive.readonly scope. The service account JSON credentials are stored in GOOGLE_SERVICE_ACCOUNT_KEY secret. Supports direct file streaming, Google Sheets export to xlsx, and automatic file discovery.

**Replit-Specific Integrations**:
- Vite plugins for runtime error overlay, development banner, and cartographer (development only)

**UI Component Libraries**:
- Radix UI primitives for accessible component foundations
- Embla Carousel for media galleries
- Recharts for potential data visualization
- Lucide React for icons

**Form Handling**: React Hook Form with Hookform Resolvers for form validation integrated with Zod schemas.

**Styling**: Tailwind CSS with custom configuration including handwritten font families, custom spacing primitives, and themed color variables supporting light/dark modes.

**Build & Development**:
- Vite for fast development server and optimized production builds
- ESBuild for server-side code bundling
- TypeScript with path aliases (@/, @shared/, @assets/)

**File Processing**:
- XLSX for Excel file parsing
- PapaParse for CSV parsing
- Multer for file uploads

**Note**: The application is designed to potentially use Drizzle ORM with PostgreSQL (configuration exists in drizzle.config.ts), but currently relies on file-based storage. The database integration may be added later for persistence.

## Pre-Publishing Review Checklist

Before publishing the app, verify the following:

### Localisation (NZ English)
- [ ] All text uses New Zealand English spelling (e.g., "colour" not "color", "organise" not "organize")
- [ ] All dates display in DD/MM/YYYY format
- [ ] All timestamps in logs and documentation use NZ time (Pacific/Auckland, NZDT/NZST)

### Media Loading
- [ ] HEIC to JPEG conversion is working correctly (check server logs for conversion messages)
- [ ] Photos load before videos and audio (priority loading for first 3 photos)
- [ ] Media loading times remain optimised (Cache-Control headers set, HEIC cache working)
- [ ] The app can locate and load media items from Google Drive effectively

### Visual Consistency
- [ ] All Polaroid photo borders are consistent white (not grey)
- [ ] Loading placeholders match the Polaroid frame colour
- [ ] Custom marker icons display correctly on the map

### Data & Categories
- [ ] All memories use `categories` property (not `tags`)
- [ ] Category filtering works correctly for all categories (travel, food, event, family, music)
- [ ] Food menu sub-filtering by identifier works correctly

### Documentation
- [ ] Version number updated in replit.md
- [ ] Release date updated with NZ timezone
- [ ] RELEASE_NOTES.md updated with comprehensive feature and version notes
- [ ] Any breaking changes or important updates noted

### Photo Carousel
- [ ] **Desktop (mouse)**: Clicking < and > arrows navigates one photo at a time
- [ ] **Mobile (touch)**: Tapping < and > arrows navigates one photo at a time (no double-jump)
- [ ] **Mobile (swipe)**: Swiping left/right on the photo navigates correctly
- [ ] Wrapping navigation works: from first photo, < goes to last; from last photo, > goes to first
- [ ] Photo counter displays correctly (e.g., "3 / 10")
- [ ] All photos in a memory appear in both the polaroid grid and the carousel

### Multi-Memory Location Popup
- [ ] Markers at locations with multiple memories show count badge
- [ ] Clicking grouped marker shows popup card with memory list
- [ ] Memory titles wrap correctly for long text
- [ ] Categories display below titles in smaller font
- [ ] Popup is scrollable when many memories at one location
- [ ] Clicking a memory title navigates to memory detail
- [ ] X button closes the popup
- [ ] Clicking outside the popup closes it
- [ ] Back button from memory detail returns to map without popup

### Memory Toggle Badge
- [ ] Pink badge shows travel memories only with correct count
- [ ] Blue badge shows all memories with correct count
- [ ] Clicking badge toggles between pink and blue states
- [ ] Custom markers display for each category (hearts for family, notes for music)
- [ ] Toggle persists when navigating back from memory detail

### Gift Wrapping (Christmas Day 2025)
- [ ] All category tiles show gift-wrapped with countdown timer before unlock time
- [ ] Countdown displays correctly in hours:minutes:seconds format
- [ ] Each category unlocks at the correct NZT time (Events 09:00, Family 11:00, Food 13:00, Music 15:00, Surprise 17:00, Travel 19:00)
- [ ] Unwrap animation plays smoothly when countdown reaches zero
- [ ] Categories remain permanently unwrapped after their unlock time
- [ ] Gift wrap appearance: pink/white diagonal stripes with white bow

### Functionality
- [ ] Authentication works with ACCESS_CODE
- [ ] Google Drive connection established (check logs for "Google Drive connected successfully")
- [ ] All view states work correctly (auth, landing, map, food-menu, filtered, detail)
- [ ] Back navigation works correctly from all views
- [ ] Travel memory back navigation returns to map location (not homepage)
- [ ] Category cards display in correct order: Events, Family and friends, Food, Music, Surprise Me, Travel