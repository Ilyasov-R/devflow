export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}

export interface UpdateTaskData {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}