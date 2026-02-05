import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Gauge, 
  Database, 
  History, 
  ShoppingCart,
  Pause,
  Play,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Session {
  id: string;
  status: string;
  session_start: string;
  session_end: string | null;
  time_limit_seconds: number | null;
  time_used_seconds: number;
  data_limit_mb: number | null;
  data_used_mb: number;
  bandwidth_up_mbps: number | null;
  bandwidth_down_mbps: number | null;
  mac_address: string;
  device_name: string | null;
  device_type: string | null;
  ip_address: string | null;
  auth_method: string | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  package_duration: string | null;
  mpesa_receipt: string | null;
  created_at: string;
}

interface UserPortalProps {
  sessionId?: string;
  macAddress?: string;
}

export function UserPortal({ sessionId, macAddress }: UserPortalProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSession();
    fetchPayments();

    // Set up realtime subscription for session updates
    const channel = supabase
      .channel('session_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
          filter: sessionId ? `id=eq.${sessionId}` : undefined
        },
        () => {
          fetchSession();
        }
      )
      .subscribe();

    // Update time used every second
    const interval = setInterval(() => {
      setSession(prev => {
        if (prev && prev.status === 'active' && !isPaused) {
          return { ...prev, time_used_seconds: prev.time_used_seconds + 1 };
        }
        return prev;
      });
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [sessionId, macAddress, isPaused]);

  const fetchSession = async () => {
    let query = supabase
      .from('user_sessions')
      .select('*')
      .eq('status', 'active')
      .order('session_start', { ascending: false })
      .limit(1);

    if (sessionId) {
      query = supabase.from('user_sessions').select('*').eq('id', sessionId);
    } else if (macAddress) {
      query = supabase
        .from('user_sessions')
        .select('*')
        .eq('mac_address', macAddress)
        .eq('status', 'active')
        .order('session_start', { ascending: false })
        .limit(1);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Failed to fetch session:', error);
    } else {
      setSession(data);
    }
    setIsLoading(false);
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setPayments(data);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeRemaining = () => {
    if (!session || !session.time_limit_seconds) return null;
    const remaining = session.time_limit_seconds - session.time_used_seconds;
    return Math.max(0, remaining);
  };

  const getTimeProgress = () => {
    if (!session || !session.time_limit_seconds) return 0;
    return Math.min(100, (session.time_used_seconds / session.time_limit_seconds) * 100);
  };

  const getDataProgress = () => {
    if (!session || !session.data_limit_mb) return 0;
    return Math.min(100, (session.data_used_mb / session.data_limit_mb) * 100);
  };

  const handlePauseResume = async () => {
    if (!session) return;
    
    const newStatus = isPaused ? 'active' : 'paused';
    const { error } = await supabase
      .from('user_sessions')
      .update({ status: newStatus })
      .eq('id', session.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update session.",
        variant: "destructive"
      });
    } else {
      setIsPaused(!isPaused);
      toast({
        title: isPaused ? "Resumed" : "Paused",
        description: isPaused ? "Your session has been resumed." : "Your session has been paused."
      });
    }
  };

  const handleLogout = async () => {
    if (!session) return;
    
    const { error } = await supabase
      .from('user_sessions')
      .update({ 
        status: 'disconnected',
        session_end: new Date().toISOString()
      })
      .eq('id', session.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to end session.",
        variant: "destructive"
      });
    } else {
      setSession(null);
      toast({
        title: "Logged Out",
        description: "Your session has been ended."
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="neon-border">
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading session info...
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="neon-border">
        <CardHeader className="text-center">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Not Connected</CardTitle>
          <CardDescription>
            You don't have an active session. Please login or redeem a voucher to connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="neon" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const timeRemaining = getTimeRemaining();
  const isLowTime = timeRemaining !== null && timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`neon-border ${session.status === 'active' ? 'border-success' : 'border-warning'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${session.status === 'active' ? 'bg-success/20' : 'bg-warning/20'}`}>
                {session.status === 'active' ? (
                  <Wifi className="h-6 w-6 text-success" />
                ) : (
                  <WifiOff className="h-6 w-6 text-warning" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {session.status === 'active' ? 'Connected' : 'Paused'}
                </CardTitle>
                <CardDescription>
                  via {session.auth_method || 'voucher'}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={session.status === 'active' ? 'default' : 'secondary'}
              className={session.status === 'active' ? 'bg-success' : ''}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Time & Data Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Remaining */}
        <Card className={`neon-border ${isLowTime ? 'border-destructive' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isLowTime ? 'text-destructive' : 'text-primary'}`} />
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {timeRemaining !== null ? (
              <>
                <p className={`text-3xl font-bold ${isLowTime ? 'text-destructive' : 'text-primary'}`}>
                  {formatTime(timeRemaining)}
                </p>
                <Progress 
                  value={100 - getTimeProgress()} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used: {formatTime(session.time_used_seconds)} / {formatTime(session.time_limit_seconds || 0)}
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold text-primary">Unlimited</p>
            )}
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="neon-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-secondary" />
              <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {session.data_limit_mb ? (
              <>
                <p className="text-3xl font-bold text-secondary">
                  {(session.data_limit_mb - session.data_used_mb).toFixed(1)} MB
                </p>
                <Progress 
                  value={100 - getDataProgress()} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used: {session.data_used_mb.toFixed(1)} MB / {session.data_limit_mb} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-secondary">
                  {session.data_used_mb.toFixed(1)} MB
                </p>
                <p className="text-xs text-muted-foreground mt-1">Unlimited data</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Speed & Device Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speed */}
        <Card className="neon-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-warning" />
              <CardTitle className="text-sm font-medium">Speed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Download</p>
                <p className="text-xl font-bold text-warning">
                  {session.bandwidth_down_mbps || '∞'} Mbps
                </p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <p className="text-xs text-muted-foreground">Upload</p>
                <p className="text-xl font-bold text-warning">
                  {session.bandwidth_up_mbps || '∞'} Mbps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="neon-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium">Device</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{session.device_name || 'Unknown Device'}</p>
            <p className="text-xs text-muted-foreground">IP: {session.ip_address || 'N/A'}</p>
            <p className="text-xs text-muted-foreground font-mono">MAC: {session.mac_address}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button 
          variant={isPaused ? "neon" : "outline"} 
          onClick={handlePauseResume}
          className="w-full"
        >
          {isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          )}
        </Button>

        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment History</DialogTitle>
            </DialogHeader>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.package_duration || '-'}</TableCell>
                      <TableCell>
                        {payment.currency} {payment.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.mpesa_receipt || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No payment history yet.
              </p>
            )}
          </DialogContent>
        </Dialog>

        <Button variant="neon" className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy More
        </Button>

        <Button variant="destructive" onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
