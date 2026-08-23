import express from "express";

import {
  getMyTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMemberRole,
  removeMember,
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  getMyInvitations,
} from "../controllers/teamController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  requireTeamMember,
  requireTeamRoles,
} from "../middleware/teamMiddleware.js";

const router = express.Router();

// =========================================
// MY TEAMS
// =========================================

router.get("/", authMiddleware, getMyTeams);

// =========================================
// CREATE TEAM
// =========================================

router.post("/", authMiddleware, createTeam);

// =========================================
// GET TEAM
// =========================================

router.get("/:teamId", authMiddleware, requireTeamMember, getTeamById);

// =========================================
// UPDATE TEAM
// OWNER / ADMIN
// =========================================

router.put(
  "/:teamId",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner", "admin"),
  updateTeam,
);

// =========================================
// DELETE TEAM
// OWNER ONLY
// =========================================

router.delete(
  "/:teamId",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner"),
  deleteTeam,
);

// =========================================
// ADD MEMBER
// OWNER / ADMIN
// =========================================

router.post(
  "/:teamId/members",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner", "admin"),
  addMember,
);

// =========================================
// UPDATE MEMBER ROLE
// OWNER / ADMIN
// =========================================

router.put(
  "/:teamId/members/:userId",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner", "admin"),
  updateMemberRole,
);

// =========================================
// REMOVE MEMBER
// OWNER / ADMIN
// =========================================

router.delete(
  "/:teamId/members/:userId",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner", "admin"),
  removeMember,
);

// =========================================
// INVITE MEMBER
// OWNER / ADMIN
// =========================================

router.post(
  "/:teamId/invitations",
  authMiddleware,
  requireTeamMember,
  requireTeamRoles("owner", "admin"),
  inviteMember,
);

// =========================================
// GET MY INVITATIONS
// =========================================

router.get("/invitations", authMiddleware, getMyInvitations);

// =========================================
// ACCEPT INVITATION
// =========================================

router.post(
  "/invitations/:invitationId/accept",
  authMiddleware,
  acceptInvitation,
);

// =========================================
// REJECT INVITATION
// =========================================

router.post(
  "/invitations/:invitationId/reject",
  authMiddleware,
  rejectInvitation,
);

// =========================================
// MY INVITATIONS
// =========================================

router.get("/invitations", authMiddleware, getMyInvitations);

// =========================================
// ACCEPT INVITATION
// =========================================

router.post(
  "/invitations/:invitationId/accept",
  authMiddleware,
  acceptInvitation,
);

// =========================================
// REJECT INVITATION
// =========================================

router.post(
  "/invitations/:invitationId/reject",
  authMiddleware,
  rejectInvitation,
);

export default router;
