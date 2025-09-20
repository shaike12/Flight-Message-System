// Utility functions for avatar generation

/**
 * Generate a consistent color for an avatar based on a string
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
    '#795548', // Brown
    '#607d8b', // Blue Grey
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Generate initials from a name
 */
export const getUserInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return 'U';
  }

  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word - take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words - take first character of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
};
