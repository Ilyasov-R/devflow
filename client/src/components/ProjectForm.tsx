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

import styles from "./ProjectForm.module.css";

interface ProjectFormProps {
  project?: Project | null;
  onCancel: () => void;
}

const ProjectForm = ({
  project,
  onCancel,
}: ProjectFormProps) => {
  const dispatch = useAppDispatch();

  const { isCreating, isUpdating } =
    useAppSelector(
      (state) => state.projects,
    );

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [status, setStatus] =
    useState("active");

  const isEditing = Boolean(project);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(
        project.description || "",
      );
      setStatus(project.status);
    } else {
      setName("");
      setDescription("");
      setStatus("active");
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      dispatch(
        showError(
          "Введите название проекта",
        ),
      );

      return;
    }

    try {
      if (project) {
        await dispatch(
          updateProject({
            id: project.id,
            name: name.trim(),
            description:
              description.trim(),
            status,
          }),
        ).unwrap();

        dispatch(
          showSuccess(
            "Проект успешно обновлён",
          ),
        );
      } else {
        await dispatch(
          createProject({
            name: name.trim(),
            description:
              description.trim(),
            status,
          }),
        ).unwrap();

        dispatch(
          showSuccess(
            "Проект успешно создан",
          ),
        );
      }

      setName("");
      setDescription("");
      setStatus("active");

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

  const isLoading =
    isCreating || isUpdating;

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>
        {isEditing
          ? "Редактировать проект"
          : "Создать проект"}
      </h2>

      <input
        className={styles.input}
        type="text"
        placeholder="Название проекта"
        value={name}
        onChange={(event) =>
          setName(event.target.value)
        }
        disabled={isLoading}
      />

      <textarea
        className={styles.textarea}
        placeholder="Описание проекта"
        value={description}
        onChange={(event) =>
          setDescription(
            event.target.value,
          )
        }
        disabled={isLoading}
      />

      <select
        className={styles.select}
        value={status}
        onChange={(event) =>
          setStatus(event.target.value)
        }
        disabled={isLoading}
      >
        <option value="active">
          Активный
        </option>

        <option value="completed">
          Завершён
        </option>

        <option value="archived">
          Архивный
        </option>
      </select>

      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? "Сохранение..."
            : isEditing
              ? "Сохранить изменения"
              : "Создать проект"}
        </button>

        {isEditing && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectForm;