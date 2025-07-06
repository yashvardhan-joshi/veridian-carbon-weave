import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Link, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-carbon-registry.jpg";

const Header = () => {
  return (
    <header className="bg-gradient-hero border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-eco rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CarbonChain Registry</h1>
              <p className="text-sm text-muted-foreground">Blockchain-verified carbon credits</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-verified/10 text-verified border-verified/20">
              <Shield className="w-3 h-3 mr-1" />
              Veridian Integrated
            </Badge>
            <Button variant="outline">
              <Link className="w-4 h-4 mr-2" />
              API Access
            </Button>
            <Button className="bg-gradient-eco">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-bold text-foreground">127,384</p>
            <p className="text-xs text-success">+12.5% this month</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="text-2xl font-bold text-foreground">45</p>
            <p className="text-xs text-verified">23 verified</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-foreground">$2.4M</p>
            <p className="text-xs text-success">+8.3% this week</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Blockchain TXs</p>
            <p className="text-2xl font-bold text-foreground">1,892</p>
            <p className="text-xs text-verified">All verified</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;