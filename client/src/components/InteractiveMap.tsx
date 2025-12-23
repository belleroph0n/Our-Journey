import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Home, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InteractiveMapProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  onHomeClick?: () => void;
  onBack?: () => void;
  focusMemory?: Memory | null;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

type LocationGroup = {
  key: string;
  lat: number;
  lng: number;
  memories: Memory[];
};

function groupMemoriesByLocation(memories: Memory[]): LocationGroup[] {
  const groups: Record<string, LocationGroup> = {};
  
  memories.forEach((memory) => {
    const key = `${memory.latitude.toFixed(6)},${memory.longitude.toFixed(6)}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        lat: memory.latitude,
        lng: memory.longitude,
        memories: []
      };
    }
    groups[key].memories.push(memory);
  });
  
  return Object.values(groups);
}

function getCategoryLabel(categories: string[] | undefined): string {
  if (!categories || categories.length === 0) return '';
  return categories[0].charAt(0).toUpperCase() + categories[0].slice(1);
}

function getMarkerSvg(categories: string[]): string {
  const lowerCategories = categories.map(c => c.toLowerCase());
  
  if (lowerCategories.includes('family') || lowerCategories.includes('friends')) {
    return `
      <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#FF327F"/>
        <path d="M12 6.5c-0.5-0.5-1.3-0.8-2-0.8-1.5 0-2.7 1.2-2.7 2.7 0 0.6 0.2 1.1 0.5 1.6L12 14.5l4.2-4.5c0.3-0.5 0.5-1 0.5-1.6 0-1.5-1.2-2.7-2.7-2.7-0.7 0-1.5 0.3-2 0.8z" fill="white"/>
      </svg>
    `;
  }
  
  if (lowerCategories.includes('music')) {
    return `
      <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#FF327F"/>
        <path d="M14.5 6v7.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c0.4 0 0.8 0.1 1.2 0.3V7.5l-4 1V15c0 1.4-1.1 2.5-2.5 2.5" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="12" cy="13.5" r="2" fill="white"/>
      </svg>
    `;
  }
  
  if (lowerCategories.includes('food')) {
    return `
      <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#FF327F"/>
        <path d="M8 6v4c0 1.1 0.9 2 2 2v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8 8h2M8 10h2" stroke="white" stroke-width="1" stroke-linecap="round"/>
        <path d="M14 6c0 2 2 3 2 5 0 1.1-0.9 2-2 2s-2-0.9-2-2c0-2 2-3 2-5z" fill="white"/>
        <path d="M14 13v5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
  }
  
  return `
    <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#FF327F"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;
}

export default function InteractiveMap({ memories, onMemorySelect, onHomeClick, onBack, focusMemory }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [multiMemoryPopup, setMultiMemoryPopup] = useState<Memory[] | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback((e: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      setMultiMemoryPopup(null);
      setPopupPosition(null);
    }
  }, []);

  useEffect(() => {
    if (multiMemoryPopup) {
      document.addEventListener('click', handleMapClick, true);
      return () => {
        document.removeEventListener('click', handleMapClick, true);
      };
    }
  }, [multiMemoryPopup, handleMapClick]);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!MAPBOX_TOKEN) {
      console.error('VITE_MAPBOX_TOKEN is not set. Please add your Mapbox token to the secrets.');
      return;
    }

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

    const locationGroups = groupMemoriesByLocation(memories);

    locationGroups.forEach((group) => {
      const allCategories = group.memories.flatMap(m => m.categories || []);
      const hasTravel = allCategories.some(c => c.toLowerCase() === 'travel');
      const hasFood = allCategories.some(c => c.toLowerCase() === 'food');
      const el = document.createElement('div');
      el.className = 'memory-marker';
      el.style.cursor = 'pointer';
      
      if (hasTravel) {
        el.style.width = '44px';
        el.style.height = '44px';
        el.style.backgroundImage = `url("${new URL('@assets/Untitled design (1)_1763443679229.png', import.meta.url).href}")`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
        el.style.filter = 'invert(40%) sepia(80%) saturate(2000%) hue-rotate(315deg) brightness(100%) contrast(95%) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
      } else if (hasFood) {
        el.style.width = '44px';
        el.style.height = '44px';
        el.innerHTML = `
          <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
            <g stroke="white" stroke-width="2">
              <path d="M14 5v18c0 3 2 5 5 5v25" fill="#FF327F" stroke-linejoin="round"/>
              <path d="M10 5v8c0 2 1.5 3.5 4 4v8" fill="none"/>
              <path d="M14 5v8" fill="none"/>
              <path d="M18 5v8c0 2-1.5 3.5-4 4" fill="none"/>
              <path d="M26 5c0 8 5 10 5 16 0 3-2 5-5 5s-5-2-5-5c0-6 5-8 5-16z" fill="#FF327F" stroke-linejoin="round"/>
              <path d="M26 26v27" fill="none" stroke-linecap="round"/>
            </g>
          </svg>
        `;
      } else {
        el.style.width = '32px';
        el.style.height = '40px';
        el.innerHTML = getMarkerSvg(allCategories);
      }

      if (group.memories.length > 1) {
        const badge = document.createElement('div');
        badge.style.position = 'absolute';
        badge.style.top = '-6px';
        badge.style.right = '-6px';
        badge.style.backgroundColor = '#FF327F';
        badge.style.color = 'white';
        badge.style.borderRadius = '50%';
        badge.style.width = '20px';
        badge.style.height = '20px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.fontSize = '11px';
        badge.style.fontWeight = 'bold';
        badge.style.border = '2px solid white';
        badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        badge.textContent = group.memories.length.toString();
        el.style.position = 'relative';
        el.appendChild(badge);
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (group.memories.length === 1) {
          onMemorySelect(group.memories[0]);
        } else {
          const rect = el.getBoundingClientRect();
          setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.top
          });
          setMultiMemoryPopup(group.memories);
        }
      });

      if (map.current) {
        new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([group.lng, group.lat])
          .addTo(map.current);
      }
    });

    return () => {
      setMultiMemoryPopup(null);
      setPopupPosition(null);
      if (map.current) {
        map.current.remove();
      }
    };
  }, [memories]);

  useEffect(() => {
    if (focusMemory && map.current) {
      map.current.flyTo({
        center: [focusMemory.longitude, focusMemory.latitude],
        zoom: 14,
        essential: true,
        duration: 1500
      });
    }
  }, [focusMemory]);

  const handleCloseMultiMemoryPopup = () => {
    setMultiMemoryPopup(null);
    setPopupPosition(null);
  };

  const handleMemoryFromPopup = (memory: Memory) => {
    setMultiMemoryPopup(null);
    setPopupPosition(null);
    onMemorySelect(memory);
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
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

      <div className="absolute bottom-8 left-8 z-10">
        <Badge variant="secondary" className="px-4 py-2 text-sm font-handwritten shadow-lg">
          {memories.length} memories to explore
        </Badge>
      </div>

      {multiMemoryPopup && popupPosition && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{
            left: Math.min(Math.max(popupPosition.x - 140, 16), window.innerWidth - 296),
            top: Math.max(popupPosition.y - 8, 16),
            width: '280px',
            maxHeight: '320px',
            transform: 'translateY(-100%)'
          }}
          data-testid="popup-multi-memory"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {multiMemoryPopup.length} memories at this location
            </span>
            <button
              onClick={handleCloseMultiMemoryPopup}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              data-testid="button-close-multi-memory"
              aria-label="Close memory list"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: '268px' }}>
            {multiMemoryPopup.map((memory) => (
              <button
                key={memory.id}
                onClick={() => handleMemoryFromPopup(memory)}
                className="w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                data-testid={`button-memory-${memory.id}`}
              >
                <div className="text-xs text-gray-900 dark:text-gray-100 leading-snug break-words">
                  {memory.title}
                </div>
                {memory.categories && memory.categories.length > 0 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {getCategoryLabel(memory.categories)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
