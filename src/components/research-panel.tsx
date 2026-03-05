import styles from "./research-panel.module.css";

export type ResearchSummary = {
  activityName: string;
  checkInCount: number;
};

type ResearchPanelProps = {
  summaries: ResearchSummary[];
};

export default function ResearchPanel({ summaries }: ResearchPanelProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Completed Tasks</h2>

      {summaries.length === 0 ? (
        <p className={styles.empty}>No completed tasks yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Check-ins</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((item) => (
              <tr key={item.activityName}>
                <td>{item.activityName}</td>
                <td>{item.checkInCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
