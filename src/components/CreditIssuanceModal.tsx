
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { creditIssuanceService } from '@/lib/creditIssuanceService';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface CreditIssuanceModalProps {
  project: {
    id: string;
    name: string;
    developer: string;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onIssuanceComplete?: () => void;
}

export const CreditIssuanceModal = ({
  project,
  isOpen,
  onClose,
  onIssuanceComplete
}: CreditIssuanceModalProps) => {
  const [amount, setAmount] = useState<number>(1000);
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [vintageYear, setVintageYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleIssuance = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to issue credits.",
        variant: "destructive"
      });
      return;
    }

    if (!ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const issuanceResult = await creditIssuanceService.issueCredits({
        projectId: project.id,
        amount,
        ownerAddress,
        vintageYear,
        adminUserId: user.id
      });

      setResult(issuanceResult);

      if (issuanceResult.success) {
        toast({
          title: "Credits Issued Successfully",
          description: `${amount.toLocaleString()} credits have been minted on the blockchain.`,
        });
        onIssuanceComplete?.();
      } else {
        toast({
          title: "Issuance Failed",
          description: issuanceResult.error || "Failed to issue credits.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Issuance error:', error);
      toast({
        title: "Issuance Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount(1000);
    setOwnerAddress('');
    setVintageYear(new Date().getFullYear());
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            Issue Carbon Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{project.name}</h4>
            <p className="text-sm text-muted-foreground">Developer: {project.developer}</p>
            <p className="text-sm text-muted-foreground">Status: {project.status}</p>
          </div>

          {!result && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Credit Amount (tCO₂e)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="Enter credit amount"
                />
              </div>

              <div>
                <Label htmlFor="ownerAddress">Owner Wallet Address</Label>
                <Input
                  id="ownerAddress"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="0x..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The wallet address that will receive the credits
                </p>
              </div>

              <div>
                <Label htmlFor="vintageYear">Vintage Year</Label>
                <Input
                  id="vintageYear"
                  type="number"
                  value={vintageYear}
                  onChange={(e) => setVintageYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Admin Action Required</p>
                    <p className="text-yellow-700">
                      This will mint {amount.toLocaleString()} credits on the blockchain. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <h4 className="font-medium text-green-800">Credits Issued Successfully</h4>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Amount: {amount.toLocaleString()} tCO₂e</p>
                    <p>Owner: {ownerAddress}</p>
                    <p>Vintage: {vintageYear}</p>
                    {result.transactionHash && (
                      <p className="font-mono break-all">TX: {result.transactionHash}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    <h4 className="font-medium text-red-800">Issuance Failed</h4>
                  </div>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button
                onClick={handleIssuance}
                disabled={loading || project.status !== 'verified' || !user}
                className="flex-1 bg-gradient-eco"
              >
                {loading ? "Issuing..." : "Issue Credits"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
