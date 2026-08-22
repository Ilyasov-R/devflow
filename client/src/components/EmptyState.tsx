import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState = ({
  title,
  description,
}: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        📭
      </div>

      <h3 className={styles.title}>
        {title}
      </h3>

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
