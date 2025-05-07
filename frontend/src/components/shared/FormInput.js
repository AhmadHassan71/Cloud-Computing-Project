import React from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  disabled = false,
  helpText,
  icon,
  min,
  max,
  step,
  accept,
  ref
}) => {
  return (
    <div className={`form-input-container ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="form-input-label">
          {label} {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        
        {type === 'textarea' ? (
          <textarea
            id={id}
            className="form-textarea"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            ref={ref}
          />
        ) : (
          <input
            type={type}
            id={id}
            className="form-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            accept={accept}
            ref={ref}
          />
        )}
      </div>
      
      {error && <div className="form-input-error">{error}</div>}
      {helpText && <div className="form-input-help">{helpText}</div>}
    </div>
  );
};

export default FormInput;