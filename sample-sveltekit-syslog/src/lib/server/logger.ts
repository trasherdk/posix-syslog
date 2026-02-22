import { openlog, createLogger, setlogmask, type Logger } from "@trasherdk/posix-syslog";

openlog("sveltekit-syslog", { pid: true, ndelay: true }, "user");

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

export const appLog: Logger = createLogger("local0");
export const authLog: Logger = createLogger("auth");
