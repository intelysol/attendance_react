import React from 'react';
import { AttendanceStatus } from '../../types';
import { STATUS_CONFIG } from '../../config/constants';

interface StatusBadgeProps {
  status: AttendanceStatus;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.present;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
