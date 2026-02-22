# @trasherdk/posix-syslog

POSIX syslog bindings for Node.js — based on code from [node-posix](https://github.com/ohmu/node-posix).
- Extracted from a fork [node-posix](https://github.com/ilb/node-posix)

Provides `openlog`, `closelog`, `syslog`, `setlogmask`, and `createLogger` as a native C++ addon using N-API, with full TypeScript types and ESM support.

## Installation

```
npm install @trasherdk/posix-syslog
```

## Usage

```typescript
import { openlog, syslog, closelog } from "@trasherdk/posix-syslog";

openlog("myprog", { pid: true, ndelay: true }, "local7");
syslog("info", "hello, world!");
closelog();
```

### Multiple facilities

Use `createLogger()` to direct messages to different syslog facilities
within the same process. Call `openlog()` once to set identity and options,
then create loggers for each facility:

```typescript
import { openlog, createLogger, closelog } from "@trasherdk/posix-syslog";

openlog("myapp", { pid: true, ndelay: true }, "user");

const auth = createLogger("auth");
const app  = createLogger("local0");

auth.info("login successful");
app.warning("disk usage high");
app.debug("processing request #42");

closelog();
```

## API

### openlog(identity, options, facility)

Open a connection to the logger.

- `identity` — name of the process visible in logged entries.
- `options` — object with boolean flags:
  - `cons` — Log to the system console on error.
  - `ndelay` — Connect to syslog daemon immediately.
  - `nowait` — Do not wait for child processes.
  - `odelay` — Delay open until syslog() is called.
  - `pid` — Log the process ID with each message.
- `facility` — facility code string:
  `kern`, `user`, `mail`, `news`, `uucp`, `daemon`, `auth`, `authpriv`, `cron`, `ftp`, `lpr`, `syslog`, `local0`..`local7`

Only `user` and `local0`..`local7` are defined in the POSIX standard.

### closelog()

Close connection to the logger.

### setlogmask(mask)

Sets a priority mask for log messages. Further `syslog()` calls are only sent if their priority is included in the mask. Returns an object with boolean flags indicating which priorities were previously enabled.

```typescript
setlogmask({ emerg: true, alert: true, crit: true });
```

### syslog(priority, message)

Send a message to the syslog logger.

Priorities: `emerg`, `alert`, `crit`, `err`, `warning`, `notice`, `info`, `debug`

```typescript
syslog("info", "hello, world!");
```

### createLogger(facility)

Create a logger bound to a specific facility. The facility is OR'd into the
priority on each call, overriding the default set by `openlog()`.

Returns an object with a method for each priority level:
`emerg`, `alert`, `crit`, `err`, `warning`, `notice`, `info`, `debug`

```typescript
const log = createLogger("auth");
log.info("user logged in");
```

## TypeScript

All exports are fully typed. Key types:

```typescript
import type {
  SyslogPriority, SyslogFacility, SyslogOptions, SyslogMask, Logger,
} from "@trasherdk/posix-syslog";
```

## License

MIT — Copyright (c) 2011-2015 Mika Eloranta
