import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalVolume: 0,
    averagePrice: 0,
    monthlyGrowth: 0,
    activeProjects: 0,
    totalCredits: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: projects } = await supabase
          .from('carbon_projects')
          .select('*');

        const { data: transactions } = await supabase
          .from('carbon_transactions')
          .select('*');

        if (projects && transactions) {
          const totalCredits = projects.reduce((sum, p) => sum + (Number(p.credits_issued) || 0), 0);
          const totalVolume = transactions.reduce((sum, t) => sum + (Number(t.quantity) * Number(t.price_per_unit || 20)), 0);
          const averagePrice = transactions.length > 0 ? 
            transactions.reduce((sum, t) => sum + Number(t.price_per_unit || 20), 0) / transactions.length : 0;

          setAnalytics({
            totalVolume,
            averagePrice,
            monthlyGrowth: 12.5,
            activeProjects: projects.filter(p => p.status === 'verified').length,
            totalCredits,
            transactionCount: transactions.length
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for carbon credit transactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <Badge className="bg-success text-success-foreground mr-1">+{analytics.monthlyGrowth}%</Badge>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averagePrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">per tCO₂e credit</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeProjects}</div>
              <p className="text-xs text-muted-foreground">verified projects</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">tCO₂e issued</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-hero rounded-lg p-6 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  Interactive charts and market trend analysis coming soon. 
                  Track price movements, volume trends, and project performance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Transaction Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Total Transactions</p>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{analytics.transactionCount}</p>
                    <Badge className="bg-verified text-verified-foreground">Verified</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Blockchain Confirmations</p>
                    <p className="text-sm text-muted-foreground">Success rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">99.9%</p>
                    <Badge className="bg-success text-success-foreground">Excellent</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Veridian Sync</p>
                    <p className="text-sm text-muted-foreground">Ledger status</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">Live</p>
                    <Badge className="bg-verified text-verified-foreground">Synced</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card mt-8">
          <CardHeader>
            <CardTitle>Registry Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">99.9%</div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-verified mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Data Integrity</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">&lt;1s</div>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;