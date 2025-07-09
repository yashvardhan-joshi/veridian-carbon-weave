
import { blockchainService } from './blockchain';
import { supabase } from '@/integrations/supabase/client';

export interface RetirementRequest {
  projectId: string;
  batchId: number;
  quantity: number;
  userAddress: string;
  userId: string;
  reason?: string;
}

export interface RetirementResult {
  success: boolean;
  transactionHash?: string;
  certificateId?: string;
  error?: string;
}

export interface RetirementCertificate {
  id: string;
  projectId: string;
  projectName: string;
  quantity: number;
  retiredBy: string;
  retirementDate: string;
  transactionHash: string;
  certificateNumber: string;
  reason?: string;
}

class RetirementService {
  async retireCredits(request: RetirementRequest): Promise<RetirementResult> {
    try {
      // Verify user owns the credits
      const balance = await blockchainService.getBalance(request.userAddress, request.batchId);
      if (balance < request.quantity) {
        throw new Error('Insufficient credits to retire');
      }

      // Get project details for certificate
      const { data: project, error: projectError } = await supabase
        .from('carbon_projects')
        .select('*')
        .eq('registry_id', request.projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      // Execute blockchain burn
      const transactionHash = await blockchainService.retireCredits(
        request.userAddress,
        request.batchId,
        request.quantity
      );

      // Create retirement transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          project_id: request.projectId,
          buyer_id: request.userId,
          quantity: request.quantity,
          price_per_credit: 0,
          transaction_type: 'retirement',
          status: 'completed',
          blockchain_tx_hash: transactionHash,
          completed_at: new Date().toISOString(),
          metadata: {
            batch_id: request.batchId,
            user_address: request.userAddress,
            retirement_reason: request.reason || 'Carbon offset'
          }
        })
        .select()
        .single();

      if (transactionError || !transaction) {
        console.error('Failed to create retirement record:', transactionError);
      }

      // Generate retirement certificate
      const certificate = await this.generateRetirementCertificate({
        projectId: request.projectId,
        projectName: project.name,
        quantity: request.quantity,
        retiredBy: request.userAddress,
        retirementDate: new Date().toISOString(),
        transactionHash,
        reason: request.reason
      });

      // Update project retired credits count
      const { error: updateError } = await supabase
        .from('carbon_projects')
        .update({
          credits_retired: project.credits_retired + request.quantity,
          last_synced: new Date().toISOString()
        })
        .eq('registry_id', request.projectId);

      if (updateError) {
        console.error('Failed to update project retirement count:', updateError);
      }

      console.log(`Credits retired successfully: ${request.quantity} credits from project ${request.projectId}`);
      console.log(`Transaction hash: ${transactionHash}`);
      console.log(`Certificate ID: ${certificate.id}`);

      return {
        success: true,
        transactionHash,
        certificateId: certificate.id
      };

    } catch (error: any) {
      console.error('Credit retirement failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to retire credits'
      };
    }
  }

  private async generateRetirementCertificate(data: Omit<RetirementCertificate, 'id' | 'certificateNumber'>): Promise<RetirementCertificate> {
    const certificateId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const certificateNumber = `ICX-RET-${new Date().getFullYear()}-${certificateId.split('-')[1]}`;

    const certificate: RetirementCertificate = {
      id: certificateId,
      certificateNumber,
      ...data
    };

    // Store certificate data in metadata
    try {
      await supabase
        .from('carbon_projects')
        .update({
          metadata: {
            retirement_certificates: [certificate]
          }
        })
        .eq('registry_id', data.projectId);
    } catch (error) {
      console.error('Failed to store certificate metadata:', error);
    }

    return certificate;
  }

  async getRetirementHistory(userId: string) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('buyer_id', userId)
      .eq('transaction_type', 'retirement')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch retirement history:', error);
      return [];
    }

    return data;
  }

  async getRetirementCertificate(certificateId: string): Promise<RetirementCertificate | null> {
    // In a real implementation, this would query a dedicated certificates table
    // For now, we'll extract from project metadata
    try {
      const { data: projects, error } = await supabase
        .from('carbon_projects')
        .select('metadata')
        .not('metadata', 'is', null);

      if (error) {
        console.error('Failed to search for certificate:', error);
        return null;
      }

      for (const project of projects) {
        const metadata = project.metadata as any;
        if (metadata?.retirement_certificates) {
          const certificate = metadata.retirement_certificates.find(
            (cert: any) => cert.id === certificateId
          );
          if (certificate) {
            return certificate;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving certificate:', error);
      return null;
    }
  }
}

export const retirementService = new RetirementService();
