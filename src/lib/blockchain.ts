import { ethers } from 'ethers';

// Contract ABI (simplified for key functions)
export const ICX_REGISTRY_ABI = [
  "function mint(address to, string projectId, uint256 amount, string metadataURI, uint256 vintageYear) returns (uint256)",
  "function burn(address from, uint256 batchId, uint256 amount)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function getCreditBatch(uint256 batchId) view returns (tuple(string projectId, uint256 totalVolume, address currentOwner, uint8 status, string metadataURI, uint256 createdAt, uint256 vintageYear))",
  "function getProjectBatches(string projectId) view returns (uint256[])",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function updateBatchStatus(uint256 batchId, uint8 newStatus)",
  "event CreditBatchMinted(uint256 indexed batchId, string indexed projectId, address indexed to, uint256 amount, string metadataURI)",
  "event CreditBatchRetired(uint256 indexed batchId, address indexed from, uint256 amount)",
  "event Transfer(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

// Polygon Amoy testnet configuration
export const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  name: 'Polygon Amoy Testnet',
  currency: 'MATIC',
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  blockExplorer: 'https://amoy.polygonscan.com/',
};

// Contract address - will be set after deployment or via environment
export const ICX_REGISTRY_ADDRESS = import.meta.env.VITE_REACT_APP_ICX_REGISTRY_ADDRESS || '0x1234567890123456789012345678901234567890';

export enum CreditStatus {
  Active = 0,
  Retired = 1,
  Pending = 2,
  Suspended = 3
}

export interface CreditBatch {
  projectId: string;
  totalVolume: bigint;
  currentOwner: string;
  status: CreditStatus;
  metadataURI: string;
  createdAt: bigint;
  vintageYear: bigint;
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async connect(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false;
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(POLYGON_AMOY_CONFIG.chainId)) {
        await this.switchToPolygonAmoy();
      }
      
      // Initialize contract if address is available
      if (ICX_REGISTRY_ADDRESS && ICX_REGISTRY_ADDRESS !== '0x1234567890123456789012345678901234567890') {
        this.contract = new ethers.Contract(ICX_REGISTRY_ADDRESS, ICX_REGISTRY_ABI, this.signer);
        console.log('Smart contract initialized at:', ICX_REGISTRY_ADDRESS);
      } else {
        console.warn('Smart contract address not configured. Blockchain functions will simulate responses.');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect to blockchain:', error);
      return false;
    }
  }

  async switchToPolygonAmoy(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${POLYGON_AMOY_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${POLYGON_AMOY_CONFIG.chainId.toString(16)}`,
            chainName: POLYGON_AMOY_CONFIG.name,
            nativeCurrency: {
              name: POLYGON_AMOY_CONFIG.currency,
              symbol: POLYGON_AMOY_CONFIG.currency,
              decimals: 18,
            },
            rpcUrls: [POLYGON_AMOY_CONFIG.rpcUrl],
            blockExplorerUrls: [POLYGON_AMOY_CONFIG.blockExplorer],
          }],
        });
      }
    }
  }

  async mintCredits(
    to: string,
    projectId: string,
    amount: number,
    metadataURI: string,
    vintageYear: number
  ): Promise<string> {
    if (!this.contract) {
      console.warn('Contract not initialized, simulating mint transaction');
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 40)}${Math.random().toString(16).substr(2, 24)}`;
      console.log(`Simulated mint: ${amount} credits for project ${projectId} to ${to}`);
      return mockTxHash;
    }

    const tx = await this.contract.mint(
      to,
      projectId,
      amount,
      metadataURI,
      vintageYear
    );
    
    const receipt = await tx.wait();
    console.log(`Credits minted: ${amount} tokens for project ${projectId}`);
    return receipt.hash;
  }

  async retireCredits(from: string, batchId: number, amount: number): Promise<string> {
    if (!this.contract) {
      console.warn('Contract not initialized, simulating burn transaction');
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 40)}${Math.random().toString(16).substr(2, 24)}`;
      console.log(`Simulated burn: ${amount} credits from batch ${batchId} by ${from}`);
      return mockTxHash;
    }

    const tx = await this.contract.burn(from, batchId, amount);
    const receipt = await tx.wait();
    console.log(`Credits retired: ${amount} tokens from batch ${batchId}`);
    return receipt.hash;
  }

  async transferCredits(
    from: string,
    to: string,
    batchId: number,
    amount: number
  ): Promise<string> {
    if (!this.contract) {
      console.warn('Contract not initialized, simulating transfer transaction');
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 40)}${Math.random().toString(16).substr(2, 24)}`;
      console.log(`Simulated transfer: ${amount} credits from ${from} to ${to} (batch ${batchId})`);
      return mockTxHash;
    }

    const tx = await this.contract.safeTransferFrom(from, to, batchId, amount, '0x');
    const receipt = await tx.wait();
    console.log(`Credits transferred: ${amount} tokens from ${from} to ${to}`);
    return receipt.hash;
  }

  async getCreditBatch(batchId: number): Promise<CreditBatch> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const batch = await this.contract.getCreditBatch(batchId);
    return {
      projectId: batch[0],
      totalVolume: batch[1],
      currentOwner: batch[2],
      status: batch[3],
      metadataURI: batch[4],
      createdAt: batch[5],
      vintageYear: batch[6],
    };
  }

  async getProjectBatches(projectId: string): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const batchIds = await this.contract.getProjectBatches(projectId);
    return batchIds.map((id: bigint) => Number(id));
  }

  async getBalance(address: string, batchId: number): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const balance = await this.contract.balanceOf(address, batchId);
    return Number(balance);
  }

  getContractAddress(): string {
    return ICX_REGISTRY_ADDRESS;
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  isContractDeployed(): boolean {
    return ICX_REGISTRY_ADDRESS !== '0x1234567890123456789012345678901234567890' && ICX_REGISTRY_ADDRESS !== '';
  }
}

export const blockchainService = new BlockchainService();
