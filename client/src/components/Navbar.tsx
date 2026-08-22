import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import { logout } from "../features/auth/authSlice";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector(
    (state) => state.auth,
  );

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link
          to="/dashboard"
          className={styles.logo}
        >
          DevFlow
        </Link>

        <div className={styles.right}>
          {user && (
            <span className={styles.username}>
              {user.username}
            </span>
          )}

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;