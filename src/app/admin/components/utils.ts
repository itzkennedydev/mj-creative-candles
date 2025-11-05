import type { Order } from "~/lib/order-types";

// Helper function to format time elapsed
export function formatTimeElapsed(createdAt: Date | string): { text: string; hours: number; color: string } {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text: string;
  let color: string;

  if (diffDays > 0) {
    text = `${diffDays}d ${diffHours % 24}h`;
    color = diffDays >= 3 ? 'text-red-600' : diffDays >= 2 ? 'text-orange-600' : 'text-yellow-600';
  } else if (diffHours > 0) {
    text = `${diffHours}h ${diffMinutes}m`;
    color = diffHours >= 24 ? 'text-red-600' : diffHours >= 12 ? 'text-orange-600' : 'text-gray-600';
  } else {
    text = `${diffMinutes}m`;
    color = 'text-gray-500';
  }

  return { text, hours: diffHours, color };
}

// Helper function to calculate order score (consistent across all uses)
export function calculateOrderScore(order: Order): number {
  // If score exists in database, use it (it was calculated when order was marked as delivered)
  if (order.score !== undefined && order.score !== null && order.score > 0) {
    return order.score;
  }
  
  // Calculate score based on how long THIS SPECIFIC ORDER took to complete
  // Use createdAt as the start time
  const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt as string);
  
  // Use completedAt if available (set when order was marked as delivered)
  // Otherwise use updatedAt as fallback (when status was changed to delivered)
  let completedAt: Date;
  if (order.completedAt) {
    completedAt = order.completedAt instanceof Date ? order.completedAt : new Date(order.completedAt as string);
  } else if (order.updatedAt) {
    // Fallback: use updatedAt if completedAt is not set (for older orders)
    completedAt = order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt as string);
  } else {
    // Last resort: use createdAt (shouldn't happen for delivered orders)
    completedAt = createdAt;
  }
  
  // Calculate hours between order creation and completion
  const hoursToComplete = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // Scoring thresholds based on 7-business-day completion target
  // ≤ 5 days (120 hours): 100 points
  // ≤ 7 days (168 hours): 80 points
  // ≤ 10 days (240 hours): 60 points
  // ≤ 14 days (336 hours): 40 points
  // > 14 days: 20 points
  if (hoursToComplete <= 120) {
    return 100;
  } else if (hoursToComplete <= 168) {
    return 80;
  } else if (hoursToComplete <= 240) {
    return 60;
  } else if (hoursToComplete <= 336) {
    return 40;
  } else {
    return 20;
  }
}

