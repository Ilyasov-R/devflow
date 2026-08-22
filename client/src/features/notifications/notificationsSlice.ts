import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  Notification,
} from "./types";

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice =
  createSlice({
    name: "notifications",

    initialState,

    reducers: {
      showSuccess: (
        state,
        action: PayloadAction<string>,
      ) => {
        state.notifications.push({
          id: Date.now(),
          type: "success",
          message: action.payload,
        });
      },

      showError: (
        state,
        action: PayloadAction<string>,
      ) => {
        state.notifications.push({
          id: Date.now(),
          type: "error",
          message: action.payload,
        });
      },

      showInfo: (
        state,
        action: PayloadAction<string>,
      ) => {
        state.notifications.push({
          id: Date.now(),
          type: "info",
          message: action.payload,
        });
      },

      removeNotification: (
        state,
        action: PayloadAction<number>,
      ) => {
        state.notifications =
          state.notifications.filter(
            (notification) =>
              notification.id !==
              action.payload,
          );
      },

      clearNotifications: (state) => {
        state.notifications = [];
      },
    },
  });

export const {
  showSuccess,
  showError,
  showInfo,
  removeNotification,
  clearNotifications,
} =
  notificationsSlice.actions;

export default notificationsSlice.reducer;