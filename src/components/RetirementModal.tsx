
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Recycle, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { retirementService } from '@/lib/retirementService';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface RetirementModalProps {
  project: {
    id: string;
    name: string;
    credits: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onRetirementComplete?: () => void;
}

export const RetirementModal = ({
  project,
  isOpen,
  onClose,
  onRetirementComplete
}: RetirementModalProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRetirement = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to retire credits.",
        variant: "destructive"
      });
      return;
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const retirementResult = await retirementService.retireCredits({
        projectId: project.id,
        batchId: 1, // This would need to be determined from available batches
        quantity,
        userAddress,
        userId: user.id,
        reason: reason || 'Carbon offset'
      });

      setResult(retirementResult);

      if (retirementResult.success) {
        toast({
          title: "Credits Retired Successfully",
          description: `${quantity.toLocaleString()} credits have been permanently retired.`,
        });
        onRetirementComplete?.();
      } else {
        toast({
          title: "Retirement Failed",
          description: retirementResult.error || "Failed to retire credits.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Retirement error:', error);
      toast({
        title: "Retirement Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantity(1);
    setReason('');
    setUserAddress('');
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const downloadCertificate = async () => {
    if (result?.certificateId) {
      const certificate = await retirementService.getRetirementCertificate(result.certificateId);
      if (certificate) {
        // Create and download certificate
        const certificateData = {
          ...certificate,
          downloadedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(certificateData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retirement-certificate-${certificate.certificateNumber}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Recycle className="w-5 h-5 mr-2" />
            Retire Carbon Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{project.name}</h4>
            <p className="text-sm text-muted-foreground">
              Available Credits: {project.credits.toLocaleString()} tCO₂e
            </p>
          </div>

          {!result && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity to Retire (tCO₂e)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={project.credits}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label htmlFor="userAddress">Your Wallet Address</Label>
                <Input
                  id="userAddress"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="0x..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The wallet address that owns the credits
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Retirement Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Corporate carbon neutrality, Event offset, etc."
                  rows={3}
                />
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <Recycle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Permanent Retirement</p>
                    <p className="text-green-700">
                      Retiring credits removes them permanently from circulation. 
                      You will receive a blockchain-verified retirement certificate.
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
                    <h4 className="font-medium text-green-800">Credits Retired Successfully</h4>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Quantity: {quantity.toLocaleString()} tCO₂e</p>
                    <p>Project: {project.name}</p>
                    {result.transactionHash && (
                      <p className="font-mono break-all">TX: {result.transactionHash}</p>
                    )}
                    {result.certificateId && (
                      <p>Certificate ID: {result.certificateId}</p>
                    )}
                  </div>
                  
                  {result.certificateId && (
                    <Button
                      onClick={downloadCertificate}
                      variant="outline"
                      className="mt-3 w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Retirement Certificate
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    <h4 className="font-medium text-red-800">Retirement Failed</h4>
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
                onClick={handleRetirement}
                disabled={loading || !user}
                className="flex-1 bg-gradient-eco"
              >
                {loading ? "Retiring..." : "Retire Credits"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
