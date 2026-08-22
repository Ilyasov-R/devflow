import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../app/hooks";

import { registerUser } from "../features/auth/authSlice";

import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { loading, error } = useAppSelector(
    (state) => state.auth,
  );

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!username.trim()) {
      return;
    }

    if (!email.trim()) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    const result = await dispatch(
      registerUser({
        username,
        email,
        password,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <h1 className={styles.logo}>
          DevFlow
        </h1>

        <h2 className={styles.title}>
          Создание аккаунта
        </h2>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <input
            className={styles.input}
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
            }
          />

          <input
            className={styles.input}
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
          />

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Регистрация..."
              : "Зарегистрироваться"}
          </button>

        </form>

        <p className={styles.footer}>
          Уже есть аккаунт?{" "}

          <Link
            className={styles.link}
            to="/login"
          >
            Войти
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;