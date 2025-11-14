import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Home, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InteractiveMapProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  onHomeClick?: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function InteractiveMap({ memories, onMemorySelect, onHomeClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

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
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                fill="hsl(345, 70%, 55%)" 
                stroke="white" 
                stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `;

      el.addEventListener('click', () => {
        setSelectedMemory(memory);
      });

      if (map.current) {
        new mapboxgl.Marker(el)
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

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Floating controls */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-4 z-10">
        {onHomeClick && (
          <Button
            size="icon"
            className="rounded-full shadow-lg"
            onClick={onHomeClick}
            data-testid="button-home"
          >
            <Home className="w-5 h-5" />
          </Button>
        )}
        
        <Badge variant="secondary" className="px-4 py-2 text-sm font-handwritten shadow-lg">
          {memories.length} memories to explore
        </Badge>
      </div>

      {/* Memory preview card */}
      {selectedMemory && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-4">
          <div className="bg-card rounded-xl shadow-2xl overflow-hidden border border-card-border">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-primary" />
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
