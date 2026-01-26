import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Users, 
  Package, 
  DollarSign, 
  Edit3, 
  Plus, 
  Trash2,
  Smartphone,
  Monitor,
  Clock,
  Wifi,
  Ticket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoucherManagement } from "./VoucherManagement";

const MOCK_PACKAGES = [
  { id: 1, duration: "40 minutes", price: 5, active: true },
  { id: 2, duration: "2 hours", price: 10, active: true },
  { id: 3, duration: "6 hours", price: 19, active: true },
  { id: 4, duration: "12 hours", price: 29, active: true },
  { id: 5, duration: "24 hours", price: 39, active: true },
  { id: 6, duration: "1 week", price: 199, active: true },
  { id: 7, duration: "1 month", price: 799, active: true },
];

const MOCK_ACTIVE_USERS = [
  { 
    id: 1, 
    deviceName: "iPhone 14", 
    ipAddress: "192.168.1.100", 
    phoneNumber: "254712345678", 
    packageDuration: "2 hours", 
    timeRemaining: "1h 23m",
    status: "active"
  },
  { 
    id: 2, 
    deviceName: "Samsung Galaxy S21", 
    ipAddress: "192.168.1.101", 
    phoneNumber: "254723456789", 
    packageDuration: "6 hours", 
    timeRemaining: "4h 12m",
    status: "active"
  },
  { 
    id: 3, 
    deviceName: "MacBook Pro", 
    ipAddress: "192.168.1.102", 
    phoneNumber: "254734567890", 
    packageDuration: "24 hours", 
    timeRemaining: "18h 45m",
    status: "active"
  },
  { 
    id: 4, 
    deviceName: "HP Laptop", 
    ipAddress: "192.168.1.103", 
    phoneNumber: "254745678901", 
    packageDuration: "12 hours", 
    timeRemaining: "7h 30m",
    status: "active"
  }
];

interface PackageFormData {
  duration: string;
  price: number;
}

export function AdminDashboard() {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [activeUsers] = useState(MOCK_ACTIVE_USERS);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState<PackageFormData>({ duration: "", price: 0 });
  const { toast } = useToast();

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({ duration: pkg.duration, price: pkg.price });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingPackage) {
      setPackages(packages.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...pkg, duration: formData.duration, price: formData.price }
          : pkg
      ));
      toast({
        title: "Package Updated",
        description: "Package has been successfully updated.",
      });
    }
    setIsEditDialogOpen(false);
    setEditingPackage(null);
    setFormData({ duration: "", price: 0 });
  };

  const handleAddPackage = () => {
    const newPackage = {
      id: packages.length + 1,
      duration: formData.duration,
      price: formData.price,
      active: true
    };
    setPackages([...packages, newPackage]);
    toast({
      title: "Package Added",
      description: "New package has been successfully added.",
    });
    setIsAddDialogOpen(false);
    setFormData({ duration: "", price: 0 });
  };

  const handleDeletePackage = (id: number) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
    toast({
      title: "Package Deleted",
      description: "Package has been successfully deleted.",
      variant: "destructive",
    });
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.price, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 neon-border">
              <Wifi className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">JEE WiFi Admin</h1>
              <p className="text-muted-foreground">Hotspot Management Dashboard</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-primary">{activeUsers.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Packages</p>
                  <p className="text-3xl font-bold text-secondary">{packages.length}</p>
                </div>
                <Package className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                  <p className="text-3xl font-bold text-success">KES 450</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network Status</p>
                  <p className="text-lg font-bold text-success">Online</p>
                </div>
                <div className="h-3 w-3 bg-success rounded-full pulse-neon"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            <Card className="neon-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary">Billing Packages</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="neon" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Package</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          placeholder="e.g., 3 hours"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (KES)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          placeholder="e.g., 15"
                        />
                      </div>
                      <Button onClick={handleAddPackage} className="w-full" variant="neon">
                        Add Package
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className="border-2 border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={pkg.active ? "default" : "secondary"}>
                            {pkg.active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPackage(pkg)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.duration}</h3>
                          <p className="text-2xl font-bold text-primary">KES {pkg.price}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6">
            <VoucherManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="text-primary">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {activeUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-2">
                          {user.deviceName.includes("iPhone") || user.deviceName.includes("Samsung") ? (
                            <Smartphone className="h-4 w-4 text-primary" />
                          ) : (
                            <Monitor className="h-4 w-4 text-primary" />
                          )}
                          {user.deviceName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.ipAddress}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.packageDuration}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-warning" />
                          {user.timeRemaining}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Package Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (KES)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <Button onClick={handleSaveEdit} className="w-full" variant="neon">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}