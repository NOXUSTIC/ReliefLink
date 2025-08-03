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
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
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
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('time');

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

  // Get unique districts for filter dropdown
  const districts = [...new Set(incidents.map(i => i.district).filter(Boolean))];

  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      const matchesDistrict = districtFilter === 'all' || incident.district === districtFilter;
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || incident.urgency_level === urgencyFilter;
      
      return matchesDistrict && matchesStatus && matchesUrgency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency_level as keyof typeof urgencyOrder] - 
                 urgencyOrder[a.urgency_level as keyof typeof urgencyOrder];
        case 'time':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return <div className="text-center py-8">Loading incidents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-5 p-4 bg-card rounded-lg border">
        <div>
          <span className="text-sm font-medium mb-2 block">District</span>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district!}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="text-sm font-medium mb-2 block">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="text-sm font-medium mb-2 block">Urgency</span>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="text-sm font-medium mb-2 block">Sort By</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Latest First</SelectItem>
              <SelectItem value="urgency">Urgency Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="text-sm font-medium mb-2 block">Actions</span>
          <Button
            variant="outline"
            onClick={() => {
              setDistrictFilter('all');
              setStatusFilter('all');
              setUrgencyFilter('all');
              setSortBy('time');
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Incidents */}
      <div className="space-y-4">
        {filteredAndSortedIncidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No incidents found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedIncidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
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
                  
                  {incident.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={incident.image_url}
                        alt="Incident photo"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
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