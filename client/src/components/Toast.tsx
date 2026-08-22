import { useEffect } from "react";

import {
  useAppDispatch,
} from "../app/hooks";

import {
  removeNotification,
} from "../features/notifications/notificationsSlice";

import type { Notification } from "../features/notifications/types";

import styles from "./Toast.module.css";

interface ToastProps {
  notification: Notification;
}

const Toast = ({
  notification,
}: ToastProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        removeNotification(
          notification.id,
        ),
      );
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    dispatch,
    notification.id,
  ]);

  const getClassName = () => {
    switch (notification.type) {
      case "success":
        return styles.success;

      case "error":
        return styles.error;

      case "info":
        return styles.info;

      default:
        return "";
    }
  };

  return (
    <div
      className={`${styles.toast} ${getClassName()}`}
    >
      <span>
        {notification.type ===
          "success" && "✓"}

        {notification.type ===
          "error" && "✕"}

        {notification.type ===
          "info" && "ℹ"}
      </span>

      <p>
        {notification.message}
      </p>

      <button
        type="button"
        className={styles.close}
        onClick={() =>
          dispatch(
            removeNotification(
              notification.id,
            ),
          )
        }
      >
        ×
      </button>
    </div>
  );
};

export default Toast;