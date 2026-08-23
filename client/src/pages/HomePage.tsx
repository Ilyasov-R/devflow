import { Link } from "react-router-dom";

import styles from "./HomePage.module.css";

import HomeNavbar from "../components/HomeNavbar";

const HomePage = () => {
  return (
    <>
      <HomeNavbar />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>Project Management Platform</span>

              <h1 className={styles.title}>
                Управляйте проектами
                <br />
                <span>эффективнее с DevFlow</span>
              </h1>

              <p className={styles.description}>
                Создавайте проекты, управляйте задачами и контролируйте рабочий
                процесс в одном удобном пространстве.
              </p>

              <div className={styles.actions}>
                <Link to="/register" className={styles.primaryButton}>
                  Начать работу
                </Link>

                <Link to="/login" className={styles.secondaryButton}>
                  Войти
                </Link>
              </div>
            </div>

            <div className={styles.preview}>
              <div className={styles.previewHeader}>
                <div className={styles.previewLogo}>DevFlow</div>

                <div className={styles.previewUser} />
              </div>

              <div className={styles.previewBody}>
                <div className={styles.previewSidebar}>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className={styles.previewContent}>
                  <div className={styles.previewTitle} />

                  <div className={styles.previewCards}>
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Возможности</span>

              <h2>Всё необходимое для управления проектами</h2>

              <p>
                DevFlow объединяет проекты, задачи и рабочий процесс в одном
                месте.
              </p>
            </div>

            <div className={styles.featureGrid}>
              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>📁</div>

                <h3>Проекты</h3>

                <p>
                  Создавайте и управляйте проектами, отслеживайте их статус и
                  описание.
                </p>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>✓</div>

                <h3>Задачи</h3>

                <p>
                  Создавайте задачи, назначайте приоритет и контролируйте их
                  выполнение.
                </p>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>▦</div>

                <h3>Kanban</h3>

                <p>
                  Визуализируйте рабочий процесс и перемещайте задачи между
                  статусами.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2>Готовы организовать свою работу?</h2>

              <p>Создайте аккаунт и начните работать с DevFlow.</p>

              <Link to="/register" className={styles.primaryButton}>
                Создать аккаунт
              </Link>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.container}>
            <span>© 2026 DevFlow</span>

            <span>Project Management Platform</span>
          </div>
        </footer>
      </main>
    </>
  );
};

export default HomePage;
