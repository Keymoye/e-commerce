import { describe, it, expect, vi, afterEach } from "vitest";
import logger from "@/lib/logger";

describe("logger sinks and withContext", () => {
  afterEach(() => {
    // restore default console sink
    logger.setSinks([
      {
        error: (rec) => {
          if (process.env.NODE_ENV === "production") {
            console.error(JSON.stringify(rec));
          } else {
            console.error(
              `[${rec.time}] [ERROR]`,
              rec.context,
              rec.message,
              ...rec.args
            );
          }
        },
        warn: (rec) => {
          if (process.env.NODE_ENV === "production") {
            console.warn(JSON.stringify(rec));
          } else {
            console.warn(
              `[${rec.time}] [WARN]`,
              rec.context,
              rec.message,
              ...rec.args
            );
          }
        },
        info: (rec) => {
          if (process.env.NODE_ENV === "production") {
            console.info(JSON.stringify(rec));
          } else {
            console.info(
              `[${rec.time}] [INFO]`,
              rec.context,
              rec.message,
              ...rec.args
            );
          }
        },
        debug: (rec) => {
          if (process.env.NODE_ENV !== "production") {
            console.debug(
              `[${rec.time}] [DEBUG]`,
              rec.context,
              rec.message,
              ...rec.args
            );
          }
        },
      },
    ]);
  });

  it("calls a custom sink", () => {
    const infoSpy = vi.fn();
    const mockSink = { info: infoSpy };
    logger.setSinks([mockSink]);

    logger.info({ requestId: "abc" }, "hello", { a: 1 });
    expect(infoSpy).toHaveBeenCalled();
    const rec = infoSpy.mock.calls[0][0];
    expect(rec.level).toBe("INFO");
    expect(rec.context).toEqual({ requestId: "abc" });
    expect(rec.message).toContain("hello");
  });

  it("withContext merges contexts", () => {
    const errSpy = vi.fn();
    const mockSink = { error: errSpy };
    logger.setSinks([mockSink]);

    const log = logger.withContext({ requestId: "req-1", userId: "u1" });
    log.error("Database failed");

    expect(errSpy).toHaveBeenCalled();
    const rec = errSpy.mock.calls[0][0];
    expect(rec.context).toEqual({ requestId: "req-1", userId: "u1" });
  });
});
