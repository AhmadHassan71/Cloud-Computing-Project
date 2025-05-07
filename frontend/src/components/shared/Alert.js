import React, { useState, useEffect } from 'react';
import './Alert.css';

const Alert = ({ 
  type = 'info', 
  message, 
  dismissible = true, 
  autoDismiss = false,
  autoDismissTime = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Handle auto dismiss functionality
  useEffect(() => {
    let timer;
    if (autoDismiss) {
      timer = setTimeout(() => {
        dismiss();
      }, autoDismissTime);
    }
    
    // Clean up timer on component unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoDismiss, autoDismissTime]);
  
  const dismiss = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <div className="alert-message">{message}</div>
      </div>
      
      {dismissible && (
        <button 
          className="alert-close" 
          onClick={dismiss}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;