
import { blockchainService } from './blockchain';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplacePurchase {
  projectId: string;
  buyerAddress: string;
  sellerAddress: string;
  quantity: number;
  pricePerCredit: number;
  batchId: number;
  buyerUserId: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  transactionId?: string;
}

class MarketplaceService {
  async executePurchase(purchase: MarketplacePurchase): Promise<PurchaseResult> {
    try {
      // Create pending transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          project_id: purchase.projectId,
          buyer_id: purchase.buyerUserId,
          quantity: purchase.quantity,
          price_per_credit: purchase.pricePerCredit,
          total_amount: purchase.quantity * purchase.pricePerCredit,
          transaction_type: 'purchase',
          status: 'pending',
          metadata: {
            batch_id: purchase.batchId,
            buyer_address: purchase.buyerAddress,
            seller_address: purchase.sellerAddress
          }
        })
        .select()
        .single();

      if (transactionError || !transaction) {
        throw new Error('Failed to create transaction record');
      }

      // Execute blockchain transfer
      const transactionHash = await blockchainService.transferCredits(
        purchase.sellerAddress,
        purchase.buyerAddress,
        purchase.batchId,
        purchase.quantity
      );

      // Update transaction with blockchain hash
      const { error: updateError } = await supabase
        .from('credit_transactions')
        .update({
          blockchain_tx_hash: transactionHash,
          status: 'processing'
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Failed to update transaction with hash:', updateError);
      }

      // Start monitoring for confirmation
      this.monitorTransactionConfirmation(transaction.id, transactionHash);

      console.log(`Purchase initiated: ${purchase.quantity} credits from project ${purchase.projectId}`);
      console.log(`Transaction hash: ${transactionHash}`);

      return {
        success: true,
        transactionHash,
        transactionId: transaction.id
      };

    } catch (error: any) {
      console.error('Purchase execution failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute purchase'
      };
    }
  }

  private async monitorTransactionConfirmation(transactionId: string, txHash: string) {
    // Simulate blockchain confirmation monitoring
    // In production, this would use actual blockchain event monitoring
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('credit_transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (error) {
          console.error('Failed to mark transaction as completed:', error);
        } else {
          console.log(`Transaction ${transactionId} marked as completed`);
        }
      } catch (error) {
        console.error('Error confirming transaction:', error);
      }
    }, 10000); // 10 second delay to simulate blockchain confirmation
  }

  async getTransactionStatus(transactionId: string) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }

    return data;
  }

  async getPurchaseHistory(userId: string) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('buyer_id', userId)
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch purchase history:', error);
      return [];
    }

    return data;
  }
}

export const marketplaceService = new MarketplaceService();
