/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

import type { CustomEvent } from "../events";

jest.mock("../NativeSFMCSdkCoreModule", () => ({
  __esModule: true,
  default: {
    requestSfmcSdk: jest.fn().mockResolvedValue(undefined),
    setProfileId: jest.fn(),
    setAttribute: jest.fn(),
    clearAttribute: jest.fn(),
    setAttributes: jest.fn(),
    getAttributes: jest.fn(),
    clearAllAttributes: jest.fn(),
    getProfileId: jest.fn(),
    getPartyIdentificationName: jest.fn(),
    setPartyIdentificationName: jest.fn(),
    getPartyIdentificationNumber: jest.fn(),
    setPartyIdentificationNumber: jest.fn(),
    getPartyIdentificationType: jest.fn(),
    setPartyIdentificationType: jest.fn(),
    track: jest.fn(),
    setLogging: jest.fn(),
    getSdkState: jest.fn(),
    sendImmediate: jest.fn(),
    flush: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

type MockedNative = { [key: string]: jest.Mock };

const loadModule = (): {
  SFMCSdkModule: typeof import("../SFMCSdkModule").SFMCSdkModule;
  Native: MockedNative;
} => {
  let mod!: typeof import("../SFMCSdkModule");
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require("../SFMCSdkModule");
    native = require("../NativeSFMCSdkCoreModule").default;
  });
  return { SFMCSdkModule: mod.SFMCSdkModule, Native: native };
};

describe("SFMCSdkModule", () => {
  describe("requestSdk", () => {
    it("awaits requestSfmcSdk on first call", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      await SFMCSdkModule.requestSdk();
      expect(Native.requestSfmcSdk).toHaveBeenCalledTimes(1);
    });

    it("caches the api and does not re-request the SDK", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const a = await SFMCSdkModule.requestSdk();
      const b = await SFMCSdkModule.requestSdk();
      expect(a).toBe(b);
      expect(Native.requestSfmcSdk).toHaveBeenCalledTimes(1);
    });

    it("exposes the full wrapper api", async () => {
      const { SFMCSdkModule } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      const methods = [
        "setProfileId",
        "setAttribute",
        "clearAttribute",
        "setAttributes",
        "getAttributes",
        "clearAllAttributes",
        "getProfileId",
        "getPartyIdentificationName",
        "setPartyIdentificationName",
        "getPartyIdentificationNumber",
        "setPartyIdentificationNumber",
        "getPartyIdentificationType",
        "setPartyIdentificationType",
        "track",
        "setLogging",
        "getSdkState",
        "sendImmediate",
        "flush",
      ] as const;
      for (const m of methods) {
        expect(typeof (api as unknown as Record<string, unknown>)[m]).toBe(
          "function",
        );
      }
    });
  });

  describe("identity delegation", () => {
    it("forwards setProfileId with the given id", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      api.setProfileId("user-42");
      expect(Native.setProfileId).toHaveBeenCalledWith("user-42");
    });

    it("forwards setAttribute with the given key/value", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      api.setAttribute("city", "SF");
      expect(Native.setAttribute).toHaveBeenCalledWith("city", "SF");
    });

    it("forwards clearAttribute and setAttributes", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      api.clearAttribute("city");
      api.setAttributes({ a: "1", b: "2" });
      expect(Native.clearAttribute).toHaveBeenCalledWith("city");
      expect(Native.setAttributes).toHaveBeenCalledWith({ a: "1", b: "2" });
    });

    it("returns the native attributes map from getAttributes", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.getAttributes.mockResolvedValue({ x: "1" });
      const api = await SFMCSdkModule.requestSdk();
      await expect(api.getAttributes()).resolves.toEqual({ x: "1" });
    });

    it("returns null from getAttributes when native returns null", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.getAttributes.mockResolvedValue(null);
      const api = await SFMCSdkModule.requestSdk();
      await expect(api.getAttributes()).resolves.toBeNull();
    });

    it("forwards clearAllAttributes and getProfileId", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.getProfileId.mockResolvedValue("pid");
      const api = await SFMCSdkModule.requestSdk();
      api.clearAllAttributes();
      await expect(api.getProfileId()).resolves.toBe("pid");
      expect(Native.clearAllAttributes).toHaveBeenCalledTimes(1);
    });
  });

  describe("party identification delegation", () => {
    it("forwards the six party identification methods", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.getPartyIdentificationName.mockResolvedValue("Alice");
      Native.getPartyIdentificationNumber.mockResolvedValue("555");
      Native.getPartyIdentificationType.mockResolvedValue("phone");
      const api = await SFMCSdkModule.requestSdk();

      await expect(api.getPartyIdentificationName()).resolves.toBe("Alice");
      api.setPartyIdentificationName("Bob");
      await expect(api.getPartyIdentificationNumber()).resolves.toBe("555");
      api.setPartyIdentificationNumber("999");
      await expect(api.getPartyIdentificationType()).resolves.toBe("phone");
      api.setPartyIdentificationType("email");

      expect(Native.setPartyIdentificationName).toHaveBeenCalledWith("Bob");
      expect(Native.setPartyIdentificationNumber).toHaveBeenCalledWith("999");
      expect(Native.setPartyIdentificationType).toHaveBeenCalledWith("email");
    });
  });

  describe("events and telemetry", () => {
    it("forwards track with the event payload", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      const evt: CustomEvent = { objType: "CustomEvent", name: "click" };
      api.track(evt);
      expect(Native.track).toHaveBeenCalledWith(evt);
    });

    it("forwards sendImmediate with the event payload", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      const evt: CustomEvent = { objType: "CustomEvent", name: "purchase" };
      api.sendImmediate(evt);
      expect(Native.sendImmediate).toHaveBeenCalledWith(evt);
    });

    it("forwards setLogging with each valid level", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      const levels = ["DEBUG", "WARN", "ERROR", "NONE"] as const;
      for (const l of levels) api.setLogging(l);
      expect(Native.setLogging.mock.calls.map((c) => c[0])).toEqual([
        "DEBUG",
        "WARN",
        "ERROR",
        "NONE",
      ]);
    });

    it("returns the native SDK state map", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.getSdkState.mockResolvedValue({ ready: true });
      const api = await SFMCSdkModule.requestSdk();
      await expect(api.getSdkState()).resolves.toEqual({ ready: true });
    });

    it("forwards flush", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      const api = await SFMCSdkModule.requestSdk();
      api.flush();
      expect(Native.flush).toHaveBeenCalledTimes(1);
    });
  });

  describe("getEmitter", () => {
    it("returns an event emitter bound to the native module", () => {
      const { SFMCSdkModule, Native } = loadModule();
      const emitter = SFMCSdkModule.getEmitter() as unknown as {
        nativeModule: unknown;
        addListener: unknown;
      };
      expect(typeof emitter.addListener).toBe("function");
      expect(emitter.nativeModule).toBe(Native);
    });

    it("caches the emitter", () => {
      const { SFMCSdkModule } = loadModule();
      expect(SFMCSdkModule.getEmitter()).toBe(SFMCSdkModule.getEmitter());
    });
  });

  describe("surface stability", () => {
    it("propagates rejections from requestSfmcSdk without caching", async () => {
      const { SFMCSdkModule, Native } = loadModule();
      Native.requestSfmcSdk.mockRejectedValueOnce(new Error("nope"));
      await expect(SFMCSdkModule.requestSdk()).rejects.toThrow("nope");
      Native.requestSfmcSdk.mockResolvedValue(undefined);
      await SFMCSdkModule.requestSdk();
      expect(Native.requestSfmcSdk).toHaveBeenCalledTimes(2);
    });
  });
});
