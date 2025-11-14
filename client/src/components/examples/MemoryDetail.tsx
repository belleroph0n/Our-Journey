import MemoryDetail from '../MemoryDetail';
import { Memory } from '@shared/schema';

const mockMemory: Memory = {
  id: 'bali2022',
  title: 'Bali Getaway',
  country: 'Indonesia',
  city: 'Ubud',
  latitude: -8.5069,
  longitude: 115.2625,
  date: '2022-06-15',
  description: 'Our first trip after lockdown was absolutely magical. We spent two weeks exploring the lush rice terraces of Ubud, discovering hidden waterfalls, and immersing ourselves in the local culture. The morning yoga sessions overlooking the jungle, the traditional Balinese cooking classes, and the sunset ceremonies at ancient temples created memories that will last forever. We also found this incredible little café tucked away in the hills where we spent hours just talking and dreaming about future adventures.',
  photoFiles: ['bali1.jpg', 'bali2.jpg', 'bali3.jpg', 'bali4.jpg', 'bali5.jpg'],
  videoFiles: ['bali-waterfall.mp4', 'bali-sunset.mp4'],
  audioFiles: ['jungle-sounds.mp3', 'temple-ceremony.mp3'],
};

export default function MemoryDetailExample() {
  return (
    <MemoryDetail 
      memory={mockMemory}
      onBack={() => console.log('Back clicked')}
    />
  );
}
