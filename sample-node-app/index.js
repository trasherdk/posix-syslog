import { openlog, syslog, setlogmask, createLogger, closelog } from "@trasherdk/posix-syslog";

// Open a connection to the system logger
openlog("sample-app", { pid: true, ndelay: true }, "user");

// Only log notice and above
const previous = setlogmask({
  emerg: true,
  alert: true,
  crit: true,
  err: true,
  warning: true,
  notice: true,
});
console.log("Previous mask:", previous);

// Use the low-level syslog() call directly
syslog("notice", "Application started");
syslog("info", "This will be filtered out by the mask");

// Create per-facility loggers
const auth = createLogger("auth");
const app = createLogger("local0");

auth.notice("User admin logged in from 192.168.1.42");
auth.warning("Failed login attempt for user root");
app.notice("Processing batch job #1234");
app.err("Failed to connect to upstream service");

// Re-enable all priorities
setlogmask({
  emerg: true,
  alert: true,
  crit: true,
  err: true,
  warning: true,
  notice: true,
  info: true,
  debug: true,
});

syslog("info", "This info message is now visible");

closelog();
console.log("Done — check journalctl or /var/log/syslog for output");
