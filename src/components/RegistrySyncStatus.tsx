
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RegistrySyncStatus = () => {
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSyncLogs();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('sync-logs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'registry_sync_logs'
      }, () => {
        fetchSyncLogs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSyncLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registry_sync_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-registry-data');
      
      if (error) throw error;

      toast({
        title: "Sync Completed",
        description: `Successfully processed ${data.recordsProcessed} records`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-pending animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge className="bg-pending text-pending-foreground">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Registry Sync Status
          </CardTitle>
          <Button 
            onClick={triggerSync} 
            disabled={syncing}
            size="sm"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading sync history...</p>
          </div>
        ) : syncLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No sync history available.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Sync Now" to start your first sync.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">
                        {log.sync_type.replace('_', ' ')}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.start_time).toLocaleString()}
                    </p>
                    {log.error_message && (
                      <p className="text-sm text-destructive mt-1">
                        Error: {log.error_message}
                      </p>
                    )}
                  </div>
                </div>
                
                {log.records_processed && (
                  <div className="text-right">
                    <p className="font-semibold">
                      {log.records_processed} records
                    </p>
                    {log.end_time && (
                      <p className="text-xs text-muted-foreground">
                        Duration: {Math.round(
                          (new Date(log.end_time).getTime() - new Date(log.start_time).getTime()) / 1000
                        )}s
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
