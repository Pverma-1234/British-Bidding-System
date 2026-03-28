import React from 'react';
import { Medal } from 'lucide-react';

const RankBadge = ({ rank }) => {
  if (!rank) return <span style={{ color: '#6B7280' }}>-</span>;

  let badgeStyle = { backgroundColor: '#F9FAFB', color: '#6B7280' };
  let icon = null;

  if (rank === 1) {
    // L1 = Success green as per palette
    badgeStyle = {
      backgroundColor: '#D1FAE5',
      color: '#10B981',
      border: '1px solid #A7F3D0',
    };
    icon = <Medal className="w-4 h-4" />;
  } else if (rank === 2) {
    badgeStyle = { backgroundColor: '#F3F4F6', color: '#111827' };
  } else if (rank === 3) {
    badgeStyle = { backgroundColor: '#FEF3C7', color: '#F59E0B' };
  }

  return (
    <div
      style={badgeStyle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold shadow-sm transition-transform duration-300 transform scale-100 hover:scale-105"
    >
      {icon}
      <span>L{rank}</span>
    </div>
  );
};

export default RankBadge;
