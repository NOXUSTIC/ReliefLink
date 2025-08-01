import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { MapPin, Clock, User, Filter } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string | null;
  urgency_level: string;
  status: string;
  incident_type: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface IncidentListProps {
  userOnly?: boolean;
  adminView?: boolean;
}

const IncidentList = ({ userOnly = false, adminView = false }: IncidentListProps) => {
  const { user, profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const urgencyColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800'
  };

  useEffect(() => {
    fetchIncidents();
  }, [user, userOnly]);

  const fetchIncidents = async () => {
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          profiles!incidents_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false });

      if (userOnly && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Incident[] = (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'full_name' in item.profiles 
          ? item.profiles as { full_name: string }
          : null
      }));
      
      setIncidents(transformedData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus })
        .eq('id', incidentId);

      if (error) throw error;

      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: newStatus as any }
            : incident
        )
      );

      toast({
        title: "Success",
        description: "Incident status updated successfully",
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive",
      });
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (districtFilter && !incident.district?.toLowerCase().includes(districtFilter.toLowerCase())) {
      return false;
    }
    if (statusFilter && statusFilter !== 'all' && incident.status !== statusFilter) {
      return false;
    }
    if (urgencyFilter && urgencyFilter !== 'all' && incident.urgency_level !== urgencyFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading incidents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Filter by district..."
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="w-48"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {(districtFilter || statusFilter !== 'all' || urgencyFilter !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDistrictFilter('');
              setStatusFilter('all');
              setUrgencyFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Incidents */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No incidents found</p>
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {incident.location}
                        {incident.district && `, ${incident.district}`}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(incident.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {incident.profiles?.full_name || 'Anonymous'}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={urgencyColors[incident.urgency_level]}>
                      {incident.urgency_level}
                    </Badge>
                    <Badge className={statusColors[incident.status]}>
                      {incident.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {incident.incident_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{incident.description}</p>
                
                {adminView && profile?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Select
                      value={incident.status}
                      onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentList;