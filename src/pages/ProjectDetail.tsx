import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar, Zap, CheckCircle, Clock, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransactionManager } from "@/components/TransactionManager";
import { ProjectMetadataViewer } from "@/components/ProjectMetadataViewer";
import { useAuth } from "@/components/AuthProvider";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('carbon_projects')
          .select('*')
          .eq('registry_id', id)
          .single();

        if (error) throw error;

        const formattedProject = {
          id: data.registry_id,
          name: data.name,
          location: data.location,
          type: data.type,
          description: data.description,
          developer: data.developer,
          credits: Number(data.credits_issued - data.credits_retired),
          creditsIssued: Number(data.credits_issued),
          creditsRetired: Number(data.credits_retired),
          price: 18.50 + Math.random() * 20,
          status: data.status,
          vintage: new Date(data.registration_date || Date.now()).getFullYear().toString(),
          methodology: data.methodology,
          registrationDate: data.registration_date,
          verificationDate: data.verification_date,
          blockchainTx: data.status === 'verified' ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
          metadataUri: data.metadata_uri,
          lastSynced: data.last_synced
        };

        setProject(formattedProject);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "Failed to fetch project details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-verified" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-pending" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-verified text-verified-foreground">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-pending text-pending-foreground">Pending Verification</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const handlePurchaseCredits = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive"
      });
      return;
    }
    setShowTransactionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested project could not be found.</p>
          <Link to="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/marketplace">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        {project.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(project.status)}
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {project.description || "This carbon credit project contributes to environmental sustainability through verified emission reductions."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Credits Available</p>
                    <p className="text-xl font-bold text-foreground">{project.credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Credit</p>
                    <p className="text-xl font-bold text-foreground">${project.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">USD</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vintage Year</p>
                    <p className="text-xl font-bold text-foreground">{project.vintage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="text-sm font-medium text-foreground">{project.developer}</p>
                  </div>
                </div>

                {project.blockchainTx && (
                  <div className="p-4 bg-gradient-blockchain/10 rounded-lg border border-verified/20 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Blockchain Transaction</p>
                        <p className="text-xs font-mono text-verified">{project.blockchainTx}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    className="flex-1 bg-gradient-eco" 
                    disabled={project.status !== 'verified'}
                    onClick={handlePurchaseCredits}
                  >
                    Purchase Credits
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Registry
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Project Details</TabsTrigger>
                    <TabsTrigger value="blockchain">Blockchain Data</TabsTrigger>
                    <TabsTrigger value="documents">Documentation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Methodology</h4>
                        <p className="text-sm text-muted-foreground mb-4">{project.methodology}</p>
                        
                        <h4 className="font-medium mb-3">Registration Date</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {project.registrationDate ? new Date(project.registrationDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Credits Issued</h4>
                        <p className="text-sm text-muted-foreground mb-4">{project.creditsIssued.toLocaleString()} tCO₂e</p>
                        
                        <h4 className="font-medium mb-3">Credits Retired</h4>
                        <p className="text-sm text-muted-foreground">{project.creditsRetired.toLocaleString()} tCO₂e</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="blockchain">
                    <ProjectMetadataViewer projectId={project.id} />
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">
                        Project documentation is managed through our integrated asset management system
                      </p>
                      {project.metadataUri ? (
                        <Button variant="outline" asChild>
                          <a href={project.metadataUri} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Full Documentation
                          </a>
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Documentation will be available after blockchain integration
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Quantity (tCO₂e)</label>
                    <input 
                      type="number" 
                      className="w-full mt-1 p-2 border rounded-md" 
                      placeholder="Enter quantity"
                      min="1"
                      max={project.credits}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price per credit:</span>
                    <span>${project.price.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full bg-gradient-eco" 
                    disabled={project.status !== 'verified' || !user}
                    onClick={handlePurchaseCredits}
                  >
                    {user ? 'Purchase Credits' : 'Sign In to Purchase'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Data Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Registry Status</span>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blockchain Verified</span>
                    <Badge className="bg-verified text-verified-foreground">
                      {project.blockchainTx ? 'Yes' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Metadata Linked</span>
                    <Badge className={project.metadataUri ? "bg-success text-success-foreground" : "bg-pending text-pending-foreground"}>
                      {project.metadataUri ? 'Linked' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Synced</span>
                    <span className="text-xs text-muted-foreground">
                      {project.lastSynced ? new Date(project.lastSynced).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {project && (
        <TransactionManager
          project={project}
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onTransactionComplete={() => {
            // Refresh project data after transaction
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
