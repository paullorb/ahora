"use client";

import DisplayButton from "./displayButton";
import styles from "./nav.module.css";
import { NavProps } from "./types";

export default function NavButton({ activeView, onToggleView }: NavProps) {
  return (
    <div className={styles.container}>
      <DisplayButton activeView={activeView} onClick={onToggleView} />
    </div>
  );
}