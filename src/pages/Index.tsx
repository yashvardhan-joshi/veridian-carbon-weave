import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import ProjectListing from "@/components/ProjectListing";
import IntegrationHub from "@/components/IntegrationHub";
import { Database, Code, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace" className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Integration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketplace" className="mt-6">
            <ProjectListing />
          </TabsContent>
          
          <TabsContent value="integration" className="mt-6">
            <IntegrationHub />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-8">
                Comprehensive analytics and reporting for carbon credit transactions
              </p>
              <div className="bg-gradient-hero rounded-lg p-8 border border-border">
                <p className="text-muted-foreground">
                  Advanced analytics dashboard coming soon with real-time market data,
                  transaction volumes, and sustainability impact metrics.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;