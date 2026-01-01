// Simple logger for scripts — writes timestamped messages to logs/<name>-<ts>.log and to console
const fs = require('fs');
const path = require('path');

function createLogger(name){
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  const filename = `${name}-${new Date().toISOString().replace(/[:.]/g,'-')}.log`;
  const logFile = path.join(logsDir, filename);

  function write(level, ...parts){
    const line = `${new Date().toISOString()} [${level}] ${parts.join(' ')}\n`;
    try { fs.appendFileSync(logFile, line); } catch(e){}
    if (level === 'ERROR') console.error(parts.join(' ')); else console.log(parts.join(' '));
  }

  return {
    info: (...p) => write('INFO', ...p),
    warn: (...p) => write('WARN', ...p),
    error: (...p) => write('ERROR', ...p),
    path: logFile
  };
}

module.exports = { createLogger };