import StopWatch from "@/components/stop-watch";
import styles from "./page.module.css";
import Nav from "@/components/nav";
import Today from "@/components/today";

export default function Home() {
  return (
    <div className={styles.container}>
      <Nav />
      <Today />
      <div className={styles.box}>
        <StopWatch />
      </div>
    </div>
  );
}
