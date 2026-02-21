import StopWatch from "@/components/stop-watch";
import styles from "./page.module.css";
import Nav from "@/app/ui/nav";
import Today from "@/components/twentyfourhours";
import BigPicture from "@/components/bigPicture";

export default function Home() {
  return (
    <div className={styles.container}>
      <Nav />
      <BigPicture />
      <div className={styles.box}>
        <StopWatch />
      </div>
    </div>
  );
}
