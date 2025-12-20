import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Cloud, CheckCircle2, FileSpreadsheet, Image, Video, Music, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Memory } from '@shared/schema';

interface GoogleDriveStatus {
  configured: boolean;
  success: boolean;
  fileCount: number;
  files?: string[];
  error?: string;
}

interface MemoriesResponse {
  success: boolean;
  memories: Memory[];
  source?: string;
}

interface MediaResponse {
  success: boolean;
  files: string[];
  source?: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        if (!data.success || !data.isAuthenticated) {
          toast({
            title: 'Authentication required',
            description: 'Please log in to access the admin panel',
            variant: 'destructive',
          });
          setLocation('/');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setLocation('/');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [setLocation, toast]);

  const { data: driveStatus, refetch: refetchDrive, isLoading: isLoadingDrive } = useQuery<GoogleDriveStatus>({
    queryKey: ['/api/google-drive/test'],
  });

  const { data: memoriesData, refetch: refetchMemories, isLoading: isLoadingMemories } = useQuery<MemoriesResponse>({
    queryKey: ['/api/memories'],
  });

  const { data: mediaData, refetch: refetchMedia, isLoading: isLoadingMedia } = useQuery<MediaResponse>({
    queryKey: ['/api/media'],
  });

  const handleRefreshAll = () => {
    refetchDrive();
    refetchMemories();
    refetchMedia();
    toast({
      title: 'Refreshing...',
      description: 'Syncing with Google Drive',
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext || '')) {
      return <Image className="w-4 h-4 text-primary" />;
    }
    if (['mp4', 'mov', 'avi', 'webm', 'm4v', 'mkv'].includes(ext || '')) {
      return <Video className="w-4 h-4 text-secondary" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
      return <Music className="w-4 h-4 text-accent-foreground" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    }
    return <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />;
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

  const isConnected = driveStatus?.configured && driveStatus?.success;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-handwritten mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              View memories and media stored in Google Drive
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isLoadingDrive || isLoadingMemories || isLoadingMedia}
            data-testid="button-refresh-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingDrive ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Google Drive Connection
            </CardTitle>
            <CardDescription>
              All memories and media files are stored in your Google Drive folder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDrive ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking connection...</span>
              </div>
            ) : isConnected ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Connected to Google Drive</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{driveStatus?.fileCount || 0}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Media Files</p>
                    <p className="text-2xl font-bold">{mediaData?.files?.length || 0}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Connection Issue</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {driveStatus?.error || 'Unable to connect to Google Drive. Please check your configuration.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>How to manage files:</strong> Add, edit, or remove files directly in your Google Drive folder. 
                Changes will be reflected here automatically when you refresh.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto mt-2 text-blue-600 hover:text-blue-700 hover:bg-transparent"
                onClick={() => window.open('https://drive.google.com', '_blank')}
                data-testid="button-open-drive"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open Google Drive
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Memories
              {memoriesData?.source && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  from {memoriesData.source}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {memoriesData?.memories?.length || 0} memories loaded from your spreadsheet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMemories ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading memories...</span>
              </div>
            ) : memoriesData?.memories && memoriesData.memories.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {memoriesData.memories.map((memory) => (
                  <div key={memory.id} className="border border-border rounded-lg p-4 bg-card">
                    <h3 className="text-lg font-handwritten mb-1">{memory.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {memory.city}, {memory.country} • {memory.date}
                    </p>
                    <p className="text-sm line-clamp-2">{memory.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      {memory.photoFiles?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          {memory.photoFiles.length} photos
                        </span>
                      )}
                      {memory.videoFiles && memory.videoFiles.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {memory.videoFiles.length} videos
                        </span>
                      )}
                      {memory.audioFiles && memory.audioFiles.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {memory.audioFiles.length} audio
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No memories found. Upload a spreadsheet to your Google Drive folder.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Media Files
              {mediaData?.source && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  from {mediaData.source}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Photos, videos, and audio files in your Google Drive folder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMedia ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading media files...</span>
              </div>
            ) : mediaData?.files && mediaData.files.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {mediaData.files.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                    title={filename}
                  >
                    {getFileIcon(filename)}
                    <span className="truncate flex-1">{filename}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No media files found. Upload photos, videos, and audio to your Google Drive folder.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Files in Google Drive are read-only from this app. 
            To modify content, edit files directly in Google Drive.
          </p>
        </div>
      </div>
    </div>
  );
}
