import React, { useEffect, useRef } from 'react';
import { user_list, getInitials, getUserColor } from '../constants/users';

export default function MentionDropdown({ filterText = '', onSelectUser, onClose, selectedIndex = 0 }) {
  const dropdownRef = useRef(null);

  // Filter users based on whatever was typed after '@'
  const filteredUsers = user_list.filter((u) =>
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

  if (filteredUsers.length === 0) {
    return (
      <div className="mention-dropdown-menu" ref={dropdownRef}>
        <div className="mention-empty">No matching users</div>
      </div>
    );
  }

  return (
    <div className="mention-dropdown-menu" ref={dropdownRef} role="listbox">
      <div className="mention-header">Mention Member</div>
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
          </button>
        );
      })}
    </div>
  );
}
