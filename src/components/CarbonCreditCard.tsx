import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Calendar, Zap, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { TransactionManager } from "./TransactionManager";
import { useAuth } from "./AuthProvider";

interface CarbonCreditCardProps {
  project: {
    id: string;
    name: string;
    location: string;
    type: string;
    credits: number;
    price: number;
    status: 'verified' | 'pending' | 'rejected';
    vintage: string;
    methodology: string;
    blockchainTx?: string;
  };
}

const CarbonCreditCard = ({ project }: CarbonCreditCardProps) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { user } = useAuth();

  const getStatusIcon = () => {
    switch (project.status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-verified" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-pending" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case 'verified':
        return <Badge className="bg-verified text-verified-foreground">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-pending text-pending-foreground">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-hover transition-shadow duration-300 bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2">{project.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {project.location}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Credits Available</p>
            <p className="font-semibold text-foreground">{project.credits.toLocaleString()} tCO₂e</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price per Credit</p>
            <p className="font-semibold text-foreground">${project.price}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vintage</p>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
              <span className="font-medium text-foreground">{project.vintage}</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <div className="flex items-center">
              <Zap className="w-3 h-3 mr-1 text-success" />
              <span className="font-medium text-foreground">{project.type}</span>
            </div>
          </div>
        </div>

        {project.blockchainTx && (
          <div className="mt-3 p-2 bg-gradient-blockchain/10 rounded border border-verified/20">
            <p className="text-xs text-muted-foreground">Blockchain TX</p>
            <p className="text-xs font-mono text-verified truncate">{project.blockchainTx}</p>
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium">Methodology:</span> {project.methodology}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex w-full space-x-2">
          <Link to={`/projects/${project.id}`}>
            <Button variant="outline" className="flex-1">
              View Details
            </Button>
          </Link>
          <Button 
            className="flex-1 bg-gradient-eco" 
            disabled={project.status !== 'verified' || !user}
            onClick={() => setShowTransactionModal(true)}
          >
            {user ? 'Purchase Credits' : 'Sign In to Purchase'}
          </Button>
        </div>
      </CardFooter>

      <TransactionManager
        project={project}
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </Card>
  );
};

export default CarbonCreditCard;