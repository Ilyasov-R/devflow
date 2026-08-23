import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type { TeamInvitation } from "./types";

interface InvitationState {
  invitations: TeamInvitation[];
  loading: boolean;
  isAccepting: boolean;
  isRejecting: boolean;
  error: string | null;
}

const initialState: InvitationState = {
  invitations: [],
  loading: false,
  isAccepting: false,
  isRejecting: false,
  error: null,
};

// =========================================
// GET MY INVITATIONS
// =========================================

export const fetchInvitations = createAsyncThunk<
  TeamInvitation[],
  void,
  { rejectValue: string }
>(
  "invitations/fetchInvitations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{
        invitations: TeamInvitation[];
      }>("/teams/invitations");

      return response.data.invitations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Не удалось загрузить приглашения",
      );
    }
  },
);

// =========================================
// ACCEPT INVITATION
// =========================================

export const acceptInvitation =
  createAsyncThunk<
    number,
    number,
    { rejectValue: string }
  >(
    "invitations/acceptInvitation",
    async (invitationId, { rejectWithValue }) => {
      try {
        await api.post(
          `/teams/invitations/${invitationId}/accept`,
        );

        return invitationId;
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Не удалось принять приглашение",
        );
      }
    },
  );

// =========================================
// REJECT INVITATION
// =========================================

export const rejectInvitation =
  createAsyncThunk<
    number,
    number,
    { rejectValue: string }
  >(
    "invitations/rejectInvitation",
    async (invitationId, { rejectWithValue }) => {
      try {
        await api.post(
          `/teams/invitations/${invitationId}/reject`,
        );

        return invitationId;
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Не удалось отклонить приглашение",
        );
      }
    },
  );

const invitationSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    clearInvitationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // FETCH
      // =====================================

      .addCase(
        fetchInvitations.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      .addCase(
        fetchInvitations.fulfilled,
        (state, action) => {
          state.loading = false;
          state.invitations = action.payload;
        },
      )

      .addCase(
        fetchInvitations.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Ошибка загрузки приглашений";
        },
      )

      // =====================================
      // ACCEPT
      // =====================================

      .addCase(
        acceptInvitation.pending,
        (state) => {
          state.isAccepting = true;
          state.error = null;
        },
      )

      .addCase(
        acceptInvitation.fulfilled,
        (state, action) => {
          state.isAccepting = false;

          state.invitations =
            state.invitations.filter(
              (invitation) =>
                invitation.id !== action.payload,
            );
        },
      )

      .addCase(
        acceptInvitation.rejected,
        (state, action) => {
          state.isAccepting = false;
          state.error =
            action.payload ||
            "Ошибка принятия приглашения";
        },
      )

      // =====================================
      // REJECT
      // =====================================

      .addCase(
        rejectInvitation.pending,
        (state) => {
          state.isRejecting = true;
          state.error = null;
        },
      )

      .addCase(
        rejectInvitation.fulfilled,
        (state, action) => {
          state.isRejecting = false;

          state.invitations =
            state.invitations.filter(
              (invitation) =>
                invitation.id !== action.payload,
            );
        },
      )

      .addCase(
        rejectInvitation.rejected,
        (state, action) => {
          state.isRejecting = false;
          state.error =
            action.payload ||
            "Ошибка отклонения приглашения";
        },
      );
  },
});

export const {
  clearInvitationError,
} = invitationSlice.actions;

export default invitationSlice.reducer;