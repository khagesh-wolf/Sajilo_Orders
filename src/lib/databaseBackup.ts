import { formatNepalDateTime } from './nepalTime';

// Types for backup data
export interface BackupData {
  version: string;
  createdAt: string;
  restaurantName: string;
  data: {
    categories: any[];
    menuItems: any[];
    orders: any[];
    bills: any[];
    transactions: any[];
    customers: any[];
    staff: any[];
    expenses: any[];
    waiterCalls: any[];
    inventory: any[];
    settings: any;
  };
}

const BACKUP_VERSION = '1.0';
const LAST_BACKUP_KEY = 'sajilo_last_backup_date';
const BACKUP_REMINDER_DAYS = 7;

/**
 * Export all store data to a downloadable JSON file
 */
export function exportDatabase(storeState: any, restaurantName: string): void {
  const backup: BackupData = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    restaurantName,
    data: {
      categories: storeState.categories || [],
      menuItems: storeState.menuItems || [],
      orders: storeState.orders || [],
      bills: storeState.bills || [],
      transactions: storeState.transactions || [],
      customers: storeState.customers || [],
      staff: storeState.staff || [],
      expenses: storeState.expenses || [],
      waiterCalls: storeState.waiterCalls || [],
      inventory: storeState.inventory || [],
      settings: storeState.settings || {},
    },
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = formatNepalDateTime(new Date()).replace(/[/:]/g, '-').replace(/ /g, '_');
  const fileName = `${restaurantName.replace(/\s+/g, '_')}_backup_${dateStr}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Update last backup date
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

/**
 * Validate backup file structure
 */
export function validateBackupFile(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid backup file format' };
  }
  
  if (!data.version) {
    return { valid: false, error: 'Missing backup version' };
  }
  
  if (!data.data) {
    return { valid: false, error: 'Missing backup data' };
  }
  
  const requiredFields = ['categories', 'menuItems', 'settings'];
  for (const field of requiredFields) {
    if (data.data[field] === undefined) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  return { valid: true };
}

/**
 * Parse and validate a backup file
 */
export async function parseBackupFile(file: File): Promise<{ success: boolean; data?: BackupData; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    const validation = validateBackupFile(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    return { success: true, data: data as BackupData };
  } catch (error) {
    return { success: false, error: 'Failed to parse backup file. Make sure it\'s a valid JSON file.' };
  }
}

/**
 * Get backup statistics for display
 */
export function getBackupStats(data: BackupData): {
  totalItems: number;
  categories: number;
  menuItems: number;
  transactions: number;
  customers: number;
  staff: number;
} {
  return {
    totalItems: 
      (data.data.categories?.length || 0) +
      (data.data.menuItems?.length || 0) +
      (data.data.transactions?.length || 0) +
      (data.data.customers?.length || 0) +
      (data.data.staff?.length || 0),
    categories: data.data.categories?.length || 0,
    menuItems: data.data.menuItems?.length || 0,
    transactions: data.data.transactions?.length || 0,
    customers: data.data.customers?.length || 0,
    staff: data.data.staff?.length || 0,
  };
}

/**
 * Check if a backup reminder is needed
 */
export function isBackupReminderNeeded(): boolean {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  
  if (!lastBackup) {
    // No backup ever taken
    return true;
  }
  
  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays >= BACKUP_REMINDER_DAYS;
}

/**
 * Get days since last backup
 */
export function getDaysSinceLastBackup(): number | null {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  
  if (!lastBackup) {
    return null;
  }
  
  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  return Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Dismiss backup reminder for today
 */
export function dismissBackupReminder(): void {
  localStorage.setItem('sajilo_backup_reminder_dismissed', new Date().toDateString());
}

/**
 * Check if reminder was dismissed today
 */
export function isReminderDismissedToday(): boolean {
  const dismissed = localStorage.getItem('sajilo_backup_reminder_dismissed');
  return dismissed === new Date().toDateString();
}

/**
 * Get last backup date formatted
 */
export function getLastBackupDate(): string | null {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  if (!lastBackup) return null;
  return formatNepalDateTime(new Date(lastBackup));
}
