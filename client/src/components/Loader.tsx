import styles from "./Loader.module.css";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

const Loader = ({
  size = "medium",
  text,
}: LoaderProps) => {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.spinner} ${styles[size]}`}
        role="status"
        aria-label="Загрузка"
      />

      {text && (
        <span className={styles.text}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;