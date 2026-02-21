import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openlog, closelog, syslog, setlogmask, createLogger } from "posix-syslog";

describe("syslog", () => {
  it("rejects openlog with missing arguments", () => {
    assert.throws(
      // @ts-expect-error testing bad args
      () => openlog("foobar", 1),
      /invalid syslog constant value/,
    );
  });

  it("rejects unknown option flag", () => {
    assert.throws(
      () => openlog("foobar", { xxx: 1 } as any, "local0"),
      /invalid syslog constant value/,
    );
  });

  it("rejects unknown facility", () => {
    assert.throws(
      () => openlog("foobar", {}, "xxx" as any),
      /invalid syslog constant value/,
    );
  });

  it("round-trips openlog → setlogmask → syslog → closelog", () => {
    openlog("test-posix-syslog", { cons: true, ndelay: true, pid: true }, "local0");

    setlogmask({ info: true, debug: true });
    const old = setlogmask({
      emerg: true,
      alert: true,
      crit: true,
      err: true,
      warning: true,
      notice: true,
      info: true,
      debug: true,
    });

    assert.strictEqual(old.info, true);
    assert.strictEqual(old.debug, true);

    syslog("info", "hello from posix-syslog (info)");
    closelog();
  });
});

describe("createLogger", () => {
  it("rejects unknown facility", () => {
    assert.throws(
      () => createLogger("bogus" as any),
      /invalid syslog constant value/,
    );
  });

  it("logs to different facilities", () => {
    openlog("test-posix-syslog", { pid: true, ndelay: true }, "user");

    const auth = createLogger("auth");
    const app = createLogger("local0");

    auth.info("auth facility test message");
    app.warning("local0 facility test message");
    app.debug("debug on local0");

    closelog();
  });
});
