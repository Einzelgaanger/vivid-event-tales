
export class NotificationService {
  static sendJournalReminder() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📖 Time to Journal!', {
        body: 'Take a moment to capture your thoughts and memories.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'journal-reminder',
        requireInteraction: true
      });
    }
  }

  static sendEventReminder(eventTitle: string, eventDate: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`📅 Event Reminder: ${eventTitle}`, {
        body: `Don't forget about your event on ${eventDate}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'event-reminder',
        requireInteraction: true
      });
    }
  }

  static scheduleJournalReminder(time: string, frequency: string) {
    // This would integrate with a service worker for persistent notifications
    // For now, we'll use a simple setTimeout for demonstration
    const scheduleNext = () => {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilReminder = targetTime.getTime() - now.getTime();

      setTimeout(() => {
        this.sendJournalReminder();
        
        // Schedule next reminder based on frequency
        if (frequency === 'daily') {
          scheduleNext();
        } else if (frequency === 'weekly') {
          setTimeout(scheduleNext, 7 * 24 * 60 * 60 * 1000);
        }
      }, timeUntilReminder);
    };

    scheduleNext();
  }
}
