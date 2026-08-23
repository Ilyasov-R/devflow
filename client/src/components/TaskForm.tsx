import { useState } from "react";

import { useAppDispatch } from "../app/hooks";

import { createTask } from "../features/tasks/tasksSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import styles from "./TaskForm.module.css";

interface TaskFormProps {
  projectId: number;
  initialStatus?: string;
  onCancel?: () => void;
}

const TaskForm = ({
  projectId,
  initialStatus = "todo",
  onCancel,
}: TaskFormProps) => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState(initialStatus);

  const [priority, setPriority] =
    useState("medium");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      dispatch(
        showError(
          "Введите название задачи",
        ),
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        createTask({
          projectId,
          title: title.trim(),
          description:
            description.trim(),
          status,
          priority,
        }),
      ).unwrap();

      dispatch(
        showSuccess(
          "Задача успешно создана",
        ),
      );

      setTitle("");
      setDescription("");
      setStatus(initialStatus);
      setPriority("medium");

      onCancel?.();
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось создать задачу",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.title}>
            Создать задачу
          </h2>

          <p className={styles.subtitle}>
            Добавьте задачу в текущий проект
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Закрыть"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="task-title"
          >
            Название задачи
          </label>

          <input
            id="task-title"
            className={styles.input}
            type="text"
            placeholder="Например: Создать авторизацию"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="task-description"
          >
            Описание
          </label>

          <textarea
            id="task-description"
            className={styles.textarea}
            placeholder="Кратко опишите, что нужно сделать"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="task-status"
            >
              Статус
            </label>

            <select
              id="task-status"
              className={styles.select}
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              disabled={isSubmitting}
            >
              <option value="todo">
                К выполнению
              </option>

              <option value="in-progress">
                В процессе
              </option>

              <option value="completed">
                Выполнено
              </option>
            </select>
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="task-priority"
            >
              Приоритет
            </label>

            <select
              id="task-priority"
              className={styles.select}
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value,
                )
              }
              disabled={isSubmitting}
            >
              <option value="low">
                Низкий
              </option>

              <option value="medium">
                Средний
              </option>

              <option value="high">
                Высокий
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
        )}

        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Создание..."
            : "Создать задачу"}
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
