import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HotspotPortal } from "./HotspotPortal";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Settings, Users, Smartphone } from "lucide-react";

type ViewType = 'home' | 'portal' | 'admin-login' | 'admin-dashboard';

export function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('home');
  };

  if (currentView === 'portal') {
    return <HotspotPortal />;
  }

  if (currentView === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />;
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
            <h1 className="text-5xl font-bold gradient-text mb-4">
              JEE WiFi Hotspot
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast, reliable internet access with instant mobile payments. 
              Connect your device and pay securely with M-Pesa.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">High Speed Internet</h3>
                <p className="text-muted-foreground">
                  Enjoy blazing fast internet speeds with our premium network infrastructure.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)] transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-secondary/20 w-fit mx-auto">
                <Smartphone className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary mb-2">M-Pesa Payments</h3>
                <p className="text-muted-foreground">
                  Secure and instant payments through Safaricom M-Pesa STK Push technology.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)] transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent mb-2">Flexible Packages</h3>
                <p className="text-muted-foreground">
                  Choose from various time-based packages that suit your internet needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Display */}
        <Card className="neon-border bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center text-primary mb-6">
              Available Packages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { duration: "40 min", price: "5 KES" },
                { duration: "2 hours", price: "10 KES", popular: true },
                { duration: "6 hours", price: "19 KES" },
                { duration: "12 hours", price: "29 KES" },
                { duration: "24 hours", price: "39 KES" },
                { duration: "1 week", price: "199 KES" },
                { duration: "1 month", price: "799 KES" },
              ].map((pkg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 text-center ${
                    pkg.popular
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                      : "border-border"
                  }`}
                >
                  <div className="font-semibold text-sm">{pkg.duration}</div>
                  <div className="text-lg font-bold text-primary">{pkg.price}</div>
                  {pkg.popular && (
                    <div className="text-xs text-primary mt-1">Popular</div>
                  )}
                </div>
              ))}
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

        {/* Footer */}
        <div className="text-center space-y-2 pt-8">
          <p className="text-sm text-muted-foreground">
            Powered by JEE Technologies • Secure M-Pesa Integration
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>24/7 Support</span>
            <span>•</span>
            <span>Instant Activation</span>
            <span>•</span>
            <span>No Registration Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
