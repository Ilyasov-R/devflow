import { useEffect, useState } from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../app/hooks";

import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import TaskForm from "../components/TaskForm";
import TaskEditForm from "../components/TaskEditForm";
import ConfirmModal from "../components/ConfirmModal";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

import {
  deleteTask,
  fetchTasks,
} from "../features/tasks/tasksSlice";

import {
  deleteProject,
  fetchProjects,
} from "../features/projects/projectsSlice";

import {
  showSuccess,
  showError,
} from "../features/notifications/notificationsSlice";

import type { Project } from "../features/projects/types";
import type { Task } from "../features/tasks/types";

import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const dispatch = useAppDispatch();

  // =========================
  // AUTH
  // =========================

  const { user } = useAppSelector(
    (state) => state.auth,
  );

  // =========================
  // PROJECTS
  // =========================

  const {
    projects,
    loading: projectsLoading,
    isDeleting: isDeletingProject,
  } = useAppSelector(
    (state) => state.projects,
  );

  // =========================
  // TASKS
  // =========================

  const {
    tasks,
    isFetching: tasksLoading,
    isDeleting: isDeletingTask,
  } = useAppSelector(
    (state) => state.tasks,
  );

  // =========================
  // LOCAL STATE
  // =========================

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [deleteTaskId, setDeleteTaskId] =
    useState<number | null>(null);

  const [deleteProjectId, setDeleteProjectId] =
    useState<number | null>(null);

  // =========================
  // FETCH PROJECTS
  // =========================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await dispatch(
          fetchProjects(),
        ).unwrap();
      } catch (error) {
        dispatch(
          showError(
            typeof error === "string"
              ? error
              : "Не удалось загрузить проекты",
          ),
        );
      }
    };

    loadProjects();
  }, [dispatch]);

  // =========================
  // VIEW TASKS
  // =========================

  const handleViewTasks = async (
    projectId: number,
  ) => {
    setSelectedProjectId(projectId);
    setEditingTask(null);

    try {
      await dispatch(
        fetchTasks(projectId),
      ).unwrap();
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось загрузить задачи",
        ),
      );
    }
  };

  // =========================
  // SELECTED PROJECT
  // =========================

  const selectedProject = projects.find(
    (project) =>
      project.id === selectedProjectId,
  );

  // =========================
  // PROJECT TO DELETE
  // =========================

  const projectToDelete = projects.find(
    (project) =>
      project.id === deleteProjectId,
  );

  // =========================
  // STATUS
  // =========================

  const getStatusClass = (
    status: string,
  ) => {
    switch (status) {
      case "todo":
        return styles.statusTodo;

      case "in-progress":
        return styles.statusProgress;

      case "completed":
        return styles.statusCompleted;

      default:
        return "";
    }
  };

  const getStatusLabel = (
    status: string,
  ) => {
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

  // =========================
  // PRIORITY
  // =========================

  const getPriorityClass = (
    priority: string,
  ) => {
    switch (priority) {
      case "low":
        return styles.priorityLow;

      case "medium":
        return styles.priorityMedium;

      case "high":
        return styles.priorityHigh;

      default:
        return "";
    }
  };

  const getPriorityLabel = (
    priority: string,
  ) => {
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

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async () => {
    if (deleteTaskId === null) {
      return;
    }

    try {
      await dispatch(
        deleteTask(deleteTaskId),
      ).unwrap();

      dispatch(
        showSuccess(
          "Задача успешно удалена",
        ),
      );

      setDeleteTaskId(null);
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось удалить задачу",
        ),
      );
    }
  };

  // =========================
  // DELETE PROJECT
  // =========================

  const handleDeleteProject = async () => {
    if (deleteProjectId === null) {
      return;
    }

    try {
      await dispatch(
        deleteProject(deleteProjectId),
      ).unwrap();

      dispatch(
        showSuccess(
          "Проект успешно удалён",
        ),
      );

      if (
        selectedProjectId ===
        deleteProjectId
      ) {
        setSelectedProjectId(null);
      }

      setDeleteProjectId(null);
    } catch (error) {
      dispatch(
        showError(
          typeof error === "string"
            ? error
            : "Не удалось удалить проект",
        ),
      );
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* HEADER */}

        <header className={styles.header}>
          <h1>
            Панель управления
          </h1>

          <p>
            Добро пожаловать,{" "}
            {user?.username}!
          </p>

          <p>
            Ваша рабочая панель DevFlow.
          </p>
        </header>

        {/* PROJECT FORM */}

        <section
          className={styles.section}
        >
          <ProjectForm
            project={editingProject}
            onCancel={() =>
              setEditingProject(null)
            }
          />
        </section>

        {/* PROJECTS */}

        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <h2>Проекты</h2>
          </div>

          {projectsLoading && (
            <Loader
              size="medium"
              text="Загрузка проектов..."
            />
          )}

          {!projectsLoading &&
            projects.length === 0 && (
              <EmptyState
                title="Проектов пока нет"
                description="Создайте свой первый проект, чтобы начать работу."
              />
            )}

          {!projectsLoading && (
            <div
              className={
                styles.projectsGrid
              }
            >
              {projects.map(
                (project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={(project) =>
                      setEditingProject(
                        project,
                      )
                    }
                    onDelete={(id) =>
                      setDeleteProjectId(
                        id,
                      )
                    }
                    onViewTasks={
                      handleViewTasks
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* TASKS */}

        {selectedProjectId !== null && (
          <section
            className={styles.section}
          >
            <div
              className={
                styles.sectionTitle
              }
            >
              <h2>
                Задачи

                {selectedProject && (
                  <>
                    {" "}
                    —{" "}
                    {
                      selectedProject.name
                    }
                  </>
                )}
              </h2>
            </div>

            {/* CREATE TASK */}

            <TaskForm
              projectId={
                selectedProjectId
              }
            />

            {/* LOADING */}

            {tasksLoading && (
              <Loader
                size="medium"
                text="Загрузка задач..."
              />
            )}

            {/* EMPTY */}

            {!tasksLoading &&
              tasks.length === 0 && (
                <EmptyState
                  title="Задач пока нет"
                  description="Создайте первую задачу для этого проекта."
                />
              )}

            {/* TASKS LIST */}

            {!tasksLoading &&
              tasks.length > 0 && (
                <div
                  className={
                    styles.tasksList
                  }
                >
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={
                        styles.taskCard
                      }
                    >
                      {editingTask?.id ===
                      task.id ? (
                        <TaskEditForm
                          task={task}
                          onCancel={() =>
                            setEditingTask(
                              null,
                            )
                          }
                        />
                      ) : (
                        <>
                          {/* TASK HEADER */}

                          <div
                            className={
                              styles.taskHeader
                            }
                          >
                            <h3>
                              {task.title}
                            </h3>

                            <div
                              className={
                                styles.badges
                              }
                            >
                              <span
                                className={`${styles.badge} ${getStatusClass(
                                  task.status,
                                )}`}
                              >
                                {getStatusLabel(
                                  task.status,
                                )}
                              </span>

                              <span
                                className={`${styles.badge} ${getPriorityClass(
                                  task.priority,
                                )}`}
                              >
                                {getPriorityLabel(
                                  task.priority,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* DESCRIPTION */}

                          <p
                            className={
                              styles.taskDescription
                            }
                          >
                            {task.description ||
                              "Описание отсутствует"}
                          </p>

                          {/* ACTIONS */}

                          <div
                            className={
                              styles.taskActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.button
                              }
                              onClick={() =>
                                setEditingTask(
                                  task,
                                )
                              }
                              disabled={
                                isDeletingTask
                              }
                            >
                              Редактировать
                            </button>

                            <button
                              type="button"
                              className={`${styles.button} ${styles.deleteButton}`}
                              disabled={
                                isDeletingTask
                              }
                              onClick={() =>
                                setDeleteTaskId(
                                  task.id,
                                )
                              }
                            >
                              {isDeletingTask
                                ? "Удаление..."
                                : "Удалить"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </section>
        )}

        {/* DELETE TASK MODAL */}

        {deleteTaskId !== null && (
          <ConfirmModal
            title="Удалить задачу?"
            message="Это действие нельзя отменить. Вы действительно хотите удалить эту задачу?"
            onCancel={() =>
              setDeleteTaskId(null)
            }
            onConfirm={handleDeleteTask}
            loading={isDeletingTask}
          />
        )}

        {/* DELETE PROJECT MODAL */}

        {deleteProjectId !== null && (
          <ConfirmModal
            title="Удалить проект?"
            message={
              projectToDelete
                ? `Вы действительно хотите удалить проект «${projectToDelete.name}»?`
                : "Вы действительно хотите удалить этот проект?"
            }
            onCancel={() =>
              setDeleteProjectId(null)
            }
            onConfirm={
              handleDeleteProject
            }
            loading={
              isDeletingProject
            }
          />
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
