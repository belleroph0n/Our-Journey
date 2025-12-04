import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Memory } from '@shared/schema';
import customMarkerIcon from '@assets/Untitled design (1)_1763443679229.png';

interface FilteredMemoriesPageProps {
  memories: Memory[];
  category: string;
  onMemorySelect: (memory: Memory) => void;
  onBack: () => void;
}

const categoryTitles: Record<string, string> = {
  music: 'Musical Moments',
  family: 'Family Memories',
  food: 'Culinary Adventures',
  event: 'Special Events',
};

const categoryDescriptions: Record<string, string> = {
  music: 'Songs, concerts, and melodies that marked our journey',
  family: 'Precious moments with loved ones',
  food: 'Delicious experiences we shared together',
  event: 'Celebrations and milestones along the way',
};

export default function FilteredMemoriesPage({ 
  memories, 
  category, 
  onMemorySelect, 
  onBack 
}: FilteredMemoriesPageProps) {
  const title = categoryTitles[category] || 'Memories';
  const description = categoryDescriptions[category] || 'Our shared experiences';

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            data-testid="button-back-to-landing"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-handwritten" style={{ color: '#FF327F' }}>
              {title}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {memories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <img
              src={customMarkerIcon}
              alt="No memories"
              className="w-24 h-24 mx-auto mb-4 opacity-30"
              style={{
                filter: 'grayscale(100%)'
              }}
            />
            <h2 className="text-xl font-handwritten text-muted-foreground mb-2">
              No memories found
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              No entries with the "{category}" tag yet
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover-elevate overflow-hidden"
                  onClick={() => onMemorySelect(memory)}
                  data-testid={`card-memory-${memory.id}`}
                >
                  {memory.photoFiles && memory.photoFiles.length > 0 && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={`/uploads/${memory.photoFiles[0]}`}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-handwritten mb-2" style={{ color: '#FF327F' }}>
                      {memory.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono">{memory.city}, {memory.country}</span>
                      </div>
                      {memory.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-mono">
                            {new Date(memory.date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {memory.description && (
                      <p className="text-sm text-foreground/80 font-mono line-clamp-2">
                        {memory.description}
                      </p>
                    )}

                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs font-mono bg-muted rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
