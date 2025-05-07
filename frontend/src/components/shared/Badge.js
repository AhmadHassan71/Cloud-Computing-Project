import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  type = 'primary', 
  size = 'medium',
  pill = false,
  className = ''
}) => {
  const badgeClasses = [
    'badge',
    `badge-${type}`,
    `badge-${size}`,
    pill ? 'badge-pill' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;