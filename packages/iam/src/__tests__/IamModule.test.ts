/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

import type { InAppMessage } from "../types";

jest.mock("../NativeSFMCIamModule", () => ({
  __esModule: true,
  default: {
    requestIamSdk: jest.fn().mockResolvedValue(undefined),
    showInAppMessage: jest.fn(),
    setDecisionHandlerEnabled: jest.fn(),
    resolveInAppMessageDecision: jest.fn(),
    setFont: jest.fn(),
    setStatusBarColor: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

type MockedNative = { [key: string]: jest.Mock };

const DECISION_REQUEST_EVENT = "sfmc_iam_decision_request";

type EmitterLike = {
  addListener: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => { remove: jest.Mock };
  emit: (event: string, ...args: unknown[]) => void;
  constructor: { name: string };
};

type LoadedFixture = {
  IamModule: typeof import("../IamModule").IamModule;
  Native: MockedNative;
  emitter: EmitterLike;
};

const loadModule = (): LoadedFixture => {
  let mod!: typeof import("../IamModule");
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require("../IamModule");
    native = require("../NativeSFMCIamModule").default;
  });
  const emitter = mod.IamModule.getEmitter() as unknown as EmitterLike;
  return { IamModule: mod.IamModule, Native: native, emitter };
};

const loadModuleUnprimed = (): {
  IamModule: typeof import("../IamModule").IamModule;
  Native: MockedNative;
} => {
  let mod!: typeof import("../IamModule");
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require("../IamModule");
    native = require("../NativeSFMCIamModule").default;
  });
  return { IamModule: mod.IamModule, Native: native };
};

const message = (overrides: Partial<InAppMessage> = {}): InAppMessage =>
  ({ id: "msg-1", ...overrides }) as InAppMessage;

const flushMicrotasks = async (): Promise<void> => {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve();
  }
};

describe("IamModule", () => {
  describe("requestSdk", () => {
    it("awaits requestIamSdk on first call", async () => {
      const { IamModule, Native } = loadModule();
      await IamModule.requestSdk();
      expect(Native.requestIamSdk).toHaveBeenCalledTimes(1);
    });

    it("caches the api across calls", async () => {
      const { IamModule, Native } = loadModule();
      const a = await IamModule.requestSdk();
      const b = await IamModule.requestSdk();
      expect(a).toBe(b);
      expect(Native.requestIamSdk).toHaveBeenCalledTimes(1);
    });
  });

  describe("surface delegation", () => {
    it("forwards showInAppMessage with the given id", async () => {
      const { IamModule, Native } = loadModule();
      const api = await IamModule.requestSdk();
      api.showInAppMessage("m-42");
      expect(Native.showInAppMessage).toHaveBeenCalledWith("m-42");
    });

    it("forwards setFont and setStatusBarColor", async () => {
      const { IamModule, Native } = loadModule();
      const api = await IamModule.requestSdk();
      api.setFont("Roboto");
      api.setStatusBarColor(0xff112233);
      expect(Native.setFont).toHaveBeenCalledWith("Roboto");
      expect(Native.setStatusBarColor).toHaveBeenCalledWith(0xff112233);
    });
  });

  describe("getEmitter", () => {
    it("returns a cached emitter bound to the native module", () => {
      const { IamModule, Native } = loadModule();
      const a = IamModule.getEmitter() as unknown as {
        nativeModule: unknown;
        addListener: unknown;
      };
      const b = IamModule.getEmitter();
      expect(typeof a.addListener).toBe("function");
      expect(a.nativeModule).toBe(Native);
      expect(a).toBe(b);
    });
  });

  describe("cache resilience", () => {
    it("propagates rejections from requestIamSdk without caching", async () => {
      const { IamModule, Native } = loadModuleUnprimed();
      Native.requestIamSdk.mockRejectedValueOnce(new Error("nope"));
      await expect(IamModule.requestSdk()).rejects.toThrow("nope");
      Native.requestIamSdk.mockResolvedValue(undefined);
      await IamModule.requestSdk();
      expect(Native.requestIamSdk).toHaveBeenCalledTimes(2);
    });
  });

  describe("setInAppMessageDecisionHandler", () => {
    it("subscribes once and enables native gating when a handler is set", () => {
      const { IamModule, Native, emitter } = loadModule();
      const addListener = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      expect(Native.setDecisionHandlerEnabled).toHaveBeenLastCalledWith(true);
      expect(addListener).toHaveBeenCalledTimes(1);
      expect(addListener.mock.calls[0][0]).toBe(DECISION_REQUEST_EVENT);
    });

    it("does not re-subscribe when swapping handlers", () => {
      const { IamModule, emitter } = loadModule();
      const addListener = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      IamModule.setInAppMessageDecisionHandler(() => false);
      expect(addListener).toHaveBeenCalledTimes(1);
    });

    it("routes emits to the latest handler after a swap", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(() => true);
      IamModule.setInAppMessageDecisionHandler(() => false);
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "swapped" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "swapped",
        false,
      );
    });

    it("resolves with true for a sync-true handler", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(() => true);
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "x" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "x",
        true,
      );
    });

    it("resolves with false for a sync-false handler", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(() => false);
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "y" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "y",
        false,
      );
    });

    it("coerces truthy non-boolean returns to true", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(
        (() => 1) as unknown as (m: InAppMessage) => boolean,
      );
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "coerce" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "coerce",
        true,
      );
    });

    it("resolves after an async handler settles", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(async () => true);
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "async" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "async",
        true,
      );
    });

    it("tears down the subscription so post-clear emits are ignored", async () => {
      const { IamModule, Native, emitter } = loadModule();
      IamModule.setInAppMessageDecisionHandler(() => true);
      IamModule.setInAppMessageDecisionHandler(null);
      Native.resolveInAppMessageDecision.mockClear();
      (
        emitter as unknown as { emit: (e: string, m: InAppMessage) => void }
      ).emit(DECISION_REQUEST_EVENT, message({ id: "stale" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).not.toHaveBeenCalled();
    });

    it("fails closed when the listener runs with a nulled-out handler", async () => {
      const { IamModule, Native, emitter } = loadModule();
      const addSpy = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      const registered = addSpy.mock.calls[0][1] as (m: InAppMessage) => void;
      // Simulate the race: subscription still live, but the handler has been
      // nulled out. This exercises the `current ? current(message) : false`
      // defensive branch.
      IamModule.setInAppMessageDecisionHandler(null);
      Native.resolveInAppMessageDecision.mockClear();
      registered(message({ id: "race-null" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "race-null",
        false,
      );
    });

    it("honors the pre-emit handler even when cleared mid-flight", async () => {
      const { IamModule, Native, emitter } = loadModule();
      let resolveHandler: (v: boolean) => void = () => {};
      IamModule.setInAppMessageDecisionHandler(
        () =>
          new Promise<boolean>((r) => {
            resolveHandler = r;
          }),
      );
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "race" }));
      IamModule.setInAppMessageDecisionHandler(null);
      resolveHandler(true);
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "race",
        true,
      );
    });

    it("suppresses and warns when a handler throws synchronously", async () => {
      const { IamModule, Native, emitter } = loadModule();
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      IamModule.setInAppMessageDecisionHandler(() => {
        throw new Error("boom");
      });
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "throw" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "throw",
        false,
      );
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("suppresses and warns when a handler rejects asynchronously", async () => {
      const { IamModule, Native, emitter } = loadModule();
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      IamModule.setInAppMessageDecisionHandler(async () => {
        throw new Error("reject");
      });
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "reject" }));
      await flushMicrotasks();
      expect(Native.resolveInAppMessageDecision).toHaveBeenCalledWith(
        "reject",
        false,
      );
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("warns but does not rethrow when native resolve throws on the success path", async () => {
      const { IamModule, Native, emitter } = loadModule();
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      Native.resolveInAppMessageDecision.mockImplementationOnce(() => {
        throw new Error("native");
      });
      IamModule.setInAppMessageDecisionHandler(() => true);
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "native-throw" }));
      await flushMicrotasks();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("warns but does not rethrow when native resolve throws on the fail-closed path", async () => {
      const { IamModule, Native, emitter } = loadModule();
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      Native.resolveInAppMessageDecision.mockImplementationOnce(() => {
        throw new Error("native-fail");
      });
      IamModule.setInAppMessageDecisionHandler(() => {
        throw new Error("handler");
      });
      emitter.emit(DECISION_REQUEST_EVENT, message({ id: "double" }));
      await flushMicrotasks();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("tears down the subscription and disables gating when cleared", () => {
      const { IamModule, Native, emitter } = loadModule();
      const addSpy = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      const sub = addSpy.mock.results[0].value as { remove: jest.Mock };
      IamModule.setInAppMessageDecisionHandler(null);
      expect(Native.setDecisionHandlerEnabled).toHaveBeenLastCalledWith(false);
      expect(sub.remove).toHaveBeenCalledTimes(1);
    });

    it("re-subscribes fresh after a full clear", () => {
      const { IamModule, emitter } = loadModule();
      const addSpy = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      IamModule.setInAppMessageDecisionHandler(null);
      IamModule.setInAppMessageDecisionHandler(() => false);
      expect(addSpy).toHaveBeenCalledTimes(2);
    });

    it("lazily builds the emitter when set before any getEmitter call", () => {
      const { IamModule, Native } = loadModuleUnprimed();
      // Never call getEmitter() first — the setter must initialize it.
      IamModule.setInAppMessageDecisionHandler(() => true);
      const emitter = IamModule.getEmitter() as unknown as {
        nativeModule: unknown;
      };
      expect(emitter.nativeModule).toBe(Native);
      expect(Native.setDecisionHandlerEnabled).toHaveBeenCalledWith(true);
    });

    it("is a no-op when clearing before any handler was ever set", () => {
      const { IamModule, Native } = loadModuleUnprimed();
      expect(() =>
        IamModule.setInAppMessageDecisionHandler(null),
      ).not.toThrow();
      expect(Native.setDecisionHandlerEnabled).toHaveBeenCalledWith(false);
    });

    it("is idempotent across repeated clears", () => {
      const { IamModule, Native, emitter } = loadModule();
      const addSpy = jest.spyOn(emitter, "addListener");
      IamModule.setInAppMessageDecisionHandler(() => true);
      const sub = addSpy.mock.results[0].value as { remove: jest.Mock };
      IamModule.setInAppMessageDecisionHandler(null);
      expect(() =>
        IamModule.setInAppMessageDecisionHandler(null),
      ).not.toThrow();
      expect(sub.remove).toHaveBeenCalledTimes(1);
      expect(Native.setDecisionHandlerEnabled).toHaveBeenLastCalledWith(false);
    });
  });
});
