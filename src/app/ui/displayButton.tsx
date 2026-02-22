import styles from "./displayButton.module.css";

type DisplayButtonProps = {
  activeView: string;
  onClick: () => void;
};

export default function DisplayButton({ activeView, onClick }: DisplayButtonProps) {
  return (
    <div className={styles.views}>
      <button
        className={`${styles.button} ${activeView === "stopwatch" ? styles.active : ""}`}
        onClick={onClick}
      >
        +
      </button>
    </div>
  );
}