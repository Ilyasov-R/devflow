import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  createProject,
  updateProject,
} from "../features/projects/projectsSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import type { Project } from "../features/projects/types";

import api from "../api/axios";

import styles from "./ProjectForm.module.css";

interface Team {
  id: number;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
}

interface ProjectFormProps {
  project?: Project | null;
  onCancel: () => void;
}

const ProjectForm = ({ project, onCancel }: ProjectFormProps) => {
  const dispatch = useAppDispatch();

  const { isCreating, isUpdating } = useAppSelector((state) => state.projects);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const isEditing = Boolean(project);

  const isLoading = isCreating || isUpdating || isLoadingTeams;

  // =========================================
  // LOAD PROJECT DATA
  // =========================================

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setStatus(project.status);

      // Если у проекта уже есть команда
      if (project.team_id) {
        setTeamId(String(project.team_id));
      }
    } else {
      setName("");
      setDescription("");
      setStatus("active");
      setTeamId("");
    }
  }, [project]);

  // =========================================
  // LOAD TEAMS
  // =========================================

  useEffect(() => {
    const loadTeams = async () => {
      if (isEditing) {
        return;
      }

      try {
        setIsLoadingTeams(true);

        const response = await api.get<{
          teams: Team[];
        }>("/teams");

        const loadedTeams = response.data.teams;

        setTeams(loadedTeams);

        // Автоматически выбираем первую команду
        if (loadedTeams.length > 0) {
          setTeamId(String(loadedTeams[0].id));
        }
      } catch (error: any) {
        console.error("Load teams error:", error);

        dispatch(
          showError(
            error.response?.data?.message || "Не удалось загрузить команды",
          ),
        );
      } finally {
        setIsLoadingTeams(false);
      }
    };

    loadTeams();
  }, [dispatch, isEditing]);

  // =========================================
  // RESET
  // =========================================

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setTeamId("");
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async () => {
    if (!name.trim()) {
      dispatch(showError("Введите название проекта"));

      return;
    }

    // При создании обязательно нужна команда
    if (!isEditing && !teamId) {
      dispatch(showError("Выберите команду для проекта"));

      return;
    }

    try {
      // =====================================
      // UPDATE
      // =====================================

      if (project) {
        await dispatch(
          updateProject({
            id: project.id,
            name: name.trim(),
            description: description.trim(),
            status,
          }),
        ).unwrap();

        dispatch(showSuccess("Проект успешно обновлён"));
      }

      // =====================================
      // CREATE
      // =====================================
      else {
        await dispatch(
          createProject({
            name: name.trim(),
            description: description.trim(),
            status,
          }),
        ).unwrap();

        dispatch(showSuccess("Проект успешно создан"));
      }

      resetForm();
      onCancel();
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : isEditing
              ? "Не удалось обновить проект"
              : "Не удалось создать проект",
        ),
      );
    }
  };

  // =========================================
  // CANCEL
  // =========================================

  const handleCancel = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    onCancel();
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className={styles.wrapper}>
      <div className={styles.form}>
        <div className={styles.formHeader}>
          <div>
            <h2 className={styles.title}>
              {isEditing ? "Редактировать проект" : "Новый проект"}
            </h2>

            <p className={styles.subtitle}>
              {isEditing
                ? "Измените данные проекта"
                : "Создайте новый проект для работы"}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            disabled={isLoading}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={styles.fields}>
          <input
            className={styles.input}
            type="text"
            placeholder="Название проекта"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
            autoFocus
          />

          <textarea
            className={styles.textarea}
            placeholder="Описание проекта"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isLoading}
            rows={3}
          />

          {/* TEAM */}

          {!isEditing && (
            <select
              className={styles.select}
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              disabled={isLoading || teams.length === 0}
            >
              {teams.length === 0 ? (
                <option value="">Нет доступных команд</option>
              ) : (
                <>
                  <option value="">Выберите команду</option>

                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.role})
                    </option>
                  ))}
                </>
              )}
            </select>
          )}

          <select
            className={styles.select}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={isLoading}
          >
            <option value="active">Активный</option>

            <option value="completed">Завершён</option>

            <option value="archived">Архивный</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Отмена
          </button>

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading || (!isEditing && !teamId)}
          >
            {isLoading
              ? "Сохранение..."
              : isEditing
                ? "Сохранить изменения"
                : "Создать проект"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
