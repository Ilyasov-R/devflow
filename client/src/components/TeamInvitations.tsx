import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  fetchInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../features/teams/invitationSlice";

import type { TeamRole } from "../features/teams/types";

import styles from "./TeamInvitations.module.css";

const TeamInvitations = () => {
  const dispatch = useAppDispatch();

  const {
    invitations,
    loading,
    isAccepting,
    isRejecting,
  } = useAppSelector(
    (state) => state.invitations,
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInvitations());
  }, [dispatch]);

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case "admin":
        return "Администратор";

      case "viewer":
        return "Наблюдатель";

      case "owner":
        return "Владелец";

      default:
        return "Участник";
    }
  };

  const handleAccept = async (
    invitationId: number,
  ) => {
    await dispatch(
      acceptInvitation(invitationId),
    );

    dispatch(fetchInvitations());
  };

  const handleReject = async (
    invitationId: number,
  ) => {
    await dispatch(
      rejectInvitation(invitationId),
    );

    dispatch(fetchInvitations());
  };

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div>
              <strong>Приглашения</strong>

              <span>
                Входящие приглашения в команды
              </span>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            {loading && (
              <div className={styles.empty}>
                Загрузка...
              </div>
            )}

            {!loading &&
              invitations.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    ✓
                  </div>

                  <strong>
                    Новых приглашений нет
                  </strong>

                  <span>
                    Здесь будут отображаться
                    приглашения в команды
                  </span>
                </div>
              )}

            {!loading &&
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className={styles.invitation}
                >
                  <div className={styles.teamIcon}>
                    👥
                  </div>

                  <div className={styles.info}>
                    <strong>
                      {invitation.team_name}
                    </strong>

                    <span>
                      {invitation.inviter_username}
                      {" приглашает вас"}
                    </span>

                    <small>
                      Роль:{" "}
                      {getRoleLabel(
                        invitation.role,
                      )}
                    </small>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.accept}
                      disabled={
                        isAccepting ||
                        isRejecting
                      }
                      onClick={() =>
                        handleAccept(
                          invitation.id,
                        )
                      }
                    >
                      Принять
                    </button>

                    <button
                      type="button"
                      className={styles.reject}
                      disabled={
                        isAccepting ||
                        isRejecting
                      }
                      onClick={() =>
                        handleReject(
                          invitation.id,
                        )
                      }
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.toggleButton}
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        aria-label="Приглашения"
      >
        🔔

        {invitations.length > 0 && (
          <span className={styles.badge}>
            {invitations.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default TeamInvitations;