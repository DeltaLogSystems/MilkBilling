import React from "react";
import "./Alert.css";

/**
 * Custom Confirmation Dialog Component
 * @param {Object} props
 * @param {string} props.type - Type: 'warning', 'error', 'info' (default: 'warning')
 * @param {string} props.title - Title of the dialog
 * @param {string} props.message - Message content
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {string} props.confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} props.cancelText - Text for cancel button (default: 'Cancel')
 */
function ConfirmDialog({
  type = "warning",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const getIcon = () => {
    switch (type) {
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
      case "info":
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
      case "warning":
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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div className="alert-overlay" onClick={onCancel}>
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
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              className="alert-button-secondary"
              type="button"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
