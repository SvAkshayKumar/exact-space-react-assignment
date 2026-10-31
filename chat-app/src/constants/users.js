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

const USER_ID_CACHE_KEY = 'exactspace_chat_user_id';
const USER_NAME_CACHE_KEY = 'exactspace_chat_username';

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
 * Returns avatar background color for a user.
 */
export function getUserColor(name = '', userId = '') {
  if (USER_COLORS[name] && !userId) {
    return USER_COLORS[name];
  }
  const colors = [
    '#4A90E2', '#50B83C', '#F5A623', '#9013FE',
    '#E94E77', '#00A896', '#7209B7', '#F72585',
    '#2A9D8F', '#E76F51', '#264653', '#E63946'
  ];
  const seed = userId ? `${name}_${userId}` : name;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get or assign a constant user profile (unique userId + assigned username) for this client.
 * The userId stays constant to uniquely identify this client.
 */
export function getPersistentProfile() {
  try {
    let userId = localStorage.getItem(USER_ID_CACHE_KEY);
    if (!userId) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem(USER_ID_CACHE_KEY, userId);
    }

    let username = localStorage.getItem(USER_NAME_CACHE_KEY);
    if (!username || !user_list.includes(username)) {
      username = user_list[Math.floor(Math.random() * user_list.length)];
      localStorage.setItem(USER_NAME_CACHE_KEY, username);
    }

    return { userId, username };
  } catch {
    return {
      userId: `usr_${Date.now()}_fallback`,
      username: user_list[0]
    };
  }
}

/**
 * Reset username for the user while PRESERVING their constant client userId.
 * This ensures all messages previously sent by this client always remain recognized as "(You)".
 */
export function resetPersistentProfile(excludeUsername) {
  try {
    // Keep the constant client userId so ownership of past sent messages is never lost
    let userId = localStorage.getItem(USER_ID_CACHE_KEY);
    if (!userId) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem(USER_ID_CACHE_KEY, userId);
    }

    const remaining = user_list.filter((u) => u !== excludeUsername);
    const newUsername = remaining[Math.floor(Math.random() * remaining.length)] || user_list[0];

    localStorage.setItem(USER_NAME_CACHE_KEY, newUsername);

    return { userId, username: newUsername };
  } catch {
    return {
      userId: `usr_${Date.now()}`,
      username: user_list[0]
    };
  }
}
