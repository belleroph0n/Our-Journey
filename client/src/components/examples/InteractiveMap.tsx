import InteractiveMap from '../InteractiveMap';
import { Memory } from '@shared/schema';

const mockMemories: Memory[] = [
  {
    id: 'bali2022',
    title: 'Bali Getaway',
    country: 'Indonesia',
    city: 'Ubud',
    latitude: -8.5069,
    longitude: 115.2625,
    date: '2022-06-15',
    description: 'Our first trip after lockdown. The rice terraces were breathtaking and we found the most amazing hidden waterfall.',
    photoFiles: ['bali1.jpg', 'bali2.jpg'],
  },
  {
    id: 'paris2023',
    title: 'Paris Romance',
    country: 'France',
    city: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    date: '2023-04-20',
    description: 'Sunset at the Eiffel Tower, croissants for breakfast, and endless walks along the Seine.',
    photoFiles: ['paris1.jpg', 'paris2.jpg', 'paris3.jpg'],
  },
  {
    id: 'tokyo2023',
    title: 'Tokyo Adventure',
    country: 'Japan',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    date: '2023-09-10',
    description: 'Cherry blossoms, ramen at midnight, and the most incredible temple visits.',
    photoFiles: ['tokyo1.jpg'],
  },
];

export default function InteractiveMapExample() {
  return (
    <InteractiveMap 
      memories={mockMemories}
      onMemorySelect={(memory) => console.log('Selected memory:', memory)}
      onHomeClick={() => console.log('Home clicked')}
    />
  );
}
