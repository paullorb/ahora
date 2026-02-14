import styles from "./nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.container}>
      <h1 className={styles.logo}>Ahora</h1>
      <div className={styles.user}>
        <div className={styles.inputs}>
          <input type="text" placeholder="User" />
          <input type="text" placeholder="Password" />
        </div>
        <div className={styles.buttons}>
          <button>Login</button>
          <button>Sign Up</button>
        </div>
      </div>
    </nav>
  );
}