import styles from "./work-mode-nav.module.css";

export type WorkMode = "research" | "planning" | "implementation";

type WorkModeNavProps = {
  mode: WorkMode;
  onChange: (mode: WorkMode) => void;
};

const MODES: WorkMode[] = ["research", "planning", "implementation"];

export default function WorkModeNav({ mode, onChange }: WorkModeNavProps) {
  return (
    <nav className={styles.nav} aria-label="Work mode">
      {MODES.map((item) => (
        <button
          key={item}
          type="button"
          className={`${styles.item} ${mode === item ? styles.active : ""}`.trim()}
          onClick={() => onChange(item)}
        >
          {item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </nav>
  );
}
