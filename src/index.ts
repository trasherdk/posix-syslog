import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface NativeBindings {
  openlog(ident: string, option: number, facility: number): void;
  closelog(): void;
  syslog(priority: number, message: string): void;
  setlogmask(mask: number): number;
  update_syslog_constants(obj: Record<string, number>): void;
}

const native: NativeBindings = require("../build/Release/syslog.node");

const syslogConstants: Record<string, number> = {};
native.update_syslog_constants(syslogConstants);

function syslogConst(value: string): number {
  if (syslogConstants[value] === undefined) {
    throw new Error("invalid syslog constant value: " + value);
  }
  return syslogConstants[value];
}

function syslogFlags(option: Record<string, boolean>, prefix = ""): number {
  let opt = 0;
  for (const key of Object.keys(option)) {
    const flag = syslogConst(prefix + key);
    opt |= option[key] ? flag : 0;
  }
  return opt;
}

export type SyslogPriority =
  | "emerg"
  | "alert"
  | "crit"
  | "err"
  | "warning"
  | "notice"
  | "info"
  | "debug";

export type SyslogFacility =
  | "kern"
  | "user"
  | "mail"
  | "news"
  | "uucp"
  | "daemon"
  | "auth"
  | "authpriv"
  | "cron"
  | "ftp"
  | "lpr"
  | "syslog"
  | "local0"
  | "local1"
  | "local2"
  | "local3"
  | "local4"
  | "local5"
  | "local6"
  | "local7";

export interface SyslogOptions {
  cons?: boolean;
  ndelay?: boolean;
  nowait?: boolean;
  odelay?: boolean;
  pid?: boolean;
}

export type SyslogMask = Partial<Record<SyslogPriority, boolean>>;

export function openlog(
  ident: string,
  option: SyslogOptions,
  facility: SyslogFacility,
): void {
  native.openlog(ident, syslogFlags(option as Record<string, boolean>), syslogConst(facility));
}

export function closelog(): void {
  native.closelog();
}

export function syslog(priority: SyslogPriority, message: string): void {
  native.syslog(syslogConst(priority), message);
}

export function setlogmask(maskpri: SyslogMask): SyslogMask {
  const bits = native.setlogmask(
    syslogFlags(maskpri as Record<string, boolean>, "mask_"),
  );
  const flags: SyslogMask = {};
  for (const key of Object.keys(syslogConstants)) {
    if (key.startsWith("mask_")) {
      const name = key.slice(5) as SyslogPriority;
      flags[name] = (bits & syslogConstants[key]) !== 0;
    }
  }
  return flags;
}

export interface Logger {
  emerg(message: string): void;
  alert(message: string): void;
  crit(message: string): void;
  err(message: string): void;
  warning(message: string): void;
  notice(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

/**
 * Create a logger bound to a specific facility. The facility is OR'd into
 * the priority on each call, overriding the default set by openlog().
 * openlog() must still be called first to set identity and options.
 */
export function createLogger(facility: SyslogFacility): Logger {
  const f = syslogConst(facility);
  const log = (priority: SyslogPriority, message: string) =>
    native.syslog(f | syslogConst(priority), message);

  return {
    emerg:   (message) => log("emerg", message),
    alert:   (message) => log("alert", message),
    crit:    (message) => log("crit", message),
    err:     (message) => log("err", message),
    warning: (message) => log("warning", message),
    notice:  (message) => log("notice", message),
    info:    (message) => log("info", message),
    debug:   (message) => log("debug", message),
  };
}
