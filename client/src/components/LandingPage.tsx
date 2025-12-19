import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory } from '@shared/schema';

import jukeboxImage from '@assets/generated_images/hand-drawn_jukebox_sketch.png';
import familyImage from '@assets/generated_images/hand-drawn_family_frame_sketch.png';
import globeImage from '@assets/generated_images/hand-drawn_desk_globe_sketch.png';
import mealImage from '@assets/generated_images/hand-drawn_meal_plate_sketch.png';
import whaleImage from '@assets/generated_images/hand-drawn_whale_breaching_sketch.png';
import diceImage from '@assets/generated_images/hand-drawn_dice_sketch.png';

interface LandingPageProps {
  memories: Memory[];
  onCategorySelect: (category: string, filteredMemories: Memory[]) => void;
  onRandomMemory: (memory: Memory) => void;
}

type Category = 'music' | 'family' | 'travel' | 'food' | 'event' | 'random';

interface CategoryConfig {
  id: Category;
  label: string;
  image: string;
  tag: string;
}

const categories: CategoryConfig[] = [
  { id: 'music', label: 'Music', image: jukeboxImage, tag: 'music' },
  { id: 'family', label: 'Family', image: familyImage, tag: 'family' },
  { id: 'travel', label: 'Travel', image: globeImage, tag: 'travel' },
  { id: 'food', label: 'Food', image: mealImage, tag: 'food' },
  { id: 'event', label: 'Events', image: whaleImage, tag: 'event' },
  { id: 'random', label: 'Surprise Me', image: diceImage, tag: '' },
];

function SpinningGlobeAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="w-16 h-16 rounded-full border-4 border-foreground/30"
        style={{
          background: 'linear-gradient(90deg, transparent 50%, hsl(var(--foreground) / 0.1) 50%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Spinning the globe...
      </motion.div>
    </div>
  );
}

function BouncingNotesAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{ y: [-8, 8, -8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          >
            ♪
          </motion.span>
        ))}
      </div>
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Tuning the jukebox...
      </motion.div>
    </div>
  );
}

function FamilyWiggleAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="w-16 h-14 border-4 border-foreground/40 rounded flex items-center justify-center gap-1"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-6 bg-foreground/30 rounded-full"
            animate={{ scaleY: [1, 1.1, 1], y: [0, -2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Gathering the family...
      </motion.div>
    </div>
  );
}

function BoilingPotAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-14 h-10 bg-foreground/20 rounded-b-full border-4 border-foreground/40" />
        <div className="absolute -top-4 left-0 right-0 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-4 bg-foreground/20 rounded-full"
              animate={{ y: [-4, -12], opacity: [1, 0], scale: [1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
      </div>
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Cooking up memories...
      </motion.div>
    </div>
  );
}

function WhaleBreachAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-12 overflow-hidden">
        <motion.div
          className="absolute bottom-0 w-full h-3 bg-foreground/20 rounded"
          animate={{ scaleY: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-8 h-6 bg-foreground/30 rounded-full"
          animate={{ y: [16, -8, 16], scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Making a splash...
      </motion.div>
    </div>
  );
}

function RollingDiceAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="w-8 h-8 bg-foreground/20 border-2 border-foreground/40 rounded flex items-center justify-center"
            animate={{ rotate: [0, 180, 360], scale: [1, 0.9, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-2 h-2 bg-foreground/60 rounded-full" />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-2 text-sm text-muted-foreground font-handwritten"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Rolling the dice...
      </motion.div>
    </div>
  );
}

function LoadingAnimation({ category }: { category: Category }) {
  switch (category) {
    case 'travel':
      return <SpinningGlobeAnimation />;
    case 'music':
      return <BouncingNotesAnimation />;
    case 'family':
      return <FamilyWiggleAnimation />;
    case 'food':
      return <BoilingPotAnimation />;
    case 'event':
      return <WhaleBreachAnimation />;
    case 'random':
      return <RollingDiceAnimation />;
  }
}

export default function LandingPage({ memories, onCategorySelect, onRandomMemory }: LandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryClick = (category: CategoryConfig) => {
    setSelectedCategory(category.id);
    setIsLoading(true);

    setTimeout(() => {
      if (category.id === 'random') {
        const randomIndex = Math.floor(Math.random() * memories.length);
        const randomMemory = memories[randomIndex];
        if (randomMemory) {
          onRandomMemory(randomMemory);
        }
      } else {
        const filteredMemories = memories.filter((m) =>
          m.tags?.some((t) => t.toLowerCase() === category.tag.toLowerCase())
        );
        onCategorySelect(category.id, filteredMemories);
      }
      setIsLoading(false);
      setSelectedCategory(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none" />
      
      <AnimatePresence>
        {isLoading && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <LoadingAnimation category={selectedCategory} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl md:text-6xl font-handwritten mb-6 sm:mb-8 text-center"
        style={{ color: '#FF327F' }}
      >
        Our Journey
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8 text-muted-foreground text-center font-mono text-sm max-w-md px-4"
      >
        Choose a category to explore our memories together
      </motion.p>

      {/* Responsive Grid Layout - Works on all screen sizes */}
      <div className="w-full max-w-2xl px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category)}
              disabled={isLoading}
              className="aspect-square rounded-2xl bg-card border-2 border-border shadow-lg flex flex-col items-center justify-center gap-2 sm:gap-3 hover-elevate cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed p-4"
              data-testid={`button-category-${category.id}`}
            >
              <img
                src={category.image}
                alt={category.label}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                style={{ filter: 'grayscale(100%)' }}
              />
              <span className="text-sm sm:text-base font-handwritten text-foreground/80">{category.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
