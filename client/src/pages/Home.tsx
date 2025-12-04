import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthPage from '@/components/AuthPage';
import LandingPage from '@/components/LandingPage';
import InteractiveMap from '@/components/InteractiveMap';
import MemoryDetail from '@/components/MemoryDetail';
import FilteredMemoriesPage from '@/components/FilteredMemoriesPage';
import { Memory } from '@shared/schema';

type ViewState = 'auth' | 'landing' | 'map' | 'filtered' | 'detail';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('auth');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        if (data.success && data.isAuthenticated) {
          setIsAuthenticated(true);
          setViewState('landing');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch memories from backend
  const { data: memoriesData, isLoading } = useQuery<{ success: boolean; memories: Memory[] }>({
    queryKey: ['/api/memories'],
    enabled: isAuthenticated,
  });

  const memories = memoriesData?.memories || [];

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setViewState('landing');
  };

  const handleCategorySelect = (category: string, filtered: Memory[]) => {
    setSelectedCategory(category);
    setFilteredMemories(filtered);
    if (category === 'travel') {
      setViewState('map');
    } else {
      setViewState('filtered');
    }
  };

  const handleRandomMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setViewState('detail');
  };

  const handleMemorySelect = (memory: Memory) => {
    console.log('Memory selected:', memory.title);
    setSelectedMemory(memory);
    setViewState('detail');
  };

  const handleBackToLanding = () => {
    console.log('Navigating back to landing');
    setSelectedMemory(null);
    setFilteredMemories([]);
    setSelectedCategory('');
    setViewState('landing');
  };

  const handleBackToFiltered = () => {
    console.log('Navigating back to filtered view');
    setSelectedMemory(null);
    setViewState('filtered');
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-handwritten text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (viewState === 'auth' && !isAuthenticated) {
    return <AuthPage onAuthenticate={handleAuthenticate} />;
  }

  if (viewState === 'landing') {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg font-handwritten text-muted-foreground">Loading our memories...</p>
          </div>
        </div>
      );
    }

    return (
      <LandingPage
        memories={memories}
        onCategorySelect={handleCategorySelect}
        onRandomMemory={handleRandomMemory}
      />
    );
  }

  if (viewState === 'map') {
    const memoriesToShow = selectedCategory === 'travel' ? filteredMemories : memories;
    return (
      <InteractiveMap
        memories={memoriesToShow.length > 0 ? memoriesToShow : memories}
        onMemorySelect={handleMemorySelect}
        onBack={handleBackToLanding}
      />
    );
  }

  if (viewState === 'filtered' && filteredMemories.length > 0) {
    return (
      <FilteredMemoriesPage
        memories={filteredMemories}
        category={selectedCategory}
        onMemorySelect={handleMemorySelect}
        onBack={handleBackToLanding}
      />
    );
  }

  if (viewState === 'detail' && selectedMemory) {
    const backHandler = selectedCategory && selectedCategory !== 'travel' && selectedCategory !== 'random'
      ? handleBackToFiltered
      : handleBackToLanding;
    
    return (
      <MemoryDetail
        memory={selectedMemory}
        onBack={backHandler}
      />
    );
  }

  return null;
}
