import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock, Smartphone, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PACKAGES = [
  { id: 1, duration: "40 minutes", price: 5, popular: false },
  { id: 2, duration: "2 hours", price: 10, popular: true },
  { id: 3, duration: "6 hours", price: 19, popular: false },
  { id: 4, duration: "12 hours", price: 29, popular: false },
  { id: 5, duration: "24 hours", price: 39, popular: false },
  { id: 6, duration: "1 week", price: 199, popular: false },
  { id: 7, duration: "1 month", price: 799, popular: false },
];

export function HotspotPortal() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleSTKPush = async () => {
    if (!phoneNumber || !selectedPackage) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number and select a package.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate STK Push process
    toast({
      title: "STK Push Sent",
      description: "Check your phone for the M-Pesa payment prompt.",
    });

    // Simulate payment processing
    setTimeout(() => {
      setIsConnecting(false);
      toast({
        title: "Payment Successful!",
        description: "Your internet access has been activated.",
        variant: "default",
      });
    }, 3000);
  };

  const selectedPkg = PACKAGES.find(pkg => pkg.id === selectedPackage);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20 neon-border">
              <Wifi className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">JEE WiFi Hotspot</h1>
            <p className="text-muted-foreground">Connect & Pay Instantly</p>
          </div>
        </div>

        {/* Phone Number Input */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="h-5 w-5" />
              Enter Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="tel"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="neon-border bg-background/50"
            />
          </CardContent>
        </Card>

        {/* Package Selection */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Select Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.id
                      ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{pkg.duration}</div>
                      <div className="text-sm text-muted-foreground">High Speed Internet</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">KES {pkg.price}</div>
                      {pkg.popular && (
                        <Badge variant="secondary" className="mt-1">Popular</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        {selectedPkg && (
          <Card className="neon-border bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">You selected:</p>
                  <p className="font-semibold text-lg">{selectedPkg.duration} - KES {selectedPkg.price}</p>
                </div>
                <Button
                  onClick={handleSTKPush}
                  disabled={isConnecting}
                  variant="neon"
                  size="lg"
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2" />
                      Pay with M-Pesa
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Secure payments powered by Safaricom M-Pesa</p>
          <p className="mt-1">Need help? Contact support</p>
        </div>
      </div>
    </div>
  );
}