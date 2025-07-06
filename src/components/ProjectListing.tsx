import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CarbonCreditCard from "./CarbonCreditCard";
import { Search, Filter, Plus, Download } from "lucide-react";

// Mock data for carbon credit projects
const mockProjects = [
  {
    id: "1",
    name: "Amazon Rainforest Conservation Project",
    location: "Brazil",
    type: "Forestry",
    credits: 25000,
    price: 18.50,
    status: 'verified' as const,
    vintage: "2024",
    methodology: "VCS VM0009",
    blockchainTx: "0x742d35Cc6634C0532925a3b8D598Ed25C9Fc17E9"
  },
  {
    id: "2",
    name: "Solar Energy Farm - Phase III",
    location: "India",
    type: "Renewable Energy",
    credits: 12500,
    price: 22.00,
    status: 'verified' as const,
    vintage: "2024",
    methodology: "CDM ACM0002",
    blockchainTx: "0x8ba1f109551bD432803012645Hac136c12345678"
  },
  {
    id: "3",
    name: "Mangrove Restoration Initiative",
    location: "Philippines",
    type: "Blue Carbon",
    credits: 8750,
    price: 28.75,
    status: 'pending' as const,
    vintage: "2024",
    methodology: "VCS VM0033"
  },
  {
    id: "4",
    name: "Wind Power Generation",
    location: "Kenya",
    type: "Renewable Energy",
    credits: 15000,
    price: 19.25,
    status: 'verified' as const,
    vintage: "2023",
    methodology: "CDM AMS-I.D",
    blockchainTx: "0x123f35Cc7634C0542925a3b8D598Ed25C9Fc18F1"
  },
  {
    id: "5",
    name: "Improved Cookstoves Program",
    location: "Ghana",
    type: "Energy Efficiency",
    credits: 5500,
    price: 16.00,
    status: 'verified' as const,
    vintage: "2024",
    methodology: "VCS VM0010",
    blockchainTx: "0x456b35Cc8634C0532925a3b8D598Ed25C9Fc19D2"
  },
  {
    id: "6",
    name: "Biogas from Agricultural Waste",
    location: "Vietnam",
    type: "Waste Management",
    credits: 9200,
    price: 24.50,
    status: 'pending' as const,
    vintage: "2024",
    methodology: "CDM AMS-III.R"
  }
];

const ProjectListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const projectTypes = Array.from(new Set(mockProjects.map(p => p.type)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Carbon Credit Projects</h2>
          <p className="text-muted-foreground mt-1">
            Browse verified carbon credits with blockchain transparency
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-gradient-eco">
            <Plus className="w-4 h-4 mr-2" />
            Register Project
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {projectTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {mockProjects.length} projects
        </span>
        <Badge variant="outline" className="bg-verified/10 text-verified border-verified/20">
          {mockProjects.filter(p => p.status === 'verified').length} Verified
        </Badge>
        <Badge variant="outline" className="bg-pending/10 text-pending border-pending/20">
          {mockProjects.filter(p => p.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <CarbonCreditCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects match your current filters.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectListing;