export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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