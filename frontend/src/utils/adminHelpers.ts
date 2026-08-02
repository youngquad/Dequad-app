/**
 * Shared helpers used across the admin dashboard tabs.
 * Kept small and stateless so both dashboard.tsx and the extracted
 * AdminXxxTab components can import from one place.
 */

/** UK-format short date + time — e.g. "26 Aug 14:30". */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Semantic risk-level → hex colour (safeguarding-consistent). */
export function getRiskColor(level: string): string {
  switch (level) {
    case 'high':
    case 'critical':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    default:
      return '#10B981';
  }
}
