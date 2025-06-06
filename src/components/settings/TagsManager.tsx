
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tag, Plus, X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  category: string;
  color: string;
}

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6B7280', '#059669'
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user?.id as any)
        .order('category, name');
      
      if (data) {
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim() || !newTagCategory) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .insert({
          user_id: user?.id,
          name: newTagName.trim(),
          category: newTagCategory,
          color: newTagColor
        } as any);

      if (error) throw error;

      toast({
        title: 'Tag Created',
        description: 'Your new tag has been created successfully'
      });

      setNewTagName('');
      setNewTagCategory('');
      setNewTagColor('#3B82F6');
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId as any);

      if (error) throw error;

      toast({
        title: 'Tag Deleted',
        description: 'Tag has been removed successfully'
      });
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive'
      });
    }
  };

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Manage Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new tag */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Create New Tag</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <Select value={newTagCategory} onValueChange={setNewTagCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="journal">Journal</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newTagColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
            <Button onClick={createTag} disabled={loading || !newTagName.trim() || !newTagCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </div>

        {/* Display existing tags */}
        <div className="space-y-4">
          {Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-medium capitalize">{category} Tags</h3>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="px-3 py-1 text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 p-0 h-auto text-white hover:bg-white/20"
                      onClick={() => deleteTag(tag.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
