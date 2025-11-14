import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface AuthPageProps {
  onAuthenticate: () => void;
}

export default function AuthPage({ onAuthenticate }: AuthPageProps) {
  const [accessCode, setAccessCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { code: string; rememberDevice: boolean }) => {
      const res = await apiRequest('POST', '/api/auth/login', data);
      return res.json();
    },
    onSuccess: () => {
      onAuthenticate();
    },
    onError: (error: any) => {
      setError(error.message || 'Invalid access code');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }
    setError("");
    loginMutation.mutate({ code: accessCode, rememberDevice });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-secondary/10 p-4">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-handwritten">Welcome to Our Journey</CardTitle>
          <CardDescription className="text-base">
            Enter the access code to explore our shared memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="font-handwritten text-lg">
                Access Code
              </Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError("");
                }}
                className="text-base"
                data-testid="input-access-code"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberDevice"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
                data-testid="checkbox-remember-device"
              />
              <Label
                htmlFor="rememberDevice"
                className="text-sm font-normal cursor-pointer"
              >
                Remember this device
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loginMutation.isPending}
              data-testid="button-submit"
            >
              {loginMutation.isPending ? 'Verifying...' : 'Begin Our Journey'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
