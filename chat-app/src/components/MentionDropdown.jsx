import React, { useEffect, useRef } from 'react';
import { getInitials, getUserColor } from '../constants/users';

export default function MentionDropdown({
  activeUsers = [],
  filterText = '',
  onSelectUser,
  onClose,
  selectedIndex = 0
}) {
  const dropdownRef = useRef(null);

  // Only currently active/online users are available for mentions
  const filteredUsers = activeUsers.filter((u) =>
    u.toLowerCase().startsWith(filterText.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (activeUsers.length === 0) {
    return (
      <div className="mention-dropdown-menu" ref={dropdownRef}>
        <div className="mention-header">Active Members</div>
        <div className="mention-empty">No other active users online</div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="mention-dropdown-menu" ref={dropdownRef}>
        <div className="mention-header">Active Members</div>
        <div className="mention-empty">No matching active users online</div>
      </div>
    );
  }

  return (
    <div className="mention-dropdown-menu" ref={dropdownRef} role="listbox">
      <div className="mention-header">
        <span>Active Members ({filteredUsers.length})</span>
      </div>
      {filteredUsers.map((user, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={user}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={`mention-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectUser(user)}
          >
            <div
              className="mention-avatar"
              style={{ backgroundColor: getUserColor(user) }}
            >
              {getInitials(user)}
            </div>
            <span className="mention-username">@{user}</span>
            <span className="mention-online-indicator" title="Active now">●</span>
          </button>
        );
      })}
    </div>
  );
}
