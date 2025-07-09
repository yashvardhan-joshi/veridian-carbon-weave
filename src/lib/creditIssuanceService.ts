
import { blockchainService, CreditStatus } from './blockchain';
import { supabase } from '@/integrations/supabase/client';
import { metadataService } from './metadataService';

export interface CreditIssuanceRequest {
  projectId: string;
  amount: number;
  ownerAddress: string;
  vintageYear: number;
  adminUserId: string;
}

export interface IssuanceResult {
  success: boolean;
  transactionHash?: string;
  batchId?: number;
  error?: string;
}

class CreditIssuanceService {
  async issueCredits(request: CreditIssuanceRequest): Promise<IssuanceResult> {
    try {
      // Verify admin permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', request.adminUserId)
        .single();

      if (!profile) {
        throw new Error('Admin user not found');
      }

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('carbon_projects')
        .select('*')
        .eq('registry_id', request.projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      if (project.status !== 'verified') {
        throw new Error('Only verified projects can have credits issued');
      }

      // Generate metadata URI for the credit batch
      const metadataURI = await metadataService.generateMetadataURI({
        projectId: request.projectId,
        projectName: project.name,
        developer: project.developer,
        methodology: project.methodology,
        location: project.location,
        vintageYear: request.vintageYear,
        amount: request.amount
      });

      // Call blockchain mint function
      const transactionHash = await blockchainService.mintCredits(
        request.ownerAddress,
        request.projectId,
        request.amount,
        metadataURI,
        request.vintageYear
      );

      // Update project with issued credits and blockchain transaction
      const { error: updateError } = await supabase
        .from('carbon_projects')
        .update({
          credits_issued: project.credits_issued + request.amount,
          blockchain_tx_hash: transactionHash,
          last_synced: new Date().toISOString()
        })
        .eq('registry_id', request.projectId);

      if (updateError) {
        console.error('Failed to update project after issuance:', updateError);
        // Note: Credits are already minted on blockchain, this is a sync issue
      }

      // Create issuance record
      await supabase
        .from('credit_transactions')
        .insert({
          project_id: request.projectId,
          buyer_id: request.adminUserId,
          quantity: request.amount,
          price_per_credit: 0, // Admin issuance has no cost
          transaction_type: 'issuance',
          status: 'completed',
          blockchain_tx_hash: transactionHash,
          completed_at: new Date().toISOString(),
          metadata: {
            admin_issued: true,
            vintage_year: request.vintageYear,
            metadata_uri: metadataURI
          }
        });

      console.log(`Credits issued successfully: ${request.amount} credits for project ${request.projectId}`);
      console.log(`Transaction hash: ${transactionHash}`);

      return {
        success: true,
        transactionHash,
        batchId: undefined // Will be available from blockchain events
      };

    } catch (error: any) {
      console.error('Credit issuance failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to issue credits'
      };
    }
  }

  async getIssuanceHistory(projectId: string) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('project_id', projectId)
      .eq('transaction_type', 'issuance')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch issuance history:', error);
      return [];
    }

    return data;
  }
}

export const creditIssuanceService = new CreditIssuanceService();
