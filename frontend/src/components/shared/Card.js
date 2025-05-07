import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  footerContent, 
  noPadding = false 
}) => {
  return (
    <div className={`custom-card ${className}`}>
      {(title || subtitle) && (
        <div className="custom-card-header">
          {title && <h3 className="custom-card-title">{title}</h3>}
          {subtitle && <p className="custom-card-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className={`custom-card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
      
      {footerContent && (
        <div className="custom-card-footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;