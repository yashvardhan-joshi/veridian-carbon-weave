
/**
 * Service for managing metadata URIs and linking on-chain to off-chain data
 */

export interface ProjectMetadata {
  projectId: string;
  name: string;
  description: string;
  location: string;
  type: string;
  methodology: string;
  developer: string;
  vintageYear: number;
  documents: {
    pdd: string; // URL to Project Design Document
    verificationReports: string[]; // URLs to verification reports
    additionalDocuments: string[]; // Other supporting documents
  };
  certifications: string[];
  images: string[];
  lastUpdated: string;
  version: string;
}

export interface OnChainProjectData {
  projectId: string;
  totalVolume: number;
  currentOwner: string;
  status: 'Active' | 'Retired' | 'Pending' | 'Suspended';
  metadataURI: string;
  createdAt: number;
  vintageYear: number;
}

class MetadataService {
  private baseUrl: string;

  constructor() {
    // This would typically be your asset management system URL
    this.baseUrl = process.env.REACT_APP_METADATA_BASE_URL || 'https://api.icx-registry.com/metadata';
  }

  /**
   * Generate a stable metadata URI for a project
   */
  generateMetadataURI(projectId: string): string {
    // For now using HTTP URLs, but this could be IPFS CIDs in production
    return `${this.baseUrl}/projects/${projectId}.json`;
  }

  /**
   * Create metadata JSON for off-chain storage
   */
  createMetadataJSON(projectData: ProjectMetadata): string {
    const metadata = {
      name: projectData.name,
      description: projectData.description,
      external_url: `${this.baseUrl}/projects/${projectData.projectId}`,
      attributes: [
        {
          trait_type: "Project Type",
          value: projectData.type
        },
        {
          trait_type: "Location",
          value: projectData.location
        },
        {
          trait_type: "Methodology",
          value: projectData.methodology
        },
        {
          trait_type: "Developer",
          value: projectData.developer
        },
        {
          trait_type: "Vintage Year",
          value: projectData.vintageYear,
          display_type: "number"
        }
      ],
      properties: {
        documents: projectData.documents,
        certifications: projectData.certifications,
        lastUpdated: projectData.lastUpdated,
        version: projectData.version
      }
    };

    return JSON.stringify(metadata, null, 2);
  }

  /**
   * Fetch metadata from URI
   */
  async fetchMetadata(metadataURI: string): Promise<ProjectMetadata | null> {
    try {
      const response = await fetch(metadataURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseMetadataResponse(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  /**
   * Parse metadata response to our internal format
   */
  private parseMetadataResponse(data: any): ProjectMetadata {
    const attributes = data.attributes || [];
    const properties = data.properties || {};

    return {
      projectId: this.extractProjectIdFromURL(data.external_url),
      name: data.name,
      description: data.description,
      location: this.getAttributeValue(attributes, 'Location'),
      type: this.getAttributeValue(attributes, 'Project Type'),
      methodology: this.getAttributeValue(attributes, 'Methodology'),
      developer: this.getAttributeValue(attributes, 'Developer'),
      vintageYear: parseInt(this.getAttributeValue(attributes, 'Vintage Year')),
      documents: properties.documents || { pdd: '', verificationReports: [], additionalDocuments: [] },
      certifications: properties.certifications || [],
      images: properties.images || [],
      lastUpdated: properties.lastUpdated || new Date().toISOString(),
      version: properties.version || '1.0'
    };
  }

  private getAttributeValue(attributes: any[], traitType: string): string {
    const attr = attributes.find(a => a.trait_type === traitType);
    return attr ? attr.value.toString() : '';
  }

  private extractProjectIdFromURL(url: string): string {
    const matches = url.match(/projects\/([^\/]+)/);
    return matches ? matches[1] : '';
  }

  /**
   * Validate metadata URI accessibility
   */
  async validateMetadataURI(uri: string): Promise<boolean> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const metadataService = new MetadataService();
