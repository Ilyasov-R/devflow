import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../api/axios";

import type { Team, TeamMember, TeamRole } from "./types";

interface TeamsState {
  teams: Team[];

  currentTeam: Team | null;

  members: TeamMember[];

  invitations: TeamInvitation[];

  loading: boolean;

  isLoadingInvitations: boolean;

  isCreating: boolean;

  isUpdating: boolean;

  isDeleting: boolean;

  isAddingMember: boolean;

  isUpdatingMember: boolean;

  isRemovingMember: boolean;

  isAcceptingInvitation: boolean;

  isRejectingInvitation: boolean;

  error: string | null;
}

const initialState: TeamsState = {
  teams: [],

  currentTeam: null,

  members: [],

  invitations: [],

  loading: false,

  isLoadingInvitations: false,

  isCreating: false,

  isUpdating: false,

  isDeleting: false,

  isAddingMember: false,

  isUpdatingMember: false,

  isRemovingMember: false,

  isAcceptingInvitation: false,

  isRejectingInvitation: false,

  error: null,
};

export interface TeamInvitation {
  id: number;
  team_id: number;
  role: TeamRole;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  team_name: string;
  inviter_username: string;
  inviter_email: string;
}

// =========================================
// GET MY TEAMS
// =========================================

export const fetchTeams = createAsyncThunk<
  Team[],
  void,
  { rejectValue: string }
>("teams/fetchTeams", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{
      teams: Team[];
    }>("/teams");

    return response.data.teams;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось загрузить команды",
    );
  }
});

// =========================================
// GET TEAM
// =========================================

export const fetchTeam = createAsyncThunk<
  {
    team: Team;
    members: TeamMember[];
  },
  number,
  { rejectValue: string }
>("teams/fetchTeam", async (teamId, { rejectWithValue }) => {
  try {
    const response = await api.get<{
      team: Team;
      members: TeamMember[];
    }>(`/teams/${teamId}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось загрузить команду",
    );
  }
});

// =========================================
// CREATE TEAM
// =========================================

export const createTeam = createAsyncThunk<
  Team,
  string,
  { rejectValue: string }
>("teams/createTeam", async (name, { rejectWithValue }) => {
  try {
    const response = await api.post<{
      team: Team;
    }>("/teams", {
      name,
    });

    return response.data.team;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось создать команду",
    );
  }
});

// =========================================
// UPDATE TEAM
// =========================================

export const updateTeam = createAsyncThunk<
  Team,
  {
    teamId: number;
    name: string;
  },
  { rejectValue: string }
>("teams/updateTeam", async ({ teamId, name }, { rejectWithValue }) => {
  try {
    const response = await api.put<{
      team: Team;
    }>(`/teams/${teamId}`, {
      name,
    });

    return response.data.team;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось обновить команду",
    );
  }
});

// =========================================
// DELETE TEAM
// =========================================

export const deleteTeam = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("teams/deleteTeam", async (teamId, { rejectWithValue }) => {
  try {
    await api.delete(`/teams/${teamId}`);

    return teamId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось удалить команду",
    );
  }
});

// =========================================
// ADD MEMBER
// =========================================

export const addMember = createAsyncThunk<
  TeamMember,
  {
    teamId: number;
    userId: number;
    role?: TeamRole;
  },
  { rejectValue: string }
>(
  "teams/addMember",
  async ({ teamId, userId, role = "member" }, { rejectWithValue }) => {
    try {
      const response = await api.post<{
        member: TeamMember;
      }>(`/teams/${teamId}/members`, {
        userId,
        role,
      });

      return response.data.member;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось добавить участника",
      );
    }
  },
);

// =========================================
// UPDATE MEMBER ROLE
// =========================================

export const updateMemberRole = createAsyncThunk<
  TeamMember,
  {
    teamId: number;
    userId: number;
    role: TeamRole;
  },
  { rejectValue: string }
>(
  "teams/updateMemberRole",
  async ({ teamId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put<{
        member: TeamMember;
      }>(`/teams/${teamId}/members/${userId}`, {
        role,
      });

      return response.data.member;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось изменить роль",
      );
    }
  },
);

// =========================================
// REMOVE MEMBER
// =========================================

export const removeMember = createAsyncThunk<
  number,
  {
    teamId: number;
    userId: number;
  },
  { rejectValue: string }
>("teams/removeMember", async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await api.delete(`/teams/${teamId}/members/${userId}`);

    return userId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось удалить участника",
    );
  }
});

// =========================================
// INVITE MEMBER
// =========================================

export const inviteMember = createAsyncThunk<
  TeamMember,
  {
    teamId: number;
    email: string;
    role: TeamRole;
  },
  { rejectValue: string }
>(
  "teams/inviteMember",
  async ({ teamId, email, role }, { rejectWithValue }) => {
    try {
      const response = await api.post<{
        member?: TeamMember;
        invitation?: TeamMember;
        message: string;
      }>(`/teams/${teamId}/invitations`, {
        email,
        role,
      });

      return response.data.invitation || response.data.member!;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось отправить приглашение",
      );
    }
  },
);

// =========================================
// GET MY INVITATIONS
// =========================================

export const fetchMyInvitations = createAsyncThunk<
  TeamInvitation[],
  void,
  { rejectValue: string }
>("teams/fetchMyInvitations", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{
      invitations: TeamInvitation[];
    }>("/teams/invitations");

    return response.data.invitations;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось загрузить приглашения",
    );
  }
});

// =========================================
// ACCEPT INVITATION
// =========================================

export const acceptInvitation = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("teams/acceptInvitation", async (invitationId, { rejectWithValue }) => {
  try {
    await api.post(`/teams/invitations/${invitationId}/accept`);

    return invitationId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось принять приглашение",
    );
  }
});

// =========================================
// REJECT INVITATION
// =========================================

export const rejectInvitation = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("teams/rejectInvitation", async (invitationId, { rejectWithValue }) => {
  try {
    await api.post(`/teams/invitations/${invitationId}/reject`);

    return invitationId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось отклонить приглашение",
    );
  }
});

// =========================================
// SLICE
// =========================================

const teamSlice = createSlice({
  name: "teams",

  initialState,

  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
      state.members = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // FETCH TEAMS
      // =====================================

      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })

      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка загрузки команд";
      })

      // =====================================
      // FETCH TEAM
      // =====================================

      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;

        state.currentTeam = action.payload.team;

        state.members = action.payload.members;
      })

      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка загрузки команды";
      })

      // =====================================
      // CREATE TEAM
      // =====================================

      .addCase(createTeam.pending, (state) => {
        state.isCreating = true;
      })

      .addCase(createTeam.fulfilled, (state, action) => {
        state.isCreating = false;

        state.teams.unshift(action.payload);
      })

      .addCase(createTeam.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Ошибка создания команды";
      })

      // =====================================
      // UPDATE TEAM
      // =====================================

      .addCase(updateTeam.pending, (state) => {
        state.isUpdating = true;
      })

      .addCase(updateTeam.fulfilled, (state, action) => {
        state.isUpdating = false;

        state.teams = state.teams.map((team) =>
          team.id === action.payload.id
            ? {
                ...team,
                ...action.payload,
              }
            : team,
        );

        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = {
            ...state.currentTeam,
            ...action.payload,
          };
        }
      })

      .addCase(updateTeam.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Ошибка обновления команды";
      })

      // =====================================
      // DELETE TEAM
      // =====================================

      .addCase(deleteTeam.pending, (state) => {
        state.isDeleting = true;
      })

      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isDeleting = false;

        state.teams = state.teams.filter((team) => team.id !== action.payload);

        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
          state.members = [];
        }
      })

      .addCase(deleteTeam.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Ошибка удаления команды";
      })

      // =====================================
      // ADD MEMBER
      // =====================================

      .addCase(addMember.pending, (state) => {
        state.isAddingMember = true;
      })

      .addCase(addMember.fulfilled, (state, action) => {
        state.isAddingMember = false;

        state.members.push(action.payload);
      })

      .addCase(addMember.rejected, (state, action) => {
        state.isAddingMember = false;
        state.error = action.payload || "Ошибка добавления участника";
      })

      // =====================================
      // UPDATE MEMBER ROLE
      // =====================================

      .addCase(updateMemberRole.pending, (state) => {
        state.isUpdatingMember = true;
      })

      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.isUpdatingMember = false;

        state.members = state.members.map((member) =>
          member.id === action.payload.id ? action.payload : member,
        );
      })

      .addCase(updateMemberRole.rejected, (state, action) => {
        state.isUpdatingMember = false;
        state.error = action.payload || "Ошибка изменения роли";
      })

      // =====================================
      // REMOVE MEMBER
      // =====================================

      .addCase(removeMember.pending, (state) => {
        state.isRemovingMember = true;
      })

      .addCase(removeMember.fulfilled, (state, action) => {
        state.isRemovingMember = false;

        state.members = state.members.filter(
          (member) => member.id !== action.payload,
        );
      })

      .addCase(removeMember.rejected, (state, action) => {
        state.isRemovingMember = false;
        state.error = action.payload || "Ошибка удаления участника";
      })

      // =====================================
      // INVITE MEMBER
      // =====================================

      .addCase(inviteMember.pending, (state) => {
        state.isAddingMember = true;
        state.error = null;
      })

      .addCase(inviteMember.fulfilled, (state) => {
        state.isAddingMember = false;
      })

      .addCase(inviteMember.rejected, (state, action) => {
        state.isAddingMember = false;
        state.error = action.payload || "Ошибка отправки приглашения";
      })

      // =====================================
      // FETCH MY INVITATIONS
      // =====================================

      .addCase(fetchMyInvitations.pending, (state) => {
        state.isLoadingInvitations = true;
        state.error = null;
      })

      .addCase(fetchMyInvitations.fulfilled, (state, action) => {
        state.isLoadingInvitations = false;
        state.invitations = action.payload;
      })

      .addCase(fetchMyInvitations.rejected, (state, action) => {
        state.isLoadingInvitations = false;

        state.error = action.payload || "Ошибка загрузки приглашений";
      })

      // =====================================
      // ACCEPT INVITATION
      // =====================================

      .addCase(acceptInvitation.pending, (state) => {
        state.isAcceptingInvitation = true;
        state.error = null;
      })

      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.isAcceptingInvitation = false;

        state.invitations = state.invitations.filter(
          (invitation) => invitation.id !== action.payload,
        );
      })

      .addCase(acceptInvitation.rejected, (state, action) => {
        state.isAcceptingInvitation = false;

        state.error = action.payload || "Ошибка принятия приглашения";
      })

      // =====================================
      // REJECT INVITATION
      // =====================================

      .addCase(rejectInvitation.pending, (state) => {
        state.isRejectingInvitation = true;
        state.error = null;
      })

      .addCase(rejectInvitation.fulfilled, (state, action) => {
        state.isRejectingInvitation = false;

        state.invitations = state.invitations.filter(
          (invitation) => invitation.id !== action.payload,
        );
      })

      .addCase(rejectInvitation.rejected, (state, action) => {
        state.isRejectingInvitation = false;

        state.error = action.payload || "Ошибка отклонения приглашения";
      });
  },
});

export const { clearCurrentTeam } = teamSlice.actions;

export default teamSlice.reducer;
