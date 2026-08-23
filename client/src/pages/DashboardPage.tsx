import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import ProjectForm from "../components/ProjectForm";
import TaskForm from "../components/TaskForm";
import TaskEditForm from "../components/TaskEditForm";
import ConfirmModal from "../components/ConfirmModal";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import KanbanBoard from "../components/KanbanBoard";
import TeamMembers from "../components/TeamMembers";

import { deleteTask, fetchTasks } from "../features/tasks/tasksSlice";

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
import TeamInvitations from "../components/TeamInvitations";

const DashboardPage = () => {
  const dispatch = useAppDispatch();

  // =========================
  // AUTH
  // =========================

  const { user } = useAppSelector((state) => state.auth);

  // =========================
  // PROJECTS
  // =========================

  const {
    projects,
    loading: projectsLoading,
    isDeleting: isDeletingProject,
  } = useAppSelector((state) => state.projects);

  // =========================
  // TASKS
  // =========================

  const {
    tasks,
    isFetching: tasksLoading,
    isDeleting: isDeletingTask,
  } = useAppSelector((state) => state.tasks);

  // =========================
  // LOCAL STATE
  // =========================

  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [isProjectFormOpen, setIsProjectFormOpen] =
    useState(false);

  const [isTaskFormOpen, setIsTaskFormOpen] =
    useState(false);

  const [deleteTaskId, setDeleteTaskId] =
    useState<number | null>(null);

  const [deleteProjectId, setDeleteProjectId] =
    useState<number | null>(null);

  const [viewMode, setViewMode] =
    useState<"list" | "kanban">("list");

  // =========================
  // FETCH PROJECTS
  // =========================

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // =========================
  // SELECT FIRST PROJECT
  // =========================

  useEffect(() => {
    if (
      selectedProjectId === null &&
      projects.length > 0
    ) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // =========================
  // CHECK SELECTED PROJECT
  // =========================

  useEffect(() => {
    if (
      selectedProjectId !== null &&
      !projects.some(
        (project) => project.id === selectedProjectId,
      )
    ) {
      setSelectedProjectId(
        projects.length > 0
          ? projects[0].id
          : null,
      );
    }
  }, [projects, selectedProjectId]);

  // =========================
  // FETCH TASKS
  // =========================

  useEffect(() => {
    if (selectedProjectId !== null) {
      dispatch(fetchTasks(selectedProjectId));
    }
  }, [dispatch, selectedProjectId]);

  // =========================
  // SELECT PROJECT
  // =========================

  const handleSelectProject = (
    projectId: number,
  ) => {
    setSelectedProjectId(projectId);
    setEditingTask(null);
    setViewMode("list");
    setIsTaskFormOpen(false);
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
  // PROJECT STATUS
  // =========================

  const getProjectStatusLabel = (
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

  const getProjectStatusClass = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return styles.projectStatusActive;

      case "completed":
        return styles.projectStatusCompleted;

      case "archived":
        return styles.projectStatusArchived;

      default:
        return "";
    }
  };

  // =========================
  // TASK STATUS
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
        const remainingProjects =
          projects.filter(
            (project) =>
              project.id !==
              deleteProjectId,
          );

        setSelectedProjectId(
          remainingProjects.length > 0
            ? remainingProjects[0].id
            : null,
        );

        setEditingTask(null);
        setIsTaskFormOpen(false);
      }

      setDeleteProjectId(null);
      setEditingProject(null);
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
  // PROJECT FORM CLOSE
  // =========================

  const handleCloseProjectForm = () => {
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  // =========================
  // TASK FORM CLOSE
  // =========================

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <>
      <main className={styles.page}>
        <div className={styles.layout}>
          {/* =========================
              SIDEBAR
          ========================= */}

          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div>
                <span
                  className={
                    styles.sidebarLabel
                  }
                >
                  Проекты
                </span>

                <h2
                  className={
                    styles.sidebarTitle
                  }
                >
                  Ваши проекты
                </h2>
              </div>
            </div>

            {/* CREATE PROJECT */}

            <button
              type="button"
              className={
                styles.createProjectButton
              }
              onClick={() => {
                setEditingProject(null);
                setIsProjectFormOpen(true);
              }}
            >
              <span>+</span>
              Создать проект
            </button>

            {/* PROJECT LIST */}

            <div
              className={
                styles.projectList
              }
            >
              {projectsLoading && (
                <Loader
                  size="small"
                  text="Загрузка..."
                />
              )}

              {!projectsLoading &&
                projects.length === 0 && (
                  <div
                    className={
                      styles.sidebarEmpty
                    }
                  >
                    <span>
                      Нет проектов
                    </span>

                    <small>
                      Создайте первый проект
                    </small>
                  </div>
                )}

              {!projectsLoading &&
                projects.map(
                  (project) => (
                    <div
                      key={project.id}
                      className={`
                        ${styles.projectItem}
                        ${
                          selectedProjectId ===
                          project.id
                            ? styles.projectItemActive
                            : ""
                        }
                      `}
                    >
                      <button
                        type="button"
                        className={
                          styles.projectSelect
                        }
                        onClick={() =>
                          handleSelectProject(
                            project.id,
                          )
                        }
                      >
                        <span
                          className={
                            styles.projectDot
                          }
                        />

                        <span
                          className={
                            styles.projectName
                          }
                        >
                          {project.name}
                        </span>
                      </button>

                      {/* PROJECT ACTIONS */}

                      <div
                        className={
                          styles.projectActions
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.projectAction
                          }
                          onClick={() => {
                            setEditingProject(
                              project,
                            );

                            setIsProjectFormOpen(
                              true,
                            );
                          }}
                          aria-label="Редактировать проект"
                          title="Редактировать"
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className={`
                            ${styles.projectAction}
                            ${styles.projectDelete}
                          `}
                          onClick={() =>
                            setDeleteProjectId(
                              project.id,
                            )
                          }
                          disabled={
                            isDeletingProject
                          }
                          aria-label="Удалить проект"
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ),
                )}
            </div>

            {/* USER */}

            <div
              className={
                styles.sidebarUser
              }
            >
              <div
                className={
                  styles.userAvatar
                }
              >
                {user?.username
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {user?.username ||
                    "Пользователь"}
                </strong>

                <span>
                  Рабочее пространство
                </span>
              </div>
            </div>
          </aside>

          {/* =========================
              MAIN CONTENT
          ========================= */}

          <section
            className={styles.content}
          >
            {/* HEADER */}

            <header
              className={
                styles.contentHeader
              }
            >
              <div
                className={
                  styles.projectHeaderInfo
                }
              >
                <span
                  className={
                    styles.contentEyebrow
                  }
                >
                  Панель управления
                </span>

                <div
                  className={
                    styles.projectTitleRow
                  }
                >
                  <h1>
                    {selectedProject
                      ? selectedProject.name
                      : "Добро пожаловать"}
                  </h1>

                  {selectedProject && (
                    <span
                      className={`
                        ${styles.projectStatus}
                        ${getProjectStatusClass(
                          selectedProject.status,
                        )}
                      `}
                    >
                      {getProjectStatusLabel(
                        selectedProject.status,
                      )}
                    </span>
                  )}
                </div>

                <p
                  className={
                    styles.projectDescription
                  }
                >
                  {selectedProject
                    ? selectedProject.description ||
                      "Описание проекта отсутствует"
                    : `Добро пожаловать, ${
                        user?.username ||
                        "пользователь"
                      }!`}
                </p>
              </div>

              {selectedProject && (
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    setIsTaskFormOpen(true)
                  }
                >
                  <span>+</span>
                  Новая задача
                </button>
              )}
            </header>

            {/* PROJECT EMPTY STATE */}

            {!projectsLoading &&
              projects.length === 0 && (
                <div
                  className={
                    styles.emptyWorkspace
                  }
                >
                  <EmptyState
                    title="Создайте свой первый проект"
                    description="После создания проекта здесь появятся его задачи и Kanban-доска."
                  />

                  <button
                    type="button"
                    className={
                      styles.primaryButton
                    }
                    onClick={() => {
                      setEditingProject(
                        null,
                      );

                      setIsProjectFormOpen(
                        true,
                      );
                    }}
                  >
                    + Создать проект
                  </button>
                </div>
              )}

            {/* PROJECT WORKSPACE */}

            {selectedProject && (
              <>
                {/* STATS */}

                <div
                  className={styles.stats}
                >
                  <div
                    className={
                      styles.statCard
                    }
                  >
                    <span>
                      Всего задач
                    </span>

                    <strong>
                      {tasks.length}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.statCard
                    }
                  >
                    <span>
                      К выполнению
                    </span>

                    <strong>
                      {
                        tasks.filter(
                          (task) =>
                            task.status ===
                            "todo",
                        ).length
                      }
                    </strong>
                  </div>

                  <div
                    className={
                      styles.statCard
                    }
                  >
                    <span>
                      В процессе
                    </span>

                    <strong>
                      {
                        tasks.filter(
                          (task) =>
                            task.status ===
                            "in-progress",
                        ).length
                      }
                    </strong>
                  </div>

                  <div
                    className={
                      styles.statCard
                    }
                  >
                    <span>
                      Выполнено
                    </span>

                    <strong>
                      {
                        tasks.filter(
                          (task) =>
                            task.status ===
                            "completed",
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                {/* TASKS HEADER */}

                <div
                  className={
                    styles.tasksHeader
                  }
                >
                  <div>
                    <h2>Задачи</h2>

                    <span>
                      {tasks.length}{" "}
                      {tasks.length === 1
                        ? "задача"
                        : "задач"}
                    </span>
                  </div>

                  <div
                    className={
                      styles.viewSwitcher
                    }
                  >
                    <button
                      type="button"
                      className={`
                        ${styles.viewButton}
                        ${
                          viewMode ===
                          "list"
                            ? styles.viewButtonActive
                            : ""
                        }
                      `}
                      onClick={() =>
                        setViewMode("list")
                      }
                    >
                      ☷ Список
                    </button>

                    <button
                      type="button"
                      className={`
                        ${styles.viewButton}
                        ${
                          viewMode ===
                          "kanban"
                            ? styles.viewButtonActive
                            : ""
                        }
                      `}
                      onClick={() =>
                        setViewMode("kanban")
                      }
                    >
                      ▦ Kanban
                    </button>
                  </div>
                </div>

                {/* LOADING */}

                {tasksLoading && (
                  <div
                    className={
                      styles.loading
                    }
                  >
                    <Loader
                      size="medium"
                      text="Загрузка задач..."
                    />
                  </div>
                )}

                {/* EMPTY TASKS */}

                {!tasksLoading &&
                  tasks.length === 0 && (
                    <div
                      className={
                        styles.emptyTasks
                      }
                    >
                      <EmptyState
                        title="Задач пока нет"
                        description="Создайте первую задачу для этого проекта."
                      />

                      <button
                        type="button"
                        className={
                          styles.primaryButton
                        }
                        onClick={() =>
                          setIsTaskFormOpen(
                            true,
                          )
                        }
                      >
                        + Создать задачу
                      </button>
                    </div>
                  )}

                {/* TASK LIST */}

                {!tasksLoading &&
                  tasks.length > 0 &&
                  viewMode === "list" && (
                    <div
                      className={
                        styles.tasksList
                      }
                    >
                      {tasks.map(
                        (task) => (
                          <article
                            key={task.id}
                            className={
                              styles.taskCard
                            }
                          >
                            <div
                              className={
                                styles.taskMain
                              }
                            >
                              <div
                                className={
                                  styles.taskHeader
                                }
                              >
                                <h3>
                                  {
                                    task.title
                                  }
                                </h3>

                                <div
                                  className={
                                    styles.badges
                                  }
                                >
                                  <span
                                    className={`
                                      ${styles.badge}
                                      ${getStatusClass(
                                        task.status,
                                      )}
                                    `}
                                  >
                                    {getStatusLabel(
                                      task.status,
                                    )}
                                  </span>

                                  <span
                                    className={`
                                      ${styles.badge}
                                      ${getPriorityClass(
                                        task.priority,
                                      )}
                                    `}
                                  >
                                    {getPriorityLabel(
                                      task.priority,
                                    )}
                                  </span>
                                </div>
                              </div>

                              <p
                                className={
                                  styles.taskDescription
                                }
                              >
                                {task.description ||
                                  "Описание отсутствует"}
                              </p>
                            </div>

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
                              >
                                Редактировать
                              </button>

                              <button
                                type="button"
                                className={`
                                  ${styles.button}
                                  ${styles.deleteButton}
                                `}
                                disabled={
                                  isDeletingTask
                                }
                                onClick={() =>
                                  setDeleteTaskId(
                                    task.id,
                                  )
                                }
                              >
                                Удалить
                              </button>
                            </div>
                          </article>
                        ),
                      )}
                    </div>
                  )}

                {/* KANBAN */}

                {!tasksLoading &&
                  tasks.length > 0 &&
                  viewMode === "kanban" && (
                    <div
                      className={
                        styles.kanbanWrapper
                      }
                    >
                      <KanbanBoard
                        tasks={tasks}
                        onEdit={(
                          task: Task,
                        ) =>
                          setEditingTask(
                            task,
                          )
                        }
                        onDelete={(
                          taskId: number,
                        ) =>
                          setDeleteTaskId(
                            taskId,
                          )
                        }
                        onAdd={() =>
                          setIsTaskFormOpen(
                            true,
                          )
                        }
                      />
                    </div>
                  )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* =================================================
          TEAM MEMBERS
          ОТДЕЛЬНО ОТ DASHBOARD
      ================================================= */}

      {selectedProject &&
        selectedProject.team_id && (
          <TeamMembers
            teamId={selectedProject.team_id}
          />
          
        )}
        <TeamInvitations />

      {/* =========================
          PROJECT MODAL
      ========================= */}

      {isProjectFormOpen && (
        <div
          className={
            styles.modalOverlay
          }
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseProjectForm();
            }
          }}
        >
          <div
            className={
              styles.formModal
            }
          >
            <ProjectForm
              project={editingProject}
              onCancel={
                handleCloseProjectForm
              }
            />
          </div>
        </div>
      )}

      {/* =========================
          TASK CREATE MODAL
      ========================= */}

      {isTaskFormOpen &&
        selectedProject && (
          <div
            className={
              styles.modalOverlay
            }
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                handleCloseTaskForm();
              }
            }}
          >
            <div
              className={
                styles.formModal
              }
            >
              <button
                type="button"
                className={
                  styles.modalClose
                }
                onClick={
                  handleCloseTaskForm
                }
                aria-label="Закрыть"
              >
                ×
              </button>

              <TaskForm
                projectId={
                  selectedProject.id
                }
                onCancel={
                  handleCloseTaskForm
                }
              />
            </div>
          </div>
        )}

      {/* =========================
          TASK EDIT MODAL
      ========================= */}

      {editingTask && (
        <div
          className={
            styles.modalOverlay
          }
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setEditingTask(null);
            }
          }}
        >
          <div
            className={
              styles.formModal
            }
          >
            <button
              type="button"
              className={
                styles.modalClose
              }
              onClick={() =>
                setEditingTask(null)
              }
              aria-label="Закрыть"
            >
              ×
            </button>

            <TaskEditForm
              task={editingTask}
              onCancel={() =>
                setEditingTask(null)
              }
            />
          </div>
        </div>
      )}

      {/* =========================
          DELETE TASK
      ========================= */}

      {deleteTaskId !== null && (
        <ConfirmModal
          title="Удалить задачу?"
          message="Это действие нельзя отменить. Вы действительно хотите удалить эту задачу?"
          onCancel={() =>
            setDeleteTaskId(null)
          }
          onConfirm={
            handleDeleteTask
          }
          loading={isDeletingTask}
        />
      )}

      {/* =========================
          DELETE PROJECT
      ========================= */}

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
    </>
  );
};

export default DashboardPage;
