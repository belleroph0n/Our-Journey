# Our Journey - Interactive Memory Map

## Overview

"Our Journey" is an interactive memory mapping application that allows users to visualize and explore shared memories on a global map. The application features a password-protected interface with an immersive 3D globe/map experience powered by Mapbox, where users can view memories as custom pin markers, click to see detailed views with photos, videos, and audio recordings. The design aesthetic is inspired by hand-drawn travel journals and scrapbooks, creating a warm, intimate digital experience.

## User Preferences

Preferred communication style: Simple, everyday language.

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

**File Upload System**: Multer for handling multipart form data with in-memory storage (50MB file size limit). Files are processed and saved to local filesystem directories (`uploads/` for memory data files, `uploads/media/` for photos/videos/audio).

**File Parsing**: Supports Excel (.xlsx, .xls) and CSV file formats for memory data. Uses XLSX library for Excel parsing and PapaParse for CSV parsing. The memory parser converts spreadsheet rows into standardized Memory objects with flexible column name mapping.

### Data Storage Solutions

**Primary Storage**: File-based storage system (no database currently used). Memory data is stored as uploaded Excel/CSV files, and media files are stored in the filesystem.

**Memory Data Structure**: Each memory contains: id, title, country, city, latitude, longitude, date, description, tags (array), photoFiles (array), videoFiles (array), audioFiles (array).

**In-Memory Storage Stub**: A MemStorage class exists in `server/storage.ts` for potential user management but is not actively used in the current implementation.

**Schema Validation**: Zod schemas define the shape of Memory objects and form inputs, ensuring type safety across the stack.

### External Dependencies

**Mapbox GL JS**: Interactive map and 3D globe visualization (v3.0.1). Requires VITE_MAPBOX_TOKEN environment variable. Provides custom styling, globe projection, fog effects, and marker management.

**Google Drive Integration**: Optional integration for accessing files from Google Drive. Uses googleapis library with OAuth2 authentication through Replit Connectors. The integration fetches access tokens dynamically and creates uncachable Drive clients to handle token expiration.

**Replit-Specific Integrations**:
- Replit Connectors for Google Drive OAuth
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