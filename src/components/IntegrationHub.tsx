import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Webhook, Database, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const IntegrationHub = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const apiExamples = {
    curl: `curl -X GET "https://api.carbonchain.io/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    
    javascript: `// Install: npm install @carbonchain/sdk
import { CarbonChainSDK } from '@carbonchain/sdk';

const client = new CarbonChainSDK({
  apiKey: 'YOUR_API_KEY',
  network: 'mainnet' // or 'testnet'
});

// Get all verified projects
const projects = await client.projects.list({
  status: 'verified',
  limit: 20
});

// Purchase credits
const purchase = await client.credits.purchase({
  projectId: 'proj_123',
  quantity: 100,
  price: 25.00
});`,

    python: `# Install: pip install carbonchain-sdk
from carbonchain import CarbonChainClient

client = CarbonChainClient(
    api_key="YOUR_API_KEY",
    network="mainnet"
)

# Get project details
project = client.projects.get("proj_123")

# List available credits
credits = client.credits.list(
    project_id="proj_123",
    status="verified"
)`,

    webhook: `{
  "event": "credit.purchased",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "purchase_id": "purch_789",
    "project_id": "proj_123",
    "quantity": 100,
    "total_price": 2500.00,
    "blockchain_tx": "0x742d35Cc6634C0532925a3b8D598Ed25C9Fc17E9",
    "buyer": {
      "id": "user_456",
      "organization": "GreenCorp Ltd"
    }
  }
}`
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Integration Hub</h2>
        <p className="text-muted-foreground">
          Integrate CarbonChain Registry into your platform with our comprehensive APIs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-primary" />
              RESTful API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete REST API for managing projects, credits, and transactions
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">99.9% Uptime</Badge>
              <Badge variant="outline">Rate Limited</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="w-5 h-5 mr-2 text-verified" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time notifications for credit purchases, verifications, and more
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-verified text-verified-foreground">Real-time</Badge>
              <Badge variant="outline">Secure</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-pending" />
              Blockchain Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Direct access to blockchain verification data and transaction history
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-pending text-pending-foreground">Immutable</Badge>
              <Badge variant="outline">Veridian</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="javascript" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
        </TabsList>

        {Object.entries(apiExamples).map(([key, code]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {key === 'curl' ? 'cURL Example' : 
                   key === 'webhook' ? 'Webhook Payload Example' :
                   `${key.charAt(0).toUpperCase() + key.slice(1)} SDK Example`}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(code, key)}
                  disabled={copied === key}
                >
                  {copied === key ? 'Copied!' : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  readOnly
                  className="font-mono text-sm min-h-[200px] bg-muted/50"
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-success" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Secure your API access with API keys and optional OAuth 2.0
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm font-mono">API Key</span>
                <Badge variant="outline">Required</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm font-mono">OAuth 2.0</span>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="w-4 h-4 mr-2" />
              API Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="w-4 h-4 mr-2" />
              SDK Downloads
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink className="w-4 h-4 mr-2" />
              Postman Collection
            </Button>
            <Button className="w-full bg-gradient-eco">Get API Key</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationHub;