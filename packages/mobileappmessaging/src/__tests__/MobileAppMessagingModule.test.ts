/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

export {};

jest.mock("../NativeMAMModule", () => ({
  __esModule: true,
  default: {
    requestMamSdk: jest.fn().mockResolvedValue(undefined),
    getDeviceId: jest.fn(),
    enableAnalytics: jest.fn(),
    disableAnalytics: jest.fn(),
    isAnalyticsEnabled: jest.fn(),
    setRegistrationCallback: jest.fn(),
    unsetRegistrationCallback: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

type MockedNative = {
  requestMamSdk: jest.Mock;
  getDeviceId: jest.Mock;
  enableAnalytics: jest.Mock;
  disableAnalytics: jest.Mock;
  isAnalyticsEnabled: jest.Mock;
  setRegistrationCallback: jest.Mock;
  unsetRegistrationCallback: jest.Mock;
};

const loadModule = (): {
  MobileAppMessagingModule: typeof import("../MobileAppMessagingModule").MobileAppMessagingModule;
  Native: MockedNative;
} => {
  let mod!: typeof import("../MobileAppMessagingModule");
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require("../MobileAppMessagingModule");
    native = require("../NativeMAMModule").default;
  });
  return {
    MobileAppMessagingModule: mod.MobileAppMessagingModule,
    Native: native,
  };
};

describe("MobileAppMessagingModule", () => {
  describe("requestSdk", () => {
    it("calls requestMamSdk on first invocation", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      await MobileAppMessagingModule.requestSdk();
      expect(Native.requestMamSdk).toHaveBeenCalledTimes(1);
    });

    it("caches the api on subsequent calls", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const a = await MobileAppMessagingModule.requestSdk();
      const b = await MobileAppMessagingModule.requestSdk();
      expect(a).toBe(b);
      expect(Native.requestMamSdk).toHaveBeenCalledTimes(1);
    });
  });

  describe("api delegation", () => {
    it("returns the device id from getDeviceId", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      Native.getDeviceId.mockResolvedValue("device-xyz");
      const api = await MobileAppMessagingModule.requestSdk();
      await expect(api.getDeviceId()).resolves.toBe("device-xyz");
    });

    it("routes enableAnalytics to the enable native call only", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const api = await MobileAppMessagingModule.requestSdk();
      api.enableAnalytics();
      expect(Native.enableAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.disableAnalytics).not.toHaveBeenCalled();
    });

    it("routes disableAnalytics to the disable native call only", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const api = await MobileAppMessagingModule.requestSdk();
      api.disableAnalytics();
      expect(Native.disableAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.enableAnalytics).not.toHaveBeenCalled();
    });

    it("returns true from isAnalyticsEnabled via the native call", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      Native.isAnalyticsEnabled.mockResolvedValue(true);
      const api = await MobileAppMessagingModule.requestSdk();
      await expect(api.isAnalyticsEnabled()).resolves.toBe(true);
      expect(Native.isAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });

    it("returns false from isAnalyticsEnabled via the native call", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      Native.isAnalyticsEnabled.mockResolvedValue(false);
      const api = await MobileAppMessagingModule.requestSdk();
      await expect(api.isAnalyticsEnabled()).resolves.toBe(false);
      expect(Native.isAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });

    it("routes setRegistrationCallback to the set native call only", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const api = await MobileAppMessagingModule.requestSdk();
      api.setRegistrationCallback();
      expect(Native.setRegistrationCallback).toHaveBeenCalledTimes(1);
      expect(Native.unsetRegistrationCallback).not.toHaveBeenCalled();
    });

    it("routes unsetRegistrationCallback to the unset native call only", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const api = await MobileAppMessagingModule.requestSdk();
      api.unsetRegistrationCallback();
      expect(Native.unsetRegistrationCallback).toHaveBeenCalledTimes(1);
      expect(Native.setRegistrationCallback).not.toHaveBeenCalled();
    });
  });

  describe("cache resilience", () => {
    it("propagates rejections from requestMamSdk without caching", async () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      Native.requestMamSdk.mockRejectedValueOnce(new Error("nope"));
      await expect(MobileAppMessagingModule.requestSdk()).rejects.toThrow(
        "nope",
      );
      Native.requestMamSdk.mockResolvedValue(undefined);
      await MobileAppMessagingModule.requestSdk();
      expect(Native.requestMamSdk).toHaveBeenCalledTimes(2);
    });
  });

  describe("getEmitter", () => {
    it("returns an event emitter bound to the native module", () => {
      const { MobileAppMessagingModule, Native } = loadModule();
      const emitter = MobileAppMessagingModule.getEmitter() as unknown as {
        nativeModule: unknown;
        addListener: unknown;
      };
      expect(typeof emitter.addListener).toBe("function");
      expect(emitter.nativeModule).toBe(Native);
    });

    it("caches the emitter across calls", () => {
      const { MobileAppMessagingModule } = loadModule();
      expect(MobileAppMessagingModule.getEmitter()).toBe(
        MobileAppMessagingModule.getEmitter(),
      );
    });
  });
});
