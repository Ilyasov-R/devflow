import { useState } from "react";

import { useAppDispatch } from "../app/hooks";

import { updateTask } from "../features/tasks/tasksSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import type { Task } from "../features/tasks/types";

import styles from "./KanbanBoard.module.css";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onAdd: () => void;
}

type TaskStatus = "todo" | "in-progress" | "completed";

interface Column {
  id: TaskStatus;
  title: string;
}

const columns: Column[] = [
  {
    id: "todo",
    title: "К выполнению",
  },
  {
    id: "in-progress",
    title: "В процессе",
  },
  {
    id: "completed",
    title: "Выполнено",
  },
];

const KanbanBoard = ({
  tasks,
  onEdit,
  onDelete,
  onAdd,
}: KanbanBoardProps) => {
  const dispatch = useAppDispatch();

  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(
    null,
  );

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    taskId: number,
  ) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(taskId));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLElement>,
    columnId: TaskStatus,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverColumn(columnId);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (event.currentTarget === event.target) {
      setDragOverColumn(null);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "К выполнению";

      case "in-progress":
        return "В процессе";

      case "completed":
        return "Выполнено";

      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "Низкий";

      case "medium":
        return "Средний";

      case "high":
        return "Высокий";

      default:
        return priority;
    }
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLElement>,
    newStatus: TaskStatus,
  ) => {
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData("text/plain"));

    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      handleDragEnd();
      return;
    }

    if (task.status === newStatus) {
      handleDragEnd();
      return;
    }

    try {
      await dispatch(
        updateTask({
          id: task.id,
          title: task.title,
          description: task.description || "",
          status: newStatus,
          priority: task.priority,
        }),
      ).unwrap();

      dispatch(
        showSuccess(
          `Задача «${task.title}» перемещена в «${getStatusLabel(
            newStatus,
          )}»`,
        ),
      );
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось изменить статус задачи",
        ),
      );
    }

    handleDragEnd();
  };

  return (
    <div className={styles.board}>
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.id,
        );

        const isDragOver = dragOverColumn === column.id;

        return (
          <section
            key={column.id}
            className={`${styles.column} ${
              isDragOver ? styles.columnDragOver : ""
            }`}
            onDragOver={(event) => handleDragOver(event, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, column.id)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <h3>{column.title}</h3>

                <span className={styles.columnSubtitle}>
                  {columnTasks.length}{" "}
                  {columnTasks.length === 1 ? "задача" : "задач"}
                </span>
              </div>

              <span className={styles.count}>
                {columnTasks.length}
              </span>
            </div>

            <div className={styles.tasks}>
              {columnTasks.map((task) => {
                const isDragging = draggedTaskId === task.id;

                return (
                  <article
                    key={task.id}
                    className={`${styles.taskCard} ${
                      isDragging ? styles.dragging : ""
                    }`}
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(event, task.id)
                    }
                    onDragEnd={handleDragEnd}
                  >
                    <div className={styles.taskCardHeader}>
                      <h4>{task.title}</h4>
                    </div>

                    <p className={styles.description}>
                      {task.description || "Описание отсутствует"}
                    </p>

                    <div className={styles.taskMeta}>
                      <span
                        className={`${styles.priority} ${
                          styles[`priority${task.priority}`]
                        }`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => onEdit(task)}
                      >
                        Изменить
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => onDelete(task.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                );
              })}

              {columnTasks.length === 0 && (
                <div className={styles.emptyColumn}>
                  Перетащите задачу сюда
                </div>
              )}

              <button
                type="button"
                className={styles.addTaskButton}
                onClick={onAdd}
              >
                <span>+</span>
                Добавить задачу
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
