import { useState, useEffect, useRef } from 'react';
import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Home, Calendar, ImageOff, ArrowLeft, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import customMarkerIcon from '@assets/Untitled design (1)_1763443679229.png';

// Helper to detect video files
const isVideoFile = (filename: string) => {
  const ext = filename.toLowerCase().split('.').pop();
  return ['mp4', 'mov', 'avi', 'webm', 'm4v', 'mkv'].includes(ext || '');
};

// Lazy load video component - only loads when visible
function LazyVideo({ src, index }: { src: string; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="aspect-video bg-card rounded-xl overflow-hidden shadow-lg"
      data-testid={`video-${index}`}
    >
      {isVisible ? (
        <>
          {!hasLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <video
            src={src}
            controls
            className={`w-full h-full ${!hasLoaded ? 'hidden' : ''}`}
            onLoadedData={() => setHasLoaded(true)}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <div className="text-muted-foreground text-sm">Video</div>
        </div>
      )}
    </div>
  );
}

// Lazy load audio component - only loads when visible
function LazyAudio({ src, index }: { src: string; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-card p-6 rounded-xl shadow-md"
    >
      <p className="font-handwritten text-lg mb-4">Audio {index + 1}</p>
      {isVisible ? (
        <audio
          src={src}
          controls
          className="w-full"
          data-testid={`audio-${index}`}
          preload="metadata"
        >
          Your browser does not support the audio tag.
        </audio>
      ) : (
        <div className="h-12 flex items-center justify-center bg-muted/30 rounded">
          <div className="text-muted-foreground text-sm">Loading audio...</div>
        </div>
      )}
    </div>
  );
}

function MediaImage({ src, alt, className, onClick, priority = false }: { src: string; alt: string; className?: string; onClick?: () => void; priority?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const filename = src.split('/').pop() || '';
  
  if (hasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-muted/50 ${className}`}
        onClick={onClick}
      >
        <ImageOff className="w-12 h-12 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground text-center px-2">Image unavailable</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{filename}</p>
      </div>
    );
  }
  
  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-white ${className}`}>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onClick={onClick}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}

interface MemoryDetailProps {
  memory: Memory;
  onBack: () => void;
  onHome: () => void;
  onViewOnMap: () => void;
}

export default function MemoryDetail({ memory, onBack, onHome, onViewOnMap }: MemoryDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Get all photos (excluding videos)
  const allPhotos = memory.photoFiles.filter(f => !isVideoFile(f));

  // Scroll to top when memory detail opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [memory.id]);

  // Navigation functions for lightbox
  const goToPrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? allPhotos.length - 1 : selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === allPhotos.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go forward
        goToNext();
      } else {
        // Swiped right - go backward
        goToPrevious();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // If parsing fails or returns invalid date, show the original text
    if (isNaN(date.getTime())) {
      return dateString;
    }
    // Format as DD/MM/YYYY for NZ
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAudioToggle = (audioFile: string) => {
    if (playingAudio === audioFile) {
      setPlayingAudio(null);
      console.log('Paused audio:', audioFile);
    } else {
      setPlayingAudio(audioFile);
      console.log('Playing audio:', audioFile);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Navigation Buttons - Upper Left - Stack vertically on mobile */}
      <div className="fixed top-4 left-4 z-30 flex flex-col sm:flex-row gap-2">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          style={{ backgroundColor: '#FF327F' }}
          onClick={onHome}
          data-testid="button-home"
        >
          <Home className="w-5 h-5 text-white" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          style={{ backgroundColor: '#FF327F' }}
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </Button>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 pl-16">
          <h1 className="text-2xl font-handwritten">{memory.title}</h1>
        </div>
      </div>

      {/* Hero image - 50% reduced height */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={customMarkerIcon} 
            alt="Memory location" 
            className="w-32 h-32 opacity-30"
            style={{
              filter: 'invert(49%) sepia(73%) saturate(4862%) hue-rotate(316deg) brightness(101%) contrast(101%)'
            }}
          />
        </div>
        
        {/* Location badge - clickable to view on map */}
        <div className="absolute bottom-4 right-4 max-w-[60%] sm:max-w-none">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 sm:px-4 py-2 shadow-lg rounded-full"
            onClick={onViewOnMap}
            data-testid="button-view-on-map"
          >
            <MapPin className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" style={{ color: '#FF327F' }} />
            <span className="font-mono text-xs sm:text-sm truncate">
              <span className="sm:hidden">{memory.city}</span>
              <span className="hidden sm:inline">{memory.city}, {memory.country}</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Date and description */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span className="text-lg font-handwritten">{formatDate(memory.date)}</span>
          </div>
          
          <p className="text-lg leading-relaxed font-mono text-foreground/90">
            {memory.description}
          </p>
        </div>

        {/* Photo gallery - filter out video files */}
        {allPhotos.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-handwritten">Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPhotos.map((photo, index) => (
                <div
                  key={photo}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
                  data-testid={`image-gallery-${index}`}
                  style={{
                    transform: `rotate(${index % 3 === 0 ? -1 : index % 3 === 1 ? 1 : 0}deg)`,
                  }}
                >
                  <div className="bg-white px-4 pt-4 pb-20 rounded-md shadow-lg hover-elevate active-elevate-2 transition-transform">
                    <div className="aspect-square rounded-sm overflow-hidden">
                      <MediaImage
                        src={`/api/media/${photo}`}
                        alt={`Memory photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        priority={index < 3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video section - combine videoFiles and any videos in photoFiles (lazy loaded) */}
        {(() => {
          const allVideos = [
            ...(memory.videoFiles || []),
            ...memory.photoFiles.filter(f => isVideoFile(f))
          ];
          return allVideos.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-handwritten">Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allVideos.map((video, index) => (
                  <LazyVideo key={video} src={`/api/media/${video}`} index={index} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Audio section (lazy loaded) */}
        {memory.audioFiles && memory.audioFiles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-handwritten">Audio Memories</h2>
            <div className="space-y-4">
              {memory.audioFiles.map((audio, index) => (
                <LazyAudio key={audio} src={`/api/media/${audio}`} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image lightbox with navigation */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImageIndex !== null && allPhotos[selectedImageIndex] && (
            <div 
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={`/api/media/${allPhotos[selectedImageIndex]}`}
                alt={`Full size memory ${selectedImageIndex + 1}`}
                className="w-full h-auto rounded-lg"
                draggable={false}
              />
              
              {/* Navigation arrows - only show if more than 1 photo */}
              {allPhotos.length > 1 && (
                <>
                  {/* Previous button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                    data-testid="button-previous-image"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Next button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                    data-testid="button-next-image"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full">
                    <span className="text-white text-sm font-mono">
                      {selectedImageIndex + 1} / {allPhotos.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
