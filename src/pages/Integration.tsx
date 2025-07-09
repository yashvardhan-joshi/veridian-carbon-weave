
import { Header } from "@/components/Header";
import { IntegrationHub } from "@/components/IntegrationHub";
import { RegistrySyncStatus } from "@/components/RegistrySyncStatus";
import { BlockchainIntegration } from "@/components/BlockchainIntegration";

const Integration = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect your registry with external systems, blockchain networks, and data sources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlockchainIntegration />
          <RegistrySyncStatus />
        </div>
        
        <div className="mt-8">
          <IntegrationHub />
        </div>
      </main>
    </div>
  );
};

export default Integration;
