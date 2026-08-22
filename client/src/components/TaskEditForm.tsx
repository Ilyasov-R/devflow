import { useState } from "react";

import { useAppDispatch } from "../app/hooks";

import { updateTask } from "../features/tasks/tasksSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import type { Task } from "../features/tasks/types";

import styles from "./TaskEditForm.module.css";

interface TaskEditFormProps {
  task: Task;
  onCancel: () => void;
}

const TaskEditForm = ({
  task,
  onCancel,
}: TaskEditFormProps) => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState(
    task.title,
  );

  const [description, setDescription] =
    useState(
      task.description || "",
    );

  const [status, setStatus] = useState(
    task.status,
  );

  const [priority, setPriority] =
    useState(task.priority);

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
        updateTask({
          id: task.id,
          title: title.trim(),
          description:
            description.trim(),
          status,
          priority,
        }),
      ).unwrap();

      dispatch(
        showSuccess(
          "Задача успешно обновлена",
        ),
      );

      onCancel();
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось обновить задачу",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.title}>
        Редактировать задачу
      </h3>

      <input
        className={styles.input}
        type="text"
        placeholder="Название задачи"
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        disabled={isSubmitting}
      />

      <textarea
        className={styles.textarea}
        placeholder="Описание задачи"
        value={description}
        onChange={(event) =>
          setDescription(
            event.target.value,
          )
        }
        disabled={isSubmitting}
      />

      <select
        className={styles.select}
        value={status}
        onChange={(event) =>
          setStatus(event.target.value)
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

      <select
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
          Низкий приоритет
        </option>

        <option value="medium">
          Средний приоритет
        </option>

        <option value="high">
          Высокий приоритет
        </option>
      </select>

      <div className={styles.buttons}>
        <button
          className={styles.button}
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Сохранение..."
            : "Сохранить"}
        </button>

        <button
          className={`${styles.button} ${styles.cancelButton}`}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default TaskEditForm;