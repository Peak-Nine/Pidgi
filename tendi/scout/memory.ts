/**
 * How much memory the container has left, read from the cgroup (what Render
 * enforces), so Scout can skip the PDF helper instead of tipping the instance
 * over its limit. Returns null when the cgroup files cannot be read.
 */
import { readFileSync } from "fs";

function num(file: string): number | null {
  try {
    const v = readFileSync(file, "utf8").trim();
    if (!v || v === "max") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function memoryHeadroomMb(): { usedMb: number; limitMb: number; freeMb: number } | null {
  // cgroup v2, then v1
  const pairs: [string, string][] = [
    ["/sys/fs/cgroup/memory.current", "/sys/fs/cgroup/memory.max"],
    ["/sys/fs/cgroup/memory/memory.usage_in_bytes", "/sys/fs/cgroup/memory/memory.limit_in_bytes"],
  ];
  for (const [cur, max] of pairs) {
    const used = num(cur);
    const limit = num(max);
    // v1 reports a huge number when there is no limit
    if (used !== null && limit !== null && limit < 1e15) {
      const mb = (b: number) => Math.round(b / 1048576);
      return { usedMb: mb(used), limitMb: mb(limit), freeMb: mb(limit - used) };
    }
  }
  return null;
}
