import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Upload, FileSpreadsheet, Image, Video, Music, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Memory } from '@shared/schema';

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [memoriesFile, setMemoriesFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
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

  // Fetch current memories
  const { data: memoriesData } = useQuery<{ success: boolean; memories: Memory[] }>({
    queryKey: ['/api/memories'],
  });

  // Fetch uploaded media files
  const { data: mediaData, refetch: refetchMedia } = useQuery<{ success: boolean; files: string[] }>({
    queryKey: ['/api/media'],
  });

  // Upload memories file mutation
  const uploadMemories = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/memories', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Memories file uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
      setMemoriesFile(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload memories file',
        variant: 'destructive',
      });
    },
  });

  // Upload media files mutation
  const uploadMedia = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      const res = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Media files uploaded successfully',
      });
      refetchMedia();
      setMediaFiles([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload media files',
        variant: 'destructive',
      });
    },
  });

  // Delete media file mutation
  const deleteMedia = useMutation({
    mutationFn: async (filename: string) => {
      const res = await apiRequest('DELETE', `/api/media/${filename}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'File deleted successfully',
      });
      refetchMedia();
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });

  // Convert HEIC files mutation
  const convertHeic = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/convert-heic');
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Conversion complete!',
        description: data.message || `Converted ${data.converted} files`,
      });
      refetchMedia();
    },
    onError: (error: any) => {
      toast({
        title: 'Conversion failed',
        description: error.message || 'Failed to convert HEIC files',
        variant: 'destructive',
      });
    },
  });

  const handleMemoriesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMemoriesFile(e.target.files[0]);
    }
  };

  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setMediaFiles(Array.from(e.dataTransfer.files));
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext || '')) {
      return <Image className="w-5 h-5 text-primary" />;
    }
    if (['mp4', 'mov', 'avi', 'webm', 'm4v', 'mkv'].includes(ext || '')) {
      return <Video className="w-5 h-5 text-secondary" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
      return <Music className="w-5 h-5 text-accent-foreground" />;
    }
    return <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-handwritten mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Upload and manage memories and media files</p>
        </div>

        {/* Upload Memories File */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Upload Memories File
            </CardTitle>
            <CardDescription>
              Upload your Excel (.xlsx, .xls) or CSV file containing memory data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4 space-y-2">
              <p className="text-sm font-medium">Need a template?</p>
              <p className="text-sm text-muted-foreground">
                Download our Excel template with sample data and the exact column format needed.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/download/template', '_blank')}
                data-testid="button-download-template"
              >
                <Upload className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleMemoriesFileChange}
                className="hidden"
                id="memories-file"
                data-testid="input-memories-file"
              />
              <label htmlFor="memories-file">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
              {memoriesFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {memoriesFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={() => memoriesFile && uploadMemories.mutate(memoriesFile)}
              disabled={!memoriesFile || uploadMemories.isPending}
              data-testid="button-upload-memories"
            >
              {uploadMemories.isPending ? 'Uploading...' : 'Upload Memories'}
            </Button>

            {memoriesData && memoriesData.memories.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>{memoriesData.memories.length} memories loaded</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Media Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Upload Media Files
            </CardTitle>
            <CardDescription>
              Upload photos, videos, and audio files referenced in your memories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleMediaFilesChange}
                className="hidden"
                id="media-files"
                data-testid="input-media-files"
              />
              <label htmlFor="media-files" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports images, videos, and audio files
                </p>
              </label>
            </div>

            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{mediaFiles.length} files selected</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getFileIcon(file.name)}
                      <span className="truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => mediaFiles.length > 0 && uploadMedia.mutate(mediaFiles)}
              disabled={mediaFiles.length === 0 || uploadMedia.isPending}
              data-testid="button-upload-media"
            >
              {uploadMedia.isPending ? 'Uploading...' : `Upload ${mediaFiles.length} Files`}
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Media Files */}
        {mediaData && mediaData.files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Uploaded Media Files ({mediaData.files.length})</CardTitle>
                  <CardDescription>
                    Manage your uploaded media files
                  </CardDescription>
                </div>
                {mediaData.files.some(f => f.toLowerCase().endsWith('.heic') || f.toLowerCase().endsWith('.heif')) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => convertHeic.mutate()}
                    disabled={convertHeic.isPending}
                    data-testid="button-convert-heic"
                  >
                    {convertHeic.isPending ? 'Converting...' : 'Convert HEIC to JPG'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaData.files.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    {getFileIcon(filename)}
                    <span className="text-sm truncate flex-1">{filename}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMedia.mutate(filename)}
                      data-testid={`button-delete-${filename}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Memories Preview */}
        {memoriesData && memoriesData.memories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Memories</CardTitle>
              <CardDescription>
                Preview of loaded memories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memoriesData.memories.map((memory) => (
                  <div key={memory.id} className="border border-border rounded-lg p-4">
                    <h3 className="text-lg font-handwritten mb-1">{memory.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {memory.city}, {memory.country} • {memory.date}
                    </p>
                    <p className="text-sm line-clamp-2">{memory.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {memory.photoFiles.length > 0 && (
                        <span>{memory.photoFiles.length} photos</span>
                      )}
                      {memory.videoFiles && memory.videoFiles.length > 0 && (
                        <span>{memory.videoFiles.length} videos</span>
                      )}
                      {memory.audioFiles && memory.audioFiles.length > 0 && (
                        <span>{memory.audioFiles.length} audio</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
