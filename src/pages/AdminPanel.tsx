import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { LogOut, Shield, AlertTriangle, Users, FileText, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncidentList from '@/components/IncidentList';
import ResourceRequestList from '@/components/ResourceRequestList';

const AdminPanel = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    activeIncidents: 0,
    totalUsers: 0,
    pendingRequests: 0
  });

  // All hooks must be called before any early returns
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total incidents
        const { count: incidentCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true });

        // Fetch active incidents (not resolved)
        const { count: activeCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'resolved');

        // Fetch total profiles
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch pending resource requests
        const { count: requestCount } = await supabase
          .from('resource_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalReports: incidentCount || 0,
          activeIncidents: activeCount || 0,
          totalUsers: userCount || 0,
          pendingRequests: requestCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchStats();
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ReliefLink Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Admin: {profile?.full_name}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeIncidents}</div>
              <p className="text-xs text-muted-foreground">Pending resolution</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total users</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incidents">Incident Management</TabsTrigger>
            <TabsTrigger value="resources">Resource Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Management</CardTitle>
                <CardDescription>
                  Review, update, and manage all incident reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList adminView={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Resource Request Management
                </CardTitle>
                <CardDescription>
                  Review and manage all resource requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceRequestList adminView={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;