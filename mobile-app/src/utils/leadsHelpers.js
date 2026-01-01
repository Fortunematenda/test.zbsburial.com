/**
 * Helper functions for Leads screen
 */

/**
 * Format distance display
 * @param {string|number|null|undefined} distance - Distance value
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  // Handle null, undefined, or empty string
  if (distance === null || distance === undefined || distance === '') return 'N/A';
  
  const dist = parseFloat(distance);
  
  // Handle invalid numbers
  if (isNaN(dist)) return 'N/A';
  
  // If distance is less than 1km, show "😊 Just nearby"
  if (dist < 1) {
    return '😊 Just nearby';
  }
  
  // For distances >= 1km, show rounded to 1 decimal place
  return `${dist.toFixed(1)}km`;
};

/**
 * Get urgency color based on urgency level
 * @param {string} urgency - Urgency level (Urgent, High, Normal, Low)
 * @returns {string} Color hex code
 */
export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'Urgent': return '#FF4444';
    case 'High': return '#FF8800';
    case 'Normal': return '#4CAF50';
    case 'Low': return '#8B5CF6';
    default: return '#666';
  }
};

/**
 * Format budget string (replace $ with R)
 * @param {string} budget - Budget string
 * @returns {string} Formatted budget string
 */
export const formatBudget = (budget) => {
  if (!budget || typeof budget !== 'string') return budget || 'Price not specified';
  return budget.replace(/\$/g, 'R');
};

