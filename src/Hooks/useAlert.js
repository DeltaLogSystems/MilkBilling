import { useState, useCallback } from "react";

/**
 * Custom hook for showing alerts and confirmations
 * @returns {Object} { showAlert, showConfirm, AlertComponent, ConfirmComponent }
 */
export function useAlert() {
  const [alertConfig, setAlertConfig] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const showAlert = useCallback(
    ({ type = "info", title, message, confirmText = "OK" }) => {
      return new Promise((resolve) => {
        setAlertConfig({
          type,
          title,
          message,
          confirmText,
          onClose: () => {
            setAlertConfig(null);
            resolve(true);
          },
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    ({
      type = "warning",
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
    }) => {
      return new Promise((resolve) => {
        setConfirmConfig({
          type,
          title,
          message,
          confirmText,
          cancelText,
          onConfirm: () => {
            setConfirmConfig(null);
            resolve(true);
          },
          onCancel: () => {
            setConfirmConfig(null);
            resolve(false);
          },
        });
      });
    },
    []
  );

  return {
    showAlert,
    showConfirm,
    alertConfig,
    confirmConfig,
  };
}
