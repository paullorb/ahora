import Auth from "./auth";
import styles from "./nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.container}>
      <h1 className={styles.logo}>Ahora</h1>
        {/* <Auth /> */}
    </nav>
  );
}