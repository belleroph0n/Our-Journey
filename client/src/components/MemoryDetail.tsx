import { useState } from 'react';
import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Play, Pause } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MemoryDetailProps {
  memory: Memory;
  onBack: () => void;
}

export default function MemoryDetail({ memory, onBack }: MemoryDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-handwritten">{memory.title}</h1>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-32 h-32 text-primary/30" />
        </div>
        
        {/* Location badge */}
        <div className="absolute top-6 right-6">
          <Badge variant="secondary" className="px-4 py-2 shadow-lg">
            <MapPin className="w-4 h-4 mr-2" />
            {memory.city}, {memory.country}
          </Badge>
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

        {/* Photo gallery */}
        {memory.photoFiles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-handwritten">Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memory.photoFiles.map((photo, index) => (
                <div
                  key={photo}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(photo)}
                  data-testid={`image-gallery-${index}`}
                  style={{
                    transform: `rotate(${index % 3 === 0 ? -1 : index % 3 === 1 ? 1 : 0}deg)`,
                  }}
                >
                  <div className="bg-card p-4 rounded-md shadow-lg hover-elevate active-elevate-2 transition-transform">
                    <div className="aspect-square rounded-sm overflow-hidden">
                      <img
                        src={`/api/media/${photo}`}
                        alt={`Memory photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-3 text-sm text-center font-handwritten text-muted-foreground">
                      Photo {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video section */}
        {memory.videoFiles && memory.videoFiles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-handwritten">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memory.videoFiles.map((video, index) => (
                <div
                  key={video}
                  className="aspect-video bg-card rounded-xl overflow-hidden shadow-lg"
                  data-testid={`video-${index}`}
                >
                  <video
                    src={`/api/media/${video}`}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio section */}
        {memory.audioFiles && memory.audioFiles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-handwritten">Audio Memories</h2>
            <div className="space-y-4">
              {memory.audioFiles.map((audio, index) => (
                <div
                  key={audio}
                  className="bg-card p-6 rounded-xl shadow-md"
                >
                  <p className="font-handwritten text-lg mb-4">Audio {index + 1}</p>
                  <audio
                    src={`/api/media/${audio}`}
                    controls
                    className="w-full"
                    data-testid={`audio-${index}`}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <img
              src={`/api/media/${selectedImage}`}
              alt="Full size memory"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
