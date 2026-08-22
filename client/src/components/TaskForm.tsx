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
}

const TaskForm = ({
  projectId,
}: TaskFormProps) => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [status, setStatus] =
    useState("todo");
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
      setStatus("todo");
      setPriority("medium");
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
      <h2 className={styles.title}>
        Создать задачу
      </h2>

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
          setPriority(event.target.value)
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

      <button
        className={styles.button}
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Создание..."
          : "Создать задачу"}
      </button>
    </div>
  );
};

export default TaskForm;
