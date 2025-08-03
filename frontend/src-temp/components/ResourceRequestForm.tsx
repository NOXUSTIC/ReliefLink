import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const ResourceRequestForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resource_type: '',
    quantity: '',
    location: '',
    description: '',
    urgency: 'medium'
  });

  const resourceTypes = [
    { value: 'food', label: 'Food & Water' },
    { value: 'medical', label: 'Medical Supplies' },
    { value: 'shelter', label: 'Shelter & Clothing' },
    { value: 'rescue', label: 'Rescue Equipment' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'communication', label: 'Communication Equipment' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a resource request",
        variant: "destructive",
      });
      return;
    }

    if (!formData.resource_type || !formData.location) {
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
        .from('resource_requests')
        .insert([
          {
            user_id: user.id,
            resource_type: formData.resource_type,
            quantity: formData.quantity || null,
            location: formData.location,
            description: formData.description || null,
            urgency: formData.urgency,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource request submitted successfully",
      });

      // Reset form
      setFormData({
        resource_type: '',
        quantity: '',
        location: '',
        description: '',
        urgency: 'medium'
      });

    } catch (error) {
      console.error('Error submitting resource request:', error);
      toast({
        title: "Error",
        description: "Failed to submit resource request. Please try again.",
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
          <Label htmlFor="resource_type">Resource Type *</Label>
          <Select
            value={formData.resource_type}
            onValueChange={(value) => handleInputChange('resource_type', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity/Amount</Label>
          <Input
            id="quantity"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="e.g., 10 people, 50 bottles"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Where resources are needed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Details</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide additional details about your resource needs"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) => handleInputChange('urgency', value)}
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
        {isSubmitting ? 'Submitting...' : 'Submit Resource Request'}
      </Button>
    </form>
  );
};

export default ResourceRequestForm;