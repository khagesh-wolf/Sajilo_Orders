import { useState, useEffect } from 'react';
import { isBackupReminderNeeded, isReminderDismissedToday, getDaysSinceLastBackup } from '@/lib/databaseBackup';

interface BackupReminderState {
  showReminder: boolean;
  daysSinceLastBackup: number | null;
}

/**
 * Hook to manage backup reminder state
 * Only shows for admin and counter roles
 */
export function useBackupReminder(userRole?: string): BackupReminderState {
  const [state, setState] = useState<BackupReminderState>({
    showReminder: false,
    daysSinceLastBackup: null,
  });

  useEffect(() => {
    // Only show reminder for admin and counter users
    if (!userRole || !['admin', 'counter'].includes(userRole)) {
      setState({ showReminder: false, daysSinceLastBackup: null });
      return;
    }

    // Check if reminder is needed and not dismissed today
    const needsReminder = isBackupReminderNeeded();
    const dismissedToday = isReminderDismissedToday();
    const daysSince = getDaysSinceLastBackup();

    setState({
      showReminder: needsReminder && !dismissedToday,
      daysSinceLastBackup: daysSince,
    });
  }, [userRole]);

  return state;
}
