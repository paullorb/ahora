import styles from "./page.module.css";
import AppLayout from "./ui/appLayout";

export default function Home() {
  return (
    <div className={styles.container}>
      <AppLayout />
    </div>
  );
}
