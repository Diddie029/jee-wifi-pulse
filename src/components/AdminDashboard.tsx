import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Users, 
  Package, 
  DollarSign, 
  Edit3, 
  Plus, 
  Trash2,
  Wifi,
  Ticket,
  MapPin,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoucherManagement } from "./VoucherManagement";
import { ConnectedUsers } from "./ConnectedUsers";
import { LocationManagement } from "./LocationManagement";
import { BlacklistWhitelist } from "./BlacklistWhitelist";

interface PackageData {
  id: string;
  name: string;
  duration_minutes: number;
  duration_display: string;
  price: number;
  data_limit_mb: number | null;
  bandwidth_up_mbps: number | null;
  bandwidth_down_mbps: number | null;
  device_limit: number;
  is_active: boolean;
  sort_order: number;
}

interface Stats {
  activeUsers: number;
  totalPackages: number;
  revenueToday: number;
  totalVouchers: number;
}

export function AdminDashboard() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    totalPackages: 0,
    revenueToday: 0,
    totalVouchers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_display: '',
    duration_minutes: 60,
    price: 0,
    data_limit_mb: null as number | null,
    bandwidth_down_mbps: null as number | null,
    bandwidth_up_mbps: null as number | null,
    device_limit: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    
    // Auto-expire vouchers on load
    supabase.rpc('expire_vouchers');

    // Set up realtime for stats updates
    const channel = supabase
      .channel('admin_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const [packagesRes, sessionsRes, paymentsRes, vouchersRes] = await Promise.all([
      supabase.from('packages').select('*').order('sort_order'),
      supabase.from('user_sessions').select('id').eq('status', 'active'),
      supabase.from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('vouchers').select('id').eq('status', 'available')
    ]);

    if (packagesRes.data) setPackages(packagesRes.data);
    
    setStats({
      activeUsers: sessionsRes.data?.length || 0,
      totalPackages: packagesRes.data?.length || 0,
      revenueToday: paymentsRes.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
      totalVouchers: vouchersRes.data?.length || 0
    });

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration_display: '',
      duration_minutes: 60,
      price: 0,
      data_limit_mb: null,
      bandwidth_down_mbps: null,
      bandwidth_up_mbps: null,
      device_limit: 1,
      is_active: true
    });
    setEditingPackage(null);
  };

  const handleEditPackage = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      duration_display: pkg.duration_display,
      duration_minutes: pkg.duration_minutes,
      price: pkg.price,
      data_limit_mb: pkg.data_limit_mb,
      bandwidth_down_mbps: pkg.bandwidth_down_mbps,
      bandwidth_up_mbps: pkg.bandwidth_up_mbps,
      device_limit: pkg.device_limit,
      is_active: pkg.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePackage = async () => {
    if (!formData.name.trim() || !formData.duration_display.trim()) {
      toast({ title: "Error", description: "Name and duration are required.", variant: "destructive" });
      return;
    }

    const packageData = {
      name: formData.name,
      duration_display: formData.duration_display,
      duration_minutes: formData.duration_minutes,
      price: formData.price,
      data_limit_mb: formData.data_limit_mb,
      bandwidth_down_mbps: formData.bandwidth_down_mbps,
      bandwidth_up_mbps: formData.bandwidth_up_mbps,
      device_limit: formData.device_limit,
      is_active: formData.is_active
    };

    if (editingPackage) {
      const { error } = await supabase
        .from('packages')
        .update(packageData)
        .eq('id', editingPackage.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update package.", variant: "destructive" });
      } else {
        toast({ title: "Updated", description: "Package updated successfully." });
        fetchData();
        setIsEditDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('packages')
        .insert({ ...packageData, sort_order: packages.length + 1 });

      if (error) {
        toast({ title: "Error", description: "Failed to create package.", variant: "destructive" });
      } else {
        toast({ title: "Created", description: "Package created successfully." });
        fetchData();
        setIsAddDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDeletePackage = async (id: string) => {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete package.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Package deleted." });
      fetchData();
    }
  };

  const handleTogglePackage = async (id: string, isActive: boolean) => {
    await supabase.from('packages').update({ is_active: !isActive }).eq('id', id);
    fetchData();
  };

  const PackageForm = () => (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Package Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Standard"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Duration Display</Label>
          <Input
            value={formData.duration_display}
            onChange={(e) => setFormData({ ...formData, duration_display: e.target.value })}
            placeholder="e.g., 2 hours"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Price (KES)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Data Limit (MB)</Label>
          <Input
            type="number"
            value={formData.data_limit_mb || ''}
            onChange={(e) => setFormData({ ...formData, data_limit_mb: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Unlimited"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Download (Mbps)</Label>
          <Input
            type="number"
            value={formData.bandwidth_down_mbps || ''}
            onChange={(e) => setFormData({ ...formData, bandwidth_down_mbps: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Unlimited"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Upload (Mbps)</Label>
          <Input
            type="number"
            value={formData.bandwidth_up_mbps || ''}
            onChange={(e) => setFormData({ ...formData, bandwidth_up_mbps: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Unlimited"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Device Limit</Label>
          <Input
            type="number"
            value={formData.device_limit}
            onChange={(e) => setFormData({ ...formData, device_limit: parseInt(e.target.value) || 1 })}
            min={1}
            className="mt-1"
          />
        </div>
        <div className="flex items-center justify-between pt-6">
          <Label>Active</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      </div>
      <Button onClick={handleSavePackage} className="w-full" variant="neon">
        {editingPackage ? 'Update Package' : 'Create Package'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 neon-border">
              <Wifi className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">JEE WiFi Admin</h1>
              <p className="text-muted-foreground text-sm">Hotspot Management Dashboard</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="neon-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stats.activeUsers}</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Vouchers</p>
                  <p className="text-2xl md:text-3xl font-bold text-secondary">{stats.totalVouchers}</p>
                </div>
                <Ticket className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl md:text-3xl font-bold text-success">KES {stats.revenueToday}</p>
                </div>
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Network</p>
                  <p className="text-lg font-bold text-success">Online</p>
                </div>
                <div className="h-3 w-3 bg-success rounded-full pulse-neon"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="users" className="text-xs md:text-sm">
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-xs md:text-sm">
              <Ticket className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Vouchers</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-xs md:text-sm">
              <Package className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="text-xs md:text-sm">
              <MapPin className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="text-xs md:text-sm">
              <ShieldCheck className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs md:text-sm">
              <CreditCard className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <ConnectedUsers />
          </TabsContent>

          <TabsContent value="vouchers">
            <VoucherManagement />
          </TabsContent>

          <TabsContent value="packages">
            <Card className="neon-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Billing Packages
                </CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="neon" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Package</DialogTitle>
                    </DialogHeader>
                    <PackageForm />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading packages...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <Card key={pkg.id} className={`border-2 transition-colors ${pkg.is_active ? 'border-border hover:border-primary/50' : 'border-muted opacity-60'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={pkg.is_active ? "default" : "secondary"}>
                              {pkg.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleTogglePackage(pkg.id, pkg.is_active)}>
                                <Badge variant="outline" className="text-xs">
                                  {pkg.is_active ? 'Disable' : 'Enable'}
                                </Badge>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          <p className="text-muted-foreground text-sm">{pkg.duration_display}</p>
                          <p className="text-2xl font-bold text-primary mt-2">KES {pkg.price}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pkg.data_limit_mb && (
                              <Badge variant="outline" className="text-xs">{pkg.data_limit_mb}MB</Badge>
                            )}
                            {pkg.bandwidth_down_mbps && (
                              <Badge variant="outline" className="text-xs">{pkg.bandwidth_down_mbps}Mbps</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{pkg.device_limit} device(s)</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <LocationManagement />
          </TabsContent>

          <TabsContent value="access">
            <BlacklistWhitelist />
          </TabsContent>

          <TabsContent value="payments">
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Payment integration coming soon. Connect M-Pesa for automatic payments.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Package Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
            </DialogHeader>
            <PackageForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
