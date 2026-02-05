import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Smartphone, Monitor, Clock, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConnectedUser {
  id: string;
  phone_number: string;
  ip_address: string;
  device_name: string | null;
  device_type: string | null;
  package_id: number;
  package_duration: string;
  package_price: number;
  connected_at: string;
  expires_at: string;
  status: string;
  voucher_code: string | null;
}

export function ConnectedUsers() {
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();

    // Set up realtime subscription
    const channel = supabase
      .channel('connected_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connected_users',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('connected_users')
      .select('*')
      .eq('status', 'active')
      .order('connected_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch connected users.",
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getDeviceIcon = (deviceType: string | null, deviceName: string | null) => {
    const name = deviceName?.toLowerCase() || '';
    const type = deviceType?.toLowerCase() || '';
    
    if (type === 'mobile' || name.includes('iphone') || name.includes('samsung') || name.includes('android')) {
      return <Smartphone className="h-4 w-4 text-primary" />;
    }
    return <Monitor className="h-4 w-4 text-primary" />;
  };

  return (
    <Card className="neon-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Users className="h-5 w-5" />
          Connected Users ({users.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading connected users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users currently connected.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    {getDeviceIcon(user.device_type, user.device_name)}
                    {user.device_name || 'Unknown Device'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.ip_address}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>
                    {user.package_duration}
                    {user.voucher_code && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Voucher
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    {getTimeRemaining(user.expires_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
