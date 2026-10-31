// Exact user list specified in the assignment
export const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];

// Distinct vibrant colors for user avatars (matching UI in reference)
export const USER_COLORS = {
  "Alan": "#4A90E2",         // Blue
  "Bob": "#50B83C",          // Green
  "Carol": "#F5A623",        // Orange
  "Dean": "#9013FE",         // Purple
  "Elin": "#E94E77",         // Coral / Rose
  "PubNub Bot": "#E55353",   // Red
  "Gregory Goolsby": "#A2BD30", // Lime / Olive
  "Elin Emmanuel": "#E94E77" // Coral
};

/**
 * Returns initials from a username (e.g. "Alan" -> "A", "PubNub Bot" -> "PN")
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
  // Generate deterministic pleasant color if name not in preset
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
 * Helper to pick a random username from user_list as required
 */
export function getRandomUser() {
  const randomIndex = Math.floor(Math.random() * user_list.length);
  return user_list[randomIndex];
}
