import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Home, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import customMarkerIcon from '@assets/Untitled design (1)_1763443679229.png';

interface InteractiveMapProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  onHomeClick?: () => void;
  onBack?: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function InteractiveMap({ memories, onMemorySelect, onHomeClick, onBack }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!MAPBOX_TOKEN) {
      console.error('VITE_MAPBOX_TOKEN is not set. Please add your Mapbox token to the secrets.');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [174, -41],
      zoom: 2,
      projection: 'globe' as any,
    });

    map.current.on('style.load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6,
        });
      }
    });

    // Add markers for each memory
    memories.forEach((memory) => {
      const el = document.createElement('div');
      el.className = 'memory-marker';
      el.style.width = '44px';
      el.style.height = '44px';
      el.style.cursor = 'pointer';
      el.style.backgroundImage = `url("${new URL('@assets/Untitled design (1)_1763443679229.png', import.meta.url).href}")`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.filter = 'invert(40%) sepia(80%) saturate(2000%) hue-rotate(315deg) brightness(100%) contrast(95%) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';

      el.addEventListener('click', () => {
        setSelectedMemory(memory);
      });

      if (map.current) {
        new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([memory.longitude, memory.latitude])
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [memories]);

  const handleExploreMemory = () => {
    if (selectedMemory) {
      onMemorySelect(selectedMemory);
    }
  };

  const handleCloseCard = () => {
    setSelectedMemory(null);
    setSwipeOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (swipeOffset > 100) {
      handleCloseCard();
    } else {
      setSwipeOffset(0);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Home Button - Upper Left */}
      {(onHomeClick || onBack) && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            size="icon"
            className="rounded-full shadow-lg"
            style={{ backgroundColor: '#FF327F' }}
            onClick={onBack || onHomeClick}
            data-testid="button-home"
          >
            <Home className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}

      {/* Memory count badge - Bottom Left */}
      <div className="absolute bottom-8 left-8 z-10">
        <Badge variant="secondary" className="px-4 py-2 text-sm font-handwritten shadow-lg">
          {memories.length} memories to explore
        </Badge>
      </div>

      {/* Memory preview card */}
      {selectedMemory && (
        <div 
          className="absolute top-8 z-10 w-full max-w-sm px-4"
          style={{
            left: '50%',
            transform: `translate(-50%, ${swipeOffset}px)`,
            opacity: 1 - (swipeOffset / 300),
            transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
          }}
        >
          <div 
            ref={cardRef}
            className="bg-card rounded-xl shadow-2xl overflow-visible border border-card-border relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={handleCloseCard}
              className="absolute top-3 right-3 z-20 transition-opacity hover:opacity-100"
              data-testid="button-close-memory-card"
              aria-label="Close memory card"
            >
              <X className="w-5 h-5 text-muted-foreground/30" />
            </button>

            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <img 
                src={customMarkerIcon} 
                alt="Memory location" 
                className="w-16 h-16"
                style={{
                  filter: 'invert(49%) sepia(73%) saturate(4862%) hue-rotate(316deg) brightness(101%) contrast(101%)'
                }}
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-handwritten text-card-foreground">
                  {selectedMemory.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {selectedMemory.city}, {selectedMemory.country}
                </p>
              </div>
              <p className="text-card-foreground/80 text-sm line-clamp-2 font-mono">
                {selectedMemory.description}
              </p>
              <Button 
                className="w-full"
                style={{ backgroundColor: '#FF327F' }}
                onClick={handleExploreMemory}
                data-testid="button-explore-memory"
              >
                Explore This Memory
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
