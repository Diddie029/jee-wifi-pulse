import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HotspotLogin } from "./HotspotLogin";
import { UserPortal } from "./UserPortal";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Settings, Users, Smartphone, Ticket, QrCode, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ViewType = 'home' | 'portal' | 'user-portal' | 'admin-login' | 'admin-dashboard';

interface Package {
  id: string;
  name: string;
  duration_display: string;
  price: number;
  sort_order: number;
}

export function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('id, name, duration_display, price, sort_order')
      .eq('is_active', true)
      .order('sort_order');
    if (data) setPackages(data);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('home');
  };

  const handleUserLogin = (newSessionId: string) => {
    setSessionId(newSessionId);
    setCurrentView('user-portal');
  };

  const handleUserLogout = () => {
    setSessionId(null);
    setCurrentView('home');
  };

  if (currentView === 'portal') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setCurrentView('home')}
          >
            ← Back to Home
          </Button>
          <HotspotLogin onLoginSuccess={handleUserLogin} />
        </div>
      </div>
    );
  }

  if (currentView === 'user-portal') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wifi className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold gradient-text">JEE WiFi</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleUserLogout}>
              Exit
            </Button>
          </div>
          <UserPortal sessionId={sessionId || undefined} />
        </div>
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4"
          onClick={() => setCurrentView('home')}
        >
          ← Back
        </Button>
        <AdminLogin onLoginSuccess={handleAdminLogin} />
      </div>
    );
  }

  if (currentView === 'admin-dashboard' && isAdminLoggedIn) {
    return (
      <div>
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Home/Landing Page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/20 neon-border">
              <Wifi className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              JEE WiFi Hotspot
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast, reliable internet access with instant mobile payments. 
              Connect with voucher, phone, or password.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300">
            <CardContent className="p-4 md:p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto">
                <Ticket className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">Voucher Login</h3>
                <p className="text-sm text-muted-foreground">
                  Use a voucher code to instantly connect to the internet.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)] transition-all duration-300">
            <CardContent className="p-4 md:p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-secondary/20 w-fit mx-auto">
                <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-secondary mb-2">SMS OTP</h3>
                <p className="text-sm text-muted-foreground">
                  Verify with your phone number and get instant access.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)] transition-all duration-300">
            <CardContent className="p-4 md:p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto">
                <QrCode className="h-6 w-6 md:h-8 md:w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-accent mb-2">QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Scan a QR voucher code for quick connection.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Display */}
        <Card className="neon-border bg-primary/5">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-primary mb-6">
              Available Packages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4">
              {packages.length > 0 ? packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`p-3 md:p-4 rounded-lg border-2 text-center ${
                    index === 1
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                      : "border-border"
                  }`}
                >
                  <div className="font-semibold text-xs md:text-sm">{pkg.duration_display}</div>
                  <div className="text-base md:text-lg font-bold text-primary">KES {pkg.price}</div>
                  {index === 1 && (
                    <Badge variant="default" className="text-xs mt-1">Popular</Badge>
                  )}
                </div>
              )) : (
                // Fallback static packages
                [
                  { duration_display: "40 min", price: 5 },
                  { duration_display: "2 hours", price: 10 },
                  { duration_display: "6 hours", price: 19 },
                  { duration_display: "12 hours", price: 29 },
                  { duration_display: "24 hours", price: 39 },
                  { duration_display: "1 week", price: 199 },
                  { duration_display: "1 month", price: 799 },
                ].map((pkg, index) => (
                  <div
                    key={index}
                    className={`p-3 md:p-4 rounded-lg border-2 text-center ${
                      index === 1
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                        : "border-border"
                    }`}
                  >
                    <div className="font-semibold text-xs md:text-sm">{pkg.duration_display}</div>
                    <div className="text-base md:text-lg font-bold text-primary">KES {pkg.price}</div>
                    {index === 1 && (
                      <Badge variant="default" className="text-xs mt-1">Popular</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setCurrentView('portal')}
            variant="neon"
            size="xl"
            className="min-w-[200px]"
          >
            <Wifi className="mr-2" />
            Connect Now
          </Button>
          
          <Button
            onClick={() => setCurrentView('admin-login')}
            variant="outline"
            size="xl"
            className="min-w-[200px]"
          >
            <Settings className="mr-2" />
            Admin Panel
          </Button>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-sm">Secure Network</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">Multi-Device</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Smartphone className="h-4 w-4 text-secondary" />
            <span className="text-sm">M-Pesa Ready</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="h-4 w-4 text-accent" />
            <span className="text-sm">Instant Access</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            Powered by JEE Technologies • Secure M-Pesa Integration
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>24/7 Support</span>
            <span>•</span>
            <span>Instant Activation</span>
            <span>•</span>
            <span>Multi-Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
