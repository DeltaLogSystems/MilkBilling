import React from "react";
import "./Alert.css";

/**
 * Custom Alert Component
 * @param {Object} props
 * @param {string} props.type - Type of alert: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Title of the alert
 * @param {string} props.message - Message content
 * @param {Function} props.onClose - Callback when alert is closed
 * @param {string} props.confirmText - Text for confirm button (default: 'OK')
 */
function Alert({ type = "info", title, message, onClose, confirmText = "OK" }) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        );
      case "error":
        return (
          <svg
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        );
      case "warning":
        return (
          <svg
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-card" onClick={(e) => e.stopPropagation()}>
        <div className="alert-header">
          <div className={`alert-image ${type}`}>{getIcon()}</div>
          <div className="alert-content">
            <span className="alert-title">{title}</span>
            <p className="alert-message">{message}</p>
          </div>
          <div className="alert-actions">
            <button
              className={`alert-button-primary ${type}`}
              type="button"
              onClick={onClose}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alert;
