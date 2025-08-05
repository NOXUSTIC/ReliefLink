import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { AlertTriangle, Shield, Users, Zap } from "lucide-react";
import { BackgroundSlider } from "@/components/BackgroundSlider";

const Index = () => {
  const { user, profile, loading } = useAuth();
  
  // Debug logging
  console.log('Index page - Auth state:', { user: !!user, profile, loading });
  const navigate = useNavigate();

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

  const features = [
    {
      icon: AlertTriangle,
      title: "Emergency Reporting",
      description: "Quickly report incidents and emergencies in your area with real-time updates."
    },
    {
      icon: Shield,
      title: "Secure Communication",
      description: "End-to-end encrypted messaging for sensitive emergency communications."
    },
    {
      icon: Users,
      title: "Community Coordination",
      description: "Connect with local responders and volunteers for effective disaster response."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about incidents and emergency situations nearby."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section with Background Slider */}
      <div className="relative min-h-screen flex flex-col">
        <BackgroundSlider />
        
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-8">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-white drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">ReliefLink</h1>
          </div>
          <div className="space-x-4">
            {user ? (
              <Button 
                onClick={() => navigate(profile?.role === 'admin' ? "/admin-panel" : "/user-dashboard")}
                className="shadow-xl"
              >
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="shadow-xl">
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              Emergency Communication Platform
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg">
              ReliefLink enables communities to report emergencies, coordinate relief efforts, 
              and communicate effectively during disasters. Join our network of responders 
              making a difference when it matters most.
            </p>
            <div className="space-x-4">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate(profile?.role === 'admin' ? "/admin-panel" : "/user-dashboard")}
                  className="shadow-xl"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="shadow-xl"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="shadow-xl"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center shadow-lg">
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center shadow-xl">
        <h3 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h3>
        <p className="text-xl mb-6">
          Join thousands of community members who are already using ReliefLink 
          to coordinate emergency response efforts.
        </p>
        {!user && (
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/auth')}
          >
            Sign Up Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
