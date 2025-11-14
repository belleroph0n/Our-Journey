import { useState } from 'react';
import AuthPage from '@/components/AuthPage';
import InteractiveMap from '@/components/InteractiveMap';
import MemoryDetail from '@/components/MemoryDetail';
import { Memory } from '@shared/schema';

// TODO: remove mock functionality - replace with actual data from Google Drive
const mockMemories: Memory[] = [
  {
    id: 'bali2022',
    title: 'Bali Getaway',
    country: 'Indonesia',
    city: 'Ubud',
    latitude: -8.5069,
    longitude: 115.2625,
    date: '2022-06-15',
    description: 'Our first trip after lockdown was absolutely magical. We spent two weeks exploring the lush rice terraces, discovering hidden waterfalls, and immersing ourselves in the local culture.',
    photoFiles: ['bali1.jpg', 'bali2.jpg', 'bali3.jpg'],
    videoFiles: ['bali-waterfall.mp4'],
    audioFiles: ['jungle-sounds.mp3'],
  },
  {
    id: 'paris2023',
    title: 'Paris Romance',
    country: 'France',
    city: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    date: '2023-04-20',
    description: 'Sunset at the Eiffel Tower, croissants for breakfast, and endless walks along the Seine. Every corner of this city felt like a scene from a movie.',
    photoFiles: ['paris1.jpg', 'paris2.jpg', 'paris3.jpg', 'paris4.jpg'],
  },
  {
    id: 'tokyo2023',
    title: 'Tokyo Adventure',
    country: 'Japan',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    date: '2023-09-10',
    description: 'Cherry blossoms, ramen at midnight, and the most incredible temple visits. The blend of ancient traditions and modern technology was mesmerizing.',
    photoFiles: ['tokyo1.jpg', 'tokyo2.jpg'],
    videoFiles: ['tokyo-streets.mp4'],
  },
  {
    id: 'santorini2023',
    title: 'Santorini Sunset',
    country: 'Greece',
    city: 'Santorini',
    latitude: 36.3932,
    longitude: 25.4615,
    date: '2023-07-12',
    description: 'White-washed buildings against the deep blue Aegean Sea. Watching the sunset in Oia was one of the most romantic moments of our lives.',
    photoFiles: ['santorini1.jpg', 'santorini2.jpg', 'santorini3.jpg'],
  },
  {
    id: 'newyork2024',
    title: 'New York City',
    country: 'USA',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    date: '2024-01-05',
    description: 'The city that never sleeps lived up to its name. From Broadway shows to Central Park walks, from rooftop bars to hidden jazz clubs - every moment was electric.',
    photoFiles: ['nyc1.jpg', 'nyc2.jpg'],
  },
];

type ViewState = 'auth' | 'map' | 'detail';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('auth');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticate = (rememberDevice: boolean) => {
    console.log('User authenticated, remember device:', rememberDevice);
    // TODO: Implement actual authentication logic
    setIsAuthenticated(true);
    setViewState('map');
  };

  const handleMemorySelect = (memory: Memory) => {
    console.log('Memory selected:', memory.title);
    setSelectedMemory(memory);
    setViewState('detail');
  };

  const handleBackToMap = () => {
    console.log('Navigating back to map');
    setSelectedMemory(null);
    setViewState('map');
  };

  if (viewState === 'auth' && !isAuthenticated) {
    return <AuthPage onAuthenticate={handleAuthenticate} />;
  }

  if (viewState === 'map') {
    return (
      <InteractiveMap
        memories={mockMemories}
        onMemorySelect={handleMemorySelect}
      />
    );
  }

  if (viewState === 'detail' && selectedMemory) {
    return (
      <MemoryDetail
        memory={selectedMemory}
        onBack={handleBackToMap}
      />
    );
  }

  return null;
}
