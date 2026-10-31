// Exact user list specified in the assignment
export const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];

// Distinct vibrant colors for user avatars
export const USER_COLORS = {
  "Alan": "#4A90E2",         // Blue
  "Bob": "#50B83C",          // Green
  "Carol": "#F5A623",        // Orange
  "Dean": "#9013FE",         // Purple
  "Elin": "#E94E77"          // Coral / Rose
};

const USER_CACHE_KEY = 'exactspace_chat_username';

/**
 * Returns initials from a username (e.g. "Alan" -> "A")
 */
export function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns avatar background color for a user
 */
export function getUserColor(name = '') {
  if (USER_COLORS[name]) {
    return USER_COLORS[name];
  }
  const colors = [
    '#4A90E2', '#50B83C', '#F5A623', '#9013FE',
    '#E94E77', '#00A896', '#7209B7', '#F72585'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get or assign a constant user name for the client.
 * The name stays constant across refreshes and sessions until the cache is cleared.
 */
export function getPersistentUser() {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached && user_list.includes(cached)) {
      return cached;
    }
    const chosen = user_list[Math.floor(Math.random() * user_list.length)];
    localStorage.setItem(USER_CACHE_KEY, chosen);
    return chosen;
  } catch {
    return user_list[0];
  }
}
