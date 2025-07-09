import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Link, Coins, ShieldCheck } from 'lucide-react';
import { blockchainService, POLYGON_AMOY_CONFIG, CreditStatus } from '@/lib/blockchain';
import { useToast } from '@/hooks/use-toast';

export const BlockchainIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (blockchainService.isConnected()) {
      setIsConnected(true);
      // Get wallet address and network info
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          if (provider) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            
            setWalletAddress(address);
            setNetworkInfo(network);
          }
        }
      } catch (error) {
        console.error('Error getting wallet info:', error);
      }
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const connected = await blockchainService.connect();
      if (connected) {
        setIsConnected(true);
        await checkConnection();
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to Polygon Amoy testnet",
        });
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkBadge = () => {
    if (!networkInfo) return null;
    
    const isCorrectNetwork = networkInfo.chainId === BigInt(POLYGON_AMOY_CONFIG.chainId);
    return (
      <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
        {isCorrectNetwork ? "Polygon Amoy" : "Wrong Network"}
      </Badge>
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="w-5 h-5 mr-2" />
          Blockchain Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-4">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Connect your wallet to interact with the blockchain registry
            </p>
            <Button onClick={connectWallet} disabled={loading}>
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium">Wallet Connected</p>
                  <p className="text-sm text-muted-foreground">
                    {formatAddress(walletAddress)}
                  </p>
                </div>
              </div>
              {getNetworkBadge()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-4 h-4" />
                  <span className="font-medium">Contract Address</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {blockchainService.getContractAddress() || 'Not deployed yet'}
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Link className="w-4 h-4" />
                  <span className="font-medium">Network</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {POLYGON_AMOY_CONFIG.name}
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Blockchain Features Available:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Mint carbon credit tokens (ERC-1155)</li>
                <li>• Transfer credits between wallets</li>
                <li>• Retire credits permanently on-chain</li>
                <li>• Track credit batch history and metadata</li>
                <li>• Verify credit authenticity</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
