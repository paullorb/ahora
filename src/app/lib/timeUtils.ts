// Parse input like "mm:ss" or "hh:mm:ss"
export function parseTimeString(str: string): number {
  const parts = str.split(":").map((p) => p.trim());
  if (parts.length === 2) {
    // mm:ss
    const [mm, ss] = parts;
    return (parseInt(mm) * 60 + parseInt(ss)) * 1000;
  }
  if (parts.length === 3) {
    // hh:mm:ss
    const [hh, mm, ss] = parts;
    return (parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss)) * 1000;
  }
  // fallback: try as seconds
  const asNum = Number(str);
  if (!isNaN(asNum)) return asNum * 1000;
  return 0;
}

// Predefined countdown values in milliseconds
export const presetTimes = [
  { label: "5'", ms: 5 * 60 * 1000 },
  { label: "10'", ms: 10 * 60 * 1000 },
  { label: "25'", ms: 25 * 60 * 1000 },
  { label: "60'", ms: 60 * 60 * 1000 },
];