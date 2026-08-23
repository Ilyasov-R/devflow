export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  team_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  role?: "owner" | "admin" | "member" | "viewer";
}

export interface CreateProjectData {
  name: string;
  description: string;
  status: string;
}

export interface UpdateProjectData {
  id: number;
  name: string;
  description: string;
  status: string;
}