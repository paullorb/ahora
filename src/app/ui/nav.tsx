import styles from "./nav.module.css";
import NavButton from "./navButton";
import { NavProps } from "./types";

export default function Nav({ activeView, onToggleView }: NavProps) {
  return (
    <nav className={styles.container}>
      <h1 className={styles.logo}>Scalable</h1>
      <NavButton activeView={activeView} onToggleView={onToggleView} />
    </nav>
  );
}