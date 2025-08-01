import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { MapPin, Clock, User, Filter, Package } from 'lucide-react';

interface ResourceRequest {
  id: string;
  resource_type: string;
  quantity: string | null;
  location: string;
  description: string | null;
  urgency: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface ResourceRequestListProps {
  userOnly?: boolean;
  adminView?: boolean;
}

const ResourceRequestList = ({ userOnly = false, adminView = false }: ResourceRequestListProps) => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');

  const urgencyColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    fulfilled: 'bg-green-100 text-green-800'
  };

  useEffect(() => {
    fetchRequests();
  }, [user, userOnly]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('resource_requests')
        .select(`
          *,
          profiles!resource_requests_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false });

      if (userOnly && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData: ResourceRequest[] = (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'full_name' in item.profiles 
          ? item.profiles as { full_name: string }
          : null
      }));
      
      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching resource requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resource requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('resource_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );

      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    if (statusFilter && request.status !== statusFilter) {
      return false;
    }
    if (urgencyFilter && request.urgency !== urgencyFilter) {
      return false;
    }
    if (resourceTypeFilter && request.resource_type !== resourceTypeFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading resource requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="food">Food & Water</SelectItem>
            <SelectItem value="medical">Medical Supplies</SelectItem>
            <SelectItem value="shelter">Shelter & Clothing</SelectItem>
            <SelectItem value="rescue">Rescue Equipment</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="communication">Communication Equipment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Urgency</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter || urgencyFilter || resourceTypeFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setUrgencyFilter('');
              setResourceTypeFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Resource Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No resource requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      {request.resource_type.replace('_', ' ').toUpperCase()} Request
                      {request.quantity && ` - ${request.quantity}`}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {request.profiles?.full_name || 'Anonymous'}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={urgencyColors[request.urgency]}>
                      {request.urgency}
                    </Badge>
                    <Badge className={statusColors[request.status]}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {request.description && (
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                )}
                
                {adminView && profile?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Select
                      value={request.status}
                      onValueChange={(value) => updateRequestStatus(request.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
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

export default ResourceRequestList;