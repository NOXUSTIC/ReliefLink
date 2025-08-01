import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { LogOut, Plus, MapPin, AlertTriangle, Package } from 'lucide-react';
import IncidentList from '@/components/IncidentList';
import ReportForm from '@/components/ReportForm';
import ResourceRequestForm from '@/components/ResourceRequestForm';
import ResourceRequestList from '@/components/ResourceRequestList';

const UserDashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ReliefLink</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || 'User'}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reports">View Reports</TabsTrigger>
            <TabsTrigger value="submit">Submit Report</TabsTrigger>
            <TabsTrigger value="history">My Reports</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Active Incidents
                </CardTitle>
                <CardDescription>
                  View and filter active disaster reports in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Report Incident
                </CardTitle>
                <CardDescription>
                  Submit a new disaster report or emergency situation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Report History</CardTitle>
                <CardDescription>
                  View your submitted reports and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentList userOnly={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Request Resources
                </CardTitle>
                <CardDescription>
                  Request emergency resources and aid for your location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceRequestForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Resource Requests</CardTitle>
                <CardDescription>
                  View your submitted resource requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceRequestList userOnly={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;