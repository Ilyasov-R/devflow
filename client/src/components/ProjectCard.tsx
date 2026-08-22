import type { Project } from "../features/projects/types";

import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;

  onEdit: (project: Project) => void;

  onDelete: (id: number) => void;

  onViewTasks: (id: number) => void;
}

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
}: ProjectCardProps) => {
  const getStatusLabel = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return "Активный";

      case "completed":
        return "Завершён";

      case "archived":
        return "Архивный";

      default:
        return status;
    }
  };

  const getStatusClass = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return styles.statusActive;

      case "completed":
        return styles.statusCompleted;

      case "archived":
        return styles.statusArchived;

      default:
        return "";
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            {project.name}
          </h3>

          <span
            className={`${styles.status} ${getStatusClass(
              project.status,
            )}`}
          >
            {getStatusLabel(
              project.status,
            )}
          </span>
        </div>
      </div>

      <p className={styles.description}>
        {project.description ||
          "Описание отсутствует"}
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() =>
            onViewTasks(project.id)
          }
        >
          Задачи
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={() =>
            onEdit(project)
          }
        >
          Редактировать
        </button>

        <button
          type="button"
          className={`${styles.button} ${styles.deleteButton}`}
          onClick={() =>
            onDelete(project.id)
          }
        >
          Удалить
        </button>
      </div>
    </article>
  );
};

export default ProjectCard;