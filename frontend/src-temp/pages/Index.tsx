import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Shield, Users, MapPin } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();

  // Handle auth redirects
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin-panel" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ReliefLink
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real-time disaster reporting and aid coordination platform serving vulnerable and underserved communities during emergencies.
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <Button size="lg" asChild>
              <a href="/auth">Get Started</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-lg bg-card">
              <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Emergency Reporting</h3>
              <p className="text-muted-foreground">
                Quickly report floods, fires, outages, and other emergencies with location data and photos.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Location-Based Filtering</h3>
              <p className="text-muted-foreground">
                Filter and view incidents by district, urgency level, and proximity to your location.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Management</h3>
              <p className="text-muted-foreground">
                Secure admin dashboard for incident tracking, status updates, and resource coordination.
              </p>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-16 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">User Roles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold">Regular Users</h3>
                </div>
                <p className="text-muted-foreground">
                  Submit reports, view incidents, request resources, and track your submission history.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Any email address (e.g., user@gmail.com)
                </p>
              </div>
              
              <div className="text-left">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold">Administrators</h3>
                </div>
                <p className="text-muted-foreground">
                  Manage all incidents, update statuses, coordinate resources, and oversee platform operations.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  BRACU email addresses (@g.bracu.ac.bd)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
