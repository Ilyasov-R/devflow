import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
} from "./types";

interface TasksState {
  tasks: Task[];

  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: TasksState = {
  tasks: [],

  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

// ====================
// FETCH TASKS
// ====================

export const fetchTasks = createAsyncThunk<
  Task[],
  number,
  { rejectValue: string }
>(
  "tasks/fetchTasks",
  async (
    projectId,
    { rejectWithValue },
  ) => {
    try {
      const response =
        await api.get<{
          tasks: Task[];
        }>(
          `/projects/${projectId}/tasks`,
        );

      return response.data.tasks;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Не удалось загрузить задачи",
      );
    }
  },
);

// ====================
// CREATE TASK
// ====================

export const createTask = createAsyncThunk<
  Task,
  CreateTaskData,
  { rejectValue: string }
>(
  "tasks/createTask",
  async (
    taskData,
    { rejectWithValue },
  ) => {
    try {
      const {
        projectId,
        ...data
      } = taskData;

      const response =
        await api.post<{
          task: Task;
        }>(
          `/projects/${projectId}/tasks`,
          data,
        );

      return response.data.task;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Не удалось создать задачу",
      );
    }
  },
);

// ====================
// UPDATE TASK
// ====================

export const updateTask = createAsyncThunk<
  Task,
  UpdateTaskData,
  { rejectValue: string }
>(
  "tasks/updateTask",
  async (
    taskData,
    { rejectWithValue },
  ) => {
    try {
      const {
        id,
        ...data
      } = taskData;

      const response =
        await api.put<{
          task: Task;
        }>(
          `/tasks/${id}`,
          data,
        );

      return response.data.task;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Не удалось обновить задачу",
      );
    }
  },
);

// ====================
// DELETE TASK
// ====================

export const deleteTask = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "tasks/deleteTask",
  async (
    taskId,
    { rejectWithValue },
  ) => {
    try {
      await api.delete(
        `/tasks/${taskId}`,
      );

      return taskId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Не удалось удалить задачу",
      );
    }
  },
);

// ====================
// SLICE
// ====================

const tasksSlice = createSlice({
  name: "tasks",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ====================
      // FETCH
      // ====================

      .addCase(
        fetchTasks.pending,
        (state) => {
          state.isFetching = true;
        },
      )

      .addCase(
        fetchTasks.fulfilled,
        (state, action) => {
          state.isFetching = false;

          state.tasks =
            action.payload;
        },
      )

      .addCase(
        fetchTasks.rejected,
        (state) => {
          state.isFetching = false;
        },
      )

      // ====================
      // CREATE
      // ====================

      .addCase(
        createTask.pending,
        (state) => {
          state.isCreating = true;
        },
      )

      .addCase(
        createTask.fulfilled,
        (state, action) => {
          state.isCreating = false;

          state.tasks.push(
            action.payload,
          );
        },
      )

      .addCase(
        createTask.rejected,
        (state) => {
          state.isCreating = false;
        },
      )

      // ====================
      // UPDATE
      // ====================

      .addCase(
        updateTask.pending,
        (state) => {
          state.isUpdating = true;
        },
      )

      .addCase(
        updateTask.fulfilled,
        (state, action) => {
          state.isUpdating = false;

          state.tasks =
            state.tasks.map(
              (task) =>
                task.id ===
                action.payload.id
                  ? action.payload
                  : task,
            );
        },
      )

      .addCase(
        updateTask.rejected,
        (state) => {
          state.isUpdating = false;
        },
      )

      // ====================
      // DELETE
      // ====================

      .addCase(
        deleteTask.pending,
        (state) => {
          state.isDeleting = true;
        },
      )

      .addCase(
        deleteTask.fulfilled,
        (state, action) => {
          state.isDeleting = false;

          state.tasks =
            state.tasks.filter(
              (task) =>
                task.id !==
                action.payload,
            );
        },
      )

      .addCase(
        deleteTask.rejected,
        (state) => {
          state.isDeleting = false;
        },
      );
  },
});

export default tasksSlice.reducer;