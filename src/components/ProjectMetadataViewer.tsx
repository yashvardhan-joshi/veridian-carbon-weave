
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, FileText, Download, RefreshCw } from 'lucide-react';
import { projectDataManager } from '@/lib/projectDataManager';
import { useToast } from '@/hooks/use-toast';

interface ProjectMetadataViewerProps {
  projectId: string;
}

export const ProjectMetadataViewer = ({ projectId }: ProjectMetadataViewerProps) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const data = await projectDataManager.getProjectData(projectId);
      setProjectData(data);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const success = await projectDataManager.syncProjectData(projectId);
      if (success) {
        toast({
          title: "Sync Complete",
          description: "Project data synchronized with blockchain"
        });
        await fetchProjectData();
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize with blockchain",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No project data found</p>
        </CardContent>
      </Card>
    );
  }

  const { onChain, offChain, local } = projectData;

  return (
    <div className="space-y-6">
      {/* Data Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Integration Status</CardTitle>
            <Button onClick={handleSync} disabled={syncing} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync with Blockchain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={local ? "default" : "destructive"} className="mb-2">
                {local ? "Available" : "Missing"}
              </Badge>
              <p className="font-medium">Off-Chain Database</p>
              <p className="text-sm text-muted-foreground">Local registry data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={onChain ? "default" : "secondary"} className="mb-2">
                {onChain ? "Deployed" : "Not Deployed"}
              </Badge>
              <p className="font-medium">On-Chain Registry</p>
              <p className="text-sm text-muted-foreground">Blockchain verification</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant={offChain ? "default" : "secondary"} className="mb-2">
                {offChain ? "Linked" : "Not Linked"}
              </Badge>
              <p className="font-medium">Metadata System</p>
              <p className="text-sm text-muted-foreground">Document storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* On-Chain Data */}
      {onChain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Blockchain Registry Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="font-semibold">{onChain.totalVolume.toLocaleString()} tCO₂e</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Owner</p>
                <p className="font-mono text-sm">{onChain.currentOwner.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={onChain.status === 'Active' ? 'default' : 'secondary'}>
                  {onChain.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vintage Year</p>
                <p className="font-semibold">{onChain.vintageYear}</p>
              </div>
            </div>
            {onChain.metadataURI && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Metadata URI</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground truncate mr-2">
                    {onChain.metadataURI}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={onChain.metadataURI} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Off-Chain Metadata */}
      {offChain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Project Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Project Documents</h4>
                <div className="space-y-2">
                  {offChain.documents.pdd && (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Project Design Document (PDD)</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={offChain.documents.pdd} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  )}
                  {offChain.documents.verificationReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Verification Report {index + 1}</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={report} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {offChain.certifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {offChain.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="text-xs text-muted-foreground">
                <p>Last Updated: {new Date(offChain.lastUpdated).toLocaleString()}</p>
                <p>Metadata Version: {offChain.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Database Info */}
      {local && (
        <Card>
          <CardHeader>
            <CardTitle>Registry Database Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Registry ID</p>
                <p className="font-medium">{local.registry_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Developer</p>
                <p className="font-medium">{local.developer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Methodology</p>
                <p className="font-medium">{local.methodology}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Credits Issued</p>
                <p className="font-medium">{local.credits_issued.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Credits Retired</p>
                <p className="font-medium">{local.credits_retired.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Synced</p>
                <p className="font-medium">
                  {local.last_synced ? new Date(local.last_synced).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
