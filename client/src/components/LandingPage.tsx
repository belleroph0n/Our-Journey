import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory } from '@shared/schema';

import jukeboxImage from '@assets/generated_images/jukebox_sketch_without_notes.png';
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
  { id: 'family', label: 'Family and friends', image: familyImage, tag: 'family' },
  { id: 'travel', label: 'Travel', image: globeImage, tag: 'travel' },
  { id: 'food', label: 'Food', image: mealImage, tag: 'food' },
  { id: 'event', label: 'Events', image: whaleImage, tag: 'event' },
  { id: 'random', label: 'Surprise Me', image: diceImage, tag: '' },
];

function SpinningGlobeAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        {/* Globe sphere with rotating continents */}
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-foreground/40 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--foreground) / 0.05) 0%, hsl(var(--foreground) / 0.15) 100%)',
          }}
        >
          {/* Continents moving across the globe */}
          <motion.div
            className="absolute inset-0"
            animate={{ x: [-80, 80] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            {/* Africa/Europe shape */}
            <div className="absolute top-3 left-6 w-4 h-6 bg-foreground/30 rounded-full transform rotate-12" />
            {/* Americas shape */}
            <div className="absolute top-2 left-16 w-3 h-8 bg-foreground/30 rounded-full transform -rotate-6" />
            {/* Asia shape */}
            <div className="absolute top-4 left-24 w-5 h-5 bg-foreground/30 rounded-full" />
            {/* Australia shape */}
            <div className="absolute bottom-3 left-28 w-3 h-2 bg-foreground/30 rounded-full" />
            {/* Duplicate set for seamless loop */}
            <div className="absolute top-3 left-[6.5rem] w-4 h-6 bg-foreground/30 rounded-full transform rotate-12" />
            <div className="absolute top-2 left-[10rem] w-3 h-8 bg-foreground/30 rounded-full transform -rotate-6" />
          </motion.div>
          {/* Globe highlight */}
          <div className="absolute top-1 left-2 w-4 h-4 bg-white/20 rounded-full blur-sm" />
        </motion.div>
        {/* Globe stand */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-foreground/30 rounded-full" />
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-foreground/20 rounded-b" />
      </div>
      <motion.div
        className="mt-4 text-sm text-muted-foreground font-handwritten"
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
      {/* Family organising for photo - two adults and two children */}
      <div className="relative w-24 h-16 flex items-end justify-center gap-1">
        {/* Adult 1 (left) - shuffling into position */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [8, 0, 0], y: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.3, 1] }}
        >
          <div className="w-4 h-4 bg-foreground/40 rounded-full" />
          <div className="w-5 h-7 bg-foreground/30 rounded-t-lg mt-0.5" />
        </motion.div>
        
        {/* Child 1 (shorter, between adults) */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [-4, 0, 0], y: [2, 0, 0], rotate: [-5, 0, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2, times: [0, 0.4, 1] }}
        >
          <div className="w-3 h-3 bg-foreground/40 rounded-full" />
          <div className="w-3 h-4 bg-foreground/30 rounded-t-lg mt-0.5" />
        </motion.div>
        
        {/* Child 2 (shorter) */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [6, 0, 0], y: [3, 0, 0], rotate: [8, 0, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: 0.4, times: [0, 0.5, 1] }}
        >
          <div className="w-3 h-3 bg-foreground/40 rounded-full" />
          <div className="w-3 h-4 bg-foreground/30 rounded-t-lg mt-0.5" />
        </motion.div>
        
        {/* Adult 2 (right) - shuffling into position */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [-6, 0, 0], y: [0, -2, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: 0.1, times: [0, 0.35, 1] }}
        >
          <div className="w-4 h-4 bg-foreground/40 rounded-full" />
          <div className="w-5 h-7 bg-foreground/30 rounded-t-lg mt-0.5" />
        </motion.div>
      </div>
      <motion.div
        className="mt-3 text-sm text-muted-foreground font-handwritten"
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
        {/* Pot body */}
        <div className="w-16 h-10 bg-foreground/25 rounded-b-2xl border-4 border-foreground/40 relative overflow-hidden">
          {/* Bubbling water inside */}
          <motion.div
            className="absolute bottom-0 left-1 w-2 h-2 bg-foreground/20 rounded-full"
            animate={{ y: [0, -6], opacity: [0.8, 0], scale: [1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute bottom-0 left-4 w-1.5 h-1.5 bg-foreground/20 rounded-full"
            animate={{ y: [0, -5], opacity: [0.8, 0], scale: [1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="absolute bottom-0 right-3 w-2 h-2 bg-foreground/20 rounded-full"
            animate={{ y: [0, -6], opacity: [0.8, 0], scale: [1, 0.5] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: 0.35 }}
          />
        </div>
        {/* Pot handles */}
        <div className="absolute top-1 -left-2 w-2 h-3 border-2 border-foreground/40 rounded-l-full" />
        <div className="absolute top-1 -right-2 w-2 h-3 border-2 border-foreground/40 rounded-r-full" />
        {/* Steam rising - wispy curved steam */}
        <div className="absolute -top-8 left-0 right-0 flex justify-center gap-2">
          <motion.div
            className="w-1.5 h-6 bg-foreground/15 rounded-full blur-[1px]"
            animate={{ y: [0, -12], x: [-2, 2], opacity: [0.6, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-8 bg-foreground/15 rounded-full blur-[1px]"
            animate={{ y: [0, -14], x: [1, -1], opacity: [0.7, 0], scale: [1, 1.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="w-1.5 h-6 bg-foreground/15 rounded-full blur-[1px]"
            animate={{ y: [0, -11], x: [2, -2], opacity: [0.6, 0], scale: [1, 1.4] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.6 }}
          />
        </div>
      </div>
      <motion.div
        className="mt-4 text-sm text-muted-foreground font-handwritten"
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
      <div className="relative w-24 h-20 overflow-hidden">
        {/* Ocean water */}
        <motion.div
          className="absolute bottom-0 w-full h-4 bg-foreground/20 rounded"
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        {/* Whale body breaching */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          animate={{ 
            y: [24, -4, 24],
            rotate: [20, -10, 20]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Whale body - curved shape */}
          <div className="relative">
            <div className="w-10 h-6 bg-foreground/40 rounded-l-full rounded-r-2xl" />
            {/* Whale tail */}
            <div className="absolute -right-3 top-1 w-4 h-4 bg-foreground/40 rounded-full transform rotate-45" />
            {/* Whale belly (lighter) */}
            <div className="absolute bottom-0 left-1 w-7 h-2 bg-foreground/20 rounded-full" />
          </div>
        </motion.div>
        
        {/* Splash droplets */}
        <motion.div
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, times: [0.3, 0.5, 0.7] }}
        >
          <motion.div
            className="absolute -left-4 w-1.5 h-3 bg-foreground/30 rounded-full"
            animate={{ y: [0, -8], x: [-2, -4], opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute left-0 w-2 h-4 bg-foreground/30 rounded-full"
            animate={{ y: [0, -10], opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute left-4 w-1.5 h-3 bg-foreground/30 rounded-full"
            animate={{ y: [0, -8], x: [2, 4], opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
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
  const [diceValues, setDiceValues] = useState([1, 4]);
  
  // Dice face configurations (dot positions for 1-6)
  const diceFaces: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  // Change dice values periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 400);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex gap-3">
        {[0, 1].map((diceIndex) => (
          <motion.div
            key={diceIndex}
            className="relative w-10 h-10 bg-foreground/15 border-2 border-foreground/40 rounded-lg"
            animate={{ 
              rotate: [0, 90, 180, 270, 360],
              y: [0, -8, 0, -4, 0],
              x: diceIndex === 0 ? [0, 2, -2, 1, 0] : [0, -2, 2, -1, 0]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: diceIndex * 0.15,
              ease: 'easeInOut'
            }}
          >
            {/* Dice dots that change based on state */}
            <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                  const faceValue = diceValues[diceIndex];
                  const showDot = diceFaces[faceValue].some(
                    ([r, c]) => r === row && c === col
                  );
                  return (
                    <motion.div
                      key={`${row}-${col}`}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-100 ${showDot ? 'bg-foreground/70' : 'bg-transparent'}`}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-3 text-sm text-muted-foreground font-handwritten"
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
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                style={{ filter: 'grayscale(100%)' }}
              />
              <span className="text-base sm:text-lg md:text-xl font-handwritten text-foreground/80">{category.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
