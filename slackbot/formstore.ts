/**
 * Server-side storage for hosted fillable forms (e.g. the OpenTeleRehab WP1 doc).
 * Each form keeps one JSON blob (the app's own serialized state string) in a file.
 *
 * Persistence: PIDGI_DATA_DIR if set, else /var/data (Render persistent disk) if present,
 * else the OS temp dir. Only the first two survive a restart.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";
import os from "os";

function baseDir(): string {
  if (process.env.PIDGI_DATA_DIR) return process.env.PIDGI_DATA_DIR;
  try { if (existsSync("/var/data")) return "/var/data"; } catch { /* ignore */ }
  return os.tmpdir();
}

function safeId(id: string): string {
  return String(id).replace(/[^a-z0-9_-]/gi, "").slice(0, 64) || "form";
}

function fileFor(id: string): string {
  return path.join(baseDir(), `form-${safeId(id)}.json`);
}

export function formsPersistent(): boolean {
  return !!process.env.PIDGI_DATA_DIR || baseDir() === "/var/data";
}

export function saveFormValue(id: string, value: string): void {
  writeFileSync(fileFor(id), JSON.stringify({ value: String(value ?? ""), updated: Date.now() }));
}

export function loadFormValue(id: string): { value: string | null; updated: number | null } {
  try {
    const j = JSON.parse(readFileSync(fileFor(id), "utf8"));
    return { value: typeof j.value === "string" ? j.value : null, updated: j.updated ?? null };
  } catch {
    return { value: null, updated: null };
  }
}
