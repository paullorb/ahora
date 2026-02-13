import StopWatch from "@/components/stop-watch";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.center}>
      <StopWatch />
    </div>
  );
}
