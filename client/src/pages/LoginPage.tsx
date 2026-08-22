import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import { loginUser } from "../features/auth/authSlice";

import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { loading, error } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const result = await dispatch(
      loginUser({
        email,
        password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.logo}>
          DevFlow
        </h1>

        <h2 className={styles.title}>
          Вход в аккаунт
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
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className={styles.footer}>
          Нет аккаунта?{" "}
          <Link
            className={styles.link}
            to="/register"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
