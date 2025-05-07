import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null
}) => {
  const buttonClasses = [
    'custom-button',
    `custom-button--${variant}`,
    `custom-button--${size}`,
    fullWidth ? 'custom-button--full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;