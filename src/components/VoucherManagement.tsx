import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Plus, Copy, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PACKAGES = [
  { id: 1, duration: "40 minutes", price: 5 },
  { id: 2, duration: "2 hours", price: 10 },
  { id: 3, duration: "6 hours", price: 19 },
  { id: 4, duration: "12 hours", price: 29 },
  { id: 5, duration: "24 hours", price: 39 },
  { id: 6, duration: "1 week", price: 199 },
  { id: 7, duration: "1 month", price: 799 },
];

interface Voucher {
  id: string;
  code: string;
  package_id: number;
  package_duration: string;
  package_price: number;
  status: 'available' | 'claimed' | 'expired';
  created_at: string;
  claimed_at: string | null;
  claimed_by: string | null;
}

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vouchers.",
        variant: "destructive",
      });
    } else {
      setVouchers(data || []);
    }
    setIsLoading(false);
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'JEE-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateVouchers = async () => {
    if (!selectedPackage) {
      toast({
        title: "Select Package",
        description: "Please select a package for the vouchers.",
        variant: "destructive",
      });
      return;
    }

    const pkg = PACKAGES.find(p => p.id === parseInt(selectedPackage));
    if (!pkg) return;

    setIsGenerating(true);

    const newVouchers = [];
    for (let i = 0; i < quantity; i++) {
      newVouchers.push({
        code: generateVoucherCode(),
        package_id: pkg.id,
        package_duration: pkg.duration,
        package_price: pkg.price,
        status: 'available' as const,
      });
    }

    const { error } = await supabase
      .from('vouchers')
      .insert(newVouchers);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate vouchers.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Generated ${quantity} voucher(s) successfully!`,
      });
      fetchVouchers();
      setIsDialogOpen(false);
      setSelectedPackage("");
      setQuantity(1);
    }
    setIsGenerating(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Copied!",
      description: `Voucher code ${code} copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteVoucher = async (id: string) => {
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete voucher.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Voucher deleted successfully.",
      });
      fetchVouchers();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case 'claimed':
        return <Badge variant="secondary">Claimed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="neon-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Ticket className="h-5 w-5" />
          Voucher Management
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="neon" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Vouchers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Select Package</Label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.duration} - KES {pkg.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={handleGenerateVouchers} 
                className="w-full" 
                variant="neon"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Generate {quantity} Voucher{quantity > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No vouchers generated yet. Click "Generate Vouchers" to create some.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claimed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    {voucher.code}
                  </TableCell>
                  <TableCell>{voucher.package_duration}</TableCell>
                  <TableCell>KES {voucher.package_price}</TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {voucher.claimed_by || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(voucher.code)}
                        disabled={voucher.status !== 'available'}
                      >
                        {copiedCode === voucher.code ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVoucher(voucher.id)}
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
