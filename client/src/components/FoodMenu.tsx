import { Memory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
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
        className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-muted/30 border border-border rounded-sm shadow-lg p-6 sm:p-8 md:p-10"
        data-testid="food-menu-container"
      >
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-handwritten text-center mb-6 sm:mb-8 pb-2 border-b border-foreground/20 italic"
          data-testid="text-menu-title"
        >
          Menu
        </h1>

        <div className="space-y-6 sm:space-y-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              className="w-full text-left group cursor-pointer hover-elevate active-elevate-2 rounded-sm p-2 -m-2 transition-all"
              data-testid={`button-menu-${item.id}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-handwritten text-lg sm:text-xl md:text-2xl italic text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <span className="text-foreground/60 font-handwritten text-base sm:text-lg">
                  –
                </span>
                <span className="font-handwritten text-base sm:text-lg text-foreground/70 leading-relaxed">
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
