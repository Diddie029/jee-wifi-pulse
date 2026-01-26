import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, CheckCircle, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RedeemResult {
  success: boolean;
  package_duration: string;
  package_price: number;
}

export function VoucherRedeem() {
  const [voucherCode, setVoucherCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null);
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Enter Voucher Code",
        description: "Please enter a valid voucher code.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Enter Phone Number",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);

    // Check if voucher exists and is available
    const { data: voucher, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucherCode.toUpperCase().trim())
      .eq('status', 'available')
      .maybeSingle();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to verify voucher. Please try again.",
        variant: "destructive",
      });
      setIsRedeeming(false);
      return;
    }

    if (!voucher) {
      toast({
        title: "Invalid Voucher",
        description: "This voucher code is invalid or has already been used.",
        variant: "destructive",
      });
      setIsRedeeming(false);
      return;
    }

    // Claim the voucher
    const { error: updateError } = await supabase
      .from('vouchers')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claimed_by: phoneNumber.trim(),
      })
      .eq('id', voucher.id)
      .eq('status', 'available');

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to redeem voucher. Please try again.",
        variant: "destructive",
      });
      setIsRedeeming(false);
      return;
    }

    setRedeemResult({
      success: true,
      package_duration: voucher.package_duration,
      package_price: voucher.package_price,
    });

    toast({
      title: "Voucher Redeemed!",
      description: `You now have ${voucher.package_duration} of internet access.`,
    });

    setIsRedeeming(false);
  };

  if (redeemResult?.success) {
    return (
      <Card className="neon-border bg-success/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-success/20 neon-border">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-success mb-2">Access Activated!</h2>
              <p className="text-muted-foreground">
                Your internet access has been activated successfully.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 neon-border">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Wifi className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">
                  {redeemResult.package_duration}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Package Value: KES {redeemResult.package_price}
              </p>
            </div>
            <Button 
              onClick={() => {
                setRedeemResult(null);
                setVoucherCode("");
                setPhoneNumber("");
              }}
              variant="outline"
            >
              Redeem Another Voucher
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Ticket className="h-5 w-5" />
          Redeem Voucher Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Have a voucher code? Enter it below to activate your internet access.
          </p>
          <div className="space-y-3">
            <Input
              type="tel"
              placeholder="Phone Number (254...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="neon-border bg-background/50"
            />
            <Input
              type="text"
              placeholder="Enter voucher code (e.g., JEE-XXXXXXXX)"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="neon-border bg-background/50 font-mono text-center text-lg tracking-wider"
              maxLength={12}
            />
          </div>
          <Button
            onClick={handleRedeem}
            disabled={isRedeeming || !voucherCode.trim() || !phoneNumber.trim()}
            variant="neon"
            size="lg"
            className="w-full"
          >
            {isRedeeming ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Ticket className="mr-2 h-4 w-4" />
                Redeem Voucher
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
