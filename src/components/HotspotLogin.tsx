import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Ticket, 
  QrCode, 
  User, 
  Smartphone, 
  Wifi, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Package {
  id: string;
  name: string;
  duration_minutes: number;
  duration_display: string;
  price: number;
  currency: string;
}

interface HotspotLoginProps {
  onLoginSuccess: (sessionId: string) => void;
  macAddress?: string;
  ipAddress?: string;
}

export function HotspotLogin({ onLoginSuccess, macAddress = '', ipAddress = '' }: HotspotLoginProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
    checkMacAutoLogin();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (data) setPackages(data);
  };

  const checkMacAutoLogin = async () => {
    if (!macAddress) return;

    // Check whitelist for auto-connect
    const { data: whitelistEntry } = await supabase
      .from('whitelist')
      .select('*')
      .eq('mac_address', macAddress)
      .eq('is_walled_garden', false)
      .maybeSingle();

    if (whitelistEntry) {
      // Auto-login whitelisted device
      const session = await createSession('mac', null);
      if (session) {
        onLoginSuccess(session.id);
      }
    }
  };

  const checkBlacklist = async (): Promise<boolean> => {
    const { data } = await supabase.rpc('is_blacklisted', {
      _mac_address: macAddress || null,
      _phone_number: phoneNumber || null,
      _ip_address: ipAddress || null
    });
    return data === true;
  };

  const createSession = async (authMethod: string, voucherId: string | null, timeLimitSeconds?: number) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        voucher_id: voucherId,
        mac_address: macAddress || 'unknown',
        ip_address: ipAddress,
        auth_method: authMethod,
        time_limit_seconds: timeLimitSeconds,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return null;
    }
    return data;
  };

  const handleVoucherLogin = async () => {
    if (!voucherCode.trim()) {
      toast({ title: "Error", description: "Please enter a voucher code.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Check blacklist
    if (await checkBlacklist()) {
      toast({ title: "Blocked", description: "Your device has been blocked.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Find voucher
    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucherCode.toUpperCase().trim())
      .eq('status', 'available')
      .maybeSingle();

    if (error || !voucher) {
      toast({ title: "Invalid Code", description: "Voucher not found or already used.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Check device limit
    const { data: canUse } = await supabase.rpc('check_voucher_device_limit', {
      _voucher_id: voucher.id,
      _mac_address: macAddress || 'unknown'
    });

    if (!canUse) {
      toast({ 
        title: "Device Limit Reached", 
        description: `This voucher can only be used on ${voucher.device_limit} device(s).`,
        variant: "destructive" 
      });
      setIsLoading(false);
      return;
    }

    // Register device
    await supabase.from('voucher_devices').upsert({
      voucher_id: voucher.id,
      mac_address: macAddress || 'unknown',
      last_seen: new Date().toISOString()
    }, { onConflict: 'voucher_id,mac_address' });

    // Get package duration in seconds
    const pkg = packages.find(p => p.duration_display === voucher.package_duration);
    const timeLimitSeconds = pkg ? pkg.duration_minutes * 60 : 3600;

    // Claim voucher
    await supabase
      .from('vouchers')
      .update({ 
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claimed_by: phoneNumber || macAddress || 'anonymous'
      })
      .eq('id', voucher.id);

    // Create session
    const session = await createSession('voucher', voucher.id, timeLimitSeconds);
    
    if (session) {
      setLoginSuccess(true);
      toast({ title: "Connected!", description: `You now have ${voucher.package_duration} of internet access.` });
      setTimeout(() => onLoginSuccess(session.id), 1500);
    }

    setIsLoading(false);
  };

  const handleUsernameLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please enter username and password.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Check blacklist
    if (await checkBlacklist()) {
      toast({ title: "Blocked", description: "Your device has been blocked.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Find user
    const { data: user, error } = await supabase
      .from('hotspot_users')
      .select('*')
      .eq('username', username.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !user) {
      toast({ title: "Invalid Credentials", description: "Username not found.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (user.is_blacklisted) {
      toast({ title: "Blocked", description: user.blacklist_reason || "Account blocked.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Simple password check (in production, use proper hashing)
    if (user.password_hash !== password) {
      toast({ title: "Invalid Credentials", description: "Incorrect password.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Create session
    const session = await createSession('password', null);
    
    if (session) {
      setLoginSuccess(true);
      toast({ title: "Connected!", description: "You are now connected." });
      setTimeout(() => onLoginSuccess(session.id), 1500);
    }

    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast({ title: "Error", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Store OTP
    await supabase.from('sms_otp').insert({
      phone_number: phoneNumber,
      otp_code: otp,
      expires_at: expiresAt.toISOString()
    });

    // In production, send SMS via Africa's Talking
    // For demo, show the OTP
    toast({ 
      title: "OTP Sent", 
      description: `Demo OTP: ${otp} (In production, this would be sent via SMS)` 
    });

    setOtpSent(true);
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      toast({ title: "Error", description: "Please enter the OTP.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Verify OTP
    const { data: otpEntry } = await supabase
      .from('sms_otp')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpEntry) {
      toast({ title: "Invalid OTP", description: "Code expired or incorrect.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Mark as verified
    await supabase
      .from('sms_otp')
      .update({ verified: true })
      .eq('id', otpEntry.id);

    // Create session
    const session = await createSession('sms', null);
    
    if (session) {
      setLoginSuccess(true);
      toast({ title: "Connected!", description: "Phone verified. You are now connected." });
      setTimeout(() => onLoginSuccess(session.id), 1500);
    }

    setIsLoading(false);
  };

  if (loginSuccess) {
    return (
      <Card className="neon-border border-success">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
          <h2 className="text-2xl font-bold text-success">Connected!</h2>
          <p className="text-muted-foreground mt-2">Redirecting to your session...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-border">
      <CardHeader className="text-center">
        <div className="mx-auto p-4 rounded-full bg-primary/20 w-fit mb-4">
          <Wifi className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl gradient-text">JEE WiFi</CardTitle>
        <CardDescription>Choose your login method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voucher" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="voucher" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Voucher</span>
            </TabsTrigger>
            <TabsTrigger value="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
          </TabsList>

          {/* Voucher Login */}
          <TabsContent value="voucher" className="space-y-4">
            <div>
              <Label htmlFor="voucher">Voucher Code</Label>
              <Input
                id="voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="JEE-XXXXXXXX"
                className="mt-1 font-mono text-center text-lg"
                maxLength={12}
              />
            </div>
            <div>
              <Label htmlFor="phone-voucher">Phone Number (optional)</Label>
              <Input
                id="phone-voucher"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleVoucherLogin} 
              className="w-full" 
              variant="neon"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ticket className="mr-2 h-4 w-4" />
              )}
              Connect
            </Button>

            <div className="text-center mt-4">
              <Button variant="link" size="sm" className="text-muted-foreground">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </div>
          </TabsContent>

          {/* Username/Password Login */}
          <TabsContent value="username" className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleUsernameLogin} 
              className="w-full" 
              variant="neon"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
          </TabsContent>

          {/* SMS OTP Login */}
          <TabsContent value="sms" className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <Label htmlFor="phone-sms">Phone Number</Label>
                  <Input
                    id="phone-sms"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleSendOTP} 
                  className="w-full" 
                  variant="neon"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Smartphone className="mr-2 h-4 w-4" />
                  )}
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <Badge variant="secondary">OTP sent to {phoneNumber}</Badge>
                </div>
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="mt-1 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={handleVerifyOTP} 
                  className="w-full" 
                  variant="neon"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Verify & Connect
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => { setOtpSent(false); setOtpCode(''); }}
                >
                  Change phone number
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Package Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Available Packages</p>
          <div className="flex flex-wrap justify-center gap-2">
            {packages.slice(0, 4).map((pkg) => (
              <Badge key={pkg.id} variant="outline">
                {pkg.duration_display} - KES {pkg.price}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
