import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { MapPin, Send } from 'lucide-react';

const ReportForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    district: '',
    incident_type: '',
    urgency_level: 'medium'
  });

  const incidentTypes = [
    { value: 'flood', label: 'Flood' },
    { value: 'fire', label: 'Fire' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'storm', label: 'Storm' },
    { value: 'outage', label: 'Power/Service Outage' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        handleInputChange('location', locationText);
        toast({
          title: "Success",
          description: "Location captured successfully",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Error",
          description: "Unable to get your location. Please enter manually.",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a report",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.incident_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('incidents')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            district: formData.district || null,
            incident_type: formData.incident_type,
            urgency_level: formData.urgency_level,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident report submitted successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        district: '',
        incident_type: '',
        urgency_level: 'medium'
      });

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Incident Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Brief description of the incident"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident_type">Incident Type *</Label>
          <Select
            value={formData.incident_type}
            onValueChange={(value) => handleInputChange('incident_type', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide detailed information about the incident"
          rows={4}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="flex space-x-2">
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Address or coordinates"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={getCurrentLocation}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District/Area</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="District or area name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency_level">Urgency Level</Label>
        <Select
          value={formData.urgency_level}
          onValueChange={(value) => handleInputChange('urgency_level', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {urgencyLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Send className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </Button>
    </form>
  );
};

export default ReportForm;