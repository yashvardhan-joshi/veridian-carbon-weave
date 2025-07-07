import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Recycle, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'purchase' ? (
      <CreditCard className="w-4 h-4" />
    ) : (
      <Recycle className="w-4 h-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-pending text-pending-foreground">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please sign in to view your transaction history.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your credit purchases and retirements will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {transaction.transaction_type === 'purchase' ? 'Purchase' : 'Retirement'}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.metadata?.project_name || transaction.project_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">
                    {Number(transaction.quantity).toLocaleString()} tCO₂e
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(transaction.total_amount).toFixed(2)}
                  </p>
                  {transaction.blockchain_tx_hash && (
                    <Button variant="ghost" size="sm" className="mt-1 h-6 px-2">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Blockchain
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};