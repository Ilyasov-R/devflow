import { useEffect, useState } from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../app/hooks";

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

  const {
    isCreating,
    isUpdating,
  } = useAppSelector(
    (state) => state.projects,
  );

  const [isOpen, setIsOpen] = useState(false);

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

      setIsOpen(true);
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

      setIsOpen(false);

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

  const handleCancel = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setName("");
    setDescription("");
    setStatus("active");

    setIsOpen(false);

    onCancel();
  };

  const isLoading =
    isCreating || isUpdating;

  return (
    <div className={styles.wrapper}>
      {!isOpen && !isEditing ? (
        <button
          type="button"
          className={styles.openButton}
          onClick={() => setIsOpen(true)}
        >
          <span className={styles.plus}>
            +
          </span>

          Создать проект
        </button>
      ) : (
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <div>
              <h2 className={styles.title}>
                {isEditing
                  ? "Редактировать проект"
                  : "Новый проект"}
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
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              disabled={isLoading}
              autoFocus
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
              rows={3}
            />

            <select
              className={styles.select}
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
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
              disabled={isLoading}
            >
              {isLoading
                ? "Сохранение..."
                : isEditing
                  ? "Сохранить изменения"
                  : "Создать проект"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectForm;