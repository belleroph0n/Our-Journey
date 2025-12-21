import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  identifier: string | null;
}

const menuItems: MenuItem[] = [
  { 
    id: 'degustation', 
    title: 'Degustation', 
    description: 'our best dishes, for our most discerning diners',
    identifier: 'degustation'
  },
  { 
    id: 'appetiser', 
    title: 'Appetisers', 
    description: 'a selection of tasty snacks',
    identifier: 'appetiser'
  },
  { 
    id: 'comfort', 
    title: 'Comfort food', 
    description: "it's not always healthy, but it sure is tasty",
    identifier: 'comfort'
  },
  { 
    id: 'two', 
    title: 'Main for two', 
    description: 'the best meals are always shared',
    identifier: 'two'
  },
  { 
    id: 'more', 
    title: 'Main for more', 
    description: 'why not feed the whole family',
    identifier: 'more'
  },
  { 
    id: 'dessert', 
    title: 'Dessert', 
    description: 'sweet treats and cakes, because there is always room for more',
    identifier: 'dessert'
  },
  { 
    id: 'all', 
    title: 'Just feed me', 
    description: "you don't want to see her hangry, this is everything on the menu",
    identifier: null
  },
];

interface FoodMenuProps {
  memories: Memory[];
  onMenuItemSelect: (identifier: string | null, filteredMemories: Memory[]) => void;
  onBack: () => void;
}

export default function FoodMenu({ memories, onMenuItemSelect, onBack }: FoodMenuProps) {
  const handleMenuItemClick = (item: MenuItem) => {
    let filtered: Memory[];
    
    if (item.identifier === null) {
      filtered = memories;
    } else {
      filtered = memories.filter(m => 
        m.identifier?.toLowerCase() === item.identifier?.toLowerCase()
      );
    }
    
    onMenuItemSelect(item.identifier, filtered);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
      <div className="fixed top-4 left-4 z-30">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          style={{ backgroundColor: '#FF327F' }}
          onClick={onBack}
          data-testid="button-back-from-menu"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </Button>
      </div>

      <div 
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative"
        data-testid="food-menu-container"
      >
        <div 
          className="bg-muted/40 border border-foreground/20 shadow-xl px-8 sm:px-12 md:px-14 lg:px-16 py-8 sm:py-10 md:py-12 flex flex-col"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--muted) / 0.5), hsl(var(--muted) / 0.3))',
            aspectRatio: '1 / 1.414',
          }}
        >
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-handwritten text-center mb-6 sm:mb-8 md:mb-10 italic tracking-wide underline decoration-foreground underline-offset-4"
            data-testid="text-menu-title"
          >
            Menu
          </h1>

          <div className="space-y-6 sm:space-y-7 md:space-y-8">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="w-full text-left group cursor-pointer transition-all hover:translate-x-1"
                data-testid={`button-menu-${item.id}`}
              >
                <div className="leading-relaxed">
                  <span className="font-handwritten text-base sm:text-lg md:text-xl italic text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="font-handwritten text-sm sm:text-base md:text-lg text-foreground/60 mx-2">
                    –
                  </span>
                  <span className="font-handwritten text-sm sm:text-base md:text-lg text-foreground/70">
                    {item.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
