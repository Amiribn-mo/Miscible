// Simple unlock throttling using localStorage to slow brute-force

const ATTEMPTS_KEY = "unlock_attempts";
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LIMIT = 5;

function readAttempts(): number[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as number[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAttempts(attempts: number[]) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function canAttemptUnlock(): { ok: boolean; waitMs?: number } {
  const now = Date.now();
  const attempts = readAttempts().filter((t) => now - t <= WINDOW_MS);
  if (attempts.length < LIMIT) return { ok: true };

  // cooldown: linear backoff for attempts over limit
  const earliest = attempts[0];
  const waitMs = WINDOW_MS - (now - earliest);
  return { ok: false, waitMs };
}

export function recordFailedAttempt() {
  const now = Date.now();
  const attempts = readAttempts().filter((t) => now - t <= WINDOW_MS);
  attempts.push(now);
  writeAttempts(attempts);
}

export function resetAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
}