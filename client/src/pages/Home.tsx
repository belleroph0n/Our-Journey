import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthPage from '@/components/AuthPage';
import InteractiveMap from '@/components/InteractiveMap';
import MemoryDetail from '@/components/MemoryDetail';
import { Memory } from '@shared/schema';

type ViewState = 'auth' | 'map' | 'detail';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('auth');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
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
          setViewState('map');
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
    setViewState('map');
  };

  const handleMemorySelect = (memory: Memory) => {
    console.log('Memory selected:', memory.title);
    setSelectedMemory(memory);
    setViewState('detail');
  };

  const handleBackToMap = () => {
    console.log('Navigating back to map');
    setSelectedMemory(null);
    setViewState('map');
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

  if (viewState === 'map') {
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
      <InteractiveMap
        memories={memories}
        onMemorySelect={handleMemorySelect}
      />
    );
  }

  if (viewState === 'detail' && selectedMemory) {
    return (
      <MemoryDetail
        memory={selectedMemory}
        onBack={handleBackToMap}
      />
    );
  }

  return null;
}
