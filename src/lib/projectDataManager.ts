
import { supabase } from '@/integrations/supabase/client';
import { blockchainService } from './blockchain';
import { metadataService, ProjectMetadata, OnChainProjectData } from './metadataService';

/**
 * Manages the integration between on-chain and off-chain project data
 */
export class ProjectDataManager {
  /**
   * Register a new project with both on-chain and off-chain components
   */
  async registerProject(
    projectData: ProjectMetadata,
    ownerAddress: string,
    creditAmount: number
  ): Promise<{ txHash: string; batchId: number } | null> {
    try {
      console.log('Starting project registration process...');

      // 1. Store metadata off-chain first
      const metadataURI = await this.storeProjectMetadata(projectData);
      if (!metadataURI) {
        throw new Error('Failed to store project metadata');
      }

      // 2. Mint credits on-chain with metadata URI
      const txHash = await blockchainService.mintCredits(
        ownerAddress,
        projectData.projectId,
        creditAmount,
        metadataURI,
        projectData.vintageYear
      );

      // 3. Update our local database with the transaction info
      await this.updateLocalProject(projectData.projectId, {
        blockchain_tx_hash: txHash,
        metadata_uri: metadataURI,
        status: 'verified'
      });

      console.log('Project registered successfully:', { txHash, projectId: projectData.projectId });
      
      // Extract batch ID from transaction (this would need to be implemented based on contract events)
      const batchId = await this.getBatchIdFromTransaction(txHash);

      return { txHash, batchId };
    } catch (error) {
      console.error('Error registering project:', error);
      return null;
    }
  }

  /**
   * Store project metadata in our asset management system
   */
  private async storeProjectMetadata(projectData: ProjectMetadata): Promise<string | null> {
    try {
      // Generate the metadata JSON
      const metadataJSON = metadataService.createMetadataJSON(projectData);
      const metadataURI = metadataService.generateMetadataURI(projectData.projectId);

      // In a real implementation, you would upload this to your asset management system
      // For now, we'll simulate this by storing in our database
      const { error } = await supabase
        .from('carbon_projects')
        .update({
          metadata: JSON.parse(metadataJSON),
          metadata_uri: metadataURI
        })
        .eq('registry_id', projectData.projectId);

      if (error) {
        console.error('Error storing metadata:', error);
        return null;
      }

      return metadataURI;
    } catch (error) {
      console.error('Error in storeProjectMetadata:', error);
      return null;
    }
  }

  /**
   * Sync on-chain data with our local database
   */
  async syncProjectData(projectId: string): Promise<boolean> {
    try {
      console.log('Syncing project data for:', projectId);

      // Get batch IDs for this project from blockchain
      const batchIds = await blockchainService.getProjectBatches(projectId);
      
      if (batchIds.length === 0) {
        console.log('No batches found on-chain for project:', projectId);
        return false;
      }

      // Get the latest batch data
      const latestBatchId = Math.max(...batchIds);
      const onChainData = await blockchainService.getCreditBatch(latestBatchId);

      // Fetch metadata from the URI
      const metadata = await metadataService.fetchMetadata(onChainData.metadataURI);

      // Update local database
      const { error } = await supabase
        .from('carbon_projects')
        .update({
          credits_issued: Number(onChainData.totalVolume),
          status: this.mapBlockchainStatus(onChainData.status),
          metadata: metadata,
          metadata_uri: onChainData.metadataURI,
          last_synced: new Date().toISOString()
        })
        .eq('registry_id', projectId);

      if (error) {
        console.error('Error updating local project data:', error);
        return false;
      }

      console.log('Project data synced successfully:', projectId);
      return true;
    } catch (error) {
      console.error('Error syncing project data:', error);
      return false;
    }
  }

  /**
   * Get combined on-chain and off-chain project data
   */
  async getProjectData(projectId: string): Promise<{
    onChain: OnChainProjectData | null;
    offChain: ProjectMetadata | null;
    local: any | null;
  }> {
    try {
      // Get local database record
      const { data: localData, error: localError } = await supabase
        .from('carbon_projects')
        .select('*')
        .eq('registry_id', projectId)
        .maybeSingle();

      if (localError) {
        console.error('Error fetching local data:', localError);
      }

      // Get on-chain data if we have batch information
      let onChainData: OnChainProjectData | null = null;
      if (blockchainService.isConnected()) {
        try {
          const batchIds = await blockchainService.getProjectBatches(projectId);
          if (batchIds.length > 0) {
            const latestBatch = await blockchainService.getCreditBatch(Math.max(...batchIds));
            onChainData = {
              projectId: latestBatch.projectId,
              totalVolume: Number(latestBatch.totalVolume),
              currentOwner: latestBatch.currentOwner,
              status: this.mapBlockchainStatus(latestBatch.status),
              metadataURI: latestBatch.metadataURI,
              createdAt: Number(latestBatch.createdAt),
              vintageYear: Number(latestBatch.vintageYear)
            };
          }
        } catch (error) {
          console.error('Error fetching on-chain data:', error);
        }
      }

      // Get off-chain metadata
      let offChainData: ProjectMetadata | null = null;
      if (localData?.metadata_uri) {
        offChainData = await metadataService.fetchMetadata(localData.metadata_uri);
      }

      return {
        onChain: onChainData,
        offChain: offChainData,
        local: localData
      };
    } catch (error) {
      console.error('Error getting project data:', error);
      return { onChain: null, offChain: null, local: null };
    }
  }

  private async updateLocalProject(projectId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('carbon_projects')
      .update(updates)
      .eq('registry_id', projectId);

    if (error) {
      throw new Error(`Failed to update local project: ${error.message}`);
    }
  }

  private async getBatchIdFromTransaction(txHash: string): Promise<number> {
    // This would typically parse the transaction receipt for the batch ID
    // For now, return a placeholder
    return Math.floor(Math.random() * 1000000);
  }

  private mapBlockchainStatus(status: number): string {
    switch (status) {
      case 0: return 'verified'; // Active
      case 1: return 'retired';
      case 2: return 'pending';
      case 3: return 'suspended';
      default: return 'pending';
    }
  }
}

export const projectDataManager = new ProjectDataManager();
