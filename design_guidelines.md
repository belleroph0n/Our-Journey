# Design Guidelines for "Our Journey" Interactive Memory Map

## Design Approach

**Selected Approach:** Custom aesthetic inspired by hand-drawn travel journals and scrapbooks, with interaction patterns borrowed from Airbnb's exploration model and modern map interfaces.

**Core Principle:** Create a warm, intimate digital scrapbook that feels tactile and personal—like flipping through a beloved photo album. Every interaction should evoke nostalgia and care.

## Typography

**Primary Font (Headings & Titles):** Google Fonts - "Caveat" or "Patrick Hand" (handwritten style)
- Memory titles: text-4xl to text-6xl, font-bold
- Section headers: text-2xl to text-3xl
- Navigation: text-lg

**Secondary Font (Body Content):** Google Fonts - "Crimson Text" (serif for stories) paired with "Inter" (sans-serif for UI elements)
- Story descriptions: text-base to text-lg, leading-relaxed
- Metadata/dates: text-sm, tracking-wide
- UI labels: text-sm to text-base

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, and 16
- Component padding: p-4, p-8
- Section spacing: space-y-8, space-y-12
- Grid gaps: gap-4, gap-8
- Margins: m-2, m-4, m-8

**Container Strategy:**
- Full-width globe/map: w-full h-screen
- Memory detail pages: max-w-4xl mx-auto px-8
- Media galleries: max-w-6xl mx-auto

## Core Components

### Authentication Screen
- Centered card (max-w-md) with soft, rounded corners (rounded-2xl)
- Single password input with handwritten label
- "Remember this device" checkbox with playful icon
- Welcoming message: "Welcome to Our Journey" in handwritten font
- Subtle paper texture background treatment

### Interactive Globe/Map Interface
- Full-screen immersive experience (w-full h-screen)
- Floating legend/controls in bottom-right (absolute positioning)
- Custom pin markers styled as hand-drawn pushpins with subtle drop shadows
- Pin hover state: gentle scale-up (scale-110) with soft glow
- Click: smooth zoom animation to location (duration-700, ease-in-out)

### Memory Detail Pages
**Layout Structure:**
- Back button (top-left): Hand-drawn arrow icon + "Back to Map"
- Hero section: Large featured image from memory (h-96 object-cover rounded-xl)
- Title overlay: Handwritten font, large (text-5xl), with semi-transparent backdrop-blur
- Date/location badge: Small pill with sketchy border, positioned top-right of hero

**Content Grid:**
- Story section: Single column prose (max-w-prose), generous line-height (leading-relaxed)
- Media gallery: Masonry grid layout (grid-cols-2 md:grid-cols-3 gap-4)
- Photos: Polaroid-style frames (p-4 bg-treatment, rotate-1/-rotate-1 for variety)
- Videos: 16:9 aspect ratio with rounded corners, play button overlay
- Audio clips: Waveform visualization or simple playback controls with handwritten labels

### Navigation Components
- Floating "Home" button: Fixed bottom-left, rounded-full, with sketchy icon
- Memory counter: "12 memories explored" in handwritten font, subtle fade-in
- Progress indicator: Hand-drawn path connecting visited locations on globe

## Interaction Patterns

### Transitions & Animations
**Use Sparingly - Focus on:**
- Globe zoom to memory: Smooth camera animation (1-1.5s duration)
- Page transitions: Gentle fade + slight vertical slide (translate-y-4)
- Image loading: Soft fade-in (opacity transition)
- Pin appearances: Staggered bounce-in effect when globe loads

**Avoid:** Excessive scroll animations, parallax effects, or continuous motion

### Touch & Click Interactions
- Pins: Tap/click reveals preview card with small image + title
- Preview card: "Explore" button zooms to full memory page
- Media gallery: Lightbox modal for full-screen viewing (simple fade overlay)
- Audio players: Single-click play/pause, no complex controls

## Component Library

### Cards
- Memory preview cards: rounded-xl, p-6, with subtle sketch border effect
- Quote/highlight boxes: Handwritten font, rotated text, paper-torn edges

### Buttons
- Primary CTA: Rounded-full, px-8 py-3, handwritten font
- Secondary: Outlined with sketchy border, transparent bg
- Icon buttons: rounded-full, p-3, single icon centered

### Form Elements
- Inputs: rounded-lg, p-4, focus ring with soft glow
- Labels: Handwritten font, text-sm, mb-2

### Icons
**Library:** Heroicons (via CDN)
- Use outline style for navigation (map-pin, arrow-left, home)
- Use solid style for interactive states (heart-solid for favorites)
- Custom sketchy treatment via CSS filter or stroke styling

## Images

### Hero Section (Authentication Page)
**Image Description:** Soft watercolor map illustration showing interconnected continents with delicate pin markers, warm peachy-pink tones fading to sky blue
**Placement:** Full-page background (fixed, bg-cover), overlaid with translucent gradient for text readability

### Memory Detail Pages
**Featured Image:** First photo from Google Drive folder for that memory
**Placement:** Top of page, full-width, h-96, rounded-xl, object-cover
**Treatment:** Subtle vignette overlay, soft shadow (shadow-2xl)

### Gallery Images
**Source:** All photos from corresponding Google Drive folder
**Layout:** Polaroid frames in masonry grid, varied slight rotations (-2deg to 2deg)
**Loading:** Progressive blur-up technique

## Accessibility

- Maintain WCAG AA contrast on all overlays
- Provide alt text for all memory images (pull from metadata)
- Keyboard navigation: Tab through pins, Enter to select
- Screen reader announcements for map interactions
- Skip links for navigation bypass

## Responsive Behavior

**Mobile (< 768px):**
- Stack all layouts single-column
- Globe: Touch gestures for pan/zoom
- Memory grid: grid-cols-1
- Reduce spacing: p-4 instead of p-8
- Simplified navigation: Hamburger menu if needed

**Tablet (768px - 1024px):**
- Memory grid: grid-cols-2
- Moderate spacing: p-6

**Desktop (> 1024px):**
- Full grid layouts: grid-cols-3
- Generous spacing: p-8 to p-16
- Hover states active

This design creates an intimate, magical experience that honors shared memories through thoughtful, restrained visual storytelling.