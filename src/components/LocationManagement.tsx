import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Plus, Edit3, Trash2, Wifi, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  id: string;
  name: string;
  address: string | null;
  router_ip: string | null;
  router_type: string | null;
  api_port: number | null;
  ssid: string | null;
  is_active: boolean;
  created_at: string;
}

export function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    router_ip: '',
    router_type: 'mikrotik',
    api_port: 8728,
    ssid: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch locations.",
        variant: "destructive",
      });
    } else {
      setLocations(data || []);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      router_ip: '',
      router_type: 'mikrotik',
      api_port: 8728,
      ssid: '',
      is_active: true
    });
    setEditingLocation(null);
  };

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address || '',
        router_ip: location.router_ip || '',
        router_type: location.router_type || 'mikrotik',
        api_port: location.api_port || 8728,
        ssid: location.ssid || '',
        is_active: location.is_active
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Location name is required.",
        variant: "destructive",
      });
      return;
    }

    const locationData = {
      name: formData.name,
      address: formData.address || null,
      router_ip: formData.router_ip || null,
      router_type: formData.router_type,
      api_port: formData.api_port,
      ssid: formData.ssid || null,
      is_active: formData.is_active
    };

    if (editingLocation) {
      const { error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', editingLocation.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update location.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Location updated successfully.",
        });
        fetchLocations();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('locations')
        .insert(locationData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create location.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Location created successfully.",
        });
        fetchLocations();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete location.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Location deleted successfully.",
      });
      fetchLocations();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('locations')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update location status.",
        variant: "destructive",
      });
    } else {
      fetchLocations();
    }
  };

  return (
    <Card className="neon-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          Location Management
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="neon" size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Branch"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 Main Street"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ssid">WiFi SSID</Label>
                <Input
                  id="ssid"
                  value={formData.ssid}
                  onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                  placeholder="e.g., JEE-WiFi"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="router_ip">Router IP</Label>
                  <Input
                    id="router_ip"
                    value={formData.router_ip}
                    onChange={(e) => setFormData({ ...formData, router_ip: e.target.value })}
                    placeholder="192.168.1.1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="api_port">API Port</Label>
                  <Input
                    id="api_port"
                    type="number"
                    value={formData.api_port}
                    onChange={(e) => setFormData({ ...formData, api_port: parseInt(e.target.value) || 8728 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button onClick={handleSave} className="w-full" variant="neon">
                {editingLocation ? 'Update Location' : 'Create Location'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading locations...</div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No locations configured. Click "Add Location" to create one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SSID</TableHead>
                <TableHead>Router IP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        {location.address && (
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {location.ssid || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {location.router_ip || '-'}
                        {location.api_port && `:${location.api_port}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={location.is_active ? "default" : "secondary"}
                      className={location.is_active ? "bg-success" : ""}
                    >
                      {location.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(location)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(location.id, location.is_active)}
                      >
                        {location.is_active ? (
                          <Badge variant="outline" className="text-xs">Disable</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Enable</Badge>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
