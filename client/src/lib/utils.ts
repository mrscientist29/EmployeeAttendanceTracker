import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to display in a readable format
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), "PPP");
}

// Format date with time
export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), "PPp");
}

// Format time only (for clock in/out)
export function formatTime(date: Date | string | number): string {
  return format(new Date(date), "h:mm a");
}

// Format relative time (e.g., "5 minutes ago")
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

// Calculate duration between two timestamps
export function calculateDuration(startDate: Date | string | number, endDate?: Date | string | number): string {
  if (!endDate) {
    endDate = new Date();
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

// Format role for display
export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// Format decimal hours to hours and minutes
export function formatHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Generate a color based on string (for user avatars)
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
