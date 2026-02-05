import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Ban, ShieldCheck, Plus, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlacklistEntry {
  id: string;
  mac_address: string | null;
  ip_address: string | null;
  phone_number: string | null;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
}

interface WhitelistEntry {
  id: string;
  mac_address: string | null;
  ip_address: string | null;
  domain: string | null;
  description: string | null;
  is_walled_garden: boolean;
  created_at: string;
}

export function BlacklistWhitelist() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false);
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false);
  const [blacklistForm, setBlacklistForm] = useState({
    mac_address: '',
    ip_address: '',
    phone_number: '',
    reason: '',
    is_permanent: true,
    expires_days: 7
  });
  const [whitelistForm, setWhitelistForm] = useState({
    mac_address: '',
    ip_address: '',
    domain: '',
    description: '',
    is_walled_garden: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [blacklistRes, whitelistRes] = await Promise.all([
      supabase.from('blacklist').select('*').order('blocked_at', { ascending: false }),
      supabase.from('whitelist').select('*').order('created_at', { ascending: false })
    ]);

    if (!blacklistRes.error) setBlacklist(blacklistRes.data || []);
    if (!whitelistRes.error) setWhitelist(whitelistRes.data || []);
    setIsLoading(false);
  };

  const handleAddToBlacklist = async () => {
    if (!blacklistForm.mac_address && !blacklistForm.ip_address && !blacklistForm.phone_number) {
      toast({
        title: "Error",
        description: "At least one identifier (MAC, IP, or phone) is required.",
        variant: "destructive",
      });
      return;
    }

    if (!blacklistForm.reason.trim()) {
      toast({
        title: "Error",
        description: "Reason is required.",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      reason: blacklistForm.reason,
      is_permanent: blacklistForm.is_permanent,
    };

    if (blacklistForm.mac_address) data.mac_address = blacklistForm.mac_address;
    if (blacklistForm.ip_address) data.ip_address = blacklistForm.ip_address;
    if (blacklistForm.phone_number) data.phone_number = blacklistForm.phone_number;
    
    if (!blacklistForm.is_permanent) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + blacklistForm.expires_days);
      data.expires_at = expiresAt.toISOString();
    }

    const { error } = await supabase.from('blacklist').insert(data);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to blacklist.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Blocked",
        description: "Added to blacklist successfully.",
      });
      fetchData();
      setIsBlacklistDialogOpen(false);
      setBlacklistForm({
        mac_address: '',
        ip_address: '',
        phone_number: '',
        reason: '',
        is_permanent: true,
        expires_days: 7
      });
    }
  };

  const handleAddToWhitelist = async () => {
    if (!whitelistForm.mac_address && !whitelistForm.ip_address && !whitelistForm.domain) {
      toast({
        title: "Error",
        description: "At least one identifier (MAC, IP, or domain) is required.",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      description: whitelistForm.description || null,
      is_walled_garden: whitelistForm.is_walled_garden,
    };

    if (whitelistForm.mac_address) data.mac_address = whitelistForm.mac_address;
    if (whitelistForm.ip_address) data.ip_address = whitelistForm.ip_address;
    if (whitelistForm.domain) data.domain = whitelistForm.domain;

    const { error } = await supabase.from('whitelist').insert(data);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to whitelist.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added",
        description: "Added to whitelist successfully.",
      });
      fetchData();
      setIsWhitelistDialogOpen(false);
      setWhitelistForm({
        mac_address: '',
        ip_address: '',
        domain: '',
        description: '',
        is_walled_garden: false
      });
    }
  };

  const handleRemoveFromBlacklist = async (id: string) => {
    const { error } = await supabase.from('blacklist').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to remove.", variant: "destructive" });
    } else {
      toast({ title: "Removed", description: "Removed from blacklist." });
      fetchData();
    }
  };

  const handleRemoveFromWhitelist = async (id: string) => {
    const { error } = await supabase.from('whitelist').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to remove.", variant: "destructive" });
    } else {
      toast({ title: "Removed", description: "Removed from whitelist." });
      fetchData();
    }
  };

  return (
    <Card className="neon-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          Access Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="blacklist">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="blacklist" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Blacklist ({blacklist.length})
            </TabsTrigger>
            <TabsTrigger value="whitelist" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Whitelist ({whitelist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blacklist">
            <div className="flex justify-end mb-4">
              <Dialog open={isBlacklistDialogOpen} onOpenChange={setIsBlacklistDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Block User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Blacklist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>MAC Address</Label>
                      <Input
                        value={blacklistForm.mac_address}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, mac_address: e.target.value })}
                        placeholder="AA:BB:CC:DD:EE:FF"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>IP Address</Label>
                      <Input
                        value={blacklistForm.ip_address}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, ip_address: e.target.value })}
                        placeholder="192.168.1.100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={blacklistForm.phone_number}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, phone_number: e.target.value })}
                        placeholder="254712345678"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Reason *</Label>
                      <Textarea
                        value={blacklistForm.reason}
                        onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                        placeholder="Reason for blocking..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Permanent Block</Label>
                      <Switch
                        checked={blacklistForm.is_permanent}
                        onCheckedChange={(checked) => setBlacklistForm({ ...blacklistForm, is_permanent: checked })}
                      />
                    </div>
                    {!blacklistForm.is_permanent && (
                      <div>
                        <Label>Block Duration (days)</Label>
                        <Input
                          type="number"
                          value={blacklistForm.expires_days}
                          onChange={(e) => setBlacklistForm({ ...blacklistForm, expires_days: parseInt(e.target.value) || 7 })}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button onClick={handleAddToBlacklist} variant="destructive" className="w-full">
                      <Ban className="mr-2 h-4 w-4" />
                      Block
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : blacklist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No blocked users.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.mac_address && <p className="font-mono text-xs">MAC: {entry.mac_address}</p>}
                          {entry.ip_address && <p className="font-mono text-xs">IP: {entry.ip_address}</p>}
                          {entry.phone_number && <p className="text-xs">Phone: {entry.phone_number}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.reason}</TableCell>
                      <TableCell>
                        {entry.is_permanent ? (
                          <Badge variant="destructive">Permanent</Badge>
                        ) : (
                          <span className="text-sm">
                            {entry.expires_at ? new Date(entry.expires_at).toLocaleDateString() : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromBlacklist(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="whitelist">
            <div className="flex justify-end mb-4">
              <Dialog open={isWhitelistDialogOpen} onOpenChange={setIsWhitelistDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="neon" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Whitelist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Whitelist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>MAC Address (auto-connect device)</Label>
                      <Input
                        value={whitelistForm.mac_address}
                        onChange={(e) => setWhitelistForm({ ...whitelistForm, mac_address: e.target.value })}
                        placeholder="AA:BB:CC:DD:EE:FF"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>IP Address</Label>
                      <Input
                        value={whitelistForm.ip_address}
                        onChange={(e) => setWhitelistForm({ ...whitelistForm, ip_address: e.target.value })}
                        placeholder="192.168.1.100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Domain (walled garden)</Label>
                      <Input
                        value={whitelistForm.domain}
                        onChange={(e) => setWhitelistForm({ ...whitelistForm, domain: e.target.value })}
                        placeholder="google.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={whitelistForm.description}
                        onChange={(e) => setWhitelistForm({ ...whitelistForm, description: e.target.value })}
                        placeholder="e.g., Payment gateway"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Walled Garden</Label>
                        <p className="text-xs text-muted-foreground">Allow free access without login</p>
                      </div>
                      <Switch
                        checked={whitelistForm.is_walled_garden}
                        onCheckedChange={(checked) => setWhitelistForm({ ...whitelistForm, is_walled_garden: checked })}
                      />
                    </div>
                    <Button onClick={handleAddToWhitelist} variant="neon" className="w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : whitelist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No whitelist entries.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.mac_address && <p className="font-mono text-xs">MAC: {entry.mac_address}</p>}
                          {entry.ip_address && <p className="font-mono text-xs">IP: {entry.ip_address}</p>}
                          {entry.domain && (
                            <p className="flex items-center gap-1 text-xs">
                              <Globe className="h-3 w-3" />
                              {entry.domain}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{entry.description || '-'}</TableCell>
                      <TableCell>
                        {entry.is_walled_garden ? (
                          <Badge variant="secondary">Walled Garden</Badge>
                        ) : (
                          <Badge variant="outline">Auto-Connect</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWhitelist(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
