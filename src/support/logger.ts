import fs from 'node:fs';
import path from 'node:path';
import { env } from './env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Level[] = ['debug', 'info', 'warn', 'error'];

// WebdriverIO 9 points every parallel worker at the same wdio.log, which garbles the lines.
// So each worker appends to its own file instead: reports/logs/<suite>/worker-<id>.log
const logDir = process.env.LOG_DIR;
const workerId = process.env.WDIO_WORKER_ID;
const logFile = logDir && workerId ? path.join(logDir, `worker-${workerId}.log`) : undefined;
if (logFile) fs.mkdirSync(path.dirname(logFile), { recursive: true });

function write(level: Level, message: string): void {
  if (!logFile || env.logLevel === 'silent') return;
  const minimum = LEVELS.indexOf(env.logLevel === 'trace' ? 'debug' : env.logLevel);
  if (LEVELS.indexOf(level) < minimum) return;
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${level.toUpperCase()} ${message}\n`);
}

export const log = {
  debug: (message: string) => write('debug', message),
  info: (message: string) => write('info', message),
  warn: (message: string) => write('warn', message),
  error: (message: string) => write('error', message),
};
