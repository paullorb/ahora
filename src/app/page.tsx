import StopWatch from "@/components/stop-watch";
import styles from "./page.module.css";
import Nav from "@/components/nav";

export default function Home() {
  return (
    <div className={styles.container}>
      <Nav />
      <div className={styles.box}>
        <StopWatch />
      </div>
    </div>
  );
}
