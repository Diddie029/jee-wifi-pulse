import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Ticket, Plus, Copy, Trash2, Check, Printer, Download, FileText } from "lucide-react";
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
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
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

  const handleSelectVoucher = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVouchers([...selectedVouchers, id]);
    } else {
      setSelectedVouchers(selectedVouchers.filter(v => v !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVouchers(vouchers.filter(v => v.status === 'available').map(v => v.id));
    } else {
      setSelectedVouchers([]);
    }
  };

  const getSelectedVouchers = () => {
    return vouchers.filter(v => selectedVouchers.includes(v.id));
  };

  const exportToCSV = () => {
    const vouchersToExport = selectedVouchers.length > 0 ? getSelectedVouchers() : vouchers.filter(v => v.status === 'available');
    
    if (vouchersToExport.length === 0) {
      toast({
        title: "No vouchers",
        description: "No available vouchers to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Code', 'Package', 'Price (KES)', 'Status', 'Created At'];
    const rows = vouchersToExport.map(v => [
      v.code,
      v.package_duration,
      v.package_price.toString(),
      v.status,
      new Date(v.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `Exported ${vouchersToExport.length} voucher(s) to CSV.`,
    });
  };

  const printVoucherCards = () => {
    const vouchersToPrint = selectedVouchers.length > 0 ? getSelectedVouchers() : vouchers.filter(v => v.status === 'available');
    
    if (vouchersToPrint.length === 0) {
      toast({
        title: "No vouchers",
        description: "No available vouchers to print.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow popups to print voucher cards.",
        variant: "destructive",
      });
      return;
    }

    const cardsHtml = vouchersToPrint.map(v => `
      <div class="card">
        <div class="logo">JEE WiFi</div>
        <div class="code">${v.code}</div>
        <div class="details">
          <div class="package">${v.package_duration}</div>
          <div class="price">KES ${v.package_price}</div>
        </div>
        <div class="instructions">Enter code at hotspot login</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>JEE WiFi Voucher Cards</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .card {
              border: 2px solid #00ff88;
              border-radius: 12px;
              padding: 20px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: white;
              text-align: center;
              page-break-inside: avoid;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              color: #00ff88;
              margin-bottom: 12px;
            }
            .code {
              font-size: 20px;
              font-weight: bold;
              font-family: monospace;
              color: #00ff88;
              background: rgba(0,255,136,0.1);
              padding: 10px;
              border-radius: 8px;
              margin-bottom: 12px;
              letter-spacing: 2px;
            }
            .details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .package { font-size: 14px; }
            .price { 
              font-size: 16px; 
              font-weight: bold;
              color: #00ff88;
            }
            .instructions {
              font-size: 11px;
              color: #888;
              margin-top: 8px;
            }
            @media print {
              body { padding: 0; background: white; }
              .card { 
                border-color: #333;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="grid">${cardsHtml}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();

    toast({
      title: "Printing",
      description: `Printing ${vouchersToPrint.length} voucher card(s).`,
    });
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
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Ticket className="h-5 w-5" />
          Voucher Management
          {selectedVouchers.length > 0 && (
            <Badge variant="secondary">{selectedVouchers.length} selected</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={printVoucherCards}>
            <Printer className="mr-2 h-4 w-4" />
            Print Cards
          </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No vouchers generated yet. Click "Generate Vouchers" to create some.
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                id="selectAll"
                checked={selectedVouchers.length === vouchers.filter(v => v.status === 'available').length && vouchers.filter(v => v.status === 'available').length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="selectAll" className="text-sm text-muted-foreground">
                Select all available vouchers
              </Label>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={selectedVouchers.includes(voucher.id)}
                        onCheckedChange={(checked) => handleSelectVoucher(voucher.id, checked as boolean)}
                        disabled={voucher.status !== 'available'}
                      />
                    </TableCell>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}