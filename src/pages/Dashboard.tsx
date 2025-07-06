import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, BarChart3, Plus, TrendingUp, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCredits: 0,
    totalTransactions: 0,
    verifiedProjects: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: projects } = await supabase
          .from('carbon_projects')
          .select('*');
        
        const { data: transactions } = await supabase
          .from('carbon_transactions')
          .select('*');

        if (projects) {
          const totalCredits = projects.reduce((sum, p) => sum + (Number(p.credits_issued) || 0), 0);
          const verifiedProjects = projects.filter(p => p.status === 'verified').length;
          
          setStats({
            totalProjects: projects.length,
            totalCredits,
            totalTransactions: transactions?.length || 0,
            verifiedProjects
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-eco rounded-lg flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">CarbonChain Registry</h1>
                <p className="text-muted-foreground">Blockchain-verified carbon credits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-verified/10 text-verified border-verified/20">
                <Shield className="w-3 h-3 mr-1" />
                Veridian Integrated
              </Badge>
              <Link to="/integration">
                <Button variant="outline">API Access</Button>
              </Link>
              <Link to="/analytics">
                <Button className="bg-gradient-eco">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCredits.toLocaleString()}</p>
                    <p className="text-xs text-success">tCO₂e available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-verified" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                    <p className="text-xs text-verified">{stats.verifiedProjects} verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-pending" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p>
                    <p className="text-xs text-pending">All blockchain verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Registry Status</p>
                    <p className="text-lg font-bold text-success">Active</p>
                    <p className="text-xs text-success">99.9% uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/marketplace">
                <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Browse Marketplace
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Explore verified carbon credit projects and purchase credits
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/projects/new">
                <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-success" />
                      Register Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Submit a new carbon credit project for verification
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/analytics">
                <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-verified" />
                      View Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track market trends and transaction data
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/integration">
                <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-primary" />
                      API Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Integrate our registry with your platform
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">New project verified</span>
                    <Badge className="bg-success text-success-foreground">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Credit purchase completed</span>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Blockchain sync successful</span>
                    <Badge className="bg-verified text-verified-foreground">Synced</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Registry API</span>
                    <Badge className="bg-success text-success-foreground">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Veridian Ledger</span>
                    <Badge className="bg-success text-success-foreground">Synced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blockchain Network</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;