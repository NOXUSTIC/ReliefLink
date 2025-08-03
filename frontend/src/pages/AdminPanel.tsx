import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IncidentList from '@/components/IncidentList';
import { AlertTriangle, LogOut, Shield } from 'lucide-react';

const AdminPanel = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || profile?.role !== 'admin') {
    navigate('/user-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage incidents and monitor emergency reports.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Incident Reports</CardTitle>
            <CardDescription>Review and manage all submitted incident reports</CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentList adminView={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;