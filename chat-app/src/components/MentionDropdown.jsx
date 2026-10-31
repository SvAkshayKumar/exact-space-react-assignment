import React, { useEffect, useRef } from 'react';
import { getInitials, getUserColor } from '../constants/users';
import { Volume2 } from 'lucide-react';

export default function MentionDropdown({
  activeUsers = [],
  filterText = '',
  onSelectUser,
  onClose,
  selectedIndex = 0
}) {
  const dropdownRef = useRef(null);

  // Build the list of mention candidates: "@all" is always available + active online users
  const candidates = [
    {
      type: 'all',
      username: 'all',
      displayName: 'all',
      subtext: 'Notify everyone in channel'
    },
    ...activeUsers.map((user) => ({
      type: 'user',
      username: user,
      displayName: user,
      subtext: 'Active member'
    }))
  ];

  // Filter candidates matching typed text
  const filtered = candidates.filter((item) =>
    item.username.toLowerCase().startsWith(filterText.toLowerCase())
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

  if (filtered.length === 0) {
    return (
      <div className="mention-dropdown-menu" ref={dropdownRef}>
        <div className="mention-header">Mentions</div>
        <div className="mention-empty">No matching members or mentions</div>
      </div>
    );
  }

  return (
    <div className="mention-dropdown-menu" ref={dropdownRef} role="listbox">
      <div className="mention-header">
        <span>Mentions ({filtered.length})</span>
      </div>
      {filtered.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        const isAll = item.type === 'all';

        return (
          <button
            key={item.username}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={`mention-item ${isSelected ? 'selected' : ''} ${isAll ? 'mention-all-item' : ''}`}
            onClick={() => onSelectUser(item.username)}
          >
            {isAll ? (
              <div className="mention-avatar mention-avatar-all">
                <Volume2 size={14} />
              </div>
            ) : (
              <div
                className="mention-avatar"
                style={{ backgroundColor: getUserColor(item.username) }}
              >
                {getInitials(item.username)}
              </div>
            )}
            <div className="mention-item-info">
              <span className="mention-username">@{item.displayName}</span>
              <span className="mention-subtext">{item.subtext}</span>
            </div>
            {!isAll && (
              <span className="mention-online-indicator" title="Active now">●</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
