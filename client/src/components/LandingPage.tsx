import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory } from '@shared/schema';

import turntableImage from '@assets/generated_images/turntable_on_white_background.png';
import familyImage from '@assets/generated_images/hand-drawn_family_frame_sketch.png';
import globeImage from '@assets/generated_images/hand-drawn_desk_globe_sketch.png';
import mealImage from '@assets/generated_images/hand-drawn_meal_plate_sketch.png';
import whaleImage from '@assets/generated_images/hand-drawn_whale_breaching_sketch.png';
import diceImage from '@assets/generated_images/two_dice_front_faces_only.png';

interface LandingPageProps {
  memories: Memory[];
  onCategorySelect: (category: string, filteredMemories: Memory[]) => void;
  onRandomMemory: (memory: Memory) => void;
  onChristmasMessage?: () => void;
}

function isChristmasDayNZ(): boolean {
  const now = new Date();
  const nzFormatter = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = nzFormatter.formatToParts(now);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;
  return day === '25' && month === '12' && year === '2025';
}

type Category = 'music' | 'family' | 'travel' | 'food' | 'event' | 'random';

interface CategoryConfig {
  id: Category;
  label: string;
  image: string;
  tag: string;
}

const categories: CategoryConfig[] = [
  { id: 'event', label: 'Events', image: whaleImage, tag: 'event' },
  { id: 'family', label: 'Family and friends', image: familyImage, tag: 'family' },
  { id: 'food', label: 'Food', image: mealImage, tag: 'food' },
  { id: 'music', label: 'Music', image: turntableImage, tag: 'music' },
  { id: 'random', label: 'Surprise Me', image: diceImage, tag: '' },
  { id: 'travel', label: 'Travel', image: globeImage, tag: 'travel' },
];

function SpinningGlobeAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-28">
        {/* Tilted axis line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-foreground/20 transform rotate-[23deg] origin-bottom" />
        
        {/* Globe sphere */}
        <div className="relative w-20 h-20 mx-auto rounded-full border-3 border-foreground/45 overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 30% 30%, hsl(var(--foreground) / 0.08) 0%, hsl(var(--foreground) / 0.18) 100%)',
          }}
        >
          {/* Latitude lines */}
          <div className="absolute top-[25%] left-0 right-0 h-px bg-foreground/15" />
          <div className="absolute top-[50%] left-0 right-0 h-px bg-foreground/20" />
          <div className="absolute top-[75%] left-0 right-0 h-px bg-foreground/15" />
          
          {/* Rotating continents using SVG for recognizable shapes */}
          <motion.div
            className="absolute inset-0"
            animate={{ x: [-80, 80] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="160" height="80" viewBox="0 0 160 80" className="absolute top-0 left-0">
              {/* Americas */}
              <path d="M10 15 Q8 20 10 30 Q12 35 8 45 Q6 50 10 55 Q12 58 10 65 L14 65 Q18 55 15 45 Q13 35 16 25 Q18 18 14 15 Z" className="fill-foreground/35" />
              <path d="M12 50 Q20 55 25 50 Q30 45 25 55 Q20 60 15 55 Z" className="fill-foreground/35" />
              
              {/* Africa */}
              <path d="M55 20 Q50 25 48 35 Q50 45 55 55 Q60 60 58 50 Q56 40 60 30 Q62 22 55 20 Z" className="fill-foreground/35" />
              
              {/* Europe */}
              <path d="M52 12 Q48 15 50 20 Q55 22 58 18 Q60 14 55 12 Z" className="fill-foreground/35" />
              
              {/* Asia */}
              <path d="M65 10 Q60 15 62 25 Q70 30 80 28 Q90 25 95 30 Q100 35 95 20 Q85 12 75 10 Q68 8 65 10 Z" className="fill-foreground/35" />
              
              {/* Australia */}
              <path d="M85 50 Q80 55 82 60 Q88 65 95 60 Q98 55 92 50 Q88 48 85 50 Z" className="fill-foreground/35" />
              
              {/* Duplicate set for seamless loop */}
              <path d="M130 15 Q128 20 130 30 Q132 35 128 45 Q126 50 130 55 Q132 58 130 65 L134 65 Q138 55 135 45 Q133 35 136 25 Q138 18 134 15 Z" className="fill-foreground/35" />
              <path d="M132 50 Q140 55 145 50 Q150 45 145 55 Q140 60 135 55 Z" className="fill-foreground/35" />
            </svg>
          </motion.div>
          
          {/* Globe highlight/shine */}
          <div className="absolute top-2 left-3 w-5 h-5 bg-white/15 rounded-full blur-sm" />
        </div>
        
        {/* Globe stand - arc holder */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-20 border-2 border-foreground/25 rounded-full border-t-0" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
        
        {/* Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-foreground/30 rounded-full" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1.5 bg-foreground/25 rounded-b" />
      </div>
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
        Spinning some wax...
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
        {/* Pot body - taller cylindrical shape with flat bottom */}
        <div className="relative w-20 h-14">
          {/* Pot rim (top ellipse) */}
          <div className="absolute top-0 left-0 w-20 h-3 bg-foreground/35 rounded-[50%] border-2 border-foreground/50 z-10" />
          {/* Pot body - cylindrical */}
          <div className="absolute top-1.5 left-0 w-20 h-12 bg-foreground/25 border-x-4 border-b-4 border-foreground/40 rounded-b-lg overflow-hidden">
            {/* Water surface */}
            <div className="absolute top-0 left-1 right-1 h-2 bg-foreground/15 rounded-b-full" />
            {/* Bubbling water inside */}
            <motion.div
              className="absolute bottom-1 left-2 w-2.5 h-2.5 bg-foreground/25 rounded-full"
              animate={{ y: [0, -8], opacity: [0.9, 0], scale: [1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute bottom-1 left-6 w-2 h-2 bg-foreground/25 rounded-full"
              animate={{ y: [0, -7], opacity: [0.9, 0], scale: [1, 0.4] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: 0.25 }}
            />
            <motion.div
              className="absolute bottom-1 right-3 w-2.5 h-2.5 bg-foreground/25 rounded-full"
              animate={{ y: [0, -8], opacity: [0.9, 0], scale: [1, 0.4] }}
              transition={{ duration: 0.65, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
        {/* Pot handles - positioned near top of the pot */}
        <div className="absolute top-2 -left-2.5 w-2.5 h-4 border-2 border-foreground/45 rounded-l-full bg-foreground/10" />
        <div className="absolute top-2 -right-2.5 w-2.5 h-4 border-2 border-foreground/45 rounded-r-full bg-foreground/10" />
        {/* Steam rising - wispy curved steam */}
        <div className="absolute -top-10 left-0 right-0 flex justify-center gap-3">
          <motion.div
            className="w-2 h-8 bg-foreground/12 rounded-full blur-[2px]"
            animate={{ y: [0, -14], x: [-3, 3], opacity: [0.5, 0], scale: [1, 1.6] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2.5 h-10 bg-foreground/12 rounded-full blur-[2px]"
            animate={{ y: [0, -16], x: [2, -2], opacity: [0.6, 0], scale: [1, 2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.35 }}
          />
          <motion.div
            className="w-2 h-8 bg-foreground/12 rounded-full blur-[2px]"
            animate={{ y: [0, -13], x: [3, -3], opacity: [0.5, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.7 }}
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

function SunriseAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-28 overflow-hidden">
        {/* Sky gradient that lightens as sun rises */}
        <motion.div
          className="absolute inset-0 rounded-t-lg"
          animate={{ 
            background: [
              'linear-gradient(to top, hsl(var(--foreground) / 0.08), hsl(var(--foreground) / 0.02))',
              'linear-gradient(to top, hsl(var(--foreground) / 0.15), hsl(var(--foreground) / 0.05))'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        
        {/* Sun rising */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          animate={{ y: [60, 20, 20, 60] }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            times: [0, 0.4, 0.6, 1],
            ease: 'easeInOut'
          }}
        >
          {/* Sun glow */}
          <motion.div
            className="absolute w-16 h-16 rounded-full -left-8 -top-8"
            style={{ background: 'radial-gradient(circle, hsl(var(--foreground) / 0.15), transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Sun body */}
          <div className="w-10 h-10 rounded-full bg-foreground/40 -ml-5 -mt-5" />
          {/* Sun rays - starting outside the sun disc and extending outward */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-0.5 h-3 bg-foreground/30 rounded-full"
              style={{
                left: '0',
                top: '-34px',
                marginLeft: '-1px',
                transformOrigin: '1px 34px',
                transform: `rotate(${angle}deg)`
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: angle / 360 }}
            />
          ))}
        </motion.div>
        
        {/* Hills silhouette - foreground */}
        <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 160 64" preserveAspectRatio="none">
          {/* Back hill */}
          <path 
            d="M-10 64 Q30 20 80 35 Q130 50 170 64 Z" 
            className="fill-foreground/25"
          />
          {/* Front hill left */}
          <path 
            d="M-10 64 Q20 30 60 45 Q80 50 90 64 Z" 
            className="fill-foreground/35"
          />
          {/* Front hill right */}
          <path 
            d="M70 64 Q100 35 140 40 Q160 45 170 64 Z" 
            className="fill-foreground/35"
          />
        </svg>
      </div>
      <motion.div
        className="mt-3 text-sm text-muted-foreground font-handwritten text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Shining a light on our memorable events...
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
      return <SunriseAnimation />;
    case 'random':
      return <RollingDiceAnimation />;
  }
}

// Static dice icon component for homepage tile - shows two dice with dots
function DiceIcon({ className }: { className?: string }) {
  // Dice face configurations (dot positions for 1-6 on a 3x3 grid)
  const diceFaces: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  const renderDice = (value: number, rotation: number) => (
    <div 
      className="relative aspect-square w-10 sm:w-12 bg-foreground/10 border-2 border-foreground/35 rounded-lg"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const showDot = diceFaces[value].some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`aspect-square rounded-full ${showDot ? 'bg-foreground/60' : 'bg-transparent'}`}
              />
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      {renderDice(5, -8)}
      {renderDice(3, 12)}
    </div>
  );
}

export default function LandingPage({ memories, onCategorySelect, onRandomMemory, onChristmasMessage }: LandingPageProps) {
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
          m.categories?.some((c: string) => c.toLowerCase() === category.tag.toLowerCase())
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

      {isChristmasDayNZ() && onChristmasMessage ? (
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onChristmasMessage}
          className="text-4xl sm:text-5xl md:text-6xl font-handwritten mb-6 sm:mb-8 text-center cursor-pointer hover:scale-105 transition-transform"
          style={{ color: '#FF327F' }}
          data-testid="title-christmas-link"
        >
          Our Journey
        </motion.h1>
      ) : (
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-handwritten mb-6 sm:mb-8 text-center"
          style={{ color: '#FF327F' }}
        >
          Our Journey
        </motion.h1>
      )}

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
