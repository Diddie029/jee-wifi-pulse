import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wifi, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate authentication (replace with real authentication)
    setTimeout(() => {
      if (credentials.username === "admin" && credentials.password === "jee2024") {
        toast({
          title: "Login Successful",
          description: "Welcome to JEE WiFi Admin Dashboard.",
        });
        onLoginSuccess();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md neon-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20 neon-border">
              <Wifi className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">JEE WiFi Admin</CardTitle>
            <p className="text-muted-foreground mt-2">Secure Administrator Access</p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="neon-border bg-background/50 mt-2"
                  placeholder="Enter admin username"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 text-primary">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="neon-border bg-background/50 mt-2"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="neon"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Access Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Demo credentials: admin / jee2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}