import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  fetchTeam,
  inviteMember,
} from "../features/teams/teamSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import type { TeamRole } from "../features/teams/types";

import styles from "./TeamMembers.module.css";

interface TeamMembersProps {
  teamId: number;
}

const TeamMembers = ({ teamId }: TeamMembersProps) => {
  const dispatch = useAppDispatch();

  const {
    members,
    currentTeam,
    loading,
    isAddingMember,
  } = useAppSelector((state) => state.teams);

  const [isOpen, setIsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<Exclude<TeamRole, "owner">>("member");

  useEffect(() => {
    dispatch(fetchTeam(teamId));
  }, [dispatch, teamId]);

  const onlineMembers = members.filter(
    (member) => member.isOnline,
  ).length;

  const currentUserRole = currentTeam?.role;

  const canInvite =
    currentUserRole === "owner" ||
    currentUserRole === "admin";

  const getRoleLabel = (memberRole: string) => {
    switch (memberRole) {
      case "owner":
        return "Владелец";

      case "admin":
        return "Администратор";

      case "viewer":
        return "Наблюдатель";

      default:
        return "Участник";
    }
  };

  const handleInvite = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      dispatch(
        showError("Введите email пользователя"),
      );

      return;
    }

    try {
      await dispatch(
        inviteMember({
          teamId,
          email: trimmedEmail,
          role,
        }),
      ).unwrap();

      dispatch(
        showSuccess(
          "Приглашение успешно отправлено",
        ),
      );

      setEmail("");
      setRole("member");
      setIsInviteOpen(false);
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось отправить приглашение",
        ),
      );
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);

    if (isOpen) {
      setIsInviteOpen(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.panel}>
          {/* HEADER */}

          <div className={styles.header}>
            <div className={styles.teamIcon}>
              👥
            </div>

            <div className={styles.teamInfo}>
              <strong>
                {currentTeam?.name || "Команда"}
              </strong>

              <span>
                {members.length}{" "}
                {members.length === 1
                  ? "участник"
                  : "участников"}{" "}
                · {onlineMembers} онлайн
              </span>
            </div>

            {canInvite && (
              <button
                type="button"
                className={styles.inviteButton}
                onClick={() =>
                  setIsInviteOpen((prev) => !prev)
                }
                title="Пригласить участника"
              >
                +
              </button>
            )}
          </div>

          {/* INVITE */}

          {isInviteOpen && canInvite && (
            <div className={styles.inviteForm}>
              <div className={styles.inviteTitle}>
                Пригласить участника
              </div>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Email пользователя"
                className={styles.input}
                disabled={isAddingMember}
              />

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as Exclude<
                      TeamRole,
                      "owner"
                    >,
                  )
                }
                className={styles.select}
                disabled={isAddingMember}
              >
                <option value="member">
                  Участник
                </option>

                <option value="admin">
                  Администратор
                </option>

                <option value="viewer">
                  Наблюдатель
                </option>
              </select>

              <div className={styles.inviteActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsInviteOpen(false);
                    setEmail("");
                  }}
                  disabled={isAddingMember}
                >
                  Отмена
                </button>

                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleInvite}
                  disabled={
                    isAddingMember ||
                    !email.trim()
                  }
                >
                  {isAddingMember
                    ? "Отправка..."
                    : "Пригласить"}
                </button>
              </div>
            </div>
          )}

          {/* MEMBERS HEADER */}

          <div className={styles.membersHeader}>
            <span>Участники</span>

            <span className={styles.onlineCount}>
              ● {onlineMembers} онлайн
            </span>
          </div>

          {/* MEMBERS */}

          <div className={styles.members}>
            {loading && (
              <div className={styles.loading}>
                Загрузка...
              </div>
            )}

            {!loading &&
              members.length === 0 && (
                <div className={styles.empty}>
                  Участников нет
                </div>
              )}

            {!loading &&
              members.map((member) => (
                <div
                  key={member.id}
                  className={styles.member}
                >
                  <div className={styles.avatar}>
                    {member.username
                      .charAt(0)
                      .toUpperCase()}

                    <span
                      className={`${styles.status} ${
                        member.isOnline
                          ? styles.online
                          : styles.offline
                      }`}
                    />
                  </div>

                  <div className={styles.memberInfo}>
                    <strong>
                      {member.username}
                    </strong>

                    <span>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>

                  <span
                    className={`${styles.onlineText} ${
                      member.isOnline
                        ? styles.onlineTextActive
                        : ""
                    }`}
                  >
                    {member.isOnline
                      ? "онлайн"
                      : "офлайн"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}

      <button
        type="button"
        className={`${styles.toggleButton} ${
          isOpen
            ? styles.toggleButtonOpen
            : ""
        }`}
        onClick={handleToggle}
        aria-label={
          isOpen
            ? "Закрыть команду"
            : "Открыть команду"
        }
      >
        {isOpen ? "×" : "👥"}

        {!isOpen && onlineMembers > 0 && (
          <span className={styles.onlineBadge}>
            {onlineMembers}
          </span>
        )}
      </button>
    </div>
  );
};

export default TeamMembers;