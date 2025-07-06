import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
    developer: "",
    methodology: "",
    creditsIssued: ""
  });

  const projectTypes = [
    "Forestry",
    "Renewable Energy", 
    "Blue Carbon",
    "Energy Efficiency",
    "Waste Management",
    "Agriculture",
    "Transportation"
  ];

  const methodologies = [
    "VCS VM0009 - Forestry",
    "CDM ACM0002 - Solar Energy",
    "VCS VM0033 - Blue Carbon",
    "VCS VM0010 - Cookstoves",
    "CDM AMS-III.R - Biogas",
    "CDM AMS-I.D - Wind Power"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registryId = `PROJ-${Date.now()}`;
      
      const { error } = await supabase
        .from('carbon_projects')
        .insert({
          registry_id: registryId,
          name: formData.name,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          developer: formData.developer,
          methodology: formData.methodology,
          credits_issued: Number(formData.creditsIssued),
          credits_retired: 0,
          status: 'pending',
          registration_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Project Submitted",
        description: "Your project has been submitted for verification.",
      });

      navigate('/marketplace');
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Error",
        description: "Failed to submit project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Register New Project</h2>
            <p className="text-muted-foreground">
              Submit your carbon credit project for verification and listing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Project location"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Project Type *</label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Developer/Organization *</label>
                  <Input
                    value={formData.developer}
                    onChange={(e) => handleInputChange('developer', e.target.value)}
                    placeholder="Project developer or organization"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Project Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your carbon credit project..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Methodology *</label>
                  <Select value={formData.methodology} onValueChange={(value) => handleInputChange('methodology', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select methodology" />
                    </SelectTrigger>
                    <SelectContent>
                      {methodologies.map(methodology => (
                        <SelectItem key={methodology} value={methodology}>{methodology}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Expected Credits (tCO₂e) *</label>
                  <Input
                    type="number"
                    value={formData.creditsIssued}
                    onChange={(e) => handleInputChange('creditsIssued', e.target.value)}
                    placeholder="Enter expected credit amount"
                    min="1"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Upload project documents, methodology reports, and verification materials
                  </p>
                  <Button variant="outline" type="button">
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, DOC, XLS. Max file size: 10MB
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link to="/">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-gradient-eco"
                disabled={loading || !formData.name || !formData.location || !formData.type || !formData.developer || !formData.methodology || !formData.creditsIssued}
              >
                {loading ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProject;