
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Recycle, ArrowRightLeft } from 'lucide-react';
import { marketplaceService } from '@/lib/marketplaceService';
import { retirementService } from '@/lib/retirementService';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface TransactionManagerProps {
  project: {
    id: string;
    name: string;
    credits: number;
    price: number;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onTransactionComplete?: () => void;
}

export const TransactionManager = ({
  project,
  isOpen,
  onClose,
  onTransactionComplete
}: TransactionManagerProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionType, setTransactionType] = useState<'purchase' | 'retirement'>('purchase');
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalAmount = quantity * project.price;

  const handleTransaction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete transactions.",
        variant: "destructive"
      });
      return;
    }

    if (!buyerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address.",
        variant: "destructive"
      });
      return;
    }

    if (quantity > project.credits) {
      toast({
        title: "Insufficient Credits",
        description: "Not enough credits available for this transaction.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (transactionType === 'purchase') {
        const purchaseResult = await marketplaceService.executePurchase({
          projectId: project.id,
          buyerAddress,
          sellerAddress: '0x1234567890123456789012345678901234567890', // Mock seller address
          quantity,
          pricePerCredit: project.price,
          batchId: 1, // This would be determined dynamically
          buyerUserId: user.id
        });

        if (purchaseResult.success) {
          toast({
            title: "Purchase Initiated",
            description: `Purchase of ${quantity} credits submitted to blockchain.`,
          });
        } else {
          throw new Error(purchaseResult.error || 'Purchase failed');
        }
      } else {
        const retirementResult = await retirementService.retireCredits({
          projectId: project.id,
          batchId: 1, // This would be determined dynamically
          quantity,
          userAddress: buyerAddress,
          userId: user.id,
          reason: 'Marketplace retirement'
        });

        if (retirementResult.success) {
          toast({
            title: "Credits Retired",
            description: `${quantity} credits have been permanently retired.`,
          });
        } else {
          throw new Error(retirementResult.error || 'Retirement failed');
        }
      }

      onTransactionComplete?.();
      onClose();
      resetForm();

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantity(1);
    setTransactionType('purchase');
    setBuyerAddress('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {transactionType === 'purchase' ? (
              <CreditCard className="w-5 h-5 mr-2" />
            ) : (
              <Recycle className="w-5 h-5 mr-2" />
            )}
            {transactionType === 'purchase' ? 'Purchase' : 'Retire'} Carbon Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Available Credits</p>
                  <p className="font-semibold">{project.credits.toLocaleString()} tCO₂e</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price per Credit</p>
                  <p className="font-semibold">${project.price.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={transactionType} onValueChange={(value: 'purchase' | 'retirement') => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase Credits
                    </div>
                  </SelectItem>
                  <SelectItem value="retirement">
                    <div className="flex items-center">
                      <Recycle className="w-4 h-4 mr-2" />
                      Retire Credits (Offset)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity (tCO₂e)</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={project.credits}
                placeholder="Enter quantity"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {project.credits.toLocaleString()} credits available
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                {transactionType === 'purchase' ? 'Your Wallet Address' : 'Wallet Address (Credit Owner)'}
              </label>
              <Input
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="0x..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {transactionType === 'purchase' 
                  ? 'Address that will receive the credits' 
                  : 'Address that currently owns the credits to retire'
                }
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Quantity:</span>
                  <span className="font-medium">{quantity.toLocaleString()} tCO₂e</span>
                </div>
                {transactionType === 'purchase' && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Price per credit:</span>
                      <span className="font-medium">${project.price.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleTransaction}
              disabled={loading || project.status !== 'verified' || !user || !buyerAddress}
              className="flex-1 bg-gradient-eco"
            >
              {loading ? "Processing..." : `${transactionType === 'purchase' ? 'Purchase' : 'Retire'} Credits`}
            </Button>
          </div>

          {transactionType === 'retirement' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Recycle className="w-4 h-4 mr-2 text-green-600" />
                <p className="text-sm text-green-800">
                  Retiring credits permanently removes them from circulation and provides blockchain-verified proof of carbon offset.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
