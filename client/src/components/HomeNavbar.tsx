import { Link } from "react-router-dom";

import styles from "./HomeNavbar.module.css";

const HomeNavbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link
          to="/"
          className={styles.logo}
        >
          DevFlow
        </Link>

        <nav className={styles.nav}>
          <a
            href="#features"
            className={styles.link}
          >
            Возможности
          </a>

          <Link
            to="/login"
            className={styles.login}
          >
            Войти
          </Link>

          <Link
            to="/register"
            className={styles.register}
          >
            Создать аккаунт
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default HomeNavbar;