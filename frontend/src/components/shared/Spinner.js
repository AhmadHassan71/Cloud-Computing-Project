import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', fullPage = false, text = 'Loading...' }) => {
  const spinnerClasses = [
    'spinner',
    `spinner--${size}`,
    fullPage ? 'spinner--full-page' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses}>
      <div className="spinner-border"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;