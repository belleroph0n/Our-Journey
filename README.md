# Our Journey — Interactive Memory Map

> *"Every memory is a step on our journey together."*

A heartfelt interactive memory mapping application built as a digital gift. Explore shared memories on an immersive 3D globe, with photos, videos, and audio recordings brought to life in a hand-drawn scrapbook aesthetic.

**Live at:** [alexndan.com](https://alexndan.com)  
**Current Version:** 2.5.0

---

## What It Does

"Our Journey" lets you explore cherished memories pinned to a world map. Each location on the globe holds a story — click a marker to discover photos, videos, audio, and written descriptions styled like pages from a travel journal.

### Key Features

- **Interactive 3D Globe** — Mapbox-powered globe centred on New Zealand, with fly-to animations and atmospheric fog effects
- **Six Memory Categories** — Events, Family & Friends, Food, Music, Surprise Me, and Travel, each with a hand-drawn illustration
- **Food Menu** — A fine dining restaurant-style sub-menu for exploring food memories by course
- **Photo Carousel** — Full-screen lightbox with swipe gestures on mobile and keyboard navigation
- **Polaroid Gallery** — Photos displayed in authentic Polaroid-style frames with handwritten captions
- **Multi-Media Support** — Photos (incl. HEIC), videos, and audio recordings per memory
- **Category Filtering** — Toggle between travel-only and all-memory views on the map
- **Grouped Location Markers** — Multiple memories at one location show a count badge and popup list
- **Password Protected** — Simple access code entry with "remember this device" support

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Mapbox](https://www.mapbox.com/) account and public token
- A Google Cloud service account with Drive API access
- A Google Drive folder containing your memory data

### Environment Secrets

The following secrets must be configured (via Replit Secrets or your own `.env` file):

| Secret | Description |
|---|---|
| `ACCESS_CODE` | Password used to enter the app |
| `SESSION_SECRET` | Random secret for signing session cookies |
| `VITE_MAPBOX_TOKEN` | Mapbox public access token |
| `GOOGLE_DRIVE_FOLDER_ID` | ID of your Google Drive folder |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Full JSON credentials for your service account |

### Running Locally

```bash
npm install
npm run dev
```

The app runs on port 5000 by default.

---

## Google Drive Setup

All memories and media files live in a single Google Drive folder. The app reads from it automatically on startup.

### Folder Structure

```
Your Google Drive Folder/
├── memories.xlsx          ← Your spreadsheet (or .csv / Google Sheets)
├── photo-01.jpg
├── photo-02.heic          ← HEIC files are auto-converted to JPEG
├── video-01.mp4
└── audio-01.mp3
```

### Spreadsheet Format

Your spreadsheet should have these columns (column names are flexible — the parser accepts common variations):

| Column | Required | Description |
|---|---|---|
| `title` | Yes | Memory title |
| `country` | Yes | Country name |
| `city` | Yes | City or place name |
| `latitude` | Yes | Decimal latitude |
| `longitude` | Yes | Decimal longitude |
| `date` | Yes | Date of the memory (DD/MM/YYYY recommended) |
| `description` | No | Written description of the memory |
| `categories` | No | Comma-separated: `travel`, `food`, `event`, `family`, `music` |
| `identifier` | No | Food sub-category (see Food Menu below) |
| `photos` | No | Comma-separated filenames of photos |
| `videos` | No | Comma-separated filenames of videos |
| `audio` | No | Comma-separated filenames of audio files |

### Food Sub-Categories (identifier field)

Use the `identifier` column to place food memories into specific menu courses:

| Identifier | Menu Course |
|---|---|
| `degustation` | Degustation |
| `appetiser` | Appetisers |
| `comfort` | Comfort Food |
| `two` | Main for Two |
| `more` | Main for More |
| `dessert` | Dessert |
| *(blank)* | Appears only in "Just Feed Me" |

---

## Project Structure

```
├── client/
│   └── src/
│       ├── components/
│       │   ├── InteractiveMap.tsx    ← Globe, markers, filtering
│       │   ├── LandingPage.tsx       ← Category tiles with animations
│       │   ├── MemoryDetail.tsx      ← Photo carousel, media gallery
│       │   ├── FoodMenu.tsx          ← Restaurant-style food sub-menu
│       │   └── ui/                   ← shadcn/ui components
│       └── pages/
│           ├── Home.tsx              ← Auth, landing, map, detail views
│           └── admin.tsx             ← Admin panel (Google Drive status)
├── server/
│   ├── routes.ts                     ← API endpoints
│   ├── google-drive.ts               ← Google Drive integration
│   ├── memory-parser.ts              ← Spreadsheet → Memory objects
│   └── storage.ts                    ← Storage abstraction layer
├── shared/
│   └── schema.ts                     ← Zod schemas and TypeScript types
├── RELEASE_NOTES.md
└── README.md
```

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** — build tool and dev server
- **Mapbox GL JS** v3.0.1 — interactive 3D globe
- **Tailwind CSS** — styling with custom handwritten font theme
- **shadcn/ui** — Radix UI-based component library
- **TanStack Query** — server state and data fetching
- **Wouter** — client-side routing
- **Framer Motion** — page and element animations
- **Embla Carousel** — photo gallery carousel

### Backend
- **Express.js** on Node.js with TypeScript
- **Express-session** — cookie-based session management
- **Multer** — file upload handling
- **Sharp** — HEIC/HEIF to JPEG image conversion
- **XLSX + PapaParse** — Excel and CSV parsing

### Storage
- **Google Drive** (primary) — all memories and media via Drive API v3
- **Replit Object Storage** (legacy fallback)
- **Local filesystem** (development fallback)

---

## Media Handling

- **HEIC/HEIF photos** are automatically converted to JPEG on the server and cached for fast repeat loads
- **Photos load first** — videos and audio only load once scrolled into view
- **Priority loading** — the first 3 photos in a memory load with high priority
- **Long-lived caching** — media served with 1-year cache headers for optimal performance
- **Supported formats:**
  - Images: JPEG, PNG, GIF, WebP, HEIC, HEIF
  - Videos: MP4, MOV, AVI, WebM
  - Audio: MP3, WAV, M4A, AAC

---

## Authentication

Access is controlled by a single access code stored in the `ACCESS_CODE` environment secret. There are no user accounts.

- **Session duration**: 30 days by default
- **Remember device**: 1-year cookie when ticked on login
- Session cookies use `sameSite: lax` and trust the Replit reverse proxy in production

---

## Admin Panel

Navigate to `/admin` after logging in to:

- Check Google Drive connection status
- See how many memories and media files are loaded
- Refresh the connection to pull the latest changes from Drive

To add or update memories, edit your spreadsheet and media files directly in Google Drive — no upload needed through the app.

---

## Design System

The app uses a custom scrapbook/travel journal aesthetic:

- **Handwritten fonts**: Caveat and Patrick Hand for titles and headings
- **Serif content font**: Crimson Text for memory descriptions
- **Signature pink**: `#FF327F` for markers, badges, and accents
- **Polaroid frames**: White borders with authentic 5× bottom border proportions
- **Paper textures**: Warm pastel watercolour background

---

## Localisation

All text uses **New Zealand English** spelling and conventions:

- "colour", "organise", "programme", etc.
- Dates displayed in DD/MM/YYYY format
- Server logs and timestamps in NZ time (Pacific/Auckland, NZDT/NZST)

---

## Release History

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for the full version history.

| Version | Date | Highlights |
|---|---|---|
| 2.5.0 | 24 Dec 2025 | Christmas gift-wrapping with countdown timers |
| 2.4.0 | 24 Dec 2025 | Custom image markers per category |
| 2.3.0 | 23 Dec 2025 | Photo carousel, multi-memory popups, map filter toggle |
| 2.2.0 | 22 Dec 2025 | Direct marker navigation, visual refinements |
| 2.1.0 | 21 Dec 2025 | Food menu, identifier sub-filtering |
| 2.0.0 | 20 Dec 2025 | HEIC caching, smart media loading |
| 1.3.0 | 20 Dec 2025 | Google Drive as primary storage |
| 1.0.0 | 20 Dec 2025 | Initial release |

---

*Built with love.*
