/** Read a numeric setting; an explicit 0 counts (unlike `Number(x) || default`). */
export function envInt(name: string, def: number, env: NodeJS.ProcessEnv = process.env): number {
  const v = env[name];
  if (v === undefined || String(v).trim() === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
