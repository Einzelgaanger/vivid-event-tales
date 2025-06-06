
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, X } from 'lucide-react';

interface Reminder {
  id: string;
  datetime: string;
}

interface EventRemindersProps {
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
}

export function EventReminders({ reminders, onRemindersChange }: EventRemindersProps) {
  const [reminderEnabled, setReminderEnabled] = useState(reminders.length > 0);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  const addReminder = () => {
    if (!newReminderDate || !newReminderTime) return;

    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      datetime: `${newReminderDate}T${newReminderTime}`
    };

    const updatedReminders = [...reminders, newReminder];
    onRemindersChange(updatedReminders);
    setNewReminderDate('');
    setNewReminderTime('');
  };

  const removeReminder = (id: string) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    onRemindersChange(updatedReminders);
  };

  const toggleReminders = (enabled: boolean) => {
    setReminderEnabled(enabled);
    if (!enabled) {
      onRemindersChange([]);
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-orange-600" />
          Event Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-toggle">Enable event reminders</Label>
          <Switch
            id="reminder-toggle"
            checked={reminderEnabled}
            onCheckedChange={toggleReminders}
          />
        </div>

        {reminderEnabled && (
          <>
            <div className="space-y-3 p-3 border rounded-lg">
              <h4 className="font-medium text-sm">Add Reminder</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="reminder-date" className="text-xs">Date</Label>
                  <Input
                    id="reminder-date"
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reminder-time" className="text-xs">Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={addReminder} 
                size="sm" 
                disabled={!newReminderDate || !newReminderTime}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>

            {reminders.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Scheduled Reminders</h4>
                {reminders.map((reminder) => (
                  <Badge key={reminder.id} variant="outline" className="flex items-center justify-between p-2">
                    <span className="text-xs">
                      {new Date(reminder.datetime).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminder(reminder.id)}
                      className="p-0 h-auto ml-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
