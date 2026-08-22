import { useAppSelector } from "../app/hooks";

import Toast from "./Toast";

import styles from "./Toast.module.css";

const ToastContainer = () => {
  const notifications =
    useAppSelector(
      (state) =>
        state.notifications
          .notifications,
    );

  return (
    <div className={styles.container}>
      {notifications.map(
        (notification) => (
          <Toast
            key={notification.id}
            notification={
              notification
            }
          />
        ),
      )}
    </div>
  );
};

export default ToastContainer;