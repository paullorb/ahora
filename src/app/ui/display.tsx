"use client";

import StopWatch from '@/components/stop-watch';
import styles from "./display.module.css";
import TwentyFourHours from '@/components/twentyfourhours';
import Weekly from './weekly';

type DisplayProps = {
  view: string;
};

export default function Display({ view }: DisplayProps) {
  return (
    <div className={styles.container}>
      {view === "stopwatch" && <StopWatch />}
      {view === "24H" && <TwentyFourHours />}
      {view === "weekly" && <Weekly />}
    </div>
  );
}