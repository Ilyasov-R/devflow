export type TeamRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

export interface TeamMember {
  id: number;
  username: string;
  email: string;
  role: TeamRole;
  created_at: string;
  isOnline?: boolean;
}

export interface Team {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  role: TeamRole;
  members?: TeamMember[];
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  team_name: string;
  role: TeamRole;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  inviter_username: string;
  inviter_email: string;
}