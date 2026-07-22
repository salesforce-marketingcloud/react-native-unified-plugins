/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

jest.mock("../NativeSFMCPushModule", () => ({
  __esModule: true,
  default: {
    requestPushSdk: jest.fn().mockResolvedValue(undefined),
    enablePush: jest.fn(),
    disablePush: jest.fn(),
    getPushToken: jest.fn(),
    isPushEnabled: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

type MockedNative = {
  requestPushSdk: jest.Mock;
  enablePush: jest.Mock;
  disablePush: jest.Mock;
  getPushToken: jest.Mock;
  isPushEnabled: jest.Mock;
};

const loadModule = (): {
  PushModule: typeof import("../PushModule").PushModule;
  Native: MockedNative;
} => {
  let mod!: typeof import("../PushModule");
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require("../PushModule");
    native = require("../NativeSFMCPushModule").default;
  });
  return { PushModule: mod.PushModule, Native: native };
};

describe("PushModule", () => {
  describe("requestSdk", () => {
    it("calls requestPushSdk on first invocation", async () => {
      const { PushModule, Native } = loadModule();
      await PushModule.requestSdk();
      expect(Native.requestPushSdk).toHaveBeenCalledTimes(1);
    });

    it("caches the api on subsequent calls", async () => {
      const { PushModule, Native } = loadModule();
      const a = await PushModule.requestSdk();
      const b = await PushModule.requestSdk();
      expect(a).toBe(b);
      expect(Native.requestPushSdk).toHaveBeenCalledTimes(1);
    });

    it("exposes the four wrapper methods", async () => {
      const { PushModule } = loadModule();
      const api = await PushModule.requestSdk();
      expect(typeof api.enablePush).toBe("function");
      expect(typeof api.disablePush).toBe("function");
      expect(typeof api.getPushToken).toBe("function");
      expect(typeof api.isPushEnabled).toBe("function");
    });
  });

  describe("api delegation", () => {
    it("routes enablePush to the enable native call only", async () => {
      const { PushModule, Native } = loadModule();
      const api = await PushModule.requestSdk();
      api.enablePush();
      expect(Native.enablePush).toHaveBeenCalledTimes(1);
      expect(Native.disablePush).not.toHaveBeenCalled();
    });

    it("routes disablePush to the disable native call only", async () => {
      const { PushModule, Native } = loadModule();
      const api = await PushModule.requestSdk();
      api.disablePush();
      expect(Native.disablePush).toHaveBeenCalledTimes(1);
      expect(Native.enablePush).not.toHaveBeenCalled();
    });

    it("returns the token from getPushToken", async () => {
      const { PushModule, Native } = loadModule();
      Native.getPushToken.mockResolvedValue("tok-123");
      const api = await PushModule.requestSdk();
      await expect(api.getPushToken()).resolves.toBe("tok-123");
    });

    it("returns true from isPushEnabled via the native call", async () => {
      const { PushModule, Native } = loadModule();
      Native.isPushEnabled.mockResolvedValue(true);
      const api = await PushModule.requestSdk();
      await expect(api.isPushEnabled()).resolves.toBe(true);
      expect(Native.isPushEnabled).toHaveBeenCalledTimes(1);
    });

    it("returns false from isPushEnabled via the native call", async () => {
      const { PushModule, Native } = loadModule();
      Native.isPushEnabled.mockResolvedValue(false);
      const api = await PushModule.requestSdk();
      await expect(api.isPushEnabled()).resolves.toBe(false);
      expect(Native.isPushEnabled).toHaveBeenCalledTimes(1);
    });
  });

  describe("cache resilience", () => {
    it("propagates rejections from requestPushSdk without caching", async () => {
      const { PushModule, Native } = loadModule();
      Native.requestPushSdk.mockRejectedValueOnce(new Error("nope"));
      await expect(PushModule.requestSdk()).rejects.toThrow("nope");
      Native.requestPushSdk.mockResolvedValue(undefined);
      await PushModule.requestSdk();
      expect(Native.requestPushSdk).toHaveBeenCalledTimes(2);
    });
  });

  describe("getEmitter", () => {
    it("returns an event emitter bound to the native module", () => {
      const { PushModule, Native } = loadModule();
      const emitter = PushModule.getEmitter() as unknown as {
        nativeModule: unknown;
        addListener: unknown;
      };
      expect(typeof emitter.addListener).toBe("function");
      expect(emitter.nativeModule).toBe(Native);
    });

    it("caches the emitter", () => {
      const { PushModule } = loadModule();
      expect(PushModule.getEmitter()).toBe(PushModule.getEmitter());
    });
  });
});
