import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../api/axios";

import type { Project, CreateProjectData, UpdateProjectData } from "./types";

interface ProjectsState {
  projects: Project[];

  loading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: ProjectsState = {
  projects: [],

  loading: false,

  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

// ============================
// FETCH PROJECTS
// ============================

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("projects/fetchProjects", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{
      projects: Project[];
    }>("/projects");

    return response.data.projects;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось загрузить проекты",
    );
  }
});

// ============================
// CREATE PROJECT
// ============================

export const createProject = createAsyncThunk<
  Project,
  CreateProjectData,
  { rejectValue: string }
>("projects/createProject", async (projectData, { rejectWithValue }) => {
  try {
    const response = await api.post<{
      project: Project;
    }>("/projects", projectData);

    return response.data.project;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось создать проект",
    );
  }
});

// ============================
// UPDATE PROJECT
// ============================

export const updateProject = createAsyncThunk<
  Project,
  UpdateProjectData,
  { rejectValue: string }
>("projects/updateProject", async (projectData, { rejectWithValue }) => {
  try {
    const response = await api.put<{
      project: Project;
    }>(`/projects/${projectData.id}`, {
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
    });

    return response.data.project;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось обновить проект",
    );
  }
});

// ============================
// DELETE PROJECT
// ============================

export const deleteProject = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("projects/deleteProject", async (projectId, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${projectId}`);

    return projectId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Не удалось удалить проект",
    );
  }
});

// ============================
// SLICE
// ============================

const projectsSlice = createSlice({
  name: "projects",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ============================
      // FETCH
      // ============================

      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })

      .addCase(fetchProjects.rejected, (state) => {
        state.loading = false;
      })

      // ============================
      // CREATE
      // ============================

      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;

        state.projects.push(action.payload);
      })

      .addCase(createProject.rejected, (state) => {
        state.isCreating = false;
      })

      // ============================
      // UPDATE
      // ============================

      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;

        state.projects = state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project,
        );
      })

      .addCase(updateProject.rejected, (state) => {
        state.isUpdating = false;
      })

      // ============================
      // DELETE
      // ============================

      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true;
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;

        state.projects = state.projects.filter(
          (project) => project.id !== action.payload,
        );
      })

      .addCase(deleteProject.rejected, (state) => {
        state.isDeleting = false;
      });
  },
});

export default projectsSlice.reducer;
