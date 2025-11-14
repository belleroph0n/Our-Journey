import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

export default function DriveTest() {
  const { data: folderInfo, isLoading: folderLoading, refetch: refetchFolder } = useQuery({
    queryKey: ['/api/drive/folder-info'],
    enabled: false,
  });

  const { data: filesData, isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ['/api/drive/files'],
    enabled: false,
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-handwritten">Google Drive Integration Test</h1>

        <Card>
          <CardHeader>
            <CardTitle>Folder Access Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => refetchFolder()} 
              disabled={folderLoading}
              data-testid="button-test-folder"
            >
              {folderLoading ? 'Testing...' : 'Test Folder Access'}
            </Button>
            
            {folderInfo && (
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(folderInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>List Files Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => refetchFiles()} 
              disabled={filesLoading}
              data-testid="button-test-files"
            >
              {filesLoading ? 'Loading...' : 'List Files in Folder'}
            </Button>
            
            {filesData && (
              <div>
                <p className="font-semibold mb-2">
                  Found {(filesData as any).count || 0} files
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(filesData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
